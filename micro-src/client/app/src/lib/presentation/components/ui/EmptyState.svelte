<script lang="ts">
	/**
	 * Empty state component for no results
	 */
	export let title: string = 'No items found';
	export let description: string = '';
	export let actionText: string = '';
	export let onAction: (() => void) | undefined = undefined;
</script>

<div class="empty-state" data-testid="empty-state">
	<div class="empty-state-icon">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="icon"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
			/>
		</svg>
	</div>

	<h3 class="empty-state-title">{title}</h3>

	{#if description}
		<p class="empty-state-description">{description}</p>
	{/if}

	{#if actionText && onAction}
		<button class="empty-state-action" onclick={onAction}>
			{actionText}
		</button>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1.5rem;
		text-align: center;
	}

	.empty-state-icon {
		width: 4rem;
		height: 4rem;
		margin-bottom: 1rem;
		color: #9ca3af;
	}

	.icon {
		width: 100%;
		height: 100%;
	}

	.empty-state-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.empty-state-description {
		font-size: 0.875rem;
		color: #6b7280;
		max-width: 28rem;
		margin-bottom: 1.5rem;
	}

	.empty-state-action {
		padding: 0.5rem 1rem;
		background-color: #2563eb;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.empty-state-action:hover {
		background-color: #1d4ed8;
	}

	.empty-state-action:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}
</style>
