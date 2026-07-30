from django.urls import path

from .views import (
    NotificationDetailView,
    NotificationListCreateView,
    NotificationMarkAllReadView,
)

urlpatterns = [
    # GET/POST — list or create notifications for the current user
    path("notifications/", NotificationListCreateView.as_view(), name="notification-list"),

    # POST — mark every unread notification as read
    path("notifications/mark-all-read/", NotificationMarkAllReadView.as_view(), name="notification-mark-all-read"),

    # GET/PATCH/DELETE — manage a single notification by UUID
    path("notifications/<uuid:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
]
