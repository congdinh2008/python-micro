/**
 * @module Application/Stores
 * @description Product store for state management
 */

import { writable, derived } from 'svelte/store';
import type { Product, PaginatedProducts, ProductFilters } from '$lib/domain/entities/Product';
import { ProductQueryUseCase } from '../usecases/ProductQueryUseCase';
import { ProductRepository } from '$lib/infrastructure/repositories/ProductRepository';

/**
 * Loading state
 */
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Product store state
 */
interface ProductStoreState {
	products: Product[];
	total: number;
	currentPage: number;
	pageSize: number;
	totalPages: number;
	loading: LoadingState;
	error: string | null;
}

/**
 * Filter store state
 */
interface FilterStoreState {
	search: string;
	minPrice: number | null;
	maxPrice: number | null;
	sortBy: ProductFilters['sortBy'];
}

/**
 * Create product store
 */
function createProductStore() {
	const initialState: ProductStoreState = {
		products: [],
		total: 0,
		currentPage: 1,
		pageSize: 20,
		totalPages: 0,
		loading: 'idle',
		error: null
	};

	const { subscribe, set, update } = writable<ProductStoreState>(initialState);

	// Create use case instance
	const productRepository = new ProductRepository();
	const productQueryUseCase = new ProductQueryUseCase(productRepository);

	return {
		subscribe,

		/**
		 * Fetch products with filters and pagination
		 */
		async fetchProducts(filters: FilterStoreState, page: number, pageSize: number) {
			update((state) => ({
				...state,
				loading: 'loading',
				error: null
			}));

			const result = await productQueryUseCase.execute(filters, page, pageSize);

			if (result.success && result.data) {
				update((state) => ({
					...state,
					products: result.data!.items,
					total: result.data!.total,
					currentPage: result.data!.page,
					pageSize: result.data!.pageSize,
					totalPages: result.data!.totalPages,
					loading: 'success',
					error: null
				}));
			} else {
				update((state) => ({
					...state,
					loading: 'error',
					error: result.error || 'Failed to fetch products'
				}));
			}
		},

		/**
		 * Fetch product by ID
		 */
		async fetchProductById(id: number): Promise<Product | null> {
			return productQueryUseCase.getById(id);
		},

		/**
		 * Set page
		 */
		setPage(page: number) {
			update((state) => ({
				...state,
				currentPage: page
			}));
		},

		/**
		 * Set page size
		 */
		setPageSize(pageSize: number) {
			update((state) => ({
				...state,
				pageSize,
				currentPage: 1 // Reset to first page
			}));
		},

		/**
		 * Reset store
		 */
		reset() {
			set(initialState);
		}
	};
}

/**
 * Create filter store
 */
function createFilterStore() {
	const initialState: FilterStoreState = {
		search: '',
		minPrice: null,
		maxPrice: null,
		sortBy: 'name_asc'
	};

	const { subscribe, set, update } = writable<FilterStoreState>(initialState);

	return {
		subscribe,

		/**
		 * Set search term
		 */
		setSearch(search: string) {
			update((state) => ({
				...state,
				search
			}));
		},

		/**
		 * Set price range
		 */
		setPriceRange(minPrice: number | null, maxPrice: number | null) {
			update((state) => ({
				...state,
				minPrice,
				maxPrice
			}));
		},

		/**
		 * Set sort option
		 */
		setSortBy(sortBy: ProductFilters['sortBy']) {
			update((state) => ({
				...state,
				sortBy
			}));
		},

		/**
		 * Clear all filters
		 */
		clearFilters() {
			set(initialState);
		},

		/**
		 * Reset to initial state
		 */
		reset() {
			set(initialState);
		}
	};
}

/**
 * Export store instances
 */
export const productStore = createProductStore();
export const filterStore = createFilterStore();

/**
 * Derived store for loading state
 */
export const isLoading = derived(productStore, ($productStore) => $productStore.loading === 'loading');

/**
 * Derived store for error state
 */
export const hasError = derived(productStore, ($productStore) => $productStore.loading === 'error');
