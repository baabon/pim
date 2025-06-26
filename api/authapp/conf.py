import json
from pathlib import Path
from django.conf import settings
from datetime import timedelta
import os
import re

INSTALLED_APPS_AUTH = [
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "authapp.apps.AuthAppConfig",
    'drf_spectacular',
]

SITE_ID = 1

MIDDLEWARE_AUTH = [
    'allauth.account.middleware.AccountMiddleware',
]

BASE_DIR = Path(__file__).resolve().parent.parent

GOOGLE_OAUTH_JSON_PATH = BASE_DIR / "secrets/google_oauth_credentials.json"

with open(GOOGLE_OAUTH_JSON_PATH) as f:
    google_creds = json.load(f)

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': google_creds['web']['client_id'],
            'secret': google_creds['web']['client_secret'],
            'key': ''
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
    }
}

REST_FRAMEWORK_AUTH = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'authapp.authentication.AppUserJWTAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

def parse_duration(s):
    match = re.match(r'(\d+)([dhms])', s)
    if not match:
        return timedelta()
    value, unit = match.groups()
    value = int(value)
    if unit == 'd':
        return timedelta(days=value)
    if unit == 'h':
        return timedelta(hours=value)
    if unit == 'm':
        return timedelta(minutes=value)
    if unit == 's':
        return timedelta(seconds=value)
    return timedelta()

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': parse_duration(os.environ.get('JWT_ACCESS_TOKEN_LIFETIME', '12h')),
    'REFRESH_TOKEN_LIFETIME': parse_duration(os.environ.get('JWT_REFRESH_TOKEN_LIFETIME', '7d')),
    'BLACKLIST_AFTER_ROTATION': True,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Product Information Management API',
    'DESCRIPTION': 'Documentación de la API para el proyecto Django de PIM.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SECURITY': [
        {
            'BearerAuth': [],
        },
    ],
    'COMPONENTS': {
        'securitySchemes': {
            'BearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
                'description': 'Ingresa tu token JWT con el prefijo "Bearer ". Ejemplo: "Bearer eyJhbGciOiJIUzI1Ni..."',
            },
        }
    },
}