<script lang="ts">
	/**
	 * @layout Root Layout
	 * @description Main application layout with authentication initialization
	 */
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore, isAuthenticated, currentUser } from '$lib/application/stores/authStore';
	import { page } from '$app/stores';

	// Initialize authentication on app load
	onMount(async () => {
		await authStore.autoLogin();
	});

	// Handle logout
	function handleLogout() {
		authStore.logout();
		// Redirect to home if on protected route
		if ($page.url.pathname.startsWith('/orders') || $page.url.pathname.startsWith('/profile')) {
			window.location.href = '/';
		}
	}
</script>

<!-- Simple header with auth status -->
<header class="bg-white shadow-sm border-b border-gray-200">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="text-xl font-bold text-primary-600 hover:text-primary-700">
					E-Commerce
				</a>
			</div>

			<!-- Navigation -->
			<nav class="flex items-center gap-4">
				{#if $isAuthenticated}
					<!-- Authenticated user menu -->
					<span class="text-sm text-gray-600">
						Welcome, <span class="font-medium">{$currentUser?.username}</span>
					</span>
					<button
						onclick={handleLogout}
						class="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
					>
						Logout
					</button>
				{:else}
					<!-- Guest menu -->
					<a
						href="/auth/login"
						class="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
					>
						Login
					</a>
					<a
						href="/auth/register"
						class="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md transition-colors"
					>
						Sign Up
					</a>
				{/if}
			</nav>
		</div>
	</div>
</header>

<!-- Main content -->
<main>
	<slot />
</main>
