import json
import uuid
from rest_framework import serializers
from .models import (
    Ad, AdvertisementImage, AdvertisementStatus, Category, Chat, ExtraFieldOption, Notification, NotificationUserState, Review, ReviewImage, ReviewReply, ReviewReport, SubCategory,
    ExtraFieldDefinition, Advertisement, AdvertisementExtraField, UserProfile, Message
)
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Report
from backend.storages import MediaStorage
media_storage = MediaStorage()


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "reason",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ["id", "image"]
        
class ReviewReplySerializer(serializers.ModelSerializer):

    author_lastname = serializers.CharField(source='author.last_name', read_only=True)
    author_firstname = serializers.CharField(source='author.first_name', read_only=True)

    class Meta:
        model = ReviewReply
        fields = [
            'id',
            'review',
            'author',
            'author_lastname',
            'author_firstname',
            'comment',
            'created_at'
        ]

        read_only_fields = ['author', 'created_at']

class ReviewReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = ReviewReport
        fields = [
            'id',
            'review',
            'reason',
            'description',
            'created_at'
        ]

        read_only_fields = ['created_at']

        
class ReviewSerializer(serializers.ModelSerializer):
    author_lastname = serializers.CharField(source='author.last_name', read_only=True)
    author_firstname = serializers.CharField(source='author.first_name', read_only=True)

    target_firstname = serializers.CharField(source='profile.user.first_name', read_only=True)
    target_lastname = serializers.CharField(source='profile.user.last_name', read_only=True)
    target_profile_id = serializers.IntegerField(source='profile.id', read_only=True)

    reply = ReviewReplySerializer(read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'profile',
            'author',
            'author_lastname',
            'author_firstname',

            'target_firstname',
            'target_lastname',
            'target_profile_id',
            
            'images',
            'rating',
            'comment',
            'reply',
            'created_at'
        ]
        read_only_fields = [
            'author',
            'created_at',
            'author_lastname',
            'author_firstname',
            'target_firstname',
            'target_lastname',
            'target_profile_id'
        ]
        
    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None
        profile = data.get('profile')

        if user and Review.objects.filter(profile=profile, author=user).exists():
            raise serializers.ValidationError("Вы уже оставляли отзыв для этого пользователя.")
        return data
    
class NewsletterSerializer(serializers.Serializer):
    subject = serializers.CharField()
    content = serializers.CharField()
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )

    
class AdSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Ad
        fields = ["id", "slug", "image", "link"]

    def get_image(self, obj):
        if not obj.image:
            return None

        url = obj.image.url

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)

        return url
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id','name','slug','image', 'priority')

class SubCategorySerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = SubCategory
        fields = ('id','category','name','slug','image', 'priority')

class ExtraFieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraFieldOption
        fields = ('id', 'value')
        
class ExtraFieldDefinitionSerializer(serializers.ModelSerializer):
    options = ExtraFieldOptionSerializer(many=True, read_only=True)  # ← новые варианты

    class Meta:
        model = ExtraFieldDefinition
        fields = ('id', 'subcategory', 'name', 'key', 'field_type', 'required', 'options')

class AdvertisementImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvertisementImage
        fields = ['id', 'image']

class AdvertisementExtraFieldSerializer(serializers.ModelSerializer):
    field_key = serializers.CharField(source='field_definition.key', read_only=True)
    field_name = serializers.CharField(source='field_definition.name', read_only=True)

    class Meta:
        model = AdvertisementExtraField
        fields = ('id','field_definition','field_key','field_name','value')
        extra_kwargs = {
            'field_definition': {'write_only': True}
        }

