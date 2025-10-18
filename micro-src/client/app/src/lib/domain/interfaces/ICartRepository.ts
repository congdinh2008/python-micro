/**
 * @module Domain/Interfaces
 * @description Cart repository interface
 */

import type { CartItem, CartState } from '../entities/Cart';

/**
 * Cart repository interface for data persistence operations
 */
export interface ICartRepository {
	/**
	 * Get all cart items
	 */
	getAll(): Promise<CartItem[]>;

	/**
	 * Get cart item by product ID
	 */
	getByProductId(productId: number): Promise<CartItem | null>;

	/**
	 * Add item to cart
	 */
	add(item: CartItem): Promise<void>;

	/**
	 * Update cart item
	 */
	update(item: CartItem): Promise<void>;

	/**
	 * Remove item from cart by product ID
	 */
	remove(productId: number): Promise<void>;

	/**
	 * Clear all cart items
	 */
	clear(): Promise<void>;

	/**
	 * Get cart state (items + metadata)
	 */
	getState(): Promise<CartState>;

	/**
	 * Save cart state
	 */
	saveState(state: CartState): Promise<void>;

	/**
	 * Sync cart with backend (when user is authenticated)
	 */
	syncWithBackend?(token: string): Promise<void>;
}
