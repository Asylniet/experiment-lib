export interface ExperimentProviderConfig {
	host: string;
	apiKey: string;
	defaultVariant?: "control" | string;
	storage?: Storage;
}

export interface Variant {
	name: string;
	weight: number;
	config?: Record<string, unknown>;
}

export interface ExperimentConfig {
	name: string;
	variants: Variant[];
	isActive: boolean;
}

export interface User {
	id: string;
	email: string;
	meta?: Record<string, unknown>;
}

export interface Experiment {
	variant: string;
}

export interface ABTestingInstance {
	getVariant: (experimentName: string) => string;
}