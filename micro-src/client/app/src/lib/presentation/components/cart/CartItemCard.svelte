<script lang="ts">
	/**
	 * @component CartItemCard
	 * @description Individual cart item display with quantity controls
	 */
	import type { CartItem } from '$lib/domain/entities/Cart';
	import { formatPrice } from '$lib/utils/formatters';

	export let item: CartItem;
	export let onUpdateQuantity: ((productId: number, quantity: number) => void) | undefined =
		undefined;
	export let onRemove: ((productId: number) => void) | undefined = undefined;
	export let readonly: boolean = false;

	let quantity = item.quantity;

	$: itemTotal = item.price * quantity;
	$: isMaxStock = quantity >= item.maxStock;

	function handleQuantityChange(newQuantity: number) {
		if (newQuantity < 1) {
			quantity = 1;
		} else if (newQuantity > item.maxStock) {
			quantity = item.maxStock;
		} else {
			quantity = newQuantity;
		}
		onUpdateQuantity?.(item.productId, quantity);
	}

	function increment() {
		if (quantity < item.maxStock) {
			handleQuantityChange(quantity + 1);
		}
	}

	function decrement() {
		if (quantity > 1) {
			handleQuantityChange(quantity - 1);
		}
	}

	function handleRemove() {
		onRemove?.(item.productId);
	}
</script>

<article class="cart-item" data-testid="cart-item">
	<!-- Product Image -->
	<div class="item-image">
		<img
			src={item.imageUrl || `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}`}
			alt={item.name}
			loading="lazy"
		/>
	</div>

	<!-- Product Info -->
	<div class="item-details">
		<h3 class="item-name">{item.name}</h3>
		<p class="item-price">{formatPrice(item.price)}</p>

		{#if isMaxStock}
			<p class="stock-warning">Maximum stock reached</p>
		{/if}
	</div>

	<!-- Quantity Controls -->
	{#if !readonly}
		<div class="quantity-controls">
			<label for="quantity-{item.productId}" class="sr-only">
				Quantity for {item.name}
			</label>
			<button
				class="quantity-btn"
				onclick={decrement}
				disabled={quantity <= 1}
				aria-label="Decrease quantity"
			>
				-
			</button>
			<input
				id="quantity-{item.productId}"
				type="number"
				class="quantity-input"
				bind:value={quantity}
				onchange={() => handleQuantityChange(quantity)}
				min="1"
				max={item.maxStock}
				aria-label="Quantity"
			/>
			<button
				class="quantity-btn"
				onclick={increment}
				disabled={isMaxStock}
				aria-label="Increase quantity"
			>
				+
			</button>
		</div>
	{:else}
		<div class="quantity-display">
			<span class="quantity-label">Qty:</span>
			<span class="quantity-value">{item.quantity}</span>
		</div>
	{/if}

	<!-- Total Price -->
	<div class="item-total">
		<p class="total-label">Total:</p>
		<p class="total-price">{formatPrice(itemTotal)}</p>
	</div>

	<!-- Remove Button -->
	{#if !readonly}
		<button class="remove-btn" onclick={handleRemove} aria-label="Remove {item.name} from cart">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
				/>
			</svg>
		</button>
	{/if}
</article>

<style>
	.cart-item {
		display: grid;
		grid-template-columns: 100px 1fr auto auto auto;
		gap: 1rem;
		padding: 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		align-items: center;
	}

	.item-image {
		width: 100px;
		height: 100px;
		border-radius: 0.375rem;
		overflow: hidden;
		background: #f3f4f6;
	}

	.item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-details {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-name {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.item-price {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.stock-warning {
		font-size: 0.75rem;
		color: #ef4444;
		margin: 0.25rem 0 0 0;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		padding: 0.25rem;
	}

	.quantity-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background: #f3f4f6;
		color: #374151;
		font-size: 1.25rem;
		font-weight: 600;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.quantity-btn:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.quantity-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.quantity-input {
		width: 3rem;
		padding: 0.25rem;
		text-align: center;
		border: none;
		font-size: 0.875rem;
		font-weight: 500;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.quantity-input::-webkit-outer-spin-button,
	.quantity-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.quantity-input:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
		border-radius: 0.25rem;
	}

	.quantity-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f9fafb;
		border-radius: 0.375rem;
	}

	.quantity-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.quantity-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.item-total {
		text-align: right;
	}

	.total-label {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0 0 0.25rem 0;
	}

	.total-price {
		font-size: 1.125rem;
		font-weight: 700;
		color: #2563eb;
		margin: 0;
	}

	.remove-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background: transparent;
		color: #ef4444;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: background-color 0.2s;
	}

	.remove-btn:hover {
		background: #fee2e2;
	}

	.remove-btn:focus {
		outline: 2px solid #ef4444;
		outline-offset: 2px;
	}

	.remove-btn svg {
		width: 1.5rem;
		height: 1.5rem;
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

	@media (max-width: 768px) {
		.cart-item {
			grid-template-columns: 80px 1fr;
			grid-template-rows: auto auto auto;
			gap: 0.75rem;
		}

		.item-image {
			width: 80px;
			height: 80px;
			grid-row: 1 / 3;
		}

		.item-details {
			grid-column: 2;
		}

		.quantity-controls {
			grid-column: 1 / 2;
			grid-row: 3;
			justify-self: start;
		}

		.item-total {
			grid-column: 2;
			grid-row: 2;
			text-align: left;
		}

		.remove-btn {
			grid-column: 2;
			grid-row: 3;
			justify-self: end;
		}
	}
</style>
