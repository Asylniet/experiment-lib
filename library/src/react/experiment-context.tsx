import React from "react";
import { ExperimentProviderConfig } from "@/types";
import { ExperimentClient } from "@/core/experiment-client";
import { ApiClient } from "@/core/api-client";
import { HttpClient } from "@/core/http-client";
import { StorageManager } from "@/core/storage-manager";

type ExperimentContextType = ExperimentClient;

const ExperimentContext = React.createContext<ExperimentContextType | undefined>(undefined);

export const ExperimentProvider: React.FC<React.PropsWithChildren<ExperimentProviderConfig>> = ({children, apiKey, host, storage}) => {
	const apiClient = new ApiClient(new HttpClient({
		baseURL: host,
		headers: [{
			key: 'X-API-KEY',
			value: apiKey,
		}]
	}));
	
	const client = new ExperimentClient(apiClient, new StorageManager(localStorage));
	
	const memoizedClient = React.useMemo(() => client, [client]);
	
	return (
		<ExperimentContext.Provider value={memoizedClient}>
			{children}
		</ExperimentContext.Provider>
	);
};

export const useExperimentClient = () => {
	const context = React.useContext(ExperimentContext);
	if (!context) {
		throw new Error('useExperimentClient must be used within a ExperimentProvider');
	}
	return context;
};