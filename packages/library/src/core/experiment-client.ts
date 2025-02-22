import { StorageManager } from "@/core/storage-manager";
import { Experiment, User } from "@/types";
import { ApiClient } from "@/core/api-client";

export class ExperimentClient {
	private apiClient: ApiClient;
	private storageManager: StorageManager;
	
	constructor(apiClient: ApiClient, storageManager: StorageManager) {
		this.apiClient = apiClient;
		this.storageManager = storageManager;
	}
	
	public async initializeUser(userData: Partial<User>): Promise<User> {
		const storedUser = this.storageManager.getUser();
		
		if (storedUser) {
			return storedUser;
		}
		
		const user: Partial<User> = {
			device_id: userData.device_id || this.generateDeviceId(),
			...userData,
		};
		
		const initializedUser = await this.apiClient.identifyUser(user);
		
		this.storageManager.setUser(initializedUser);
		
		return initializedUser;
	}
	
	public async getVariant(experimentKey: Experiment['key']) {
		const storedVariant = this.storageManager.getVariant(experimentKey);
		
		if (storedVariant) {
			return storedVariant;
		}
		
		const user = this.storageManager.getUser();
		
		if (!user) {
			throw new Error("User not initialized");
		}
		
		const experiment = await this.apiClient.getVariant({experimentKey, user});
		
		this.storageManager.setVariant(experimentKey, experiment.variant);
		
		return experiment.variant;
	}
	
	private generateDeviceId(): string {
		return crypto.randomUUID();
	}
	
	public subscribeToUpdates(callback: (experiment: Experiment) => void): void {
		// TODO: Implement WebSockets
	}
}