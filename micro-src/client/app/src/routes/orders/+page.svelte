<script lang="ts">
	/**
	 * @page Orders Page
	 * @description List of user's orders with status and details, with filtering capabilities
	 */
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		orderStore,
		orders,
		orderLoading,
		orderError,
		orderFilters
	} from '$lib/application/stores/orderStore';
	import { isAuthenticated } from '$lib/application/stores/authStore';
	import Alert from '$lib/presentation/components/ui/Alert.svelte';
	import OrderHistoryFilter from '$lib/presentation/components/order/OrderHistoryFilter.svelte';
	import OrderCardSkeleton from '$lib/presentation/components/order/OrderCardSkeleton.svelte';
	import { formatPrice } from '$lib/utils/formatters';
	import { OrderStatus } from '$lib/domain/entities/Order';
	import type { OrderHistoryFilters } from '$lib/domain/dto/OrderHistoryFilters';
	import { fade } from 'svelte/transition';
	import { debounce } from '$lib/utils/debounce';

	let hasLoaded = false;
	let isFiltering = false;

	// Check authentication and load orders on mount
	onMount(async () => {
		if (!$isAuthenticated) {
			goto('/auth/login');
			return;
		}

		await orderStore.fetchOrders();
		hasLoaded = true;
	});

	/**
	 * Track the current filter request to prevent race conditions
	 * Using a counter is safe for this use case as it would take millions of years
	 * of continuous filtering to reach overflow at human interaction speeds
	 */
	let currentRequestId = 0;

	/**
	 * Handle filter changes with debounce and race condition prevention
	 */
	const handleFilterChange = debounce(async (filters: Partial<OrderHistoryFilters>) => {
		currentRequestId++;
		const requestId = currentRequestId;
		isFiltering = true;

		await orderStore.updateFilters(filters);

		// Only update state if this is still the latest request
		if (requestId === currentRequestId) {
			isFiltering = false;
		}
	}, 300);

	/**
	 * Handle clear filters
	 */
	async function handleClearFilters() {
		currentRequestId++;
		const requestId = currentRequestId;
		isFiltering = true;

		await orderStore.clearFilters();

		// Only update state if this is still the latest request
		if (requestId === currentRequestId) {
			isFiltering = false;
		}
	}

	/**
	 * Get status badge color
	 */
	function getStatusColor(status: string): string {
		switch (status) {
			case OrderStatus.PENDING:
				return 'bg-yellow-100 text-yellow-800';
			case OrderStatus.CONFIRMED:
				return 'bg-blue-100 text-blue-800';
			case OrderStatus.SHIPPED:
				return 'bg-purple-100 text-purple-800';
			case OrderStatus.DELIVERED:
				return 'bg-green-100 text-green-800';
			case OrderStatus.CANCELLED:
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	/**
	 * Format date
	 */
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * Navigate to order details
	 */
	function viewOrderDetails(orderId: number) {
		goto(`/orders/${orderId}`);
	}

	/**
	 * Handle refresh orders
	 */
	async function handleRefresh() {
		await orderStore.fetchOrders();
	}
</script>

<svelte:head>
	<title>My Orders - E-Commerce</title>
</svelte:head>

<div class="orders-page">
	<div class="container">
		<!-- Page Header -->
		<header class="page-header">
			<div class="header-content">
				<div>
					<h1 class="page-title">My Orders</h1>
					<p class="page-subtitle">View and track your orders</p>
				</div>
				<button class="refresh-btn" onclick={handleRefresh} aria-label="Refresh orders">
					<svg
						class="refresh-icon"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
					Refresh
				</button>
			</div>
		</header>

		<!-- Error Alert -->
		{#if $orderError}
			<Alert
				type="error"
				message={$orderError}
				dismissible
				onDismiss={() => orderStore.clearError()}
			/>
		{/if}

		<!-- Order Filter -->
		<OrderHistoryFilter
			onFilterChange={handleFilterChange}
			onClearFilters={handleClearFilters}
			filters={$orderFilters}
			loading={isFiltering}
		/>

		<!-- Loading State -->
		{#if ($orderLoading && !hasLoaded) || isFiltering}
			<OrderCardSkeleton count={3} />
		{:else if $orders.length === 0}
			<!-- Empty State -->
			<div class="empty-state" transition:fade>
				<svg
					class="empty-icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				{#if $orderFilters.status || $orderFilters.dateRange}
					<h2 class="empty-title">No orders found</h2>
					<p class="empty-description">
						No orders match your current filters. Try adjusting your search criteria.
					</p>
					<button class="btn-primary" onclick={handleClearFilters}> Clear Filters </button>
				{:else}
					<h2 class="empty-title">No orders yet</h2>
					<p class="empty-description">When you place orders, they will appear here.</p>
					<button class="btn-primary" onclick={() => goto('/products')}>
						Start Shopping
					</button>
				{/if}
			</div>
		{:else}
			<!-- Orders List -->
			<div class="orders-list" transition:fade>
				{#each $orders as order (order.id)}
					<article class="order-card" transition:fade>
						<!-- Order Header -->
						<div class="order-header">
							<div class="order-info">
								<h3 class="order-id">Order #{order.id}</h3>
								<p class="order-date">{formatDate(order.created_at)}</p>
							</div>
							<span class="status-badge {getStatusColor(order.status)}">
								{order.status}
							</span>
						</div>

						<!-- Order Details -->
						<div class="order-body">
							<div class="product-info">
								<p class="product-name">{order.product_name}</p>
								<p class="product-details">
									Quantity: {order.quantity} × {formatPrice(order.unit_price)}
								</p>
							</div>

							<div class="order-total">
								<p class="total-label">Total</p>
								<p class="total-amount">{formatPrice(order.total_price)}</p>
							</div>
						</div>

						<!-- Order Actions -->
						<div class="order-actions">
							<button
								class="btn-view"
								onclick={() => viewOrderDetails(order.id)}
								aria-label="View order {order.id} details"
							>
								View Details
							</button>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.orders-page {
		min-height: calc(100vh - 4rem);
		background: #f9fafb;
		padding: 2rem 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Page Header */
	.page-header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
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

	.refresh-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.refresh-btn:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.refresh-btn:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	.refresh-icon {
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

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.empty-icon {
		width: 4rem;
		height: 4rem;
		color: #9ca3af;
		margin-bottom: 1.5rem;
	}

	.empty-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.empty-description {
		font-size: 1rem;
		color: #6b7280;
		margin: 0 0 2rem 0;
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

	/* Orders List */
	.orders-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Order Card */
	.order-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s;
	}

	.order-card:hover {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	/* Order Header */
	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.order-info {
		flex: 1;
	}

	.order-id {
		font-size: 1.125rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.25rem 0;
	}

	.order-date {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.status-badge {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		border-radius: 9999px;
		white-space: nowrap;
	}

	/* Order Body */
	.order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.product-info {
		flex: 1;
	}

	.product-name {
		font-size: 1rem;
		font-weight: 500;
		color: #111827;
		margin: 0 0 0.25rem 0;
	}

	.product-details {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.order-total {
		text-align: right;
	}

	.total-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		margin: 0 0 0.25rem 0;
	}

	.total-amount {
		font-size: 1.25rem;
		font-weight: 700;
		color: #2563eb;
		margin: 0;
	}

	/* Order Actions */
	.order-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn-view {
		padding: 0.625rem 1.25rem;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn-view:hover {
		background: #1d4ed8;
	}

	.btn-view:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.page-title {
			font-size: 1.5rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.refresh-btn {
			width: 100%;
			justify-content: center;
		}

		.order-body {
			flex-direction: column;
			align-items: flex-start;
		}

		.order-total {
			text-align: left;
		}
	}
</style>
