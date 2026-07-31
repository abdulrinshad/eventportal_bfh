from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from events.models import Event
from registrations.models import Registration

User = get_user_model()


class StudentDashboardAPITests(APITestCase):
    def setUp(self):
        # Create student user
        self.student = User.objects.create_user(
            email="student@example.com",
            password="Password123!",
            first_name="John",
            last_name="Doe",
            role=User.Role.STUDENT,
            organizer_status=User.OrganizerStatus.NOT_APPLIED,
        )

        # Create organizer user
        self.organizer = User.objects.create_user(
            email="organizer@example.com",
            password="Password123!",
            first_name="Jane",
            last_name="Smith",
            role=User.Role.ORGANIZER,
            organizer_status=User.OrganizerStatus.APPROVED,
        )

    def test_student_dashboard_unauthenticated(self):
        """Unauthenticated requests should return 401 Unauthorized."""
        response = self.client.get("/api/student/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_dashboard_empty_data(self):
        """Authenticated student with no data receives zero counts and null/empty fields."""
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/student/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        res_data = response.json()
        self.assertTrue(res_data["success"])
        self.assertEqual(res_data["message"], "Dashboard loaded successfully.")

        data = res_data["data"]
        self.assertEqual(data["student_name"], "John")
        self.assertEqual(data["registered_events"], 0)
        self.assertEqual(data["available_events"], 0)
        self.assertEqual(data["completed_events"], 0)
        self.assertIsNone(data["recommended_event"])
        self.assertEqual(data["upcoming_registrations"], [])
        self.assertEqual(data["activity_history"], [])
        self.assertEqual(data["organizer_status"], "NOT_APPLIED")

    def test_student_dashboard_with_approved_and_registered_events(self):
        """Verify dynamic statistics, recommendations, registered events, and activities."""
        self.client.force_authenticate(user=self.student)
        now = timezone.now()

        # Approved available event
        event_available = Event.objects.create(
            organizer=self.organizer,
            title="Tech Summit 2026",
            category=Event.Category.TECHNICAL,
            description="A great tech summit",
            max_participants=100,
            start_datetime=now + timedelta(days=5),
            end_datetime=now + timedelta(days=5, hours=3),
            venue="Main Auditorium",
            registration_deadline=now + timedelta(days=4),
            contact_email="tech@example.com",
            ticket_price=0.00,
            status=Event.Status.APPROVED,
        )

        # Approved event that student registered for
        event_registered = Event.objects.create(
            organizer=self.organizer,
            title="Code Hackathon",
            category=Event.Category.TECHNICAL,
            description="Coding competition",
            max_participants=50,
            start_datetime=now + timedelta(days=10),
            end_datetime=now + timedelta(days=10, hours=5),
            venue="Lab 1",
            registration_deadline=now + timedelta(days=9),
            contact_email="hack@example.com",
            ticket_price=25.00,
            is_paid=True,
            status=Event.Status.APPROVED,
        )

        reg = Registration.objects.create(
            event=event_registered,
            participant=self.student,
            status=Registration.Status.CONFIRMED,
        )

        # Draft event (should be ignored)
        Event.objects.create(
            organizer=self.organizer,
            title="Draft Secret Event",
            category=Event.Category.OTHER,
            description="Not published yet",
            max_participants=10,
            start_datetime=now + timedelta(days=2),
            end_datetime=now + timedelta(days=2, hours=2),
            venue="Secret Room",
            registration_deadline=now + timedelta(days=1),
            contact_email="draft@example.com",
            status=Event.Status.DRAFT,
        )

        response = self.client.get("/api/student/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()["data"]
        self.assertEqual(data["registered_events"], 1)
        self.assertEqual(data["available_events"], 2)  # both APPROVED events with future deadline

        # Recommended event should be the open event student hasn't registered for
        rec = data["recommended_event"]
        self.assertIsNotNone(rec)
        self.assertEqual(rec["title"], "Tech Summit 2026")
        self.assertEqual(rec["category"], "TECHNICAL")
        self.assertEqual(rec["venue"], "Main Auditorium")
        self.assertEqual(rec["organizer_name"], "Jane Smith")
        self.assertEqual(rec["available_seats"], 100)
        self.assertTrue(rec["is_free"])

        # Upcoming registrations
        up = data["upcoming_registrations"]
        self.assertEqual(len(up), 1)
        self.assertEqual(up[0]["event_title"], "Code Hackathon")
        self.assertEqual(up[0]["status"], "CONFIRMED")

        # Activity history
        act = data["activity_history"]
        self.assertGreaterEqual(len(act), 1)
        self.assertIn("Code Hackathon", act[0]["text"])

    def test_student_dashboard_completed_events_and_organizer_status(self):
        """Verify completed_events count and organizer_status field."""
        self.student.organizer_status = User.OrganizerStatus.PENDING
        self.student.save()
        self.client.force_authenticate(user=self.student)
        now = timezone.now()

        past_event = Event.objects.create(
            organizer=self.organizer,
            title="Past Workshop",
            category=Event.Category.WORKSHOP,
            description="Past event",
            max_participants=20,
            start_datetime=now - timedelta(days=10),
            end_datetime=now - timedelta(days=10, hours=-2),
            venue="Room 101",
            registration_deadline=now - timedelta(days=12),
            contact_email="past@example.com",
            status=Event.Status.COMPLETED,
        )

        Registration.objects.create(
            event=past_event,
            participant=self.student,
            status=Registration.Status.CONFIRMED,
            attendance_status=Registration.AttendanceStatus.ATTENDED,
        )

        response = self.client.get("/api/student/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()["data"]
        self.assertEqual(data["completed_events"], 1)
        self.assertEqual(data["organizer_status"], "PENDING")
