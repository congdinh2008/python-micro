/**
 * @module Application/UseCases
 * @description Clear cart use case
 */

import type { ICartRepository } from '$lib/domain/interfaces/ICartRepository';
import type { CartOperationResult } from '$lib/domain/entities/Cart';

/**
 * Clear cart use case
 */
export class ClearCartUseCase {
	constructor(private cartRepository: ICartRepository) {}

	/**
	 * Execute clear cart operation
	 */
	async execute(): Promise<CartOperationResult> {
		try {
			// Get all items before clearing (for undo support if needed)
			const items = await this.cartRepository.getAll();

			// Clear the cart
			await this.cartRepository.clear();

			return {
				success: true
			};
		} catch (error) {
			console.error('ClearCartUseCase error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to clear cart'
			};
		}
	}
}
