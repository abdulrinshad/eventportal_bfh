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
    profile_image = models.ImageField(
        _("profile image"), upload_to="profile_images/", blank=True, null=True
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

