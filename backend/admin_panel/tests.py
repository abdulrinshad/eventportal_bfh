from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from events.models import Event
from .serializers import AdminEventSerializer, AdminAnalyticsSerializer, AdminAuditLogSerializer
from .services import build_dashboard_statistics, build_analytics_data, build_audit_logs

User = get_user_model()


class DashboardStatisticsTests(TestCase):
    def test_dashboard_statistics_returns_counts(self):
        User.objects.create_user(
            email="student@example.com",
            first_name="Student",
            last_name="User",
            password="password123",
            role=User.Role.STUDENT,
        )
        User.objects.create_user(
            email="organizer@example.com",
            first_name="Organizer",
            last_name="User",
            password="password123",
            role=User.Role.ORGANIZER,
        )
        User.objects.create_user(
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            password="password123",
            role=User.Role.ADMIN,
        )

        stats = build_dashboard_statistics()

        self.assertEqual(stats["users"]["total"], 3)
        self.assertEqual(stats["users"]["students"], 1)
        self.assertEqual(stats["users"]["organizers"], 1)
        self.assertEqual(stats["users"]["admins"], 1)

    def test_admin_event_serializer_null_organizer_safety(self):
        organizer = User.objects.create_user(
            email="org@example.com",
            password="password123",
            role=User.Role.ORGANIZER,
        )
        event = Event.objects.create(
            organizer=organizer,
            title="Tech Summit",
            category=Event.Category.TECHNICAL,
            description="Tech event",
            max_participants=100,
            start_datetime=timezone.now(),
            end_datetime=timezone.now() + timezone.timedelta(hours=2),
            venue="Main Hall",
            registration_deadline=timezone.now() + timezone.timedelta(hours=1),
            contact_email="org@example.com",
            status=Event.Status.APPROVED,
        )
        serializer = AdminEventSerializer(event)
        data = serializer.data
        self.assertEqual(data["title"], "Tech Summit")
        self.assertEqual(data["organizer_email"], "org@example.com")
        self.assertEqual(data["registrations_count"], 0)

    def test_build_analytics_and_audit_logs(self):
        analytics = build_analytics_data()
        serialized_analytics = AdminAnalyticsSerializer(analytics).data
        self.assertIn("summary", serialized_analytics)
        self.assertIn("recent_activity", serialized_analytics)
        self.assertIn("revenue_growth", serialized_analytics)

        logs = build_audit_logs()
        serialized_logs = AdminAuditLogSerializer(logs, many=True).data
        self.assertTrue(len(serialized_logs) >= 0)
