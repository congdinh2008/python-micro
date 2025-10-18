/**
 * @module Domain/Interfaces
 * @description Order repository interface
 */

import type { Order, OrderCreateRequest } from '../entities/Order';
import type { OrderHistoryFilters } from '../dto/OrderHistoryFilters';

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
	 * Get all orders for current user with optional filters
	 * @param filters - Optional filters for status, date range, and pagination
	 * @returns List of orders
	 */
	getAll(filters?: OrderHistoryFilters): Promise<Order[]>;

	/**
	 * Update order status
	 * @param id - Order ID
	 * @param status - New status
	 * @returns Updated order
	 */
	updateStatus(id: number, status: string): Promise<Order>;
}
