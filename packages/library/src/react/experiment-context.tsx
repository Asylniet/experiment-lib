import React from "react";
import { ExperimentProviderConfig } from "@/types";
import { ExperimentClient } from "@/core/experiment-client";
import { ApiClient } from "@/core/api-client";
import { HttpClient } from "@/core/http-client";
import { StorageManager } from "@/core/storage-manager";

type ExperimentContextType = ExperimentClient;

const ExperimentContext = React.createContext<
  ExperimentContextType | undefined
>(undefined);

type ExperimentProviderProps =
  React.PropsWithChildren<ExperimentProviderConfig>;

export const ExperimentProvider: React.FC<ExperimentProviderProps> = ({
  children,
  apiKey,
  host,
  storage = localStorage,
  configs,
}) => {
  const client = new ExperimentClient({
    host,
    apiKey,
    storageManager: new StorageManager(storage),
    configs,
  });

  client.initializeUser();

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
    throw new Error(
      "useExperimentClient must be used within a ExperimentProvider",
    );
  }
  return context;
};
