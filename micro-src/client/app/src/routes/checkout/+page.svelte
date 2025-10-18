<script lang="ts">
	/**
	 * @page Checkout Page
	 * @description Checkout page with cart validation and order creation
	 */
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { cartStore, cartItems, cartTotals, isCartEmpty } from '$lib/application/stores/cartStore';
	import { orderStore } from '$lib/application/stores/orderStore';
	import { isAuthenticated } from '$lib/application/stores/authStore';
	import { CheckoutUseCase } from '$lib/application/usecases/CheckoutUseCase';
	import { OrderRepository } from '$lib/infrastructure/repositories/OrderRepository';
	import CartItemCard from '$lib/presentation/components/cart/CartItemCard.svelte';
	import Alert from '$lib/presentation/components/ui/Alert.svelte';
	import { fade } from 'svelte/transition';
	import type { CartItem } from '$lib/domain/entities/Cart';

	let isProcessing = false;
	let checkoutError = '';
	let checkoutSuccess = false;
	let createdOrderIds: number[] = [];
	let validationErrors: string[] = [];
	let isDoubleSubmitAttempt = false;

	// Initialize use case
	const orderRepository = new OrderRepository();
	const checkoutUseCase = new CheckoutUseCase(orderRepository);

	// Check authentication on mount
	onMount(() => {
		if (!$isAuthenticated) {
			// Store intended destination and redirect to login
			if (typeof window !== 'undefined') {
				sessionStorage.setItem('redirect_after_login', '/checkout');
			}
			goto('/auth/login');
			return;
		}

		// Validate cart is not empty
		if ($isCartEmpty) {
			goto('/cart');
		}
	});

	/**
	 * Validate cart before checkout
	 */
	function validateCheckout(): boolean {
		const errors: string[] = [];

		if ($cartItems.length === 0) {
			errors.push('Your cart is empty');
		}

		// Check each item
		for (const item of $cartItems) {
			if (item.quantity > item.maxStock) {
				errors.push(`${item.name}: Not enough stock (available: ${item.maxStock})`);
			}
			if (item.quantity <= 0) {
				errors.push(`${item.name}: Invalid quantity`);
			}
		}

		validationErrors = errors;
		return errors.length === 0;
	}

	/**
	 * Handle checkout process
	 */
	async function handleCheckout() {
		// Reset states
		checkoutError = '';
		validationErrors = [];
		isDoubleSubmitAttempt = false;

		// Check if already processing (double-submit prevention)
		if (isProcessing || checkoutUseCase.isCheckoutInProgress()) {
			isDoubleSubmitAttempt = true;
			checkoutError = 'Checkout is already in progress. Please wait.';
			return;
		}

		// Validate checkout
		if (!validateCheckout()) {
			checkoutError = 'Please fix the errors before proceeding';
			return;
		}

		isProcessing = true;

		try {
			// Execute checkout
			const result = await checkoutUseCase.execute($cartItems);

			if (result.success && result.orders) {
				// Success! Store order IDs
				createdOrderIds = result.orders.map((order) => order.id);
				checkoutSuccess = true;

				// Add orders to order store
				orderStore.addOrders(result.orders);

				// Clear cart after successful checkout
				await cartStore.clearCart();

				// Show partial failure warning if any
				if (result.failedItems && result.failedItems.length > 0) {
					checkoutError = `Warning: ${result.failedItems.length} item(s) failed. Orders created: ${createdOrderIds.join(', ')}`;
				}

				// Redirect to order confirmation after 2 seconds
				setTimeout(() => {
					goto(`/orders`);
				}, 2000);
			} else {
				// Failure
				checkoutError = result.error || 'Checkout failed. Please try again.';
				checkoutSuccess = false;
			}
		} catch (error) {
			console.error('Checkout error:', error);
			checkoutError = 'An unexpected error occurred. Please try again.';
			checkoutSuccess = false;
		} finally {
			isProcessing = false;
		}
	}

	/**
	 * Handle cancel and go back to cart
	 */
	function handleCancel() {
		goto('/cart');
	}
</script>

<svelte:head>
	<title>Checkout - E-Commerce</title>
</svelte:head>

