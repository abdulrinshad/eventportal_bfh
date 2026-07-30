from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from registrations.models import Registration

from .models import OrganizerProfile, OrganizerSettings
from .permissions import IsOrganizerUser
from .serializers import (
    BroadcastEmailSerializer,
    OrganizerChangePasswordSerializer,
    OrganizerProfileSerializer,
    OrganizerProfileUpdateSerializer,
    OrganizerSettingsSerializer,
    ParticipantListSerializer,
    ParticipantStatisticsSerializer,
)
from .services import (
    broadcast_email_to_participants,
    export_participants_csv,
    get_or_create_profile,
    get_or_create_settings,
    get_organizer_registrations,
)


# ─────────────────────────────────────────────────────────────────────────────
# PAGE 1 & 2: Organizer Profile (GET + PUT/PATCH)
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerProfileView(APIView):
    """
    GET  /api/organizer/profile/  — Retrieve organizer public profile.
    PUT  /api/organizer/profile/  — Full update.
    PATCH /api/organizer/profile/ — Partial update.

    Accepts multipart/form-data so banner/cover images can be uploaded.
    """
    permission_classes = [IsOrganizerUser]
    parser_classes = [MultiPartParser, FormParser]

    def _get_profile(self, user):
        return get_or_create_profile(user)

    def get(self, request, *args, **kwargs):
        profile = self._get_profile(request.user)
        serializer = OrganizerProfileSerializer(profile, context={"request": request})
        return Response(
            {
                "success": True,
                "message": "Profile retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, *args, **kwargs):
        return self._update(request, partial=False)

    def patch(self, request, *args, **kwargs):
        return self._update(request, partial=True)

    def _update(self, request, partial=False):
        profile = self._get_profile(request.user)
        serializer = OrganizerProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            # Return the updated profile using the read serializer
            read_serializer = OrganizerProfileSerializer(
                profile, context={"request": request}
            )
            return Response(
                {
                    "success": True,
                    "message": "Profile updated successfully.",
                    "data": read_serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# PAGE 3: Organizer Settings (GET + PUT)
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerSettingsView(APIView):
    """
    GET /api/organizer/settings/ — Retrieve organizer preferences.
    PUT /api/organizer/settings/ — Update organizer preferences.
    """
    permission_classes = [IsOrganizerUser]

    def _get_settings(self, user):
        return get_or_create_settings(user)

    def get(self, request, *args, **kwargs):
        settings_obj = self._get_settings(request.user)
        serializer = OrganizerSettingsSerializer(settings_obj)
        return Response(
            {
                "success": True,
                "message": "Settings retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, *args, **kwargs):
        settings_obj = self._get_settings(request.user)
        serializer = OrganizerSettingsSerializer(
            settings_obj, data=request.data, partial=False
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Settings updated successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        settings_obj = self._get_settings(request.user)
        serializer = OrganizerSettingsSerializer(
            settings_obj, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Settings updated successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# Change Password
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerChangePasswordView(APIView):
    """
    POST /api/organizer/change-password/

    Body: { old_password, new_password, confirm_password }
    Restricted to organizers only.
    """
    permission_classes = [IsOrganizerUser]

    def post(self, request, *args, **kwargs):
        serializer = OrganizerChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data["new_password"])
            request.user.save()
            return Response(
                {
                    "success": True,
                    "message": "Password changed successfully.",
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# PAGE 4: Participant List
# ─────────────────────────────────────────────────────────────────────────────

class ParticipantListView(generics.ListAPIView):
    """
    GET /api/organizer/participants/

    Returns paginated registrations for the logged-in organizer's events.

    Supports:
      - Search: ?search=<name|email|event>
      - Filter: ?ticket_type=VIP  ?attendance_status=ATTENDED  ?payment_status=PAID
      - Order:  ?ordering=registration_date  ?ordering=-registration_date
    """
    serializer_class   = ParticipantListSerializer
    permission_classes = [IsOrganizerUser]
    filter_backends    = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields  = ["ticket_type", "attendance_status", "payment_status"]
    search_fields     = [
        "participant__first_name",
        "participant__last_name",
        "participant__email",
        "event__title",
    ]
    ordering_fields   = ["registration_date", "ticket_type", "attendance_status", "payment_status"]
    ordering          = ["-registration_date"]

    def get_queryset(self):
        return get_organizer_registrations(self.request.user)


# ─────────────────────────────────────────────────────────────────────────────
# Participant Statistics
# ─────────────────────────────────────────────────────────────────────────────

class ParticipantStatisticsView(APIView):
    """
    GET /api/organizer/participants/statistics/

    Returns aggregate participant stats for the logged-in organizer.
    """
    permission_classes = [IsOrganizerUser]

    def get(self, request, *args, **kwargs):
        qs = Registration.objects.filter(event__organizer=request.user)

        stats = {
            "total_registrations": qs.count(),
            "vip_attendees": qs.filter(ticket_type=Registration.TicketType.VIP).count(),
            "pending_reviews": qs.filter(payment_status=Registration.PaymentStatus.PENDING).count(),
        }

        serializer = ParticipantStatisticsSerializer(stats)
        return Response(
            {
                "success": True,
                "message": "Statistics retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Export CSV
# ─────────────────────────────────────────────────────────────────────────────

class ParticipantExportView(APIView):
    """
    GET /api/organizer/participants/export/

    Downloads all participant records for this organizer as a CSV file.
    """
    permission_classes = [IsOrganizerUser]

    def get(self, request, *args, **kwargs):
        queryset = get_organizer_registrations(request.user)
        return export_participants_csv(queryset)


# ─────────────────────────────────────────────────────────────────────────────
# Broadcast Email
# ─────────────────────────────────────────────────────────────────────────────

class BroadcastEmailView(APIView):
    """
    POST /api/organizer/participants/broadcast/

    Body: { event_id, subject, message }

    Sends the message to every participant registered for the specified event.
    Returns the number of emails successfully sent.
    """
    permission_classes = [IsOrganizerUser]

    def post(self, request, *args, **kwargs):
        serializer = BroadcastEmailSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            event = serializer.context["event"]

            subject = serializer.validated_data["subject"]
            message = serializer.validated_data["message"]

            sent_count = broadcast_email_to_participants(
                event=event,
                subject=subject,
                message=message,
                organizer=request.user,
            )

            return Response(
                {
                    "success": True,
                    "message": f"Broadcast sent. {sent_count} email(s) delivered successfully.",
                    "data": {"emails_sent": sent_count},
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# Analytics
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerAnalyticsView(APIView):
    """
    GET /api/organizer/analytics/

    Returns real analytics data for the logged-in organizer:
      - total_revenue      : sum of paid_amount for PAID registrations on organizer's events
      - total_registrations: count of non-cancelled registrations
      - registration_velocity: registrations grouped by day (last 30 days)
      - conversion_rate    : placeholder (no page-view tracking implemented)
    """
    permission_classes = [IsOrganizerUser]

    def get(self, request, *args, **kwargs):
        from django.db.models import Sum, Count, Q
        from django.db.models.functions import TruncDate
        from django.utils import timezone
        from events.models import Event
        import datetime

        user = request.user
        base_qs = Registration.objects.filter(event__organizer=user)

        # ── Total Revenue ─────────────────────────────────────────────────────
        revenue_result = base_qs.filter(
            status=Registration.Status.CONFIRMED,
            payment_status=Registration.PaymentStatus.PAID,
            paid_amount__isnull=False,
        ).aggregate(total=Sum("paid_amount"))
        total_revenue = float(revenue_result["total"] or 0)

        # ── Total Registrations (confirmed only) ───────────────────────────────
        total_registrations = base_qs.filter(
            status=Registration.Status.CONFIRMED
        ).count()

        # ── Registration Velocity (last 30 days, grouped by day) ──────────────
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        velocity_qs = (
            base_qs.filter(
                status=Registration.Status.CONFIRMED,
                registration_date__gte=thirty_days_ago
            )
            .annotate(day=TruncDate("registration_date"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        registration_velocity = [
            {"date": str(row["day"]), "count": row["count"]}
            for row in velocity_qs
        ]

        # ── Top 5 Events by Registration Count ───────────────────────────────
        top_events_qs = (
            Event.objects.filter(organizer=user)
            .annotate(
                registration_count=Count(
                    "registrations",
                    filter=Q(registrations__status=Registration.Status.CONFIRMED),
                ),
                revenue=Sum(
                    "registrations__paid_amount",
                    filter=Q(registrations__status=Registration.Status.CONFIRMED) & Q(registrations__payment_status=Registration.PaymentStatus.PAID),
                ),
            )
            .order_by("-registration_count")[:5]
        )
        top_events = [
            {
                "event_id":           str(ev.id),
                "title":              ev.title,
                "registration_count": ev.registration_count,
                "revenue":            float(ev.revenue or 0),
            }
            for ev in top_events_qs
        ]

        return Response(
            {
                "success": True,
                "message": "Analytics retrieved successfully.",
                "data": {
                    "total_revenue":         total_revenue,
                    "total_registrations":   total_registrations,
                    "registration_velocity": registration_velocity,
                    "top_events":            top_events,
                    "conversion_rate":       None,  # No page-view tracking yet
                },
            },
            status=status.HTTP_200_OK,
        )