def cast_value_by_type(raw_value, field_type):
    if raw_value is None:
        return None
    if field_type == 'char':
        return str(raw_value)
    if field_type == 'int':
        try:
            return int(raw_value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('Expected integer value')
    if field_type == 'float':
        try:
            return float(raw_value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('Expected float value')
    if field_type == 'bool':
        if isinstance(raw_value, bool):
            return raw_value
        sval = str(raw_value).lower()
        if sval in ('true','1','yes','y'):
            return True
        if sval in ('false','0','no','n'):
            return False
        raise serializers.ValidationError('Expected boolean value')
    if field_type == 'date':
        return raw_value
    return raw_value


class AdvertisementImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = AdvertisementImage
        fields = ["id", "image"]


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        from .serializers import FullUserSerializer

        data["user"] = FullUserSerializer(
            self.user,
            context={"request": self.context.get("request")}
        ).data

        return data

class ProfileSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    username = serializers.CharField(source="user.username")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        user = instance.user
        user.first_name = user_data.get("first_name", user.first_name)
        user.last_name = user_data.get("last_name", user.last_name)
        user.save()

        return super().update(instance, validated_data)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "avatar",
            "city",
            "username",
            "first_name",
            "last_name",
            "rating",
            "reviews_count",
            "reviews",
        ]

    def get_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews.exists():
            return 0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    def get_reviews_count(self, obj):
        return obj.reviews.count()
        
class OwnerSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "profile"]

EXPIRATION_DAYS = 30

class FullUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "profile",
        ]

    
from datetime import timedelta
from django.utils import timezone

class AdvertisementSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    time_left = serializers.SerializerMethodField()

    owner = OwnerSerializer(read_only=True)
    images = AdvertisementImageSerializer(many=True, read_only=True)
    extra_values = serializers.SerializerMethodField(read_only=True)

    extra = serializers.JSONField(write_only=True, required=False)

    subcategory = serializers.SlugRelatedField(
        slug_field="slug",
        read_only=True
    )
    subcategory_slug = serializers.SlugRelatedField(
        queryset=SubCategory.objects.all(),
        slug_field="slug",
        write_only=True,
        source="subcategory"
    )

    owner_profile_id = serializers.IntegerField(
        source="owner.profile.id",
        read_only=True
    )
    category_slug = serializers.CharField(
        source="subcategory.category.slug",
        read_only=True
    )

    status = serializers.CharField(read_only=True)
    reject_reason = serializers.CharField(read_only=True)

    class Meta:
        model = Advertisement
        fields = (
            "id",
            "owner",
            "subcategory",
            "subcategory_slug",
            "category_slug",
            "slug",
            "title",
            "price",
            "description",
            "location",
            "images",
            "created_at",
            "views_count",
            "likes_count",
            "is_liked",
            "extra_values",
            "extra",
            "status",
            "reject_reason",
            "time_left",
            "owner_profile_id",
        )

        read_only_fields = (
            "created_at",
            "owner",
            "status",
            "reject_reason",
            "extra_values",
        )

    def get_time_left(self, obj):
        now = timezone.now()

        if obj.status == AdvertisementStatus.ACTIVE:
            expires_at = obj.created_at + timedelta(days=30)
        elif obj.status in (
            AdvertisementStatus.ARCHIVED,
            AdvertisementStatus.REJECTED
        ):
            expires_at = obj.status_changed_at + timedelta(days=30)
        else:
            return 0

        if now >= expires_at:
            return 0

        return int((expires_at - now).total_seconds())

    def get_extra_values(self, obj):
        return AdvertisementExtraFieldSerializer(
            obj.extra_values.select_related("field_definition"),
            many=True
        ).data

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    # -------------------- validation --------------------

    def validate_extra(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Extra must be an object: key -> value"
            )
        return value

    def _validate_and_prepare_extra(self, subcategory, extra_dict):
        prepared = []
        if not extra_dict:
            return prepared

        defs = {
            d.key: d
            for d in ExtraFieldDefinition.objects.filter(
                subcategory=subcategory
            )
        }

        for key, raw_val in extra_dict.items():
            if key not in defs:
                raise serializers.ValidationError({
                    "extra": f'Unknown field "{key}" for this subcategory'
                })

            definition = defs[key]

            try:
                casted = cast_value_by_type(
                    raw_val,
                    definition.field_type
                )
            except serializers.ValidationError as e:
                raise serializers.ValidationError({
                    "extra": {key: e.detail}
                })

            if definition.field_type == "date":
                casted = serializers.DateField().to_internal_value(raw_val)

            prepared.append((definition, str(casted)))

        return prepared

    def create(self, validated_data):
        request = self.context["request"]

        extra_dict = validated_data.pop("extra", None)
        files = request.FILES.getlist("images")

        if not files:
            raise serializers.ValidationError({
                "images": "At least one image is required"
            })

        validated_data.update({
            "owner": request.user,
            "status": AdvertisementStatus.MODERATION,
            "reject_reason": None,
        })

        ad = super().create(validated_data)

        prepared = self._validate_and_prepare_extra(
            ad.subcategory,
            extra_dict or {}
        )

        for definition, value in prepared:
            AdvertisementExtraField.objects.create(
                ad=ad,
                field_definition=definition,
                value=value
            )

        for f in files:
            filename = media_storage.save(
                f"advertisements/{f.name}",
                f
            )
            AdvertisementImage.objects.create(
                ad=ad,
                image=filename
            )

        return ad

    def update(self, instance, validated_data):
        request = self.context["request"]

        extra_dict = validated_data.pop("extra", None)
        new_images = request.FILES.getlist("images")

        instance.status = AdvertisementStatus.MODERATION
        instance.reject_reason = None

        if instance.status == AdvertisementStatus.REJECTED:
            instance.status = AdvertisementStatus.MODERATION
            instance.reject_reason = None

        elif instance.status == AdvertisementStatus.ARCHIVED:
            pass

        ad = super().update(instance, validated_data)

        if extra_dict is not None:
            ad.extra_values.all().delete()
            prepared = self._validate_and_prepare_extra(
                ad.subcategory,
                extra_dict
            )
            for definition, value in prepared:
                AdvertisementExtraField.objects.create(
                    ad=ad,
                    field_definition=definition,
                    value=value
                )

        existing_ids = request.data.get("existing_ids")
        if existing_ids:
            if isinstance(existing_ids, str):
                existing_ids = json.loads(existing_ids)
            ad.images.exclude(id__in=existing_ids).delete()

        for f in new_images:
            filename = media_storage.save(
                f"advertisements/{f.name}",
                f
            )
            AdvertisementImage.objects.create(
                ad=ad,
                image=filename
            )

        return ad



