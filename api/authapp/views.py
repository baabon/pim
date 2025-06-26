from django.conf import settings
from django.utils.timezone import now
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView

# Importaciones para la autenticación de Google OAuth2
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Importaciones para drf-spectacular
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers

# Modelos, serializadores y permisos personalizados de tu aplicación
from .models import AppUser, AppUserRole
from .serializers import AppUserSerializer, AppTokenObtainPairSerializer, AppTokenRefreshSerializer
from .permissions import IsAdminAppUser, IsActiveAppUser

# Importación para el blacklisting de tokens, necesario para 'perform_update'
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken


# Obtiene el ID de cliente de Google desde la configuración de Django
CLIENT_ID = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']

@extend_schema(
    summary="Obtener tokens JWT de acceso y refresco.",
    description="""
    Permite a los usuarios autenticarse con sus credenciales (email y contraseña)
    y obtener un par de tokens JWT: un token de acceso (de corta duración)
    y un token de refresco (de larga duración).
    El token de acceso se usa para autenticar futuras solicitudes a la API.
    """,
    request=AppTokenObtainPairSerializer,
    responses={
        200: {
            'type': 'object',
            'properties': {
                'access': {'type': 'string', 'description': 'Token de acceso JWT'},
                'refresh': {'type': 'string', 'description': 'Token de refresco JWT'},
            }
        },
        400: {'description': 'Credenciales inválidas o datos de solicitud incompletos.'},
        401: {'description': 'No autorizado. Las credenciales proporcionadas no son válidas.'},
    },
    tags=['Authentication']
)
class AppTokenObtainPairView(TokenObtainPairView):
    """
    Vista para la obtención de pares de tokens JWT (acceso y refresco).

    Extiende la vista estándar de Simple JWT para usar un serializador personalizado
    (`AppTokenObtainPairSerializer`) que permite adaptar la lógica de autenticación
    (e.g., usar email en lugar de username).

    URL: /v1/token/
    Método: POST
    """
    serializer_class = AppTokenObtainPairSerializer

@extend_schema(
    summary="Refrescar el token de acceso JWT.",
    description="""
    Utiliza un token de refresco JWT válido para obtener un nuevo token de acceso.
    Esto es útil cuando el token de acceso actual ha expirado, evitando que el usuario tenga
    que iniciar sesión nuevamente con sus credenciales.
    """,
    request=AppTokenRefreshSerializer,
    responses={
        200: {
            'type': 'object',
            'properties': {
                'access': {'type': 'string', 'description': 'Nuevo token de acceso JWT'},
            }
        },
        400: {'description': 'Token de refresco inválido o expirado.'},
    },
    tags=['Authentication']
)
class AppTokenRefreshView(TokenRefreshView):
    """
    Vista para la refrescar tokens de acceso JWT utilizando un token de refresco.

    Extiende la vista estándar de Simple JWT para usar un serializador personalizado
    (`AppTokenRefreshSerializer`). Permite obtener un nuevo token de acceso cuando
    el actual ha expirado, utilizando un token de refresco válido.

    URL: /v1/token/refresh/
    Método: POST
    """
    serializer_class = AppTokenRefreshSerializer

