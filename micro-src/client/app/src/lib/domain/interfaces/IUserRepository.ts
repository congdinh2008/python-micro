/**
 * @module Domain/Interfaces
 * @description Repository interfaces for dependency inversion
 */

import type { User } from '../entities/User';

/**
 * User repository interface
 * Defines contract for user data operations
 */
export interface IUserRepository {
	/**
	 * Register a new user
	 * @param username - Username for registration
	 * @param password - Password for registration
	 * @returns Promise resolving to created user
	 * @throws Error if username already exists or network error
	 */
	register(username: string, password: string): Promise<User>;

	/**
	 * Check if username is available
	 * @param username - Username to check
	 * @returns Promise resolving to true if available, false otherwise
	 */
	isUsernameAvailable(username: string): Promise<boolean>;

	/**
	 * Get current user information
	 * @param token - JWT token
	 * @returns Promise resolving to user information
	 */
	getCurrentUser(token: string): Promise<User>;
}
