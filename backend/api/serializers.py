import json
from rest_framework import serializers
from .models import (
    AdvertisementImage, Category, Chat, Notification, Review, SubCategory,
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
        fields = ["id", "reporter", "reported_user", "chat", "reason", "description", "created_at"]
        read_only_fields = ["reporter", "created_at"]

class ReviewSerializer(serializers.ModelSerializer):
    author_lastname = serializers.CharField(source='author.last_name', read_only=True)
    author_firstname = serializers.CharField(source='author.first_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'profile', 'author', 'author_lastname', 'author_firstname', 'rating', 'comment', 'created_at']
        read_only_fields = ['author', 'created_at', 'author_lastname', 'author_firstname']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None
        profile = data.get('profile')

        if user and Review.objects.filter(profile=profile, author=user).exists():
            raise serializers.ValidationError("Вы уже оставляли отзыв для этого пользователя.")
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id','name','slug','image', 'priority')

class SubCategorySerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = SubCategory
        fields = ('id','category','name','slug','image', 'priority')

class ExtraFieldDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraFieldDefinition
        fields = ('id','subcategory','name','key','field_type')


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

class ProfileSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

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

from datetime import timedelta
from django.utils import timezone

class AdvertisementSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    owner = OwnerSerializer(read_only=True)
    extra_values = serializers.SerializerMethodField(read_only=True)
    images = AdvertisementImageSerializer(many=True, read_only=True)
    extra = serializers.JSONField(write_only=True, required=False)
    subcategory = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    subcategory_slug = serializers.SlugRelatedField(
        queryset=SubCategory.objects.all(),
        slug_field="slug",
        write_only=True,
        source='subcategory'
    )
    # subcategory_id = serializers.PrimaryKeyRelatedField(
    #     queryset=SubCategory.objects.all(),
    #     write_only=True,
    #     source='subcategory'
    # )
    owner_profile_id = serializers.IntegerField(source="owner.profile.id", read_only=True)
    category_slug = serializers.CharField(source="subcategory.category.slug", read_only=True)
    time_left = serializers.SerializerMethodField()

    class Meta:
        model = Advertisement
        fields = ('id','owner','subcategory', 'subcategory_slug', 'category_slug', 'slug', 'title','price','description','images',
                  'created_at','is_active','extra_values','extra', 'owner_profile_id', "views_count",
                   "likes_count", "is_liked", "location", 'time_left')
        read_only_fields = ('created_at','owner','extra_values')
    
    def get_time_left(self, obj):
        expires_at = obj.created_at + timedelta(days=30)
        now = timezone.now()
        
        if now >= expires_at:
            return 0

        time_left = expires_at - now
        return int(time_left.total_seconds()) 
    
    def get_extra_values(self, obj):
        result = {}
        for v in obj.extra_values.select_related('field_definition').all():
            key = v.field_definition.key
            result[key] = v.value
        return result

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        user = self.context.get("request").user
        if user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False
    
    def validate_extra(self, value):
        """
        value expected to be a dict: { 'mileage': 120000, 'year': 2015 }
        Проверим, что ключи соответствуют ExtraFieldDefinition для subcategory (если subcategory указан в validated_data)
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError('Extra must be an object/dict of key->value.')

        return value

    def _validate_and_prepare_extra(self, subcategory, extra_dict):
        """
        Проверяет extra_dict по definitions для данной подкатегории.
        Возвращает список кортежей (field_definition, casted_value).
        """
        prepared = []
        if not extra_dict:
            return prepared

        defs = {d.key: d for d in ExtraFieldDefinition.objects.filter(subcategory=subcategory)}
        for key, raw_val in extra_dict.items():
            if key not in defs:
                raise serializers.ValidationError({ 'extra': f'Unknown field key "{key}" for subcategory.'})
            definition = defs[key]
            try:
                casted = cast_value_by_type(raw_val, definition.field_type)
            except serializers.ValidationError as e:
                raise serializers.ValidationError({ 'extra': { key: e.detail if hasattr(e,'detail') else str(e) }})
            if definition.field_type == 'date':
                date_field = serializers.DateField()
                try:
                    casted = date_field.to_internal_value(raw_val)
                except serializers.ValidationError as e:
                    raise serializers.ValidationError({ 'extra': { key: e.detail }})
            prepared.append((definition, str(casted)))
        return prepared

    def create(self, validated_data):
        import json

        extra_dict = validated_data.pop('extra', None)
        if isinstance(extra_dict, str):
            extra_dict = json.loads(extra_dict)

        request = self.context.get('request')
        validated_data['owner'] = request.user

        files = request.FILES.getlist('images')

        # здесь subcategory уже объект, не нужно делать SubCategory.objects.get()
        ad = super().create(validated_data)

        prepared = self._validate_and_prepare_extra(ad.subcategory, extra_dict or {})
        for definition, casted_str in prepared:
            AdvertisementExtraField.objects.create(
                ad=ad,
                field_definition=definition,
                value=str(casted_str)
            )

        for f in files:
            filename = media_storage.save(f"advertisements/{f.name}", f)
            AdvertisementImage.objects.create(ad=ad, image=filename)

        return ad



    def update(self, instance, validated_data):
        # import json

        # # Обновляем subcategory если есть
        # subcategory_data = validated_data.pop('subcategory', None)
        # if subcategory_data:
        #     if isinstance(subcategory_data, str):
        #         subcategory_data = json.loads(subcategory_data)
        #     subcategory_id = subcategory_data.get('id') if isinstance(subcategory_data, dict) else subcategory_data
        #     validated_data['subcategory'] = SubCategory.objects.get(id=int(subcategory_id))

        # # Обновляем объявление
        # ad = super().update(instance, validated_data)

        # Обновляем extra поля
        extra_dict = validated_data.pop('extra', None)

        ad = super().update(instance, validated_data)

        if extra_dict is not None:
            ad.extra_values.all().delete()
            if isinstance(extra_dict, str):
                extra_dict = json.loads(extra_dict)
            prepared = self._validate_and_prepare_extra(ad.subcategory, extra_dict or {})
            for definition, casted_str in prepared:
                AdvertisementExtraField.objects.create(
                    ad=ad,
                    field_definition=definition,
                    value=str(casted_str)
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
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "is_read", "created_at"]

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