import uuid

from django.contrib import admin
from .models import (
    Ad, AdvertisementImage, AdvertisementLike, AdvertisementReport, AdvertisementStatus, AdvertisementView,
    Category, Chat, EmailChangeCode, EmailVerification, ExtraFieldOption, Message, MessageImage,
    Notification, NotificationUserState, Page, PasswordResetCode, PushSubscription, ReferralConversion,
    Report, Review, ReviewImage, ReviewReply, ReviewReport, SubCategory, ExtraFieldDefinition,
    Advertisement, AdvertisementExtraField, UserFollow, UserProfile, User, UserVerification
)
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.utils.html import format_html

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "followers_count", "following_count")
    search_fields = ("user__username", "user__email", "city")
    autocomplete_fields = ("user",)

@admin.register(UserVerification)
class UserVerificationAdmin(admin.ModelAdmin):
    list_display = ("user", "google_verified", "facebook_verified", "phone_verified", "phone_number")
    list_filter = ("google_verified", "facebook_verified", "phone_verified")
    search_fields = ("user__username", "user__email", "phone_number", "google_email")
    autocomplete_fields = ("user",)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name','slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name','category','slug')
    list_filter = ('category',)
    search_fields = ('name', 'category__name')
    prepopulated_fields = {'slug': ('name',)}


class ExtraFieldOptionInline(admin.TabularInline):
    model = ExtraFieldOption
    extra = 1

@admin.register(ExtraFieldDefinition)
class ExtraFieldDefinitionAdmin(admin.ModelAdmin):
    list_display = ('name','key','field_type','subcategory','required')
    list_filter = ('subcategory__category','subcategory','field_type','required')
    search_fields = ('name','key')
    autocomplete_fields = ('subcategory',)
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

class PageAdminForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = "__all__"


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    form = PageAdminForm

    class Media:
        css = {
            "all": [
                "https://uicdn.toast.com/editor/latest/toastui-editor.min.css"
            ]
        }
        js = [
            "https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js",
            "js/toast_editor.js",
        ]
    
import random
from django.db import transaction

import random
import uuid


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
                "views_count",
                "is_pinned",
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


@admin.action(description="Ban selected users (revoke access)")
def ban_users(modeladmin, request, queryset):
    queryset.update(is_active=False)

@admin.action(description="Unban selected users (restore access)")
def unban_users(modeladmin, request, queryset):
    queryset.update(is_active=True)

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    actions = (ban_users, unban_users)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("reporter", "reported_user", "chat", "reason", "created_at")
    list_filter = ("reason", "created_at")
    search_fields = ("reporter__username", "reported_user__username", "description")
    autocomplete_fields = ("reporter", "reported_user", "chat")

