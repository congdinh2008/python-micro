<script lang="ts">
	/**
	 * Pagination component
	 */
	export let currentPage: number = 1;
	export let totalPages: number = 1;
	export let pageSize: number = 20;
	export let total: number = 0;
	export let onPageChange: (page: number) => void;
	export let onPageSizeChange: (pageSize: number) => void;

	const pageSizeOptions = [10, 20, 50];

	function handlePageChange(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			onPageChange(page);
		}
	}

	function handlePageSizeChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newPageSize = parseInt(select.value, 10);
		onPageSizeChange(newPageSize);
	}

	// Generate page numbers to show
	$: pageNumbers = (() => {
		const pages: (number | string)[] = [];
		const maxVisible = 7;

		if (totalPages <= maxVisible) {
			// Show all pages
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push('...');
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push('...');
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	})();

	$: startItem = (currentPage - 1) * pageSize + 1;
	$: endItem = Math.min(currentPage * pageSize, total);
</script>

<nav class="pagination" aria-label="Pagination navigation" data-testid="pagination">
	<div class="pagination-info">
		<span class="pagination-text">
			Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of
			<strong>{total}</strong> results
		</span>

		<label class="page-size-selector">
			<span class="page-size-label">Items per page:</span>
			<select
				value={pageSize}
				onchange={handlePageSizeChange}
				class="page-size-select"
				aria-label="Select page size"
			>
				{#each pageSizeOptions as size}
					<option value={size}>{size}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="pagination-controls">
		<!-- Previous button -->
		<button
			class="pagination-button"
			disabled={currentPage === 1}
			onclick={() => handlePageChange(currentPage - 1)}
			aria-label="Go to previous page"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="icon"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
			</svg>
			Previous
		</button>

		<!-- Page numbers -->
		<div class="page-numbers">
			{#each pageNumbers as page}
				{#if page === '...'}
					<span class="page-ellipsis">...</span>
				{:else}
					<button
						class="page-number"
						class:active={page === currentPage}
						onclick={() => handlePageChange(Number(page))}
						aria-label="Go to page {page}"
						aria-current={page === currentPage ? 'page' : undefined}
					>
						{page}
					</button>
				{/if}
			{/each}
		</div>

		<!-- Next button -->
		<button
			class="pagination-button"
			disabled={currentPage === totalPages}
			onclick={() => handlePageChange(currentPage + 1)}
			aria-label="Go to next page"
		>
			Next
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="icon"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
			</svg>
		</button>
	</div>
</nav>

<style>
	.pagination {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem 0;
		border-top: 1px solid #e5e7eb;
	}

	.pagination-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.pagination-text {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.page-size-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.page-size-label {
		color: #6b7280;
	}

	.page-size-select {
		padding: 0.25rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
		cursor: pointer;
	}

	.page-size-select:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	.pagination-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.pagination-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pagination-button:hover:not(:disabled) {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.pagination-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pagination-button .icon {
		width: 1rem;
		height: 1rem;
	}

	.page-numbers {
		display: flex;
		gap: 0.25rem;
	}

	.page-number {
		min-width: 2.5rem;
		height: 2.5rem;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-number:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.page-number.active {
		background: #2563eb;
		color: white;
		border-color: #2563eb;
	}

	.page-ellipsis {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 2.5rem;
		height: 2.5rem;
		color: #6b7280;
	}

	@media (max-width: 640px) {
		.pagination-info {
			flex-direction: column;
			align-items: flex-start;
		}

		.page-numbers {
			flex-wrap: wrap;
			justify-content: center;
		}
	}
</style>
