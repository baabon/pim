from django.urls import path, include
from authapp.views import AppTokenRefreshView, AppTokenObtainPairView
from .views import GoogleLoginView, AppUserListView, AppUserDetailView

urlpatterns = [
    path('accounts/', include('allauth.urls')),
    path('auth/google/', GoogleLoginView.as_view(), name='google-auth'),
    path('token/', AppTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', AppTokenRefreshView.as_view(), name='token_refresh'),
    path('users/', AppUserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', AppUserDetailView.as_view(), name='user-detail'),
]