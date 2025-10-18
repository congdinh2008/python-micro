/**
 * @module Tests/Validation
 * @description Unit tests for registration validation schema
 */

import { describe, it, expect } from 'vitest';
import {
	registerSchema,
	validateUsername,
	validatePassword,
	validateConfirmPassword
} from './registerSchema';

describe('Register Validation Schema', () => {
	describe('Full Schema Validation', () => {
		it('should accept valid registration data', () => {
			const validData = {
				username: 'testuser123',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			};

			const result = registerSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('should reject when passwords do not match', () => {
			const invalidData = {
				username: 'testuser123',
				password: 'SecurePass@123',
				confirmPassword: 'DifferentPass@123'
			};

			const result = registerSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.errors[0].message).toBe("Passwords don't match");
			}
		});

		it('should reject when password matches username', () => {
			const invalidData = {
				username: 'TestUser',
				password: 'TestUser@123',
				confirmPassword: 'TestUser@123'
			};

			const result = registerSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.errors.some((e) => e.message.includes('must not match username'))).toBe(
					true
				);
			}
		});
	});

	describe('Username Validation', () => {
		it('should accept valid username', () => {
			const error = validateUsername('validUser_123');
			expect(error).toBeNull();
		});

		it('should reject username shorter than 3 characters', () => {
			const error = validateUsername('ab');
			expect(error).toBe('Username must be at least 3 characters');
		});

		it('should reject username longer than 50 characters', () => {
			const longUsername = 'a'.repeat(51);
			const error = validateUsername(longUsername);
			expect(error).toBe('Username must not exceed 50 characters');
		});

		it('should reject username with special characters', () => {
			const error = validateUsername('user@name');
			expect(error).toBe('Username can only contain letters, numbers, and underscores');
		});

		it('should reject username with spaces', () => {
			const error = validateUsername('user name');
			expect(error).toBe('Username can only contain letters, numbers, and underscores');
		});

		it('should accept username with underscores', () => {
			const error = validateUsername('user_name_123');
			expect(error).toBeNull();
		});
	});

	describe('Password Validation', () => {
		it('should accept valid password', () => {
			const error = validatePassword('SecurePass@123');
			expect(error).toBeNull();
		});

		it('should reject password shorter than 8 characters', () => {
			const error = validatePassword('Short@1');
			expect(error).toBe('Password must be at least 8 characters');
		});

		it('should reject password without uppercase letter', () => {
			const error = validatePassword('noupppercase@123');
			expect(error).toBe('Password must contain at least one uppercase letter');
		});

		it('should reject password without special character', () => {
			const error = validatePassword('NoSpecialChar123');
			expect(error).toBe('Password must contain at least one special character');
		});

		it('should reject password matching username', () => {
			const error = validatePassword('TestUser@123', 'testuser');
			expect(error).toBe('Password must not match username');
		});

		it('should accept password with all requirements', () => {
			const error = validatePassword('SecureP@ssw0rd', 'differentuser');
			expect(error).toBeNull();
		});
	});

	describe('Confirm Password Validation', () => {
		it('should accept matching passwords', () => {
			const error = validateConfirmPassword('Password@123', 'Password@123');
			expect(error).toBeNull();
		});

		it('should reject non-matching passwords', () => {
			const error = validateConfirmPassword('Password@123', 'Different@123');
			expect(error).toBe("Passwords don't match");
		});
	});

	describe('Edge Cases', () => {
		it('should trim username whitespace', () => {
			const result = registerSchema.safeParse({
				username: '  testuser  ',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.username).toBe('testuser');
			}
		});

		it('should handle empty strings', () => {
			const result = registerSchema.safeParse({
				username: '',
				password: '',
				confirmPassword: ''
			});
			expect(result.success).toBe(false);
		});

		it('should handle case-insensitive username/password matching', () => {
			const invalidData = {
				username: 'TestUser',
				password: 'testuser@123',
				confirmPassword: 'testuser@123'
			};

			const result = registerSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});
});
