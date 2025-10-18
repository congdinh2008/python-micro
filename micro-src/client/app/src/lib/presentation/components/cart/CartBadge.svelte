<script lang="ts">
	/**
	 * @component CartBadge
	 * @description Cart icon with animated badge showing item count
	 */
	import { cartTotals } from '$lib/application/stores/cartStore';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let onclick: (() => void) | undefined = undefined;

	$: itemCount = $cartTotals.itemCount;
</script>

<button
	class="cart-badge-button"
	onclick={onclick}
	aria-label="Shopping cart with {itemCount} items"
	data-testid="cart-badge-button"
>
	<!-- Shopping Cart Icon -->
	<svg
		class="cart-icon"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
		/>
	</svg>

	<!-- Badge with item count -->
	{#if itemCount > 0}
		<span
			class="badge"
			data-testid="cart-badge"
			in:scale={{ duration: 300, easing: quintOut, start: 0.5 }}
			out:scale={{ duration: 200 }}
		>
			{itemCount > 99 ? '99+' : itemCount}
		</span>
	{/if}
</button>

<style>
	.cart-badge-button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: background-color 0.2s;
	}

	.cart-badge-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.cart-badge-button:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	.cart-icon {
		width: 1.75rem;
		height: 1.75rem;
		color: #374151;
	}

	.badge {
		position: absolute;
		top: -0.25rem;
		right: -0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		background-color: #ef4444;
		color: white;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	}

	@media (prefers-reduced-motion: reduce) {
		.cart-badge-button {
			transition: none;
		}
	}
</style>
