/**
 * @module Application/UseCases
 * @description Tests for AddToCartUseCase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddToCartUseCase } from './AddToCartUseCase';
import type { ICartRepository } from '$lib/domain/interfaces/ICartRepository';
import type { Product } from '$lib/domain/entities/Product';
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

describe('AddToCartUseCase', () => {
	let mockRepository: ICartRepository;
	let useCase: AddToCartUseCase;

	beforeEach(() => {
		mockRepository = createMockCartRepository();
		useCase = new AddToCartUseCase(mockRepository);
	});

	describe('successful add to cart', () => {
		it('should add new item to cart', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 10,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(null);

			const result = await useCase.execute(product, 2);

			expect(result.success).toBe(true);
			expect(result.item).toBeDefined();
			expect(result.item?.quantity).toBe(2);
			expect(result.item?.productId).toBe(1);
			expect(mockRepository.add).toHaveBeenCalled();
		});

		it('should merge quantities for existing item', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 10,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			const existingItem: CartItem = {
				id: 1,
				productId: 1,
				name: 'Test Product',
				price: 29.99,
				quantity: 2,
				maxStock: 10
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(existingItem);

			const result = await useCase.execute(product, 3);

			expect(result.success).toBe(true);
			expect(result.item?.quantity).toBe(5);
			expect(result.previousState).toEqual(existingItem);
			expect(mockRepository.update).toHaveBeenCalled();
		});

		it('should use default quantity of 1', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 10,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(null);

			const result = await useCase.execute(product);

			expect(result.success).toBe(true);
			expect(result.item?.quantity).toBe(1);
		});
	});

	describe('validation errors', () => {
		it('should reject when quantity exceeds stock', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 5,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			const result = await useCase.execute(product, 10);

			expect(result.success).toBe(false);
			expect(result.error).toContain('available');
			expect(mockRepository.add).not.toHaveBeenCalled();
		});

		it('should reject when merged quantity exceeds stock', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 10,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			const existingItem: CartItem = {
				id: 1,
				productId: 1,
				name: 'Test Product',
				price: 29.99,
				quantity: 8,
				maxStock: 10
			};

			vi.mocked(mockRepository.getByProductId).mockResolvedValue(existingItem);

			const result = await useCase.execute(product, 5);

			expect(result.success).toBe(false);
			expect(result.error).toContain('available');
			expect(mockRepository.update).not.toHaveBeenCalled();
		});

		it('should reject negative quantity', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 10,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			const result = await useCase.execute(product, -1);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should reject zero quantity', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 10,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			const result = await useCase.execute(product, 0);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});
	});

	describe('error handling', () => {
		it('should handle repository errors', async () => {
			const product: Product = {
				id: 1,
				name: 'Test Product',
				description: 'Test Description',
				price: 29.99,
				quantity: 10,
				created_at: '2024-01-01',
				updated_at: '2024-01-01'
			};

			vi.mocked(mockRepository.getByProductId).mockRejectedValue(
				new Error('Repository error')
			);

			const result = await useCase.execute(product, 1);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Repository error');
		});
	});
});
