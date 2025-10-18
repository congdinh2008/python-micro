/**
 * @module Domain/DTO
 * @description Toast notification data transfer object
 */

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification interface
 * @description Represents a toast notification message
 */
export interface Toast {
	/**
	 * Unique identifier for the toast
	 */
	id: string;

	/**
	 * Type of notification
	 */
	type: ToastType;

	/**
	 * Message to display
	 */
	message: string;

	/**
	 * Optional duration in milliseconds (default: 5000)
	 * Set to 0 or negative for no auto-dismiss
	 */
	duration?: number;

	/**
	 * Optional title for the toast
	 */
	title?: string;

	/**
	 * Whether toast can be manually dismissed
	 */
	dismissible?: boolean;
}

/**
 * Create toast payload (without id)
 */
export type CreateToastPayload = Omit<Toast, 'id'>;
