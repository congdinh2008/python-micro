/**
 * @module Application/UseCases
 * @description Order query use case for fetching orders
 */

import type { IOrderRepository } from '$lib/domain/interfaces/IOrderRepository';
import type { Order } from '$lib/domain/entities/Order';
import { ApiError } from '$lib/infrastructure/api/apiClient';

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
	 * Get all orders for current user
	 */
	async getAll(skip: number = 0, limit: number = 20): Promise<OrderQueryResult> {
		try {
			const orders = await this.orderRepository.getAll(skip, limit);
			return {
				success: true,
				orders
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
