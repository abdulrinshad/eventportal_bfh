from django.contrib.auth import get_user_model
from rest_framework.permissions import BasePermission

User = get_user_model()


class IsOrganizerUser(BasePermission):
    """
    Grants access only to authenticated users with role=ORGANIZER.
    Admins (is_staff or role=ADMIN) are also allowed so they can
    inspect any organizer's data.
    """
    message = "Only organizers are authorized to perform this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.role == User.Role.ORGANIZER
            or request.user.role == User.Role.ADMIN
            or request.user.is_staff
        )
