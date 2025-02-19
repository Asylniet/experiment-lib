import { z } from "zod";
import { ExperimentConfig, ExperimentProviderConfig, User, Variant } from "@/types";

export const experimentProviderConfigSchema: z.ZodType<ExperimentProviderConfig> = z.object({
	host: z.string().url(),
	apiKey: z.string(),
	defaultVariant: z.union([z.literal('control'), z.string()]).optional(),
	storage: z.any().optional(),
});

export const variantSchema: z.ZodType<Variant> = z.object({
	name: z.string(),
	weight: z.number(),
	config: z.record(z.string(), z.any()).optional(),
});

export const experimentConfigSchema: z.ZodType<ExperimentConfig> = z.object({
	name: z.string(),
	variants: z.array(variantSchema),
	isActive: z.boolean(),
});

export const userSchema: z.ZodType<User> = z.object({
	id: z.string(),
	traits: z.record(z.string(), z.any()).optional(),
});