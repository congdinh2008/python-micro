/**
 * @module Domain/Validation
 * @description Login validation schema
 */

import { z } from 'zod';

/**
 * Login credentials validation schema
 */
export const loginSchema = z.object({
	username: z
		.string()
		.min(1, 'Username is required')
		.min(3, 'Username must be at least 3 characters')
		.max(50, 'Username must not exceed 50 characters')
		.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
	password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters')
});

/**
 * Login credentials type
 */
export type LoginCredentials = z.infer<typeof loginSchema>;
