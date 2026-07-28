"""
Student-facing serializers.

Rules:
- Never expose: rejection_reason, rejected_date, admin notes, internal IDs of related
  objects beyond what is needed, audit logs, or sensitive fields.
- Always return absolute banner URLs via SerializerMethodField.
- Organizer info is nested: {id, name, organization}.
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from events.models import Event
from registrations.models import Registration

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Helper: build absolute URL for an ImageField
# ─────────────────────────────────────────────────────────────────────────────

def _absolute_url(image_field, request):
    """Return absolute URL for an image field, or None if empty."""
    if not image_field:
        return None
    if request:
        return request.build_absolute_uri(image_field.url)
    return image_field.url


# ─────────────────────────────────────────────────────────────────────────────
# 1. Nested Organizer Info
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerNestedSerializer(serializers.ModelSerializer):
    """
    Minimal organizer info exposed to students.
    Never exposes internal fields or sensitive data.
    """
    name = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "organization"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.email.split("@")[0]

    def get_organization(self, obj):
        # Use email domain as organization indicator if no explicit org field
        return obj.email.split("@")[-1] if obj.email else ""


# ─────────────────────────────────────────────────────────────────────────────
# 2. Explore Events — List Card Serializer
# ─────────────────────────────────────────────────────────────────────────────

class StudentEventListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for GET /api/student/events/ (Explore Events cards).
    Returns only fields needed for event cards.
    """
    banner_url     = serializers.SerializerMethodField()
    organizer      = OrganizerNestedSerializer(read_only=True)
    available_seats = serializers.IntegerField(read_only=True)   # annotated in view
    registered_count = serializers.IntegerField(read_only=True)  # annotated in view
    is_free        = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "banner_url",
            "title",
            "category",
            "organizer",
            "venue",
            "start_datetime",
            "end_datetime",
            "registration_deadline",
            "ticket_price",
            "is_paid",
            "price",
            "is_free",
            "max_participants",
            "available_seats",
            "registered_count",
            "enable_waitlist",
            "visibility",
            "tags",
        ]
        read_only_fields = fields

    def get_banner_url(self, obj):
        return _absolute_url(obj.banner, self.context.get("request"))

    def get_is_free(self, obj):
        # Prefer new is_paid field; fall back to ticket_price for old events
        if hasattr(obj, 'is_paid') and obj.is_paid is not None:
            return not obj.is_paid
        return obj.ticket_price == 0


# ─────────────────────────────────────────────────────────────────────────────
# 3. Event Detail — Full Serializer
# ─────────────────────────────────────────────────────────────────────────────

class StudentEventDetailSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for GET /api/student/events/<uuid>/ (Event Details page).
    Includes all public-facing fields.
    Excludes: rejection_reason, rejected_date, admin-only fields.
    """
    banner_url           = serializers.SerializerMethodField()
    organizer            = OrganizerNestedSerializer(read_only=True)
    available_seats      = serializers.IntegerField(read_only=True)
    registered_count     = serializers.IntegerField(read_only=True)
    registration_button_state = serializers.SerializerMethodField()
    is_free              = serializers.SerializerMethodField()
    deadline_passed      = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            # Identity
            "id",
            # Core
            "banner_url",
            "title",
            "category",
            "description",
            "organizer",
            # Scheduling
            "venue",
            "start_datetime",
            "end_datetime",
            "registration_deadline",
            "deadline_passed",
            # Capacity
            "max_participants",
            "available_seats",
            "registered_count",
            "enable_waitlist",
            # Pricing
            "ticket_price",
            "is_paid",
            "price",
            "is_free",
            # Contact
            "contact_email",
            "contact_phone",
            # Additional
            "website",
            "social_links",
            "tags",
            "visibility",
            # Registration
            "registration_button_state",
        ]
        read_only_fields = fields

    def get_banner_url(self, obj):
        return _absolute_url(obj.banner, self.context.get("request"))

    def get_is_free(self, obj):
        # Prefer new is_paid field; fall back to ticket_price for old events
        if hasattr(obj, 'is_paid') and obj.is_paid is not None:
            return not obj.is_paid
        return obj.ticket_price == 0

    def get_deadline_passed(self, obj):
        return timezone.now() > obj.registration_deadline

    def get_registration_button_state(self, obj):
        """
        Determine the correct registration button state for the student.

        States:
          REGISTER_NOW       — eligible to register
          ALREADY_REGISTERED — student has an active registration
          WAITLISTED         — student is on the waitlist
          REGISTRATION_CLOSED — deadline has passed
          EVENT_FULL         — no seats and waitlist disabled
        """
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return "REGISTER_NOW"

        now = timezone.now()

        # Check if student already has a registration
        existing = getattr(obj, "_student_registration", None)
        if existing is not None:
            if existing.status == Registration.Status.CONFIRMED:
                return "ALREADY_REGISTERED"
            if existing.status == Registration.Status.WAITLISTED:
                return "WAITLISTED"
            # CANCELLED — they can re-register if eligible

        # Deadline check
        if now > obj.registration_deadline:
            return "REGISTRATION_CLOSED"

        # Seats check — available_seats is annotated
        available_seats = getattr(obj, "available_seats", 0)
        if available_seats <= 0:
            if obj.enable_waitlist:
                return "REGISTER_NOW"   # will go to waitlist
            return "EVENT_FULL"

        return "REGISTER_NOW"


# ─────────────────────────────────────────────────────────────────────────────
# 4. My Registrations — List Card Serializer
# ─────────────────────────────────────────────────────────────────────────────

class RegistrationEventSerializer(serializers.ModelSerializer):
    """Minimal event info nested inside a registration card."""
    banner_url = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "banner_url",
            "title",
            "venue",
            "start_datetime",
            "end_datetime",
            "category",
            "ticket_price",
        ]

    def get_banner_url(self, obj):
        return _absolute_url(obj.banner, self.context.get("request"))


class StudentRegistrationListSerializer(serializers.ModelSerializer):
    """
    Serializer for GET /api/student/registrations/ (My Registrations page).
    Each registration shows event info + ticket details.
    """
    event        = RegistrationEventSerializer(read_only=True)
    qr_code_url  = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "ticket_type",
            "status",
            "registration_date",
            "payment_status",
            "qr_code_url",
        ]
        read_only_fields = fields

    def get_qr_code_url(self, obj):
        return _absolute_url(obj.qr_code, self.context.get("request"))


# ─────────────────────────────────────────────────────────────────────────────
# 5. Registration Summary
# ─────────────────────────────────────────────────────────────────────────────

class RegistrationSummarySerializer(serializers.Serializer):
    """Response serializer for GET /api/student/registrations/summary/"""
    confirmed  = serializers.IntegerField()
    waitlisted = serializers.IntegerField()
    cancelled  = serializers.IntegerField()


# ─────────────────────────────────────────────────────────────────────────────
# 6. Dashboard
# ─────────────────────────────────────────────────────────────────────────────

class DashboardUpcomingRegistrationSerializer(serializers.ModelSerializer):
    """Minimal registration info for the dashboard upcoming events list."""
    event_title     = serializers.CharField(source="event.title", read_only=True)
    event_venue     = serializers.CharField(source="event.venue", read_only=True)
    event_date      = serializers.DateTimeField(source="event.start_datetime", read_only=True)
    event_id        = serializers.UUIDField(source="event.id", read_only=True)
    event_banner_url = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            "id",
            "event_id",
            "event_title",
            "event_venue",
            "event_date",
            "event_banner_url",
            "ticket_type",
            "status",
            "payment_status",
        ]
        read_only_fields = fields

    def get_event_banner_url(self, obj):
        return _absolute_url(obj.event.banner, self.context.get("request"))


class DashboardRecentActivitySerializer(serializers.Serializer):
    """Single recent activity item for the dashboard timeline."""
    text = serializers.CharField()
    date = serializers.DateTimeField()
    type = serializers.CharField()  # "registration", "event_update", "profile"


class DashboardRecommendedEventSerializer(serializers.ModelSerializer):
    """Minimal event info for the dashboard recommended event card."""
    banner_url  = serializers.SerializerMethodField()
    is_free     = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "banner_url",
            "title",
            "category",
            "venue",
            "start_datetime",
            "ticket_price",
            "is_free",
        ]

    def get_banner_url(self, obj):
        return _absolute_url(obj.banner, self.context.get("request"))

    def get_is_free(self, obj):
        return obj.ticket_price == 0


class StudentDashboardSerializer(serializers.Serializer):
    """Full dashboard response serializer."""
    registered_events     = serializers.IntegerField()
    available_events      = serializers.IntegerField()
    events_attended       = serializers.IntegerField()
    organizer_status      = serializers.CharField()
    recommended_event     = DashboardRecommendedEventSerializer(allow_null=True)
    upcoming_registrations = DashboardUpcomingRegistrationSerializer(many=True)
    recent_activity       = DashboardRecentActivitySerializer(many=True)
