<script lang="ts">
	import type { ProductFilters } from '$lib/domain/entities/Product';
	import { debounce } from '$lib/utils/debounce';

	/**
	 * Product filter component
	 */
	export let search: string = '';
	export let minPrice: number | null = null;
	export let maxPrice: number | null = null;
	export let sortBy: ProductFilters['sortBy'] = 'name_asc';
	export let onFilterChange: (filters: {
		search: string;
		minPrice: number | null;
		maxPrice: number | null;
		sortBy: ProductFilters['sortBy'];
	}) => void;

	let localSearch = search;
	let localMinPrice = minPrice?.toString() ?? '';
	let localMaxPrice = maxPrice?.toString() ?? '';

	// Debounced search handler
	const debouncedSearch = debounce((value: string) => {
		search = value;
		emitFilterChange();
	}, 300);

	function handleSearchInput(event: Event) {
		const input = event.target as HTMLInputElement;
		localSearch = input.value;
		debouncedSearch(localSearch);
	}

	function handleMinPriceChange(event: Event) {
		const input = event.target as HTMLInputElement;
		localMinPrice = input.value;
		minPrice = localMinPrice ? parseFloat(localMinPrice) : null;
		emitFilterChange();
	}

	function handleMaxPriceChange(event: Event) {
		const input = event.target as HTMLInputElement;
		localMaxPrice = input.value;
		maxPrice = localMaxPrice ? parseFloat(localMaxPrice) : null;
		emitFilterChange();
	}

	function handleSortChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		sortBy = select.value as ProductFilters['sortBy'];
		emitFilterChange();
	}

	function emitFilterChange() {
		onFilterChange({
			search,
			minPrice,
			maxPrice,
			sortBy
		});
	}

	function clearFilters() {
		localSearch = '';
		localMinPrice = '';
		localMaxPrice = '';
		search = '';
		minPrice = null;
		maxPrice = null;
		sortBy = 'name_asc';
		emitFilterChange();
	}

	$: hasActiveFilters = search || minPrice !== null || maxPrice !== null || sortBy !== 'name_asc';
</script>

<div class="filter-container" data-testid="product-filter">
	<div class="filter-header">
		<h2 class="filter-title">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="icon"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
				/>
			</svg>
			Filters
		</h2>

		{#if hasActiveFilters}
			<button class="clear-filters" onclick={clearFilters} aria-label="Clear all filters">
				Clear All
			</button>
		{/if}
	</div>

	<div class="filter-content">
		<!-- Search -->
		<div class="filter-group">
			<label for="search" class="filter-label">Search</label>
			<input
				id="search"
				type="text"
				value={localSearch}
				oninput={handleSearchInput}
				placeholder="Search products..."
				class="filter-input"
				aria-label="Search products"
			/>
		</div>

		<!-- Price Range -->
		<div class="filter-group">
			<span class="filter-label">Price Range</span>
			<div class="price-range">
				<input
					type="number"
					value={localMinPrice}
					oninput={handleMinPriceChange}
					placeholder="Min"
					min="0"
					step="0.01"
					class="filter-input price-input"
					aria-label="Minimum price"
				/>
				<span class="price-separator">-</span>
				<input
					type="number"
					value={localMaxPrice}
					oninput={handleMaxPriceChange}
					placeholder="Max"
					min="0"
					step="0.01"
					class="filter-input price-input"
					aria-label="Maximum price"
				/>
			</div>
		</div>

		<!-- Sort By -->
		<div class="filter-group">
			<label for="sortBy" class="filter-label">Sort By</label>
			<select
				id="sortBy"
				value={sortBy}
				onchange={handleSortChange}
				class="filter-select"
				aria-label="Sort products by"
			>
				<option value="name_asc">Name (A-Z)</option>
				<option value="name_desc">Name (Z-A)</option>
				<option value="price_asc">Price (Low to High)</option>
				<option value="price_desc">Price (High to Low)</option>
				<option value="in_stock">In Stock First</option>
				<option value="rating_desc">Rating (High to Low)</option>
			</select>
		</div>
	</div>
</div>

<style>
	.filter-container {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.filter-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
	}

	.filter-title .icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.clear-filters {
		padding: 0.5rem 1rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.clear-filters:hover {
		background: #dc2626;
	}

	.clear-filters:focus {
		outline: 2px solid #ef4444;
		outline-offset: 2px;
	}

	.filter-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.filter-input,
	.filter-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		background: white;
		transition: border-color 0.2s;
	}

	.filter-input:focus,
	.filter-select:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.price-range {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.price-input {
		flex: 1;
	}

	.price-separator {
		color: #6b7280;
	}

	@media (max-width: 768px) {
		.filter-content {
			grid-template-columns: 1fr;
		}
	}
</style>
