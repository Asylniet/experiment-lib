import { Experiment } from "@/types";
import { useExperimentClient } from "@/react/experiment-context";
import { useQuery } from "@/react/useQuery";
import React from "react";

export const useGetVariant = (experimentKey: Experiment["key"]) => {
  const client = useExperimentClient();
  const storedVariant = React.useMemo(
    () => client.storageManager.getVariant(experimentKey),
    [experimentKey],
  );

  const { data, error, isLoading } = useQuery(async () => {
    if (!client.configs.backgroundFetch) {
      return storedVariant;
    }

    const latestVariant = await client.fetchVariant(experimentKey);
    if (latestVariant !== storedVariant) {
      client.storageManager.setVariant(experimentKey, latestVariant);
    }
    return latestVariant;
  }, [experimentKey, client.configs.backgroundFetch]);

  return {
    data: data ?? storedVariant,
    error: storedVariant ? undefined : error,
    isLoading: storedVariant ? false : isLoading,
  };
};
