import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Event(models.Model):
    """
    Represents an event created by an organizer.

    Lifecycle:
        DRAFT    → saved by organizer, not yet submitted
        PENDING  → submitted for admin review
        APPROVED → approved by admin (published)
        REJECTED → rejected by admin (can be edited & resubmitted → PENDING)
        COMPLETED → event finished
    """

    class Status(models.TextChoices):
        DRAFT     = "DRAFT",      _("Draft")
        PENDING   = "PENDING",    _("Pending")
        APPROVED  = "APPROVED",   _("Approved")
        REJECTED  = "REJECTED",   _("Rejected")
        CANCELLED = "CANCELLED",  _("Cancelled")
        COMPLETED = "COMPLETED",  _("Completed")

    class Category(models.TextChoices):
        ACADEMIC   = "ACADEMIC",   _("Academic")
        CULTURAL   = "CULTURAL",   _("Cultural")
        SPORTS     = "SPORTS",     _("Sports")
        TECHNICAL  = "TECHNICAL",  _("Technical")
        WORKSHOP   = "WORKSHOP",   _("Workshop")
        SEMINAR    = "SEMINAR",    _("Seminar")
        CONFERENCE = "CONFERENCE", _("Conference")
        NETWORKING = "NETWORKING", _("Networking")
        SOCIAL     = "SOCIAL",     _("Social")
        OTHER      = "OTHER",      _("Other")

    class Visibility(models.TextChoices):
        PUBLIC  = "PUBLIC",  _("Public")
        PRIVATE = "PRIVATE", _("Private")

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events",
        verbose_name=_("organizer"),
    )

    # ── Core details ──────────────────────────────────────────────────────────
    banner = models.ImageField(
        _("event banner"),
        upload_to="event_banners/",
        blank=True,
        null=True,
    )
    title = models.CharField(_("title"), max_length=255)
    category = models.CharField(
        _("category"),
        max_length=50,
        choices=Category.choices,
        default=Category.OTHER,
    )
    description = models.TextField(_("description"))
    max_participants = models.PositiveIntegerField(_("max participants"))
    enable_waitlist = models.BooleanField(_("enable waitlist"), default=False)

    # ── Scheduling ────────────────────────────────────────────────────────────
    start_datetime = models.DateTimeField(_("start date & time"))
    end_datetime = models.DateTimeField(_("end date & time"))
    venue = models.CharField(_("venue / location"), max_length=255)
    registration_deadline = models.DateTimeField(_("registration deadline"))

    # ── Contact ───────────────────────────────────────────────────────────────
    contact_email = models.EmailField(_("contact email"))
    contact_phone = models.CharField(_("contact phone"), max_length=20, blank=True)

    # ── Additional details ────────────────────────────────────────────────────
    ticket_price = models.DecimalField(
        _("ticket price"),
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text=_("Set to 0 for free events."),
    )

    # ── Pricing (new) ─────────────────────────────────────────────────────────
    is_paid = models.BooleanField(
        _("is paid"),
        default=False,
        help_text=_("True if this is a paid event."),
    )
    price = models.DecimalField(
        _("price"),
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text=_("Event fee. Must be > 0 for paid events. Automatically 0 for free events."),
    )
    visibility = models.CharField(
        _("visibility"),
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
    )
    tags = models.JSONField(
        _("tags"),
        default=list,
        blank=True,
        help_text=_("List of tag strings."),
    )
    website = models.URLField(_("website"), blank=True)
    social_links = models.JSONField(
        _("social links"),
        default=dict,
        blank=True,
        help_text=_("Dict of platform to URL, e.g. {\"twitter\": \"https://...\"}."),
    )

    # ── Status & review ───────────────────────────────────────────────────────
    status = models.CharField(
        _("status"),
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    rejection_reason = models.TextField(
        _("rejection reason"),
        blank=True,
        null=True,
    )
    rejected_date = models.DateTimeField(
        _("rejected date"),
        blank=True,
        null=True,
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("event")
        verbose_name_plural = _("events")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} [{self.status}] — {self.organizer.email}"
