"""
notifications/signals.py

Automatically creates Notification records when key events occur:

  1. Organizer creates a new event (status = PENDING on creation)
     → notify organizer: "Your event '<title>' has been submitted for approval."

  2. Admin approves an event (status transitions to APPROVED)
     → notify organizer: "Your event '<title>' has been approved."

  3. Admin rejects an event (status transitions to REJECTED)
     → notify organizer: "Your event '<title>' has been rejected."

  4. A student successfully registers for an event
     → notify organizer: "New registration received for '<event title>'."

  5. A registration is cancelled
     → notify organizer: "A participant cancelled registration for '<event title>'."

Each signal handler is guarded against duplicate notifications by checking
the transition (previous vs new value) rather than just the current state.
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Notification


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def _create_notification(user, notification_type, title, message):
    """Thin wrapper to create a Notification record."""
    Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Store previous status on Event instances before save so we can detect
# genuine status transitions and avoid duplicate notifications.
# ─────────────────────────────────────────────────────────────────────────────

@receiver(pre_save, sender="events.Event")
def _event_cache_previous_status(sender, instance, **kwargs):
    """
    Store the current (about-to-be-overwritten) status on the instance
    so that post_save can compare old vs new.
    """
    if instance.pk:
        try:
            instance._previous_status = sender.objects.values_list(
                "status", flat=True
            ).get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._previous_status = None
    else:
        # Brand-new instance — no previous status
        instance._previous_status = None


@receiver(post_save, sender="events.Event")
def _event_status_notifications(sender, instance, created, **kwargs):
    """
    Fires after every Event save.

    - On creation (created=True) and status=PENDING: "submitted for approval"
    - On status transition to APPROVED: "approved"
    - On status transition to REJECTED: "rejected"
    """
    from events.models import Event  # local import to avoid circular deps

    organizer = instance.organizer
    title_text = instance.title
    old_status = getattr(instance, "_previous_status", None)
    new_status = instance.status

    # 1. New event submitted for review
    if created and new_status == Event.Status.PENDING:
        _create_notification(
            user=organizer,
            notification_type=Notification.NotificationType.EVENT_SUBMITTED,
            title="Event Submitted for Approval",
            message=f"Your event '{title_text}' has been submitted for approval.",
        )
        return

    # For updates, only fire when status actually changed
    if old_status == new_status:
        return

    # 2. Event approved
    if new_status == Event.Status.APPROVED:
        _create_notification(
            user=organizer,
            notification_type=Notification.NotificationType.EVENT_APPROVED,
            title="Event Approved",
            message=f"Your event '{title_text}' has been approved.",
        )

    # 3. Event rejected
    elif new_status == Event.Status.REJECTED:
        _create_notification(
            user=organizer,
            notification_type=Notification.NotificationType.EVENT_REJECTED,
            title="Event Rejected",
            message=f"Your event '{title_text}' has been rejected.",
        )


# ─────────────────────────────────────────────────────────────────────────────
# Registration signals
# ─────────────────────────────────────────────────────────────────────────────

@receiver(pre_save, sender="registrations.Registration")
def _registration_cache_previous_status(sender, instance, **kwargs):
    """Cache previous registration status before save for transition detection."""
    if instance.pk:
        try:
            instance._previous_reg_status = sender.objects.values_list(
                "status", flat=True
            ).get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._previous_reg_status = None
    else:
        instance._previous_reg_status = None


@receiver(post_save, sender="registrations.Registration")
def _registration_notifications(sender, instance, created, **kwargs):
    """
    Fires after every Registration save.

    - On creation (created=True) and status=CONFIRMED or WAITLISTED:
      notify organizer "New registration received for '<event>'."

    - On status transition to CANCELLED:
      notify organizer "A participant cancelled registration for '<event>'."
    """
    from registrations.models import Registration  # local import

    organizer = instance.event.organizer
    event_title = instance.event.title
    old_status = getattr(instance, "_previous_reg_status", None)
    new_status = instance.status

    # 4. New successful registration
    if created and new_status in (
        Registration.Status.CONFIRMED,
        Registration.Status.WAITLISTED,
    ):
        _create_notification(
            user=organizer,
            notification_type=Notification.NotificationType.NEW_REGISTRATION,
            title="New Registration",
            message=f"New registration received for '{event_title}'.",
        )
        return

    # 5. Registration cancelled (transition only)
    if (
        not created
        and old_status != new_status
        and new_status == Registration.Status.CANCELLED
    ):
        _create_notification(
            user=organizer,
            notification_type=Notification.NotificationType.REGISTRATION_CANCELLED,
            title="Registration Cancelled",
            message=f"A participant cancelled registration for '{event_title}'.",
        )
