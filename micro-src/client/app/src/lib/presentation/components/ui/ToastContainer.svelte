<script lang="ts">
	/**
	 * @component ToastContainer
	 * @description Container for all toast notifications with positioning and animations
	 */
	import { uiStore } from '$lib/application/stores/uiStore';
	import Toast from './Toast.svelte';
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';

	// Subscribe to toasts from UI store
	let toasts = $derived($uiStore.toasts);

	function handleDismiss(id: string) {
		uiStore.dismissToast(id);
	}
</script>

<!-- Toast container - fixed position at top-right -->
<div
	class="pointer-events-none fixed right-0 top-0 z-50 flex flex-col items-end space-y-4 p-4 sm:p-6"
	aria-live="polite"
	aria-atomic="false"
	role="region"
	aria-label="Notifications"
>
	{#each toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 200 }}
			in:fly={{ x: 300, duration: 300 }}
			out:fade={{ duration: 200 }}
		>
			<Toast {toast} onDismiss={handleDismiss} />
		</div>
	{/each}
</div>
