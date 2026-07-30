from django.contrib.auth import get_user_model
from rest_framework import serializers

from events.models import Event
from notifications.models import Notification
from registrations.models import Registration

User = get_user_model()


class DashboardStatsSerializer(serializers.Serializer):
    users = serializers.DictField()
    events = serializers.DictField()
    registrations = serializers.DictField()
    notifications = serializers.DictField()
    revenue = serializers.DictField()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "organizer_status",
            "is_active",
            "is_staff",
            "date_joined",
            "updated_at",
        ]


class AdminEventSerializer(serializers.ModelSerializer):
    organizer_email = serializers.CharField(source="organizer.email", read_only=True)
    organizer_name = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "status",
            "category",
            "venue",
            "start_datetime",
            "end_datetime",
            "ticket_price",
            "price",
            "is_paid",
            "organizer_email",
            "organizer_name",
            "created_at",
            "rejection_reason",
        ]

    def get_organizer_name(self, obj):
        return obj.organizer.get_full_name() or obj.organizer.email


class AdminApprovalActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])
    reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "notification_type", "is_read", "created_at"]


class AdminReportSerializer(serializers.Serializer):
    summary = serializers.DictField()
    by_category = serializers.ListField()
    by_month = serializers.ListField()


class AdminAnalyticsSerializer(serializers.Serializer):
    events_by_status = serializers.DictField()
    registrations_by_status = serializers.DictField()
    user_growth = serializers.ListField()
    event_growth = serializers.ListField()


class AdminRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    participant_name = serializers.SerializerMethodField()
    participant_email = serializers.CharField(source="participant.email", read_only=True)
    amount = serializers.DecimalField(source="event.price", max_digits=10, decimal_places=2, read_only=True)
    qr_status = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            "id",
            "event_title",
            "participant_name",
            "participant_email",
            "ticket_type",
            "status",
            "payment_status",
            "registration_date",
            "amount",
            "qr_status",
        ]

    def get_participant_name(self, obj):
        return obj.participant.get_full_name() or obj.participant.email

    def get_qr_status(self, obj):
        if obj.qr_code:
            return "Scanned"
        if obj.status == "CANCELLED":
            return "Unused"
        return "Pending"


class AdminAuditLogSerializer(serializers.Serializer):
    actor = serializers.CharField(required=False, allow_null=True)
    action = serializers.CharField()
    object_repr = serializers.CharField(required=False, allow_null=True)
    timestamp = serializers.DateTimeField()
    details = serializers.CharField(required=False, allow_null=True)
