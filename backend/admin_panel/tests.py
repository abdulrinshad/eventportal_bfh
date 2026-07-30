from django.contrib.auth import get_user_model
from django.test import TestCase

from .services import build_dashboard_statistics

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
