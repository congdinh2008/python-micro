/**
 * @module Application/Stores
 * @description Cart store for global cart state management
 */

import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { CartItem, CartTotals } from '$lib/domain/entities/Cart';
import type { Product } from '$lib/domain/entities/Product';
import { CartRepository } from '$lib/infrastructure/repositories/CartRepository';
import { AddToCartUseCase } from '../usecases/AddToCartUseCase';
import { RemoveFromCartUseCase } from '../usecases/RemoveFromCartUseCase';
import { UpdateCartQuantityUseCase } from '../usecases/UpdateCartQuantityUseCase';
import { ClearCartUseCase } from '../usecases/ClearCartUseCase';

/**
 * Cart store state
 */
interface CartStoreState {
	items: CartItem[];
	lastRemovedItem: CartItem | null;
	loading: boolean;
	error: string | null;
}

/**
 * Create cart store
 */
function createCartStore() {
	const initialState: CartStoreState = {
		items: [],
		lastRemovedItem: null,
		loading: false,
		error: null
	};

	const { subscribe, set, update } = writable<CartStoreState>(initialState);

	// Initialize repository and use cases
	const cartRepository = new CartRepository();
	const addToCartUseCase = new AddToCartUseCase(cartRepository);
	const removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository);
	const updateQuantityUseCase = new UpdateCartQuantityUseCase(cartRepository);
	const clearCartUseCase = new ClearCartUseCase(cartRepository);

	// Load cart from localStorage on initialization
	if (browser) {
		cartRepository.getAll().then((items) => {
			update((state) => ({
				...state,
				items
			}));
		});
	}

	return {
		subscribe,

		/**
		 * Add product to cart
		 */
		async addToCart(product: Product, quantity: number = 1): Promise<boolean> {
			update((state) => ({
				...state,
				loading: true,
				error: null
			}));

			const result = await addToCartUseCase.execute(product, quantity);

			if (result.success) {
				const allItems = await cartRepository.getAll();
				update((state) => ({
					...state,
					items: allItems,
					loading: false,
					error: null
				}));
				return true;
			} else {
				update((state) => ({
					...state,
					loading: false,
					error: result.error || 'Failed to add item to cart'
				}));
				return false;
			}
		},

		/**
		 * Remove item from cart
		 */
		async removeFromCart(productId: number): Promise<boolean> {
			update((state) => ({
				...state,
				loading: true,
				error: null
			}));

			const result = await removeFromCartUseCase.execute(productId);

			if (result.success) {
				const allItems = await cartRepository.getAll();
				update((state) => ({
					...state,
					items: allItems,
					lastRemovedItem: result.previousState || null,
					loading: false,
					error: null
				}));
				return true;
			} else {
				update((state) => ({
					...state,
					loading: false,
					error: result.error || 'Failed to remove item from cart'
				}));
				return false;
			}
		},

		/**
		 * Update item quantity
		 */
		async updateQuantity(productId: number, quantity: number): Promise<boolean> {
			update((state) => ({
				...state,
				loading: true,
				error: null
			}));

			const result = await updateQuantityUseCase.execute(productId, quantity);

			if (result.success) {
				const allItems = await cartRepository.getAll();
				update((state) => ({
					...state,
					items: allItems,
					loading: false,
					error: null
				}));
				return true;
			} else {
				update((state) => ({
					...state,
					loading: false,
					error: result.error || 'Failed to update quantity'
				}));
				return false;
			}
		},

		/**
		 * Clear cart
		 */
		async clearCart(): Promise<boolean> {
			update((state) => ({
				...state,
				loading: true,
				error: null
			}));

			const result = await clearCartUseCase.execute();

			if (result.success) {
				update((state) => ({
					...state,
					items: [],
					loading: false,
					error: null
				}));
				return true;
			} else {
				update((state) => ({
					...state,
					loading: false,
					error: result.error || 'Failed to clear cart'
				}));
				return false;
			}
		},

		/**
		 * Undo last remove operation
		 */
		async undoRemove(): Promise<boolean> {
			let lastRemoved: CartItem | null = null;

			update((state) => {
				lastRemoved = state.lastRemovedItem;
				return {
					...state,
					loading: true,
					error: null
				};
			});

			if (!lastRemoved) {
				update((state) => ({
					...state,
					loading: false,
					error: 'No item to restore'
				}));
				return false;
			}

			const result = await removeFromCartUseCase.undo(lastRemoved);

			if (result.success) {
				const allItems = await cartRepository.getAll();
				update((state) => ({
					...state,
					items: allItems,
					lastRemovedItem: null,
					loading: false,
					error: null
				}));
				return true;
			} else {
				update((state) => ({
					...state,
					loading: false,
					error: result.error || 'Failed to restore item'
				}));
				return false;
			}
		},

		/**
		 * Refresh cart from localStorage
		 */
		async refresh(): Promise<void> {
			const allItems = await cartRepository.getAll();
			update((state) => ({
				...state,
				items: allItems
			}));
		},

		/**
		 * Clear error
		 */
		clearError(): void {
			update((state) => ({
				...state,
				error: null
			}));
		}
	};
}

/**
 * Cart store singleton
 */
export const cartStore = createCartStore();

/**
 * Derived store for cart items
 */
export const cartItems: Readable<CartItem[]> = derived(cartStore, ($cart) => $cart.items);

/**
 * Derived store for cart totals
 */
export const cartTotals: Readable<CartTotals> = derived(cartStore, ($cart) => ({
	itemCount: $cart.items.reduce((sum, item) => sum + item.quantity, 0),
	uniqueItems: $cart.items.length,
	subtotal: $cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}));

/**
 * Derived store for empty cart state
 */
export const isCartEmpty: Readable<boolean> = derived(cartStore, ($cart) => $cart.items.length === 0);

/**
 * Derived store for loading state
 */
export const cartLoading: Readable<boolean> = derived(cartStore, ($cart) => $cart.loading);

/**
 * Derived store for error state
 */
export const cartError: Readable<string | null> = derived(cartStore, ($cart) => $cart.error);

/**
 * Derived store for last removed item (for undo functionality)
 */
export const lastRemovedItem: Readable<CartItem | null> = derived(
	cartStore,
	($cart) => $cart.lastRemovedItem
);
