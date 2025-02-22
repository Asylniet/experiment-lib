from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction

from .models import Variant
from .services.variant_service import recalculate_experiment_distributions


@receiver(post_save, sender=Variant)
def variant_saved(sender, instance, created, **kwargs):
    """
    When a variant is created or updated, trigger recalculation of distributions
    for the associated experiment.
    """
    # Use transaction.on_commit to ensure this runs after the current transaction completes
    transaction.on_commit(lambda: handle_variant_change(instance, created))


@receiver(post_delete, sender=Variant)
def variant_deleted(sender, instance, **kwargs):
    """
    When a variant is deleted, trigger recalculation of distributions
    for the associated experiment.
    """
    # Use transaction.on_commit to ensure this runs after the current transaction completes
    transaction.on_commit(lambda: handle_variant_change(instance, False))


def handle_variant_change(variant, created):
    """
    Handle variant changes by recalculating distributions if needed.
    """
    # Get the experiment associated with this variant
    experiment = variant.experiment

    # Only recalculate if the experiment is running
    if experiment.status == "running":
        # Log that recalculation is happening
        action = "created" if created else "updated or deleted"
        print(f"Variant {variant.key} was {action}. Recalculating distributions for experiment {experiment.key}.")

        # Recalculate distributions
        changed_count = recalculate_experiment_distributions(experiment)
        print(f"Updated {changed_count} distributions for experiment {experiment.key}.")