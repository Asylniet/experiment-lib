import React from "react";
import { Experiment, Variant } from "@/types";
import { useExperimentClient } from "@/react/experiment-context";
import { useQuery } from "@/react/useQuery";

export const useGetVariant = (experimentKey: Experiment['key']) => {
	const client = useExperimentClient();
	const [variant, setVariant] = React.useState<Variant>();

	return useQuery(() => client.getVariant(experimentKey));
}