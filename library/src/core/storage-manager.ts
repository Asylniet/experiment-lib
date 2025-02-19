import { User } from "src/types";
import { STORAGE_KEY_PREFIX } from "@/lib/constants";


export class StorageManager {
	private storage: Storage;
	private prefix = STORAGE_KEY_PREFIX;
	
	constructor(storage: Storage) {
		this.storage = storage;
	}
	
	public setUser(user: User): void {
		this.storage.setItem(`${this.prefix}user`, JSON.stringify(user));
	}
	
	public getUser(): User | null {
		const userData = this.storage.getItem(`${this.prefix}user`);
		return userData ? JSON.parse(userData) : null;
	}
	
	public setVariant(experimentName: string, variant: string): void {
		const variants = this.getVariants();
		variants[experimentName] = variant;
		this.storage.setItem(`${this.prefix}variants`, JSON.stringify(variants));
	}
	
	public getVariant(experimentName: string): string | null {
		const variants = this.getVariants();
		return variants[experimentName] || null;
	}
	
	private getVariants(): Record<string, string> {
		const variantsData = this.storage.getItem(`${this.prefix}variants`);
		return variantsData ? JSON.parse(variantsData) : {};
	}
}