from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

from .views import CustomTokenObtainPairView, AccountRegistrationAPIView, AccountLoginAPIView


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='jwt_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='jwt_refresh'),
    path('register/', AccountRegistrationAPIView.as_view(), name='account_register'),
    path('login/', AccountLoginAPIView.as_view(), name='account_login'),
    path('logout/', TokenBlacklistView.as_view(), name='account_logout')
]
