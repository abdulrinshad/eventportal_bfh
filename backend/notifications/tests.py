from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Notification


class NotificationCrudTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="admin@example.com",
            password="Pass1234!",
            first_name="Admin",
            last_name="User",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_notification_requires_title_and_message(self):
        response = self.client.post(
            reverse("notification-list"),
            {"notification_type": Notification.NotificationType.GENERAL},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data["errors"])
        self.assertIn("message", response.data["errors"])

    def test_create_and_update_notification(self):
        create_response = self.client.post(
            reverse("notification-list"),
            {
                "title": "Welcome",
                "message": "Your account is ready.",
                "notification_type": Notification.NotificationType.GENERAL,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        notification_id = create_response.data["data"]["id"]

        update_response = self.client.patch(
            reverse("notification-detail", kwargs={"pk": notification_id}),
            {"title": "Updated welcome", "message": "Your account is ready and synced."},
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["data"]["title"], "Updated welcome")

    def test_delete_notification(self):
        notification = Notification.objects.create(
            user=self.user,
            title="Remove me",
            message="This notification should be deleted.",
        )

        response = self.client.delete(reverse("notification-detail", kwargs={"pk": notification.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Notification.objects.filter(id=notification.id).exists())
