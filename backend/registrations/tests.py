import uuid
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
import stripe
from stripe import StripeObject

from events.models import Event
from registrations.models import Registration
from registrations.views import StripeWebhookView

User = get_user_model()


class StripeWebhookViewTestCase(TestCase):

    def setUp(self):
        self.student = User.objects.create_user(
            email="student_pay@example.com",
            password="password123",
            first_name="Alice",
            last_name="Paid",
            role=User.Role.STUDENT,
        )

        self.organizer = User.objects.create_user(
            email="organizer_pay@example.com",
            password="password123",
            first_name="Bob",
            last_name="Host",
            role=User.Role.ORGANIZER,
        )

        self.event = Event.objects.create(
            organizer=self.organizer,
            title="Paid Masterclass",
            category=Event.Category.SEMINAR,
            description="Paid seminar",
            max_participants=50,
            start_datetime=timezone.now() + timezone.timedelta(days=7),
            end_datetime=timezone.now() + timezone.timedelta(days=7, hours=2),
            venue="Hall A",
            registration_deadline=timezone.now() + timezone.timedelta(days=5),
            ticket_price=100.00,
            contact_email="organizer_pay@example.com",
            status=Event.Status.APPROVED,
        )

        self.view = StripeWebhookView()

    def test_handle_checkout_completed_with_stripe_object(self):
        """Test StripeObject metadata & attributes extraction creates CONFIRMED + PAID Registration."""
        session_data = {
            "id": "cs_test_abc123",
            "payment_intent": "pi_test_xyz789",
            "amount_total": 10000,
            "currency": "inr",
            "metadata": {
                "event_id": str(self.event.id),
                "user_id": str(self.student.id),
            },
        }

        # Construct a real StripeObject as received from stripe SDK
        session_obj = StripeObject.construct_from(session_data, None)

        # Execute handler directly
        self.view._handle_checkout_completed(session_obj)

        reg = Registration.objects.filter(event=self.event, participant=self.student).first()
        self.assertIsNotNone(reg)
        self.assertEqual(reg.status, Registration.Status.CONFIRMED)
        self.assertEqual(reg.payment_status, Registration.PaymentStatus.PAID)
        self.assertEqual(reg.stripe_session_id, "cs_test_abc123")
        self.assertEqual(reg.payment_intent, "pi_test_xyz789")
        self.assertEqual(reg.paid_amount, Decimal("100.00"))
        self.assertEqual(reg.currency, "inr")

    def test_idempotent_duplicate_webhook(self):
        """Test duplicate webhook does not create duplicate registration records."""
        session_data = {
            "id": "cs_test_abc123",
            "payment_intent": "pi_test_xyz789",
            "amount_total": 10000,
            "currency": "inr",
            "metadata": {
                "event_id": str(self.event.id),
                "user_id": str(self.student.id),
            },
        }
        session_obj = StripeObject.construct_from(session_data, None)

        self.view._handle_checkout_completed(session_obj)
        self.view._handle_checkout_completed(session_obj)

        count = Registration.objects.filter(event=self.event, participant=self.student).count()
        self.assertEqual(count, 1)

    def test_missing_metadata_logs_warning_no_crash(self):
        """Test session with missing metadata returns early without crashing."""
        session_data = {
            "id": "cs_test_empty",
            "payment_intent": "pi_test_empty",
            "amount_total": 0,
            "currency": "inr",
            "metadata": {},
        }
        session_obj = StripeObject.construct_from(session_data, None)

        self.view._handle_checkout_completed(session_obj)
        count = Registration.objects.filter(event=self.event, participant=self.student).count()
        self.assertEqual(count, 0)
