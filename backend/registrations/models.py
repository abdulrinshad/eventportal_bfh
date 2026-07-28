import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Registration(models.Model):
    """
    Records a participant's registration for an event.

    Tracks ticket type, attendance status, and payment status.
    Each (event, participant) pair is unique — one registration per person per event.
    """

    class TicketType(models.TextChoices):
        GENERAL = "GENERAL", _("General")
        VIP     = "VIP",     _("VIP")
        STUDENT = "STUDENT", _("Student")

    class AttendanceStatus(models.TextChoices):
        REGISTERED = "REGISTERED", _("Registered")
        ATTENDED   = "ATTENDED",   _("Attended")
        NO_SHOW    = "NO_SHOW",    _("No Show")

    class PaymentStatus(models.TextChoices):
        PENDING  = "PENDING",  _("Pending")
        PAID     = "PAID",     _("Paid")
        REFUNDED = "REFUNDED", _("Refunded")

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        related_name="registrations",
        verbose_name=_("event"),
    )
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="registrations",
        verbose_name=_("participant"),
    )
    ticket_type = models.CharField(
        _("ticket type"),
        max_length=20,
        choices=TicketType.choices,
        default=TicketType.GENERAL,
    )
    registration_date = models.DateTimeField(
        _("registration date"),
        auto_now_add=True,
    )
    attendance_status = models.CharField(
        _("attendance status"),
        max_length=20,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.REGISTERED,
    )
    payment_status = models.CharField(
        _("payment status"),
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )

    class Meta:
        verbose_name = _("registration")
        verbose_name_plural = _("registrations")
        ordering = ["-registration_date"]
        # Prevent duplicate registrations
        unique_together = [("event", "participant")]

    def __str__(self):
        return f"{self.participant.email} → {self.event.title} [{self.ticket_type}]"
