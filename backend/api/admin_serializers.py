from django.contrib.admin.models import LogEntry
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Advertisement, AdvertisementReport
from .serializers import OwnerSerializer, AdvertisementImageSerializer


class AdminAdvertisementListSerializer(serializers.ModelSerializer):
    owner = OwnerSerializer(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    report_count = serializers.SerializerMethodField()

    class Meta:
        model = Advertisement
        fields = (
            "id", "slug", "title", "owner", "status", "reject_reason",
            "price", "thumbnail", "views_count", "likes_count", "report_count",
            "created_at", "updated_at", "status_changed_at",
        )

    def get_thumbnail(self, obj):
        first = obj.images.first()
        if not first:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(first.image.url) if request else first.image.url

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_report_count(self, obj):
        return getattr(obj, "report_count", None) or obj.reports.count()


class AdminAdvertisementDetailSerializer(AdminAdvertisementListSerializer):
    images = AdvertisementImageSerializer(many=True, read_only=True)

    class Meta(AdminAdvertisementListSerializer.Meta):
        fields = AdminAdvertisementListSerializer.Meta.fields + ("description", "location", "images")


class AdminRejectAdSerializer(serializers.Serializer):
    reason = serializers.CharField(allow_blank=False, trim_whitespace=True)


class AdminAdvertisementReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    reviewed_by = serializers.SerializerMethodField()
    ad_id = serializers.IntegerField(source="ad.id", read_only=True)
    ad_title = serializers.CharField(source="ad.title", read_only=True)
    ad_slug = serializers.CharField(source="ad.slug", read_only=True)
    ad_status = serializers.CharField(source="ad.status", read_only=True)
    reason_label = serializers.CharField(source="get_reason_display", read_only=True)

    class Meta:
        model = AdvertisementReport
        fields = (
            "id", "ad_id", "ad_title", "ad_slug", "ad_status",
            "reporter", "reason", "reason_label", "description", "created_at",
            "is_reviewed", "reviewed_by", "reviewed_at",
        )

    def get_reporter(self, obj):
        return {"id": obj.reporter_id, "username": obj.reporter.username}

    def get_reviewed_by(self, obj):
        if not obj.reviewed_by_id:
            return None
        return {"id": obj.reviewed_by_id, "username": obj.reviewed_by.username}


class AdminTopReportedAdSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    total_reports = serializers.IntegerField(read_only=True)
    unique_reporters = serializers.IntegerField(read_only=True)
    reports_last_24h = serializers.IntegerField(read_only=True)
    reports_last_7d = serializers.IntegerField(read_only=True)
    last_report_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Advertisement
        fields = (
            "id", "slug", "title", "owner_username", "status",
            "total_reports", "unique_reporters", "reports_last_24h",
            "reports_last_7d", "last_report_at",
        )


class AdminLogEntrySerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    content_type_name = serializers.CharField(source="content_type.model", read_only=True, default=None)
    action = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = (
            "id", "action_time", "actor", "action", "content_type_name",
            "object_id", "object_repr", "change_message",
        )

    def get_actor(self, obj):
        if not obj.user_id:
            return None
        return {"id": obj.user_id, "username": obj.user.username}

    def get_action(self, obj):
        return obj.get_action_flag_display()


class AdminUserListSerializer(serializers.ModelSerializer):
    ads_count = serializers.IntegerField(read_only=True)
    active_ads_count = serializers.IntegerField(read_only=True)
    reports_against = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name",
            "is_active", "is_staff", "date_joined", "last_login",
            "ads_count", "active_ads_count", "reports_against",
        )


class AdminBanUserSerializer(serializers.Serializer):
    reason = serializers.CharField(allow_blank=False, trim_whitespace=True)
