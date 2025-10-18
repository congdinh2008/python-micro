/**
 * @module Application/UseCases
 * @description Order query use case for fetching orders
 */

import type { IOrderRepository } from '$lib/domain/interfaces/IOrderRepository';
import type { Order } from '$lib/domain/entities/Order';
import type { OrderHistoryFilters } from '$lib/domain/dto/OrderHistoryFilters';
import { ApiError } from '$lib/infrastructure/api/apiClient';
import { validateOrderFilters } from '$lib/domain/validation/orderFilterSchema';

/**
 * Order query result
 */
export interface OrderQueryResult {
	success: boolean;
	orders?: Order[];
	order?: Order;
	error?: string;
}

/**
 * Order query use case
 */
export class OrderQueryUseCase {
	constructor(private orderRepository: IOrderRepository) {}

	/**
	 * Get all orders for current user with optional filters
	 */
	async getAll(filters?: OrderHistoryFilters): Promise<OrderQueryResult> {
		try {
			// Validate filters if provided
			if (filters) {
				const validation = validateOrderFilters(filters);
				if (!validation.success) {
					return {
						success: false,
						error: `Invalid filters: ${validation.errors.join(', ')}`
					};
				}
				// Use validated filters
				filters = validation.data;
			}

			const orders = await this.orderRepository.getAll(filters);

			// Sort by created_at descending (newest first)
			const sortedOrders = orders.sort((a, b) => {
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			});

			return {
				success: true,
				orders: sortedOrders
			};
		} catch (error) {
			console.error('Error fetching orders:', error);

			let errorMessage = 'Failed to fetch orders';
			if (error instanceof ApiError) {
				errorMessage = error.message;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			return {
				success: false,
				error: errorMessage
			};
		}
	}

	/**
	 * Get order by ID
	 */
	async getById(id: number): Promise<OrderQueryResult> {
		try {
			const order = await this.orderRepository.getById(id);

			if (!order) {
				return {
					success: false,
					error: 'Order not found'
				};
			}

			return {
				success: true,
				order
			};
		} catch (error) {
			console.error(`Error fetching order ${id}:`, error);

			let errorMessage = 'Failed to fetch order';
			if (error instanceof ApiError) {
				errorMessage = error.message;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			return {
				success: false,
				error: errorMessage
			};
		}
	}
}
