from rest_framework import permissions
from core.models import UserFamilyAssignment
from authapp.models import AppUser 

class ProductEditPermission(permissions.BasePermission):
    """
    Permiso unificado para controlar quién puede realizar operaciones de escritura
    (POST, PUT, PATCH, DELETE) en un objeto Product.

    Reglas:
    - Métodos seguros (GET, HEAD, OPTIONS) son permitidos para cualquier usuario autenticado.
    - Los 'default_user' nunca pueden realizar operaciones de escritura.
    - Los 'administrator' tienen permiso total de escritura sobre cualquier producto.
    - Los 'product_manager' pueden escribir en un producto solo si tienen una
      UserFamilyAssignment que coincida con la subfamilia del producto.
    """

    def has_permission(self, request, view):
        # Allow read-only access for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # For write methods, user must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get user role safely
        user_role_code = None
        if hasattr(request.user, 'role') and request.user.role:
            user_role_code = request.user.role.code

        # 'default_user' cannot perform any write operations at view level
        if user_role_code == 'default_user':
            return False

        # 'administrator' has full permission at view level for write operations
        if user_role_code == 'administrator':
            return True
        
        # For 'product_manager' (and other specific roles),
        # detailed object-level validation will happen in has_object_permission.
        # At the view level, we let the request pass so has_object_permission can check the specific object.
        if user_role_code == 'product_manager':
            return True # Will be refined by has_object_permission

        return False # Deny any other roles by default for write operations


    def has_object_permission(self, request, view, obj):
        # Allow read-only access on the object for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # Ensure user is authenticated (should already be covered by has_permission for write methods)
        if not request.user or not request.user.is_authenticated:
            return False

        user_role_code = None
        if hasattr(request.user, 'role') and request.user.role:
            user_role_code = request.user.role.code

        # 'administrator' has full access to the object
        if user_role_code == 'administrator':
            return True

        # 'default_user' never has write permission on an object
        if user_role_code == 'default_user':
            return False

        # Logic for 'product_manager' and other roles with specific permissions:
        # Requires the product to have a subfamily and the user to be assigned to it.
        # `obj.subfamily_code` should be the ID of the subfamily or a relation to the subfamily.
        product_subfamily_id = obj.subfamily_code 

        if product_subfamily_id is None:
            # If the product doesn't have an assigned subfamily, no user (except admin) can edit it
            return False

        # Check if the user has any assignment for this subfamily
        user_has_subfamily_assignment = UserFamilyAssignment.objects.filter(
            user=request.user,
            subfamily_id=product_subfamily_id
        ).exists()

        return user_has_subfamily_assignment

class CanRequestProductApproval(permissions.BasePermission):
    """
    Permiso específico para la acción de "solicitar aprobación" de un producto.
    
    Reglas:
    - Un usuario no debe ser 'administrator' (ellos publican directamente).
    - Un usuario no debe ser 'default_user'.
    - El usuario debe tener permisos de edición para el producto (usando ProductEditPermission).
    - El estado actual del producto debe ser 'draft', 'editing', o 'deactivated'.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        user_role_code = None
        if hasattr(user, 'role') and user.role:
            user_role_code = user.role.code
        
        # Administrators publish directly, do not request approval
        if user_role_code == 'administrator':
            return False 
        
        # Default users cannot request approval
        if user_role_code == 'default_user':
            return False 
            
        # User must have general edit permission for the product
        # Re-use the logic from ProductEditPermission's has_object_permission
        # Create an instance to call its method.
        has_edit_permission = ProductEditPermission().has_object_permission(request, view, obj)
        if not has_edit_permission:
            return False

        # Product status must be eligible for approval request
        if obj.status and obj.status.code in ['draft', 'editing', 'deactivated']:
            return True
            
        return False