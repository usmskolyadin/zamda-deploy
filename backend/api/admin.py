from django.contrib import admin
from .models import AdvertisementImage, Category, Notification, SubCategory, ExtraFieldDefinition, Advertisement, AdvertisementExtraField, UserProfile, User
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

@admin.register(ExtraFieldDefinition)
class ExtraFieldDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name','key','field_type','subcategory')
    list_filter = ('subcategory__category','subcategory')
    search_fields = ('name','key')

class AdvertisementExtraFieldInline(admin.TabularInline):
    model = AdvertisementExtraField
    extra = 0


class AdvertisementImageInline(admin.TabularInline):
    model = AdvertisementImage
    extra = 1
    
@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('title','owner','subcategory','price','is_active','created_at', 'get_first_image')
    list_filter = ('subcategory','is_active')
    search_fields = ('title','description')
    inlines = [AdvertisementExtraFieldInline, AdvertisementImageInline]

    def get_first_image(self, obj):
        first = obj.images.first()
        if first:
            return first.image.url
        return "-"
    get_first_image.short_description = "Image"

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "profile", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("title", "message")

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