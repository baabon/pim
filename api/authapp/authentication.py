from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import AppUser

class AppUserJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
            user = AppUser.objects.get(id=user_id)
        except AppUser.DoesNotExist:
            raise exceptions.AuthenticationFailed('Usuario no existe', code='user_not_found')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('Usuario inactivo', code='user_inactive')

        return user
