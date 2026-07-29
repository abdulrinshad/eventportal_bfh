import json
import re

from rest_framework import serializers

from .models import Event


# ─────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ─────────────────────────────────────────────────────────────────────────────

def _parse_tags(value):
    """
    Bug fix: multipart/form-data sends every field as a string.
    Tags arrive as a JSON string e.g. '["AI", "Web3"]'.
    Parse it back to a list before validating.
    Also handles the case where the client sends repeated tag fields.
    """
    if isinstance(value, list):
        return [str(t).strip() for t in value if str(t).strip()]
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return []
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return [str(t).strip() for t in parsed if str(t).strip()]
        except (json.JSONDecodeError, TypeError):
            pass
        # Single tag sent as plain string
        return [value] if value else []
    return []


def _parse_json_field(value, expected_type=dict):
    """Parse a JSON string field sent via multipart into the expected Python type."""
    if isinstance(value, expected_type):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, expected_type):
                return parsed
        except (json.JSONDecodeError, TypeError):
            pass
    return expected_type()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Detail / Edit Serializer  (GET, PUT, PATCH)
# ─────────────────────────────────────────────────────────────────────────────

class EventDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer used for:
      - GET  /api/events/<pk>/   → populate the Edit Event form
      - PUT  /api/events/<pk>/   → full update
      - PATCH /api/events/<pk>/  → partial update

    Bug fixes applied:
    1. status field previously restricted to DRAFT/PENDING — broke GET for
       APPROVED/REJECTED events. Now read-only on output, writable only for
       DRAFT and PENDING on input so organizers can't self-approve.
    2. banner returns an absolute URL using SerializerMethodField so the
       frontend receives a full http://... URL, not a relative path.
    3. tags validates and parses JSON strings sent via multipart form data.
    4. social_links likewise parses JSON strings from multipart.
    """

    # Read-only: current status shown as-is (DRAFT/PENDING/APPROVED/REJECTED/COMPLETED)
    # Write: organizer can only set DRAFT or PENDING
    status = serializers.ChoiceField(
        choices=[Event.Status.DRAFT, Event.Status.PENDING],
        required=False,
        default=Event.Status.DRAFT,
    )

    # Return full absolute URL for banner so frontend <img src> works
    banner_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            # ── Identity ─────────────────────────────────────────────────────
            "id",
            "status",
            "rejection_reason",
            "rejected_date",
            "created_at",
            "updated_at",
            # ── Core ─────────────────────────────────────────────────────────
            "banner",
            "banner_url",
            "title",
            "category",
            "description",
            "max_participants",
            "enable_waitlist",
            "visibility",
            "tags",
            # ── Scheduling ───────────────────────────────────────────────────
            "start_datetime",
            "end_datetime",
            "venue",
            "registration_deadline",
            # ── Contact ──────────────────────────────────────────────────────
            "contact_email",
            "contact_phone",
            # ── Additional ───────────────────────────────────────────────────
            "ticket_price",
            "website",
            "social_links",
            # ── Pricing ──────────────────────────────────────────────────────
            "is_paid",
            "price",
        ]
        read_only_fields = [
            "id",
            "rejection_reason",
            "rejected_date",
            "created_at",
            "updated_at",
            "banner_url",
        ]
        extra_kwargs = {
            # banner is optional for PATCH (partial update)
            "banner": {"required": False, "allow_null": True},
        }

    def get_banner_url(self, obj):
        """Return absolute URL for the banner image, or None if no banner."""
        if not obj.banner:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.banner.url)
        # Fallback: return the relative URL
        return obj.banner.url

    # ── Field-level validation ────────────────────────────────────────────────

    def validate_title(self, value):
        """Title cannot be blank or contain only whitespace."""
        if not value or not value.strip():
            raise serializers.ValidationError("Event title cannot be blank or contain only spaces.")
        return value.strip()

    def validate_venue(self, value):
        """Venue cannot be blank or contain only whitespace."""
        if not value or not value.strip():
            raise serializers.ValidationError("Venue cannot be blank or contain only spaces.")
        return value.strip()

    def validate_contact_phone(self, value):
        """Contact phone must be exactly 10 numeric digits."""
        if value:  # optional field, only validate when provided
            cleaned = value.strip()
            if not re.fullmatch(r'\d{10}', cleaned):
                raise serializers.ValidationError(
                    "Contact phone must be exactly 10 digits (numbers only, no spaces or symbols)."
                )
            return cleaned
        return value

    def validate_max_participants(self, value):
        if value < 1:
            raise serializers.ValidationError("Max participants must be greater than 0.")
        return value

    def validate_start_datetime(self, value):
        """Start date cannot be in the past."""
        from django.utils import timezone
        if value and value < timezone.now():
            raise serializers.ValidationError(
                "Event start date and time cannot be in the past."
            )
        return value

    def validate_ticket_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Ticket price cannot be negative.")
        return value

    def validate_tags(self, value):
        """Bug fix: parse JSON string from multipart, then validate as list."""
        return _parse_tags(value)

    def validate_social_links(self, value):
        """Bug fix: parse JSON string from multipart, then validate as dict."""
        return _parse_json_field(value, dict)

    # ── Object-level validation ───────────────────────────────────────────────

    def validate(self, attrs):
        # ── Pricing cross-field validation ────────────────────────────────────────
        is_paid = attrs.get("is_paid", getattr(self.instance, "is_paid", False))
        price   = attrs.get("price",   getattr(self.instance, "price",   0))

        if is_paid:
            if price is None or price <= 0:
                raise serializers.ValidationError(
                    {"price": "Paid events require a valid amount greater than 0."}
                )
        else:
            attrs["price"] = 0

        # ── Datetime cross-field validation ───────────────────────────────────────
        start    = attrs.get("start_datetime")    or getattr(self.instance, "start_datetime", None)
        end      = attrs.get("end_datetime")      or getattr(self.instance, "end_datetime", None)
        deadline = attrs.get("registration_deadline") or getattr(self.instance, "registration_deadline", None)

        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_datetime": "End date & time must be after start date & time."}
            )
        if start and deadline and deadline >= start:
            raise serializers.ValidationError(
                {"registration_deadline": "Registration deadline must be before the event start date & time."}
            )
        return attrs

    def to_representation(self, instance):
        """
        Bug fix: override status representation so GET always returns the
        actual DB value (APPROVED, REJECTED, COMPLETED) regardless of the
        ChoiceField write restriction above.
        """
        data = super().to_representation(instance)
        data["status"] = instance.status  # bypass ChoiceField restriction on reads
        return data


# ─────────────────────────────────────────────────────────────────────────────
# 2. Create Serializer  (POST /api/events/)
# ─────────────────────────────────────────────────────────────────────────────

class EventCreateSerializer(serializers.ModelSerializer):
    """
    Used for POST /api/events/ (Create Event — Save Draft / Publish).
    The organizer field is set automatically from request.user in the view.

    Bug fixes:
    - tags and social_links: parse JSON strings from multipart form data.
    - banner_url returned so frontend immediately gets the full image URL.
    """

    status = serializers.ChoiceField(
        choices=[Event.Status.DRAFT, Event.Status.PENDING],
        required=False,
        default=Event.Status.DRAFT,
    )

    banner_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "banner",
            "banner_url",
            "title",
            "category",
            "description",
            "max_participants",
            "enable_waitlist",
            "visibility",
            "tags",
            "start_datetime",
            "end_datetime",
            "venue",
            "registration_deadline",
            "contact_email",
            "contact_phone",
            "ticket_price",
            "website",
            "social_links",
            "is_paid",
            "price",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "banner_url", "created_at", "updated_at"]
        extra_kwargs = {
            "banner": {"required": False, "allow_null": True},
        }

    def get_banner_url(self, obj):
        if not obj.banner:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.banner.url)
        return obj.banner.url

    def validate_title(self, value):
        """Title cannot be blank or contain only whitespace."""
        if not value or not value.strip():
            raise serializers.ValidationError("Event title cannot be blank or contain only spaces.")
        return value.strip()

    def validate_venue(self, value):
        """Venue cannot be blank or contain only whitespace."""
        if not value or not value.strip():
            raise serializers.ValidationError("Venue cannot be blank or contain only spaces.")
        return value.strip()

    def validate_contact_phone(self, value):
        """Contact phone must be exactly 10 numeric digits."""
        if value:  # optional field, only validate when provided
            cleaned = value.strip()
            if not re.fullmatch(r'\d{10}', cleaned):
                raise serializers.ValidationError(
                    "Contact phone must be exactly 10 digits (numbers only, no spaces or symbols)."
                )
            return cleaned
        return value

    def validate_start_datetime(self, value):
        """Start date cannot be in the past."""
        from django.utils import timezone
        if value and value < timezone.now():
            raise serializers.ValidationError(
                "Event start date and time cannot be in the past."
            )
        return value

    def validate_max_participants(self, value):
        if value < 1:
            raise serializers.ValidationError("Max participants must be greater than 0.")
        return value

    def validate_ticket_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Ticket price cannot be negative.")
        return value

    def validate_tags(self, value):
        return _parse_tags(value)

    def validate_social_links(self, value):
        return _parse_json_field(value, dict)


    def validate(self, attrs):
        # ── Pricing cross-field validation ────────────────────────────────────────
        is_paid = attrs.get("is_paid", False)
        price   = attrs.get("price", 0)

        if is_paid:
            if price is None or price <= 0:
                raise serializers.ValidationError(
                    {"price": "Paid events require a valid amount greater than 0."}
                )
        else:
            attrs["price"] = 0

        # ── Datetime cross-field validation ───────────────────────────────────────
        start    = attrs.get("start_datetime")
        end      = attrs.get("end_datetime")
        deadline = attrs.get("registration_deadline")

        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_datetime": "End date & time must be after start date & time."}
            )
        if start and deadline and deadline >= start:
            raise serializers.ValidationError(
                {"registration_deadline": "Registration deadline must be before the event start date & time."}
            )
        return attrs


# ─────────────────────────────────────────────────────────────────────────────
# 3. Pending Events List Serializer
# ─────────────────────────────────────────────────────────────────────────────

class PendingEventListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the Pending Approval page.

    Bug fix: banner_url returns absolute URL (previously returned relative
    path, causing broken images on the frontend).
    """

    banner_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "banner",
            "banner_url",
            "title",
            "description",
            "venue",
            "start_datetime",
            "end_datetime",
            "created_at",
            "status",
            "is_paid",
            "price",
        ]
        read_only_fields = fields

    def get_banner_url(self, obj):
        if not obj.banner:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.banner.url)
        return obj.banner.url


