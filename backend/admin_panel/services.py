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
    queryset = Event.objects.select_related("organizer").annotate(registrations_count=Count("registrations")).order_by("-created_at")

    if status and str(status).upper() != "ALL":
        queryset = queryset.filter(status=str(status).upper())

    if search:
        queryset = queryset.filter(Q(title__icontains=search) | Q(organizer__email__icontains=search))

    return queryset


def approve_event(event, reason=None):
    event.status = Event.Status.APPROVED
    event.rejection_reason = None
    event.rejected_date = None
    event.save(update_fields=["status", "rejection_reason", "rejected_date"])

    if event.organizer:
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

    if event.organizer:
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

    registration_growth = []
    for entry in (
        Registration.objects.annotate(month=TruncMonth("registration_date"))
        .values("month")
        .annotate(registrations=Count("id"))
        .order_by("month")
    ):
        registration_growth.append({
            "month": entry["month"].strftime("%Y-%m") if entry["month"] else "N/A",
            "registrations": entry["registrations"],
        })

    revenue_growth = []
    for entry in (
        Registration.objects.filter(status=Registration.Status.CONFIRMED)
        .select_related("event")
        .annotate(month=TruncMonth("registration_date"))
        .values("month")
        .annotate(revenue=Sum("event__price"))
        .order_by("month")
    ):
        revenue_growth.append({
            "month": entry["month"].strftime("%Y-%m") if entry["month"] else "N/A",
            "revenue": float(entry["revenue"] or 0),
        })

    estimated_revenue = (
        Registration.objects.filter(status=Registration.Status.CONFIRMED)
        .select_related("event")
        .exclude(event__price__lte=0)
        .aggregate(total=Sum("event__price"))["total"]
        or 0
    )

    summary = {
        "total_events": Event.objects.count(),
        "total_students": User.objects.filter(role=User.Role.STUDENT).count(),
        "total_organizers": User.objects.filter(role=User.Role.ORGANIZER).count(),
        "total_registrations": Registration.objects.count(),
        "total_revenue": float(estimated_revenue),
    }

    recent_activity = []
    for reg in Registration.objects.select_related("event", "participant").order_by("-registration_date")[:5]:
        p_email = reg.participant.email if reg.participant else "Unknown Participant"
        e_title = reg.event.title if reg.event else "Unknown Event"
        recent_activity.append({
            "id": str(reg.id),
            "type": "REGISTRATION",
            "title": f"New Registration for {e_title}",
            "description": f"{p_email} registered for '{e_title}' ({reg.status})",
            "timestamp": reg.registration_date.isoformat() if reg.registration_date else None,
        })

    for ev in Event.objects.select_related("organizer").order_by("-created_at")[:5]:
        org_email = ev.organizer.email if ev.organizer else "System / Unknown"
        recent_activity.append({
            "id": str(ev.id),
            "type": "EVENT_SUBMISSION",
            "title": f"Event Posted: {ev.title}",
            "description": f"Organizer {org_email} posted '{ev.title}' (Status: {ev.status})",
            "timestamp": ev.created_at.isoformat() if hasattr(ev, "created_at") and ev.created_at else None,
        })

    recent_activity.sort(key=lambda x: x["timestamp"] or "", reverse=True)

    return {
        "summary": summary,
        "events_by_status": dict(events_by_status),
        "registrations_by_status": dict(registrations_by_status),
        "user_growth": user_growth,
        "event_growth": event_growth,
        "registration_growth": registration_growth,
        "revenue_growth": revenue_growth,
        "recent_activity": recent_activity[:10],
    }


def build_audit_logs(limit=20):
    entries = []

    # 1. Django LogEntry items
    for log_entry in LogEntry.objects.select_related("user", "content_type").order_by("-action_time")[:limit]:
        actor_email = log_entry.user.email if log_entry.user and hasattr(log_entry.user, "email") else str(log_entry.user or "System")
        action_title = log_entry.get_action_flag_display().upper()
        rel_entity = log_entry.content_type.model.title() if log_entry.content_type else "System"
        msg = log_entry.change_message or f"{log_entry.get_action_flag_display()} operation performed on {log_entry.object_repr}"
        entries.append({
            "actor": actor_email,
            "action": action_title,
            "description": msg,
            "object_repr": log_entry.object_repr,
            "related_entity": rel_entity,
            "timestamp": log_entry.action_time,
            "details": msg,
        })

    # 2. Organizer Status Applications/Approvals/Rejections
    for user in User.objects.exclude(organizer_status=User.OrganizerStatus.NOT_APPLIED).order_by("-updated_at")[:10]:
        action_name = (
            "ORGANIZER_APPROVAL" if user.organizer_status == User.OrganizerStatus.APPROVED
            else "ORGANIZER_REJECTION" if user.organizer_status == User.OrganizerStatus.REJECTED
            else "ORGANIZER_REQUEST"
        )
        desc = (
            f"Organizer privileges granted to user {user.email}." if user.organizer_status == User.OrganizerStatus.APPROVED
            else f"Organizer request rejected for user {user.email}." if user.organizer_status == User.OrganizerStatus.REJECTED
            else f"User {user.email} submitted application for organizer privileges."
        )
        entries.append({
            "actor": user.email,
            "action": action_name,
            "description": desc,
            "object_repr": f"User ({user.email})",
            "related_entity": "User Account",
            "timestamp": user.updated_at,
            "details": desc,
        })

    # 3. User Signups
    for user in User.objects.order_by("-date_joined")[:10]:
        entries.append({
            "actor": user.email,
            "action": "USER_REGISTRATION",
            "description": f"New user {user.email} registered on the platform with role: {user.role}.",
            "object_repr": f"User ({user.email})",
            "related_entity": "User Account",
            "timestamp": user.date_joined,
            "details": f"Account created with role: {user.role}",
        })

    # 4. Event Submissions/Approvals
    for event in Event.objects.select_related("organizer").order_by("-created_at")[:10]:
        org_email = event.organizer.email if event.organizer else "System"
        action_type = (
            "EVENT_APPROVED" if event.status == Event.Status.APPROVED
            else "EVENT_REJECTED" if event.status == Event.Status.REJECTED
            else "EVENT_SUBMITTED"
        )
        desc = (
            f"Event listing '{event.title}' was approved for publication." if event.status == Event.Status.APPROVED
            else f"Event listing '{event.title}' was rejected during review." if event.status == Event.Status.REJECTED
            else f"Organizer {org_email} submitted event listing '{event.title}'."
        )
        entries.append({
            "actor": org_email,
            "action": action_type,
            "description": desc,
            "object_repr": f"Event ({event.title})",
            "related_entity": "Event",
            "timestamp": event.created_at if hasattr(event, "created_at") and event.created_at else None,
            "details": desc,
        })

    # 5. Registrations
    for reg in Registration.objects.select_related("event", "participant").order_by("-registration_date")[:10]:
        part_email = reg.participant.email if reg.participant else "System"
        ev_title = reg.event.title if reg.event else "Unknown Event"
        entries.append({
            "actor": part_email,
            "action": "TICKET_REGISTRATION",
            "description": f"Participant {part_email} registered for event '{ev_title}' (Status: {reg.status}).",
            "object_repr": f"Registration #{reg.id}",
            "related_entity": "Registration",
            "timestamp": reg.registration_date,
            "details": f"Ticket type: {reg.ticket_type}, Status: {reg.status}",
        })

    # Deduplicate and sort chronologically by timestamp
    entries.sort(key=lambda x: x["timestamp"].isoformat() if hasattr(x["timestamp"], "isoformat") else str(x["timestamp"] or ""), reverse=True)
    return entries[:limit]
