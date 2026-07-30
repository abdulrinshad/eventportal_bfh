from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the notification center, supporting create/update/read flows.
    """

    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]

    def validate_title(self, value):
        if value is None:
            raise serializers.ValidationError("Title is required.")
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Title is required.")
        return cleaned

    def validate_message(self, value):
        if value is None:
            raise serializers.ValidationError("Message is required.")
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Message is required.")
        return cleaned

    def create(self, validated_data):
        user = validated_data.pop("user", None)
        if user is None:
            raise serializers.ValidationError("User is required.")
        return Notification.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        for field in ["title", "message", "notification_type", "is_read"]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance


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