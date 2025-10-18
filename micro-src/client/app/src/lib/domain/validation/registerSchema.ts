/**
 * @module Domain/Validation
 * @description Zod validation schemas for user registration
 */

import { z } from 'zod';

/**
 * Enhanced registration validation schema
 * 
 * Requirements:
 * - Username: 3-50 characters, alphanumeric + underscore only
 * - Password: >= 8 characters, contains uppercase, special character
 * - Password must not match username
 * - Confirm password must match password
 */
export const registerSchema = z
	.object({
		username: z
			.string()
			.trim()
			.min(3, 'Username must be at least 3 characters')
			.max(50, 'Username must not exceed 50 characters')
			.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	})
	.refine((data) => !data.password.toLowerCase().includes(data.username.toLowerCase()), {
		message: 'Password must not match username',
		path: ['password']
	});

/**
 * Type inference from schema
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Individual field validation helpers for real-time validation
 */
export const validateUsername = (username: string): string | null => {
	try {
		z.string()
			.min(3, 'Username must be at least 3 characters')
			.max(50, 'Username must not exceed 50 characters')
			.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
			.parse(username);
		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.errors[0]?.message || 'Invalid username';
		}
		return 'Invalid username';
	}
};

export const validatePassword = (password: string, username?: string): string | null => {
	try {
		z.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
			.parse(password);

		// Check if password contains username
		if (username && password.toLowerCase().includes(username.toLowerCase())) {
			return 'Password must not match username';
		}

		return null;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return error.errors[0]?.message || 'Invalid password';
		}
		return 'Invalid password';
	}
};

export const validateConfirmPassword = (
	password: string,
	confirmPassword: string
): string | null => {
	if (password !== confirmPassword) {
		return "Passwords don't match";
	}
	return null;
};
