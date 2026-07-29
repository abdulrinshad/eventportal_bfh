from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for general / organizer notifications.
    """

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = fields


class StudentNotificationSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for student notifications.
    Returns: id, title, message, type, event (object/null), is_read, created_at
    """

    type = serializers.CharField(source="notification_type", read_only=True)
    event = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "type",
            "event",
            "is_read",
            "created_at",
        ]
        read_only_fields = fields

    def get_event(self, obj):
        if obj.event:
            return {
                "id": str(obj.event.id),
                "title": obj.event.title,
            }
        return None
