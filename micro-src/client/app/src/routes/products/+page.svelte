<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Product } from '$lib/domain/entities/Product';
	import ProductFilter from '$lib/presentation/components/products/ProductFilter.svelte';
	import ProductGrid from '$lib/presentation/components/products/ProductGrid.svelte';
	import Pagination from '$lib/presentation/components/ui/Pagination.svelte';
	import Alert from '$lib/presentation/components/ui/Alert.svelte';
	import { productStore, filterStore } from '$lib/application/stores/productStore';
	import type { ProductFilters } from '$lib/domain/entities/Product';

	let products: Product[] = [];
	let total = 0;
	let currentPage = 1;
	let pageSize = 20;
	let totalPages = 0;
	let loading = false;
	let error: string | null = null;

	let filters = {
		search: '',
		minPrice: null as number | null,
		maxPrice: null as number | null,
		sortBy: 'name_asc' as ProductFilters['sortBy']
	};

	// Subscribe to stores
	$: {
		products = $productStore.products;
		total = $productStore.total;
		currentPage = $productStore.currentPage;
		pageSize = $productStore.pageSize;
		totalPages = $productStore.totalPages;
		loading = $productStore.loading === 'loading';
		error = $productStore.error;
	}

	// Load products when component mounts or filters change
	async function loadProducts() {
		await productStore.fetchProducts(filters, currentPage, pageSize);
	}

	// Handle filter changes
	function handleFilterChange(newFilters: typeof filters) {
		filters = newFilters;
		currentPage = 1;
		productStore.setPage(1);
		loadProducts();
		updateURL();
	}

	// Handle page change
	function handlePageChange(page: number) {
		currentPage = page;
		productStore.setPage(page);
		loadProducts();
		updateURL();
		// Scroll to top
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Handle page size change
	function handlePageSizeChange(newPageSize: number) {
		pageSize = newPageSize;
		currentPage = 1;
		productStore.setPageSize(newPageSize);
		loadProducts();
		updateURL();
	}

	// Clear filters
	function handleClearFilters() {
		filters = {
			search: '',
			minPrice: null,
			maxPrice: null,
			sortBy: 'name_asc'
		};
		currentPage = 1;
		productStore.setPage(1);
		filterStore.clearFilters();
		loadProducts();
		updateURL();
	}

	// Update URL with current filters and pagination
	function updateURL() {
		const params = new URLSearchParams();

		if (filters.search) params.set('search', filters.search);
		if (filters.minPrice !== null) params.set('minPrice', filters.minPrice.toString());
		if (filters.maxPrice !== null) params.set('maxPrice', filters.maxPrice.toString());
		if (filters.sortBy !== 'name_asc') params.set('sortBy', filters.sortBy);
		if (currentPage > 1) params.set('page', currentPage.toString());
		if (pageSize !== 20) params.set('pageSize', pageSize.toString());

		const url = params.toString() ? `/products?${params.toString()}` : '/products';
		goto(url, { replaceState: true, noScroll: true });
	}

	// Load initial state from URL
	function loadFromURL() {
		const searchParams = $page.url.searchParams;

		filters.search = searchParams.get('search') || '';
		filters.minPrice = searchParams.get('minPrice')
			? parseFloat(searchParams.get('minPrice')!)
			: null;
		filters.maxPrice = searchParams.get('maxPrice')
			? parseFloat(searchParams.get('maxPrice')!)
			: null;
		filters.sortBy = (searchParams.get('sortBy') as ProductFilters['sortBy']) || 'name_asc';

		const urlPage = searchParams.get('page');
		currentPage = urlPage ? parseInt(urlPage, 10) : 1;

		const urlPageSize = searchParams.get('pageSize');
		pageSize = urlPageSize ? parseInt(urlPageSize, 10) : 20;

		productStore.setPage(currentPage);
		productStore.setPageSize(pageSize);
	}

	// Mock function for add to cart (to be implemented)
	function handleAddToCart(product: Product) {
		console.log('Add to cart:', product);
		// TODO: Implement cart functionality
		alert(`Added "${product.name}" to cart!`);
	}

	// Load products on mount
	onMount(() => {
		loadFromURL();
		loadProducts();
	});
</script>

<svelte:head>
	<title>Products - E-Commerce</title>
	<meta name="description" content="Browse our product catalog with advanced filtering and search" />
</svelte:head>

<div class="products-page">
	<div class="container">
		<!-- Page Header -->
		<header class="page-header">
			<h1 class="page-title">Products</h1>
			<p class="page-description">
				Browse our collection of products with advanced filtering and search capabilities.
			</p>
		</header>

		<!-- Error Alert -->
		{#if error}
			<Alert type="error" message={error} />
		{/if}

		<!-- Filters -->
		<ProductFilter
			search={filters.search}
			minPrice={filters.minPrice}
			maxPrice={filters.maxPrice}
			sortBy={filters.sortBy}
			onFilterChange={handleFilterChange}
		/>

		<!-- Product Grid -->
		<ProductGrid
			{products}
			{loading}
			onAddToCart={handleAddToCart}
			onClearFilters={handleClearFilters}
		/>

		<!-- Pagination -->
		{#if !loading && products.length > 0}
			<Pagination
				{currentPage}
				{totalPages}
				{pageSize}
				{total}
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
			/>
		{/if}
	</div>
</div>

<style>
	.products-page {
		min-height: 100vh;
		background: #f9fafb;
		padding: 2rem 0;
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.page-description {
		font-size: 1rem;
		color: #6b7280;
	}

	@media (max-width: 640px) {
		.products-page {
			padding: 1rem 0;
		}

		.page-title {
			font-size: 1.5rem;
		}

		.page-description {
			font-size: 0.875rem;
		}
	}
</style>
