from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    ProfileAPIView,
    UpdateProfileAPIView,
    ChangePasswordAPIView,
    LogoutAPIView,
    VerifyEmailOTPAPIView,
    ResendEmailOTPAPIView,
    OrganizerApplyAPIView,
    OrganizerStatusAPIView,
    AdminOrganizerRequestListAPIView,
    AdminOrganizerApproveAPIView,
    AdminOrganizerRejectAPIView,
)

urlpatterns = [
    path("auth/register/", RegisterAPIView.as_view(), name="register"),
    path("auth/login/", LoginAPIView.as_view(), name="login"),
    path("auth/profile/", ProfileAPIView.as_view(), name="profile"),
    path("auth/profile/update/", UpdateProfileAPIView.as_view(), name="profile_update"),
    path("auth/change-password/", ChangePasswordAPIView.as_view(), name="change_password"),
    path("auth/logout/", LogoutAPIView.as_view(), name="logout"),
    path("auth/verify-email-otp/", VerifyEmailOTPAPIView.as_view(), name="verify_email_otp"),
    path("auth/resend-email-otp/", ResendEmailOTPAPIView.as_view(), name="resend_email_otp"),
    path("auth/organizer/apply/", OrganizerApplyAPIView.as_view(), name="organizer_apply"),
    path("auth/organizer/status/", OrganizerStatusAPIView.as_view(), name="organizer_status"),
    path("admin/organizer-requests/", AdminOrganizerRequestListAPIView.as_view(), name="admin_organizer_requests_list"),
    path("admin/organizer-requests/<uuid:user_id>/approve/", AdminOrganizerApproveAPIView.as_view(), name="admin_organizer_approve"),
    path("admin/organizer-requests/<uuid:user_id>/reject/", AdminOrganizerRejectAPIView.as_view(), name="admin_organizer_reject"),
]


