/**
 * @module Domain/Validation
 * @description Tests for order filter validation schema
 */

import { describe, it, expect } from 'vitest';
import { orderFilterSchema, validateOrderFilters } from './orderFilterSchema';
import { OrderStatus } from '../entities/Order';

describe('Order Filter Schema', () => {
	describe('status validation', () => {
		it('should accept valid order status', () => {
			const result = orderFilterSchema.safeParse({
				status: OrderStatus.PENDING
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.status).toBe(OrderStatus.PENDING);
			}
		});

		it('should accept empty string for status', () => {
			const result = orderFilterSchema.safeParse({
				status: ''
			});

			expect(result.success).toBe(true);
		});

		it('should reject invalid status', () => {
			const result = orderFilterSchema.safeParse({
				status: 'invalid_status'
			});

			expect(result.success).toBe(false);
		});

		it('should allow undefined status', () => {
			const result = orderFilterSchema.safeParse({});

			expect(result.success).toBe(true);
		});
	});

	describe('dateRange validation', () => {
		it('should accept valid date range', () => {
			const result = orderFilterSchema.safeParse({
				dateRange: ['2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z']
			});

			expect(result.success).toBe(true);
		});

		it('should reject date range where start > end', () => {
			const result = orderFilterSchema.safeParse({
				dateRange: ['2025-12-31T23:59:59Z', '2025-01-01T00:00:00Z']
			});

			expect(result.success).toBe(false);
		});

		it('should accept same start and end date', () => {
			const result = orderFilterSchema.safeParse({
				dateRange: ['2025-06-15T00:00:00Z', '2025-06-15T23:59:59Z']
			});

			expect(result.success).toBe(true);
		});

		it('should reject invalid date format', () => {
			const result = orderFilterSchema.safeParse({
				dateRange: ['2025-01-01', '2025-12-31']
			});

			expect(result.success).toBe(false);
		});

		it('should allow undefined dateRange', () => {
			const result = orderFilterSchema.safeParse({});

			expect(result.success).toBe(true);
		});
	});

	describe('pagination validation', () => {
		it('should accept valid skip and limit', () => {
			const result = orderFilterSchema.safeParse({
				skip: 20,
				limit: 50
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.skip).toBe(20);
				expect(result.data.limit).toBe(50);
			}
		});

		it('should reject negative skip', () => {
			const result = orderFilterSchema.safeParse({
				skip: -1
			});

			expect(result.success).toBe(false);
		});

		it('should reject limit < 1', () => {
			const result = orderFilterSchema.safeParse({
				limit: 0
			});

			expect(result.success).toBe(false);
		});

		it('should reject limit > 100', () => {
			const result = orderFilterSchema.safeParse({
				limit: 101
			});

			expect(result.success).toBe(false);
		});

		it('should use default values when not provided', () => {
			const result = orderFilterSchema.safeParse({});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.skip).toBe(0);
				expect(result.data.limit).toBe(20);
			}
		});
	});

	describe('combined filters', () => {
		it('should accept all filters together', () => {
			const result = orderFilterSchema.safeParse({
				status: OrderStatus.CONFIRMED,
				dateRange: ['2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z'],
				skip: 0,
				limit: 20
			});

			expect(result.success).toBe(true);
		});
	});
});

describe('validateOrderFilters helper', () => {
	it('should return success for valid filters', () => {
		const result = validateOrderFilters({
			status: OrderStatus.PENDING,
			skip: 0,
			limit: 20
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe(OrderStatus.PENDING);
		}
	});

	it('should return errors for invalid filters', () => {
		const result = validateOrderFilters({
			status: 'invalid',
			skip: -1,
			limit: 200
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors.length).toBeGreaterThan(0);
		}
	});

	it('should handle non-object input', () => {
		const result = validateOrderFilters('invalid');

		expect(result.success).toBe(false);
	});
});
