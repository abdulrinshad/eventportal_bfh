from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ProfileSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
    OrganizerApplySerializer,
    AdminOrganizerRequestSerializer,
)
from .utils import generate_and_send_email_otp
from .models import EmailOTP
from .permissions import IsStudentUser, IsAdminRole



class RegisterAPIView(APIView):
    """
    API View to handle student registration with OTP generation and dispatch.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            generate_and_send_email_otp(user)
            return Response(
                {
                    "success": True,
                    "message": "Registration successful. OTP sent to your email.",
                    "email": user.email,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailOTPAPIView(APIView):
    """
    API View to verify registration OTP code.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp_code = request.data.get("otp")

        if not email or not otp_code:
            return Response(
                {"success": False, "message": "Email and OTP code are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        try:
            user = User.objects.get(email=email.lower().strip())
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Retrieve active unused verification OTPs
        otps = EmailOTP.objects.filter(
            user=user,
            otp_code=otp_code,
            purpose="EMAIL_VERIFICATION",
            is_used=False,
        )

        if not otps.exists():
            return Response(
                {"success": False, "message": "Invalid or expired verification code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_obj = otps.first()
        if otp_obj.is_expired():
            return Response(
                {"success": False, "message": "Verification code has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()

        # Invalidate other registration OTPs
        EmailOTP.objects.filter(user=user, purpose="EMAIL_VERIFICATION", is_used=False).update(is_used=True)

        # Activate user and verify email
        user.is_active = True
        user.is_email_verified = True
        user.save()

        return Response(
            {"success": True, "message": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )


class ResendEmailOTPAPIView(APIView):
    """
    API View to resend email verification OTP.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response(
                {"success": False, "message": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        try:
            user = User.objects.get(email=email.lower().strip())
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Generate and send new OTP (invalidates old ones automatically)
        generate_and_send_email_otp(user)

        return Response(
            {"success": True, "message": "OTP resent successfully."},
            status=status.HTTP_200_OK,
        )


class LoginAPIView(APIView):
    """
    API View to handle student and organizer login.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "success": True,
                    "message": "Login successful.",
                    "data": {
                        "user": {
                            "id": str(user.id),
                            "email": user.email,
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "role": user.role,
                            "organizer_status": user.organizer_status,
                            "is_email_verified": user.is_email_verified,
                        },
                        "tokens": {
                            "access": str(refresh.access_token),
                            "refresh": str(refresh),
                        },
                    },
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileAPIView(APIView):
    """
    API View to retrieve authenticated user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = ProfileSerializer(request.user, context={"request": request})
        return Response(
            {
                "success": True,
                "message": "Profile retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class UpdateProfileAPIView(APIView):
    """
    API View to update authenticated user's profile.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        return self.update(request, partial=False)

    def patch(self, request, *args, **kwargs):
        return self.update(request, partial=True)

    def update(self, request, partial=False):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=partial,
            context={"request": request}
        )
        if serializer.is_valid():
            user = serializer.save()
            response_serializer = ProfileSerializer(user, context={"request": request})
            return Response(
                {
                    "success": True,
                    "message": "Profile updated successfully.",
                    "data": response_serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordAPIView(APIView):
    """
    API View to change the authenticated user's password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response(
                {
                    "success": True,
                    "message": "Password changed successfully."
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutAPIView(APIView):
    """
    API View to logout user by blacklisting their refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            try:
                refresh_token = serializer.validated_data["refresh"]
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {
                        "success": True,
                        "message": "Logout successful."
                    },
                    status=status.HTTP_200_OK
                )
            except TokenError:
                return Response(
                    {
                        "success": False,
                        "message": "Invalid refresh token."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrganizerApplyAPIView(APIView):
    """
    API View to handle student application to become an organizer.
    """
    permission_classes = [IsAuthenticated, IsStudentUser]

    def post(self, request, *args, **kwargs):
        serializer = OrganizerApplySerializer(
            request.user, 
            data=request.data, 
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "success": True,
                    "message": "Organizer application submitted successfully.",
                    "data": {
                        "organizer_status": request.user.organizer_status,
                        "role": request.user.role,
                    }
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrganizerStatusAPIView(APIView):
    """
    API View to retrieve the organizer application status of the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        # Determine descriptive status message
        status_messages = {
            user.OrganizerStatus.NOT_APPLIED: "You have not applied to become an organizer yet.",
            user.OrganizerStatus.PENDING: "Your organizer application is currently pending review.",
            user.OrganizerStatus.APPROVED: "Your organizer application has been approved.",
            user.OrganizerStatus.REJECTED: "Your organizer application was rejected.",
        }
        msg = status_messages.get(user.organizer_status, "Unknown application status.")
        
        return Response(
            {
                "success": True,
                "message": msg,
                "organizer_status": user.organizer_status,
                "role": user.role,
                "data": {
                    "organizer_status": user.organizer_status,
                    "role": user.role,
                    "message": msg,
                }
            },
            status=status.HTTP_200_OK
        )


class AdminOrganizerRequestListAPIView(APIView):
    """
    API View to list all organizer application requests.
    Accessible only to users with the ADMIN role.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        status_filter = request.query_params.get("status", "PENDING").upper()
        User = get_user_model()
        
        valid_statuses = [User.OrganizerStatus.PENDING, User.OrganizerStatus.APPROVED, User.OrganizerStatus.REJECTED]
        
        if status_filter == "ALL":
            queryset = User.objects.filter(organizer_status__in=valid_statuses)
        elif status_filter in valid_statuses:
            queryset = User.objects.filter(organizer_status=status_filter)
        else:
            # Default to PENDING
            queryset = User.objects.filter(organizer_status=User.OrganizerStatus.PENDING)
            
        queryset = queryset.order_by("-date_joined")
        serializer = AdminOrganizerRequestSerializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Organizer requests retrieved successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class AdminOrganizerApproveAPIView(APIView):
    """
    API View to approve an organizer application request.
    Accessible only to users with the ADMIN role.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, user_id, *args, **kwargs):
        User = get_user_model()
        try:
            target_user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {
                    "success": False,
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if target_user.organizer_status != User.OrganizerStatus.PENDING:
            return Response(
                {
                    "success": False,
                    "message": f"Cannot approve application. Current organizer status is '{target_user.organizer_status}'."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user.organizer_status = User.OrganizerStatus.APPROVED
        target_user.role = User.Role.ORGANIZER
        target_user.save()

        serializer = AdminOrganizerRequestSerializer(target_user)
        return Response(
            {
                "success": True,
                "message": "Organizer request approved successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


class AdminOrganizerRejectAPIView(APIView):
    """
    API View to reject an organizer application request.
    Accessible only to users with the ADMIN role.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, user_id, *args, **kwargs):
        User = get_user_model()
        try:
            target_user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {
                    "success": False,
                    "message": "User not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if target_user.organizer_status != User.OrganizerStatus.PENDING:
            return Response(
                {
                    "success": False,
                    "message": f"Cannot reject application. Current organizer status is '{target_user.organizer_status}'."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        target_user.organizer_status = User.OrganizerStatus.REJECTED
        target_user.role = User.Role.STUDENT
        target_user.save()

        serializer = AdminOrganizerRequestSerializer(target_user)
        return Response(
            {
                "success": True,
                "message": "Organizer request rejected successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )


from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import SiteSettings, CompanyValue, Feature, TeamMember, Partner, ContactEnquiry
from .serializers_cms import (
    SiteSettingsSerializer,
    CompanyValueSerializer,
    FeatureSerializer,
    TeamMemberSerializer,
    PartnerSerializer,
    ContactEnquirySerializer,
)

class PublicSiteSettingsView(APIView):
    """
    GET /api/public/site-settings/
    Returns global website configurations and CMS dynamic sections.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            settings_obj = SiteSettings.objects.create()

        settings_data = SiteSettingsSerializer(settings_obj, context={"request": request}).data
        values_data = CompanyValueSerializer(CompanyValue.objects.all(), many=True).data
        features_data = FeatureSerializer(Feature.objects.all(), many=True).data
        team_data = TeamMemberSerializer(TeamMember.objects.all(), many=True, context={"request": request}).data
        partners_data = PartnerSerializer(Partner.objects.all(), many=True, context={"request": request}).data

        data = {
            "settings": settings_data,
            "values": values_data,
            "features": features_data,
            "team": team_data,
            "partners": partners_data,
        }
        return Response(
            {
                "success": True,
                "message": "Site settings and content retrieved successfully.",
                "data": data
            },
            status=status.HTTP_200_OK
        )


class ContactEnquiryCreateView(generics.CreateAPIView):
    """
    POST /api/public/contact-enquiry/
    Submit contact form enquiry.
    """
    permission_classes = [AllowAny]
    serializer_class = ContactEnquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                "success": True,
                "message": "Your enquiry has been submitted successfully. Our team will get back to you shortly.",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

