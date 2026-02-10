import os
from django.forms import ValidationError
from django.shortcuts import render
from django.db import IntegrityError

from api.services.recommendations import AdvertisementRecommender

from .pagination import AdvertisementPagination
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import AdvertisementLike, AdvertisementStatus, AdvertisementView, Category, Chat, NotificationUserState, PasswordResetCode, Review, SubCategory, ExtraFieldDefinition, Advertisement, Message, UserProfile
from .serializers import (
    CategorySerializer, ChatSerializer, MessageSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, ProfileSerializer, ReportSerializer, ReviewSerializer, SubCategorySerializer,
    ExtraFieldDefinitionSerializer, AdvertisementSerializer
)
from .permissions import IsOwnerOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter
import logging
import requests
from django.conf import settings
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"detail": "No code provided"}, status=400)

        token_res = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            },
        )

        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return Response(token_data, status=400)

        userinfo = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        ).json()

        email = userinfo["email"]
        name = userinfo.get("name", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={"username": email, "first_name": name},
        )
        if created or not hasattr(user, 'profile'):
            UserProfile.objects.get_or_create(user=user)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name,
            }
        })
from rest_framework.permissions import AllowAny

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    lookup_value_regex = "[^/]+"

import django_filters

class SubCategoryFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug", lookup_expr="iexact")

    class Meta:
        model = SubCategory
        fields = ["category"]

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.select_related('category').all()
    serializer_class = SubCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name']
    lookup_field = "slug"
    lookup_value_regex = "[^/]+"
    filterset_class = SubCategoryFilter

    @action(detail=True, methods=["get"])
    def fields(self, request, slug=None):
        subcategory = self.get_object()
        fields = subcategory.extra_fields.all()
        serializer = ExtraFieldDefinitionSerializer(fields, many=True)
        return Response(serializer.data)
    

class ExtraFieldDefinitionViewSet(viewsets.ModelViewSet):
    queryset = ExtraFieldDefinition.objects.select_related('subcategory').prefetch_related('options')
    serializer_class = ExtraFieldDefinitionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'subcategory__slug': ['exact'],
    }
    search_fields = ['name', 'key']


class AdvertisementFilter(FilterSet):
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    subcategory = django_filters.CharFilter(field_name="subcategory__slug", lookup_expr="iexact")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    owner_username = django_filters.CharFilter(field_name="owner__username", lookup_expr="iexact")
    owner_email = django_filters.CharFilter(field_name="owner__email", lookup_expr="iexact")
    extra = django_filters.CharFilter(method="filter_extra")

    def filter_extra(self, queryset, name, value):
        """
        ?extra=memory:128,color:black
        """
        pairs = value.split(",")

        for pair in pairs:
            key, raw_value = pair.split(":", 1)

            queryset = queryset.filter(
                extra_values__field_definition__key=key,
                extra_values__value=raw_value
            )

        return queryset

    class Meta:
        model = Advertisement
        fields = ["subcategory", "location", "price_min", "price_max", "created_after", 'subcategory__category', 'owner_username', 'owner_email']

from django.db.models import F, ExpressionWrapper, DurationField
from django.utils.timezone import now
from django.utils.timezone import now
from datetime import timedelta, timezone
from django.utils.timezone import now
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.permissions import SAFE_METHODS, BasePermission
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
    
EXPIRATION_DAYS = 30
ACTIVE_LIFETIME_DAYS = 30
ARCHIVE_LIFETIME_DAYS = 30
REJECTED_LIFETIME_DAYS = 30