<div class="checkout-page">
	<div class="container">
		<!-- Page Header -->
		<header class="page-header">
			<h1 class="page-title">Checkout</h1>
			<p class="page-subtitle">Review your order and confirm purchase</p>
		</header>

		{#if checkoutSuccess}
			<!-- Success Message -->
			<div class="success-section" transition:fade>
				<div class="success-icon">✓</div>
				<h2 class="success-title">Order Placed Successfully!</h2>
				<p class="success-message">
					Your order has been created. Order ID(s): {createdOrderIds.join(', ')}
				</p>
				<p class="success-redirect">Redirecting to your orders...</p>
			</div>
		{:else}
			<!-- Checkout Form -->
			<div class="checkout-content">
				<!-- Left Column: Order Items -->
				<div class="order-items">
					<h2 class="section-title">Order Items ({$cartItems.length})</h2>

					<!-- Validation Errors -->
					{#if validationErrors.length > 0}
						<Alert type="error" message="Please fix the following errors:" dismissible={false} />
						<ul class="validation-errors">
							{#each validationErrors as error}
								<li class="validation-error">{error}</li>
							{/each}
						</ul>
					{/if}

					<!-- Checkout Error -->
					{#if checkoutError}
						<Alert
							type={isDoubleSubmitAttempt ? 'warning' : 'error'}
							message={checkoutError}
							dismissible
							onDismiss={() => {
								checkoutError = '';
								isDoubleSubmitAttempt = false;
							}}
						/>
					{/if}

					<!-- Items List -->
					<div class="items-list">
						{#each $cartItems as item (item.productId)}
							<div class="item-wrapper" transition:fade>
								<CartItemCard {item} readonly />
							</div>
						{/each}
					</div>
				</div>

				<!-- Right Column: Order Summary -->
				<div class="order-summary">
					<div class="summary-card">
						<h2 class="summary-title">Order Summary</h2>

						<div class="summary-details">
							<div class="summary-row">
								<span class="summary-label">Items:</span>
								<span class="summary-value">{$cartTotals.itemCount}</span>
							</div>

							<div class="summary-row">
								<span class="summary-label">Subtotal:</span>
								<span class="summary-value">${$cartTotals.subtotal.toFixed(2)}</span>
							</div>

							<div class="summary-divider"></div>

							<div class="summary-row summary-total">
								<span class="summary-label">Total:</span>
								<span class="summary-value">${$cartTotals.subtotal.toFixed(2)}</span>
							</div>
						</div>

						<!-- Checkout Actions -->
						<div class="checkout-actions">
							<button
								class="btn btn-primary"
								onclick={handleCheckout}
								disabled={isProcessing}
								aria-label="Place order"
							>
								{#if isProcessing}
									<span class="spinner"></span>
									Processing...
								{:else}
									Place Order
								{/if}
							</button>

							<button
								class="btn btn-secondary"
								onclick={handleCancel}
								disabled={isProcessing}
								aria-label="Cancel and return to cart"
							>
								Cancel
							</button>
						</div>

						<!-- Security Notice -->
						<div class="security-notice">
							<svg
								class="security-icon"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							<span class="security-text">Secure checkout</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.checkout-page {
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
		text-align: center;
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

	/* Success Section */
	.success-section {
		background: white;
		padding: 3rem;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
		max-width: 600px;
		margin: 0 auto;
	}

	.success-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		background: #10b981;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: bold;
	}

	.success-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 1rem 0;
	}

	.success-message {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 1rem 0;
	}

	.success-redirect {
		font-size: 0.875rem;
		color: #9ca3af;
		font-style: italic;
	}

	/* Checkout Content */
	.checkout-content {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 2rem;
		align-items: start;
	}

	/* Order Items */
	.order-items {
		background: white;
		padding: 1.5rem;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 1rem 0;
	}

	.validation-errors {
		margin: 1rem 0;
		padding: 0;
		list-style: none;
	}

	.validation-error {
		padding: 0.5rem;
		background: #fee2e2;
		color: #991b1b;
		border-radius: 0.375rem;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.items-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.item-wrapper {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	/* Order Summary */
	.order-summary {
		position: sticky;
		top: 1rem;
	}

	.summary-card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.summary-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 1.5rem 0;
	}

	.summary-details {
		margin-bottom: 1.5rem;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.summary-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.summary-value {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
	}

	.summary-divider {
		height: 1px;
		background: #e5e7eb;
		margin: 1rem 0;
	}

	.summary-total {
		margin-top: 1rem;
	}

	.summary-total .summary-label,
	.summary-total .summary-value {
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
	}

	/* Checkout Actions */
	.checkout-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #1d4ed8;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #f9fafb;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Security Notice */
	.security-notice {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #f0fdf4;
		border-radius: 0.5rem;
		color: #166534;
	}

	.security-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	.security-text {
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.checkout-content {
			grid-template-columns: 1fr 350px;
		}
	}

	@media (max-width: 768px) {
		.checkout-content {
			grid-template-columns: 1fr;
		}

		.order-summary {
			position: static;
			order: -1;
		}

		.page-title {
			font-size: 1.5rem;
		}

		.success-section {
			padding: 2rem 1rem;
		}
	}
</style>
