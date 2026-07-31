"""
registrations/views.py

Stripe Checkout + Webhook views.

Endpoints:
  POST /api/payments/webhook/   — Stripe webhook (no JWT auth, verified by signature)
"""

import logging
try:
    import stripe
except ImportError:
    stripe = None
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from events.models import Event
from registrations.models import Registration
from notifications.models import Notification

logger = logging.getLogger(__name__)


def _get_attr_or_key(obj, key, default=None):
    """
    Safely extract attribute or dictionary key from a StripeObject or dict.
    Avoids calling dictionary methods like .get() directly on StripeObject instances.
    """
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    if hasattr(obj, key):
        val = getattr(obj, key, default)
        if val is not None:
            return val
    try:
        val = obj[key]
        if val is not None:
            return val
    except Exception:
        pass
    return default


def _create_notification(user, notification_type, title, message, event=None):
    """Create a single Notification record."""
    Notification.objects.create(
        user=user,
        event=event,
        notification_type=notification_type,
        title=title,
        message=message,
    )


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    """
    POST /api/payments/webhook/

    Receives Stripe webhook events.
    Signature is verified using STRIPE_WEBHOOK_SECRET.
    No JWT authentication required (Stripe calls this endpoint directly).

    Handles:
      - checkout.session.completed
        → creates or updates Registration as CONFIRMED + PAID
        → sends notifications to student and organizer
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        # ── Verify Stripe signature ───────────────────────────────────────────
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            logger.error(f"[Stripe Webhook Error] Invalid payload: {e}")
            print(f"Stripe Webhook invalid payload error: {e}")
            return Response({"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"[Stripe Webhook Error] Invalid signature: {e}")
            print(f"Stripe Webhook signature verification error: {e}")
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        event_type = _get_attr_or_key(event, "type")
        logger.info(f"[Stripe Webhook] Received webhook event type: {event_type}")
        print(f"[Stripe Webhook Debug] Received event_type: {event_type}")

        # ── Handle checkout.session.completed ─────────────────────────────────
        if event_type == "checkout.session.completed":
            event_data = _get_attr_or_key(event, "data", {})
            session = _get_attr_or_key(event_data, "object")
            self._handle_checkout_completed(session)

        return Response({"status": "ok"}, status=status.HTTP_200_OK)

    def _handle_checkout_completed(self, session):
        """
        Process a completed Stripe Checkout Session.

        Metadata stored in the session at creation time:
          - event_id    : UUID of the Event
          - user_id     : ID of the participant (CustomUser)
        """
        stripe_session_id = _get_attr_or_key(session, "id", "")
        metadata = _get_attr_or_key(session, "metadata", None)

        logger.info(f"[Stripe Webhook] Processing checkout.session.completed | Session ID: {stripe_session_id}")
        print(f"[Stripe Webhook Debug] Session ID: {stripe_session_id}")
        print(f"[Stripe Webhook Debug] Metadata object: {metadata}")

        event_id = _get_attr_or_key(metadata, "event_id")
        user_id = _get_attr_or_key(metadata, "user_id")

        logger.info(f"[Stripe Webhook] Extracted event_id: {event_id}, user_id: {user_id}")
        print(f"[Stripe Webhook Debug] Extracted event_id: {event_id}, user_id: {user_id}")

        if not metadata or not event_id or not user_id:
            logger.warning(
                f"[Stripe Webhook Early Return] Missing required metadata (event_id: {event_id}, user_id: {user_id}) for session {stripe_session_id}"
            )
            print(f"[Stripe Webhook Early Return] Missing required metadata (event_id: {event_id}, user_id: {user_id})")
            return

        # ── Load Event and User inside atomic transaction ─────────────────────
        with transaction.atomic():
            try:
                portal_event = Event.objects.select_related("organizer").get(pk=event_id)
                logger.info(f"[Stripe Webhook] Event lookup success: {portal_event.title} (ID: {portal_event.id})")
                print(f"[Stripe Webhook Debug] Event lookup success: {portal_event.title}")
            except Event.DoesNotExist:
                logger.warning(f"[Stripe Webhook Early Return] Event not found for event_id: {event_id}")
                print(f"[Stripe Webhook Early Return] Event not found for event_id: {event_id}")
                return

            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                participant = User.objects.get(pk=user_id)
                logger.info(f"[Stripe Webhook] User lookup success: {participant.email} (ID: {participant.id})")
                print(f"[Stripe Webhook Debug] User lookup success: {participant.email}")
            except User.DoesNotExist:
                logger.warning(f"[Stripe Webhook Early Return] User not found for user_id: {user_id}")
                print(f"[Stripe Webhook Early Return] User not found for user_id: {user_id}")
                return

            # ── Extract payment details ───────────────────────────────────────
            payment_intent_id = _get_attr_or_key(session, "payment_intent", "")
            amount_total = _get_attr_or_key(session, "amount_total", 0)
            currency = _get_attr_or_key(session, "currency", "inr")
            paid_amount = Decimal(str(amount_total)) / Decimal("100")

            # ── Create or update Registration (idempotent) ────────────────────
            existing = Registration.objects.filter(
                event=portal_event,
                participant=participant,
            ).first()

            if existing:
                if existing.payment_status == Registration.PaymentStatus.PAID:
                    logger.info(
                        f"[Stripe Webhook Early Return] Registration {existing.id} is already paid. Skipping duplicate webhook."
                    )
                    print(f"[Stripe Webhook Early Return] Registration already paid for event {portal_event.id} and user {participant.id}")
                    return

                existing.status = Registration.Status.CONFIRMED
                existing.payment_status = Registration.PaymentStatus.PAID
                existing.stripe_session_id = stripe_session_id
                existing.payment_intent = payment_intent_id
                existing.paid_amount = paid_amount
                existing.currency = currency
                existing.paid_at = timezone.now()
                existing.save(update_fields=[
                    "status", "payment_status", "stripe_session_id",
                    "payment_intent", "paid_amount", "currency", "paid_at",
                ])
                reg = existing
                logger.info(f"[Stripe Webhook] Registration UPDATED to CONFIRMED + PAID (Registration ID: {reg.id})")
                print(f"[Stripe Webhook Debug] Registration UPDATED to CONFIRMED + PAID (Registration ID: {reg.id})")
            else:
                reg = Registration.objects.create(
                    event=portal_event,
                    participant=participant,
                    status=Registration.Status.CONFIRMED,
                    payment_status=Registration.PaymentStatus.PAID,
                    stripe_session_id=stripe_session_id,
                    payment_intent=payment_intent_id,
                    paid_amount=paid_amount,
                    currency=currency,
                    paid_at=timezone.now(),
                )
                logger.info(f"[Stripe Webhook] Registration CREATED with CONFIRMED + PAID (Registration ID: {reg.id})")
                print(f"[Stripe Webhook Debug] Registration CREATED with CONFIRMED + PAID (Registration ID: {reg.id})")

            # ── Send notifications ────────────────────────────────────────────
            organizer = portal_event.organizer
            event_title = portal_event.title

            _create_notification(
                user=participant,
                event=portal_event,
                notification_type=Notification.NotificationType.REGISTRATION,
                title="Registration Confirmed",
                message=f"Your registration for '{event_title}' is confirmed. Payment of {currency.upper()} {paid_amount} received.",
            )

            _create_notification(
                user=participant,
                event=portal_event,
                notification_type=Notification.NotificationType.PAYMENT_RECEIVED,
                title="Payment Received",
                message=f"Payment of {currency.upper()} {paid_amount} for '{event_title}' has been received successfully.",
            )

            _create_notification(
                user=organizer,
                event=portal_event,
                notification_type=Notification.NotificationType.NEW_REGISTRATION,
                title="New Registration",
                message=f"New paid registration received for '{event_title}'.",
            )

            _create_notification(
                user=organizer,
                event=portal_event,
                notification_type=Notification.NotificationType.PAYMENT_RECEIVED,
                title="Payment Received",
                message=f"Payment of {currency.upper()} {paid_amount} received for '{event_title}' from {participant.email}.",
            )
