<script lang="ts">
	/**
	 * @layout Root Layout
	 * @description Main application layout with authentication initialization,
	 * responsive navigation, and accessibility features
	 */
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore, isAuthenticated, currentUser } from '$lib/application/stores/authStore';
	import { uiStore } from '$lib/application/stores/uiStore';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import CartBadge from '$lib/presentation/components/cart/CartBadge.svelte';
	import ToastContainer from '$lib/presentation/components/ui/ToastContainer.svelte';

	// Initialize authentication on app load
	onMount(async () => {
		await authStore.autoLogin();
	});

	// Reactive state
	let isMobileMenuOpen = $derived($uiStore.isMobileMenuOpen);

	// Handle logout
	function handleLogout() {
		authStore.logout();
		uiStore.showSuccess('You have been logged out successfully');
		// Redirect to home if on protected route
		if ($page.url.pathname.startsWith('/orders') || $page.url.pathname.startsWith('/profile')) {
			window.location.href = '/';
		}
	}

	// Handle cart click
	function handleCartClick() {
		goto('/cart');
	}

	// Toggle mobile menu
	function toggleMobileMenu() {
		uiStore.toggleMobileMenu();
	}

	// Close mobile menu
	function closeMobileMenu() {
		uiStore.closeMobileMenu();
	}

	// Close mobile menu on navigation
	$effect(() => {
		$page.url.pathname;
		closeMobileMenu();
	});

	// Handle keyboard navigation
	function handleKeyDown(event: KeyboardEvent) {
		// Close mobile menu on Escape
		if (event.key === 'Escape' && isMobileMenuOpen) {
			closeMobileMenu();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<!-- Skip to main content link for accessibility -->
<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
>
	Skip to main content
</a>

<!-- Header with responsive navigation -->
<header class="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200" role="banner">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex items-center flex-shrink-0">
				<a
					href="/"
					class="text-xl font-bold text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
					aria-label="E-Commerce Home"
				>
					E-Commerce
				</a>
			</div>

			<!-- Desktop Navigation -->
			<nav class="hidden md:flex items-center gap-4" aria-label="Main navigation">
				<!-- Products link -->
				<a
					href="/products"
					class="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
					aria-label="Browse products"
				>
					Products
				</a>

				{#if $isAuthenticated}
					<!-- Orders link (authenticated only) -->
					<a
						href="/orders"
						class="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
						aria-label="View my orders"
					>
						My Orders
					</a>
				{/if}

				<!-- Cart Badge -->
				<CartBadge onclick={handleCartClick} />

				{#if $isAuthenticated}
					<!-- Authenticated user menu -->
					<span class="text-sm text-gray-600" aria-label="Logged in user">
						Welcome, <span class="font-medium">{$currentUser?.username}</span>
					</span>
					<button
						onclick={handleLogout}
						class="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
						aria-label="Logout"
					>
						Logout
					</button>
				{:else}
					<!-- Guest menu -->
					<a
						href="/auth/login"
						class="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
						aria-label="Login to your account"
					>
						Login
					</a>
					<a
						href="/auth/register"
						class="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
						aria-label="Create a new account"
					>
						Sign Up
					</a>
				{/if}
			</nav>

			<!-- Mobile menu button -->
			<button
				type="button"
				class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
				onclick={toggleMobileMenu}
				aria-expanded={isMobileMenuOpen}
				aria-label="Toggle navigation menu"
				aria-controls="mobile-menu"
			>
				<svg
					class="h-6 w-6"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					{#if isMobileMenuOpen}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					{/if}
				</svg>
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if isMobileMenuOpen}
		<div class="md:hidden" id="mobile-menu" role="navigation" aria-label="Mobile navigation">
			<div class="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 bg-white">
				<!-- Products link -->
				<a
					href="/products"
					class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
				>
					Products
				</a>

				{#if $isAuthenticated}
					<!-- Orders link -->
					<a
						href="/orders"
						class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
					>
						My Orders
					</a>
				{/if}

				<!-- Cart link -->
				<a
					href="/cart"
					class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
				>
					Cart
				</a>

				<div class="border-t border-gray-200 pt-2 mt-2">
					{#if $isAuthenticated}
						<!-- User info -->
						<div class="px-3 py-2 text-base text-gray-600">
							Welcome, <span class="font-medium">{$currentUser?.username}</span>
						</div>
						<!-- Logout button -->
						<button
							onclick={handleLogout}
							class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
						>
							Logout
						</button>
					{:else}
						<!-- Login link -->
						<a
							href="/auth/login"
							class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							Login
						</a>
						<!-- Sign up link -->
						<a
							href="/auth/register"
							class="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
						>
							Sign Up
						</a>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</header>

<!-- Main content -->
<main id="main-content" class="min-h-screen bg-gray-50" role="main">
	<slot />
</main>

<!-- Footer -->
<footer class="bg-white border-t border-gray-200 mt-auto" role="contentinfo">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="flex flex-col md:flex-row justify-between items-center gap-4">
			<!-- Copyright -->
			<p class="text-sm text-gray-600">
				© {new Date().getFullYear()} E-Commerce. All rights reserved.
			</p>

			<!-- Quick links -->
			<nav class="flex gap-6" aria-label="Footer navigation">
				<a
					href="/products"
					class="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1"
				>
					Products
				</a>
				{#if $isAuthenticated}
					<a
						href="/orders"
						class="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1"
					>
						Orders
					</a>
				{/if}
				<a
					href="/cart"
					class="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1"
				>
					Cart
				</a>
			</nav>
		</div>
	</div>
</footer>

<!-- Toast notifications container -->
<ToastContainer />

<style lang="postcss">
	/* Screen reader only class */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.sr-only:focus {
		position: fixed;
		width: auto;
		height: auto;
		padding: 0.5rem 1rem;
		margin: 0;
		overflow: visible;
		clip: auto;
		white-space: normal;
	}
</style>
