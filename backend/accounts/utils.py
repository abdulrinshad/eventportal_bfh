import random
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailOTP

def generate_and_send_email_otp(user):
    # Invalidate previous unused OTPs
    EmailOTP.objects.filter(user=user, purpose="EMAIL_VERIFICATION", is_used=False).update(is_used=True)

    # Generate 6-digit code
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = timezone.now() + timedelta(minutes=10)

    # Save to database
    EmailOTP.objects.create(
        user=user,
        otp_code=otp_code,
        purpose="EMAIL_VERIFICATION",
        expires_at=expires_at,
    )

    # Send Email
    subject = "Verify your EventHub account"
    message = f"Hello,\n\nYour verification code is\n\n{otp_code}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone."
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "webmaster@localhost")
    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[user.email],
        fail_silently=False,
    )
