/**
 * @module Infrastructure/Repositories
 * @description Product repository implementation with caching
 */

import type { IProductRepository } from '$lib/domain/interfaces/IProductRepository';
import type { Product, ProductCreateData, ProductUpdateData } from '$lib/domain/entities/Product';
import { productServiceApi } from '../api/apiClient';
import { cacheManager } from '../cache/cacheManager';

/**
 * Product repository implementation with caching and retry logic
 */
export class ProductRepository implements IProductRepository {
	private readonly CACHE_KEY_PREFIX = 'products';
	private readonly CACHE_KEY_LIST = `${this.CACHE_KEY_PREFIX}:list`;

	/**
	 * Get all products with pagination
	 * Implements stale-while-revalidate caching pattern
	 */
	async getAll(skip: number = 0, limit: number = 20): Promise<Product[]> {
		const cacheKey = `${this.CACHE_KEY_LIST}:${skip}:${limit}`;

		// Try to get from cache
		const cachedData = cacheManager.get<Product[]>(cacheKey);

		if (cachedData) {
			// If data is stale, fetch fresh data in background
			if (cacheManager.isStale(cacheKey)) {
				this.fetchAndCacheProducts(skip, limit, cacheKey).catch((error) => {
					console.error('Background refresh failed:', error);
				});
			}

			return cachedData;
		}

		// Cache miss - fetch fresh data
		return this.fetchAndCacheProducts(skip, limit, cacheKey);
	}

	/**
	 * Get product by ID with caching
	 */
	async getById(id: number): Promise<Product | null> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;

		// Try to get from cache
		const cachedData = cacheManager.get<Product>(cacheKey);

		if (cachedData) {
			// If data is stale, fetch fresh data in background
			if (cacheManager.isStale(cacheKey)) {
				this.fetchAndCacheProduct(id, cacheKey).catch((error) => {
					console.error('Background refresh failed:', error);
				});
			}

			return cachedData;
		}

		// Cache miss - fetch fresh data
		return this.fetchAndCacheProduct(id, cacheKey);
	}

	/**
	 * Create new product and invalidate cache
	 */
	async create(data: ProductCreateData): Promise<Product> {
		const product = await productServiceApi.post<Product>('/products', data);

		// Invalidate list cache
		cacheManager.invalidatePattern(`${this.CACHE_KEY_LIST}`);

		return product;
	}

	/**
	 * Update product and invalidate cache
	 */
	async update(id: number, data: ProductUpdateData): Promise<Product> {
		const product = await productServiceApi.put<Product>(`/products/${id}`, data);

		// Invalidate specific product cache and list cache
		cacheManager.invalidate(`${this.CACHE_KEY_PREFIX}:${id}`);
		cacheManager.invalidatePattern(`${this.CACHE_KEY_LIST}`);

		return product;
	}

	/**
	 * Delete product and invalidate cache
	 */
	async delete(id: number): Promise<boolean> {
		try {
			await productServiceApi.delete(`/products/${id}`);

			// Invalidate specific product cache and list cache
			cacheManager.invalidate(`${this.CACHE_KEY_PREFIX}:${id}`);
			cacheManager.invalidatePattern(`${this.CACHE_KEY_LIST}`);

			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Fetch products from API and cache them
	 */
	private async fetchAndCacheProducts(
		skip: number,
		limit: number,
		cacheKey: string
	): Promise<Product[]> {
		const products = await productServiceApi.get<Product[]>(
			`/products?skip=${skip}&limit=${limit}`
		);

		// Cache the results
		cacheManager.set(cacheKey, products, {
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000 // 10 minutes
		});

		return products;
	}

	/**
	 * Fetch single product from API and cache it
	 */
	private async fetchAndCacheProduct(id: number, cacheKey: string): Promise<Product | null> {
		try {
			const product = await productServiceApi.get<Product>(`/products/${id}`);

			// Cache the result
			cacheManager.set(cacheKey, product, {
				staleTime: 5 * 60 * 1000, // 5 minutes
				cacheTime: 10 * 60 * 1000 // 10 minutes
			});

			return product;
		} catch (error) {
			// Return null for 404 errors
			return null;
		}
	}
}
