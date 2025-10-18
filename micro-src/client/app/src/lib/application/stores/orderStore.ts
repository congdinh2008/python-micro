/**
 * @module Application/Stores
 * @description Order store for global order state management
 */

import { writable, derived, type Readable } from 'svelte/store';
import type { Order } from '$lib/domain/entities/Order';
import type { OrderHistoryFilters } from '$lib/domain/dto/OrderHistoryFilters';
import { DEFAULT_ORDER_FILTERS } from '$lib/domain/dto/OrderHistoryFilters';
import { OrderRepository } from '$lib/infrastructure/repositories/OrderRepository';
import { OrderQueryUseCase } from '../usecases/OrderQueryUseCase';

/**
 * Order store state
 */
interface OrderStoreState {
	orders: Order[];
	currentOrder: Order | null;
	filters: OrderHistoryFilters;
	loading: boolean;
	error: string | null;
}

/**
 * Create order store
 */
function createOrderStore() {
	const initialState: OrderStoreState = {
		orders: [],
		currentOrder: null,
		filters: { ...DEFAULT_ORDER_FILTERS },
		loading: false,
		error: null
	};

	const { subscribe, update, set } = writable<OrderStoreState>(initialState);

	// Initialize repository and use case
	const orderRepository = new OrderRepository();
	const orderQueryUseCase = new OrderQueryUseCase(orderRepository);

	return {
		subscribe,

		/**
		 * Fetch all orders with optional filters
		 */
		async fetchOrders(filters?: OrderHistoryFilters): Promise<boolean> {
			update((state) => ({
				...state,
				loading: true,
				error: null,
				filters: filters || state.filters
			}));

			const result = await orderQueryUseCase.getAll(filters);

			if (result.success && result.orders) {
				update((state) => ({
					...state,
					orders: result.orders || [],
					loading: false,
					error: null
				}));
				return true;
			} else {
				update((state) => ({
					...state,
					loading: false,
					error: result.error || 'Failed to fetch orders'
				}));
				return false;
			}
		},

		/**
		 * Update filters and refetch orders
		 */
		async updateFilters(filters: Partial<OrderHistoryFilters>): Promise<boolean> {
			let currentFilters: OrderHistoryFilters = { ...DEFAULT_ORDER_FILTERS };

			update((state) => {
				currentFilters = { ...state.filters, ...filters };
				return {
					...state,
					filters: currentFilters
				};
			});

			return this.fetchOrders(currentFilters);
		},

		/**
		 * Clear filters and refetch orders
		 */
		async clearFilters(): Promise<boolean> {
			update((state) => ({
				...state,
				filters: { ...DEFAULT_ORDER_FILTERS }
			}));

			return this.fetchOrders(DEFAULT_ORDER_FILTERS);
		},

		/**
		 * Fetch order by ID
		 */
		async fetchOrderById(id: number): Promise<boolean> {
			update((state) => ({
				...state,
				loading: true,
				error: null
			}));

			const result = await orderQueryUseCase.getById(id);

			if (result.success && result.order) {
				update((state) => ({
					...state,
					currentOrder: result.order || null,
					loading: false,
					error: null
				}));
				return true;
			} else {
				update((state) => ({
					...state,
					currentOrder: null,
					loading: false,
					error: result.error || 'Failed to fetch order'
				}));
				return false;
			}
		},

		/**
		 * Add newly created orders to the store
		 */
		addOrders(newOrders: Order[]): void {
			update((state) => ({
				...state,
				orders: [...newOrders, ...state.orders]
			}));
		},

		/**
		 * Clear current order
		 */
		clearCurrentOrder(): void {
			update((state) => ({
				...state,
				currentOrder: null
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
		},

		/**
		 * Reset store
		 */
		reset(): void {
			set(initialState);
		}
	};
}

/**
 * Order store singleton
 */
export const orderStore = createOrderStore();

/**
 * Derived store for orders list
 */
export const orders: Readable<Order[]> = derived(orderStore, ($store) => $store.orders);

/**
 * Derived store for current order
 */
export const currentOrder: Readable<Order | null> = derived(
	orderStore,
	($store) => $store.currentOrder
);

/**
 * Derived store for loading state
 */
export const orderLoading: Readable<boolean> = derived(orderStore, ($store) => $store.loading);

/**
 * Derived store for error state
 */
export const orderError: Readable<string | null> = derived(orderStore, ($store) => $store.error);

/**
 * Derived store for current filters
 */
export const orderFilters: Readable<OrderHistoryFilters> = derived(
	orderStore,
	($store) => $store.filters
);
