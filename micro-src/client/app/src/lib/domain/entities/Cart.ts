/**
 * @module Domain/Entities
 * @description Cart domain entities
 */

/**
 * Cart item entity representing a product in the cart
 */
export interface CartItem {
	id: number;
	productId: number;
	name: string;
	price: number;
	quantity: number;
	maxStock: number;
	imageUrl?: string;
}

/**
 * Cart state interface
 */
export interface CartState {
	items: CartItem[];
	updatedAt: number;
}

/**
 * Cart totals calculated from items
 */
export interface CartTotals {
	itemCount: number;
	uniqueItems: number;
	subtotal: number;
}

/**
 * Cart operation result
 */
export interface CartOperationResult {
	success: boolean;
	error?: string;
	item?: CartItem;
	previousState?: CartItem;
}

/**
 * Cart validation result
 */
export interface CartValidationResult {
	valid: boolean;
	errors: string[];
}
