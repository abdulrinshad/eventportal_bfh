import os

from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Event
from .permissions import IsOrganizerUser
from .serializers import (
    EventCreateSerializer,
    EventDetailSerializer,
    OrganizerEventListSerializer,
    PendingEventListSerializer,
    RejectedEventListSerializer,
)

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Permission / role helpers
# ─────────────────────────────────────────────────────────────────────────────

def _is_admin(user):
    """Return True for users with ADMIN role or Django staff flag."""
    return user.role == User.Role.ADMIN or user.is_staff


# ─────────────────────────────────────────────────────────────────────────────
# 1. List + Create  (GET /api/events/  |  POST /api/events/)
# ─────────────────────────────────────────────────────────────────────────────

class EventCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/  — Return all events owned by the authenticated organizer.
    POST /api/events/  — Create a new event (multipart/form-data).

    Supports:
      - ?search=<term>      full-text search on title and description
      - ?status=<STATUS>    filter by exact status value
      - ?ordering=<field>   order by created_at, start_datetime, title
    """
    permission_classes = [IsOrganizerUser]
    parser_classes     = [MultiPartParser, FormParser]

    # Search / filter / ordering
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "category", "visibility"]
    search_fields    = ["title", "description", "venue"]
    ordering_fields  = ["created_at", "start_datetime", "title", "ticket_price"]
    ordering         = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return OrganizerEventListSerializer
        return EventCreateSerializer

    def get_queryset(self):
        user = self.request.user
        if _is_admin(user):
            return Event.objects.select_related("organizer").all()
        return Event.objects.select_related("organizer").filter(organizer=user)

    def list(self, request, *args, **kwargs):
        queryset   = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(
            queryset, many=True, context={"request": request}
        )
        return Response(
            {
                "success": True,
                "message": "Events retrieved successfully.",
                "count":   queryset.count(),
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "success": True,
                "message": "Event created successfully.",
                "data":    serializer.data,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 2. Event Detail / Edit / Delete
# ─────────────────────────────────────────────────────────────────────────────

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/events/<uuid>/  — Retrieve full event data (populate Edit form).
    PUT    /api/events/<uuid>/  — Full update.
    PATCH  /api/events/<uuid>/  — Partial update.
    DELETE /api/events/<uuid>/  — Hard delete event + banner file from disk.

    Permissions:
      - Event owner (organizer) or admin only.

    REJECTED → PENDING auto-transition:
      - On any PUT/PATCH: if event.status == REJECTED, automatically set
        status=PENDING and clear rejection_reason + rejected_date.
    """
    serializer_class   = EventDetailSerializer
    permission_classes = [IsOrganizerUser]
    parser_classes     = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if _is_admin(user):
            return Event.objects.select_related("organizer").all()
        return Event.objects.select_related("organizer").filter(organizer=user)

    def get_object(self):
        obj  = super().get_object()
        user = self.request.user
        if not _is_admin(user) and obj.organizer != user:
            raise PermissionDenied("You do not have permission to access this event.")
        return obj

    # ── GET ───────────────────────────────────────────────────────────────────

    def retrieve(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = self.get_serializer(instance, context={"request": request})
        return Response(
            {
                "success": True,
                "message": "Event retrieved successfully.",
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ── PUT / PATCH ───────────────────────────────────────────────────────────

    def update(self, request, *args, **kwargs):
        partial    = kwargs.pop("partial", False)
        instance   = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "success": True,
                "message": "Event updated successfully.",
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def perform_update(self, serializer):
        instance = serializer.instance

        # Auto-transition: REJECTED → PENDING on any organizer edit (Bug 9 fix)
        extra = {}
        if instance.status == Event.Status.REJECTED:
            extra = {
                "status":           Event.Status.PENDING,
                "rejection_reason": None,
                "rejected_date":    None,
            }

        # Replace banner on disk if a new file is uploaded
        new_banner = serializer.validated_data.get("banner")
        if new_banner and instance.banner and instance.banner.name:
            old_path = instance.banner.path
            if os.path.isfile(old_path):
                try:
                    os.remove(old_path)
                except OSError:
                    pass  # Non-fatal: log in production

        serializer.save(**extra)

    # ── DELETE ────────────────────────────────────────────────────────────────

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Remove banner file from disk if present
        if instance.banner and instance.banner.name:
            banner_path = instance.banner.path
            if os.path.isfile(banner_path):
                try:
                    os.remove(banner_path)
                except OSError:
                    pass

        instance.delete()
        return Response(
            {"success": True, "message": "Event deleted successfully."},
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 3. Pending Approval List
# ─────────────────────────────────────────────────────────────────────────────

class PendingEventListView(generics.ListAPIView):
    """
    GET /api/events/pending/

    Returns the logged-in organizer's PENDING events.
    Supports search and ordering.
    """
    serializer_class   = PendingEventListSerializer
    permission_classes = [IsOrganizerUser]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ["title", "description", "venue"]
    ordering_fields = ["created_at", "start_datetime", "title"]
    ordering        = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        if _is_admin(user):
            return Event.objects.select_related("organizer").filter(
                status=Event.Status.PENDING
            )
        return Event.objects.select_related("organizer").filter(
            organizer=user,
            status=Event.Status.PENDING,
        )

    def list(self, request, *args, **kwargs):
        queryset   = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(
            queryset, many=True, context={"request": request}
        )
        return Response(
            {
                "success": True,
                "message": "Pending events retrieved successfully.",
                "count":   queryset.count(),
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 4. Rejected Events List
# ─────────────────────────────────────────────────────────────────────────────

class RejectedEventListView(generics.ListAPIView):
    """
    GET /api/events/rejected/

    Returns the logged-in organizer's REJECTED events.
    """
    serializer_class   = RejectedEventListSerializer
    permission_classes = [IsOrganizerUser]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ["title", "venue"]
    ordering_fields = ["rejected_date", "created_at", "title"]
    ordering        = ["-rejected_date"]

    def get_queryset(self):
        user = self.request.user
        if _is_admin(user):
            return Event.objects.select_related("organizer").filter(
                status=Event.Status.REJECTED
            )
        return Event.objects.select_related("organizer").filter(
            organizer=user,
            status=Event.Status.REJECTED,
        )

    def list(self, request, *args, **kwargs):
        queryset   = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(
            queryset, many=True, context={"request": request}
        )
        return Response(
            {
                "success": True,
                "message": "Rejected events retrieved successfully.",
                "count":   queryset.count(),
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 5. Edit & Resubmit  (PUT/PATCH /api/events/<uuid>/resubmit/)
# ─────────────────────────────────────────────────────────────────────────────

class EventEditResubmitView(generics.UpdateAPIView):
    """
    PUT   /api/events/<uuid>/resubmit/
    PATCH /api/events/<uuid>/resubmit/

    Explicit resubmit endpoint: moves a REJECTED event back to PENDING and
    clears the rejection_reason. Only works on events the organizer owns.

    Note: PATCH /api/events/<uuid>/ also performs this transition automatically.
    This endpoint is kept for explicit frontend use on the Rejected Events page.
    """
    serializer_class   = EventDetailSerializer
    permission_classes = [IsOrganizerUser]
    parser_classes     = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Event.objects.select_related("organizer").filter(
            organizer=self.request.user,
            status=Event.Status.REJECTED,
        )

    def get_object(self):
        obj = super().get_object()
        if obj.organizer != self.request.user and not _is_admin(self.request.user):
            raise PermissionDenied("You do not have permission to resubmit this event.")
        return obj

    def perform_update(self, serializer):
        serializer.save(
            status=Event.Status.PENDING,
            rejection_reason=None,
            rejected_date=None,
        )

    def update(self, request, *args, **kwargs):
        partial    = kwargs.get("partial", False)
        instance   = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {
                "success": True,
                "message": "Event resubmitted successfully. It is now pending admin review.",
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )
