from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    """
    A form that creates a user, with no privileges, from the given email and password.
    """
    class Meta:
        model = CustomUser
        fields = ("email", "first_name", "last_name")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email


class CustomUserChangeForm(UserChangeForm):
    """
    A form for updating users. Includes all the fields on the user,
    but replaces the password field with Django's password hash display.
    """
    class Meta:
        model = CustomUser
        fields = ("email", "first_name", "last_name", "phone_number", "profile_image", "role", "organizer_status", "is_active", "is_staff")
