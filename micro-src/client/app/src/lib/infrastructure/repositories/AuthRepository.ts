/**
 * @module Infrastructure/Repositories
 * @description Implementation of authentication repository
 */

import type { IAuthRepository } from '$lib/domain/interfaces/IAuthRepository';
import type { AuthToken, TokenValidation } from '$lib/domain/entities/AuthToken';
import { userServiceApi, ApiError } from '../api/apiClient';

/**
 * Authentication repository implementation
 * Handles communication with User Service API for authentication
 */
export class AuthRepository implements IAuthRepository {
	/**
	 * Login user with username and password
	 */
	async login(username: string, password: string): Promise<AuthToken> {
		try {
			// Backend expects form-urlencoded data
			const formData = new URLSearchParams();
			formData.append('username', username);
			formData.append('password', password);

			const response = await userServiceApi.post<AuthToken>('/login', formData, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			// Calculate token expiration (default 30 minutes)
			const expiresAt = Date.now() + 30 * 60 * 1000;

			return {
				...response,
				expires_at: expiresAt
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Login failed. Please try again.', undefined, 'server');
		}
	}

	/**
	 * Validate JWT token
	 */
	async validateToken(token: string): Promise<TokenValidation> {
		try {
			const response = await userServiceApi.post<TokenValidation>('/validate-token', {
				token
			});
			return response;
		} catch (error) {
			// If validation fails, return invalid
			return {
				valid: false
			};
		}
	}

	/**
	 * Refresh access token
	 * Note: Currently backend doesn't support refresh tokens
	 * This is a placeholder for future implementation
	 */
	async refreshToken(refreshToken: string): Promise<AuthToken> {
		throw new Error('Refresh token not supported by backend yet');
	}
}

/**
 * Export singleton instance
 */
export const authRepository = new AuthRepository();
