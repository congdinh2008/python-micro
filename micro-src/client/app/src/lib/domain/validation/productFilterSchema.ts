/**
 * @module Domain/Validation
 * @description Product filter validation schemas
 */

import { z } from 'zod';

/**
 * Sort by options
 */
export const sortByOptions = [
	'name_asc',
	'name_desc',
	'price_asc',
	'price_desc',
	'rating_desc',
	'in_stock'
] as const;

/**
 * Product filter schema
 */
export const productFilterSchema = z.object({
	search: z.string().default(''),
	minPrice: z.number().min(0).nullable().default(null),
	maxPrice: z.number().min(0).nullable().default(null),
	sortBy: z.enum(sortByOptions).default('name_asc')
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(20)
});

/**
 * Product filter type inferred from schema
 */
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

/**
 * Pagination type inferred from schema
 */
export type PaginationInput = z.infer<typeof paginationSchema>;
