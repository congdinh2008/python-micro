/**
 * @module Domain/Interfaces
 * @description Order repository interface
 */

import type { Order, OrderCreateRequest } from '../entities/Order';

/**
 * Order repository interface defining contract for order data operations
 */
export interface IOrderRepository {
	/**
	 * Create a new order
	 * @param orderData - Order creation data
	 * @returns Created order
	 */
	create(orderData: OrderCreateRequest): Promise<Order>;

	/**
	 * Get order by ID
	 * @param id - Order ID
	 * @returns Order or null if not found
	 */
	getById(id: number): Promise<Order | null>;

	/**
	 * Get all orders for current user
	 * @param skip - Number of records to skip (pagination)
	 * @param limit - Number of records to return
	 * @returns List of orders
	 */
	getAll(skip?: number, limit?: number): Promise<Order[]>;

	/**
	 * Update order status
	 * @param id - Order ID
	 * @param status - New status
	 * @returns Updated order
	 */
	updateStatus(id: number, status: string): Promise<Order>;
}
