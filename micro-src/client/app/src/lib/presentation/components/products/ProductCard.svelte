<script lang="ts">
	import type { Product } from '$lib/domain/entities/Product';
	import { formatPrice, truncateText } from '$lib/utils/formatters';

	/**
	 * Product card component for displaying product in grid
	 */
	export let product: Product;
	export let onAddToCart: ((product: Product) => void) | undefined = undefined;
</script>

<article class="product-card" data-testid="product-card">
	<!-- Product Image -->
	<div class="product-image">
		<img
			src="https://via.placeholder.com/300x200?text={encodeURIComponent(product.name)}"
			alt={product.name}
			loading="lazy"
		/>
		{#if product.quantity === 0}
			<div class="out-of-stock-badge">Out of Stock</div>
		{/if}
	</div>

	<!-- Product Info -->
	<div class="product-content">
		<h3 class="product-name">
			<a href="/products/{product.id}">{product.name}</a>
		</h3>

		{#if product.description}
			<p class="product-description">
				{truncateText(product.description, 100)}
			</p>
		{/if}

		<div class="product-footer">
			<div class="product-price">
				{formatPrice(product.price)}
			</div>

			<div class="product-stock">
				{#if product.quantity > 0}
					<span class="stock-in">In Stock ({product.quantity})</span>
				{:else}
					<span class="stock-out">Out of Stock</span>
				{/if}
			</div>
		</div>

		<!-- Actions -->
		<div class="product-actions">
			<a href="/products/{product.id}" class="btn-view" aria-label="View {product.name} details">
				View Details
			</a>

			{#if onAddToCart}
				<button
					class="btn-add-cart"
					disabled={product.quantity === 0}
					onclick={() => onAddToCart?.(product)}
					aria-label="Add {product.name} to cart"
				>
					{product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
				</button>
			{/if}
		</div>
	</div>
</article>

<style>
	.product-card {
		display: flex;
		flex-direction: column;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: all 0.2s;
		height: 100%;
	}

	.product-card:hover {
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
		transform: translateY(-2px);
	}

	.product-image {
		position: relative;
		width: 100%;
		height: 12rem;
		overflow: hidden;
		background: #f3f4f6;
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.out-of-stock-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: #ef4444;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.product-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 1rem;
	}

	.product-name {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.product-name a {
		color: #111827;
		text-decoration: none;
		transition: color 0.2s;
	}

	.product-name a:hover {
		color: #2563eb;
	}

	.product-description {
		font-size: 0.875rem;
		color: #6b7280;
		margin-bottom: 1rem;
		line-height: 1.5;
		flex: 1;
	}

	.product-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-top: 0.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.product-price {
		font-size: 1.5rem;
		font-weight: 700;
		color: #2563eb;
	}

	.product-stock {
		font-size: 0.875rem;
	}

	.stock-in {
		color: #10b981;
		font-weight: 500;
	}

	.stock-out {
		color: #ef4444;
		font-weight: 500;
	}

	.product-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-view,
	.btn-add-cart {
		flex: 1;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
		text-align: center;
		transition: all 0.2s;
		cursor: pointer;
		border: none;
		text-decoration: none;
		display: inline-block;
	}

	.btn-view {
		background: white;
		color: #2563eb;
		border: 1px solid #2563eb;
	}

	.btn-view:hover {
		background: #eff6ff;
	}

	.btn-add-cart {
		background: #2563eb;
		color: white;
	}

	.btn-add-cart:hover:not(:disabled) {
		background: #1d4ed8;
	}

	.btn-add-cart:disabled {
		background: #9ca3af;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.btn-view:focus,
	.btn-add-cart:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	@media (max-width: 640px) {
		.product-actions {
			flex-direction: column;
		}
	}
</style>
