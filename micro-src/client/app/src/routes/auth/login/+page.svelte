<script lang="ts">
	/**
	 * @page LoginPage
	 * @description User login page
	 */
	import LoginForm from '$lib/presentation/components/auth/LoginForm.svelte';
	import { page } from '$app/stores';

	// Get redirect parameter from URL
	const redirectTo = $page.url.searchParams.get('redirect') || '/';
</script>

<svelte:head>
	<title>Login - E-Commerce</title>
	<meta name="description" content="Sign in to your account" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<LoginForm {redirectTo} />
	</div>
</div>
