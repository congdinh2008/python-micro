/**
 * @module Infrastructure/Repositories
 * @description Order repository implementation using Order Service API
 */

import type { IOrderRepository } from '$lib/domain/interfaces/IOrderRepository';
import type { Order, OrderCreateRequest } from '$lib/domain/entities/Order';
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
	 * Get all orders for current user
	 */
	async getAll(skip: number = 0, limit: number = 20): Promise<Order[]> {
		try {
			const params = new URLSearchParams();
			params.append('skip', skip.toString());
			params.append('limit', limit.toString());

			const orders = await orderServiceApi.get<Order[]>(`/orders?${params.toString()}`);
			return orders;
		} catch (error) {
			console.error('Error fetching orders:', error);
			return [];
		}
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
