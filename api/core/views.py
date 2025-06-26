from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView, RetrieveAPIView, RetrieveUpdateAPIView
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework.exceptions import PermissionDenied

# Importaciones para drf-spectacular
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, inline_serializer
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers

# Modelos, serializadores y permisos personalizados de tu aplicación
from authapp.models import AppUser
from .models import Product, UserFamilyAssignment, Status, ProductWorkflow, ProductVideo
from .serializers import ProductSerializer, UserFamilyAssignmentSerializer, StatusSerializer, ProductWorkflowSerializer, ProductVideoSerializer
from authapp.permissions import IsActiveAppUser, IsAdminAppUser
from core.permissions import ProductEditPermission, CanRequestProductApproval

@extend_schema(
    summary="Obtener el historial de flujo de trabajo de un producto específico.",
    tags=['Products - History']
)
class ProductHistoryView(ListAPIView):
    serializer_class = ProductWorkflowSerializer
    permission_classes = [IsAuthenticated, IsActiveAppUser]

    def get_queryset(self):
        product_pk = self.kwargs.get('pk')
        if not product_pk:
            raise Http404("No se proporcionó el PK del producto para la vista de historial.")
        product = get_object_or_404(Product, pk=product_pk)
        return ProductWorkflow.objects.filter(product=product).order_by('-id')

@extend_schema(
    summary="Listar, crear y reemplazar videos para un producto.",
    description="""
    **GET**: Retorna una lista de todos los videos de YouTube asociados a un producto.
    **POST**: Crea un **único** nuevo video para el producto especificado.
    **PUT**: **Reemplaza la lista completa** de videos para un producto. Envía un array de objetos con `youtube_url`. El `order` se asignará según la posición en el array.
    """,
    parameters=[
        OpenApiParameter(name='product_pk', type=OpenApiTypes.INT, location=OpenApiParameter.PATH, description='ID primario del producto.')
    ],
    tags=['Products - Videos']
)
class ProductVideoListView(ListCreateAPIView):
    serializer_class = ProductVideoSerializer
    permission_classes = [IsAuthenticated, IsActiveAppUser, ProductEditPermission]

    def get_queryset(self):
        product_pk = self.kwargs.get('product_pk')
        if not product_pk:
            raise Http404("ID del producto no proporcionado en la URL.")
        product = get_object_or_404(Product, pk=product_pk)
        self.check_object_permissions(self.request, product)
        return ProductVideo.objects.filter(product=product).order_by('order', 'created_at')

    def perform_create(self, serializer):
        product_pk = self.kwargs.get('product_pk')
        product = get_object_or_404(Product, pk=product_pk)
        self.check_object_permissions(self.request, product)
        
        last_video = ProductVideo.objects.filter(product=product).order_by('order').last()
        next_order = last_video.order + 1 if last_video else 0
        serializer.save(product=product, order=next_order)

    @extend_schema(
        summary="Reemplazar todos los videos de un producto.",
        description="Recibe una lista de videos. Elimina todos los videos existentes para el producto y crea los nuevos de la lista. Esta operación es atómica.",
        request=ProductVideoSerializer(many=True),
        responses={201: ProductVideoSerializer(many=True), 400: {'description': 'Datos de solicitud inválidos.'}},
        examples=[
            OpenApiExample(
                'Reemplazar lista de videos',
                value=[{"youtube_url": "https://www.youtube.com/watch?v=2ZXfV3is0HU"}, {"youtube_url": "youtu.be"}],
                request_only=True
            )
        ]
    )
    def put(self, request, *args, **kwargs):
        product_pk = self.kwargs.get('product_pk')
        product = get_object_or_404(Product, pk=product_pk)
        self.check_object_permissions(self.request, product)

        videos_data = request.data
        if not isinstance(videos_data, list):
            return Response({"detail": "Se esperaba una lista de videos."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                ProductVideo.objects.filter(product=product).delete()
                
                new_videos = []
                for index, video_data in enumerate(videos_data):
                    video_data['product'] = product.pk
                    video_data['order'] = index
                    serializer = self.get_serializer(data=video_data)
                    serializer.is_valid(raise_exception=True)
                    new_video = serializer.save(product=product)
                    new_videos.append(new_video)
            
            response_serializer = self.get_serializer(new_videos, many=True)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    summary="Obtener, actualizar o eliminar un video específico.",
    tags=['Products - Videos']
)
class ProductVideoDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProductVideoSerializer
    permission_classes = [IsAuthenticated, IsActiveAppUser, ProductEditPermission]
    lookup_url_kwarg = 'pk'
    queryset = ProductVideo.objects.all()

    def get_object(self):
        product_pk = self.kwargs.get('product_pk')
        video_pk = self.kwargs.get('pk')
        product = get_object_or_404(Product, pk=product_pk)
        video = get_object_or_404(ProductVideo, pk=video_pk, product=product)
        self.check_object_permissions(self.request, product)
        return video

@extend_schema(
    summary="Listar todos los productos.",
    tags=['Products']
)
class ProductListView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsActiveAppUser]

    def get_queryset(self):
        return Product.objects.all()

