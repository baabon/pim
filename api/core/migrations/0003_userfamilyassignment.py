# Generated by Django 5.2.2 on 2025-06-18 00:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authapp', '0003_remove_appuser_is_admin_appuser_role'),
        ('core', '0002_product_applications_product_short_description_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserFamilyAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('area_id', models.IntegerField()),
                ('family_id', models.IntegerField()),
                ('subfamily_id', models.IntegerField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='family_assignments', to='authapp.appuser')),
            ],
            options={
                'unique_together': {('user', 'subfamily_id')},
            },
        ),
    ]
