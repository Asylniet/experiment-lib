from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from admin_views import (
    AdminProjectViewSet,
    AdminExperimentViewSet,
    AdminVariantViewSet,
    AdminProjectUserViewSet,
    AdminDistributionViewSet
)
from library_views import (
    ExperimentVariantAPIView,
    UserExperimentsAPIView
)

# Create a router for admin viewsets
admin_router = DefaultRouter()
admin_router.register(r'projects', AdminProjectViewSet)
admin_router.register(r'experiments', AdminExperimentViewSet)
admin_router.register(r'variants', AdminVariantViewSet)
admin_router.register(r'users', AdminProjectUserViewSet)
admin_router.register(r'distributions', AdminDistributionViewSet)

urlpatterns = [
    # Admin API endpoints (JWT protected)
    path('admin/api/', include(admin_router.urls)),

    # JWT authentication endpoints
    path('admin/api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('admin/api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Library API endpoints (API key protected)
    path(
        'api/experiment/<str:experiment_key>/variant',
        ExperimentVariantAPIView.as_view(),
        name='experiment_variant'
    ),
    path(
        'api/experiments',
        UserExperimentsAPIView.as_view(),
        name='user_experiments'
    ),
]