/**
 * @module Application/UseCases
 * @description Tests for UpdateCartQuantityUseCase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCartQuantityUseCase } from './UpdateCartQuantityUseCase';
import type { ICartRepository } from '$lib/domain/interfaces/ICartRepository';
import type { CartItem } from '$lib/domain/entities/Cart';

// Mock repository
const createMockCartRepository = (): ICartRepository => ({
	getAll: vi.fn(),
	getByProductId: vi.fn(),
	add: vi.fn(),
	update: vi.fn(),
	remove: vi.fn(),
	clear: vi.fn(),
	getState: vi.fn(),
	saveState: vi.fn()
});

describe('UpdateCartQuantityUseCase', () => {
	let mockRepository: ICartRepository;
	let useCase: UpdateCartQuantityUseCase;

	beforeEach(() => {
		mockRepository = createMockCartRepository();
		useCase = new UpdateCartQuantityUseCase(mockRepository);
	});

	describe('successful update', () => {
		it('should update item quantity', async () => {
			const existingItem: CartItem = {
				id: 1,
				productId: 1,
				name: 'Test Product',
				price: 29.99,
				quantity: 2,
				maxStock: 10
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(existingItem);

			const result = await useCase.execute(1, 5);

			expect(result.success).toBe(true);
			expect(result.item?.quantity).toBe(5);
			expect(result.previousState).toEqual(existingItem);
			expect(mockRepository.update).toHaveBeenCalled();
		});
	});

	describe('validation errors', () => {
		it('should reject when item not found', async () => {
			vi.mocked(mockRepository.getByProductId).mockResolvedValue(null);

			const result = await useCase.execute(1, 5);

			expect(result.success).toBe(false);
			expect(result.error).toContain('not found');
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it('should reject when quantity exceeds stock', async () => {
			const existingItem: CartItem = {
				id: 1,
				productId: 1,
				name: 'Test Product',
				price: 29.99,
				quantity: 2,
				maxStock: 5
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(existingItem);

			const result = await useCase.execute(1, 10);

			expect(result.success).toBe(false);
			expect(result.error).toContain('available');
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it('should reject negative quantity', async () => {
			const existingItem: CartItem = {
				id: 1,
				productId: 1,
				name: 'Test Product',
				price: 29.99,
				quantity: 2,
				maxStock: 10
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(existingItem);

			const result = await useCase.execute(1, -1);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should reject zero quantity', async () => {
			const existingItem: CartItem = {
				id: 1,
				productId: 1,
				name: 'Test Product',
				price: 29.99,
				quantity: 2,
				maxStock: 10
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(existingItem);

			const result = await useCase.execute(1, 0);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});
	});

	describe('error handling', () => {
		it('should handle repository errors', async () => {
			vi.mocked(mockRepository.getByProductId).mockRejectedValue(
				new Error('Repository error')
			);

			const result = await useCase.execute(1, 5);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Repository error');
		});
	});
});
