<script lang="ts">
	/**
	 * @component Toast
	 * @description Toast notification component with animations
	 */
	import type { Toast } from '$lib/domain/dto/Toast';

	interface Props {
		toast: Toast;
		onDismiss?: (id: string) => void;
	}

	let { toast, onDismiss }: Props = $props();

	// Type-specific styles
	const typeStyles = {
		success: 'bg-green-50 border-green-500 text-green-900',
		error: 'bg-red-50 border-red-500 text-red-900',
		warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
		info: 'bg-blue-50 border-blue-500 text-blue-900'
	};

	const iconPaths = {
		success:
			'M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z',
		error:
			'M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z',
		warning:
			'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 11a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H10.75a.75.75 0 01-.75-.75V11zM10 5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 5z',
		info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z'
	};

	function handleDismiss() {
		onDismiss?.(toast.id);
	}
</script>

<div
	class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border-l-4 shadow-lg transition-all duration-300 ease-in-out {typeStyles[
		toast.type
	]}"
	role="alert"
	aria-live="polite"
	aria-atomic="true"
>
	<div class="p-4">
		<div class="flex items-start">
			<!-- Icon -->
			<div class="flex-shrink-0">
				<svg
					class="h-6 w-6"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path fill-rule="evenodd" d={iconPaths[toast.type]} clip-rule="evenodd" />
				</svg>
			</div>

			<!-- Content -->
			<div class="ml-3 flex-1">
				{#if toast.title}
					<p class="text-sm font-semibold">{toast.title}</p>
				{/if}
				<p class="text-sm {toast.title ? 'mt-1' : ''}">{toast.message}</p>
			</div>

			<!-- Dismiss button -->
			{#if toast.dismissible}
				<div class="ml-4 flex flex-shrink-0">
					<button
						type="button"
						class="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
						onclick={handleDismiss}
						aria-label="Dismiss notification"
					>
						<svg
							class="h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
							/>
						</svg>
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
