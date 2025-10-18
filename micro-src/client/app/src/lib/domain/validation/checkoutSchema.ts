/**
 * @module Domain/Validation
 * @description Checkout validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Order creation schema
 */
export const orderCreateSchema = z.object({
	product_id: z.number().positive('Product ID must be positive'),
	quantity: z.number().positive('Quantity must be positive')
});

/**
 * Checkout validation schema
 */
export const checkoutSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.number().positive(),
				quantity: z.number().positive(),
				maxStock: z.number().nonnegative()
			})
		)
		.min(1, 'Cart must not be empty')
});

/**
 * Type for order creation data
 */
export type OrderCreateData = z.infer<typeof orderCreateSchema>;

/**
 * Type for checkout data
 */
export type CheckoutData = z.infer<typeof checkoutSchema>;
