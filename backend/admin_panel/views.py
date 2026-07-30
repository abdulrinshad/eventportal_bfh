from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminRole
from .serializers import (
    AdminAnalyticsSerializer,
    AdminApprovalActionSerializer,
    AdminAuditLogSerializer,
    AdminEventSerializer,
    AdminNotificationSerializer,
    AdminRegistrationSerializer,
    AdminReportSerializer,
    AdminUserSerializer,
    DashboardStatsSerializer,
)
from .services import (
    approve_event,
    build_audit_logs,
    build_analytics_data,
    build_dashboard_statistics,
    build_reports_data,
    get_event_approval_queue,
    list_admin_notifications,
    list_admin_registrations,
    list_users,
    reject_event,
)
from events.models import Event
from notifications.models import Notification

User = get_user_model()


class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        data = build_dashboard_statistics()
        serializer = DashboardStatsSerializer(data)
        return Response(
            {
                "success": True,
                "message": "Dashboard statistics retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class UserListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        return list_users(
            search=self.request.query_params.get("search"),
            role=self.request.query_params.get("role"),
            organizer_status=self.request.query_params.get("organizer_status"),
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Users retrieved successfully.",
                "count": queryset.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class UserDetailAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminUserSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return User.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {
                "success": True,
                "message": "User retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "success": True,
                "message": "User updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class EventApprovalListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminEventSerializer

    def get_queryset(self):
        return get_event_approval_queue(
            status=self.request.query_params.get("status"),
            search=self.request.query_params.get("search"),
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Pending events retrieved successfully.",
                "count": queryset.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class EventApprovalActionAPIView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminApprovalActionSerializer

    def post(self, request, event_id):
        event = Event.objects.select_related("organizer").filter(id=event_id).first()
        if not event:
            return Response(
                {"success": False, "message": "Event not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["action"]
        reason = serializer.validated_data.get("reason")

        if action == "approve":
            approve_event(event, reason=reason)
            message = "Event approved successfully."
        else:
            reject_event(event, reason=reason)
            message = "Event rejected successfully."

        return Response(
            {
                "success": True,
                "message": message,
                "data": AdminEventSerializer(event).data,
            },
            status=status.HTTP_200_OK,
        )


class NotificationListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminNotificationSerializer

    def get_queryset(self):
        unread_only = self.request.query_params.get("unread_only") == "true"
        return list_admin_notifications(unread_only=unread_only)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Notifications retrieved successfully.",
                "count": queryset.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class NotificationMarkReadAPIView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, notification_id):
        notification = Notification.objects.filter(id=notification_id).first()
        if not notification:
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
                "data": {"id": str(notification.id), "is_read": notification.is_read},
            },
            status=status.HTTP_200_OK,
        )


class RegistrationListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminRegistrationSerializer

    def get_queryset(self):
        return list_admin_registrations(
            search=self.request.query_params.get("search"),
            status=self.request.query_params.get("status"),
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Registrations retrieved successfully.",
                "count": queryset.count(),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class ReportsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        payload = build_reports_data()
        serializer = AdminReportSerializer(payload)
        return Response(
            {
                "success": True,
                "message": "Reports retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class AnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        payload = build_analytics_data()
        serializer = AdminAnalyticsSerializer(payload)
        return Response(
            {
                "success": True,
                "message": "Analytics retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class AuditLogsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        payload = build_audit_logs(limit=10)
        serializer = AdminAuditLogSerializer(payload, many=True)
        return Response(
            {
                "success": True,
                "message": "Audit logs retrieved successfully.",
                "count": len(payload),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
