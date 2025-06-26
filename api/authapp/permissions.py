from rest_framework.permissions import BasePermission

class IsAdminAppUser(BasePermission):
    """
    Permite el acceso solo a usuarios autenticados que tengan is_admin=True.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and
            user.is_authenticated and
            user.role is not None and
            user.role.code == 'administrator'
        )

class IsActiveAppUser(BasePermission):
    """
    Permite el acceso solo a usuarios autenticados que tengan is_active=True.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, 'is_active', False))
