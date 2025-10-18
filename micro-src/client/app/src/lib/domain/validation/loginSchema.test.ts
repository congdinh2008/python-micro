/**
 * @module Domain/Validation
 * @description Login validation schema tests
 */

import { describe, it, expect } from 'vitest';
import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
	describe('username validation', () => {
		it('should accept valid username', () => {
			const validData = {
				username: 'testuser',
				password: 'Test@123'
			};
			expect(() => loginSchema.parse(validData)).not.toThrow();
		});

		it('should reject empty username', () => {
			const invalidData = {
				username: '',
				password: 'Test@123'
			};
			expect(() => loginSchema.parse(invalidData)).toThrow(/Username is required/);
		});

		it('should reject username less than 3 characters', () => {
			const invalidData = {
				username: 'ab',
				password: 'Test@123'
			};
			expect(() => loginSchema.parse(invalidData)).toThrow(/at least 3 characters/);
		});

		it('should reject username more than 50 characters', () => {
			const invalidData = {
				username: 'a'.repeat(51),
				password: 'Test@123'
			};
			expect(() => loginSchema.parse(invalidData)).toThrow(/not exceed 50 characters/);
		});

		it('should reject username with special characters', () => {
			const invalidData = {
				username: 'test@user',
				password: 'Test@123'
			};
			expect(() => loginSchema.parse(invalidData)).toThrow(/can only contain/);
		});

		it('should accept username with underscore', () => {
			const validData = {
				username: 'test_user',
				password: 'Test@123'
			};
			expect(() => loginSchema.parse(validData)).not.toThrow();
		});

		it('should accept username with numbers', () => {
			const validData = {
				username: 'testuser123',
				password: 'Test@123'
			};
			expect(() => loginSchema.parse(validData)).not.toThrow();
		});
	});

	describe('password validation', () => {
		it('should accept valid password', () => {
			const validData = {
				username: 'testuser',
				password: 'password123'
			};
			expect(() => loginSchema.parse(validData)).not.toThrow();
		});

		it('should reject empty password', () => {
			const invalidData = {
				username: 'testuser',
				password: ''
			};
			expect(() => loginSchema.parse(invalidData)).toThrow(/Password is required/);
		});

		it('should reject password less than 6 characters', () => {
			const invalidData = {
				username: 'testuser',
				password: '12345'
			};
			expect(() => loginSchema.parse(invalidData)).toThrow(/at least 6 characters/);
		});

		it('should accept password with exactly 6 characters', () => {
			const validData = {
				username: 'testuser',
				password: '123456'
			};
			expect(() => loginSchema.parse(validData)).not.toThrow();
		});

		it('should accept password with special characters', () => {
			const validData = {
				username: 'testuser',
				password: 'P@ssw0rd!'
			};
			expect(() => loginSchema.parse(validData)).not.toThrow();
		});
	});

	describe('complete validation', () => {
		it('should parse valid credentials', () => {
			const validData = {
				username: 'testuser',
				password: 'Test@123'
			};
			const result = loginSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should reject invalid credentials', () => {
			const invalidData = {
				username: 'ab',
				password: '123'
			};
			expect(() => loginSchema.parse(invalidData)).toThrow();
		});
	});
});
