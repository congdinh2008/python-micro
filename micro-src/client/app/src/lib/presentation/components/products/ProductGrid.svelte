<script lang="ts">
	import type { Product } from '$lib/domain/entities/Product';
	import ProductCard from './ProductCard.svelte';
	import SkeletonLoader from '../ui/SkeletonLoader.svelte';
	import EmptyState from '../ui/EmptyState.svelte';

	/**
	 * Product grid component for displaying products
	 */
	export let products: Product[];
	export let loading: boolean = false;
	export let onAddToCart: ((product: Product) => void) | undefined = undefined;
	export let onClearFilters: (() => void) | undefined = undefined;
</script>

<div class="product-grid-container" data-testid="product-grid">
	{#if loading}
		<!-- Loading skeleton -->
		<div class="product-grid">
			{#each Array(8) as _unused}
				<SkeletonLoader variant="card" />
			{/each}
		</div>
	{:else if products.length === 0}
		<!-- Empty state -->
		<EmptyState
			title="No products found"
			description="Try adjusting your filters or search term to find what you're looking for."
			actionText={onClearFilters ? 'Clear Filters' : ''}
			onAction={onClearFilters}
		/>
	{:else}
		<!-- Product grid -->
		<div class="product-grid">
			{#each products as product (product.id)}
				<ProductCard {product} {onAddToCart} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.product-grid-container {
		min-height: 400px;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	@media (max-width: 640px) {
		.product-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (min-width: 641px) and (max-width: 1024px) {
		.product-grid {
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		}
	}

	@media (min-width: 1025px) {
		.product-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		}
	}
</style>
