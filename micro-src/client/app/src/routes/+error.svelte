<script lang="ts">
	/**
	 * @page Error
	 * @description SvelteKit error page for handling all errors
	 */
	import { page } from '$app/stores';
	import ErrorPage from '$lib/presentation/components/ui/ErrorPage.svelte';

	// Get error from page store
	const error = $derived($page.error);
	const status = $derived($page.status);

	// Determine error details
	const code = $derived(status?.toString() || '500');
	const title = $derived(
		status === 404
			? 'Page Not Found'
			: status === 403
				? 'Access Denied'
				: status === 500
					? 'Internal Server Error'
					: 'An Error Occurred'
	);
	const description = $derived(
		error?.message ||
			(status === 404
				? 'Sorry, we couldn't find the page you're looking for.'
				: status === 403
					? 'You don't have permission to access this resource.'
					: status === 500
						? 'Something went wrong on our end. Please try again later.'
						: 'An unexpected error occurred.')
	);
</script>

<svelte:head>
	<title>{code} - {title}</title>
</svelte:head>

<ErrorPage {code} {title} {description} showRetry={status !== 404} onRetry={() => location.reload()} />
