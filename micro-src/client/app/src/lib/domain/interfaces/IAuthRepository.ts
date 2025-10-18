/**
 * @module Domain/Interfaces
 * @description Authentication repository interface
 */

import type { AuthToken, TokenValidation } from '../entities/AuthToken';

/**
 * Authentication repository interface
 * Defines contract for authentication operations
 */
export interface IAuthRepository {
	/**
	 * Login user with credentials
	 * @param username - Username
	 * @param password - Password
	 * @returns Promise resolving to auth token
	 * @throws Error if credentials are invalid
	 */
	login(username: string, password: string): Promise<AuthToken>;

	/**
	 * Validate JWT token
	 * @param token - JWT token to validate
	 * @returns Promise resolving to validation result
	 */
	validateToken(token: string): Promise<TokenValidation>;

	/**
	 * Refresh access token (if backend supports)
	 * @param refreshToken - Refresh token
	 * @returns Promise resolving to new auth token
	 */
	refreshToken?(refreshToken: string): Promise<AuthToken>;
}
