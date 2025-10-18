/**
 * @module Application/UseCases
 * @description Checkout use case with validation and double-submit prevention
 */

import type { IOrderRepository } from '$lib/domain/interfaces/IOrderRepository';
import type { CartItem } from '$lib/domain/entities/Cart';
import type { CheckoutResult, Order } from '$lib/domain/entities/Order';
import { checkoutSchema } from '$lib/domain/validation/checkoutSchema';
import { ApiError } from '$lib/infrastructure/api/apiClient';

/**
 * Checkout state for double-submit prevention
 */
class CheckoutState {
	private isProcessing = false;
	private lastCheckoutTime = 0;
	private readonly MIN_TIME_BETWEEN_CHECKOUTS = 2000; // 2 seconds

	/**
	 * Check if checkout is in progress
	 */
	isInProgress(): boolean {
		return this.isProcessing;
	}

	/**
	 * Check if checkout can be started (rate limiting)
	 */
	canStartCheckout(): boolean {
		const now = Date.now();
		const timeSinceLastCheckout = now - this.lastCheckoutTime;
		return timeSinceLastCheckout >= this.MIN_TIME_BETWEEN_CHECKOUTS;
	}

	/**
	 * Start checkout process
	 */
	startCheckout(): void {
		this.isProcessing = true;
		this.lastCheckoutTime = Date.now();
	}

	/**
	 * End checkout process
	 */
	endCheckout(): void {
		this.isProcessing = false;
	}
}

/**
 * Checkout use case with validation and security features
 */
export class CheckoutUseCase {
	private static checkoutState = new CheckoutState();

	constructor(private orderRepository: IOrderRepository) {}

	/**
	 * Validate cart items before checkout
	 */
	private validateCart(items: CartItem[]): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		// Validate cart is not empty
		if (items.length === 0) {
			errors.push('Cart is empty');
			return { valid: false, errors };
		}

		// Validate each item
		for (const item of items) {
			// Check quantity is positive
			if (item.quantity <= 0) {
				errors.push(`Invalid quantity for ${item.name}`);
			}

			// Check quantity doesn't exceed stock
			if (item.quantity > item.maxStock) {
				errors.push(`Insufficient stock for ${item.name}. Available: ${item.maxStock}`);
			}

			// Check price is valid
			if (item.price <= 0) {
				errors.push(`Invalid price for ${item.name}`);
			}
		}

		return { valid: errors.length === 0, errors };
	}

	/**
	 * Execute checkout process
	 * @param items - Cart items to checkout
	 * @returns Checkout result with orders or errors
	 */
	async execute(items: CartItem[]): Promise<CheckoutResult> {
		// Double-submit prevention
		if (CheckoutUseCase.checkoutState.isInProgress()) {
			return {
				success: false,
				error: 'Checkout is already in progress. Please wait.'
			};
		}

		// Rate limiting
		if (!CheckoutUseCase.checkoutState.canStartCheckout()) {
			return {
				success: false,
				error: 'Please wait a moment before checking out again.'
			};
		}

		try {
			// Start checkout
			CheckoutUseCase.checkoutState.startCheckout();

			// Validate input schema
			const validation = checkoutSchema.safeParse({ items });
			if (!validation.success) {
				return {
					success: false,
					error: validation.error.errors[0]?.message || 'Invalid checkout data'
				};
			}

			// Validate cart items
			const cartValidation = this.validateCart(items);
			if (!cartValidation.valid) {
				return {
					success: false,
					error: cartValidation.errors.join(', ')
				};
			}

			// Create orders for each item
			const orders: Order[] = [];
			const failedItems: { productId: number; error: string }[] = [];

			for (const item of items) {
				try {
					const order = await this.orderRepository.create({
						product_id: item.productId,
						quantity: item.quantity
					});
					orders.push(order);
				} catch (error) {
					console.error(`Failed to create order for product ${item.productId}:`, error);

					// Extract error message
					let errorMessage = 'Failed to create order';
					if (error instanceof ApiError) {
						errorMessage = error.message;
					} else if (error instanceof Error) {
						errorMessage = error.message;
					}

					failedItems.push({
						productId: item.productId,
						error: errorMessage
					});
				}
			}

			// Check if all orders succeeded
			if (orders.length === 0) {
				return {
					success: false,
					error: 'Failed to create any orders. Please try again.',
					failedItems
				};
			}

			// Partial success if some items failed
			if (failedItems.length > 0) {
				return {
					success: true,
					orders,
					failedItems,
					error: `${failedItems.length} item(s) failed to checkout`
				};
			}

			// Complete success
			return {
				success: true,
				orders
			};
		} catch (error) {
			console.error('Checkout error:', error);

			let errorMessage = 'Checkout failed. Please try again.';
			if (error instanceof ApiError) {
				errorMessage = error.message;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			return {
				success: false,
				error: errorMessage
			};
		} finally {
			// Always end checkout state
			CheckoutUseCase.checkoutState.endCheckout();
		}
	}

	/**
	 * Check if checkout is in progress
	 */
	isCheckoutInProgress(): boolean {
		return CheckoutUseCase.checkoutState.isInProgress();
	}
}
