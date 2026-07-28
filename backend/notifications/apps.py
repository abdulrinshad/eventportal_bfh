from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications"

    def ready(self):
        # Import signals so Django registers the receivers at startup.
        import notifications.signals  # noqa: F401
