/**
 * @module Application/UseCases
 * @description Validate token use case for auto-login
 */

import type { IAuthRepository } from '$lib/domain/interfaces/IAuthRepository';
import type { TokenValidation } from '$lib/domain/entities/AuthToken';
import { getToken, isTokenExpired } from '$lib/infrastructure/storage/tokenStorage';

/**
 * Validate token use case
 * Used for auto-login functionality
 */
export class ValidateTokenUseCase {
constructor(private authRepository: IAuthRepository) {}

/**
 * Execute token validation
 * @returns Token validation result with user info if valid
 */
async execute(): Promise<TokenValidation> {
try {
// Get token from storage
const token = getToken();

// No token found
if (!token) {
return { valid: false };
}

// Check if token is expired (client-side check)
if (isTokenExpired()) {
return { valid: false };
}

// Validate token with backend
const validation = await this.authRepository.validateToken(token);

return validation;
} catch (error) {
console.error('Token validation error:', error);
return { valid: false };
}
}

/**
 * Check if there's a stored token
 */
hasStoredToken(): boolean {
const token = getToken();
return token !== null && !isTokenExpired();
}
}
