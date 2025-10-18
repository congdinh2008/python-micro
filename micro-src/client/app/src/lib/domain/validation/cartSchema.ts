/**
 * @module Domain/Validation
 * @description Validation schemas for cart operations using Zod
 */

import { z } from 'zod';

/**
 * Cart item validation schema
 */
export const cartItemSchema = z.object({
	id: z.number().int().positive('ID must be a positive integer'),
	productId: z.number().int().positive('Product ID must be a positive integer'),
	name: z
		.string()
		.min(1, 'Product name is required')
		.max(255, 'Product name is too long')
		.trim(),
	price: z.number().positive('Price must be positive').finite(),
	quantity: z
		.number()
		.int('Quantity must be an integer')
		.positive('Quantity must be positive')
		.max(999, 'Quantity exceeds maximum limit'),
	maxStock: z.number().int().nonnegative('Max stock must be non-negative'),
	imageUrl: z.string().url('Invalid image URL').optional()
});

/**
 * Add to cart input validation
 */
export const addToCartSchema = z.object({
	productId: z.number().int().positive('Product ID must be a positive integer'),
	name: z
		.string()
		.min(1, 'Product name is required')
		.max(255, 'Product name is too long')
		.trim(),
	price: z.number().positive('Price must be positive').finite(),
	quantity: z
		.number()
		.int('Quantity must be an integer')
		.positive('Quantity must be positive')
		.default(1),
	maxStock: z.number().int().nonnegative('Max stock must be non-negative'),
	imageUrl: z.string().url('Invalid image URL').optional()
});

/**
 * Update quantity validation
 */
export const updateQuantitySchema = z.object({
	productId: z.number().int().positive('Product ID must be a positive integer'),
	quantity: z
		.number()
		.int('Quantity must be an integer')
		.positive('Quantity must be positive')
		.max(999, 'Quantity exceeds maximum limit')
});

/**
 * Validate quantity against stock
 */
export function validateQuantityAgainstStock(
	quantity: number,
	maxStock: number
): { valid: boolean; error?: string } {
	if (quantity <= 0) {
		return { valid: false, error: 'Quantity must be positive' };
	}

	if (quantity > maxStock) {
		return { valid: false, error: `Only ${maxStock} items available in stock` };
	}

	return { valid: true };
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: string): string {
	return input
		.replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
		.replace(/['"]/g, '') // Remove quotes
		.trim();
}

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
