<script lang="ts">
	/**
	 * @component ErrorPage
	 * @description Generic error page component for 404, 500, etc.
	 */
	import { goto } from '$app/navigation';

	interface Props {
		/**
		 * Error code (404, 500, etc.)
		 */
		code: string;
		/**
		 * Error title
		 */
		title: string;
		/**
		 * Error description
		 */
		description: string;
		/**
		 * Show retry button
		 */
		showRetry?: boolean;
		/**
		 * Retry callback
		 */
		onRetry?: () => void;
	}

	let { code, title, description, showRetry = false, onRetry }: Props = $props();

	function handleGoHome() {
		goto('/');
	}

	function handleRetry() {
		onRetry?.();
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8"
	role="main"
	aria-labelledby="error-title"
>
	<div class="w-full max-w-md text-center">
		<!-- Error Code -->
		<h1 class="text-6xl font-bold text-primary-600 sm:text-8xl" id="error-title">
			{code}
		</h1>

		<!-- Error Title -->
		<h2 class="mt-4 text-2xl font-semibold text-gray-900 sm:text-3xl">
			{title}
		</h2>

		<!-- Error Description -->
		<p class="mt-4 text-base text-gray-600">
			{description}
		</p>

		<!-- Actions -->
		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
			<button
				type="button"
				onclick={handleGoHome}
				class="inline-flex items-center justify-center rounded-md bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
			>
				<svg
					class="mr-2 h-5 w-5"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
						clip-rule="evenodd"
					/>
				</svg>
				Go to Home
			</button>

			{#if showRetry}
				<button
					type="button"
					onclick={handleRetry}
					class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
				>
					<svg
						class="mr-2 h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
							clip-rule="evenodd"
						/>
					</svg>
					Try Again
				</button>
			{/if}
		</div>
	</div>
</div>
