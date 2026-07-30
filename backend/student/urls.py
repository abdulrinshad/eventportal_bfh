from django.urls import path

from .views import (
    StudentDashboardView,
    StudentEventDetailView,
    StudentEventListView,
    StudentRegisterView,
    StudentRegistrationCancelView,
    StudentRegistrationListView,
    StudentRegistrationSummaryView,
    StudentProfileView,
    PublicEventListView,
    PublicEventDetailView,
    PublicStatsView,
)

from notifications.views import (
    StudentNotificationDeleteView,
    StudentNotificationListView,
    StudentNotificationMarkAllReadView,
    StudentNotificationMarkReadView,
    StudentNotificationUnreadCountView,
)

urlpatterns = [
    # Dashboard & Profile
    path(
        "student/dashboard/",
        StudentDashboardView.as_view(),
        name="student-dashboard",
    ),
    path(
        "student/profile/",
        StudentProfileView.as_view(),
        name="student-profile",
    ),

    # Student Events
    path(
        "student/events/",
        StudentEventListView.as_view(),
        name="student-event-list",
    ),
    path(
        "student/events/<uuid:pk>/",
        StudentEventDetailView.as_view(),
        name="student-event-detail",
    ),
    path(
        "student/events/<uuid:pk>/register/",
        StudentRegisterView.as_view(),
        name="student-event-register",
    ),

    # Public Events
    path(
        "public/events/",
        PublicEventListView.as_view(),
        name="public-event-list",
    ),
    path(
        "public/events/<uuid:pk>/",
        PublicEventDetailView.as_view(),
        name="public-event-detail",
    ),
    path(
        "public/stats/",
        PublicStatsView.as_view(),
        name="public-stats",
    ),

    # Registrations
    path(
        "student/registrations/",
        StudentRegistrationListView.as_view(),
        name="student-registration-list",
    ),
    path(
        "student/registrations/summary/",
        StudentRegistrationSummaryView.as_view(),
        name="student-registration-summary",
    ),
    path(
        "student/registrations/<uuid:pk>/cancel/",
        StudentRegistrationCancelView.as_view(),
        name="student-registration-cancel",
    ),

    # Notifications
    path(
        "student/notifications/",
        StudentNotificationListView.as_view(),
        name="student-notifications-list",
    ),
    path(
        "student/notifications/unread-count/",
        StudentNotificationUnreadCountView.as_view(),
        name="student-notifications-unread-count",
    ),
    path(
        "student/notifications/<uuid:pk>/read/",
        StudentNotificationMarkReadView.as_view(),
        name="student-notifications-mark-read",
    ),
    path(
        "student/notifications/mark-all-read/",
        StudentNotificationMarkAllReadView.as_view(),
        name="student-notifications-mark-all-read",
    ),
    path(
        "student/notifications/<uuid:pk>/",
        StudentNotificationDeleteView.as_view(),
        name="student-notifications-delete",
    ),
]