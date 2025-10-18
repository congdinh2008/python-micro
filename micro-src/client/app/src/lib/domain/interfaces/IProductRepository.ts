/**
 * @module Domain/Interfaces
 * @description Product repository interface
 */

import type { Product, ProductCreateData, ProductUpdateData } from '../entities/Product';

/**
 * Product repository interface for data access
 */
export interface IProductRepository {
	/**
	 * Get all products with pagination
	 * @param skip - Number of items to skip
	 * @param limit - Maximum number of items to return
	 * @returns Promise with array of products
	 */
	getAll(skip: number, limit: number): Promise<Product[]>;

	/**
	 * Get product by ID
	 * @param id - Product ID
	 * @returns Promise with product or null if not found
	 */
	getById(id: number): Promise<Product | null>;

	/**
	 * Create new product
	 * @param data - Product creation data
	 * @returns Promise with created product
	 */
	create(data: ProductCreateData): Promise<Product>;

	/**
	 * Update product
	 * @param id - Product ID
	 * @param data - Product update data
	 * @returns Promise with updated product
	 */
	update(id: number, data: ProductUpdateData): Promise<Product>;

	/**
	 * Delete product
	 * @param id - Product ID
	 * @returns Promise with success status
	 */
	delete(id: number): Promise<boolean>;
}
