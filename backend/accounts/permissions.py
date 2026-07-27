from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()

class IsStudentUser(BasePermission):
    """
    Allows access only to authenticated users with role STUDENT.
    """
    message = "Only students are authorized to perform this action."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role == User.Role.STUDENT
        )


class IsAdminRole(BasePermission):
    """
    Allows access only to authenticated users with role ADMIN.
    """
    message = "Only administrators are authorized to perform this action."

    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and (request.user.role == User.Role.ADMIN or request.user.is_staff)
        )

