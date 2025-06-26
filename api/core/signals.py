from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import ProductType, Status

@receiver(post_migrate)
def insert_initial_values(sender, **kwargs):
    if sender.name == "core":
        tipos = [
            ("simple", "Simple"),
            ("configurable", "Configurable"),
            ("virtual", "Virtual"),
        ]
        for code, name in tipos:
            ProductType.objects.get_or_create(code=code, defaults={'name': name})

        estados = [
            ("draft", "Borrador"),
            ("editing", "En edición"),
            ("pending_approval", "Pendiente de aprobación"),
            ("published", "Publicado"),
            ("deactivated", "Desactivado"),
        ]
        for code, name in estados:
            Status.objects.get_or_create(code=code, defaults={'name': name})