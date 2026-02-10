from datetime import timedelta
import itertools
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User 
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify
from backend.storages import MediaStorage


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True, storage=MediaStorage())
    priority = models.IntegerField()

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']


class SubCategory(models.Model):
    category = models.ForeignKey(Category, related_name="subcategories", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    image = models.ImageField(upload_to="categories/", blank=True, null=True, storage=MediaStorage())
    priority = models.IntegerField()

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} → {self.name}"

    class Meta:
        unique_together = ('category', 'slug')
        ordering = ['name']

class ExtraFieldOption(models.Model):
    field = models.ForeignKey('ExtraFieldDefinition', on_delete=models.CASCADE, related_name='options')
    value = models.CharField(max_length=255)

    def __str__(self):
        return self.value


class ExtraFieldDefinition(models.Model):
    FIELD_TYPES = (
        ("char", "String"),
        ("int", "Integer"),
        ("float", "Float"),
        ("bool", "Boolean"),
        ("date", "Date"),
        ("select", "Select"),
    )

    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name="extra_fields")
    name = models.CharField(max_length=255)
    key = models.SlugField()
    field_type = models.CharField(max_length=10, choices=FIELD_TYPES)
    required = models.BooleanField(default=False)

    class Meta:
        unique_together = ("subcategory", "key")

from django.db.models import Q

class AdvertisementView(models.Model):
    ad = models.ForeignKey("Advertisement", on_delete=models.CASCADE)
    user = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["ad", "user"],
                condition=Q(user__isnull=False),
                name="unique_ad_user_view"
            ),
            models.UniqueConstraint(
                fields=["ad", "ip_address"],
                condition=Q(user__isnull=True),
                name="unique_ad_ip_view"
            ),
        ]
        
class AdvertisementStatus(models.TextChoices):
    MODERATION = "moderation", "На модерации"
    ACTIVE = "active", "Активно"
    REJECTED = "rejected", "Отклонено"
    ARCHIVED = "archived", "Архив"

class Advertisement(models.Model):
    owner = models.ForeignKey(User, related_name="ads", on_delete=models.CASCADE)
    subcategory = models.ForeignKey('SubCategory', related_name="ads", on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    location = models.CharField(max_length=255)

    status = models.CharField(
        max_length=20,
        choices=AdvertisementStatus.choices,
        default=AdvertisementStatus.MODERATION
    )

    reject_reason = models.TextField(blank=True, null=True)

    views_count = models.PositiveIntegerField(default=0)

    likes = models.ManyToManyField(
        User,
        related_name="liked_ads",
        through="AdvertisementLike",
        blank=True
    )

    status_changed_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.pk:
            old_status = Advertisement.objects.filter(pk=self.pk)\
                .values_list("status", flat=True)\
                .first()

            if old_status and old_status != self.status:
                self.status_changed_at = timezone.now()

        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Advertisement.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        super().save(*args, **kwargs)


    def archive_if_expired(self):
        if self.created_at < timezone.now() - timedelta(days=30):
            if self.status == AdvertisementStatus.ACTIVE:
                self.status = AdvertisementStatus.ARCHIVED
                self.save(update_fields=["status"])

class AdvertisementLike(models.Model):
    ad = models.ForeignKey(Advertisement, related_name="ad_likes", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="user_likes", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("ad", "user")

    def __str__(self):
        return f"{self.user.username} → {self.ad.title}"


class AdvertisementImage(models.Model):
    ad = models.ForeignKey(Advertisement, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="ads/")

    def __str__(self):
        return f"Image for {self.ad.title}"


class AdvertisementExtraField(models.Model):
    ad = models.ForeignKey(Advertisement, related_name="extra_values", on_delete=models.CASCADE)
    field_definition = models.ForeignKey(ExtraFieldDefinition, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)  

    class Meta:
        unique_together = ('ad', 'field_definition')

    def __str__(self):
        return f"{self.field_definition.name}: {self.value}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        default="avatars/profile.png",
        storage=MediaStorage()
    )

    city = models.CharField(max_length=100, blank=True)
    # reviews = models.ManyToManyField(Review, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"
    
class Notification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_global = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class NotificationUserState(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_states")
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name="user_states")
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "notification")

class Chat(models.Model):
    ad = models.ForeignKey(
        'Advertisement',
        related_name="chats",
        on_delete=models.CASCADE
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name="chats_as_buyer", 
        on_delete=models.CASCADE
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name="chats_as_seller", 
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('ad', 'buyer', 'seller')

    def __str__(self):
        return f"Chat on {self.ad.title} ({self.buyer} ↔ {self.seller})"

class Message(models.Model):
    chat = models.ForeignKey(
        Chat,  # <-- исправлено
        related_name="messages",
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_messages",
        on_delete=models.CASCADE
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.text[:30]}"
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        from .models import UserProfile
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Review(models.Model):
    profile = models.ForeignKey(
        'UserProfile', related_name='reviews', on_delete=models.CASCADE
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='written_reviews', on_delete=models.CASCADE
    )
    rating = models.PositiveSmallIntegerField(default=5)  # 1-5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('profile', 'author')

    def __str__(self):
        return f"Review by {self.author.username} for {self.profile.user.username}"
    

from django.db import models
from django.utils import timezone
import uuid

class EmailVerification(models.Model):
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=6)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(default=timezone.now)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)
    
class Report(models.Model):
    REASON_CHOICES = [
        ("spam", "Spam"),
        ("abuse", "Abuse"),
        ("other", "Other"),
    ]
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports_made")
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports_received")
    chat = models.ForeignKey("Chat", on_delete=models.CASCADE, null=True, blank=True, related_name="reports")
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reporter} reported {self.reported_user} ({self.reason})"
    

class PasswordResetCode(models.Model):
    email = models.EmailField(unique=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=10)
