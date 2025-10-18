/**
 * @module Domain/Entities
 * @description Authentication token entities
 */

/**
 * Authentication token returned from login
 */
export interface AuthToken {
	access_token: string;
	token_type: string;
	expires_at?: number; // Unix timestamp
}

/**
 * Token validation response
 */
export interface TokenValidation {
	valid: boolean;
	username?: string;
	user_id?: number;
}

/**
 * Authentication state
 */
export interface AuthState {
	isAuthenticated: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	user: {
		id: number;
		username: string;
	} | null;
	loading: boolean;
	error: string | null;
	loginAttempts: number;
	lockedUntil: number | null;
}
