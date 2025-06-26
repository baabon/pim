from django.urls import path
from . import views
from .views import ProductListView, ProductDetailView, UserFamilyAssignmentUpdateView, ProductStatusUpdateView, ProductHistoryView, ProductVideoListView, ProductVideoDetailView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/status/update/', ProductStatusUpdateView.as_view(), name='product-status-update'),
    path('products/<int:product_pk>/videos/', ProductVideoListView.as_view(), name='product-videos-list-create'),
    path('products/<int:product_pk>/videos/<int:pk>/', ProductVideoDetailView.as_view(), name='product-video-detail'),
    path('products/<int:pk>/history/', ProductHistoryView.as_view(), name='product-history'),
    path('users/<int:user_id>/families/assign', UserFamilyAssignmentUpdateView.as_view(), name='user-family-assignment-update'),
]