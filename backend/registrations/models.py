import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Registration(models.Model):
    """
    Records a participant's registration for an event.

    Tracks ticket type, attendance status, registration status, and payment status.
    Each (event, participant) pair is unique — one registration per person per event.

    status field lifecycle:
        CONFIRMED  → successfully registered and seat confirmed
        WAITLISTED → registered but on waitlist (event was full, waitlist enabled)
        CANCELLED  → student cancelled their registration
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

    class Status(models.TextChoices):
        CONFIRMED  = "CONFIRMED",  _("Confirmed")
        WAITLISTED = "WAITLISTED", _("Waitlisted")
        CANCELLED  = "CANCELLED",  _("Cancelled")

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
    status = models.CharField(
        _("registration status"),
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED,
        db_index=True,
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
    qr_code = models.ImageField(
        _("QR code"),
        upload_to="registration_qr_codes/",
        blank=True,
        null=True,
        help_text=_("Auto-generated QR code image for this registration ticket."),
    )

    # ── Stripe payment fields ─────────────────────────────────────────────────
    stripe_session_id = models.CharField(
        _("Stripe session ID"),
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
    )
    payment_intent = models.CharField(
        _("Stripe payment intent ID"),
        max_length=255,
        blank=True,
        null=True,
    )
    paid_amount = models.DecimalField(
        _("amount paid"),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    currency = models.CharField(
        _("currency"),
        max_length=10,
        blank=True,
        null=True,
    )
    paid_at = models.DateTimeField(
        _("paid at"),
        null=True,
        blank=True,
    )


    class Meta:
        verbose_name = _("registration")
        verbose_name_plural = _("registrations")
        ordering = ["-registration_date"]
        # Prevent duplicate registrations
        unique_together = [("event", "participant")]

    def __str__(self):
        return f"{self.participant.email} → {self.event.title} [{self.status}]"

    @property
    def is_cancellable(self):
        """Return True if this registration can still be cancelled."""
        return self.status != Registration.Status.CANCELLED
