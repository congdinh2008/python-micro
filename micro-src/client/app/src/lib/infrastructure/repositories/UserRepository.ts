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
	 * 
	 * NOTE: This method is currently disabled because the backend doesn't provide
	 * a dedicated username availability endpoint. The previous implementation attempted
	 * to use the registration endpoint as a workaround, but this is problematic as it
	 * could create test users or cause side effects.
	 * 
	 * TODO: Backend should implement GET /check-username/:username endpoint
	 * 
	 * For now, username uniqueness is validated during actual registration.
	 */
	async isUsernameAvailable(username: string): Promise<boolean> {
		// Always return true to not block registration
		// Actual uniqueness check happens server-side during registration
		console.warn('Username availability check is not implemented. Validation occurs during registration.');
		return true;
	}
}

/**
 * Export singleton instance
 */
export const userRepository = new UserRepository();
