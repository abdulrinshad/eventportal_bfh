import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """
    In-app notification belonging to a single user.

    Created automatically by signals when:
    - An organizer creates/updates an event (PENDING → notification to organizer)
    - Admin approves an event      → notification to organizer
    - Admin rejects an event       → notification to organizer
    - A student registers          → notification to organizer of that event
    - A registration is cancelled  → notification to organizer of that event
    """

    class NotificationType(models.TextChoices):
        # Student Notification Types
        REGISTRATION           = "REGISTRATION", _("Registration")
        EVENT_UPDATE           = "EVENT_UPDATE", _("Event Update")
        EVENT_CANCELLED        = "EVENT_CANCELLED", _("Event Cancelled")
        REMINDER               = "REMINDER", _("Reminder")
        WAITLIST               = "WAITLIST", _("Waitlist")
        SYSTEM                 = "SYSTEM", _("System")
        # Organizer / Admin Notification Types
        EVENT_SUBMITTED        = "EVENT_SUBMITTED", _("Event Submitted")
        EVENT_APPROVED         = "EVENT_APPROVED", _("Event Approved")
        EVENT_REJECTED         = "EVENT_REJECTED", _("Event Rejected")
        NEW_REGISTRATION       = "NEW_REGISTRATION", _("New Registration")
        REGISTRATION_CANCELLED = "REGISTRATION_CANCELLED", _("Registration Cancelled")
        GENERAL                = "GENERAL", _("General")

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        verbose_name=_("user"),
    )
    event = models.ForeignKey(
        "events.Event",
        on_delete=models.SET_NULL,
        related_name="notifications",
        null=True,
        blank=True,
        verbose_name=_("event"),
    )
    notification_type = models.CharField(
        _("notification type"),
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )
    title = models.CharField(_("title"), max_length=255)
    message = models.TextField(_("message"))
    is_read = models.BooleanField(_("is read"), default=False, db_index=True)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _("notification")
        verbose_name_plural = _("notifications")
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} → {self.user.email}"
