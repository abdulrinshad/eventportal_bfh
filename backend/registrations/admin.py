from django.contrib import admin
from .models import Registration

@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("id", "event", "participant", "status", "payment_status", "paid_amount", "paid_at")
    list_filter = ("status", "payment_status", "ticket_type", "registration_date")
    search_fields = ("participant__email", "event__title", "stripe_session_id", "payment_intent")
    readonly_fields = ("registration_date",)
