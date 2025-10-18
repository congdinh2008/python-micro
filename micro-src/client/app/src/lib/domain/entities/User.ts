/**
 * @module Domain/Entities
 * @description Core domain entities
 */

/**
 * User entity representing a registered user
 */
export interface User {
	id: number;
	username: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

/**
 * User registration data
 */
export interface UserRegistrationData {
	username: string;
	password: string;
	confirmPassword: string;
}

/**
 * User credentials for login
 */
export interface UserCredentials {
	username: string;
	password: string;
}
