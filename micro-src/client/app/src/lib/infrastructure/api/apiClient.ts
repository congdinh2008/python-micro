/**
 * @module Infrastructure/API
 * @description Centralized HTTP client with interceptors and error handling
 */

import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig } from 'axios';

/**
 * API error class for better error handling
 */
export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public type: 'validation' | 'network' | 'server' = 'server'
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/**
 * API Client configuration
 */
interface ApiClientConfig {
	baseURL: string;
	timeout?: number;
}

/**
 * Centralized API client with retry logic and error handling
 */
export class ApiClient {
	private client: AxiosInstance;
	private maxRetries = 3;
	private retryDelay = 1000;

	constructor(config: ApiClientConfig) {
		this.client = axios.create({
			baseURL: config.baseURL,
			timeout: config.timeout || 10000,
			headers: {
				'Content-Type': 'application/json'
			}
		});

		this.setupInterceptors();
	}

	/**
	 * Setup request and response interceptors
	 */
	private setupInterceptors(): void {
		// Request interceptor
		this.client.interceptors.request.use(
			(config) => {
				// Add any auth tokens if available (for future use)
				const token = this.getAuthToken();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// Response interceptor
		this.client.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				return this.handleError(error);
			}
		);
	}

	/**
	 * Get authentication token from storage
	 */
	private getAuthToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('auth_token');
		}
		return null;
	}

	/**
	 * Handle API errors with proper categorization
	 */
	private handleError(error: AxiosError): Promise<never> {
		let apiError: ApiError;

		if (!error.response) {
			// Network error
			apiError = new ApiError('Network error. Please check your connection.', undefined, 'network');
		} else if (error.response.status === 400) {
			// Validation error
			const detail = (error.response.data as { detail?: string })?.detail || 'Validation failed';
			apiError = new ApiError(detail, 400, 'validation');
		} else if (error.response.status === 422) {
			// Unprocessable entity (validation)
			const errors = (error.response.data as { detail?: unknown })?.detail;
			const message = Array.isArray(errors) && errors[0] && typeof errors[0] === 'object' && 'msg' in errors[0] 
				? (errors[0].msg as string) || 'Validation error' 
				: 'Validation error';
			apiError = new ApiError(message, 422, 'validation');
		} else if (error.response.status >= 500) {
			// Server error
			apiError = new ApiError('Server error. Please try again later.', error.response.status, 'server');
		} else {
			// Other errors
			const detail = (error.response.data as { detail?: string })?.detail || error.message;
			apiError = new ApiError(detail, error.response.status, 'server');
		}

		return Promise.reject(apiError);
	}

	/**
	 * Retry logic for failed requests
	 */
	private async retryRequest<T>(
		requestFn: () => Promise<T>,
		retries: number = this.maxRetries
	): Promise<T> {
		try {
			return await requestFn();
		} catch (error) {
			if (error instanceof ApiError && error.type === 'network' && retries > 0) {
				await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
				return this.retryRequest(requestFn, retries - 1);
			}
			throw error;
		}
	}

	/**
	 * GET request
	 */
	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return this.retryRequest(async () => {
			const response = await this.client.get<T>(url, config);
			return response.data;
		});
	}

	/**
	 * POST request
	 */
	async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		return this.retryRequest(async () => {
			const response = await this.client.post<T>(url, data, config);
			return response.data;
		});
	}

	/**
	 * PUT request
	 */
	async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		return this.retryRequest(async () => {
			const response = await this.client.put<T>(url, data, config);
			return response.data;
		});
	}

	/**
	 * DELETE request
	 */
	async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return this.retryRequest(async () => {
			const response = await this.client.delete<T>(url, config);
			return response.data;
		});
	}
}

/**
 * Create API client instance for User Service
 */
export const userServiceApi = new ApiClient({
	baseURL: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8001',
	timeout: 10000
});

/**
 * Create API client instance for Product Service
 */
export const productServiceApi = new ApiClient({
	baseURL: import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8002',
	timeout: 10000
});

/**
 * Create API client instance for Order Service
 */
export const orderServiceApi = new ApiClient({
	baseURL: import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8003',
	timeout: 10000
});
