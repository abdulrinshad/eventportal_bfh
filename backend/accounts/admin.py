from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .models import CustomUser, SiteSettings, CompanyValue, Feature, TeamMember, Partner, ContactEnquiry
from .forms import CustomUserCreationForm, CustomUserChangeForm


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Admin configuration for CustomUser.
    """
    model = CustomUser
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    
    # Fields to display in the list view
    list_display = (
        "email",
        "first_name",
        "last_name",
        "role",
        "organizer_status",
        "is_active",
        "is_staff",
    )
    
    # Filters in the right sidebar
    list_filter = (
        "role",
        "organizer_status",
        "is_active",
        "is_staff",
        "is_superuser",
        "is_email_verified",
    )
    
    # Fieldsets for detail view (add/change forms)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            _("Personal Info"),
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone_number",
                    "profile_image",
                )
            },
        ),
        (
            _("Permissions & Status"),
            {
                "fields": (
                    "role",
                    "organizer_status",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_email_verified",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    
    # Fieldsets when adding a new user via admin
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
    
    # Fields to search
    search_fields = ("email", "first_name", "last_name", "phone_number")
    
    # Default ordering
    ordering = ("-date_joined",)
    
    # Read-only fields
    readonly_fields = ("date_joined", "updated_at")


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ["company_name", "support_email", "support_phone"]


@admin.register(CompanyValue)
class CompanyValueAdmin(admin.ModelAdmin):
    list_display = ["title", "icon", "order"]
    list_editable = ["order"]


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ["title", "icon", "order"]
    list_editable = ["order"]


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ["name", "position", "order"]
    list_editable = ["order"]


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ["name", "order"]
    list_editable = ["order"]


@admin.register(ContactEnquiry)
class ContactEnquiryAdmin(admin.ModelAdmin):
    list_display = ["subject", "name", "email", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["name", "email", "subject", "message"]

