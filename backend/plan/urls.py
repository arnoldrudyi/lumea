from django.urls import path, include
from rest_framework.routers import DefaultRouter

from plan.views import SubtopicViewSet, PlanViewSet


router = DefaultRouter()
router.register(r'', PlanViewSet, basename='')
router.register(r'subtopics', SubtopicViewSet)

urlpatterns = [
    path('', include(router.urls))
]
