from django.urls import path

from .views import (
    EventCreateView,
    EventDetailView,
    EventEditResubmitView,
    PendingEventListView,
    RejectedEventListView,
)

urlpatterns = [
    # Create Event (Save Draft / Publish)
    path("events/",                              EventCreateView.as_view(),       name="event-create"),

    # Edit Event — GET (populate form) / PUT / PATCH / DELETE
    path("events/<uuid:pk>/",                    EventDetailView.as_view(),       name="event-detail"),

    # Pending Approval list
    path("events/pending/",                      PendingEventListView.as_view(),  name="event-pending-list"),

    # Rejected Events list
    path("events/rejected/",                     RejectedEventListView.as_view(), name="event-rejected-list"),

    # Edit & Resubmit — legacy endpoint (REJECTED → PENDING)
    path("events/<uuid:pk>/resubmit/",           EventEditResubmitView.as_view(), name="event-resubmit"),
]