@admin.register(AdvertisementReport)
class AdvertisementReportAdmin(admin.ModelAdmin):
    list_display = ("ad", "reporter", "reason", "created_at")
    list_filter = ("reason", "created_at")
    search_fields = ("ad__title", "reporter__username", "description")
    autocomplete_fields = ("ad", "reporter")

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("author", "profile", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("author__username", "profile__user__username", "comment")
    autocomplete_fields = ("author", "profile")

@admin.register(ReviewReply)
class ReviewReplyAdmin(admin.ModelAdmin):
    list_display = ("review", "author", "created_at")
    search_fields = ("review__author__username", "author__username", "comment")
    autocomplete_fields = ("review", "author")

@admin.register(ReviewReport)
class ReviewReportAdmin(admin.ModelAdmin):
    list_display = ("review", "reporter", "reason", "created_at")
    list_filter = ("reason", "created_at")
    search_fields = ("review__author__username", "reporter__username", "description")
    autocomplete_fields = ("review", "reporter")

@admin.register(ReviewImage)
class ReviewImageAdmin(admin.ModelAdmin):
    list_display = ("review", "image")
    autocomplete_fields = ("review",)

@admin.register(Ad)
class AdAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_active", "priority", "created_at")
    list_filter = ("is_active",)
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("ad", "buyer", "seller", "created_at")
    search_fields = ("ad__title", "buyer__username", "seller__username")
    autocomplete_fields = ("ad", "buyer", "seller")

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("chat", "sender", "short_text", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("sender__username", "text")
    autocomplete_fields = ("chat", "sender")

    def short_text(self, obj):
        return (obj.text or "")[:60]
    short_text.short_description = "Text"

@admin.register(MessageImage)
class MessageImageAdmin(admin.ModelAdmin):
    list_display = ("message", "image")
    autocomplete_fields = ("message",)

@admin.register(UserFollow)
class UserFollowAdmin(admin.ModelAdmin):
    list_display = ("follower", "following", "created_at")
    search_fields = ("follower__username", "following__username")
    autocomplete_fields = ("follower", "following")

@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "endpoint", "created_at")
    search_fields = ("user__username", "endpoint")
    autocomplete_fields = ("user",)

@admin.register(AdvertisementView)
class AdvertisementViewAdmin(admin.ModelAdmin):
    list_display = ("ad", "user", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("ad__title", "user__username", "ip_address")
    autocomplete_fields = ("ad", "user")

@admin.register(AdvertisementLike)
class AdvertisementLikeAdmin(admin.ModelAdmin):
    list_display = ("ad", "user", "created_at")
    search_fields = ("ad__title", "user__username")
    autocomplete_fields = ("ad", "user")

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "created_at")
    search_fields = ("email", "first_name", "last_name")

@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at")
    search_fields = ("email",)

@admin.register(EmailChangeCode)
class EmailChangeCodeAdmin(admin.ModelAdmin):
    list_display = ("user", "new_email", "verified", "created_at")
    list_filter = ("verified",)
    search_fields = ("user__username", "new_email")
    autocomplete_fields = ("user",)

from django.contrib import admin
from .models import Referral, ReferralConversion
from django.db.models import Count
from django.utils import timezone


class ReferralConversionInline(admin.TabularInline):
    model = ReferralConversion
    fields = ("new_user", "registered_at", "ip", "created_at")
    readonly_fields = ("new_user", "registered_at", "ip", "created_at")
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "owner", "converted_count", "created_at", "copy_link")
    list_filter = ("created_at",)
    search_fields = ("name", "code", "owner__email", "owner__first_name", "owner__last_name")
    readonly_fields = ("code", "created_at", "converted_count", "copy_link")
    inlines = [ReferralConversionInline]

    fieldsets = (
        (None, {
            "fields": ("name", "owner")
        }),
        ("Ссылка", {
            "fields": ("code", "copy_link")
        }),
        ("Статистика", {
            "fields": ("converted_count", "created_at")
        }),
    )

    def copy_link(self, obj):
        link = obj.link

        return format_html(
            """
            <div style="display:flex; gap:8px; align-items:center;">
                <input 
                    type="text" 
                    value="{}" 
                    id="ref-link-{}" 
                    style="width:320px;" 
                    readonly
                />
                <button type="button" onclick="
                    navigator.clipboard.writeText(document.getElementById('ref-link-{}').value);
                    this.innerText='Copied!';
                    setTimeout(() => this.innerText='Copy', 1000);
                ">
                    Copy
                </button>
            </div>
            """,
            link,
            obj.id,
            obj.id
        )

    copy_link.short_description = "Referral link"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            conversions=Count("referralconversion")
        )

    def converted_count(self, obj):
        return obj.conversions

    converted_count.short_description = "Приведено"


@admin.register(ReferralConversion)
class ReferralConversionAdmin(admin.ModelAdmin):
    list_display = ("referral", "new_user", "registered_at", "ip", "created_at")
    list_filter = ("registered_at", "created_at", "referral__name")
    search_fields = ("referral__name", "referral__code", "new_user__email", "new_user__first_name")
    readonly_fields = ("referral", "new_user", "ip", "user_agent", "registered_at", "created_at")
    date_hierarchy = "registered_at"

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
