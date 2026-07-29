"""
notifications/views.py

Three endpoints:
  GET  /api/notifications/                — list all notifications for the logged-in user
  POST /api/notifications/mark-all-read/  — mark every notification as read
  DELETE /api/notifications/<uuid>/       — delete a single notification (owner only)
"""

from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(ListAPIView):
    """
    GET /api/notifications/

    Returns all notifications for the authenticated user, newest first.
    No pagination — notification lists are typically short.
    """
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Notification.objects
            .filter(user=self.request.user)
            .order_by("-created_at")
        )

    def list(self, request, *args, **kwargs):
        queryset   = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Notifications retrieved successfully.",
                "count":   queryset.count(),
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class NotificationMarkAllReadView(APIView):
    """
    POST /api/notifications/mark-all-read/

    Sets is_read=True on every unread notification belonging to the
    authenticated user. Returns the count of updated records.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        updated = (
            Notification.objects
            .filter(user=request.user, is_read=False)
            .update(is_read=True)
        )
        return Response(
            {
                "success": True,
                "message": f"{updated} notification(s) marked as read.",
                "data":    {"updated": updated},
            },
            status=status.HTTP_200_OK,
        )


class NotificationDeleteView(APIView):
    """
    DELETE /api/notifications/<uuid>/

    Deletes a single notification. Only the owning user may delete their
    own notifications — other users receive 404 (not 403, to avoid data leaks).
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"success": False, "message": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.delete()
        return Response(
            {"success": True, "message": "Notification deleted."},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Student-Specific Notification API Views
# ─────────────────────────────────────────────────────────────────────────────

from .services import generate_event_reminders_for_user
from .serializers import StudentNotificationSerializer


class StudentNotificationListView(APIView):
    """
    GET /api/student/notifications/

    Returns all notifications for the authenticated student, newest first.
    Uses select_related('event') to avoid N+1 queries.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Generate any due reminders for this student
        generate_event_reminders_for_user(request.user)

        notifications = (
            Notification.objects
            .filter(user=request.user)
            .select_related("event")
            .order_by("-created_at")
        )

        serializer = StudentNotificationSerializer(notifications, many=True)
        return Response(
            {
                "success": True,
                "message": "Notifications fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class StudentNotificationUnreadCountView(APIView):
    """
    GET /api/student/notifications/unread-count/

    Returns count of unread notifications for the authenticated student.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Generate any due reminders before counting
        generate_event_reminders_for_user(request.user)

        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response(
            {
                "success": True,
                "count": count,
            },
            status=status.HTTP_200_OK,
        )


class StudentNotificationMarkReadView(APIView):
    """
    PATCH /api/student/notifications/<uuid:pk>/read/

    Marks a single notification belonging to the student as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"success": False, "message": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            {
                "success": True,
                "message": "Notification marked as read.",
                "data": {
                    "id": str(notification.id),
                    "is_read": notification.is_read,
                },
            },
            status=status.HTTP_200_OK,
        )


class StudentNotificationMarkAllReadView(APIView):
    """
    PATCH /api/student/notifications/mark-all-read/

    Marks all unread notifications of the logged-in student as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        updated_count = (
            Notification.objects
            .filter(user=request.user, is_read=False)
            .update(is_read=True)
        )

        return Response(
            {
                "success": True,
                "message": "All notifications marked as read.",
                "count": updated_count,
            },
            status=status.HTTP_200_OK,
        )


class StudentNotificationDeleteView(APIView):
    """
    DELETE /api/student/notifications/<uuid:pk>/

    Deletes a single notification belonging to the logged-in student.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"success": False, "message": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.delete()
        return Response(
            {
                "success": True,
                "message": "Notification deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )
