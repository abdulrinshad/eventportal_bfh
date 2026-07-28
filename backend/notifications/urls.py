from django.urls import path

from .views import (
    NotificationDeleteView,
    NotificationListView,
    NotificationMarkAllReadView,
)

urlpatterns = [
    # GET  — list all notifications for the current user
    path("notifications/",                  NotificationListView.as_view(),        name="notification-list"),

    # POST — mark every unread notification as read
    path("notifications/mark-all-read/",    NotificationMarkAllReadView.as_view(), name="notification-mark-all-read"),

    # DELETE — delete a single notification by UUID
    path("notifications/<uuid:pk>/",        NotificationDeleteView.as_view(),      name="notification-delete"),
]
