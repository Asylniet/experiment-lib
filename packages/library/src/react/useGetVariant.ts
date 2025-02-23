import { Experiment, Variant } from "@/types";
import { useExperimentClient } from "@/react/experiment-context";
import { useQuery } from "@/react/useQuery";
import React from "react";

export function useGetVariant(
  experimentKey: string,
  options: {
    refetchOnMount?: boolean;
    defaultVariant?: Variant | null;
  } = {},
) {
  const experimentClient = useExperimentClient();
  // Default options
  const { refetchOnMount = false, defaultVariant = null } = options;

  // Use state to track the current variant
  const [variant, setVariant] = React.useState<Variant | null>(
    experimentClient.storageManager.getVariant(experimentKey) || defaultVariant,
  );

  // Keep track of experiment metadata
  const [experiment, setExperiment] = React.useState<Experiment | null>(null);

  // Only fetch on mount if requested or if we don't have a variant
  const shouldFetch =
    refetchOnMount || !variant || !experimentClient.configs.backgroundFetch;

  // Use the query hook to handle loading, error states
  const query = useQuery(
    () => {
      if (shouldFetch) {
        return experimentClient.fetchVariant(experimentKey);
      }

      return Promise.resolve(variant);
    },
    // Only add experimentKey to deps, we control refetching via the enabled flag
    [experimentKey, shouldFetch],
  );

  // Update local state when query completes successfully
  React.useEffect(() => {
    if (query.data && !query.isLoading) {
      setVariant(query.data);
    }
  }, [query.data, query.isLoading]);

  // Set up WebSocket subscription for updates
  React.useEffect(() => {
    // Handler for WebSocket updates
    const handleVariantUpdate = (
      experimentData: Experiment,
      variantData: Variant,
    ) => {
      setExperiment(experimentData);
      setVariant(variantData);
      experimentClient.storageManager.setVariant(experimentKey, variantData);
    };

    // Subscribe to WebSocket updates
    const unsubscribe = experimentClient.subscribeToExperiment(
      experimentKey,
      handleVariantUpdate,
    );

    // Clean up subscription on unmount
    return unsubscribe;
  }, [experimentClient, experimentKey]);

  // Derive helpful flags
  const isA = variant?.key === "A";
  const isB = variant?.key === "B";
  const isControl = variant?.key === "control";
  const isVariant = variant?.key === "variant";
  const isEnabled = variant?.key === "enabled";
  const isDisabled = variant?.key === "disabled";

  // Extract payload
  const payload = variant?.payload;

  // Function to force a refresh
  const refreshVariant = React.useCallback(async () => {
    try {
      const freshVariant = await experimentClient.fetchVariant(experimentKey);
      setVariant(freshVariant);
      return freshVariant;
    } catch (error) {
      console.error(`Error refreshing variant for ${experimentKey}:`, error);
      throw error;
    }
  }, [experimentClient, experimentKey]);

  return {
    // Main data
    variant,
    experiment,
    payload,

    // Query states
    isLoading: query.isLoading,
    error: query.error,

    // Helper flags
    isA,
    isB,
    isControl,
    isVariant,
    isEnabled,
    isDisabled,

    // Actions
    refresh: refreshVariant,
  };
}
