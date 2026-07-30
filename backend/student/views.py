"""
Student-facing API views.

All views:
- Require authentication (JWT Bearer token).
- Require user.role == STUDENT (via IsStudentUser permission).
- Only return APPROVED events.
- Never expose internal/admin fields.
- Use select_related / prefetch_related / annotate to avoid N+1 queries.
"""

from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone
from rest_framework import filters, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from events.models import Event
from registrations.models import Registration

from .permissions import IsStudentUser
from .serializers import (
    DashboardRecentActivitySerializer,
    DashboardUpcomingRegistrationSerializer,
    DashboardRecommendedEventSerializer,
    RegistrationSummarySerializer,
    StudentDashboardSerializer,
    StudentEventDetailSerializer,
    StudentEventListSerializer,
    StudentRegistrationListSerializer,
    StudentProfileSerializer,
)

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _success(data, message="Success", status_code=status.HTTP_200_OK):
    return Response(
        {"success": True, "message": message, "data": data},
        status=status_code,
    )


def _error(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    payload = {"success": False, "message": message}
    if errors:
        payload["errors"] = errors
    return Response(payload, status=status_code)


def _approved_events_qs(user=None):
    """
    Base queryset: all APPROVED events only.
    Annotates registered_count and available_seats.
    Optionally annotates student-specific is_registered / registration_status.
    """
    qs = (
        Event.objects.filter(status=Event.Status.APPROVED)
        .select_related("organizer")
        .annotate(
            registered_count=Count(
                "registrations",
                filter=Q(registrations__status=Registration.Status.CONFIRMED),
            )
        )
    )
    return qs


def _compute_available_seats(event):
    """Return remaining seats for an event (may be negative if over-registered)."""
    registered = getattr(event, "registered_count", 0)
    return max(0, event.max_participants - registered)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Student Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class StudentDashboardView(APIView):
    """
    GET /api/student/dashboard/

    Returns live statistics and personalised content for the student dashboard.
    """
    permission_classes = [IsStudentUser]

    def get(self, request):
        user = request.user
        now  = timezone.now()

        # ── Stats ─────────────────────────────────────────────────────────────

        # Total approved events available right now
        available_events_count = Event.objects.filter(
            status=Event.Status.APPROVED
        ).count()

        # Student's own non-cancelled registrations
        my_registrations_qs = Registration.objects.filter(
            participant=user,
        ).exclude(status=Registration.Status.CANCELLED)

        registered_events_count = my_registrations_qs.count()

        # Events attended = registrations where event has passed and attendance is ATTENDED
        events_attended_count = Registration.objects.filter(
            participant=user,
            attendance_status=Registration.AttendanceStatus.ATTENDED,
        ).count()

        # ── Upcoming Registrations ─────────────────────────────────────────────
        # Non-cancelled registrations for future events, ordered by event date
        upcoming_registrations_qs = (
            Registration.objects.filter(
                participant=user,
                event__start_datetime__gte=now,
                event__status=Event.Status.APPROVED,
            )
            .exclude(status=Registration.Status.CANCELLED)
            .select_related("event", "event__organizer")
            .order_by("event__start_datetime")[:5]
        )

        upcoming_registrations_data = DashboardUpcomingRegistrationSerializer(
            upcoming_registrations_qs, many=True, context={"request": request}
        ).data

        # ── Recommended Event ──────────────────────────────────────────────────
        # Pick the soonest upcoming approved event that the student hasn't registered for
        registered_event_ids = Registration.objects.filter(
            participant=user,
        ).exclude(
            status=Registration.Status.CANCELLED
        ).values_list("event_id", flat=True)

        recommended_event = (
            Event.objects.filter(
                status=Event.Status.APPROVED,
                start_datetime__gte=now,
                registration_deadline__gte=now,
            )
            .exclude(id__in=registered_event_ids)
            .select_related("organizer")
            .order_by("start_datetime")
            .first()
        )

        recommended_event_data = (
            DashboardRecommendedEventSerializer(
                recommended_event, context={"request": request}
            ).data
            if recommended_event
            else None
        )

        # ── Recent Activity ────────────────────────────────────────────────────
        # Last 5 registration actions (most recent first)
        recent_registrations = (
            Registration.objects.filter(participant=user)
            .select_related("event")
            .order_by("-registration_date")[:5]
        )

        recent_activity = []
        for reg in recent_registrations:
            if reg.status == Registration.Status.CONFIRMED:
                text = f'You registered for "{reg.event.title}"'
            elif reg.status == Registration.Status.WAITLISTED:
                text = f'You joined the waitlist for "{reg.event.title}"'
            elif reg.status == Registration.Status.CANCELLED:
                text = f'You cancelled your registration for "{reg.event.title}"'
            else:
                text = f'Registration update for "{reg.event.title}"'

            recent_activity.append({
                "text": text,
                "date": reg.registration_date,
                "type": "registration",
            })

        # ── Organizer Status ───────────────────────────────────────────────────
        organizer_status_map = {
            "NOT_APPLIED": "Not Applied",
            "PENDING":     "Pending Review",
            "APPROVED":    "Approved",
            "REJECTED":    "Rejected",
        }
        organizer_status = organizer_status_map.get(
            getattr(user, "organizer_status", "NOT_APPLIED"), "Not Applied"
        )

        # ── Build Response ─────────────────────────────────────────────────────
        dashboard_data = {
            "registered_events":      registered_events_count,
            "available_events":       available_events_count,
            "events_attended":        events_attended_count,
            "organizer_status":       organizer_status,
            "recommended_event":      recommended_event_data,
            "upcoming_registrations": upcoming_registrations_data,
            "recent_activity":        recent_activity,
        }

        serializer = StudentDashboardSerializer(
            dashboard_data, context={"request": request}
        )
        return _success(serializer.data, "Dashboard data retrieved successfully.")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Explore Events — List
# ─────────────────────────────────────────────────────────────────────────────

class StudentEventListView(generics.ListAPIView):
    """
    GET /api/student/events/

    Returns paginated list of APPROVED events only.
    Supports:
      ?search=<term>          — searches title, description, venue, tags
      ?category=<CATEGORY>    — filter by event category (exact match)
      ?price_type=Free|Paid   — filter free (price=0) or paid events
      ?ordering=upcoming|newest|oldest|price_asc|price_desc
      ?page=<N>               — page number (default PAGE_SIZE=10)
    """
    permission_classes = [IsStudentUser]
    serializer_class   = StudentEventListSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ["title", "description", "venue"]
    ordering_fields = ["start_datetime", "created_at", "ticket_price"]
    ordering        = ["start_datetime"]

    def get_queryset(self):
        now = timezone.now()
        qs = _approved_events_qs(self.request.user)

        # Add available_seats annotation for each event
        # available_seats = max_participants - confirmed registered count
        from django.db.models import ExpressionWrapper, F, IntegerField
        qs = qs.annotate(
            available_seats=ExpressionWrapper(
                F("max_participants") - Count(
                    "registrations",
                    filter=Q(registrations__status=Registration.Status.CONFIRMED),
                    distinct=True,
                ),
                output_field=IntegerField(),
            )
        )

        # ── Category filter ────────────────────────────────────────────────────
        category = self.request.query_params.get("category")
        if category and category.upper() != "ALL":
            qs = qs.filter(category=category.upper())

        # ── Price type filter ──────────────────────────────────────────────────
        price_type = self.request.query_params.get("price_type")
        if price_type == "Free":
            qs = qs.filter(ticket_price=0)
        elif price_type == "Paid":
            qs = qs.exclude(ticket_price=0)

        # ── Ordering ───────────────────────────────────────────────────────────
        ordering = self.request.query_params.get("ordering")
        ordering_map = {
            "upcoming":   "start_datetime",
            "newest":     "-created_at",
            "oldest":     "created_at",
            "price_asc":  "ticket_price",
            "price_desc": "-ticket_price",
        }
        if ordering and ordering in ordering_map:
            qs = qs.order_by(ordering_map[ordering])

        return qs

    def list(self, request, *args, **kwargs):
        queryset   = self.filter_queryset(self.get_queryset())
        page       = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(
                page, many=True, context={"request": request}
            )
            paginated  = self.get_paginated_response(serializer.data)
            return Response(
                {
                    "success": True,
                    "message": "Events retrieved successfully.",
                    "count":   self.paginator.page.paginator.count,
                    "next":    paginated.data.get("next"),
                    "previous": paginated.data.get("previous"),
                    "data":    serializer.data,
                },
                status=status.HTTP_200_OK,
            )

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


# ─────────────────────────────────────────────────────────────────────────────
# 3. Event Detail
# ─────────────────────────────────────────────────────────────────────────────

class StudentEventDetailView(APIView):
    """
    GET /api/student/events/<uuid>/

    Returns full approved event details.
    Includes computed registration_button_state for the student.
    """
    permission_classes = [IsStudentUser]

    def get(self, request, pk):
        from django.db.models import ExpressionWrapper, F, IntegerField

        try:
            event = (
                Event.objects.filter(
                    pk=pk,
                    status=Event.Status.APPROVED,
                )
                .select_related("organizer")
                .annotate(
                    registered_count=Count(
                        "registrations",
                        filter=Q(registrations__status=Registration.Status.CONFIRMED),
                        distinct=True,
                    ),
                    available_seats=ExpressionWrapper(
                        F("max_participants") - Count(
                            "registrations",
                            filter=Q(registrations__status=Registration.Status.CONFIRMED),
                            distinct=True,
                        ),
                        output_field=IntegerField(),
                    ),
                )
                .get()
            )
        except Event.DoesNotExist:
            return _error("Event not found.", status_code=status.HTTP_404_NOT_FOUND)

        # Attach student-specific registration for button state computation
        try:
            student_reg = Registration.objects.get(
                event=event,
                participant=request.user,
            )
            event._student_registration = student_reg
        except Registration.DoesNotExist:
            event._student_registration = None

        serializer = StudentEventDetailSerializer(
            event, context={"request": request}
        )
        return _success(serializer.data, "Event details retrieved successfully.")


# ─────────────────────────────────────────────────────────────────────────────
# 4. Register for Event
# ─────────────────────────────────────────────────────────────────────────────

class StudentRegisterView(APIView):
    """
    POST /api/student/events/<uuid>/register/

    Register the authenticated student for an approved event.

    Validation:
      - Event must be APPROVED
      - Registration deadline must not have passed
      - Student must not already be registered (non-cancelled)
      - Seats must be available OR waitlist must be enabled
    """
    permission_classes = [IsStudentUser]

    def post(self, request, pk):
        import stripe
        from django.conf import settings as django_settings
        from django.db.models import Count, Q

        # ── Fetch event ────────────────────────────────────────────────────────
        try:
            event = (
                Event.objects.filter(pk=pk)
                .annotate(
                    registered_count=Count(
                        "registrations",
                        filter=Q(registrations__status=Registration.Status.CONFIRMED),
                    )
                )
                .get()
            )
        except Event.DoesNotExist:
            return _error("Event not found.", status_code=status.HTTP_404_NOT_FOUND)

        now = timezone.now()

        # ── Validation ─────────────────────────────────────────────────────────

        if event.status != Event.Status.APPROVED:
            return _error(
                "Registration is only allowed for approved events.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        if now > event.registration_deadline:
            return _error(
                "Registration deadline has passed. You can no longer register for this event.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Duplicate check — check for ANY non-cancelled registration
        existing_reg = Registration.objects.filter(
            event=event,
            participant=request.user,
        ).first()

        if existing_reg:
            if existing_reg.status == Registration.Status.CONFIRMED:
                # Already confirmed and paid → reject
                if existing_reg.payment_status == Registration.PaymentStatus.PAID:
                    return _error(
                        "You are already registered for this event.",
                        {"registration_id": str(existing_reg.id)},
                        status_code=status.HTTP_409_CONFLICT,
                    )
                # Confirmed but not paid (free event) → reject
                return _error(
                    "You are already registered for this event.",
                    {"registration_id": str(existing_reg.id)},
                    status_code=status.HTTP_409_CONFLICT,
                )
            if existing_reg.status == Registration.Status.WAITLISTED:
                return _error(
                    "You are already on the waitlist for this event.",
                    {"registration_id": str(existing_reg.id)},
                    status_code=status.HTTP_409_CONFLICT,
                )
            # Previously CANCELLED — allow re-registration by deleting old record
            existing_reg.delete()

        # Seats check
        available_seats = event.max_participants - event.registered_count

        if available_seats <= 0 and not event.enable_waitlist:
            return _error(
                "This event is full and does not have a waitlist.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # ── Determine if event is paid ─────────────────────────────────────────
        is_paid_event = bool(
            event.is_paid and event.price and event.price > 0
        )

        # ── PAID EVENT: Create Stripe Checkout Session ─────────────────────────
        if is_paid_event:
            stripe.api_key = django_settings.STRIPE_SECRET_KEY

            price_in_paise = int(event.price * 100)  # Stripe uses smallest unit

            frontend_base = "http://localhost:5173"
            success_url = (
                f"{frontend_base}/registration-success"
                f"?session_id={{CHECKOUT_SESSION_ID}}&event_id={event.id}"
            )
            cancel_url = f"{frontend_base}/events/{event.id}"

            try:
                session = stripe.checkout.Session.create(
                    payment_method_types=["card"],
                    line_items=[
                        {
                            "price_data": {
                                "currency": "inr",
                                "product_data": {
                                    "name": event.title,
                                    "description": (
                                        event.description[:200]
                                        if event.description
                                        else "Event ticket"
                                    ),
                                },
                                "unit_amount": price_in_paise,
                            },
                            "quantity": 1,
                        }
                    ],
                    mode="payment",
                    success_url=success_url,
                    cancel_url=cancel_url,
                    metadata={
                        "event_id": str(event.id),
                        "user_id": str(request.user.id),
                        "student_id": str(request.user.id),
                        "registration_type": "GENERAL",
                        "price": str(event.price),
                    },
                    customer_email=request.user.email,
                )
            except stripe.error.StripeError as exc:
                return _error(
                    f"Payment initiation failed: {str(exc)}",
                    status_code=status.HTTP_502_BAD_GATEWAY,
                )

            return Response(
                {
                    "success": True,
                    "message": "Stripe Checkout session created.",
                    "checkout_url": session.url,
                },
                status=status.HTTP_200_OK,
            )

        # ── FREE EVENT: Instant registration (existing flow) ───────────────────
        if available_seats <= 0:
            # Waitlist (only reachable when enable_waitlist=True)
            reg = Registration.objects.create(
                event=event,
                participant=request.user,
                status=Registration.Status.WAITLISTED,
                payment_status=Registration.PaymentStatus.PENDING,
            )
            return _success(
                {"registration_id": str(reg.id), "status": reg.status},
                "You have been added to the waitlist for this event.",
                status_code=status.HTTP_201_CREATED,
            )

        # Normal free registration
        reg = Registration.objects.create(
            event=event,
            participant=request.user,
            status=Registration.Status.CONFIRMED,
            payment_status=Registration.PaymentStatus.PAID,
        )
        return _success(
            {"registration_id": str(reg.id), "status": reg.status},
            "Successfully registered for the event!",
            status_code=status.HTTP_201_CREATED,
        )




# ─────────────────────────────────────────────────────────────────────────────
# 5. My Registrations — List
# ─────────────────────────────────────────────────────────────────────────────

class StudentRegistrationListView(generics.ListAPIView):
    """
    GET /api/student/registrations/

    Returns the authenticated student's registrations (all statuses).
    Supports ?search=<term> — searches event title and venue.
    Ordered by most recent registration first.
    """
    permission_classes = [IsStudentUser]
    serializer_class   = StudentRegistrationListSerializer

    filter_backends = [filters.SearchFilter]
    search_fields   = ["event__title", "event__venue"]

    def get_queryset(self):
        return (
            Registration.objects.filter(participant=self.request.user)
            .select_related("event", "event__organizer")
            .order_by("-registration_date")
        )

    def list(self, request, *args, **kwargs):
        queryset   = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(
            queryset, many=True, context={"request": request}
        )
        return Response(
            {
                "success": True,
                "message": "Registrations retrieved successfully.",
                "count":   queryset.count(),
                "data":    serializer.data,
            },
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 6. Registration Summary
# ─────────────────────────────────────────────────────────────────────────────

class StudentRegistrationSummaryView(APIView):
    """
    GET /api/student/registrations/summary/

    Returns count of confirmed, waitlisted, and cancelled registrations.
    """
    permission_classes = [IsStudentUser]

    def get(self, request):
        user = request.user

        confirmed  = Registration.objects.filter(
            participant=user, status=Registration.Status.CONFIRMED
        ).count()
        waitlisted = Registration.objects.filter(
            participant=user, status=Registration.Status.WAITLISTED
        ).count()
        cancelled  = Registration.objects.filter(
            participant=user, status=Registration.Status.CANCELLED
        ).count()

        data = {
            "confirmed":  confirmed,
            "waitlisted": waitlisted,
            "cancelled":  cancelled,
        }
        serializer = RegistrationSummarySerializer(data)
        return _success(serializer.data, "Registration summary retrieved successfully.")


# ─────────────────────────────────────────────────────────────────────────────
# 7. Cancel Registration
# ─────────────────────────────────────────────────────────────────────────────

class StudentRegistrationCancelView(APIView):
    """
    DELETE /api/student/registrations/<uuid>/cancel/

    Cancel a student's registration. Sets status to CANCELLED.
    The registration record is kept for audit history.

    Validation:
      - Student must own the registration.
      - Registration must not already be CANCELLED.
    """
    permission_classes = [IsStudentUser]

    def delete(self, request, pk):
        try:
            reg = Registration.objects.select_related("event").get(
                pk=pk, participant=request.user
            )
        except Registration.DoesNotExist:
            return _error(
                "Registration not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if reg.status == Registration.Status.CANCELLED:
            return _error(
                "This registration has already been cancelled.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        reg.status = Registration.Status.CANCELLED
        reg.save(update_fields=["status"])

        return _success(
            {"registration_id": str(reg.id), "status": reg.status},
            f'Registration for "{reg.event.title}" has been cancelled.',
        )


# ─────────────────────────────────────────────────────────────────────────────
# Student Profile View
# ─────────────────────────────────────────────────────────────────────────────

class StudentProfileView(APIView):
    """
    GET   /api/student/profile/
    PUT   /api/student/profile/
    PATCH /api/student/profile/

    Allows authenticated students to view and update their profile details.
    Only allows editing: first_name, last_name, phone_number, bio, profile_image, cover_image.
    """
    permission_classes = [IsStudentUser]

    def get(self, request):
        serializer = StudentProfileSerializer(request.user, context={"request": request})
        return _success(serializer.data, "Profile fetched successfully.")

    def _update_profile(self, request, partial=True):
        user = request.user
        serializer = StudentProfileSerializer(
            user,
            data=request.data,
            partial=partial,
            context={"request": request}
        )

        if not serializer.is_valid():
            return _error("Validation Failed", serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        # Handle uploaded image files if sent via multipart/form-data
        if request.FILES:
            if "profile_image" in request.FILES:
                user.profile_image = request.FILES["profile_image"]
            if "cover_image" in request.FILES:
                user.cover_image = request.FILES["cover_image"]

        serializer.save()
        return _success(serializer.data, "Profile updated successfully.")

    def put(self, request):
        return self._update_profile(request, partial=True)

    def patch(self, request):
        return self._update_profile(request, partial=True)


# ─────────────────────────────────────────────────────────────────────────────
# 8. Public Events — List & Detail (No Auth Required)
# ─────────────────────────────────────────────────────────────────────────────

class PublicEventListView(generics.ListAPIView):
    """
    GET /api/public/events/

    Returns paginated list of APPROVED events for unauthenticated/public users.
    """
    permission_classes = [AllowAny]
    serializer_class   = StudentEventListSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ["title", "description", "venue"]
    ordering_fields = ["start_datetime", "created_at", "ticket_price"]
    ordering        = ["start_datetime"]

    def get_queryset(self):
        qs = _approved_events_qs()

        # Add available_seats annotation
        from django.db.models import ExpressionWrapper, F, IntegerField
        qs = qs.annotate(
            available_seats=ExpressionWrapper(
                F("max_participants") - Count(
                    "registrations",
                    filter=Q(registrations__status=Registration.Status.CONFIRMED),
                    distinct=True,
                ),
                output_field=IntegerField(),
            )
        )

        # Category filter
        category = self.request.query_params.get("category")
        if category and category.upper() != "ALL":
            qs = qs.filter(category=category.upper())

        # Price type filter
        price_type = self.request.query_params.get("price_type")
        if price_type == "Free":
            qs = qs.filter(ticket_price=0)
        elif price_type == "Paid":
            qs = qs.exclude(ticket_price=0)

        # Ordering
        ordering = self.request.query_params.get("ordering")
        ordering_map = {
            "upcoming":   "start_datetime",
            "newest":     "-created_at",
            "oldest":     "created_at",
            "price_asc":  "ticket_price",
            "price_desc": "-ticket_price",
        }
        if ordering and ordering in ordering_map:
            qs = qs.order_by(ordering_map[ordering])

        return qs

    def list(self, request, *args, **kwargs):
        queryset   = self.filter_queryset(self.get_queryset())
        page       = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(
                page, many=True, context={"request": request}
            )
            paginated  = self.get_paginated_response(serializer.data)
            return Response(
                {
                    "success": True,
                    "message": "Events retrieved successfully.",
                    "count":   self.paginator.page.paginator.count,
                    "next":    paginated.data.get("next"),
                    "previous": paginated.data.get("previous"),
                    "data":    serializer.data,
                },
                status=status.HTTP_200_OK,
            )

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


class PublicEventDetailView(APIView):
    """
    GET /api/public/events/<uuid>/

    Returns event details without student specific registration button state.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        from django.db.models import ExpressionWrapper, F, IntegerField

        try:
            event = (
                Event.objects.filter(
                    pk=pk,
                    status=Event.Status.APPROVED,
                )
                .select_related("organizer")
                .annotate(
                    registered_count=Count(
                        "registrations",
                        filter=~Q(registrations__status=Registration.Status.CANCELLED),
                        distinct=True,
                    ),
                    available_seats=ExpressionWrapper(
                        F("max_participants") - Count(
                            "registrations",
                            filter=~Q(registrations__status=Registration.Status.CANCELLED),
                            distinct=True,
                        ),
                        output_field=IntegerField(),
                    ),
                )
                .get()
            )
        except Event.DoesNotExist:
            return _error("Event not found.", status_code=status.HTTP_404_NOT_FOUND)

        # Set empty/None student registration since we are in public view
        event._student_registration = None

        serializer = StudentEventDetailSerializer(
            event, context={"request": request}
        )
        return _success(serializer.data, "Event details retrieved successfully.")


class PublicStatsView(APIView):
    """
    GET /api/public/stats/

    Returns global platform metrics: Total Events, Total Registrations, Active Organizers, Participants.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        total_events = Event.objects.filter(status=Event.Status.APPROVED).count()
        total_registrations = Registration.objects.exclude(status=Registration.Status.CANCELLED).count()
        active_organizers = User.objects.filter(role=User.Role.ORGANIZER, is_active=True).count()
        participants = User.objects.filter(role=User.Role.STUDENT, is_active=True).count()

        data = {
            "total_events": total_events,
            "total_registrations": total_registrations,
            "active_organizers": active_organizers,
            "participants": participants,
        }
        return _success(data, "Platform statistics retrieved successfully.")

