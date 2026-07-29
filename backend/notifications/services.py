from datetime import timedelta
from django.utils import timezone
from registrations.models import Registration
from .models import Notification


def generate_event_reminders_for_user(user):
    """
    Automatically creates event reminder notifications for the specified user
    based on their registered upcoming events:
    - 3 days before
    - 1 day before
    - 2 hours before
    """
    if not user or not user.is_authenticated:
        return

    now = timezone.now()
    active_registrations = (
        Registration.objects
        .filter(
            participant=user,
            status__in=[Registration.Status.CONFIRMED, Registration.Status.WAITLISTED],
            event__start_datetime__gt=now
        )
        .select_related("event")
    )

    for reg in active_registrations:
        event = reg.event
        time_until_event = event.start_datetime - now

        # 1. 3 Days Reminder (between 1 day and 3 days left)
        if timedelta(days=1) < time_until_event <= timedelta(days=3):
            already_sent = Notification.objects.filter(
                user=user,
                event=event,
                notification_type=Notification.NotificationType.REMINDER,
                title="Event Reminder - 3 Days Left"
            ).exists()

            if not already_sent:
                Notification.objects.create(
                    user=user,
                    event=event,
                    notification_type=Notification.NotificationType.REMINDER,
                    title="Event Reminder - 3 Days Left",
                    message=f"Your registered event '{event.title}' starts in 3 days. Download your ticket!",
                )

        # 2. 1 Day Reminder (between 2 hours and 1 day left)
        elif timedelta(hours=2) < time_until_event <= timedelta(days=1):
            already_sent = Notification.objects.filter(
                user=user,
                event=event,
                notification_type=Notification.NotificationType.REMINDER,
                title="Event Reminder - Starts Tomorrow"
            ).exists()

            if not already_sent:
                Notification.objects.create(
                    user=user,
                    event=event,
                    notification_type=Notification.NotificationType.REMINDER,
                    title="Event Reminder - Starts Tomorrow",
                    message=f"Your registered event '{event.title}' starts tomorrow. Get ready!",
                )

        # 3. 2 Hours Reminder (less than or equal to 2 hours left)
        elif timedelta(seconds=0) < time_until_event <= timedelta(hours=2):
            already_sent = Notification.objects.filter(
                user=user,
                event=event,
                notification_type=Notification.NotificationType.REMINDER,
                title="Event Reminder - Starts Soon"
            ).exists()

            if not already_sent:
                Notification.objects.create(
                    user=user,
                    event=event,
                    notification_type=Notification.NotificationType.REMINDER,
                    title="Event Reminder - Starts Soon",
                    message=f"Your registered event '{event.title}' starts in 2 hours!",
                )
