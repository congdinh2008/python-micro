<script lang="ts">
	/**
	 * @page Cart Page
	 * @description Full shopping cart page with items list and summary
	 */
	import { goto } from '$app/navigation';
	import { uiStore } from '$lib/application/stores/uiStore';
	import {
		cartStore,
		cartItems,
		cartTotals,
		isCartEmpty,
		cartError,
		lastRemovedItem
	} from '$lib/application/stores/cartStore';
	import CartItemCard from '$lib/presentation/components/cart/CartItemCard.svelte';
	import CartSummary from '$lib/presentation/components/cart/CartSummary.svelte';
	import EmptyCart from '$lib/presentation/components/cart/EmptyCart.svelte';
	import Alert from '$lib/presentation/components/ui/Alert.svelte';
	import { fade, slide } from 'svelte/transition';

	let showUndoNotification = false;
	let undoTimeout: ReturnType<typeof setTimeout> | null = null;

	async function handleUpdateQuantity(productId: number, quantity: number) {
		await cartStore.updateQuantity(productId, quantity);
	}

	async function handleRemove(productId: number) {
		await cartStore.removeFromCart(productId);

		// Show undo notification with toast
		showUndoNotification = true;
		uiStore.showInfo('Item removed from cart');

		// Clear any existing timeout
		if (undoTimeout) {
			clearTimeout(undoTimeout);
		}

		// Hide notification after 5 seconds
		undoTimeout = setTimeout(() => {
			showUndoNotification = false;
		}, 5000);
	}

	async function handleUndo() {
		await cartStore.undoRemove();
		showUndoNotification = false;
		uiStore.showSuccess('Item restored to cart');

		if (undoTimeout) {
			clearTimeout(undoTimeout);
			undoTimeout = null;
		}
	}

	function handleClearCart() {
		if (confirm('Are you sure you want to clear your cart?')) {
			cartStore.clearCart();
			uiStore.showInfo('Cart cleared successfully');
		}
	}

	function handleCheckout() {
		goto('/checkout');
	}

	function handleContinueShopping() {
		goto('/products');
	}
</script>

<svelte:head>
	<title>Shopping Cart - E-Commerce</title>
</svelte:head>

<div class="cart-page">
	<div class="container">
		<!-- Page Header -->
		<header class="page-header">
			<h1 class="page-title">Shopping Cart</h1>
			{#if !$isCartEmpty}
				<p class="page-subtitle">
					{$cartTotals.uniqueItems} {$cartTotals.uniqueItems === 1 ? 'item' : 'items'} in your cart
				</p>
			{/if}
		</header>

		<!-- Error Alert -->
		{#if $cartError}
			<Alert type="error" message={$cartError} dismissible onDismiss={() => cartStore.clearError()} />
		{/if}

		<!-- Undo Notification -->
		{#if showUndoNotification && $lastRemovedItem}
			<div class="undo-notification" transition:slide={{ duration: 300 }}>
				<span class="undo-message">Item removed from cart</span>
				<button class="undo-btn" onclick={handleUndo}>Undo</button>
			</div>
		{/if}

		<!-- Cart Content -->
		{#if $isCartEmpty}
			<EmptyCart onContinueShopping={handleContinueShopping} />
		{:else}
			<div class="cart-content">
				<!-- Cart Items List -->
				<div class="cart-items">
					{#each $cartItems as item (item.productId)}
						<div transition:fade={{ duration: 200 }}>
							<CartItemCard
								{item}
								onUpdateQuantity={handleUpdateQuantity}
								onRemove={handleRemove}
							/>
						</div>
					{/each}
				</div>

				<!-- Cart Summary Sidebar -->
				<div class="cart-sidebar">
					<CartSummary
						totals={$cartTotals}
						onCheckout={handleCheckout}
						onClearCart={handleClearCart}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.cart-page {
		min-height: calc(100vh - 4rem);
		background: #f9fafb;
		padding: 2rem 0;
	}

	.container {
		max-width: 1200px;
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
		margin: 0 0 0.5rem 0;
	}

	.page-subtitle {
		font-size: 1rem;
		color: #6b7280;
		margin: 0;
	}

	.undo-notification {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #111827;
		color: white;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.undo-message {
		font-size: 0.875rem;
	}

	.undo-btn {
		padding: 0.5rem 1rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.undo-btn:hover {
		background: #1d4ed8;
	}

	.undo-btn:focus {
		outline: 2px solid white;
		outline-offset: 2px;
	}

	.cart-content {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 2rem;
		align-items: start;
	}

	.cart-items {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (max-width: 1024px) {
		.cart-content {
			grid-template-columns: 1fr 350px;
		}
	}

	@media (max-width: 768px) {
		.cart-content {
			grid-template-columns: 1fr;
		}

		.cart-sidebar {
			order: -1;
		}

		.page-title {
			font-size: 1.5rem;
		}
	}
</style>
