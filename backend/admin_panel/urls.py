from django.urls import path

from .views import (
    AnalyticsAPIView,
    AuditLogsAPIView,
    DashboardStatsAPIView,
    EventApprovalActionAPIView,
    EventApprovalListAPIView,
    NotificationListAPIView,
    NotificationMarkReadAPIView,
    RegistrationListAPIView,
    ReportsAPIView,
    UserDetailAPIView,
    UserListAPIView,
)

urlpatterns = [
    path("admin/dashboard/", DashboardStatsAPIView.as_view(), name="admin_dashboard"),
    path("admin/users/", UserListAPIView.as_view(), name="admin_users_list"),
    path("admin/users/<uuid:pk>/", UserDetailAPIView.as_view(), name="admin_user_detail"),
    path("admin/events/", EventApprovalListAPIView.as_view(), name="admin_event_review"),
    path("admin/events/<uuid:event_id>/action/", EventApprovalActionAPIView.as_view(), name="admin_event_action"),
    path("admin/notifications/", NotificationListAPIView.as_view(), name="admin_notifications"),
    path("admin/registrations/", RegistrationListAPIView.as_view(), name="admin_registrations"),
    path("admin/notifications/<uuid:notification_id>/read/", NotificationMarkReadAPIView.as_view(), name="admin_notification_read"),
    path("admin/reports/", ReportsAPIView.as_view(), name="admin_reports"),
    path("admin/analytics/", AnalyticsAPIView.as_view(), name="admin_analytics"),
    path("admin/audit-logs/", AuditLogsAPIView.as_view(), name="admin_audit_logs"),
]