class MessageSerializer(serializers.ModelSerializer):
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'text', 'created_at', 'is_read']
        read_only_fields = ['sender', 'created_at', 'is_read']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['sender'] = request.user
        return super().create(validated_data)


class ChatSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)
    ad_title = serializers.CharField(source="ad.title", read_only=True)
    buyer = OwnerSerializer(read_only=True)
    seller = OwnerSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()  # 👈

    class Meta:
        model = Chat
        fields = [
            "id", "ad", "buyer", "seller",
            "ad_title", "last_message",
            "created_at", "messages", "unread_count"
        ]
        read_only_fields = ["buyer", "seller", "created_at"]

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if not last:
            return None
        return {
            "text": last.text,
            "created_at": last.created_at,
        }

    # 👇 добавляем метод
    def get_unread_count(self, obj):
        # Пример: считаем все сообщения, которые не прочитал текущий пользователь
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0

        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create(
            username=validated_data['email'],  
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class NotificationSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="notification.title")
    message = serializers.CharField(source="notification.message")
    created_at = serializers.DateTimeField(source="notification.created_at")

    class Meta:
        model = NotificationUserState
        fields = ("id", "title", "message", "is_read", "created_at")


from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class RegisterRequestSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class VerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)

import markdown
from rest_framework import serializers
from .models import Page
import re

def normalize_markdown(text: str) -> str:
    text = text.replace("\r\n", "\n")

    lines = text.split("\n")
    result = []

    headings = {
        "OUR MISSION",
        "WHY WE CREATED ZAMDA",
        "WHAT MAKES ZAMDA DIFFERENT",
        "OUR COMMITMENT TO YOU",
    }

    for line in lines:
        stripped = line.strip()

        if stripped in headings:
            result.append(f"## {stripped}")
        else:
            result.append(line)

    return "\n".join(result)

class PageSerializer(serializers.ModelSerializer):
    html_content = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = [
            "id",
            "title",
            "subtitle",
            "slug",
            "content",
            "html_content",
        ]

    def get_html_content(self, obj):
        clean = normalize_markdown(obj.content)
        return markdown.markdown(clean, extensions=["fenced_code", "tables"])
    
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source="profile.avatar", read_only=True)
    city = serializers.CharField(source="profile.city", read_only=True)
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "avatar",
            "city",
            "is_active",
            "is_staff",
            "date_joined",
            "last_login",
        ]