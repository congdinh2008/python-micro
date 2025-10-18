/**
 * @module Application/UseCases
 * @description Remove from cart use case with undo support
 */

import type { ICartRepository } from '$lib/domain/interfaces/ICartRepository';
import type { CartItem, CartOperationResult } from '$lib/domain/entities/Cart';

/**
 * Remove from cart use case
 */
export class RemoveFromCartUseCase {
	constructor(private cartRepository: ICartRepository) {}

	/**
	 * Execute remove from cart operation
	 * @param productId - Product ID to remove
	 */
	async execute(productId: number): Promise<CartOperationResult> {
		try {
			// Get the item before removing (for undo support)
			const existingItem = await this.cartRepository.getByProductId(productId);

			if (!existingItem) {
				return {
					success: false,
					error: 'Item not found in cart'
				};
			}

			// Remove the item
			await this.cartRepository.remove(productId);

			return {
				success: true,
				previousState: existingItem
			};
		} catch (error) {
			console.error('RemoveFromCartUseCase error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to remove item from cart'
			};
		}
	}

	/**
	 * Undo remove operation - restore the item
	 * @param item - Item to restore
	 */
	async undo(item: CartItem): Promise<CartOperationResult> {
		try {
			await this.cartRepository.add(item);

			return {
				success: true,
				item
			};
		} catch (error) {
			console.error('RemoveFromCartUseCase undo error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to undo remove operation'
			};
		}
	}
}
