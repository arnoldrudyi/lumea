from django.urls import path, include
from rest_framework.routers import DefaultRouter

from chat_session.views import ChatSessionViewSet


router = DefaultRouter()
router.register(r'', ChatSessionViewSet, basename='')

urlpatterns = [
    path('', include(router.urls))
]
