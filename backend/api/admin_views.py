from datetime import timedelta

import django_filters
from django.contrib.admin.models import LogEntry
from django.contrib.auth import get_user_model
from django.db.models import Count, Max, Q
from django.db.models.functions import TruncDate, TruncWeek
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .admin_analytics import parse_period, pct_change, trunc_kind_for_range
from .admin_audit import log_admin_action
from .admin_serializers import (
    AdminAdvertisementDetailSerializer, AdminAdvertisementListSerializer,
    AdminAdvertisementReportSerializer, AdminBanUserSerializer, AdminLogEntrySerializer,
    AdminRejectAdSerializer, AdminTopReportedAdSerializer, AdminUserListSerializer,
)
from .models import Advertisement, AdvertisementLike, AdvertisementReport, AdvertisementStatus, AdvertisementView
from .pagination import AdvertisementPagination

User = get_user_model()


def _series_by_day(queryset, date_field, start, end, trunc_kind):
    trunc = TruncDate if trunc_kind == "day" else TruncWeek
    rows = (
        queryset.filter(**{f"{date_field}__range": (start, end)})
        .annotate(bucket=trunc(date_field))
        .values("bucket")
        .annotate(count=Count("id"))
        .order_by("bucket")
    )
    return [{"date": row["bucket"].isoformat(), "count": row["count"]} for row in rows]


class AdminOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        start, end, prev_start, prev_end = parse_period(request)
        now = timezone.now()

        users_qs = User.objects.all()
        ads_qs = Advertisement.objects.all()
        reports_qs = AdvertisementReport.objects.all()
        views_qs = AdvertisementView.objects.all()
        likes_qs = AdvertisementLike.objects.all()

        def period_count(qs, field="created_at"):
            current = qs.filter(**{f"{field}__range": (start, end)}).count()
            previous = qs.filter(**{f"{field}__range": (prev_start, prev_end)}).count()
            return {"current": current, "previous": previous, "change_pct": pct_change(current, previous)}

        status_counts = dict(
            ads_qs.values("status").annotate(count=Count("id")).values_list("status", "count")
        )

        trunc_kind = trunc_kind_for_range(start, end)

        return Response({
            "period": {
                "start": start.isoformat(), "end": end.isoformat(),
                "prev_start": prev_start.isoformat(), "prev_end": prev_end.isoformat(),
                "timezone": "UTC",
            },
            "users": {
                "total": users_qs.count(),
                "banned": users_qs.filter(is_active=False).count(),
                "registrations": period_count(users_qs, "date_joined"),
            },
            "ads": {
                "by_status": {
                    key: status_counts.get(key, 0) for key in AdvertisementStatus.values
                },
                "created": period_count(ads_qs),
            },
            "reports": {
                "total": reports_qs.count(),
                "unreviewed": reports_qs.filter(is_reviewed=False).count(),
                "received": period_count(reports_qs),
                "ads_with_reports": ads_qs.filter(reports__isnull=False).distinct().count(),
                "ads_with_multiple_reports": (
                    ads_qs.annotate(rc=Count("reports")).filter(rc__gte=2).count()
                ),
            },
            "engagement": {
                "views": period_count(views_qs),
                "likes": period_count(likes_qs),
            },
            "series": {
                "registrations": _series_by_day(users_qs, "date_joined", start, end, trunc_kind),
                "ads_created": _series_by_day(ads_qs, "created_at", start, end, trunc_kind),
                "reports": _series_by_day(reports_qs, "created_at", start, end, trunc_kind),
            },
            "needs_attention": self._attention_items(now),
        })

    def _attention_items(self, now):
        items = []

        unreviewed = AdvertisementReport.objects.filter(is_reviewed=False).count()
        if unreviewed:
            items.append({
                "type": "unreviewed_reports",
                "label": f"{unreviewed} report(s) awaiting review",
                "link": "/admin/reports?status=pending",
                "count": unreviewed,
            })

        stale_moderation = Advertisement.objects.filter(
            status=AdvertisementStatus.MODERATION,
            status_changed_at__lt=now - timedelta(hours=48),
        ).count()
        if stale_moderation:
            items.append({
                "type": "stale_moderation",
                "label": f"{stale_moderation} listing(s) waiting over 48h for moderation",
                "link": "/admin/listings?status=moderation&ordering=status_changed_at",
                "count": stale_moderation,
            })

        heavily_reported = (
            Advertisement.objects.annotate(rc=Count("reports"))
            .filter(rc__gte=3)
            .exclude(status=AdvertisementStatus.REJECTED)
            .count()
        )
        if heavily_reported:
            items.append({
                "type": "heavily_reported",
                "label": f"{heavily_reported} active/pending listing(s) with 3+ reports",
                "link": "/admin/listings?min_reports=3",
                "count": heavily_reported,
            })

        return items


class AdminAdvertisementFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    owner = django_filters.NumberFilter(field_name="owner_id")
    min_reports = django_filters.NumberFilter(field_name="report_count", lookup_expr="gte")
    min_views = django_filters.NumberFilter(field_name="views_count", lookup_expr="gte")
    min_likes = django_filters.NumberFilter(field_name="like_count", lookup_expr="gte")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Advertisement
        fields = ["status", "owner", "min_reports", "min_views", "min_likes", "created_after", "created_before"]


class AdminAdvertisementViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin-only listings browser: unlike the public AdvertisementViewSet,
    nothing here filters by status=ACTIVE — admins need to see every
    status, including moderation/rejected/archived."""

    permission_classes = [IsAdminUser]
    pagination_class = AdvertisementPagination
    lookup_field = "pk"

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AdminAdvertisementFilter
    search_fields = ["title", "description", "owner__username", "owner__email"]
    ordering_fields = ["created_at", "updated_at", "status_changed_at", "views_count", "report_count", "like_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Advertisement.objects.select_related("owner", "subcategory")
            .prefetch_related("images")
            .annotate(report_count=Count("reports", distinct=True), like_count=Count("likes", distinct=True))
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AdminAdvertisementDetailSerializer
        return AdminAdvertisementListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        ad = self.get_object()
        from django.contrib.contenttypes.models import ContentType

        entries = LogEntry.objects.filter(
            content_type=ContentType.objects.get_for_model(Advertisement), object_id=ad.pk
        ).select_related("user").order_by("-action_time")
        return Response(AdminLogEntrySerializer(entries, many=True).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        ad = self.get_object()

        if ad.status in (AdvertisementStatus.REJECTED, AdvertisementStatus.ARCHIVED):
            return Response(
                {"detail": f"Cannot reject an ad that is already {ad.status}."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = AdminRejectAdSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data["reason"]

        previous_status = ad.status
        ad.status = AdvertisementStatus.REJECTED
        ad.reject_reason = reason
        ad.save(update_fields=["status", "reject_reason", "status_changed_at"])

        log_admin_action(
            request, ad,
            f"Rejected via admin panel (was {previous_status}). Reason: {reason}",
        )

        return Response(AdminAdvertisementDetailSerializer(ad, context={"request": request}).data)


class AdminAdvertisementReportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = AdminAdvertisementReportSerializer
    pagination_class = AdvertisementPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["is_reviewed", "reason", "ad"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return AdvertisementReport.objects.select_related("ad", "reporter", "reviewed_by")

    @action(detail=False, methods=["get"], url_path="top-ads")
    def top_ads(self, request):
        now = timezone.now()
        qs = (
            Advertisement.objects.annotate(
                total_reports=Count("reports", distinct=True),
                unique_reporters=Count("reports__reporter", distinct=True),
                reports_last_24h=Count("reports", filter=Q(reports__created_at__gte=now - timedelta(hours=24))),
                reports_last_7d=Count("reports", filter=Q(reports__created_at__gte=now - timedelta(days=7))),
                last_report_at=Max("reports__created_at"),
            )
            .filter(total_reports__gt=0)
            .order_by("-total_reports")
        )
        page = self.paginate_queryset(qs)
        serializer = AdminTopReportedAdSerializer(page if page is not None else qs, many=True)
        data = serializer.data
        return self.get_paginated_response(data) if page is not None else Response(data)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        report = self.get_object()

        if report.is_reviewed:
            return Response({"detail": "Report already reviewed."}, status=status.HTTP_409_CONFLICT)

        report.is_reviewed = True
        report.reviewed_by = request.user
        report.reviewed_at = timezone.now()
        report.save(update_fields=["is_reviewed", "reviewed_by", "reviewed_at"])

        log_admin_action(request, report.ad, f"Report #{report.pk} marked reviewed (reason: {report.reason}).")

        return Response(AdminAdvertisementReportSerializer(report).data)


class AdminAuditLogListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminLogEntrySerializer
    pagination_class = AdvertisementPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["user", "content_type"]
    ordering_fields = ["action_time"]
    ordering = ["-action_time"]

    def get_queryset(self):
        return LogEntry.objects.select_related("user", "content_type")


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserListSerializer
    pagination_class = AdvertisementPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active", "is_staff"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "ads_count"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        return User.objects.annotate(
            ads_count=Count("ads", distinct=True),
            active_ads_count=Count("ads", filter=Q(ads__status=AdvertisementStatus.ACTIVE), distinct=True),
            reports_against=Count("ads__reports", distinct=True),
        )

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        user = self.get_object()
        from django.contrib.contenttypes.models import ContentType

        entries = LogEntry.objects.filter(
            content_type=ContentType.objects.get_for_model(User), object_id=user.pk
        ).select_related("user").order_by("-action_time")
        return Response(AdminLogEntrySerializer(entries, many=True).data)

    @action(detail=True, methods=["post"])
    def ban(self, request, pk=None):
        user = self.get_object()
        if not user.is_active:
            return Response({"detail": "User is already banned."}, status=status.HTTP_409_CONFLICT)

        serializer = AdminBanUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.is_active = False
        user.save(update_fields=["is_active"])
        log_admin_action(request, user, f"Banned via admin panel. Reason: {serializer.validated_data['reason']}")

        return Response(AdminUserListSerializer(self.get_queryset().get(pk=user.pk)).data)

    @action(detail=True, methods=["post"])
    def unban(self, request, pk=None):
        user = self.get_object()
        if user.is_active:
            return Response({"detail": "User is not banned."}, status=status.HTTP_409_CONFLICT)

        user.is_active = True
        user.save(update_fields=["is_active"])
        log_admin_action(request, user, "Unbanned via admin panel.")

        return Response(AdminUserListSerializer(self.get_queryset().get(pk=user.pk)).data)
