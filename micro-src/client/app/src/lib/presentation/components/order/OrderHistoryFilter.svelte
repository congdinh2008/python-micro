<script lang="ts">
/**
 * @component OrderHistoryFilter
 * @description Filter component for order history with status and date range filters
 */

import { ORDER_STATUS_OPTIONS } from '$lib/domain/dto/OrderHistoryFilters';
import type { OrderHistoryFilters } from '$lib/domain/dto/OrderHistoryFilters';

interface Props {
/**
 * Callback when filters change
 */
onFilterChange: (filters: Partial<OrderHistoryFilters>) => void;

/**
 * Callback to clear filters
 */
onClearFilters: () => void;

/**
 * Current filter values
 */
filters?: OrderHistoryFilters;

/**
 * Whether filtering is in progress
 */
loading?: boolean;
}

let { onFilterChange, onClearFilters, filters = {}, loading = false }: Props = $props();

let statusFilter = $state(filters.status || '');
let startDate = $state(filters.dateRange?.[0]?.split('T')[0] || '');
let endDate = $state(filters.dateRange?.[1]?.split('T')[0] || '');

/**
 * Handle status filter change
 */
function handleStatusChange(event: Event) {
const target = event.target as HTMLSelectElement;
statusFilter = target.value;
applyFilters();
}

/**
 * Handle start date change
 */
function handleStartDateChange(event: Event) {
const target = event.target as HTMLInputElement;
startDate = target.value;
if (startDate && endDate) {
applyFilters();
}
}

/**
 * Handle end date change
 */
function handleEndDateChange(event: Event) {
const target = event.target as HTMLInputElement;
endDate = target.value;
if (startDate && endDate) {
applyFilters();
}
}

/**
 * Apply filters
 */
function applyFilters() {
const newFilters: Partial<OrderHistoryFilters> = {};

if (statusFilter) {
newFilters.status = statusFilter;
}

if (startDate && endDate) {
// Convert to ISO 8601 datetime format
newFilters.dateRange = [
\`\${startDate}T00:00:00Z\`,
\`\${endDate}T23:59:59Z\`
];
}

onFilterChange(newFilters);
}

/**
 * Clear all filters
 */
function handleClearFilters() {
statusFilter = '';
startDate = '';
endDate = '';
onClearFilters();
}

/**
 * Check if any filters are active
 */
let hasActiveFilters = $derived(
!!statusFilter || (!!startDate && !!endDate)
);
</script>

<div class="order-filter">
<div class="filter-header">
<h3 class="filter-title">
<span aria-hidden="true">🔍</span>
Filter Orders
</h3>
{#if hasActiveFilters}
<button
class="clear-btn"
onclick={handleClearFilters}
disabled={loading}
aria-label="Clear all filters"
>
Clear Filters
</button>
{/if}
</div>

<div class="filter-controls">
<!-- Status Filter -->
<div class="filter-group">
<label for="status-filter" class="filter-label">
Order Status
</label>
<select
id="status-filter"
class="filter-select"
value={statusFilter}
onchange={handleStatusChange}
disabled={loading}
aria-label="Filter by order status"
>
{#each ORDER_STATUS_OPTIONS as option}
<option value={option.value}>
{option.label}
</option>
{/each}
</select>
</div>

<!-- Date Range Filter -->
<div class="filter-group">
<label for="start-date-filter" class="filter-label">
Date Range
</label>
<div class="date-range">
<input
id="start-date-filter"
type="date"
class="filter-input"
value={startDate}
oninput={handleStartDateChange}
disabled={loading}
aria-label="Start date"
/>
<span class="date-separator" aria-hidden="true">to</span>
<input
id="end-date-filter"
type="date"
class="filter-input"
value={endDate}
min={startDate}
oninput={handleEndDateChange}
disabled={loading}
aria-label="End date"
/>
</div>
</div>
</div>

{#if loading}
<div class="filter-loading" role="status" aria-live="polite">
<div class="spinner" aria-hidden="true"></div>
<span class="sr-only">Applying filters...</span>
</div>
{/if}
</div>

<style>
.order-filter {
background: white;
border: 1px solid #e5e7eb;
border-radius: 0.75rem;
padding: 1.5rem;
margin-bottom: 1.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1.5rem;
padding-bottom: 1rem;
border-bottom: 2px solid #e5e7eb;
}

.filter-title {
font-size: 1.125rem;
font-weight: 600;
color: #111827;
margin: 0;
display: flex;
align-items: center;
gap: 0.5rem;
}

.clear-btn {
padding: 0.5rem 1rem;
background: #f3f4f6;
color: #374151;
border: 1px solid #d1d5db;
border-radius: 0.5rem;
font-size: 0.875rem;
font-weight: 500;
cursor: pointer;
transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
background: #e5e7eb;
border-color: #9ca3af;
}

.clear-btn:focus {
outline: 2px solid #2563eb;
outline-offset: 2px;
}

.clear-btn:disabled {
opacity: 0.5;
cursor: not-allowed;
}

.filter-controls {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 1.5rem;
}

.filter-group {
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.filter-label {
font-size: 0.875rem;
font-weight: 500;
color: #374151;
}

.filter-select,
.filter-input {
padding: 0.625rem 0.875rem;
border: 1px solid #d1d5db;
border-radius: 0.5rem;
font-size: 0.875rem;
color: #111827;
background: white;
transition: all 0.2s;
}

.filter-select:hover:not(:disabled),
.filter-input:hover:not(:disabled) {
border-color: #9ca3af;
}

.filter-select:focus,
.filter-input:focus {
outline: none;
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.filter-select:disabled,
.filter-input:disabled {
background: #f3f4f6;
cursor: not-allowed;
opacity: 0.6;
}

.date-range {
display: flex;
align-items: center;
gap: 0.75rem;
}

.date-separator {
font-size: 0.875rem;
color: #6b7280;
font-weight: 500;
}

.filter-loading {
display: flex;
align-items: center;
justify-content: center;
gap: 0.75rem;
padding: 1rem;
margin-top: 1rem;
background: #f3f4f6;
border-radius: 0.5rem;
}

.spinner {
width: 1.25rem;
height: 1.25rem;
border: 2px solid #e5e7eb;
border-top-color: #2563eb;
border-radius: 50%;
animation: spin 0.8s linear infinite;
}

@keyframes spin {
to {
transform: rotate(360deg);
}
}

.sr-only {
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
clip: rect(0, 0, 0, 0);
white-space: nowrap;
border-width: 0;
}

/* Responsive Design */
@media (max-width: 640px) {
.filter-controls {
grid-template-columns: 1fr;
}

.date-range {
flex-direction: column;
align-items: stretch;
}

.date-separator {
text-align: center;
}
}
</style>
