from rest_framework import serializers
from .models import AppUser, AppUserRole
from core.serializers import UserFamilyAssignmentSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

class AppTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role.code
        return token

class AppTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = RefreshToken(attrs['refresh'])
        user_id = refresh.payload.get('user_id')

        try:
            user = AppUser.objects.select_related('role').get(id=user_id)
            
            if not user.is_active:
                raise AuthenticationFailed('Usuario desactivado', code='user_inactive')

            access = refresh.access_token
            access['role'] = user.role.code
            data['access'] = str(access)
            
            data['user'] = {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'is_active': user.is_active,
                'role': user.role.code if user.role else None,
                'picture': user.picture
            }

        except AppUser.DoesNotExist:
            raise AuthenticationFailed('Usuario no encontrado', code='user_not_found')

        return data

class AppUserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUserRole
        fields = ['id', 'code', 'name']

class AppUserSerializer(serializers.ModelSerializer):
    role = AppUserRoleSerializer(read_only=True)

    role_id = serializers.PrimaryKeyRelatedField(
        source='role',
        queryset=AppUserRole.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    family_assignments = UserFamilyAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = AppUser
        fields = [
            'id', 'email', 'firstname', 'lastname', 'full_name', 'picture',
            'locale', 'domain', 'is_active', 'role', 'role_id',
            'family_assignments',
        ]

    def update(self, instance, validated_data):
        request_user = self.context['request'].user

        is_admin = request_user.role and request_user.role.code == 'administrator'

        if request_user == instance:
            # Usuario no puede desactivar ni cambiar su rol a sí mismo
            validated_data.pop('is_active', None)
            validated_data.pop('role', None)
            validated_data.pop('role_id', None)
        else:
            if not is_admin:
                # Solo admins pueden cambiar is_active o role de otros usuarios
                validated_data.pop('is_active', None)
                validated_data.pop('role', None)
                validated_data.pop('role_id', None)

        return super().update(instance, validated_data)