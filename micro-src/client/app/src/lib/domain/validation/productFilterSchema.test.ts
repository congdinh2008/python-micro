/**
 * @module Domain/Validation
 * @description Tests for product filter schema
 */

import { describe, it, expect } from 'vitest';
import { productFilterSchema, paginationSchema } from './productFilterSchema';

describe('productFilterSchema', () => {
	describe('valid inputs', () => {
		it('should validate empty filters', () => {
			const result = productFilterSchema.safeParse({
				search: '',
				minPrice: null,
				maxPrice: null,
				sortBy: 'name_asc'
			});

			expect(result.success).toBe(true);
		});

		it('should validate search term', () => {
			const result = productFilterSchema.safeParse({
				search: 'laptop',
				minPrice: null,
				maxPrice: null,
				sortBy: 'name_asc'
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.search).toBe('laptop');
			}
		});

		it('should validate price range', () => {
			const result = productFilterSchema.safeParse({
				search: '',
				minPrice: 10,
				maxPrice: 100,
				sortBy: 'price_asc'
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.minPrice).toBe(10);
				expect(result.data.maxPrice).toBe(100);
			}
		});

		it('should validate all sort options', () => {
			const sortOptions = [
				'name_asc',
				'name_desc',
				'price_asc',
				'price_desc',
				'rating_desc',
				'in_stock'
			];

			sortOptions.forEach((sortBy) => {
				const result = productFilterSchema.safeParse({
					search: '',
					minPrice: null,
					maxPrice: null,
					sortBy
				});

				expect(result.success).toBe(true);
			});
		});
	});

	describe('invalid inputs', () => {
		it('should reject negative minPrice', () => {
			const result = productFilterSchema.safeParse({
				search: '',
				minPrice: -10,
				maxPrice: null,
				sortBy: 'name_asc'
			});

			expect(result.success).toBe(false);
		});

		it('should reject negative maxPrice', () => {
			const result = productFilterSchema.safeParse({
				search: '',
				minPrice: null,
				maxPrice: -10,
				sortBy: 'name_asc'
			});

			expect(result.success).toBe(false);
		});

		it('should reject invalid sortBy value', () => {
			const result = productFilterSchema.safeParse({
				search: '',
				minPrice: null,
				maxPrice: null,
				sortBy: 'invalid_sort'
			});

			expect(result.success).toBe(false);
		});
	});

	describe('default values', () => {
		it('should apply default values', () => {
			const result = productFilterSchema.safeParse({});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.search).toBe('');
				expect(result.data.minPrice).toBeNull();
				expect(result.data.maxPrice).toBeNull();
				expect(result.data.sortBy).toBe('name_asc');
			}
		});
	});
});

describe('paginationSchema', () => {
	describe('valid inputs', () => {
		it('should validate page and pageSize', () => {
			const result = paginationSchema.safeParse({
				page: 1,
				pageSize: 20
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(1);
				expect(result.data.pageSize).toBe(20);
			}
		});

		it('should validate large page numbers', () => {
			const result = paginationSchema.safeParse({
				page: 100,
				pageSize: 50
			});

			expect(result.success).toBe(true);
		});
	});

	describe('invalid inputs', () => {
		it('should reject page less than 1', () => {
			const result = paginationSchema.safeParse({
				page: 0,
				pageSize: 20
			});

			expect(result.success).toBe(false);
		});

		it('should reject pageSize less than 1', () => {
			const result = paginationSchema.safeParse({
				page: 1,
				pageSize: 0
			});

			expect(result.success).toBe(false);
		});

		it('should reject pageSize greater than 100', () => {
			const result = paginationSchema.safeParse({
				page: 1,
				pageSize: 101
			});

			expect(result.success).toBe(false);
		});
	});

	describe('default values', () => {
		it('should apply default values', () => {
			const result = paginationSchema.safeParse({});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(1);
				expect(result.data.pageSize).toBe(20);
			}
		});
	});
});
