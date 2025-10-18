/**
 * @module Application/Stores
 * @description UI state store for global UI state management
 */

import { writable } from 'svelte/store';
import type { UIState, LoadingState, ErrorState } from '$lib/domain/dto/UIState';
import type { Toast, CreateToastPayload } from '$lib/domain/dto/Toast';

/**
 * Initial UI state
 */
const initialState: UIState = {
	toasts: [],
	isMobileMenuOpen: false,
	isCartDrawerOpen: false,
	loading: {
		isLoading: false
	},
	error: {
		hasError: false
	}
};

/**
 * Create UI store
 */
function createUIStore() {
	const { subscribe, set, update } = writable<UIState>(initialState);

	return {
		subscribe,

		/**
		 * Show a toast notification
		 * @param toast - Toast payload
		 * @returns Toast ID
		 */
		showToast(toast: CreateToastPayload): string {
			const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
			const duration = toast.duration ?? 5000;
			const dismissible = toast.dismissible ?? true;

			const newToast: Toast = {
				id,
				...toast,
				duration,
				dismissible
			};

			update((state) => ({
				...state,
				toasts: [...state.toasts, newToast]
			}));

			// Auto-dismiss if duration is positive
			if (duration > 0) {
				setTimeout(() => {
					this.dismissToast(id);
				}, duration);
			}

			return id;
		},

		/**
		 * Show success toast
		 * @param message - Success message
		 * @param title - Optional title
		 */
		showSuccess(message: string, title?: string) {
			return this.showToast({
				type: 'success',
				message,
				title
			});
		},

		/**
		 * Show error toast
		 * @param message - Error message
		 * @param title - Optional title
		 */
		showError(message: string, title?: string) {
			return this.showToast({
				type: 'error',
				message,
				title,
				duration: 7000 // Errors stay longer
			});
		},

		/**
		 * Show warning toast
		 * @param message - Warning message
		 * @param title - Optional title
		 */
		showWarning(message: string, title?: string) {
			return this.showToast({
				type: 'warning',
				message,
				title
			});
		},

		/**
		 * Show info toast
		 * @param message - Info message
		 * @param title - Optional title
		 */
		showInfo(message: string, title?: string) {
			return this.showToast({
				type: 'info',
				message,
				title
			});
		},

		/**
		 * Dismiss a specific toast
		 * @param id - Toast ID
		 */
		dismissToast(id: string) {
			update((state) => ({
				...state,
				toasts: state.toasts.filter((t) => t.id !== id)
			}));
		},

		/**
		 * Clear all toasts
		 */
		clearToasts() {
			update((state) => ({
				...state,
				toasts: []
			}));
		},

		/**
		 * Toggle mobile menu
		 */
		toggleMobileMenu() {
			update((state) => ({
				...state,
				isMobileMenuOpen: !state.isMobileMenuOpen
			}));
		},

		/**
		 * Close mobile menu
		 */
		closeMobileMenu() {
			update((state) => ({
				...state,
				isMobileMenuOpen: false
			}));
		},

		/**
		 * Toggle cart drawer
		 */
		toggleCartDrawer() {
			update((state) => ({
				...state,
				isCartDrawerOpen: !state.isCartDrawerOpen
			}));
		},

		/**
		 * Close cart drawer
		 */
		closeCartDrawer() {
			update((state) => ({
				...state,
				isCartDrawerOpen: false
			}));
		},

		/**
		 * Set loading state
		 * @param loading - Loading state
		 */
		setLoading(loading: LoadingState) {
			update((state) => ({
				...state,
				loading
			}));
		},

		/**
		 * Start loading
		 * @param message - Optional loading message
		 * @param operationId - Optional operation identifier
		 */
		startLoading(message?: string, operationId?: string) {
			this.setLoading({
				isLoading: true,
				message,
				operationId
			});
		},

		/**
		 * Stop loading
		 */
		stopLoading() {
			this.setLoading({
				isLoading: false
			});
		},

		/**
		 * Set error state
		 * @param error - Error state
		 */
		setError(error: ErrorState) {
			update((state) => ({
				...state,
				error
			}));
		},

		/**
		 * Show error
		 * @param message - Error message
		 * @param code - Optional error code
		 * @param retryable - Whether error can be retried
		 */
		showErrorState(message: string, code?: string, retryable?: boolean) {
			this.setError({
				hasError: true,
				message,
				code,
				retryable
			});
		},

		/**
		 * Clear error
		 */
		clearError() {
			this.setError({
				hasError: false
			});
		},

		/**
		 * Reset UI state to initial
		 */
		reset() {
			set(initialState);
		}
	};
}

/**
 * Global UI store instance
 */
export const uiStore = createUIStore();
