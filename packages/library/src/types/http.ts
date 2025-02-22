import { AxiosRequestConfig } from "axios";

export interface RetryConfig {
  attempts: number;
  initialDelay: number;
  maxDelay: number;
  shouldRetry: (error: unknown) => boolean;
}

export type InterceptorHeader = {
  key: string;
  value: string;
};

export interface HttpClientConfig {
  baseURL: string;
  headers: InterceptorHeader[];
  timeout?: number;
  retry?: Partial<RetryConfig>;
}

export interface RequestOptions
  extends Omit<AxiosRequestConfig, "baseURL" | "cancelToken"> {
  skipRetry?: boolean;
}
