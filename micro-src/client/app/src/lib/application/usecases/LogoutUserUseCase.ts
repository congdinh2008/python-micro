/**
 * @module Application/UseCases
 * @description Logout user use case
 */

import { clearToken } from '$lib/infrastructure/storage/tokenStorage';

/**
 * Logout user use case
 * Clears all authentication state and stored tokens
 */
export class LogoutUserUseCase {
/**
 * Execute logout
 * Clears all stored authentication data
 */
execute(): void {
try {
// Clear tokens from storage
clearToken();

// Additional cleanup can be added here
// e.g., call logout endpoint, clear other stores, etc.
} catch (error) {
console.error('Error during logout:', error);
// Even if there's an error, ensure tokens are cleared
clearToken();
}
}
}
