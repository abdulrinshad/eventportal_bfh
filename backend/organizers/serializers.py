import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import OrganizerProfile, OrganizerSettings
from registrations.models import Registration

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

PHONE_REGEX = re.compile(r"^\+?[0-9\s\-\(\)]{7,20}$")


def validate_phone(value):
    if value and not PHONE_REGEX.match(value):
        raise serializers.ValidationError(
            "Enter a valid phone number (7–20 digits, may include +, -, spaces, parentheses)."
        )
    return value


# ─────────────────────────────────────────────────────────────────────────────
# 1. Organizer Profile — GET
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerProfileSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the Organizer Profile page.
    Merges fields from CustomUser + OrganizerProfile and adds computed stats.
    """

    # From CustomUser
    email        = serializers.EmailField(source="user.email", read_only=True)
    profile_image = serializers.ImageField(source="user.profile_image", read_only=True)
    phone_number  = serializers.CharField(source="user.phone_number", read_only=True)

    # Computed stats
    total_events_hosted = serializers.SerializerMethodField()
    total_passes_issued = serializers.SerializerMethodField()

    class Meta:
        model  = OrganizerProfile
        fields = [
            "profile_image",
            "cover_image",
            "display_name",
            "title",
            "city",
            "country",
            "email",
            "phone_number",
            "biography",
            "website",
            "linkedin",
            "instagram",
            "twitter",
            "accomplishments",
            "experience",
            "total_events_hosted",
            "total_passes_issued",
        ]
        read_only_fields = fields

    def get_total_events_hosted(self, obj):
        return obj.user.events.count()

    def get_total_passes_issued(self, obj):
        return Registration.objects.filter(event__organizer=obj.user).count()


# ─────────────────────────────────────────────────────────────────────────────
# 2. Organizer Profile — PUT / PATCH
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerProfileUpdateSerializer(serializers.Serializer):
    """
    Write serializer for the Edit Profile page.
    Updates both CustomUser fields and OrganizerProfile fields.
    Supports multipart/form-data for image uploads.
    """

    # ── CustomUser fields ────────────────────────────────────────────────────
    email        = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    # ── OrganizerProfile fields ──────────────────────────────────────────────
    cover_image  = serializers.ImageField(required=False, allow_null=True)
    display_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    title        = serializers.CharField(required=False, allow_blank=True, max_length=100)
    city         = serializers.CharField(required=False, allow_blank=True, max_length=100)
    country      = serializers.CharField(required=False, allow_blank=True, max_length=100)
    biography    = serializers.CharField(required=False, allow_blank=True)
    website      = serializers.URLField(required=False, allow_blank=True)
    linkedin     = serializers.URLField(required=False, allow_blank=True)
    instagram    = serializers.URLField(required=False, allow_blank=True)
    twitter      = serializers.URLField(required=False, allow_blank=True)
    accomplishments = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )
    experience = serializers.ListField(
        child=serializers.CharField(), required=False, allow_empty=True
    )

    def validate_email(self, value):
        user = self.context["request"].user
        normalized = value.lower().strip()
        if User.objects.exclude(pk=user.pk).filter(email=normalized).exists():
            raise serializers.ValidationError("This email address is already in use.")
        return normalized

    def validate_phone_number(self, value):
        return validate_phone(value)

    def update(self, instance, validated_data):
        """
        instance = OrganizerProfile
        Updates CustomUser fields first, then OrganizerProfile fields.
        """
        user = instance.user

        # ── Update CustomUser fields ─────────────────────────────────────────
        user_fields = ("email", "phone_number", "profile_image")
        for field in user_fields:
            if field in validated_data:
                setattr(user, field, validated_data.pop(field))
        user.save()

        # ── Update OrganizerProfile fields ───────────────────────────────────
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


# ─────────────────────────────────────────────────────────────────────────────
# 3. Organizer Settings
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerSettingsSerializer(serializers.ModelSerializer):
    """
    GET + PUT serializer for organizer notification/privacy preferences.
    """

    class Meta:
        model  = OrganizerSettings
        fields = [
            "receive_daily_digest",
            "desktop_notifications",
            "public_profile",
            "enable_2fa",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


# ─────────────────────────────────────────────────────────────────────────────
# 4. Change Password
# ─────────────────────────────────────────────────────────────────────────────

class OrganizerChangePasswordSerializer(serializers.Serializer):
    old_password     = serializers.CharField(required=True, write_only=True)
    new_password     = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        user            = self.context["request"].user
        old_password    = data.get("old_password")
        new_password    = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not user.check_password(old_password):
            raise serializers.ValidationError(
                {"old_password": "Old password is incorrect."}
            )
        if new_password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "New passwords do not match."}
            )
        if new_password == old_password:
            raise serializers.ValidationError(
                {"new_password": "New password cannot be the same as the old password."}
            )
        try:
            validate_password(new_password, user=user)
        except Exception as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)})

        return data


# ─────────────────────────────────────────────────────────────────────────────
# 5. Participant List
# ─────────────────────────────────────────────────────────────────────────────

class ParticipantListSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the Participants page.
    Flattens participant user info and event title into one response.
    """
    participant_name  = serializers.SerializerMethodField()
    participant_email = serializers.EmailField(source="participant.email", read_only=True)
    participant_phone = serializers.CharField(source="participant.phone_number", read_only=True)
    event_name        = serializers.CharField(source="event.title", read_only=True)

    class Meta:
        model  = Registration
        fields = [
            "id",
            "participant_name",
            "participant_email",
            "participant_phone",
            "event_name",
            "ticket_type",
            "registration_date",
            "attendance_status",
            "payment_status",
        ]
        read_only_fields = fields

    def get_participant_name(self, obj):
        return obj.participant.get_full_name() or obj.participant.email


# ─────────────────────────────────────────────────────────────────────────────
# 6. Participant Statistics
# ─────────────────────────────────────────────────────────────────────────────

class ParticipantStatisticsSerializer(serializers.Serializer):
    total_registrations = serializers.IntegerField()
    vip_attendees       = serializers.IntegerField()
    pending_reviews     = serializers.IntegerField()


# ─────────────────────────────────────────────────────────────────────────────
# 7. Broadcast Email
# ─────────────────────────────────────────────────────────────────────────────

class BroadcastEmailSerializer(serializers.Serializer):
    event_id = serializers.UUIDField(required=True)
    subject  = serializers.CharField(required=True, max_length=255)
    message  = serializers.CharField(required=True)

    def validate_event_id(self, value):
        from events.models import Event

        user = self.context["request"].user
        try:
            event = Event.objects.get(pk=value, organizer=user)
        except Event.DoesNotExist:
            raise serializers.ValidationError(
                "Event not found or you do not have permission to broadcast to its participants."
            )
        self.context["event"] = event
        return value
