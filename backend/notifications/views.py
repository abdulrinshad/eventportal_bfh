"""
notifications/views.py

Endpoints:
  GET    /api/notifications/                — list notifications for the logged-in user
  POST   /api/notifications/                — create a notification for the logged-in user
  PATCH  /api/notifications/<uuid>/        — update a notification owned by the user
  DELETE /api/notifications/<uuid>/        — delete a single notification (owner only)
  POST   /api/notifications/mark-all-read/  — mark every notification as read
"""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Notification.objects
            .filter(user=self.request.user)
            .order_by("-created_at")
        )

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = NotificationSerializer(queryset, many=True, context={"request": request})
        return Response(
            {
                "success": True,
                "message": "Notifications retrieved successfully.",
                "count": queryset.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, *args, **kwargs):
        serializer = NotificationSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Validation failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        notification = serializer.save(user=request.user)
        return Response(
            {
                "success": True,
                "message": "Notification created successfully.",
                "data": NotificationSerializer(notification, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Notification.objects.get(pk=pk, user=user)
        except Notification.DoesNotExist:
            return None

    def get(self, request, pk, *args, **kwargs):
        notification = self.get_object(pk, request.user)
        if not notification:
            return Response(
                {"success": False, "message": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = NotificationSerializer(notification, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        notification = self.get_object(pk, request.user)
        if not notification:
            return Response(
                {"success": False, "message": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = NotificationSerializer(notification, data=request.data, partial=True, context={"request": request})
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Validation failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_notification = serializer.save()
        return Response(
            {
                "success": True,
                "message": "Notification updated successfully.",
                "data": NotificationSerializer(updated_notification, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk, *args, **kwargs):
        notification = self.get_object(pk, request.user)
        if not notification:
            return Response(
                {"success": False, "message": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.delete()
        return Response(
            {"success": True, "message": "Notification deleted."},
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
