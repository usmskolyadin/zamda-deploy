from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .admin_views import (
    AdminAdvertisementViewSet, AdminAdvertisementReportViewSet,
    AdminAuditLogListView, AdminOverviewView, AdminUserViewSet,
)

router = DefaultRouter()
router.register("ads", AdminAdvertisementViewSet, basename="admin-ads")
router.register("reports", AdminAdvertisementReportViewSet, basename="admin-reports")
router.register("users", AdminUserViewSet, basename="admin-users")

urlpatterns = [
    path("overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("audit-log/", AdminAuditLogListView.as_view(), name="admin-audit-log"),
    path("", include(router.urls)),
]
