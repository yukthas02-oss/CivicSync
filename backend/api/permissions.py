from rest_framework import permissions
from .models import UserRole

class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to Admin users or Django superusers."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role == UserRole.ADMIN or request.user.is_staff or request.user.is_superuser)
        )

class IsUniversityUserRole(permissions.BasePermission):
    """Allows access only to registered Universities."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role == UserRole.UNIVERSITY or request.user.is_staff)
        )

class IsIndustryUserRole(permissions.BasePermission):
    """Allows access only to registered Industry Partners."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role == UserRole.INDUSTRY or request.user.is_staff)
        )

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to allow owners of an object or admins to edit it.
    Read permissions are allowed to any request.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRole.ADMIN or request.user.is_staff:
            return True
        if hasattr(obj, 'reported_by'):
            return obj.reported_by == request.user
        if hasattr(obj, 'proposed_by'):
            return obj.proposed_by == request.user
        if hasattr(obj, 'author'):
            return obj.author == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
