/**
 * @module Application/UseCases
 * @description Update cart quantity use case with validation
 */

import type { ICartRepository } from '$lib/domain/interfaces/ICartRepository';
import type { CartItem, CartOperationResult } from '$lib/domain/entities/Cart';
import {
	updateQuantitySchema,
	validateQuantityAgainstStock
} from '$lib/domain/validation/cartSchema';

/**
 * Update cart quantity use case
 */
export class UpdateCartQuantityUseCase {
	constructor(private cartRepository: ICartRepository) {}

	/**
	 * Execute update quantity operation
	 * @param productId - Product ID to update
	 * @param quantity - New quantity
	 */
	async execute(productId: number, quantity: number): Promise<CartOperationResult> {
		try {
			// Validate input
			const validation = updateQuantitySchema.safeParse({
				productId,
				quantity
			});

			if (!validation.success) {
				return {
					success: false,
					error: validation.error.errors[0].message
				};
			}

			// Get existing item
			const existingItem = await this.cartRepository.getByProductId(productId);

			if (!existingItem) {
				return {
					success: false,
					error: 'Item not found in cart'
				};
			}

			// Validate quantity against stock
			const stockValidation = validateQuantityAgainstStock(quantity, existingItem.maxStock);
			if (!stockValidation.valid) {
				return {
					success: false,
					error: stockValidation.error
				};
			}

			// Update the item
			const updatedItem: CartItem = {
				...existingItem,
				quantity
			};

			await this.cartRepository.update(updatedItem);

			return {
				success: true,
				item: updatedItem,
				previousState: existingItem
			};
		} catch (error) {
			console.error('UpdateCartQuantityUseCase error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update cart quantity'
			};
		}
	}
}
