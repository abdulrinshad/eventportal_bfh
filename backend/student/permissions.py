from rest_framework.permissions import BasePermission


class IsStudentUser(BasePermission):
    """
    Allows access only to users with role == 'STUDENT'.
    Admin users (is_staff / role==ADMIN) are also allowed so admins
    can preview student-facing endpoints during development.
    """

    message = "Only student accounts can access this endpoint."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, "role", None) in ("STUDENT", "ADMIN")
                or request.user.is_staff
            )
        )
