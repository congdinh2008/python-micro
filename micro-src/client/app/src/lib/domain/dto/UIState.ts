/**
 * @module Domain/DTO
 * @description UI state data transfer objects
 */

import type { Toast } from './Toast';

/**
 * Loading state interface
 */
export interface LoadingState {
	/**
	 * Whether the UI is in a loading state
	 */
	isLoading: boolean;

	/**
	 * Optional loading message
	 */
	message?: string;

	/**
	 * Optional operation identifier
	 */
	operationId?: string;
}

/**
 * Error state interface
 */
export interface ErrorState {
	/**
	 * Whether there is an error
	 */
	hasError: boolean;

	/**
	 * Error message
	 */
	message?: string;

	/**
	 * Error code or type
	 */
	code?: string;

	/**
	 * Whether error can be retried
	 */
	retryable?: boolean;
}

/**
 * UI state interface
 * @description Global UI state for the application
 */
export interface UIState {
	/**
	 * Active toast notifications
	 */
	toasts: Toast[];

	/**
	 * Mobile menu open state
	 */
	isMobileMenuOpen: boolean;

	/**
	 * Cart drawer open state
	 */
	isCartDrawerOpen: boolean;

	/**
	 * Global loading state
	 */
	loading: LoadingState;

	/**
	 * Global error state
	 */
	error: ErrorState;

	/**
	 * Current theme (light/dark)
	 */
	theme?: 'light' | 'dark';
}
