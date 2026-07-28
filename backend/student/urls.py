from django.urls import path

from .views import (
    StudentDashboardView,
    StudentEventDetailView,
    StudentEventListView,
    StudentRegisterView,
    StudentRegistrationCancelView,
    StudentRegistrationListView,
    StudentRegistrationSummaryView,
)

urlpatterns = [
    # Dashboard
    path("student/dashboard/",                          StudentDashboardView.as_view(),           name="student-dashboard"),

    # Events (APPROVED only)
    path("student/events/",                             StudentEventListView.as_view(),            name="student-event-list"),
    path("student/events/<uuid:pk>/",                   StudentEventDetailView.as_view(),          name="student-event-detail"),
    path("student/events/<uuid:pk>/register/",          StudentRegisterView.as_view(),             name="student-event-register"),

    # My Registrations
    path("student/registrations/",                      StudentRegistrationListView.as_view(),     name="student-registration-list"),
    path("student/registrations/summary/",              StudentRegistrationSummaryView.as_view(),  name="student-registration-summary"),
    path("student/registrations/<uuid:pk>/cancel/",     StudentRegistrationCancelView.as_view(),   name="student-registration-cancel"),
]
