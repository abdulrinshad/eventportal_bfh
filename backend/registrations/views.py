"""
registrations/views.py

Stripe Checkout + Webhook views.

Endpoints:
  POST /api/payments/webhook/   — Stripe webhook (no JWT auth, verified by signature)
"""

try:
    import stripe
except ImportError:
    stripe = None
from decimal import Decimal

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from events.models import Event
from registrations.models import Registration
from notifications.models import Notification


def _create_notification(user, notification_type, title, message, event=None):
    """Create a single Notification record."""
    Notification.objects.create(
        user=user,
        event=event,
        notification_type=notification_type,
        title=title,
        message=message,
    )


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    """
    POST /api/payments/webhook/

    Receives Stripe webhook events.
    Signature is verified using STRIPE_WEBHOOK_SECRET.
    No JWT authentication required (Stripe calls this endpoint directly).

    Handles:
      - checkout.session.completed
        → creates or updates Registration as CONFIRMED + PAID
        → sends notifications to student and organizer
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        payload    = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        # ── Verify Stripe signature ───────────────────────────────────────────
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError:
            # Invalid payload
            return Response({"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        # ── Handle checkout.session.completed ─────────────────────────────────
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            self._handle_checkout_completed(session)

        return Response({"status": "ok"}, status=status.HTTP_200_OK)

    def _handle_checkout_completed(self, session):
        """
        Process a completed Stripe Checkout Session.

        Metadata stored in the session at creation time:
          - event_id    : UUID of the Event
          - user_id     : ID of the participant (CustomUser)
        """
        metadata   = session.get("metadata", {})
        event_id   = metadata.get("event_id")
        user_id    = metadata.get("user_id")

        if not event_id or not user_id:
            # Cannot process without identifiers
            return

        # ── Load Event and User ───────────────────────────────────────────────
        try:
            portal_event = Event.objects.select_related("organizer").get(pk=event_id)
        except Event.DoesNotExist:
            return

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            participant = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return

        # ── Extract payment details ───────────────────────────────────────────
        stripe_session_id  = session.get("id", "")
        payment_intent_id  = session.get("payment_intent", "")
        amount_total       = session.get("amount_total", 0)   # in smallest currency unit (cents/paise)
        currency           = session.get("currency", "inr")
        paid_amount        = Decimal(str(amount_total)) / Decimal("100")

        # ── Create or update Registration (idempotent) ────────────────────────
        existing = Registration.objects.filter(
            event=portal_event,
            participant=participant,
        ).first()

        if existing:
            if existing.payment_status == Registration.PaymentStatus.PAID:
                # Already processed (duplicate webhook) — skip
                return
            # Update the existing pending/waitlisted record
            existing.status            = Registration.Status.CONFIRMED
            existing.payment_status    = Registration.PaymentStatus.PAID
            existing.stripe_session_id = stripe_session_id
            existing.payment_intent    = payment_intent_id
            existing.paid_amount       = paid_amount
            existing.currency          = currency
            existing.paid_at           = timezone.now()
            existing.save(update_fields=[
                "status", "payment_status", "stripe_session_id",
                "payment_intent", "paid_amount", "currency", "paid_at",
            ])
            reg = existing
        else:
            # Create new Registration
            reg = Registration.objects.create(
                event=portal_event,
                participant=participant,
                status=Registration.Status.CONFIRMED,
                payment_status=Registration.PaymentStatus.PAID,
                stripe_session_id=stripe_session_id,
                payment_intent=payment_intent_id,
                paid_amount=paid_amount,
                currency=currency,
                paid_at=timezone.now(),
            )

        # ── Send notifications ────────────────────────────────────────────────
        organizer   = portal_event.organizer
        event_title = portal_event.title

        # Notify student — registration confirmed
        _create_notification(
            user=participant,
            event=portal_event,
            notification_type=Notification.NotificationType.REGISTRATION,
            title="Registration Confirmed",
            message=f"Your registration for '{event_title}' is confirmed. Payment of {currency.upper()} {paid_amount} received.",
        )

        # Notify student — payment receipt
        _create_notification(
            user=participant,
            event=portal_event,
            notification_type=Notification.NotificationType.PAYMENT_RECEIVED,
            title="Payment Received",
            message=f"Payment of {currency.upper()} {paid_amount} for '{event_title}' has been received successfully.",
        )

        # Notify organizer — new registration
        _create_notification(
            user=organizer,
            event=portal_event,
            notification_type=Notification.NotificationType.NEW_REGISTRATION,
            title="New Registration",
            message=f"New paid registration received for '{event_title}'.",
        )

        # Notify organizer — payment received
        _create_notification(
            user=organizer,
            event=portal_event,
            notification_type=Notification.NotificationType.PAYMENT_RECEIVED,
            title="Payment Received",
            message=f"Payment of {currency.upper()} {paid_amount} received for '{event_title}' from {participant.email}.",
        )
