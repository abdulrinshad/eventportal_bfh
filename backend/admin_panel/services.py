from collections import defaultdict

from django.contrib.admin.models import LogEntry
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth

from events.models import Event
from notifications.models import Notification
from registrations.models import Registration

User = get_user_model()


def build_dashboard_statistics():
    total_users = User.objects.count()
    students = User.objects.filter(role=User.Role.STUDENT).count()
    organizers = User.objects.filter(role=User.Role.ORGANIZER).count()
    admins = User.objects.filter(role=User.Role.ADMIN).count()

    pending_organizers = User.objects.filter(organizer_status=User.OrganizerStatus.PENDING).count()
    approved_organizers = User.objects.filter(organizer_status=User.OrganizerStatus.APPROVED).count()
    rejected_organizers = User.objects.filter(organizer_status=User.OrganizerStatus.REJECTED).count()

    pending_events = Event.objects.filter(status=Event.Status.PENDING).count()
    approved_events = Event.objects.filter(status=Event.Status.APPROVED).count()
    rejected_events = Event.objects.filter(status=Event.Status.REJECTED).count()
    completed_events = Event.objects.filter(status=Event.Status.COMPLETED).count()

    total_registrations = Registration.objects.count()
    confirmed_registrations = Registration.objects.filter(status=Registration.Status.CONFIRMED).count()
    waitlisted_registrations = Registration.objects.filter(status=Registration.Status.WAITLISTED).count()
    cancelled_registrations = Registration.objects.filter(status=Registration.Status.CANCELLED).count()

    unread_notifications = Notification.objects.filter(is_read=False).count()

    estimated_revenue = (
        Registration.objects.filter(status=Registration.Status.CONFIRMED)
        .select_related("event")
        .exclude(event__price__lte=0)
        .aggregate(total=Sum("event__price"))["total"]
        or 0
    )

    total_pending_approvals = pending_organizers + pending_events

    return {
        "users": {
            "total": total_users,
            "students": students,
            "organizers": organizers,
            "admins": admins,
        },
        "organizers": {
            "pending": pending_organizers,
            "approved": approved_organizers,
            "rejected": rejected_organizers,
            "total_organizers": organizers,
        },
        "events": {
            "total": Event.objects.count(),
            "pending": pending_events,
            "approved": approved_events,
            "rejected": rejected_events,
            "completed": completed_events,
        },
        "registrations": {
            "total": total_registrations,
            "confirmed": confirmed_registrations,
            "waitlisted": waitlisted_registrations,
            "cancelled": cancelled_registrations,
        },
        "notifications": {
            "unread": unread_notifications,
        },
        "revenue": {
            "estimated": float(estimated_revenue),
        },
        "pending_approvals_count": total_pending_approvals,
    }


def list_users(search=None, role=None, organizer_status=None):
    queryset = User.objects.order_by("-date_joined")

    if search:
        queryset = queryset.filter(
            Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
        )

    if role:
        queryset = queryset.filter(role=role)

    if organizer_status:
        queryset = queryset.filter(organizer_status=organizer_status)

    return queryset


def get_event_approval_queue(status=None, search=None):
    queryset = Event.objects.select_related("organizer").order_by("-created_at")

    if status:
        queryset = queryset.filter(status=status)
    else:
        queryset = queryset.filter(status__in=[Event.Status.PENDING, Event.Status.REJECTED])

    if search:
        queryset = queryset.filter(Q(title__icontains=search) | Q(organizer__email__icontains=search))

    return queryset


def approve_event(event, reason=None):
    event.status = Event.Status.APPROVED
    event.rejection_reason = None
    event.rejected_date = None
    event.save(update_fields=["status", "rejection_reason", "rejected_date"])

    Notification.objects.create(
        user=event.organizer,
        notification_type=Notification.NotificationType.EVENT_APPROVED,
        title="Event approved",
        message=reason or f"Your event '{event.title}' has been approved and is now live.",
    )
    return event


