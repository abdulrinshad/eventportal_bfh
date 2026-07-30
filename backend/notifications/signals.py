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

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Notification


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def _create_notification(user, notification_type, title, message, event=None):
    """Thin wrapper to create a Notification record."""
    Notification.objects.create(
        user=user,
        event=event,
        notification_type=notification_type,
        title=title,
        message=message,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Cache Event state before save to detect transitions & changes
# ─────────────────────────────────────────────────────────────────────────────

@receiver(pre_save, sender="events.Event")
def _event_cache_previous_state(sender, instance, **kwargs):
    """
    Store previous fields on Event instance so post_save can check for
    status changes, date/venue changes, or general event updates.
    """
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._previous_status = old.status
            instance._previous_start_datetime = old.start_datetime
            instance._previous_end_datetime = old.end_datetime
            instance._previous_venue = old.venue
        except sender.DoesNotExist:
            instance._previous_status = None
            instance._previous_start_datetime = None
            instance._previous_end_datetime = None
            instance._previous_venue = None
    else:
        instance._previous_status = None
        instance._previous_start_datetime = None
        instance._previous_end_datetime = None
        instance._previous_venue = None


@receiver(post_save, sender="events.Event")
def _event_status_notifications(sender, instance, created, **kwargs):
    """
    Fires after every Event save to notify organizer and registered students.
    """
    from events.models import Event  # local import to avoid circular deps
    from registrations.models import Registration

    organizer = instance.organizer
    title_text = instance.title
    old_status = getattr(instance, "_previous_status", None)
    new_status = instance.status

    # 1. New event submitted for review (Organizer Notification)
    if created and new_status == Event.Status.PENDING:
        _create_notification(
            user=organizer,
            event=instance,
            notification_type=Notification.NotificationType.EVENT_SUBMITTED,
            title="Event Submitted for Approval",
            message=f"Your event '{title_text}' has been submitted for approval.",
        )
        return

    # For existing events, handle status transitions & updates
    if not created:
        # Check status transitions for organizer
        if old_status != new_status:
            if new_status == Event.Status.APPROVED:
                _create_notification(
                    user=organizer,
                    event=instance,
                    notification_type=Notification.NotificationType.EVENT_APPROVED,
                    title="Event Approved",
                    message=f"Your event '{title_text}' has been approved.",
                )
            elif new_status == Event.Status.REJECTED:
                _create_notification(
                    user=organizer,
                    event=instance,
                    notification_type=Notification.NotificationType.EVENT_REJECTED,
                    title="Event Rejected",
                    message=f"Your event '{title_text}' has been rejected.",
                )
            elif new_status == getattr(Event.Status, "CANCELLED", "CANCELLED"):
                # Event Cancelled by Organizer -> Notify registered students
                registered_students = Registration.objects.filter(
                    event=instance,
                    status__in=[Registration.Status.CONFIRMED, Registration.Status.WAITLISTED],
                ).values_list("participant", flat=True).distinct()

                for student_id in registered_students:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    try:
                        student_user = User.objects.get(pk=student_id)
                        _create_notification(
                            user=student_user,
                            event=instance,
                            notification_type=Notification.NotificationType.EVENT_CANCELLED,
                            title="Event Cancelled",
                            message=f"{title_text} has been cancelled.",
                        )
                    except User.DoesNotExist:
                        pass
                return

        # Check schedule or general updates for registered students
        old_start = getattr(instance, "_previous_start_datetime", None)
        old_end = getattr(instance, "_previous_end_datetime", None)
        old_venue = getattr(instance, "_previous_venue", None)

        schedule_changed = (
            (old_start and old_start != instance.start_datetime)
            or (old_end and old_end != instance.end_datetime)
            or (old_venue and old_venue != instance.venue)
        )

        if schedule_changed:
            registered_students = Registration.objects.filter(
                event=instance,
                status__in=[Registration.Status.CONFIRMED, Registration.Status.WAITLISTED],
            ).select_related("participant")

            for reg in registered_students:
                _create_notification(
                    user=reg.participant,
                    event=instance,
                    notification_type=Notification.NotificationType.EVENT_UPDATE,
                    title="Event Schedule Updated",
                    message=f"The date or venue for {title_text} has changed.",
                )
        else:
            # General event update notification if event is APPROVED
            if instance.status == Event.Status.APPROVED and old_status == new_status:
                registered_students = Registration.objects.filter(
                    event=instance,
                    status__in=[Registration.Status.CONFIRMED, Registration.Status.WAITLISTED],
                ).select_related("participant")

                for reg in registered_students:
                    _create_notification(
                        user=reg.participant,
                        event=instance,
                        notification_type=Notification.NotificationType.EVENT_UPDATE,
                        title="Event Updated",
                        message=f"{title_text} has been updated. Please review the latest event details.",
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
    Fires after every Registration save to notify student and organizer.
    """
    from registrations.models import Registration

    student = instance.participant
    organizer = instance.event.organizer
    event_title = instance.event.title
    old_status = getattr(instance, "_previous_reg_status", None)
    new_status = instance.status

    # 1. New registration created
    if created:
        if new_status == Registration.Status.CONFIRMED:
            # Notify Student
            _create_notification(
                user=student,
                event=instance.event,
                notification_type=Notification.NotificationType.REGISTRATION,
                title="Registration Confirmed",
                message=f"You have successfully registered for {event_title}.",
            )
        elif new_status == Registration.Status.WAITLISTED:
            # Notify Student
            _create_notification(
                user=student,
                event=instance.event,
                notification_type=Notification.NotificationType.WAITLIST,
                title="Added to Waitlist",
                message=f"You have been added to the waitlist for {event_title}.",
            )

        # Notify Organizer
        _create_notification(
            user=organizer,
            event=instance.event,
            notification_type=Notification.NotificationType.NEW_REGISTRATION,
            title="New Registration",
            message=f"New registration received for '{event_title}'.",
        )
        return

    # 2. Existing registration status transition
    if not created and old_status != new_status:
        # Cancelled
        if new_status == Registration.Status.CANCELLED:
            # Notify Student
            _create_notification(
                user=student,
                event=instance.event,
                notification_type=Notification.NotificationType.REGISTRATION,
                title="Registration Cancelled",
                message=f"Your registration for {event_title} has been cancelled.",
            )
            # Notify Organizer
            _create_notification(
                user=organizer,
                event=instance.event,
                notification_type=Notification.NotificationType.REGISTRATION_CANCELLED,
                title="Registration Cancelled",
                message=f"A participant cancelled registration for '{event_title}'.",
            )

        # Moved from Waitlist to Confirmed
        elif old_status == Registration.Status.WAITLISTED and new_status == Registration.Status.CONFIRMED:
            _create_notification(
                user=student,
                event=instance.event,
                notification_type=Notification.NotificationType.WAITLIST,
                title="Registration Confirmed",
                message="You have been moved from the waitlist to confirmed registration.",
            )

