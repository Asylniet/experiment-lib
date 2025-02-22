import { StorageManager } from "@/core/storage-manager";
import { Experiment, ExperimentClientConfig, User } from "@/types";
import { ApiClient } from "@/core/api-client";
import { UserNotInitializedError } from "@/lib/errors";

export class ExperimentClient {
  private apiClient: ApiClient;
  public storageManager: StorageManager;
  public configs: ExperimentClientConfig;

  constructor(
    apiClient: ApiClient,
    storageManager: StorageManager,
    configs?: ExperimentClientConfig,
  ) {
    const DEFAULT_CONFIGS: ExperimentClientConfig = {
      backgroundFetch: true,
    } as const;

    this.apiClient = apiClient;
    this.storageManager = storageManager;
    this.configs = { ...DEFAULT_CONFIGS, ...configs };
  }

  public async initializeUser(userData?: Partial<User>): Promise<User> {
    const storedUser = this.storageManager.getUser();

    if (storedUser) {
      return storedUser;
    }

    const user: Partial<User> = {
      device_id: userData?.device_id || this.getDeviceId(),
      ...userData,
    };

    const initializedUser = await this.apiClient.identifyUser(user);

    this.storageManager.setUser(initializedUser);

    return initializedUser;
  }

  public async fetchVariant(experimentKey: Experiment["key"]) {
    const user = this.storageManager.getUser();

    if (!user) {
      throw new UserNotInitializedError("User not initialized");
    }

    const experiment = await this.apiClient.getVariant({ experimentKey, user });

    this.storageManager.setVariant(experimentKey, experiment.variant);

    return experiment.variant;
  }

  private getDeviceId(): string {
    const storedDeviceId = this.storageManager.getDeviceId();

    if (storedDeviceId) {
      return storedDeviceId;
    }

    const newDeviceId = crypto.randomUUID();
    this.storageManager.setDeviceId(newDeviceId);

    return newDeviceId;
  }

  public subscribeToUpdates(callback: (experiment: Experiment) => void): void {
    // TODO: Implement WebSockets
  }
}