# ─────────────────────────────────────────────────────────────────────────────
# 4. Rejected Events List Serializer
# ─────────────────────────────────────────────────────────────────────────────

class RejectedEventListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the Rejected Events page.

    Bug fix: banner_url returns absolute URL.
    """

    banner_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "banner",
            "banner_url",
            "title",
            "rejected_date",
            "rejection_reason",
            "venue",
            "start_datetime",
            "status",
            "is_paid",
            "price",
        ]
        read_only_fields = fields

    def get_banner_url(self, obj):
        if not obj.banner:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.banner.url)
        return obj.banner.url


# ─────────────────────────────────────────────────────────────────────────────
# 5. Organizer "My Events" List Serializer
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerEventListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for GET /api/events/ (organizer's own events, all statuses).
    Returns enough data for the My Created Events dashboard card.

    Bug fix: banner_url returns absolute URL. Includes all fields needed by
    the frontend card (venue, start_datetime, ticket_price, max_participants, tags).
    """

    banner_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "banner",
            "banner_url",
            "title",
            "category",
            "status",
            "start_datetime",
            "end_datetime",
            "venue",
            "ticket_price",
            "max_participants",
            "tags",
            "created_at",
            "is_paid",
            "price",
        ]
        read_only_fields = fields

    def get_banner_url(self, obj):
        if not obj.banner:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.banner.url)
        return obj.banner.url
