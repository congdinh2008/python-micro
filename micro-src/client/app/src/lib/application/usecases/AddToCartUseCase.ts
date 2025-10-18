/**
 * @module Application/UseCases
 * @description Add to cart use case with validation
 */

import type { ICartRepository } from '$lib/domain/interfaces/ICartRepository';
import type { CartItem, CartOperationResult } from '$lib/domain/entities/Cart';
import type { Product } from '$lib/domain/entities/Product';
import { addToCartSchema, validateQuantityAgainstStock } from '$lib/domain/validation/cartSchema';

/**
 * Add to cart use case
 */
export class AddToCartUseCase {
	constructor(private cartRepository: ICartRepository) {}

	/**
	 * Execute add to cart operation
	 * @param product - Product to add
	 * @param quantity - Quantity to add (default: 1)
	 */
	async execute(product: Product, quantity: number = 1): Promise<CartOperationResult> {
		try {
			// Validate input
			const validation = addToCartSchema.safeParse({
				productId: product.id,
				name: product.name,
				price: product.price,
				quantity,
				maxStock: product.quantity
			});

			if (!validation.success) {
				return {
					success: false,
					error: validation.error.errors[0].message
				};
			}

			// Validate quantity against stock
			const stockValidation = validateQuantityAgainstStock(quantity, product.quantity);
			if (!stockValidation.valid) {
				return {
					success: false,
					error: stockValidation.error
				};
			}

			// Check if item already exists in cart
			const existingItem = await this.cartRepository.getByProductId(product.id);

			if (existingItem) {
				// Merge quantities
				const newQuantity = existingItem.quantity + quantity;

				// Validate merged quantity
				const mergeValidation = validateQuantityAgainstStock(newQuantity, product.quantity);
				if (!mergeValidation.valid) {
					return {
						success: false,
						error: mergeValidation.error
					};
				}

				const updatedItem: CartItem = {
					...existingItem,
					quantity: newQuantity,
					price: product.price, // Update price in case it changed
					maxStock: product.quantity
				};

				await this.cartRepository.update(updatedItem);

				return {
					success: true,
					item: updatedItem,
					previousState: existingItem
				};
			} else {
				// Create new cart item
				const cartItem: CartItem = {
					id: Date.now(), // Generate unique ID
					productId: product.id,
					name: product.name,
					price: product.price,
					quantity,
					maxStock: product.quantity,
					imageUrl: undefined // Can be added later when product images are implemented
				};

				await this.cartRepository.add(cartItem);

				return {
					success: true,
					item: cartItem
				};
			}
		} catch (error) {
			console.error('AddToCartUseCase error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to add item to cart'
			};
		}
	}
}
