from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from django.shortcuts import get_object_or_404

from .models import User, Project, Experiment, Variant, Distribution
from .serializers import (
    UserSerializer,
    ProjectSerializer,
    ExperimentSerializer,
    VariantSerializer,
    DistributionSerializer,
    ExperimentVariantResponseSerializer,
    UserUpdateSerializer
)
from .services.variant_service import (
    get_or_create_distribution,
    calculate_distribution_stats,
    recalculate_experiment_distributions
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing projects.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class ExperimentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing experiments.
    """
    queryset = Experiment.objects.all()
    serializer_class = ExperimentSerializer

    def get_queryset(self):
        queryset = Experiment.objects.all()

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

        # Only allow recalculation for running experiments
        if experiment.status != "running":
            return Response({
                "error": "Only running experiments can be recalculated",
                "status": experiment.status
            }, status=status.HTTP_400_BAD_REQUEST)

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


class VariantViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing variants.
    """
    queryset = Variant.objects.all()
    serializer_class = VariantSerializer

    def get_queryset(self):
        queryset = Variant.objects.all()

        # Filter by experiment if provided
        experiment_id = self.request.query_params.get('experiment_id')
        if experiment_id:
            queryset = queryset.filter(experiment_id=experiment_id)

        return queryset


class ExperimentVariantAPIView(APIView):
    """
    API endpoint to get or assign a variant for a user in an experiment.
    """

    def get(self, request, experiment_id):
        """Get the variant for a user in an experiment."""
        # Validate and parse request data
        user_serializer = UserUpdateSerializer(data=request.query_params)
        if not user_serializer.is_valid():
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = user_serializer.validated_data

        try:
            # Get the experiment
            experiment = get_object_or_404(Experiment, id=experiment_id)

            # Ensure experiment is running
            if experiment.status != "running":
                return Response({
                    "error": "Experiment is not running",
                    "status": experiment.status
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get or create user
            user, created = User.objects.get_or_create(id=validated_data['user_id'])

            # Update user metadata if provided
            update_fields = []
            if 'current_url' in validated_data:
                user.latest_current_url = validated_data['current_url']
                update_fields.append('latest_current_url')
            if 'os' in validated_data:
                user.latest_os = validated_data['os']
                update_fields.append('latest_os')
            if 'os_version' in validated_data:
                user.latest_os_version = validated_data['os_version']
                update_fields.append('latest_os_version')
            if 'device_type' in validated_data:
                user.latest_device_type = validated_data['device_type']
                update_fields.append('latest_device_type')

            # Save user if fields were updated
            if update_fields:
                user.save(update_fields=update_fields + ['last_seen'])

            # Get or create distribution
            distribution = get_or_create_distribution(user, experiment)

            # Prepare and return the response
            response_data = {
                'experiment': experiment,
                'variant': distribution.variant
            }

            serializer = ExperimentVariantResponseSerializer(response_data)
            return Response(serializer.data)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=['get'])
    def experiments(self, request, pk=None):
        """Get all experiments and variants for a user."""
        user = self.get_object()

        # Get all distributions for this user
        distributions = Distribution.objects.filter(user=user).select_related('experiment', 'variant')

        # Format the response
        experiments_data = []
        for dist in distributions:
            experiments_data.append({
                'experiment': {
                    'id': str(dist.experiment.id),
                    'key': dist.experiment.key,
                    'name': dist.experiment.name,
                    'status': dist.experiment.status,
                },
                'variant': {
                    'id': str(dist.variant.id),
                    'key': dist.variant.key,
                    'payload': dist.variant.payload
                }
            })

        return Response({
            'user_id': str(user.id),
            'experiments': experiments_data
        })