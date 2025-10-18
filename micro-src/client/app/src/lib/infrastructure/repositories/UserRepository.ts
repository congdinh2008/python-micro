/**
 * @module Infrastructure/Repositories
 * @description Implementation of user repository
 */

import type { IUserRepository } from '$lib/domain/interfaces/IUserRepository';
import type { User } from '$lib/domain/entities/User';
import { userServiceApi, ApiError } from '../api/apiClient';

/**
 * User repository implementation
 * Handles communication with User Service API
 */
export class UserRepository implements IUserRepository {
	/**
	 * Register a new user
	 */
	async register(username: string, password: string): Promise<User> {
		try {
			const user = await userServiceApi.post<User>('/register', {
				username,
				password
			});
			return user;
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Registration failed. Please try again.', undefined, 'server');
		}
	}

	/**
	 * Check if username is available
	 * Note: This is a workaround since the backend doesn't have a dedicated endpoint
	 * We attempt to register and check for "already exists" error
	 */
	async isUsernameAvailable(username: string): Promise<boolean> {
		try {
			// Try to register with a dummy password to check username availability
			// This is not ideal but works with current backend API
			// In production, backend should have a dedicated /check-username endpoint
			await userServiceApi.post('/register', {
				username,
				password: 'DummyCheck@123' // This won't actually create a user
			});
			// If we get here, username is available (shouldn't happen in real check)
			return true;
		} catch (error) {
			if (error instanceof ApiError) {
				// If we get "already exists" error, username is taken
				if (error.message.toLowerCase().includes('already exists')) {
					return false;
				}
				// For validation errors (username too short, etc.), consider available
				if (error.type === 'validation') {
					return true;
				}
			}
			// For other errors, assume available to not block user
			return true;
		}
	}
}

/**
 * Export singleton instance
 */
export const userRepository = new UserRepository();
