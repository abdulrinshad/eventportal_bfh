"""
organizers/services.py

Business-logic layer. Views delegate non-trivial operations here to keep
views thin and services independently testable.
"""
import csv

from django.core.mail import send_mail
from django.http import HttpResponse

from .models import OrganizerProfile, OrganizerSettings
from registrations.models import Registration


# ─────────────────────────────────────────────────────────────────────────────
# Profile & Settings helpers
# ─────────────────────────────────────────────────────────────────────────────

def get_or_create_profile(user):
    """
    Returns the OrganizerProfile for the given user, creating it if absent.
    Initialises display_name from the user's full name on first creation.
    """
    profile, created = OrganizerProfile.objects.get_or_create(
        user=user,
        defaults={"display_name": user.get_full_name()},
    )
    return profile


def get_or_create_settings(user):
    """
    Returns the OrganizerSettings for the given user, creating with defaults if absent.
    """
    settings_obj, _ = OrganizerSettings.objects.get_or_create(user=user)
    return settings_obj


# ─────────────────────────────────────────────────────────────────────────────
# Participant queryset helper
# ─────────────────────────────────────────────────────────────────────────────

def get_organizer_registrations(user):
    """
    Returns a queryset of all Registrations for events owned by `user`.
    Pre-joined to avoid N+1 queries.
    """
    return (
        Registration.objects
        .filter(event__organizer=user)
        .select_related("participant", "event")
        .order_by("-registration_date")
    )


# ─────────────────────────────────────────────────────────────────────────────
# CSV Export
# ─────────────────────────────────────────────────────────────────────────────

def export_participants_csv(queryset):
    """
    Given a Registration queryset, returns an HttpResponse containing a
    downloadable CSV attachment of all participant records.
    """
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="participants.csv"'

    writer = csv.writer(response)
    writer.writerow([
        "Participant Name",
        "Email",
        "Phone",
        "Event Name",
        "Ticket Type",
        "Registration Date",
        "Attendance Status",
        "Payment Status",
    ])

    for reg in queryset:
        writer.writerow([
            reg.participant.get_full_name() or reg.participant.email,
            reg.participant.email,
            reg.participant.phone_number or "",
            reg.event.title,
            reg.get_ticket_type_display(),
            reg.registration_date.strftime("%Y-%m-%d %H:%M"),
            reg.get_attendance_status_display(),
            reg.get_payment_status_display(),
        ])

    return response


# ─────────────────────────────────────────────────────────────────────────────
# Broadcast Email
# ─────────────────────────────────────────────────────────────────────────────

def broadcast_email_to_participants(event, subject, message, organizer):
    """
    Sends `message` with `subject` to every participant registered for `event`.

    - Uses Django''s send_mail (console backend in dev, SMTP in production).
    - Returns the count of successfully sent emails.
    """
    registrations = (
        Registration.objects
        .filter(event=event)
        .select_related("participant")
    )

    recipient_emails = [
        reg.participant.email
        for reg in registrations
        if reg.participant.email
    ]

    if not recipient_emails:
        return 0

    from_email = organizer.email
    sent_count = 0

    for email in recipient_emails:
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[email],
                fail_silently=False,
            )
            sent_count += 1
        except Exception:
            # Log and continue; partial failures are acceptable
            pass

    return sent_count
