/**
 * @module Application/Stores
 * @description Authentication store for global state management
 */

import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { AuthState } from '$lib/domain/entities/AuthToken';
import { authRepository } from '$lib/infrastructure/repositories/AuthRepository';
import { LoginUserUseCase } from '../usecases/LoginUserUseCase';
import { LogoutUserUseCase } from '../usecases/LogoutUserUseCase';
import { ValidateTokenUseCase } from '../usecases/ValidateTokenUseCase';
import { saveToken, saveUserData, getStoredAuth, clearToken } from '$lib/infrastructure/storage/tokenStorage';

/**
 * Initial authentication state
 */
const initialState: AuthState = {
isAuthenticated: false,
accessToken: null,
refreshToken: null,
user: null,
loading: false,
error: null,
loginAttempts: 0,
lockedUntil: null
};

/**
 * Create authentication store
 */
function createAuthStore() {
const { subscribe, set, update } = writable<AuthState>(initialState);

// Use cases
const loginUseCase = new LoginUserUseCase(authRepository);
const logoutUseCase = new LogoutUserUseCase();
const validateTokenUseCase = new ValidateTokenUseCase(authRepository);

// Initialize from storage on client-side
if (browser) {
const stored = getStoredAuth();
if (stored.accessToken && stored.user) {
update((state) => ({
...state,
isAuthenticated: true,
accessToken: stored.accessToken,
refreshToken: stored.refreshToken,
user: stored.user
}));
}
}

return {
subscribe,

/**
 * Login user
 * @param username - Username
 * @param password - Password
 */
async login(username: string, password: string): Promise<void> {
update((state) => ({
...state,
loading: true,
error: null
}));

try {
const result = await loginUseCase.execute({ username, password });

if (result.success && result.token) {
// Validate token to get user info
const validation = await authRepository.validateToken(result.token.access_token);

const user = validation.valid && validation.username && validation.user_id
? { id: validation.user_id, username: validation.username }
: null;

// Save to storage
if (browser) {
saveToken(result.token.access_token, result.token.expires_at || Date.now() + 30 * 60 * 1000);
if (user) {
saveUserData(user);
}
}

update((state) => ({
...state,
isAuthenticated: true,
accessToken: result.token!.access_token,
refreshToken: null,
user,
loading: false,
error: null,
loginAttempts: 0,
lockedUntil: null
}));
} else {
update((state) => ({
...state,
loading: false,
error: result.error || 'Login failed',
loginAttempts: state.loginAttempts + 1,
lockedUntil: result.lockedUntil || null
}));
throw new Error(result.error || 'Login failed');
}
} catch (error) {
const errorMessage = error instanceof Error ? error.message : 'Login failed';
update((state) => ({
...state,
loading: false,
error: errorMessage
}));
throw error;
}
},

/**
 * Logout user
 */
logout(): void {
logoutUseCase.execute();
set(initialState);
},

/**
 * Auto-login - validate stored token
 */
async autoLogin(): Promise<boolean> {
if (!browser) return false;

const stored = getStoredAuth();
if (!stored.accessToken) return false;

update((state) => ({
...state,
loading: true
}));

try {
const validation = await validateTokenUseCase.execute();

if (validation.valid && validation.username && validation.user_id) {
const user = { id: validation.user_id, username: validation.username };

// Update user data in storage
saveUserData(user);

update((state) => ({
...state,
isAuthenticated: true,
accessToken: stored.accessToken,
refreshToken: stored.refreshToken,
user,
loading: false,
error: null
}));

return true;
} else {
// Token invalid, clear it
clearToken();
set(initialState);
return false;
}
} catch (error) {
console.error('Auto-login failed:', error);
clearToken();
set(initialState);
return false;
}
},

/**
 * Clear error
 */
clearError(): void {
update((state) => ({
...state,
error: null
}));
},

/**
 * Get current token
 */
getToken(): string | null {
let token: string | null = null;
subscribe((state) => {
token = state.accessToken;
})();
return token;
}
};
}

/**
 * Authentication store singleton
 */
export const authStore = createAuthStore();

/**
 * Derived store for authentication status
 */
export const isAuthenticated: Readable<boolean> = derived(authStore, ($auth) => $auth.isAuthenticated);

/**
 * Derived store for current user
 */
export const currentUser: Readable<{ id: number; username: string } | null> = derived(
authStore,
($auth) => $auth.user
);

/**
 * Derived store for loading state
 */
export const authLoading: Readable<boolean> = derived(authStore, ($auth) => $auth.loading);

/**
 * Derived store for error state
 */
export const authError: Readable<string | null> = derived(authStore, ($auth) => $auth.error);
