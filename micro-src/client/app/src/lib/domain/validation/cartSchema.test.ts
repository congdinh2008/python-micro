/**
 * @module Domain/Validation
 * @description Tests for cart validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
	cartItemSchema,
	addToCartSchema,
	updateQuantitySchema,
	validateQuantityAgainstStock,
	sanitizeString
} from './cartSchema';

describe('cartItemSchema', () => {
	it('should validate valid cart item', () => {
		const validItem = {
			id: 1,
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			quantity: 2,
			maxStock: 10
		};

		const result = cartItemSchema.safeParse(validItem);
		expect(result.success).toBe(true);
	});

	it('should validate cart item with optional imageUrl', () => {
		const validItem = {
			id: 1,
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			quantity: 2,
			maxStock: 10,
			imageUrl: 'https://example.com/image.jpg'
		};

		const result = cartItemSchema.safeParse(validItem);
		expect(result.success).toBe(true);
	});

	it('should reject negative price', () => {
		const invalidItem = {
			id: 1,
			productId: 100,
			name: 'Test Product',
			price: -10,
			quantity: 2,
			maxStock: 10
		};

		const result = cartItemSchema.safeParse(invalidItem);
		expect(result.success).toBe(false);
	});

	it('should reject zero quantity', () => {
		const invalidItem = {
			id: 1,
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			quantity: 0,
			maxStock: 10
		};

		const result = cartItemSchema.safeParse(invalidItem);
		expect(result.success).toBe(false);
	});

	it('should reject negative quantity', () => {
		const invalidItem = {
			id: 1,
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			quantity: -5,
			maxStock: 10
		};

		const result = cartItemSchema.safeParse(invalidItem);
		expect(result.success).toBe(false);
	});

	it('should reject quantity exceeding max limit', () => {
		const invalidItem = {
			id: 1,
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			quantity: 1000,
			maxStock: 10
		};

		const result = cartItemSchema.safeParse(invalidItem);
		expect(result.success).toBe(false);
	});

	it('should reject empty name', () => {
		const invalidItem = {
			id: 1,
			productId: 100,
			name: '',
			price: 29.99,
			quantity: 2,
			maxStock: 10
		};

		const result = cartItemSchema.safeParse(invalidItem);
		expect(result.success).toBe(false);
	});

	it('should reject invalid imageUrl', () => {
		const invalidItem = {
			id: 1,
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			quantity: 2,
			maxStock: 10,
			imageUrl: 'not-a-valid-url'
		};

		const result = cartItemSchema.safeParse(invalidItem);
		expect(result.success).toBe(false);
	});
});

describe('addToCartSchema', () => {
	it('should validate valid add to cart input', () => {
		const validInput = {
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			quantity: 1,
			maxStock: 10
		};

		const result = addToCartSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('should use default quantity of 1', () => {
		const input = {
			productId: 100,
			name: 'Test Product',
			price: 29.99,
			maxStock: 10
		};

		const result = addToCartSchema.safeParse(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.quantity).toBe(1);
		}
	});
});

describe('updateQuantitySchema', () => {
	it('should validate valid update quantity input', () => {
		const validInput = {
			productId: 100,
			quantity: 5
		};

		const result = updateQuantitySchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('should reject zero quantity', () => {
		const invalidInput = {
			productId: 100,
			quantity: 0
		};

		const result = updateQuantitySchema.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});

	it('should reject negative quantity', () => {
		const invalidInput = {
			productId: 100,
			quantity: -3
		};

		const result = updateQuantitySchema.safeParse(invalidInput);
		expect(result.success).toBe(false);
	});
});

describe('validateQuantityAgainstStock', () => {
	it('should pass when quantity is within stock', () => {
		const result = validateQuantityAgainstStock(5, 10);
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it('should fail when quantity exceeds stock', () => {
		const result = validateQuantityAgainstStock(15, 10);
		expect(result.valid).toBe(false);
		expect(result.error).toContain('Only 10 items available');
	});

	it('should fail when quantity is zero', () => {
		const result = validateQuantityAgainstStock(0, 10);
		expect(result.valid).toBe(false);
		expect(result.error).toContain('must be positive');
	});

	it('should fail when quantity is negative', () => {
		const result = validateQuantityAgainstStock(-5, 10);
		expect(result.valid).toBe(false);
		expect(result.error).toContain('must be positive');
	});

	it('should pass when quantity equals stock', () => {
		const result = validateQuantityAgainstStock(10, 10);
		expect(result.valid).toBe(true);
	});
});

describe('sanitizeString', () => {
	it('should remove HTML tags', () => {
		const input = '<script>alert("xss")</script>Product Name';
		const result = sanitizeString(input);
		expect(result).not.toContain('<');
		expect(result).not.toContain('>');
	});

	it('should remove quotes', () => {
		const input = 'Product "Name" with \'quotes\'';
		const result = sanitizeString(input);
		expect(result).not.toContain('"');
		expect(result).not.toContain("'");
	});

	it('should trim whitespace', () => {
		const input = '  Product Name  ';
		const result = sanitizeString(input);
		expect(result).toBe('Product Name');
	});

	it('should handle empty string', () => {
		const result = sanitizeString('');
		expect(result).toBe('');
	});
});
