import { HttpClient } from "@/core/http-client";
import { StorageManager } from "@/core/storage-manager";
import { Experiment, User } from "@/types";

export class ExperimentClient {
	private httpClient: HttpClient;
	private storageManager: StorageManager;
	
	constructor(httpClient: HttpClient, storageManager: StorageManager) {
		this.httpClient = httpClient;
		this.storageManager = storageManager;
	}
	
	public async initializeUser(userData: Partial<User>): Promise<User> {
		const storedUser = this.storageManager.getUser();
		
		if (storedUser) {
			return storedUser;
		}
		
		const user: User = {
			id: userData.id || this.generateUserId(),
			email: userData.email || "",
		};
		
		await this.httpClient.request({
			method: "POST",
			url: "/api/users",
			data: user,
		});
		
		this.storageManager.setUser(user);
		
		return user;
	}
	
	public async updateUser(userData: Partial<User>): Promise<User> {
		const user = this.storageManager.getUser();
		
		if (!user) {
			throw new Error("User not initialized");
		}
		
		const updatedUser: User = {
			...user,
			...userData,
		};
		
		await this.httpClient.request({
			method: "PUT",
			url: `/api/users/${user.id}`,
			data: updatedUser,
		});
		
		this.storageManager.setUser(updatedUser);
		
		return updatedUser;
	}
	
	public async getVariant(experimentName: string): Promise<string> {
		const storedVariant = this.storageManager.getVariant(experimentName);
		
		if (storedVariant) {
			return storedVariant;
		}
		
		const user = this.storageManager.getUser();
		
		if (!user) {
			throw new Error("User not initialized");
		}
		
		const experiment = await this.httpClient.request<Experiment>({
			method: "GET",
			url: `/api/experiments/${experimentName}`,
			params: { userId: user.id },
		});
		
		this.storageManager.setVariant(experimentName, experiment.variant);
		
		return experiment.variant;
	}
	
	private generateUserId(): string {
		// TODO: Implement a more robust user ID generation
		return Math.random().toString(36).substring(7);
	}
	
	public subscribeToUpdates(callback: (experiment: Experiment) => void): void {
		// TODO: Implement WebSockets
	}
}