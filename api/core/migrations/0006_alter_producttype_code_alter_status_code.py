# Generated by Django 5.2.2 on 2025-06-20 17:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_producttype_code_status_code_alter_producttype_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='producttype',
            name='code',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='status',
            name='code',
            field=models.CharField(max_length=100),
        ),
    ]
