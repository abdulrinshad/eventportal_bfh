from django.urls import path

from .views import (
    BroadcastEmailView,
    OrganizerAnalyticsView,
    OrganizerChangePasswordView,
    OrganizerProfileView,
    OrganizerSettingsView,
    ParticipantExportView,
    ParticipantListView,
    ParticipantStatisticsView,
)

urlpatterns = [
    # ── Profile ───────────────────────────────────────────────────────────────
    path("organizer/profile/",         OrganizerProfileView.as_view(),       name="organizer-profile"),

    # ── Settings ──────────────────────────────────────────────────────────────
    path("organizer/settings/",        OrganizerSettingsView.as_view(),      name="organizer-settings"),

    # ── Change Password ───────────────────────────────────────────────────────
    path("organizer/change-password/", OrganizerChangePasswordView.as_view(), name="organizer-change-password"),

    # ── Participants ──────────────────────────────────────────────────────────
    path("organizer/participants/",             ParticipantListView.as_view(),       name="organizer-participant-list"),
    path("organizer/participants/statistics/",  ParticipantStatisticsView.as_view(), name="organizer-participant-statistics"),
    path("organizer/participants/export/",      ParticipantExportView.as_view(),     name="organizer-participant-export"),
    path("organizer/participants/broadcast/",   BroadcastEmailView.as_view(),        name="organizer-participant-broadcast"),

    # ── Analytics ─────────────────────────────────────────────────────────────
    path("organizer/analytics/",               OrganizerAnalyticsView.as_view(),    name="organizer-analytics"),
]
