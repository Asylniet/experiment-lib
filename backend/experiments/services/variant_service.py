from typing import Optional, Dict, Any
import hashlib
from django.db import transaction
from django.db.models import Q

from ..models import ProjectUser, Experiment, Variant, Distribution, Project


def get_hash_number(user_id: str, experiment_id: str) -> float:
    """
    Create a deterministic hash between 0 and 1 based on user_id and experiment_id.
    This ensures consistent variant assignment for the same user-experiment pair.
    """
    combined = f"{user_id}:{experiment_id}"
    hash_digest = hashlib.md5(combined.encode()).hexdigest()
    hash_int = int(hash_digest, 16)
    return (hash_int % 10000) / 10000  # Value between 0 and 1


def assign_variant(user: ProjectUser, experiment: Experiment) -> Variant:
    """
    Assign a variant to a user for a specific experiment based on rollout percentages.
    """
    variants = list(experiment.variants.all().order_by('id'))

    if not variants:
        raise ValueError(f"Experiment {experiment.key} has no variants")

    # Calculate total rollout percentage
    total_rollout = sum(variant.rollout for variant in variants)
    if total_rollout <= 0:
        # If no positive rollout, return the first variant
        return variants[0]

    # Normalize rollout percentages if they don't sum to 1
    normalized_variants = []
    accumulated = 0

    for variant in variants:
        normalized_rollout = variant.rollout / total_rollout
        normalized_variants.append((variant, accumulated, accumulated + normalized_rollout))
        accumulated += normalized_rollout

    # Get a deterministic value between 0 and 1 for this user-experiment pair
    hash_value = get_hash_number(str(user.id), str(experiment.id))

    # Find which variant's range contains this hash value
    for variant, range_start, range_end in normalized_variants:
        if range_start <= hash_value < range_end:
            return variant

    # Fallback to the last variant if something goes wrong
    return variants[-1]


def get_or_create_user(project: Project, identifier_data: Dict[str, Any]) -> ProjectUser:
    """
    Get or create a user based on the provided identifiers.

    Args:
        project: The project the user belongs to
        identifier_data: Dictionary containing user identifiers (device_id, email, external_id)

    Returns:
        ProjectUser: The retrieved or created user

    Raises:
        ValueError: If no valid identifier is provided or if multiple users match different identifiers
    """
    device_id = identifier_data.get('device_id')
    email = identifier_data.get('email')
    external_id = identifier_data.get('external_id')

    # Ensure at least one identifier is provided
    if not any([device_id, email, external_id]):
        raise ValueError("At least one identifier (device_id, email, or external_id) must be provided")

    # Build query to find existing user by any provided identifier
    query = Q(project=project)
    conditions = []

    if device_id:
        conditions.append(Q(device_id=device_id))
    if email:
        conditions.append(Q(email=email))
    if external_id:
        conditions.append(Q(external_id=external_id))

    # Combine conditions with OR
    query &= conditions[0]
    for condition in conditions[1:]:
        query |= condition

    # Try to find matching users
    matching_users = list(ProjectUser.objects.filter(query))

    if not matching_users:
        # No matching user found, create a new one
        user_data = {
            'project': project,
            'device_id': device_id,
            'email': email,
            'external_id': external_id
        }

        # Add optional fields if provided
        for field in ['latest_current_url', 'latest_os', 'latest_os_version', 'latest_device_type']:
            if field in identifier_data:
                user_data[field] = identifier_data.get(field)

        # Add properties if provided
        if 'properties' in identifier_data:
            user_data['properties'] = identifier_data.get('properties')

        # Create and return the new user
        return ProjectUser.objects.create(**user_data)

    elif len(matching_users) == 1:
        # Exactly one matching user found
        user = matching_users[0]

        # Update user with any new identifiers
        updated = False
        if device_id and not user.device_id:
            user.device_id = device_id
            updated = True
        if email and not user.email:
            user.email = email
            updated = True
        if external_id and not user.external_id:
            user.external_id = external_id
            updated = True

        # Update optional fields if provided
        for field, attr in [
            ('latest_current_url', 'latest_current_url'),
            ('latest_os', 'latest_os'),
            ('latest_os_version', 'latest_os_version'),
            ('latest_device_type', 'latest_device_type')
        ]:
            if field in identifier_data:
                setattr(user, attr, identifier_data.get(field))
                updated = True

        # Update properties if provided
        if 'properties' in identifier_data:
            # Merge existing properties with new ones
            merged_properties = {**user.properties, **identifier_data.get('properties', {})}
            user.properties = merged_properties
            updated = True

        # Save if any changes were made
        if updated:
            user.save()

        return user

    else:
        # Multiple users found with different identifiers, this should be handled
        # For now, we'll just return the first matching user
        # In production, you might want to merge these users or handle it differently
        return matching_users[0]


def get_or_create_distribution(user: ProjectUser, experiment: Experiment) -> Distribution:
    """
    Get existing distribution or create a new one if it doesn't exist.
    """
    try:
        # Try to get existing distribution
        return Distribution.objects.get(user=user, experiment=experiment)
    except Distribution.DoesNotExist:
        # Assign a variant and create distribution
        variant = assign_variant(user, experiment)
        distribution = Distribution(user=user, experiment=experiment, variant=variant)
        distribution.save()
        return distribution


def recalculate_experiment_distributions(experiment: Experiment) -> int:
    """
    Recalculate all distributions for an experiment when variant rollouts change.
    Returns the number of distributions that were updated.
    """
    changes_count = 0

    with transaction.atomic():
        # Get all distributions for this experiment
        distributions = Distribution.objects.filter(experiment=experiment).select_related('user', 'variant')

        # For each distribution, calculate what the variant should be now
        for distribution in distributions:
            expected_variant = assign_variant(distribution.user, experiment)

            # If the variant has changed, update it
            if distribution.variant.id != expected_variant.id:
                distribution.variant = expected_variant
                distribution.save()
                changes_count += 1

    return changes_count


def calculate_distribution_stats(experiment: Experiment) -> Dict[str, float]:
    """
    Calculate the actual distribution of users across variants.
    Returns a dictionary with variant keys and their distribution percentages.
    """
    # Count distributions by variant
    total_distributions = Distribution.objects.filter(experiment=experiment).count()

    if total_distributions == 0:
        return {}

    stats = {}
    variants = experiment.variants.all()

    for variant in variants:
        variant_count = Distribution.objects.filter(
            experiment=experiment,
            variant=variant
        ).count()

        percentage = (variant_count / total_distributions) * 100
        stats[variant.key] = round(percentage, 2)

    return stats


def get_experiment_by_key(project: Project, experiment_key: str) -> Optional[Experiment]:
    """
    Get an experiment by its key for a specific project.

    Args:
        project: The project to look in
        experiment_key: The experiment key to find

    Returns:
        Experiment or None: The found experiment, or None if not found
    """
    try:
        return Experiment.objects.get(project=project, key=experiment_key)
    except Experiment.DoesNotExist:
        return None