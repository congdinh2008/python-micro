<script lang="ts">
	/**
	 * @component Spinner
	 * @description Loading spinner component with different sizes
	 */

	interface Props {
		/**
		 * Size of the spinner
		 */
		size?: 'sm' | 'md' | 'lg' | 'xl';
		/**
		 * Color of the spinner
		 */
		color?: 'primary' | 'white' | 'gray';
		/**
		 * Optional loading text
		 */
		text?: string;
		/**
		 * Center the spinner
		 */
		centered?: boolean;
	}

	let { size = 'md', color = 'primary', text, centered = false }: Props = $props();

	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12',
		xl: 'h-16 w-16'
	};

	const colorClasses = {
		primary: 'text-primary-600',
		white: 'text-white',
		gray: 'text-gray-600'
	};

	const containerClass = centered ? 'flex items-center justify-center' : 'inline-flex items-center';
</script>

<div class="{containerClass} gap-3" role="status" aria-live="polite">
	<svg
		class="animate-spin {sizeClasses[size]} {colorClasses[color]}"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
		<path
			class="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
		/>
	</svg>
	{#if text}
		<span class="text-sm {colorClasses[color]} font-medium" aria-label="Loading message">
			{text}
		</span>
	{/if}
	<span class="sr-only">Loading...</span>
</div>
