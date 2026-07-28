from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()


class IsOrganizerUser(BasePermission):
    """
    Allows access to authenticated users with role ORGANIZER **or** ADMIN.

    Bug fix: previously blocked admin users entirely. Admins must be able
    to view, edit, and manage all events through organizer endpoints.
    """
    message = "Only approved organizers or admins are authorized to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in (User.Role.ORGANIZER, User.Role.ADMIN)
