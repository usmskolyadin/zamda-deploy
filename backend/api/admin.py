from django.contrib import admin
from .models import AdvertisementImage, AdvertisementStatus, Category, ExtraFieldOption, Notification, NotificationUserState, Report, Review, SubCategory, ExtraFieldDefinition, Advertisement, AdvertisementExtraField, UserProfile, User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

admin.site.register(UserProfile)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name','slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name','category','slug')
    list_filter = ('category',)
    prepopulated_fields = {'slug': ('name',)}


class ExtraFieldOptionInline(admin.TabularInline):
    model = ExtraFieldOption
    extra = 1

@admin.register(ExtraFieldDefinition)
class ExtraFieldDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name','key','field_type','subcategory')
    list_filter = ('subcategory__category','subcategory')
    search_fields = ('name','key')
    inlines = [ExtraFieldOptionInline] 

class AdvertisementExtraFieldInline(admin.TabularInline):
    model = AdvertisementExtraField
    extra = 0

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "field_definition":
            try:
                obj_id = request.resolver_match.kwargs.get("object_id")
                if obj_id:
                    ad = Advertisement.objects.get(pk=obj_id)
                    kwargs["queryset"] = ExtraFieldDefinition.objects.filter(
                        subcategory=ad.subcategory
                    )
            except Exception:
                pass
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


class AdvertisementImageInline(admin.TabularInline):
    model = AdvertisementImage
    extra = 1
    fields = ("image",)

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "owner",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "subcategory",
    )

    search_fields = (
        "title",
        "owner__username",
    )

    readonly_fields = (
        "owner",
        "created_at",
        "updated_at",
    )

    inlines = (
        AdvertisementImageInline,
        AdvertisementExtraFieldInline,
    )

    fieldsets = (
        ("Основное", {
            "fields": (
                "owner",
                "title",
                "description",
                "price",
                "subcategory",
                "location",
            )
        }),
        ("Модерация", {
            "fields": (
                "status",
                "reject_reason",
            )
        }),
        ("Даты", {
            "fields": (
                "created_at",
                "updated_at",
            )
        }),
    )

from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()
class NotificationAdminForm(forms.ModelForm):
    users = forms.ModelMultipleChoiceField(
        queryset=User.objects.all(),
        required=False,
        help_text="Leave empty for global notification",
    )

    class Meta:
        model = Notification
        fields = ("title", "message", "is_global")

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "is_global",
        "created_at",
        "users_count",
    )
    list_filter = ("is_global", "created_at")
    search_fields = ("title", "message")
    ordering = ("-created_at",)

    readonly_fields = ("created_at",)

    def users_count(self, obj):
        return obj.user_states.count()

    users_count.short_description = "Recipients"

@admin.register(NotificationUserState)
class NotificationUserStateAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "notification_title",
        "is_read",
        "is_deleted",
        "created_at",
    )
    list_filter = ("is_read", "is_deleted", "created_at")
    search_fields = (
        "user__email",
        "user__username",
        "notification__title",
    )

    ordering = ("-created_at",)
    autocomplete_fields = ("user", "notification")

    def notification_title(self, obj):
        return obj.notification.title

    notification_title.short_description = "Notification"


class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Report)
admin.site.register(Review)