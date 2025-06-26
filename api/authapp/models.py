from django.db import models

class AppUserRole(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"User Role {self.code}"


class AppUser(models.Model):
    google_id = models.CharField(max_length=50, unique=True)
    email = models.CharField(max_length=255, unique=True)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    picture = models.CharField(max_length=500)
    locale = models.CharField(max_length=10, null=True, blank=True)
    domain = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    role = models.ForeignKey(AppUserRole, on_delete=models.SET_NULL, null=True, blank=True)
    last_login = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User {self.email}"

    @property
    def is_authenticated(self):
        return True
        