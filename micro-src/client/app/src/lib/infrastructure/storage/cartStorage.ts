/**
 * @module Infrastructure/Storage
 * @description Cart storage adapter for localStorage
 */

import { browser } from '$app/environment';
import type { CartItem, CartState } from '$lib/domain/entities/Cart';

const CART_STORAGE_KEY = 'shopping_cart';

/**
 * Save cart to localStorage
 */
export function saveCart(items: CartItem[]): void {
	if (!browser) return;

	try {
		const state: CartState = {
			items,
			updatedAt: Date.now()
		};
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.error('Failed to save cart to localStorage:', error);
	}
}

/**
 * Get cart from localStorage
 */
export function getCart(): CartItem[] {
	if (!browser) return [];

	try {
		const stored = localStorage.getItem(CART_STORAGE_KEY);
		if (!stored) return [];

		const state: CartState = JSON.parse(stored);
		return Array.isArray(state.items) ? state.items : [];
	} catch (error) {
		console.error('Failed to parse cart from localStorage:', error);
		return [];
	}
}

/**
 * Get full cart state from localStorage
 */
export function getCartState(): CartState {
	if (!browser) {
		return {
			items: [],
			updatedAt: Date.now()
		};
	}

	try {
		const stored = localStorage.getItem(CART_STORAGE_KEY);
		if (!stored) {
			return {
				items: [],
				updatedAt: Date.now()
			};
		}

		const state: CartState = JSON.parse(stored);
		return {
			items: Array.isArray(state.items) ? state.items : [],
			updatedAt: state.updatedAt || Date.now()
		};
	} catch (error) {
		console.error('Failed to parse cart state from localStorage:', error);
		return {
			items: [],
			updatedAt: Date.now()
		};
	}
}

/**
 * Save cart state to localStorage
 */
export function saveCartState(state: CartState): void {
	if (!browser) return;

	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.error('Failed to save cart state to localStorage:', error);
	}
}

/**
 * Clear cart from localStorage
 */
export function clearCart(): void {
	if (!browser) return;

	try {
		localStorage.removeItem(CART_STORAGE_KEY);
	} catch (error) {
		console.error('Failed to clear cart from localStorage:', error);
	}
}
