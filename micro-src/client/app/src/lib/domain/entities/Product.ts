/**
 * @module Domain/Entities
 * @description Product domain entities
 */

/**
 * Product entity representing a product in the catalog
 */
export interface Product {
	id: number;
	name: string;
	description: string | null;
	price: number;
	quantity: number;
	created_at: string;
	updated_at: string;
}

/**
 * Product creation data
 */
export interface ProductCreateData {
	name: string;
	description?: string;
	price: number;
	quantity: number;
}

/**
 * Product update data (all fields optional)
 */
export interface ProductUpdateData {
	name?: string;
	description?: string;
	price?: number;
	quantity?: number;
}

/**
 * Product filters for searching and filtering
 */
export interface ProductFilters {
	search: string;
	minPrice: number | null;
	maxPrice: number | null;
	sortBy: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'rating_desc' | 'in_stock';
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
	page: number;
	pageSize: number;
}

/**
 * Paginated response
 */
export interface PaginatedProducts {
	items: Product[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
