from django.db import models
from authapp.models import AppUser

class ProductType(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Product Type {self.id}"

class Status(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Status {self.id}"

class Product(models.Model):
    id = models.AutoField(primary_key=True)
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    product_type = models.ForeignKey(ProductType, related_name='products_by_type', null=True, on_delete=models.SET_NULL)
    status = models.ForeignKey(Status, related_name='products_by_status', null=True, on_delete=models.SET_NULL)
    published = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)
    short_description = models.CharField(max_length=193, null=True, blank=True)
    specifications = models.TextField(null=True, blank=True)
    applications = models.TextField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    area = models.CharField(max_length=100, null=True, blank=True)
    area_code = models.IntegerField()
    family = models.CharField(max_length=100, null=True, blank=True)
    family_code = models.IntegerField()
    subfamily = models.CharField(max_length=100, null=True, blank=True)
    subfamily_code = models.IntegerField()
    url = models.TextField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Product {self.id}"

    @property
    def is_authenticated(self):
        return True

class UserFamilyAssignment(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='family_assignments')
    area_id = models.IntegerField()
    family_id = models.IntegerField()
    subfamily_id = models.IntegerField()

    class Meta:
        unique_together = ('user', 'subfamily_id')

    def __str__(self):
        return f'UserFamilyAssignment user={self.user.email} subfamily={self.subfamily_id}'

class ProductCountry(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='country_settings')
    country_code = models.CharField(max_length=2)
    enabled = models.BooleanField(default=True)
    sellable = models.BooleanField(default=True)
    category_code = models.CharField(max_length=100, blank=True, null=True)
    category = models.TextField(blank=True, null=True)
    related = models.TextField(blank=True, null=True)
    substitute = models.TextField(blank=True)

    class Meta:
        unique_together = ('product', 'country_code')

    def __str__(self):
        return f"{self.product.name} ({self.country_code})"

class ProductVideo(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='product_videos')
    youtube_url = models.URLField(max_length=200, unique=False, null=False, blank=False)
    order = models.PositiveIntegerField(default=0, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ('product', 'youtube_url')

    def __str__(self):
        return f"Video for {self.product.name}: {self.title or self.youtube_url}"

class ProductWorkflow(models.Model):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='workflow_entries')
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='user_workflows')
    old_status = models.ForeignKey(Status, related_name='workflow_old_statuses', null=True, on_delete=models.SET_NULL)
    new_status = models.ForeignKey(Status, related_name='workflow_new_statuses', null=True, on_delete=models.SET_NULL)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Workflow for {self.product.name} by {self.user.email} - {self.new_status.name if self.new_status else 'No Status'}"
