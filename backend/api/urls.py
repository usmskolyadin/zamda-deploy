from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    AdBySlugView, CategoryViewSet, ChatViewSet, CurrentUserView, CustomTokenObtainPairView, GoogleAuthView, MessageViewSet, NotificationViewSet, PageViewSet, PasswordResetConfirmView, PasswordResetRequestView, RegisterRequestView, RegisterView, ReviewReplyViewSet, ReviewReportViewSet, ReviewViewSet, SendNewsletterToAllView, SendNewsletterToSelectedView, SubCategoryViewSet, ExtraFieldDefinitionViewSet, AdvertisementViewSet, UserAdvertisementViewSet, UserProfileViewSet, VerifyCodeView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()

router.register('categories', CategoryViewSet)
router.register('subcategories', SubCategoryViewSet)
router.register('field-definitions', ExtraFieldDefinitionViewSet)
router.register('ads', AdvertisementViewSet)
router.register("chats", ChatViewSet)
router.register("messages", MessageViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'review-replies', ReviewReplyViewSet)
router.register(r'review-reports', ReviewReportViewSet)
router.register("pages", PageViewSet, basename="pages")

urlpatterns = [
    path('', include(router.urls)),
    path("advertising/<slug:slug>/", AdBySlugView.as_view()),
    path("newsletter/send-all/", SendNewsletterToAllView.as_view(), name="send-all"),
    path("newsletter/send-selected/", SendNewsletterToSelectedView.as_view(), name="send-selected"),

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', CurrentUserView.as_view(), name='current_user'), 
    path('register/request/', RegisterRequestView.as_view(), name='register_request'),
    path('register/verify/', VerifyCodeView.as_view(), name='register_verify'),
    path("auth/google/", GoogleAuthView.as_view()),
    path("password/reset/request/", PasswordResetRequestView.as_view()),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view()),
]
