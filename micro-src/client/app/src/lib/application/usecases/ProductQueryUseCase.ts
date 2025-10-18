/**
 * @module Application/UseCases
 * @description Product query use case with filtering and sorting
 */

import type { IProductRepository } from '$lib/domain/interfaces/IProductRepository';
import type { Product, ProductFilters, PaginatedProducts } from '$lib/domain/entities/Product';
import {
	productFilterSchema,
	type ProductFilterInput
} from '$lib/domain/validation/productFilterSchema';

/**
 * Query result
 */
export interface QueryResult {
	success: boolean;
	data?: PaginatedProducts;
	error?: string;
}

/**
 * Product query use case for fetching and filtering products
 */
export class ProductQueryUseCase {
	constructor(private productRepository: IProductRepository) {}

	/**
	 * Execute query with filters and pagination
	 * @param filters - Product filters
	 * @param page - Page number (1-based)
	 * @param pageSize - Number of items per page
	 * @returns Query result with paginated products
	 */
	async execute(
		filters: ProductFilterInput,
		page: number = 1,
		pageSize: number = 20
	): Promise<QueryResult> {
		try {
			// Validate filters
			const validatedFilters = productFilterSchema.parse(filters);

			// For now, we fetch all products and filter client-side
			// In a real app, you'd send filters to the backend
			const skip = (page - 1) * pageSize;
			const limit = pageSize * 3; // Fetch more to allow for filtering

			// Fetch products from repository (with caching)
			const products = await this.productRepository.getAll(skip, limit);

			// Apply client-side filtering
			const filteredProducts = this.filterProducts(products, validatedFilters);

			// Apply sorting
			const sortedProducts = this.sortProducts(filteredProducts, validatedFilters.sortBy);

			// Calculate total for pagination
			const total = sortedProducts.length;
			const totalPages = Math.ceil(total / pageSize);

			// Paginate results
			const startIndex = 0; // We already fetched the correct page
			const endIndex = Math.min(pageSize, sortedProducts.length);
			const paginatedItems = sortedProducts.slice(startIndex, endIndex);

			return {
				success: true,
				data: {
					items: paginatedItems,
					total,
					page,
					pageSize,
					totalPages
				}
			};
		} catch (error) {
			console.error('Product query failed:', error);

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch products'
			};
		}
	}

	/**
	 * Filter products based on criteria
	 */
	private filterProducts(products: Product[], filters: ProductFilterInput): Product[] {
		return products.filter((product) => {
			// Search filter
			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				const matchesName = product.name.toLowerCase().includes(searchLower);
				const matchesDescription =
					product.description?.toLowerCase().includes(searchLower) ?? false;

				if (!matchesName && !matchesDescription) {
					return false;
				}
			}

			// Price range filter
			if (filters.minPrice !== null && product.price < filters.minPrice) {
				return false;
			}

			if (filters.maxPrice !== null && product.price > filters.maxPrice) {
				return false;
			}

			return true;
		});
	}

	/**
	 * Sort products based on sort option
	 */
	private sortProducts(
		products: Product[],
		sortBy: ProductFilterInput['sortBy']
	): Product[] {
		const sorted = [...products];

		switch (sortBy) {
			case 'name_asc':
				return sorted.sort((a, b) => a.name.localeCompare(b.name));

			case 'name_desc':
				return sorted.sort((a, b) => b.name.localeCompare(a.name));

			case 'price_asc':
				return sorted.sort((a, b) => a.price - b.price);

			case 'price_desc':
				return sorted.sort((a, b) => b.price - a.price);

			case 'in_stock':
				return sorted.sort((a, b) => {
					// Products in stock first
					if (a.quantity > 0 && b.quantity === 0) return -1;
					if (a.quantity === 0 && b.quantity > 0) return 1;
					// Then sort by quantity
					return b.quantity - a.quantity;
				});

			case 'rating_desc':
				// For now, maintain original order (no rating data)
				// In a real app, you'd sort by rating
				return sorted;

			default:
				return sorted;
		}
	}

	/**
	 * Get product by ID
	 */
	async getById(id: number): Promise<Product | null> {
		try {
			return await this.productRepository.getById(id);
		} catch (error) {
			console.error('Failed to fetch product:', error);
			return null;
		}
	}
}
