import secrets

from rest_framework import serializers
from .models import Project, Experiment, Variant, ProjectUser, Distribution, AdminUser


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUser
        fields = ['id', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id']


class ProjectUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectUser
        fields = [
            'id', 'project', 'device_id', 'email', 'external_id',
            'first_seen', 'last_seen', 'latest_current_url',
            'latest_os', 'latest_os_version', 'latest_device_type',
            'properties'
        ]
        read_only_fields = ['id', 'first_seen', 'last_seen']


class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variant
        fields = ['id', 'key', 'payload', 'rollout', 'experiment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExperimentSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)

    class Meta:
        model = Experiment
        fields = [
            'id', 'key', 'name', 'description', 'status', 'type',
            'project', 'variants', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'type': {'read_only': True}
        }


class ProjectSerializer(serializers.ModelSerializer):
    experiments = ExperimentSerializer(many=True, read_only=True)
    owner = AdminUserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'api_key', 'owner', 'experiments', 'created_at', 'updated_at']
        read_only_fields = ['id', 'api_key', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Create a new project and assign API key."""
        validated_data['api_key'] = secrets.token_hex(16)
        return super().create(validated_data)


class DistributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distribution
        fields = ['id', 'user', 'experiment', 'variant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExperimentVariantResponseSerializer(serializers.Serializer):
    """Serializer for experiment variant response"""
    experiment = serializers.SerializerMethodField()
    variant = serializers.SerializerMethodField()

    def get_experiment(self, obj):
        return {
            'id': str(obj['experiment'].id),
            'key': obj['experiment'].key,
            'name': obj['experiment'].name
        }

    def get_variant(self, obj):
        return {
            'id': str(obj['variant'].id),
            'key': obj['variant'].key,
            'payload': obj['variant'].payload
        }


class UserResponseSerializer(serializers.Serializer):
    """
    Serializer for user response after identification.
    """
    id = serializers.CharField(required=False, allow_blank=False, allow_null=True)
    device_id = serializers.CharField(required=False, allow_blank=False, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=False, allow_null=True)
    external_id = serializers.CharField(required=False, allow_blank=False, allow_null=True)
    # Optional user metadata
    latest_current_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    latest_os = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=50)
    latest_os_version = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=50)
    latest_device_type = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=50)
    # Additional properties as a dictionary
    properties = serializers.DictField(required=False, allow_null=True)


class UserIdentifierSerializer(UserResponseSerializer, serializers.Serializer):
    """
    Serializer for user identification.
    At least one of device_id, email, or external_id must be provided.
    """
    def validate(self, data):
        """
        Check that at least one identifier is provided.
        """
        if not any([
            data.get('id'),
            data.get('device_id'),
            data.get('email'),
            data.get('external_id')
        ]):
            raise serializers.ValidationError(
                "At least one identifier (device_id, email, or external_id) must be provided"
            )
        return data
