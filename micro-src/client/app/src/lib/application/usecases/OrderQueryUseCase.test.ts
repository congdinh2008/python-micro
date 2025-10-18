/**
 * @module Application/UseCases
 * @description Tests for order query use case
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderQueryUseCase } from './OrderQueryUseCase';
import type { IOrderRepository } from '$lib/domain/interfaces/IOrderRepository';
import type { Order } from '$lib/domain/entities/Order';
import { OrderStatus } from '$lib/domain/entities/Order';
import type { OrderHistoryFilters } from '$lib/domain/dto/OrderHistoryFilters';

describe('OrderQueryUseCase', () => {
	let orderRepository: IOrderRepository;
	let useCase: OrderQueryUseCase;

	const mockOrders: Order[] = [
		{
			id: 1,
			user_id: 1,
			product_id: 101,
			product_name: 'Product 1',
			quantity: 2,
			unit_price: 50,
			total_price: 100,
			status: OrderStatus.PENDING,
			created_at: '2025-10-15T10:00:00Z',
			updated_at: '2025-10-15T10:00:00Z'
		},
		{
			id: 2,
			user_id: 1,
			product_id: 102,
			product_name: 'Product 2',
			quantity: 1,
			unit_price: 75,
			total_price: 75,
			status: OrderStatus.CONFIRMED,
			created_at: '2025-10-16T10:00:00Z',
			updated_at: '2025-10-16T10:00:00Z'
		},
		{
			id: 3,
			user_id: 1,
			product_id: 103,
			product_name: 'Product 3',
			quantity: 3,
			unit_price: 25,
			total_price: 75,
			status: OrderStatus.DELIVERED,
			created_at: '2025-10-17T10:00:00Z',
			updated_at: '2025-10-17T10:00:00Z'
		}
	];

	beforeEach(() => {
		orderRepository = {
			create: vi.fn(),
			getById: vi.fn(),
			getAll: vi.fn(),
			updateStatus: vi.fn()
		};

		useCase = new OrderQueryUseCase(orderRepository);
	});

	describe('getAll', () => {
		it('should fetch all orders successfully', async () => {
			vi.mocked(orderRepository.getAll).mockResolvedValue(mockOrders);

			const result = await useCase.getAll();

			expect(result.success).toBe(true);
			expect(result.orders).toBeDefined();
			expect(result.orders).toHaveLength(3);
			expect(orderRepository.getAll).toHaveBeenCalledWith(undefined);
		});

		it('should sort orders by created_at descending (newest first)', async () => {
			vi.mocked(orderRepository.getAll).mockResolvedValue(mockOrders);

			const result = await useCase.getAll();

			expect(result.success).toBe(true);
			if (result.orders) {
				expect(result.orders[0].id).toBe(3); // Most recent
				expect(result.orders[1].id).toBe(2);
				expect(result.orders[2].id).toBe(1); // Oldest
			}
		});

		it('should fetch orders with pagination filters', async () => {
			const filters: OrderHistoryFilters = {
				skip: 10,
				limit: 20
			};

			vi.mocked(orderRepository.getAll).mockResolvedValue(mockOrders);

			const result = await useCase.getAll(filters);

			expect(result.success).toBe(true);
			expect(orderRepository.getAll).toHaveBeenCalledWith(
				expect.objectContaining({
					skip: 10,
					limit: 20
				})
			);
		});

		it('should fetch orders with status filter', async () => {
			const filters: OrderHistoryFilters = {
				status: OrderStatus.CONFIRMED,
				skip: 0,
				limit: 20
			};

			vi.mocked(orderRepository.getAll).mockResolvedValue(mockOrders);

			const result = await useCase.getAll(filters);

			expect(result.success).toBe(true);
			expect(orderRepository.getAll).toHaveBeenCalledWith(
				expect.objectContaining({
					status: OrderStatus.CONFIRMED
				})
			);
		});

		it('should fetch orders with date range filter', async () => {
			const filters: OrderHistoryFilters = {
				dateRange: ['2025-10-16T00:00:00Z', '2025-10-17T23:59:59Z'],
				skip: 0,
				limit: 20
			};

			vi.mocked(orderRepository.getAll).mockResolvedValue(mockOrders);

			const result = await useCase.getAll(filters);

			expect(result.success).toBe(true);
			expect(orderRepository.getAll).toHaveBeenCalledWith(
				expect.objectContaining({
					dateRange: filters.dateRange
				})
			);
		});

		it('should fetch orders with combined filters', async () => {
			const filters: OrderHistoryFilters = {
				status: OrderStatus.PENDING,
				dateRange: ['2025-10-15T00:00:00Z', '2025-10-16T23:59:59Z'],
				skip: 0,
				limit: 10
			};

			vi.mocked(orderRepository.getAll).mockResolvedValue(mockOrders);

			const result = await useCase.getAll(filters);

			expect(result.success).toBe(true);
			expect(orderRepository.getAll).toHaveBeenCalledWith(expect.objectContaining(filters));
		});

		it('should return error for invalid filter status', async () => {
			const filters = {
				status: 'invalid_status',
				skip: 0,
				limit: 20
			};

			const result = await useCase.getAll(filters as any);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Invalid filters');
			expect(orderRepository.getAll).not.toHaveBeenCalled();
		});

		it('should return error for invalid pagination', async () => {
			const filters: OrderHistoryFilters = {
				skip: -1,
				limit: 20
			};

			const result = await useCase.getAll(filters);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Invalid filters');
			expect(orderRepository.getAll).not.toHaveBeenCalled();
		});

		it('should return error for invalid limit', async () => {
			const filters: OrderHistoryFilters = {
				skip: 0,
				limit: 200
			};

			const result = await useCase.getAll(filters);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Invalid filters');
			expect(orderRepository.getAll).not.toHaveBeenCalled();
		});

		it('should return error for invalid date range (start > end)', async () => {
			const filters: OrderHistoryFilters = {
				dateRange: ['2025-10-17T00:00:00Z', '2025-10-16T00:00:00Z'],
				skip: 0,
				limit: 20
			};

			const result = await useCase.getAll(filters);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Invalid filters');
			expect(orderRepository.getAll).not.toHaveBeenCalled();
		});

		it('should handle repository errors gracefully', async () => {
			vi.mocked(orderRepository.getAll).mockRejectedValue(new Error('Database error'));

			const result = await useCase.getAll();

			expect(result.success).toBe(false);
			expect(result.error).toBe('Database error');
		});

		it('should return empty array when no orders exist', async () => {
			vi.mocked(orderRepository.getAll).mockResolvedValue([]);

			const result = await useCase.getAll();

			expect(result.success).toBe(true);
			expect(result.orders).toEqual([]);
		});
	});

	describe('getById', () => {
		it('should fetch order by ID successfully', async () => {
			vi.mocked(orderRepository.getById).mockResolvedValue(mockOrders[0]);

			const result = await useCase.getById(1);

			expect(result.success).toBe(true);
			expect(result.order).toEqual(mockOrders[0]);
			expect(orderRepository.getById).toHaveBeenCalledWith(1);
		});

		it('should return error when order not found', async () => {
			vi.mocked(orderRepository.getById).mockResolvedValue(null);

			const result = await useCase.getById(999);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Order not found');
		});

		it('should handle repository errors gracefully', async () => {
			vi.mocked(orderRepository.getById).mockRejectedValue(new Error('Database error'));

			const result = await useCase.getById(1);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Database error');
		});
	});
});