@extend_schema(
    summary="Obtener o actualizar detalles de un producto específico.",
    tags=['Products']
)
class ProductDetailView(RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsActiveAppUser, ProductEditPermission]
    lookup_field = 'pk'

@extend_schema(
    summary="Actualizar el estado y/o el estado de publicación de un producto.",
    tags=['Products - Status Management']
)
class ProductStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsActiveAppUser, ProductEditPermission]

    def patch(self, request, pk, format=None):
        product = get_object_or_404(Product, pk=pk)
        old_status = product.status
        status_code = request.data.get('status_code')
        published_status = request.data.get('published')
        custom_message = request.data.get('message', None)
        user = request.user
        user_role_code = user.role.code if hasattr(user, 'role') and user.role else None
        is_admin = (user_role_code == 'administrator')
        is_default_user = (user_role_code == 'default_user')

        # Permisos para despublicar un producto (solo administradores)
        if published_status is False and product.published is True and not is_admin:
            raise PermissionDenied("Solo los administradores pueden despublicar un producto.")

        # Permiso para cambiar a 'editing' desde 'pending_approval' (solo administradores)
        if status_code == 'editing' and product.status.code == 'pending_approval' and not is_admin:
            raise PermissionDenied("Solo los administradores pueden rechazar una solicitud de aprobación.")

        # Permiso para solicitar aprobación            
        if status_code == 'pending_approval' and not CanRequestProductApproval().has_object_permission(request, self, product):
            raise PermissionDenied("No tiene permiso para solicitar aprobación para este producto o su estado actual no es válido.")

        # Lógica para publicación (solo administradores pueden publicar)
        if published_status is True or status_code == 'published':
            if not is_admin:
                raise PermissionDenied("Solo los administradores pueden publicar un producto.")
            if published_status is True:
                product.published = True
            if status_code == 'published' and product.status.code not in ['pending_approval', 'draft', 'editing', 'deactivated']:
                return Response({"detail": f"No se puede cambiar a estado publicado desde '{product.status.code}'."}, status=status.HTTP_400_BAD_REQUEST)

        # Permiso para que usuarios básicos no regresen un producto a edición si está publicado
        if status_code == 'editing' and product.status.code == 'published' and is_default_user:
            raise PermissionDenied("Los usuarios básicos no pueden volver un producto a edición.")

        new_status_obj = None
        if status_code is not None:
            try:
                new_status_obj = Status.objects.get(code=status_code)
                product.status = new_status_obj

                if new_status_obj.code == 'deactivated':
                    product.published = False
            except Status.DoesNotExist:
                return Response({"status_code": f"El estado con código '{status_code}' no existe."}, status=status.HTTP_400_BAD_REQUEST)
        
        update_fields = [f for f, v in [('status', status_code), ('published', published_status)] if v is not None]
        if not update_fields:
            return Response({"detail": "No se proporcionaron campos válidos para actualizar."}, status=status.HTTP_400_BAD_REQUEST)

        product.save(update_fields=update_fields)

        # Crea el registro de flujo de trabajo si el estado cambió
        if new_status_obj and old_status != new_status_obj:
            final_message = custom_message if new_status_obj.code == 'editing' else None
            ProductWorkflow.objects.create(product=product, user=user, old_status=old_status, new_status=new_status_obj, message=final_message)

        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema(
    summary="Asignar subfamilias a un usuario específico (solo administradores).",
    tags=['User Management']
)
class UserFamilyAssignmentUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsActiveAppUser, IsAdminAppUser]

    def put(self, request, user_id):
        user_to_assign = get_object_or_404(AppUser, pk=user_id)
        assignments_data = request.data
        if not isinstance(assignments_data, list):
            return Response({"detail": "Se esperaba una lista de asignaciones"}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            user_to_assign.family_assignments.all().delete()
            result = []
            for item in assignments_data:
                area_id = item.get('area_id')
                family_id = item.get('family_id')
                subfamily_id = item.get('subfamily_id')
                if not all([area_id, family_id, subfamily_id]):
                    return Response({"detail": "Faltan campos requeridos en una asignación."}, status=status.HTTP_400_BAD_REQUEST)
                assignment = UserFamilyAssignment.objects.create(user=user_to_assign, area_id=area_id, family_id=family_id, subfamily_id=subfamily_id)
                result.append(assignment)
        
        serializer = UserFamilyAssignmentSerializer(result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)