from rest_framework import permissions


class IsAuthenticated(permissions.BasePermission):
    """
    Allows API access for authenticated user
    """
    def has_object_permission(self, request, view, obj):
        if not request.auth:
            return False
        return True
    
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return True
    

class IsAdmin(permissions.BasePermission):
    """
    Allows API access for staff member.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_staff:
            return False
        return True
    
    def has_permission(self, request, view, obj):
        if not request.user.is_staff:
            return False
        return True
