<script lang="ts">
/**
 * @component OrderCardSkeleton
 * @description Skeleton loader for order cards during loading
 */

interface Props {
/**
 * Number of skeleton cards to display
 */
count?: number;
}

let { count = 3 }: Props = $props();
</script>

<div class="skeleton-container">
{#each Array(count) as _, index (index)}
<article class="skeleton-card" aria-label="Loading order card">
<!-- Header Skeleton -->
<div class="skeleton-header">
<div class="skeleton-info">
<div class="skeleton-title"></div>
<div class="skeleton-subtitle"></div>
</div>
<div class="skeleton-badge"></div>
</div>

<!-- Body Skeleton -->
<div class="skeleton-body">
<div class="skeleton-product">
<div class="skeleton-product-name"></div>
<div class="skeleton-product-details"></div>
</div>
<div class="skeleton-total">
<div class="skeleton-label"></div>
<div class="skeleton-amount"></div>
</div>
</div>

<!-- Actions Skeleton -->
<div class="skeleton-actions">
<div class="skeleton-button"></div>
</div>
</article>
{/each}
</div>

<style>
.skeleton-container {
display: flex;
flex-direction: column;
gap: 1rem;
}

.skeleton-card {
background: white;
border: 1px solid #e5e7eb;
border-radius: 0.75rem;
padding: 1.5rem;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-header {
display: flex;
justify-content: space-between;
align-items: start;
margin-bottom: 1rem;
padding-bottom: 1rem;
border-bottom: 1px solid #e5e7eb;
}

.skeleton-info {
flex: 1;
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.skeleton-title {
width: 8rem;
height: 1.5rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 0.25rem;
}

.skeleton-subtitle {
width: 12rem;
height: 1rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 0.25rem;
}

.skeleton-badge {
width: 5rem;
height: 1.75rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 9999px;
}

.skeleton-body {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
gap: 1rem;
}

.skeleton-product {
flex: 1;
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.skeleton-product-name {
width: 10rem;
height: 1.25rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 0.25rem;
}

.skeleton-product-details {
width: 8rem;
height: 1rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 0.25rem;
}

.skeleton-total {
text-align: right;
display: flex;
flex-direction: column;
gap: 0.5rem;
}

.skeleton-label {
width: 3rem;
height: 0.75rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 0.25rem;
margin-left: auto;
}

.skeleton-amount {
width: 5rem;
height: 1.5rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 0.25rem;
margin-left: auto;
}

.skeleton-actions {
display: flex;
gap: 0.75rem;
}

.skeleton-button {
width: 8rem;
height: 2.5rem;
background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: 0.5rem;
}

@keyframes shimmer {
0% {
background-position: 200% 0;
}
100% {
background-position: -200% 0;
}
}

/* Responsive Design */
@media (max-width: 768px) {
.skeleton-body {
flex-direction: column;
align-items: flex-start;
}

.skeleton-total {
text-align: left;
}

.skeleton-label,
.skeleton-amount {
margin-left: 0;
}
}
</style>
