<script lang="ts">
	/**
	 * @component CartSummary
	 * @description Cart summary with totals and checkout button
	 */
	import type { CartTotals } from '$lib/domain/entities/Cart';
	import { formatPrice } from '$lib/utils/formatters';
	import Button from '../ui/Button.svelte';

	export let totals: CartTotals;
	export let onCheckout: (() => void) | undefined = undefined;
	export let onClearCart: (() => void) | undefined = undefined;
</script>

<aside class="cart-summary" aria-label="Cart summary">
	<h2 class="summary-title">Order Summary</h2>

	<div class="summary-details">
		<div class="summary-row">
			<span class="summary-label">Items ({totals.uniqueItems})</span>
			<span class="summary-value">{totals.itemCount}</span>
		</div>

		<div class="summary-row subtotal">
			<span class="summary-label">Subtotal</span>
			<span class="summary-value">{formatPrice(totals.subtotal)}</span>
		</div>

		<!-- Future: Add shipping, tax, etc. -->
	</div>

	<div class="summary-total">
		<span class="total-label">Total</span>
		<span class="total-value">{formatPrice(totals.subtotal)}</span>
	</div>

	<div class="summary-actions">
		<Button variant="primary" size="lg" fullWidth onclick={onCheckout}>
			Proceed to Checkout
		</Button>

		{#if onClearCart}
			<button class="clear-cart-btn" onclick={onClearCart} aria-label="Clear all items from cart">
				Clear Cart
			</button>
		{/if}
	</div>
</aside>

<style>
	.cart-summary {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		position: sticky;
		top: 1rem;
	}

	.summary-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 1rem 0;
	}

	.summary-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
		margin-bottom: 1rem;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.summary-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.summary-value {
		font-size: 0.875rem;
		color: #111827;
		font-weight: 500;
	}

	.summary-row.subtotal {
		padding-top: 0.5rem;
	}

	.summary-row.subtotal .summary-label,
	.summary-row.subtotal .summary-value {
		font-size: 1rem;
		font-weight: 600;
	}

	.summary-total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-top: 2px solid #e5e7eb;
		border-bottom: 2px solid #e5e7eb;
		margin-bottom: 1.5rem;
	}

	.total-label {
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
	}

	.total-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #2563eb;
	}

	.summary-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.clear-cart-btn {
		width: 100%;
		padding: 0.5rem 1rem;
		border: 1px solid #e5e7eb;
		background: white;
		color: #6b7280;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-cart-btn:hover {
		background: #f9fafb;
		border-color: #d1d5db;
		color: #111827;
	}

	.clear-cart-btn:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	@media (max-width: 768px) {
		.cart-summary {
			position: static;
		}
	}
</style>
