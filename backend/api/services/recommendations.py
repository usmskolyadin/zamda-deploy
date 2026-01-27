from django.db.models import Count, Q, F
from ..models import Advertisement, AdvertisementLike, AdvertisementStatus, AdvertisementView



class AdvertisementRecommender:

    @staticmethod
    def similar(ad, limit=12):
        """
        Возвращает похожие объявления с fallback-логикой
        """

        collected_ids = set()
        results = []

        def extend(qs):
            nonlocal results, collected_ids
            for obj in qs:
                if obj.id not in collected_ids:
                    collected_ids.add(obj.id)
                    results.append(obj)
                if len(results) >= limit:
                    break

        base_qs = (
            Advertisement.objects
            .filter(status=AdvertisementStatus.ACTIVE)
            .exclude(id=ad.id)
            .annotate(
                popularity=F("views_count") + Count("ad_likes") * 5
            )
            .order_by("-popularity", "-created_at")
        )

        price_min = float(ad.price) * 0.8
        price_max = float(ad.price) * 1.2

        strict_qs = base_qs.filter(
            subcategory=ad.subcategory,
            price__gte=price_min,
            price__lte=price_max
        )

        extend(strict_qs)

        if len(results) < limit:
            same_sub_qs = base_qs.filter(
                subcategory=ad.subcategory
            )
            extend(same_sub_qs)

        if len(results) < limit:
            same_cat_qs = base_qs.filter(
                subcategory__category=ad.subcategory.category
            )
            extend(same_cat_qs)

        if len(results) < limit:
            extend(base_qs)

        return results[:limit]

class UserRecommender:
    @staticmethod
    def for_user(user, limit=20):
        viewed_ads = AdvertisementView.objects.filter(
            user=user
        ).values_list("ad_id", flat=True)

        liked_ads = AdvertisementLike.objects.filter(
            user=user
        ).values_list("ad_id", flat=True)

        subcategories = Advertisement.objects.filter(
            id__in=viewed_ads
        ).values_list("subcategory", flat=True)

        qs = (
            Advertisement.objects
            .filter(
                status="active",
                subcategory__in=subcategories
            )
            .exclude(owner=user)
            .annotate(
                popularity=F("views_count") + Count("ad_likes") * 5
            )
            .order_by("-popularity")
        )

        return qs[:limit]
