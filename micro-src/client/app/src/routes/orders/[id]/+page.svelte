<script lang="ts">
	/**
	 * @page Order Details Page
	 * @description Detailed view of a specific order
	 */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		orderStore,
		currentOrder,
		orderLoading,
		orderError
	} from '$lib/application/stores/orderStore';
	import { isAuthenticated } from '$lib/application/stores/authStore';
	import Alert from '$lib/presentation/components/ui/Alert.svelte';
	import { formatPrice } from '$lib/utils/formatters';
	import { OrderStatus } from '$lib/domain/entities/Order';
	import { fade } from 'svelte/transition';

	$: orderId = Number($page.params.id);

	// Check authentication and load order on mount
	onMount(async () => {
		if (!$isAuthenticated) {
			goto('/auth/login');
			return;
		}

		if (orderId && !isNaN(orderId)) {
			await orderStore.fetchOrderById(orderId);
		} else {
			goto('/orders');
		}

		// Cleanup on unmount
		return () => {
			orderStore.clearCurrentOrder();
		};
	});

	/**
	 * Get status badge color
	 */
	function getStatusColor(status: string): string {
		switch (status) {
			case OrderStatus.PENDING:
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case OrderStatus.CONFIRMED:
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case OrderStatus.SHIPPED:
				return 'bg-purple-100 text-purple-800 border-purple-200';
			case OrderStatus.DELIVERED:
				return 'bg-green-100 text-green-800 border-green-200';
			case OrderStatus.CANCELLED:
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	}

	/**
	 * Format date
	 */
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	/**
	 * Handle back to orders
	 */
	function handleBackToOrders() {
		goto('/orders');
	}
</script>

<svelte:head>
	<title>{$currentOrder ? `Order #${$currentOrder.id}` : 'Order Details'} - E-Commerce</title>
</svelte:head>

<div class="order-details-page">
	<div class="container">
		<!-- Back Button -->
		<button class="back-btn" onclick={handleBackToOrders} aria-label="Back to orders">
			<svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Back to Orders
		</button>

		<!-- Error Alert -->
		{#if $orderError}
			<Alert type="error" message={$orderError} dismissible onDismiss={() => orderStore.clearError()} />
		{/if}

		<!-- Loading State -->
		{#if $orderLoading}
			<div class="loading-container">
				<div class="spinner"></div>
				<p class="loading-text">Loading order details...</p>
			</div>
		{:else if $currentOrder}
			<!-- Order Details -->
			<div class="order-content" transition:fade>
				<!-- Order Header -->
				<header class="order-header">
					<div class="header-left">
						<h1 class="order-title">Order #{$currentOrder.id}</h1>
						<p class="order-date">Placed on {formatDate($currentOrder.created_at)}</p>
					</div>
					<span class="status-badge {getStatusColor($currentOrder.status)}">
						{$currentOrder.status}
					</span>
				</header>

				<!-- Order Information Card -->
				<div class="order-card">
					<h2 class="card-title">Order Information</h2>

					<div class="info-grid">
						<div class="info-item">
							<span class="info-label">Order ID</span>
							<span class="info-value">#{$currentOrder.id}</span>
						</div>

						<div class="info-item">
							<span class="info-label">Status</span>
							<span class="info-value capitalize">{$currentOrder.status}</span>
						</div>

						<div class="info-item">
							<span class="info-label">Order Date</span>
							<span class="info-value">{formatDate($currentOrder.created_at)}</span>
						</div>

						<div class="info-item">
							<span class="info-label">Last Updated</span>
							<span class="info-value">{formatDate($currentOrder.updated_at)}</span>
						</div>
					</div>
				</div>

				<!-- Product Details Card -->
				<div class="order-card">
					<h2 class="card-title">Product Details</h2>

					<div class="product-details">
						<div class="product-row">
							<div class="product-info">
								<h3 class="product-name">{$currentOrder.product_name}</h3>
								<p class="product-meta">Product ID: {$currentOrder.product_id}</p>
							</div>
						</div>

						<div class="product-pricing">
							<div class="pricing-row">
								<span class="pricing-label">Unit Price:</span>
								<span class="pricing-value">{formatPrice($currentOrder.unit_price)}</span>
							</div>
							<div class="pricing-row">
								<span class="pricing-label">Quantity:</span>
								<span class="pricing-value">{$currentOrder.quantity}</span>
							</div>
							<div class="pricing-divider"></div>
							<div class="pricing-row pricing-total">
								<span class="pricing-label">Total:</span>
								<span class="pricing-value">{formatPrice($currentOrder.total_price)}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Order Summary Card -->
				<div class="order-card summary-card">
					<h2 class="card-title">Order Summary</h2>

					<div class="summary-details">
						<div class="summary-row">
							<span class="summary-label">Subtotal</span>
							<span class="summary-value">{formatPrice($currentOrder.total_price)}</span>
						</div>
						<div class="summary-row">
							<span class="summary-label">Tax</span>
							<span class="summary-value">$0.00</span>
						</div>
						<div class="summary-row">
							<span class="summary-label">Shipping</span>
							<span class="summary-value">$0.00</span>
						</div>
						<div class="summary-divider"></div>
						<div class="summary-row summary-total">
							<span class="summary-label">Total</span>
							<span class="summary-value">{formatPrice($currentOrder.total_price)}</span>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Not Found State -->
			<div class="not-found-state" transition:fade>
				<svg
					class="not-found-icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h2 class="not-found-title">Order Not Found</h2>
				<p class="not-found-description">
					The order you're looking for doesn't exist or you don't have access to it.
				</p>
				<button class="btn-primary" onclick={handleBackToOrders}>
					Back to Orders
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.order-details-page {
		min-height: calc(100vh - 4rem);
		background: #f9fafb;
		padding: 2rem 0;
	}

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Back Button */
	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 1.5rem;
	}

	.back-btn:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.back-btn:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	.back-icon {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Loading State */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 0;
	}

	.spinner {
		width: 3rem;
		height: 3rem;
		border: 4px solid #e5e7eb;
		border-top-color: #2563eb;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		margin-top: 1rem;
		font-size: 1rem;
		color: #6b7280;
	}

	/* Not Found State */
	.not-found-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.not-found-icon {
		width: 4rem;
		height: 4rem;
		color: #ef4444;
		margin-bottom: 1.5rem;
	}

	.not-found-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.not-found-description {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 2rem 0;
		text-align: center;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn-primary:hover {
		background: #1d4ed8;
	}

	.btn-primary:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	/* Order Content */
	.order-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Order Header */
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
		padding: 1.5rem;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.header-left {
		flex: 1;
	}

	.order-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.order-date {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.status-badge {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		border-radius: 9999px;
		border: 2px solid;
		white-space: nowrap;
	}

	/* Order Card */
	.order-card {
		padding: 1.5rem;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.card-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 1.5rem 0;
		padding-bottom: 1rem;
		border-bottom: 2px solid #e5e7eb;
	}

	/* Info Grid */
	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		font-weight: 500;
		letter-spacing: 0.05em;
	}

	.info-value {
		font-size: 1rem;
		color: #111827;
		font-weight: 500;
	}

	.capitalize {
		text-transform: capitalize;
	}

	/* Product Details */
	.product-details {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.product-row {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}

	.product-info {
		flex: 1;
	}

	.product-name {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.product-meta {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	/* Product Pricing */
	.product-pricing {
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.pricing-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.pricing-row:last-child {
		margin-bottom: 0;
	}

	.pricing-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.pricing-value {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
	}

	.pricing-divider {
		height: 1px;
		background: #e5e7eb;
		margin: 0.75rem 0;
	}

	.pricing-total {
		margin-top: 0.5rem;
	}

	.pricing-total .pricing-label,
	.pricing-total .pricing-value {
		font-size: 1.125rem;
		font-weight: 700;
		color: #2563eb;
	}

	/* Order Summary */
	.summary-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.summary-card .card-title {
		color: white;
		border-bottom-color: rgba(255, 255, 255, 0.2);
	}

	.summary-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.summary-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.summary-value {
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
	}

	.summary-divider {
		height: 1px;
		background: rgba(255, 255, 255, 0.2);
		margin: 0.5rem 0;
	}

	.summary-total {
		margin-top: 0.5rem;
		padding-top: 0.75rem;
		border-top: 2px solid rgba(255, 255, 255, 0.3);
	}

	.summary-total .summary-label,
	.summary-total .summary-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.order-title {
			font-size: 1.5rem;
		}

		.order-header {
			flex-direction: column;
		}

		.info-grid {
			grid-template-columns: 1fr;
		}

		.product-row {
			flex-direction: column;
		}
	}
</style>
