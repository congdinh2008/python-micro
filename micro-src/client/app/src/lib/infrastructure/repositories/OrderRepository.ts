/**
 * @module Infrastructure/Repositories
 * @description Order repository implementation using Order Service API
 */

import type { IOrderRepository } from '$lib/domain/interfaces/IOrderRepository';
import type { Order, OrderCreateRequest } from '$lib/domain/entities/Order';
import type { OrderHistoryFilters } from '$lib/domain/dto/OrderHistoryFilters';
import { orderServiceApi } from '../api/apiClient';

/**
 * Order repository implementation
 */
export class OrderRepository implements IOrderRepository {
	/**
	 * Create a new order
	 */
	async create(orderData: OrderCreateRequest): Promise<Order> {
		try {
			const order = await orderServiceApi.post<Order>('/orders', orderData);
			return order;
		} catch (error) {
			console.error('Error creating order:', error);
			throw error;
		}
	}

	/**
	 * Get order by ID
	 */
	async getById(id: number): Promise<Order | null> {
		try {
			const order = await orderServiceApi.get<Order>(`/orders/${id}`);
			return order;
		} catch (error) {
			console.error(`Error fetching order ${id}:`, error);
			return null;
		}
	}

	/**
	 * Get all orders for current user with optional filters
	 */
	async getAll(filters?: OrderHistoryFilters): Promise<Order[]> {
		try {
			const params = new URLSearchParams();

			// Add pagination parameters
			const skip = filters?.skip ?? 0;
			const limit = filters?.limit ?? 20;
			params.append('skip', skip.toString());
			params.append('limit', limit.toString());

			// Note: Backend currently doesn't support status and date filtering
			// These will be applied client-side in the use case layer
			// When backend adds support, uncomment:
			// if (filters?.status) {
			//   params.append('status', filters.status);
			// }
			// if (filters?.dateRange) {
			//   params.append('start_date', filters.dateRange[0]);
			//   params.append('end_date', filters.dateRange[1]);
			// }

			const orders = await orderServiceApi.get<Order[]>(`/orders?${params.toString()}`);

			// Client-side filtering until backend supports it
			return this.applyClientSideFilters(orders, filters);
		} catch (error) {
			console.error('Error fetching orders:', error);
			return [];
		}
	}

	/**
	 * Apply client-side filters to orders
	 * This is a temporary solution until backend supports filtering
	 */
	private applyClientSideFilters(orders: Order[], filters?: OrderHistoryFilters): Order[] {
		let filtered = orders;

		// Filter by status
		if (filters?.status) {
			filtered = filtered.filter((order) => order.status === filters.status);
		}

		// Filter by date range
		if (filters?.dateRange) {
			const [startDate, endDate] = filters.dateRange.map((d) => new Date(d));
			filtered = filtered.filter((order) => {
				const orderDate = new Date(order.created_at);
				return orderDate >= startDate && orderDate <= endDate;
			});
		}

		return filtered;
	}

	/**
	 * Update order status
	 */
	async updateStatus(id: number, status: string): Promise<Order> {
		try {
			const order = await orderServiceApi.put<Order>(`/orders/${id}`, { status });
			return order;
		} catch (error) {
			console.error(`Error updating order ${id} status:`, error);
			throw error;
		}
	}
}
