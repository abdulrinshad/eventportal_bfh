import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class OrganizerProfile(models.Model):
    """
    Extended profile for users with role=ORGANIZER.

    Stores organizer-specific fields that do not belong on CustomUser:
    cover image, display name, title, location, biography, social links,
    accomplishments, and experience records.

    Auto-created (via get_or_create) on first profile access.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organizer_profile",
        verbose_name=_("user"),
    )

    # ── Branding ──────────────────────────────────────────────────────────────
    cover_image = models.ImageField(
        _("cover image"),
        upload_to="organizer_covers/",
        blank=True,
        null=True,
    )
    display_name = models.CharField(
        _("display name"),
        max_length=150,
        blank=True,
    )
    title = models.CharField(
        _("organizer title"),
        max_length=100,
        blank=True,
        help_text=_("e.g. Event Director, Community Manager"),
    )

    # ── Location ──────────────────────────────────────────────────────────────
    city = models.CharField(_("city"), max_length=100, blank=True)
    country = models.CharField(_("country"), max_length=100, blank=True)

    # ── Bio & web ─────────────────────────────────────────────────────────────
    biography = models.TextField(_("biography"), blank=True)
    website = models.URLField(_("website"), blank=True)

    # ── Social links ──────────────────────────────────────────────────────────
    linkedin = models.URLField(_("LinkedIn"), blank=True)
    instagram = models.URLField(_("Instagram"), blank=True)
    twitter = models.URLField(_("Twitter / X"), blank=True)

    # ── Structured lists (stored as JSON arrays of strings) ───────────────────
    accomplishments = models.JSONField(
        _("accomplishments"),
        default=list,
        blank=True,
        help_text=_("List of accomplishment strings."),
    )
    experience = models.JSONField(
        _("experience & track record"),
        default=list,
        blank=True,
        help_text=_("List of experience / track record strings."),
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("organizer profile")
        verbose_name_plural = _("organizer profiles")

    def __str__(self):
        return f"Profile — {self.user.email}"

    @property
    def full_location(self):
        parts = [p for p in (self.city, self.country) if p]
        return ", ".join(parts)


class OrganizerSettings(models.Model):
    """
    Notification and privacy preferences for an organizer.
    Auto-created (via get_or_create) on first settings access.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organizer_settings",
        verbose_name=_("user"),
    )

    # ── Notification preferences ──────────────────────────────────────────────
    receive_daily_digest = models.BooleanField(
        _("receive daily digest"),
        default=True,
    )
    desktop_notifications = models.BooleanField(
        _("desktop notifications"),
        default=True,
    )

    # ── Privacy preferences ───────────────────────────────────────────────────
    public_profile = models.BooleanField(
        _("public organizer profile"),
        default=True,
    )
    enable_2fa = models.BooleanField(
        _("enable two-factor authentication"),
        default=False,
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        verbose_name = _("organizer settings")
        verbose_name_plural = _("organizer settings")

    def __str__(self):
        return f"Settings — {self.user.email}"
