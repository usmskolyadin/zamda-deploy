from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Advertisement, AdvertisementReport, AdvertisementStatus, Category, SubCategory,
)


def auth_client(user):
    client = APIClient()
    token = RefreshToken.for_user(user).access_token
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


class AdminApiPermissionsTests(TestCase):
    """P0 requirement: anonymous/regular users are locked out of every
    admin endpoint, staff users are let in — enforced server-side, not
    just hidden in the UI."""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name="Vehicles", slug="vehicles", priority=0)
        cls.subcategory = SubCategory.objects.create(
            category=cls.category, name="Cars", slug="cars", priority=0
        )
        cls.owner = User.objects.create_user(username="owner", email="owner@example.com")
        cls.staff = User.objects.create_user(username="staffer", email="staff@example.com", is_staff=True)
        cls.regular = User.objects.create_user(username="regular", email="regular@example.com")

        cls.ad = Advertisement.objects.create(
            owner=cls.owner, subcategory=cls.subcategory, title="Test ad",
            price=100, description="desc", location="Nowhere",
            status=AdvertisementStatus.ACTIVE,
        )

    def test_overview_requires_staff(self):
        anon = APIClient()
        self.assertIn(anon.get("/api/admin/overview/").status_code, (401, 403))

        regular = auth_client(self.regular)
        self.assertEqual(regular.get("/api/admin/overview/").status_code, 403)

        staff = auth_client(self.staff)
        self.assertEqual(staff.get("/api/admin/overview/").status_code, 200)

    def test_ads_list_requires_staff(self):
        regular = auth_client(self.regular)
        self.assertEqual(regular.get("/api/admin/ads/").status_code, 403)

        staff = auth_client(self.staff)
        res = staff.get("/api/admin/ads/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["count"], 1)

    def test_reject_requires_staff_and_cannot_bypass_via_public_endpoint(self):
        regular = auth_client(self.regular)
        res = regular.post(f"/api/admin/ads/{self.ad.pk}/reject/", {"reason": "nope"})
        self.assertEqual(res.status_code, 403)

        # the public, owner-scoped endpoint must not let a stranger touch status either
        res = regular.patch(f"/api/ads/{self.ad.slug}/", {"status": AdvertisementStatus.REJECTED})
        self.assertIn(res.status_code, (403, 404))

        self.ad.refresh_from_db()
        self.assertEqual(self.ad.status, AdvertisementStatus.ACTIVE)

    def test_audit_log_and_users_require_staff(self):
        regular = auth_client(self.regular)
        self.assertEqual(regular.get("/api/admin/audit-log/").status_code, 403)
        self.assertEqual(regular.get("/api/admin/users/").status_code, 403)

        staff = auth_client(self.staff)
        self.assertEqual(staff.get("/api/admin/audit-log/").status_code, 200)
        self.assertEqual(staff.get("/api/admin/users/").status_code, 200)


class AdminRejectActionTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name="Vehicles2", slug="vehicles2", priority=0)
        cls.subcategory = SubCategory.objects.create(
            category=cls.category, name="Cars2", slug="cars2", priority=0
        )
        cls.owner = User.objects.create_user(username="owner2", email="owner2@example.com")
        cls.staff = User.objects.create_user(username="staffer2", email="staff2@example.com", is_staff=True)

    def _make_ad(self, status=AdvertisementStatus.ACTIVE):
        return Advertisement.objects.create(
            owner=self.owner, subcategory=self.subcategory, title="Ad",
            price=100, description="desc", location="Nowhere", status=status,
        )

    def test_reject_sets_status_reason_and_audit_entry(self):
        ad = self._make_ad()
        staff = auth_client(self.staff)

        res = staff.post(f"/api/admin/ads/{ad.pk}/reject/", {"reason": "Fake listing"})
        self.assertEqual(res.status_code, 200)

        ad.refresh_from_db()
        self.assertEqual(ad.status, AdvertisementStatus.REJECTED)
        self.assertEqual(ad.reject_reason, "Fake listing")

        history = staff.get(f"/api/admin/ads/{ad.pk}/history/")
        self.assertEqual(history.status_code, 200)
        self.assertEqual(len(history.json()), 1)
        self.assertIn("Fake listing", history.json()[0]["change_message"])

    def test_reject_requires_reason(self):
        ad = self._make_ad()
        staff = auth_client(self.staff)
        res = staff.post(f"/api/admin/ads/{ad.pk}/reject/", {"reason": ""})
        self.assertEqual(res.status_code, 400)

    def test_cannot_reject_already_rejected_ad(self):
        ad = self._make_ad(status=AdvertisementStatus.REJECTED)
        staff = auth_client(self.staff)
        res = staff.post(f"/api/admin/ads/{ad.pk}/reject/", {"reason": "again"})
        self.assertEqual(res.status_code, 409)


class AdminReportsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name="Vehicles3", slug="vehicles3", priority=0)
        cls.subcategory = SubCategory.objects.create(
            category=cls.category, name="Cars3", slug="cars3", priority=0
        )
        cls.owner = User.objects.create_user(username="owner3", email="owner3@example.com")
        cls.staff = User.objects.create_user(username="staffer3", email="staff3@example.com", is_staff=True)
        cls.reporter_a = User.objects.create_user(username="reporter_a", email="a@example.com")
        cls.reporter_b = User.objects.create_user(username="reporter_b", email="b@example.com")

        cls.ad = Advertisement.objects.create(
            owner=cls.owner, subcategory=cls.subcategory, title="Reported ad",
            price=50, description="desc", location="Nowhere",
            status=AdvertisementStatus.ACTIVE,
        )
        AdvertisementReport.objects.create(ad=cls.ad, reporter=cls.reporter_a, reason="scam")
        AdvertisementReport.objects.create(ad=cls.ad, reporter=cls.reporter_b, reason="duplicate_spam")

    def test_resolve_marks_report_but_leaves_ad_status_untouched(self):
        staff = auth_client(self.staff)
        report = self.ad.reports.first()

        res = staff.post(f"/api/admin/reports/{report.pk}/resolve/")
        self.assertEqual(res.status_code, 200)

        report.refresh_from_db()
        self.ad.refresh_from_db()
        self.assertTrue(report.is_reviewed)
        self.assertEqual(report.reviewed_by_id, self.staff.pk)
        self.assertEqual(self.ad.status, AdvertisementStatus.ACTIVE)  # untouched

    def test_top_ads_reports_this_ad_with_two_reporters(self):
        staff = auth_client(self.staff)
        res = staff.get("/api/admin/reports/top-ads/")
        self.assertEqual(res.status_code, 200)
        row = res.json()["results"][0]
        self.assertEqual(row["id"], self.ad.pk)
        self.assertEqual(row["total_reports"], 2)
        self.assertEqual(row["unique_reporters"], 2)

    def test_overview_flags_heavily_reported_ad_at_threshold(self):
        AdvertisementReport.objects.create(
            ad=self.ad,
            reporter=User.objects.create_user(username="reporter_c", email="c@example.com"),
            reason="other",
        )
        staff = auth_client(self.staff)
        res = staff.get("/api/admin/overview/")
        self.assertEqual(res.status_code, 200)
        types = [item["type"] for item in res.json()["needs_attention"]]
        self.assertIn("heavily_reported", types)


class AdminUserBanTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.staff = User.objects.create_user(username="staffer4", email="staff4@example.com", is_staff=True)
        cls.target = User.objects.create_user(username="target", email="target@example.com")

    def test_ban_then_unban_round_trip_and_blocks_login(self):
        staff = auth_client(self.staff)

        res = staff.post(f"/api/admin/users/{self.target.pk}/ban/", {"reason": "spamming"})
        self.assertEqual(res.status_code, 200)
        self.target.refresh_from_db()
        self.assertFalse(self.target.is_active)

        # a banned user's own token must stop working immediately
        banned_client = auth_client(self.target)
        self.assertEqual(banned_client.get("/api/users/me/").status_code, 401)

        res = staff.post(f"/api/admin/users/{self.target.pk}/ban/", {"reason": "again"})
        self.assertEqual(res.status_code, 409)

        res = staff.post(f"/api/admin/users/{self.target.pk}/unban/")
        self.assertEqual(res.status_code, 200)
        self.target.refresh_from_db()
        self.assertTrue(self.target.is_active)
