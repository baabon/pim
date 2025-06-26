from rest_framework import serializers
from .models import Product, ProductType, Status, UserFamilyAssignment, ProductCountry, ProductWorkflow, ProductVideo
from authapp.models import AppUser

from rest_framework import serializers
from .models import ProductVideo, Product

class ProductVideoSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ProductVideo
        fields = [
            'id',
            'product',
            'youtube_url',
            'order',
            'created_at'
        ]
        read_only_fields = ['id', 'product', 'created_at'] 

    def validate_youtube_url(self, value):
        if "youtube.com" not in value and "youtu.be" not in value:
            raise serializers.ValidationError("La URL debe ser un enlace válido de YouTube.")
        return value

class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = ['id', 'code', 'name']

class ReadAppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = ['email', 'full_name', 'picture']

class EmailAppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = ['email']

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ['id', 'code', 'name']

class ProductCountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCountry
        fields = [
            'country_code',
            'enabled',
            'sellable',
            'category_code',
            'category',
            'related',
            'substitute',
        ]

class UserFamilyAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFamilyAssignment
        fields = ['id', 'user', 'area_id', 'family_id', 'subfamily_id']

class ProductWorkflowSerializer(serializers.ModelSerializer):
    user = ReadAppUserSerializer(read_only=True)
    old_status = StatusSerializer(read_only=True)
    new_status = StatusSerializer(read_only=True)

    class Meta:
        model = ProductWorkflow
        fields = ['id', 'product', 'user', 'old_status', 'new_status', 'message', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    product_type = ProductTypeSerializer(read_only=True)
    status = StatusSerializer(read_only=True)
    published = serializers.BooleanField(read_only=True)
    related_users = serializers.SerializerMethodField()
    country_settings = ProductCountrySerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'product_type', 'status', 'published',
            'description', 'short_description', 'specifications',
            'applications', 'brand', 'area', 'family', 'subfamily', 'url', 'created_at',
            'related_users', 'country_settings'
        ]

    def get_related_users(self, obj):
        subfamily_id_to_filter = obj.subfamily_code
        if not isinstance(subfamily_id_to_filter, (int, float)):
            return []

        matching_assignments = UserFamilyAssignment.objects.filter(
            subfamily_id=subfamily_id_to_filter
        )

        users = AppUser.objects.filter(
            family_assignments__in=matching_assignments,
            is_active=True
        ).exclude(
            role__code='administrator'
        ).distinct()

        return EmailAppUserSerializer(users, many=True).data

    def update(self, instance, validated_data):
        country_settings_data = validated_data.pop('country_settings', None)

        instance = super().update(instance, validated_data)

        if country_settings_data is not None:
            existing_settings = {setting.country_code: setting for setting in instance.country_settings.all()}
            
            incoming_country_codes = set()

            for setting_data in country_settings_data:
                country_code = setting_data.get('country_code')

                if not country_code:
                    continue
                
                incoming_country_codes.add(country_code)

                setting_instance = existing_settings.get(country_code)

                if setting_instance:
                    nested_serializer = ProductCountrySerializer(
                        instance=setting_instance,
                        data=setting_data,
                        partial=True
                    )
                    nested_serializer.is_valid(raise_exception=True)
                    nested_serializer.save()
                else:
                    ProductCountry.objects.create(product=instance, **setting_data)

            for country_code, setting_instance in existing_settings.items():
                if country_code not in incoming_country_codes:
                    setting_instance.delete()

        return instance