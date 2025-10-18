<script lang="ts">
	/**
	 * @component EmptyCart
	 * @description Empty state component for cart
	 */
	import Button from '../ui/Button.svelte';

	export let onContinueShopping: (() => void) | undefined = undefined;
</script>

<div class="empty-cart" role="status" aria-label="Cart is empty">
	<!-- Empty Cart Icon -->
	<div class="icon-wrapper">
		<svg
			class="empty-icon"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
			/>
		</svg>
	</div>

	<h2 class="title">Your cart is empty</h2>
	<p class="description">Looks like you haven't added any items to your cart yet.</p>

	{#if onContinueShopping}
		<Button variant="primary" size="lg" onclick={onContinueShopping}>
			Continue Shopping
		</Button>
	{/if}
</div>

<style>
	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		min-height: 400px;
	}

	.icon-wrapper {
		margin-bottom: 2rem;
	}

	.empty-icon {
		width: 6rem;
		height: 6rem;
		color: #d1d5db;
	}

	.title {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.75rem 0;
	}

	.description {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 2rem 0;
		max-width: 32rem;
	}

	@media (max-width: 640px) {
		.empty-cart {
			padding: 3rem 1rem;
		}

		.empty-icon {
			width: 4rem;
			height: 4rem;
		}

		.title {
			font-size: 1.5rem;
		}

		.description {
			font-size: 0.875rem;
		}
	}
</style>
