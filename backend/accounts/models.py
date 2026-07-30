import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom User Model for the Enterprise Event Management System.
    """

    class Role(models.TextChoices):
        STUDENT = "STUDENT", _("Student")
        ORGANIZER = "ORGANIZER", _("Organizer")
        ADMIN = "ADMIN", _("Admin")

    class OrganizerStatus(models.TextChoices):
        NOT_APPLIED = "NOT_APPLIED", _("Not Applied")
        PENDING = "PENDING", _("Pending")
        APPROVED = "APPROVED", _("Approved")
        REJECTED = "REJECTED", _("Rejected")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=150)
    last_name = models.CharField(_("last name"), max_length=150)
    phone_number = models.CharField(_("phone number"), max_length=20, blank=True, null=True)
    bio = models.TextField(_("bio"), blank=True, null=True)
    profile_image = models.ImageField(
        _("profile image"), upload_to="profile_images/", blank=True, null=True
    )
    cover_image = models.ImageField(
        _("cover image"), upload_to="cover_images/", blank=True, null=True
    )
    role = models.CharField(
        _("role"), max_length=20, choices=Role.choices, default=Role.STUDENT
    )
    organizer_status = models.CharField(
        _("organizer status"),
        max_length=20,
        choices=OrganizerStatus.choices,
        default=OrganizerStatus.NOT_APPLIED,
    )
    is_email_verified = models.BooleanField(_("email verified"), default=False)
    is_active = models.BooleanField(_("active"), default=True)
    is_staff = models.BooleanField(_("staff status"), default=False)
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)
    updated_at = models.DateTimeField(_("updated at"), auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name


class EmailOTP(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=50, default="EMAIL_VERIFICATION")
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.user.email} - {self.otp_code} ({self.purpose})"


class SiteSettings(models.Model):
    company_name = models.CharField(max_length=255, default="CompilVision")
    logo = models.ImageField(upload_to="site_logos/", blank=True, null=True)
    tagline = models.CharField(max_length=255, default="Premium event management platform")
    support_email = models.EmailField(default="support@compilvision.com")
    support_phone = models.CharField(max_length=50, default="+1 (555) 000-0000")
    address = models.TextField(default="123 Innovation Way, Tech District, CA 94016")
    footer_content = models.TextField(default="Premium event management platform for professional hosting. Coordinate registrations, tickets, and analytics seamlessly.")
    copyright = models.CharField(max_length=255, default="CompilVision. All rights reserved.")
    
    # Social links
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    
    # About Section
    about_hero_title = models.CharField(max_length=255, default="About Our Platform")
    about_hero_subtitle = models.TextField(default="We power the world's best professional events with class-leading tools.")
    about_hero_banner = models.ImageField(upload_to="about_banners/", blank=True, null=True)
    about_story_title = models.CharField(max_length=255, default="Our Story")
    about_story_content = models.TextField(default="Founded in 2026, CompilVision started with a single mission: to make organizing and attending professional summits, workshops, and mixers as seamless and modern as possible.")
    about_story_image = models.ImageField(upload_to="about_story/", blank=True, null=True)
    mission = models.TextField(default="To empower organizers and connect professional communities through premium experiences.")
    vision = models.TextField(default="To become the global standard platform for premium business and tech gatherings.")
    
    # Contact Section
    contact_hero_title = models.CharField(max_length=255, default="Get in Touch")
    contact_hero_subtitle = models.TextField(default="Have questions or need support? Drop us a line and our team will get back to you shortly.")
    business_hours = models.TextField(default="Monday – Friday: 9:00 AM – 6:00 PM\nSaturday: 10:00 AM – 4:00 PM")
    google_maps_embed_url = models.TextField(default="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0863773121575!2d-122.40137538468205!3d37.78528597975716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858062828bbf11%3A0xe539130761e3895e!2sSilicon%20Valley!5e0!3m2!1sen!2sus!4v1614123456789!5m2!1sen!2sus")

    class Meta:
        verbose_name = "site settings"
        verbose_name_plural = "site settings"

    def __str__(self):
        return self.company_name


class CompanyValue(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    icon = models.CharField(max_length=50, default="FiCompass", help_text="React feather icon name e.g. FiCompass, FiLayers, FiShield")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class Feature(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    icon = models.CharField(max_length=50, default="FiLayers")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class TeamMember(models.Model):
    name = models.CharField(max_length=150)
    position = models.CharField(max_length=150)
    bio = models.TextField()
    photo = models.ImageField(upload_to="team/", blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Partner(models.Model):
    name = models.CharField(max_length=150)
    logo = models.ImageField(upload_to="partners/")
    website = models.URLField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class ContactEnquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", _("New")
        IN_PROGRESS = "IN_PROGRESS", _("In Progress")
        RESOLVED = "RESOLVED", _("Resolved")
        CLOSED = "CLOSED", _("Closed")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "contact enquiry"
        verbose_name_plural = "contact enquiries"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} - {self.name}"

