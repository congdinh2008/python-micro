/**
 * @module Infrastructure/Repositories
 * @description Cart repository implementation using localStorage
 */

import type { ICartRepository } from '$lib/domain/interfaces/ICartRepository';
import type { CartItem, CartState } from '$lib/domain/entities/Cart';
import {
	getCart,
	saveCart,
	clearCart as clearCartStorage,
	getCartState,
	saveCartState
} from '../storage/cartStorage';

/**
 * Cart repository implementation using localStorage
 */
export class CartRepository implements ICartRepository {
	/**
	 * Get all cart items
	 */
	async getAll(): Promise<CartItem[]> {
		return getCart();
	}

	/**
	 * Get cart item by product ID
	 */
	async getByProductId(productId: number): Promise<CartItem | null> {
		const items = getCart();
		return items.find((item) => item.productId === productId) || null;
	}

	/**
	 * Add item to cart
	 */
	async add(item: CartItem): Promise<void> {
		const items = getCart();
		
		// Check if item already exists
		const existingIndex = items.findIndex((i) => i.productId === item.productId);
		
		if (existingIndex >= 0) {
			// Update existing item
			items[existingIndex] = item;
		} else {
			// Add new item
			items.push(item);
		}
		
		saveCart(items);
	}

	/**
	 * Update cart item
	 */
	async update(item: CartItem): Promise<void> {
		const items = getCart();
		const index = items.findIndex((i) => i.productId === item.productId);
		
		if (index >= 0) {
			items[index] = item;
			saveCart(items);
		}
	}

	/**
	 * Remove item from cart by product ID
	 */
	async remove(productId: number): Promise<void> {
		const items = getCart();
		const filtered = items.filter((item) => item.productId !== productId);
		saveCart(filtered);
	}

	/**
	 * Clear all cart items
	 */
	async clear(): Promise<void> {
		clearCartStorage();
	}

	/**
	 * Get cart state (items + metadata)
	 */
	async getState(): Promise<CartState> {
		return getCartState();
	}

	/**
	 * Save cart state
	 */
	async saveState(state: CartState): Promise<void> {
		saveCartState(state);
	}

	/**
	 * Sync cart with backend (placeholder for future implementation)
	 * This would sync the cart with backend when user is authenticated
	 */
	async syncWithBackend(token: string): Promise<void> {
		// TODO: Implement backend sync
		// This would call the backend API to sync cart items
		// For now, we're using localStorage only
		console.log('Backend sync not yet implemented. Token:', token);
	}
}
