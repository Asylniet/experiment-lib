from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from experiments.models import Project, Experiment, Variant, ProjectUser, Distribution
from experiments.serializers import (
    ProjectSerializer,
    ExperimentSerializer,
    VariantSerializer,
    ProjectUserSerializer,
    DistributionSerializer,
)
from experiments.services.variant_service import (
    calculate_distribution_stats,
    recalculate_experiment_distributions
)


class AdminViewSetMixin:
    """
    Mixin for admin viewsets to set authentication and permission classes.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Restrict all admin viewsets to only show objects owned by the current user.
        """
        queryset = super().get_queryset()

        # If the model has an owner field, filter by it
        if hasattr(self.get_serializer().Meta.model, 'owner'):
            return queryset.filter(owner=self.request.user)

        # If the model has a project field that has an owner field, filter by it
        if hasattr(self.get_serializer().Meta.model, 'project'):
            return queryset.filter(project__owner=self.request.user)

        # Otherwise, return an empty queryset for safety
        return self.get_serializer().Meta.model.objects.none()


class AdminProjectViewSet(AdminViewSetMixin, viewsets.ModelViewSet):
    """
    Admin API endpoint for managing projects.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        # Set the owner to the current user
        serializer.save(owner=self.request.user)


class AdminExperimentViewSet(AdminViewSetMixin, viewsets.ModelViewSet):
    """
    Admin API endpoint for managing experiments.
    """
    queryset = Experiment.objects.all()
    serializer_class = ExperimentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by project if provided
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        # Filter by status if provided
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get distribution statistics for an experiment."""
        experiment = self.get_object()
        stats = calculate_distribution_stats(experiment)
        return Response({
            'experiment': {
                'id': str(experiment.id),
                'key': experiment.key,
                'name': experiment.name
            },
            'stats': stats
        })

    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Trigger recalculation of variant distributions for an experiment."""
        experiment = self.get_object()

        # Perform recalculation
        changes_count = recalculate_experiment_distributions(experiment)

        # Get updated stats
        stats = calculate_distribution_stats(experiment)

        return Response({
            'message': f"Recalculation completed. Updated {changes_count} distributions.",
            'experiment': {
                'id': str(experiment.id),
                'key': experiment.key,
                'name': experiment.name
            },
            'stats': stats
        })


class AdminVariantViewSet(AdminViewSetMixin, viewsets.ModelViewSet):
    """
    Admin API endpoint for managing variants.
    """
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by experiment if provided
        experiment_id = self.request.query_params.get('experiment_id')
        if experiment_id:
            queryset = queryset.filter(experiment_id=experiment_id)

        return queryset


class AdminProjectUserViewSet(AdminViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """
    Admin API endpoint for viewing project users.
    Read-only since users are created via the library endpoints.
    """
    queryset = ProjectUser.objects.all()
    serializer_class = ProjectUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by project if provided
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        # Filter by identifiers if provided
        device_id = self.request.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)

        email = self.request.query_params.get('email')
        if email:
            queryset = queryset.filter(email=email)

        external_id = self.request.query_params.get('external_id')
        if external_id:
            queryset = queryset.filter(external_id=external_id)

        return queryset

    @action(detail=True, methods=['get'])
    def distributions(self, request, pk=None):
        """Get all experiment distributions for a user."""
        user = self.get_object()

        # Get all distributions for this user
        distributions = Distribution.objects.filter(user=user).select_related('experiment', 'variant')

        # Format the response
        data = []
        for dist in distributions:
            data.append({
                'experiment': {
                    'id': str(dist.experiment.id),
                    'key': dist.experiment.key,
                    'name': dist.experiment.name
                },
                'variant': {
                    'id': str(dist.variant.id),
                    'key': dist.variant.key,
                    'payload': dist.variant.payload
                }
            })

        return Response(data)


class AdminDistributionViewSet(AdminViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """
    Admin API endpoint for viewing distributions.
    Read-only since distributions are managed by the library logic.
    """
    queryset = Distribution.objects.all()
    serializer_class = DistributionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by experiment if provided
        experiment_id = self.request.query_params.get('experiment_id')
        if experiment_id:
            queryset = queryset.filter(experiment_id=experiment_id)

        # Filter by user if provided
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Filter by variant if provided
        variant_id = self.request.query_params.get('variant_id')
        if variant_id:
            queryset = queryset.filter(variant_id=variant_id)

        return queryset