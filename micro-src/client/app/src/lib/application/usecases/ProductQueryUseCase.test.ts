/**
 * @module Application/UseCases
 * @description Tests for ProductQueryUseCase
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProductQueryUseCase } from './ProductQueryUseCase';
import type { IProductRepository } from '$lib/domain/interfaces/IProductRepository';
import type { Product } from '$lib/domain/entities/Product';

// Mock product data
const mockProducts: Product[] = [
	{
		id: 1,
		name: 'Laptop',
		description: 'High-performance laptop',
		price: 999.99,
		quantity: 10,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z'
	},
	{
		id: 2,
		name: 'Mouse',
		description: 'Wireless mouse',
		price: 29.99,
		quantity: 50,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z'
	},
	{
		id: 3,
		name: 'Keyboard',
		description: 'Mechanical keyboard',
		price: 79.99,
		quantity: 0,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z'
	}
];

// Mock repository
class MockProductRepository implements IProductRepository {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async getAll(_skip: number, _limit: number): Promise<Product[]> {
		return mockProducts;
	}

	async getById(id: number): Promise<Product | null> {
		return mockProducts.find((p) => p.id === id) || null;
	}

	async create(): Promise<Product> {
		throw new Error('Not implemented');
	}

	async update(): Promise<Product> {
		throw new Error('Not implemented');
	}

	async delete(): Promise<boolean> {
		throw new Error('Not implemented');
	}
}

describe('ProductQueryUseCase', () => {
	let useCase: ProductQueryUseCase;
	let repository: IProductRepository;

	beforeEach(() => {
		repository = new MockProductRepository();
		useCase = new ProductQueryUseCase(repository);
	});

	describe('execute', () => {
		it('should fetch all products successfully', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy: 'name_asc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(3);
			expect(result.data?.total).toBe(3);
		});

		it('should filter products by search term', async () => {
			const result = await useCase.execute(
				{
					search: 'laptop',
					minPrice: null,
					maxPrice: null,
					sortBy: 'name_asc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(1);
			expect(result.data?.items[0].name).toBe('Laptop');
		});

		it('should filter products by min price', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: 50,
					maxPrice: null,
					sortBy: 'name_asc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(2);
			expect(result.data?.items.every((p) => p.price >= 50)).toBe(true);
		});

		it('should filter products by max price', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: 50,
					sortBy: 'name_asc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(1);
			expect(result.data?.items[0].name).toBe('Mouse');
		});

		it('should filter products by price range', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: 30,
					maxPrice: 100,
					sortBy: 'name_asc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(1);
			expect(result.data?.items[0].name).toBe('Keyboard');
		});

		it('should sort products by name ascending', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy: 'name_asc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items[0].name).toBe('Keyboard');
			expect(result.data?.items[1].name).toBe('Laptop');
			expect(result.data?.items[2].name).toBe('Mouse');
		});

		it('should sort products by name descending', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy: 'name_desc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items[0].name).toBe('Mouse');
			expect(result.data?.items[1].name).toBe('Laptop');
			expect(result.data?.items[2].name).toBe('Keyboard');
		});

		it('should sort products by price ascending', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy: 'price_asc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items[0].price).toBe(29.99);
			expect(result.data?.items[1].price).toBe(79.99);
			expect(result.data?.items[2].price).toBe(999.99);
		});

		it('should sort products by price descending', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy: 'price_desc'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			expect(result.data?.items[0].price).toBe(999.99);
			expect(result.data?.items[1].price).toBe(79.99);
			expect(result.data?.items[2].price).toBe(29.99);
		});

		it('should sort products by stock availability', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy: 'in_stock'
				},
				1,
				20
			);

			expect(result.success).toBe(true);
			// Products in stock should come first
			expect(result.data?.items[0].quantity).toBeGreaterThan(0);
			expect(result.data?.items[1].quantity).toBeGreaterThan(0);
			expect(result.data?.items[2].quantity).toBe(0);
		});

		it('should handle pagination correctly', async () => {
			const result = await useCase.execute(
				{
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy: 'name_asc'
				},
				1,
				2
			);

			expect(result.success).toBe(true);
			expect(result.data?.items).toHaveLength(2);
			expect(result.data?.page).toBe(1);
			expect(result.data?.pageSize).toBe(2);
			expect(result.data?.totalPages).toBe(2);
		});
	});

	describe('getById', () => {
		it('should fetch product by id successfully', async () => {
			const product = await useCase.getById(1);

			expect(product).not.toBeNull();
			expect(product?.name).toBe('Laptop');
		});

		it('should return null for non-existent product', async () => {
			const product = await useCase.getById(999);

			expect(product).toBeNull();
		});
	});
});
