/**
 * @module Domain/Validation
 * @description Order history filter validation schema
 */

import { z } from 'zod';
import { OrderStatus } from '../entities/Order';

/**
 * Order history filter validation schema
 */
export const orderFilterSchema = z.object({
	status: z
		.enum([
			OrderStatus.PENDING,
			OrderStatus.CONFIRMED,
			OrderStatus.SHIPPED,
			OrderStatus.DELIVERED,
			OrderStatus.CANCELLED
		])
		.optional()
		.or(z.literal('')),

	dateRange: z
		.tuple([z.string().datetime(), z.string().datetime()])
		.optional()
		.refine(
			(dates) => {
				if (!dates) return true;
				const [start, end] = dates;
				return new Date(start) <= new Date(end);
			},
			{ message: 'Start date must be before or equal to end date' }
		),

	skip: z.number().int().min(0).optional().default(0),

	limit: z.number().int().min(1).max(100).optional().default(20)
});

/**
 * Type inference from schema
 */
export type OrderFilterInput = z.input<typeof orderFilterSchema>;
export type OrderFilterOutput = z.output<typeof orderFilterSchema>;

/**
 * Validate order filters
 */
export function validateOrderFilters(
	filters: unknown
): { success: true; data: OrderFilterOutput } | { success: false; errors: string[] } {
	try {
		const validated = orderFilterSchema.parse(filters);
		return { success: true, data: validated };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
			};
		}
		return { success: false, errors: ['Invalid filter data'] };
	}
}