class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer
    permission_classes = [IsOwnerOrReadOnly]
    pagination_class = AdvertisementPagination

    lookup_field = "slug"
    lookup_value_regex = "[^/]+"

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = AdvertisementFilter

    search_fields = [
        "title",
        "description",
        "owner__username",
    ]

    ordering_fields = ["created_at", "price"]
    ordering = ["-created_at"]

    def filter_extra(self, queryset, name, value):
        for key, val in value.items():
            queryset = queryset.filter(extra_values__field_definition__key=key, extra_values__value=val)
        return queryset
    

    def get_permissions(self):
        if self.action in ["list", "retrieve", "similar"]:
            return [AllowAny()]
        if self.action in ["my_ads", "liked"]:
            return [IsAuthenticated()]
        if self.action in ["update", "partial_update", "destroy", "relist"]:
            return [IsAuthenticated(), IsOwner()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = (
            Advertisement.objects
            .select_related("owner", "subcategory__category")
            .prefetch_related("images", "likes", "extra_values__field_definition")
        )

        now_ts = now()

        qs.filter(
            status=AdvertisementStatus.ACTIVE,
            created_at__lte=now_ts - timedelta(days=ACTIVE_LIFETIME_DAYS)
        ).update(
            status=AdvertisementStatus.ARCHIVED,
            status_changed_at=now_ts
        )

        qs.filter(
            status=AdvertisementStatus.ARCHIVED,
            status_changed_at__lte=now_ts - timedelta(days=ARCHIVE_LIFETIME_DAYS)
        ).delete()

        qs.filter(
            status=AdvertisementStatus.REJECTED,
            status_changed_at__lte=now_ts - timedelta(days=REJECTED_LIFETIME_DAYS)
        ).delete()

        if self.action in ["update", "partial_update", "destroy", "relist"]:
            return qs.filter(owner=self.request.user)

        if self.action == "retrieve":
            if self.request.user.is_authenticated:
                return qs.filter(
                    Q(status=AdvertisementStatus.ACTIVE) |
                    Q(owner=self.request.user)
                )
            return qs.filter(status=AdvertisementStatus.ACTIVE)

        return qs.filter(status=AdvertisementStatus.ACTIVE)

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="similar"
    )
    def similar(self, request, slug=None):
        """
        Похожие объявления
        GET /ads/{slug}/similar/
        """
        ad = self.get_object()

        qs = AdvertisementRecommender.similar(ad)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="my/counts",
    )
    def my_counts(self, request):
        """
        Количество объявлений пользователя по статусам
        """
        qs = (
            Advertisement.objects
            .filter(owner=request.user)
            .values("status")
            .annotate(count=Count("id"))
        )

        # значения по умолчанию
        result = {
            AdvertisementStatus.ACTIVE: 0,
            AdvertisementStatus.ARCHIVED: 0,
            AdvertisementStatus.MODERATION: 0,
            AdvertisementStatus.REJECTED: 0,
        }

        for row in qs:
            result[row["status"]] = row["count"]

        return Response({
            "active": result[AdvertisementStatus.ACTIVE],
            "archived": result[AdvertisementStatus.ARCHIVED],
            "moderation": result[AdvertisementStatus.MODERATION],
            "rejected": result[AdvertisementStatus.REJECTED],
        })

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated], url_path="my")
    def my_ads(self, request):
        """
        ЛК пользователя:
        - Active объявления
        - Archived объявления
        - Moderation и Rejected объявления
        """
        qs = (
            Advertisement.objects
            .filter(owner=request.user)
            .select_related("subcategory__category")
            .prefetch_related("images", "likes", "extra_values__field_definition")
            .order_by("-created_at")
        )

        # Фильтр по вкладкам через query param
        tab = request.query_params.get("tab", "active").lower()
        if tab == "active":
            qs = qs.filter(status=AdvertisementStatus.ACTIVE)
        elif tab == "archived":
            qs = qs.filter(status=AdvertisementStatus.ARCHIVED)
        elif tab == "moderation":
            qs = qs.filter(status=AdvertisementStatus.MODERATION)
        elif tab == "rejected":
            qs = qs.filter(status=AdvertisementStatus.REJECTED)
        # если tab не передан — возвращаем все статусы кроме архивных
        else:
            qs = qs.exclude(status=AdvertisementStatus.ARCHIVED)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def like(self, request, slug=None):
        ad = self.get_object()
        user = request.user

        if ad.likes.filter(id=user.id).exists():
            ad.likes.remove(user)
            return Response({
                "detail": "Unliked",
                "likes_count": ad.likes.count()
            })

        ad.likes.add(user)
        return Response({
            "detail": "Liked",
            "likes_count": ad.likes.count()
        })

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def relist(self, request, slug=None):
        ad = self.get_object()

        if ad.owner != request.user:
            return Response({"detail": "Forbidden"}, status=403)

        ad.created_at = now()
        ad.status = AdvertisementStatus.MODERATION
        ad.reject_reason = None
        ad.save(update_fields=["created_at", "status", "reject_reason", "status_changed_at"])

        return Response({"detail": "Sent to moderation"})

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
    
    def retrieve(self, request, slug=None):
        ad = self.get_object()
        serializer = self.get_serializer(ad)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        
    import logging
    logger = logging.getLogger(__name__)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.exception("Error")
            return Response({"detail": str(e)}, status=500)
        
    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def view(self, request, slug=None):
        ad = self.get_object()
        user = request.user if request.user.is_authenticated else None

        ip = (
            request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0]
            or request.META.get("REMOTE_ADDR")
        )

        if user:
            obj, created = AdvertisementView.objects.get_or_create(
                ad=ad,
                user=user
            )
        else:
            obj, created = AdvertisementView.objects.get_or_create(
                ad=ad,
                ip_address=ip,
                user=None
            )

        if created:
            ad.views_count = F("views_count") + 1
            ad.save(update_fields=["views_count"])
            ad.refresh_from_db(fields=["views_count"])

        return Response({
            "detail": "View counted",
            "views_count": ad.views_count
        })

        
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def liked(self, request):
        """
        Возвращает все объявления, лайкнутые текущим пользователем.
        Только активные (неархивные) объявления учитываются по умолчанию.
        Можно передавать status=archived для архива.
        """
        user = request.user
        status = request.query_params.get("status", "active").lower()
        expiration_border = now() - timedelta(days=EXPIRATION_DAYS)

        qs = Advertisement.objects.filter(likes=user).select_related(
            "owner", "subcategory__category"
        ).prefetch_related(
            "likes", "extra_values__field_definition", "images"
        )

        if status == "active":
            qs = qs.filter(
                status=AdvertisementStatus.ACTIVE,
                created_at__gt=expiration_border
            )
        elif status == "archived":
            qs = qs.filter(
                status=AdvertisementStatus.ARCHIVED,
                created_at__lte=expiration_border
            )
        elif status == "moderation":
            qs = qs.filter(status=AdvertisementStatus.MODERATION)
        elif status == "rejected":
            qs = qs.filter(status=AdvertisementStatus.REJECTED)
        else:
            qs = qs.none()

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

        
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": serializer.data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })
    
class UserAdvertisementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AdvertisementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Advertisement.objects.filter(owner=self.request.user)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import ProfileSerializer
        profile = request.user.profile
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "profile": ProfileSerializer(profile, context={"request": request}).data
        })

    def patch(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.email = request.data.get("email", user.email)
        user.save()

        if profile:
            profile.city = request.data.get("city", profile.city)
            if "avatar" in request.FILES:
                profile.avatar = request.FILES["avatar"]
            profile.save()

        return Response({"detail": "Profile updated successfully."}, status=status.HTTP_200_OK)

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all() 
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        ).prefetch_related("messages", "buyer__profile", "seller__profile")

    def perform_create(self, serializer):
        ad = serializer.validated_data["ad"]
        buyer = self.request.user
        seller = ad.owner

        if buyer == seller:
            raise ValidationError("Нельзя создать чат с самим собой")

        chat, created = Chat.objects.get_or_create(
            ad=ad,
            buyer=buyer,
            seller=seller
        )
        serializer.instance = chat
        if created:
            serializer.save(buyer=buyer, seller=seller)
    
    from django.db.models import Q

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = Message.objects.filter(
            Q(chat__buyer=request.user) | Q(chat__seller=request.user),
            is_read=False
        ).exclude(sender=request.user).count()
        return Response({"unread_count": count})
    
    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        chat = self.get_object()
        unread = chat.messages.filter(is_read=False).exclude(sender=request.user)
        count = unread.count()
        unread.update(is_read=True)
        return Response({"marked_as_read": count})
    
    @action(detail=True, methods=["post"], url_path="block")
    def block_user(self, request, pk=None):
        chat = self.get_object()
        blocked_user = chat.buyer if chat.seller == request.user else chat.seller
        chat.delete()
        return Response({"detail": f"User {blocked_user.username} blocked and chat deleted"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="report")
    def report_user(self, request, pk=None):
        chat = self.get_object()

        reported_user = chat.buyer if chat.seller == request.user else chat.seller

        print("RAW BODY:", request.body)
        print("PARSED DATA:", request.data)

        serializer = ReportSerializer(data=request.data)
        if not serializer.is_valid():
            print("SERIALIZER ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)

        serializer.save(
            reporter=request.user,
            reported_user=reported_user,
            chat=chat,
        )

        return Response({"ok": True}, status=201)


from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets

def ensure_global_notifications(user):
    global_notifications = Notification.objects.filter(is_global=True)

    existing_ids = NotificationUserState.objects.filter(
        user=user,
        notification__in=global_notifications
    ).values_list("notification_id", flat=True)

    to_create = [
        NotificationUserState(user=user, notification=n)
        for n in global_notifications
        if n.id not in existing_ids
    ]

    NotificationUserState.objects.bulk_create(to_create)

class NotificationViewSet(viewsets.ModelViewSet):  # <- ModelViewSet вместо ReadOnly
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ensure_global_notifications(self.request.user) 
        return NotificationUserState.objects.select_related("notification").filter(
            user=self.request.user,
            is_deleted=False
        ).order_by("-created_at")

    def destroy(self, request, *args, **kwargs):
        state = self.get_object()
        state.is_deleted = True
        state.save(update_fields=["is_deleted"])
        return Response(status=204)

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        ensure_global_notifications(request.user)

        count = NotificationUserState.objects.filter(
            user=request.user,
            is_read=False,
            is_deleted=False
        ).count()

        return Response({"unread_count": count})


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    from django.db.models import Q

    def get_queryset(self):
        chat_id = self.request.query_params.get('chat')
        if chat_id:
            chat_id = int(chat_id)
            return Message.objects.filter(
                Q(chat_id=chat_id) & (Q(chat__buyer=self.request.user) | Q(chat__seller=self.request.user))
            )

        return Message.objects.none()
            
    def perform_create(self, serializer):
        chat_id = serializer.validated_data.get('chat')
        chat_obj = get_object_or_404(Chat, id=chat_id.id if hasattr(chat_id, 'id') else chat_id)
        
        if self.request.user != chat_obj.buyer and self.request.user != chat_obj.seller:
            raise ValidationError("You are not a participant of this chat")
        
        serializer.save(sender=self.request.user, chat=chat_obj)
        
    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            return response
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"detail": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.prefetch_related('reviews').all()
    serializer_class = ProfileSerializer

    def list(self, request, *args, **kwargs):
        return Response(
            {"detail": "Method not allowed."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
import random
from django.core.mail import send_mail
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import EmailVerification
from .serializers import RegisterRequestSerializer, VerifyCodeSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from django.template.loader import render_to_string
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from .models import EmailVerification
from .serializers import RegisterRequestSerializer

class RegisterRequestView(generics.GenericAPIView):
    serializer_class = RegisterRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        logger.error("RegisterRequestView started with data: %s", request.data)

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            data = serializer.validated_data
            code = str(random.randint(100000, 999999))

            logger.error("Generated code %s for %s", code, data["email"])

            EmailVerification.objects.update_or_create(
                email=data["email"],
                defaults={
                    "code": code,
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "password": make_password(data["password"]),
                },
            )

            html_content = render_to_string(
                "emails/verify_email.html",
                {
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "code": code,
                },
            )

            message = Mail(
                from_email="support@zamda.net",
                to_emails=data["email"],
                subject="ZAMDA — Confirm your registration",
                html_content=html_content,
            )

            sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
            response = sg.send(message)

            logger.error("SendGrid response: %s", response.status_code)

            return Response(
                {"detail": "Verification code sent to email."},
                status=200,
            )

        except Exception:
            logger.exception("ERROR IN REGISTER REQUEST")
            return Response({"detail": "Server error"}, status=500)
        
        
class VerifyCodeView(generics.GenericAPIView):
    serializer_class = VerifyCodeSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        try:
            record = EmailVerification.objects.get(email=email)
        except EmailVerification.DoesNotExist:
            return Response({"detail": "No verification request found."}, status=400)

        if record.is_expired():
            record.delete()
            return Response({"detail": "Code expired."}, status=400)

        if record.code != code:
            return Response({"detail": "Invalid code."}, status=400)

        user = User.objects.create(
            username=email,
            email=email,
            first_name=record.first_name,
            last_name=record.last_name,
            password=record.password,
        )

        record.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=201)
    
class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=400)

        code = str(random.randint(100000, 999999))

        PasswordResetCode.objects.update_or_create(
            email=email,
            defaults={"code": code},
        )

        html = render_to_string("emails/reset_password.html", {
            "code": code,
            "email": email,
        })

        message = Mail(
            from_email="support@zamda.net",
            to_emails=email,
            subject="ZAMDA — Password reset",
            html_content=html,
        )

        SendGridAPIClient(os.getenv("SENDGRID_API_KEY")).send(message)

        return Response({"detail": "Reset code sent"}, status=200)

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]
        new_password = serializer.validated_data["new_password"]

        try:
            record = PasswordResetCode.objects.get(email=email)
        except PasswordResetCode.DoesNotExist:
            return Response({"detail": "Invalid request"}, status=400)

        if record.is_expired():
            record.delete()
            return Response({"detail": "Code expired"}, status=400)

        if record.code != code:
            return Response({"detail": "Invalid code"}, status=400)

        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()

        record.delete()

        return Response({"detail": "Password updated"}, status=200)

class MyAdsCountsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Advertisement.objects.filter(owner=user)

        return Response({
            "active": qs.filter(status="active").count(),
            "archived": qs.filter(status="archived").count(),
            "moderation": qs.filter(status="moderation").count(),
            "rejected": qs.filter(status="rejected").count(),
        })
