<script lang="ts">
	/**
	 * @page Home
	 * @description Home page with authentication status
	 */
	import { isAuthenticated, currentUser } from '$lib/application/stores/authStore';
</script>

<svelte:head>
	<title>Home - E-Commerce</title>
	<meta name="description" content="Welcome to our e-commerce platform" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="text-center">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">
				Welcome to E-Commerce Platform
			</h1>

			{#if $isAuthenticated}
				<p class="text-xl text-gray-600 mb-8">
					Hello, <span class="font-semibold text-primary-600">{$currentUser?.username}</span>!
				</p>
				<div class="flex justify-center gap-4">
					<a
						href="/products"
						class="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
					>
						Browse Products
					</a>
					<a
						href="/orders"
						class="inline-block bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium"
					>
						My Orders
					</a>
				</div>
			{:else}
				<p class="text-xl text-gray-600 mb-8">
					Please sign in to start shopping
				</p>
				<div class="flex justify-center gap-4">
					<a
						href="/auth/login"
						class="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
					>
						Sign In
					</a>
					<a
						href="/auth/register"
						class="inline-block bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium"
					>
						Sign Up
					</a>
				</div>
			{/if}
		</div>

		<!-- Feature highlights -->
		<div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="bg-white p-6 rounded-lg shadow-sm">
				<div class="text-primary-600 mb-4">
					<svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Wide Selection</h3>
				<p class="text-gray-600">Browse through our extensive collection of products</p>
			</div>

			<div class="bg-white p-6 rounded-lg shadow-sm">
				<div class="text-primary-600 mb-4">
					<svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Secure Shopping</h3>
				<p class="text-gray-600">Your data is protected with industry-standard security</p>
			</div>

			<div class="bg-white p-6 rounded-lg shadow-sm">
				<div class="text-primary-600 mb-4">
					<svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
				<p class="text-gray-600">Quick and reliable shipping to your doorstep</p>
			</div>
		</div>
	</div>
</div>
