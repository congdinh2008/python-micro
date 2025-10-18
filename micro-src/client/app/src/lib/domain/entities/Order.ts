/**
 * @module Domain/Entities
 * @description Order domain entities
 */

import type { CartItem } from './Cart';

/**
 * Order status enumeration
 */
export enum OrderStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	SHIPPED = 'shipped',
	DELIVERED = 'delivered',
	CANCELLED = 'cancelled'
}

/**
 * Order item in an order
 */
export interface OrderItem {
	id: number;
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
}

/**
 * Order entity representing a customer order
 */
export interface Order {
	id: number;
	user_id: number;
	product_id: number;
	product_name: string;
	quantity: number;
	unit_price: number;
	total_price: number;
	status: OrderStatus;
	created_at: string;
	updated_at: string;
}

/**
 * Order creation request
 */
export interface OrderCreateRequest {
	product_id: number;
	quantity: number;
}

/**
 * Multiple orders creation request (for cart checkout)
 */
export interface CheckoutRequest {
	items: CartItem[];
}

/**
 * Checkout validation result
 */
export interface CheckoutValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * Order creation result
 */
export interface OrderResult {
	success: boolean;
	order?: Order;
	error?: string;
}

/**
 * Checkout result
 */
export interface CheckoutResult {
	success: boolean;
	orders?: Order[];
	failedItems?: { productId: number; error: string }[];
	error?: string;
}
