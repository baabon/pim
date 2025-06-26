from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import AppUserRole

@receiver(post_migrate)
def insert_initial_values(sender, **kwargs):
    if sender.name == "authapp":
        roles = [
            ("administrator", "Administrator"),
            ("product_manager", "Product Manager"),
            ("default_user", "Default User"),
        ]
        for code, name in roles:
            AppUserRole.objects.get_or_create(code=code, defaults={'name': name})