@extend_schema(
    summary="Autenticación de usuario mediante Google OAuth2 ID Token.",
    description="""
    Permite a los usuarios iniciar sesión o registrarse utilizando un ID Token de Google.
    - Si el usuario ya existe (basado en el `google_id`), sus datos se actualizan.
    - Si es un nuevo usuario, se crea una cuenta `AppUser` con un rol predeterminado.
    Tras una autenticación exitosa, se generan y devuelven tokens JWT locales (acceso y refresco).
    """,
    request=inline_serializer(
        name='GoogleIDTokenInput',
        fields={
            'token': serializers.CharField(
                help_text="ID Token de Google proporcionado por el frontend."
            )
        }
    ),
    responses={
        200: {
            'type': 'object',
            'properties': {
                'access': {'type': 'string', 'description': 'Token de acceso JWT local'},
                'refresh': {'type': 'string', 'description': 'Token de refresco JWT local'},
                'user_id': {'type': 'integer', 'description': 'ID del usuario'},
                'email': {'type': 'string', 'description': 'Email del usuario'},
                'picture': {'type': 'string', 'description': 'URL de la imagen de perfil del usuario'},
                'full_name': {'type': 'string', 'description': 'Nombre completo del usuario'},
                'role_id': {'type': 'string', 'description': 'Código del rol del usuario'},
                'is_active': {'type': 'boolean', 'description': 'Estado de actividad del usuario'},
            }
        },
        400: {'description': 'Token de Google no proporcionado en la solicitud.'},
        401: {'description': 'ID Token de Google inválido o no verificado.'},
        403: {'description': 'Usuario inactivo (no se pueden generar tokens).'},
        500: {'description': 'Error interno del servidor durante el proceso de autenticación.'},
    },
    examples=[
        OpenApiExample(
            'Ejemplo de Solicitud de Google Login',
            value={
                'token': 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjAwZGVmN2RhNTY3ODkwZWZmMWExMmJjN...'
            },
            request_only=True,
            summary='Solicitud con un ID Token de Google.'
        ),
        OpenApiExample(
            'Ejemplo de Respuesta Exitosa',
            value={
                'access': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzI...',
                'refresh': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVz...' ,
                'user_id': 1,
                'email': 'usuario@example.com',
                'picture': 'https://lh3.googleusercontent.com/a/AItb_...',
                'full_name': 'Nombre Completo del Usuario',
                'role_id': 'default_user',
                'is_active': True,
            },
            response_only=True,
            summary='Respuesta exitosa con tokens JWT y datos de usuario.'
        ),
    ],
    tags=['Authentication', 'OAuth2']
)
class GoogleLoginView(APIView):
    """
    Vista para la autenticación de usuarios mediante Google OAuth2 ID Tokens.

    Permite a los usuarios iniciar sesión o registrarse utilizando sus credenciales de Google.
    Si el usuario ya existe (basado en el google_id), sus datos se actualizan.
    Si es un nuevo usuario, se crea una cuenta `AppUser` con un rol predeterminado.
    Tras una autenticación exitosa, se generan y devuelven tokens JWT locales (acceso y refresco).

    URL: /v1/auth/google/
    Método: POST
    """
    # Esta vista no requiere autenticación previa para acceder a ella, ya que es el punto de entrada.
    permission_classes = []

    def post(self, request):
        """
        Maneja la solicitud POST para autenticar con un ID Token de Google.

        Parámetros del cuerpo de la solicitud:
        - `token` (string): El ID Token de Google proporcionado por el frontend.

        Respuestas:
        - HTTP 200 OK: Autenticación exitosa. Devuelve los tokens JWT de acceso y refresco locales,
                       junto con información básica del usuario.
        - HTTP 400 Bad Request: Si el token no es proporcionado en la solicitud.
        - HTTP 401 Unauthorized: Si el token de Google es inválido o no puede ser verificado.
        - HTTP 403 Forbidden: Si el usuario autenticado está inactivo.
        """
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token no proporcionado"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verifica el ID Token de Google usando la biblioteca oficial de Google.
            # Esto valida que el token es auténtico y fue emitido para esta aplicación.
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
            email = idinfo.get('email')

            # Intenta obtener el rol predeterminado para nuevos usuarios o usuarios sin rol
            default_role = AppUserRole.objects.filter(code='default_user').first()
            # Si no existe el rol predeterminado, se podría crear o manejar el error
            if not default_role:
                # Considera añadir un log o raise un error más específico aquí si default_user es crítico
                pass

            # Busca un usuario existente por su 'google_id' o crea uno nuevo.
            user, created = AppUser.objects.get_or_create(
                google_id=idinfo['sub'],
                defaults={
                    'email': email,
                    'firstname': idinfo.get('given_name', ''),
                    'lastname': idinfo.get('family_name', ''),
                    'full_name': idinfo.get('name', ''),
                    'picture': idinfo.get('picture', ''),
                    'locale': idinfo.get('locale', ''),
                    'domain': idinfo.get('hd', ''),
                    'last_login': now(),
                    'is_active': True,
                    'role': default_role
                }
            )

            # Si el usuario ya existía, actualiza sus datos con la información más reciente de Google
            if not created:
                user.email = email
                user.firstname = idinfo.get('given_name', '')
                user.lastname = idinfo.get('family_name', '')
                user.full_name = idinfo.get('name', '')
                user.picture = idinfo.get('picture', '')
                user.locale = idinfo.get('locale', '')
                user.domain = idinfo.get('hd', '')
                user.last_login = now()
                # Asegura que el usuario tenga un rol si por alguna razón no lo tiene
                if not user.role:
                    user.role = default_role
                user.save()

            # Verifica si el usuario está activo antes de generar los tokens JWT
            if not user.is_active:
                return Response({"error": "Usuario inactivo."}, status=status.HTTP_403_FORBIDDEN)

            # Genera los tokens JWT (access y refresh) para el usuario autenticado localmente
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.id,
                'email': user.email,
                'picture': user.picture,
                'full_name': user.full_name,
                'role_id': user.role.code,
                'is_active': user.is_active,
            })

        except ValueError:
            return Response({"error": "Token inválido"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    summary="Listar usuarios de la aplicación o el propio perfil.",
    description="""
    Permite a los administradores ver todos los usuarios registrados en el sistema.
    Otros usuarios autenticados (no administradores) solo pueden ver los detalles de su propio perfil.
    """,
    responses={
        200: AppUserSerializer(many=True),
        401: {'description': 'No autenticado.'},
        403: {'description': 'No tiene los permisos para acceder.'},
    },
    tags=['User Management']
)
class AppUserListView(ListAPIView):
    """
    Vista para listar usuarios de la aplicación.

    Permite a los administradores ver todos los usuarios.
    Otros usuarios solo pueden ver su propio perfil.

    URL: /v1/users/
    Método: GET
    Autenticación requerida: JWT (AppUserJWTAuthentication)
    Permisos requeridos: IsAuthenticated, IsActiveAppUser
    """
    serializer_class = AppUserSerializer
    permission_classes = [IsAuthenticated, IsActiveAppUser]

    def get_queryset(self):
        """
        Define el queryset de usuarios a devolver basado en el rol del usuario que hace la solicitud.

        Si el usuario es 'administrator', devuelve todos los usuarios.
        De lo contrario, devuelve solo el perfil del usuario autenticado.
        """
        user = self.request.user
        # Si el usuario es administrador, puede ver todos los usuarios
        if user.role and user.role.code == 'administrator':
            return AppUser.objects.all()
        else:
            # Otros usuarios solo pueden ver su propio perfil
            return AppUser.objects.filter(id=user.id)

@extend_schema(
    summary="Recuperar o actualizar detalles de un usuario específico.",
    description="""
    Permite a los administradores recuperar los detalles de cualquier perfil de usuario (GET)
    y actualizar cualquier perfil de usuario (PUT/PATCH).
    Los usuarios normales (no administradores) solo pueden recuperar y actualizar su propio perfil.
    """,
    parameters=[
        OpenApiParameter(
            name='pk',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description='ID primario del usuario.'
        ),
    ],
    request=AppUserSerializer,
    responses={
        200: AppUserSerializer,
        400: {'description': 'Datos de solicitud inválidos.'},
        401: {'description': 'No autenticado.'},
        403: {'description': 'Permiso denegado (no tiene el rol o no puede actualizar este perfil).'},
        404: {'description': 'Usuario no encontrado.'},
    },
    tags=['User Management']
)
class AppUserDetailView(RetrieveUpdateAPIView):
    """
    Vista para recuperar y actualizar detalles de un usuario específico.

    Permite a los administradores actualizar cualquier perfil de usuario.
    Los usuarios normales solo pueden actualizar su propio perfil.

    URL: /v1/users/{id}/
    Métodos: GET, PUT, PATCH
    Autenticación requerida: JWT (AppUserJWTAuthentication)
    """
    serializer_class = AppUserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return [IsAuthenticated(), IsActiveAppUser(), IsAdminAppUser()]
        return [IsAuthenticated(), IsActiveAppUser()]


    def get_queryset(self):
        """
        Define el queryset de usuarios para la operación retrieve/update.

        Si el usuario es 'administrator', puede acceder a todos los usuarios.
        De lo contrario, solo puede acceder a su propio perfil.
        """
        user = self.request.user
        # Si el usuario es administrador, puede acceder a todos los usuarios
        if user.role and user.role.code == 'administrator':
            return AppUser.objects.all()
        else:
            # Otros usuarios solo pueden acceder a su propio perfil
            return AppUser.objects.filter(id=user.id)

    def get_serializer_context(self):
        """
        Añade el objeto 'request' al contexto del serializador.
        Esto es útil para campos serializador que requieren acceso a la solicitud (e.g., para hipervínculos).
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_update(self, serializer):
        """
        Realiza la actualización del objeto usuario.

        Además de la actualización estándar, si un usuario que estaba activo
        se desactiva, se marcan todos sus tokens de Simple JWT como no válidos
        (blacklisted) para forzar el cierre de sesión.
        """
        user_obj = self.get_object()
        old_is_active = user_obj.is_active
        instance = serializer.save()

        # Si el usuario estaba activo y ahora está inactivo
        if old_is_active and not instance.is_active:
            # Marca todos los tokens emitidos para este usuario como "blacklist"
            # Esto fuerza el cierre de sesión de todas sus sesiones activas
            tokens = OutstandingToken.objects.filter(user=instance)
            for token in tokens:
                BlacklistedToken.objects.get_or_create(token=token)
