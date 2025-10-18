<script lang="ts">
	/**
	 * Skeleton loader component for loading states
	 */
	export let variant: 'text' | 'card' | 'circle' = 'text';
	export let count: number = 1;
	export let className: string = '';
</script>

{#if variant === 'text'}
	{#each Array(count) as _, i}
		<div class="skeleton-text {className}" data-testid="skeleton-text"></div>
	{/each}
{:else if variant === 'circle'}
	<div class="skeleton-circle {className}" data-testid="skeleton-circle"></div>
{:else if variant === 'card'}
	<div class="skeleton-card {className}" data-testid="skeleton-card">
		<div class="skeleton-image"></div>
		<div class="skeleton-content">
			<div class="skeleton-text skeleton-title"></div>
			<div class="skeleton-text skeleton-description"></div>
			<div class="skeleton-text skeleton-description"></div>
			<div class="skeleton-price"></div>
		</div>
	</div>
{/if}

<style>
	.skeleton-text {
		height: 1rem;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	.skeleton-circle {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
	}

	.skeleton-card {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		background: white;
	}

	.skeleton-image {
		width: 100%;
		height: 12rem;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
	}

	.skeleton-content {
		padding: 1rem;
	}

	.skeleton-title {
		height: 1.5rem;
		width: 70%;
		margin-bottom: 0.75rem;
	}

	.skeleton-description {
		height: 1rem;
		width: 100%;
		margin-bottom: 0.5rem;
	}

	.skeleton-description:last-of-type {
		width: 80%;
	}

	.skeleton-price {
		height: 1.5rem;
		width: 30%;
		margin-top: 0.75rem;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: loading 1.5s infinite;
		border-radius: 4px;
	}

	@keyframes loading {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
