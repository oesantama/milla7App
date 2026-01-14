# ruta: backend/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CurrentUserProfileView, ChangePasswordView

router = DefaultRouter()
router.register(r'usuarios', UserViewSet, basename='usuario')

urlpatterns = [
    path('profile/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]