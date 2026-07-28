from django.contrib import admin

from .models import OrganizerProfile, OrganizerSettings


@admin.register(OrganizerProfile)
class OrganizerProfileAdmin(admin.ModelAdmin):
    list_display  = ("user", "display_name", "title", "city", "country", "updated_at")
    search_fields = ("user__email", "display_name", "city", "country")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("User", {"fields": ("user",)}),
        ("Branding", {"fields": ("cover_image", "display_name", "title")}),
        ("Location", {"fields": ("city", "country")}),
        ("Bio & Web", {"fields": ("biography", "website")}),
        ("Social Links", {"fields": ("linkedin", "instagram", "twitter")}),
        ("Lists", {"fields": ("accomplishments", "experience")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(OrganizerSettings)
class OrganizerSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "receive_daily_digest",
        "desktop_notifications",
        "public_profile",
        "enable_2fa",
        "updated_at",
    )
    search_fields = ("user__email",)
    readonly_fields = ("updated_at",)
