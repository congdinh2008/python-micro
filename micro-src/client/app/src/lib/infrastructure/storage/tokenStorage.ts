/**
 * @module Infrastructure/Storage
 * @description Secure token storage utilities
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const USER_KEY = 'user_data';

/**
 * Token storage interface
 */
export interface TokenStorage {
accessToken: string | null;
refreshToken: string | null;
expiresAt: number | null;
user: { id: number; username: string } | null;
}

/**
 * Save authentication token to storage
 * @param token - Access token
 * @param expiresAt - Token expiration timestamp
 * @param refreshToken - Optional refresh token
 */
export function saveToken(token: string, expiresAt: number, refreshToken?: string): void {
if (typeof window === 'undefined') return;

try {
localStorage.setItem(TOKEN_KEY, token);
localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
if (refreshToken) {
localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}
} catch (error) {
console.error('Failed to save token to storage:', error);
}
}

/**
 * Get authentication token from storage
 * @returns Token or null if not found or expired
 */
export function getToken(): string | null {
if (typeof window === 'undefined') return null;

try {
const token = localStorage.getItem(TOKEN_KEY);
const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

if (!token || !expiryStr) return null;

const expiry = parseInt(expiryStr, 10);
// Check if token is expired (with 5 minute buffer)
if (Date.now() + 5 * 60 * 1000 >= expiry) {
clearToken();
return null;
}

return token;
} catch (error) {
console.error('Failed to get token from storage:', error);
return null;
}
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
if (typeof window === 'undefined') return null;

try {
return localStorage.getItem(REFRESH_TOKEN_KEY);
} catch (error) {
console.error('Failed to get refresh token from storage:', error);
return null;
}
}

/**
 * Get token expiration time
 */
export function getTokenExpiry(): number | null {
if (typeof window === 'undefined') return null;

try {
const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
return expiryStr ? parseInt(expiryStr, 10) : null;
} catch (error) {
return null;
}
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
const expiry = getTokenExpiry();
if (!expiry) return true;

return Date.now() >= expiry;
}

/**
 * Clear authentication token from storage
 */
export function clearToken(): void {
if (typeof window === 'undefined') return;

try {
localStorage.removeItem(TOKEN_KEY);
localStorage.removeItem(REFRESH_TOKEN_KEY);
localStorage.removeItem(TOKEN_EXPIRY_KEY);
localStorage.removeItem(USER_KEY);
} catch (error) {
console.error('Failed to clear token from storage:', error);
}
}

/**
 * Save user data to storage
 */
export function saveUserData(user: { id: number; username: string }): void {
if (typeof window === 'undefined') return;

try {
localStorage.setItem(USER_KEY, JSON.stringify(user));
} catch (error) {
console.error('Failed to save user data:', error);
}
}

/**
 * Get user data from storage
 */
export function getUserData(): { id: number; username: string } | null {
if (typeof window === 'undefined') return null;

try {
const userStr = localStorage.getItem(USER_KEY);
return userStr ? JSON.parse(userStr) : null;
} catch (error) {
console.error('Failed to get user data:', error);
return null;
}
}

/**
 * Get all stored authentication data
 */
export function getStoredAuth(): TokenStorage {
return {
accessToken: getToken(),
refreshToken: getRefreshToken(),
expiresAt: getTokenExpiry(),
user: getUserData()
};
}