def reject_event(event, reason=None):
    event.status = Event.Status.REJECTED
    event.rejection_reason = reason or "No reason provided."
    event.rejected_date = None
    event.save(update_fields=["status", "rejection_reason", "rejected_date"])

    Notification.objects.create(
        user=event.organizer,
        notification_type=Notification.NotificationType.EVENT_REJECTED,
        title="Event rejected",
        message=reason or f"Your event '{event.title}' was rejected for review.",
    )
    return event


def list_admin_notifications(user=None, unread_only=False):
    queryset = Notification.objects.select_related("user").order_by("-created_at")
    if user:
        queryset = queryset.filter(user=user)
    if unread_only:
        queryset = queryset.filter(is_read=False)
    return queryset


def list_admin_registrations(search=None, status=None):
    queryset = Registration.objects.select_related("event", "participant").order_by("-registration_date")

    if search:
        queryset = queryset.filter(
            Q(event__title__icontains=search)
            | Q(participant__email__icontains=search)
            | Q(participant__first_name__icontains=search)
            | Q(participant__last_name__icontains=search)
        )

    if status:
        queryset = queryset.filter(status=status)

    return queryset


def build_reports_data():
    summary = {
        "total_events": Event.objects.count(),
        "approved_events": Event.objects.filter(status=Event.Status.APPROVED).count(),
        "pending_events": Event.objects.filter(status=Event.Status.PENDING).count(),
        "total_registrations": Registration.objects.count(),
        "confirmed_registrations": Registration.objects.filter(status=Registration.Status.CONFIRMED).count(),
        "waitlisted_registrations": Registration.objects.filter(status=Registration.Status.WAITLISTED).count(),
    }

    by_category = list(
        Event.objects.values("category")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    by_month = []
    for entry in (
        Event.objects.annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(events=Count("id"))
        .order_by("month")
    ):
        by_month.append({
            "month": entry["month"].strftime("%Y-%m") if entry["month"] else "N/A",
            "events": entry["events"],
        })

    return {"summary": summary, "by_category": by_category, "by_month": by_month}


def build_analytics_data():
    events_by_status = defaultdict(int)
    for event in Event.objects.values_list("status", flat=True):
        events_by_status[event] += 1

    registrations_by_status = defaultdict(int)
    for registration in Registration.objects.values_list("status", flat=True):
        registrations_by_status[registration] += 1

    user_growth = []
    for entry in (
        User.objects.annotate(month=TruncMonth("date_joined"))
        .values("month")
        .annotate(users=Count("id"))
        .order_by("month")
    ):
        user_growth.append({
            "month": entry["month"].strftime("%Y-%m") if entry["month"] else "N/A",
            "users": entry["users"],
        })

    event_growth = []
    for entry in (
        Event.objects.annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(events=Count("id"))
        .order_by("month")
    ):
        event_growth.append({
            "month": entry["month"].strftime("%Y-%m") if entry["month"] else "N/A",
            "events": entry["events"],
        })

    return {
        "events_by_status": dict(events_by_status),
        "registrations_by_status": dict(registrations_by_status),
        "user_growth": user_growth,
        "event_growth": event_growth,
    }


def build_audit_logs(limit=10):
    entries = []

    for log_entry in (
        LogEntry.objects.select_related("user", "content_type")
        .order_by("-action_time")[:limit]
    ):
        entries.append(
            {
                "actor": str(log_entry.user) if log_entry.user else "System",
                "action": log_entry.get_action_flag_display(),
                "object_repr": log_entry.object_repr,
                "timestamp": log_entry.action_time,
                "details": log_entry.change_message,
            }
        )

    if not entries:
        for user in User.objects.order_by("-date_joined")[:5]:
            entries.append(
                {
                    "actor": user.email,
                    "action": "Created",
                    "object_repr": "User",
                    "timestamp": user.date_joined,
                    "details": "New user registered",
                }
            )

    return entries
