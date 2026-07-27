from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"}
    )
    phone_number = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
            "phone_number",
        )

    def validate_email(self, value):
        normalized_email = value.lower().strip()
        if User.objects.filter(email=normalized_email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return normalized_email

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=email,
            password=password,
            is_active=False,
            is_email_verified=False,
            **validated_data
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"}
    )

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        # Normalize email address
        email = email.lower().strip()

        # Authenticate using email as the username field
        user = authenticate(username=email, password=password)

        if not user:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("User account is disabled.")

        data["user"] = user
        return data


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "organizer_status",
            "is_email_verified",
            "profile_image",
        )
        read_only_fields = fields


class UpdateProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True, allow_blank=False, max_length=150)
    last_name = serializers.CharField(required=True, allow_blank=False, max_length=150)
    phone_number = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "phone_number",
            "profile_image",
        )


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        user = self.context.get("request").user
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        # 1. Verify current password
        if not user.check_password(current_password):
            raise serializers.ValidationError({"current_password": "Old password is incorrect."})

        # 2. Check matching
        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})

        # 3. Check new password not same as current
        if new_password == current_password:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as the current password."})

        # 4. Strength validation
        try:
            validate_password(new_password, user=user)
        except Exception as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})

        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)


class OrganizerApplySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("organizer_status", "role")
        read_only_fields = ("organizer_status", "role")

    def validate(self, attrs):
        user = self.context["request"].user
        
        # Ensure only STUDENT role can apply
        if user.role != User.Role.STUDENT:
            raise serializers.ValidationError("Only authenticated STUDENT users can apply.")
            
        # Ensure status transitions
        if user.organizer_status == User.OrganizerStatus.PENDING:
            raise serializers.ValidationError("An organizer application is already pending.")
            
        if user.organizer_status == User.OrganizerStatus.APPROVED:
            raise serializers.ValidationError("Your organizer application has already been approved.")
            
        return attrs

    def update(self, instance, validated_data):
        instance.organizer_status = User.OrganizerStatus.PENDING
        instance.save()
        return instance


class AdminOrganizerRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "organizer_status",
            "date_joined",
        )
        read_only_fields = fields






