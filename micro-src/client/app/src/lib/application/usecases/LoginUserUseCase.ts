/**
 * @module Application/UseCases
 * @description Login user use case with brute-force protection
 */

import type { IAuthRepository } from '$lib/domain/interfaces/IAuthRepository';
import type { AuthToken } from '$lib/domain/entities/AuthToken';
import { loginSchema, type LoginCredentials } from '$lib/domain/validation/loginSchema';
import { ApiError } from '$lib/infrastructure/api/apiClient';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Login result
 */
export interface LoginResult {
success: boolean;
token?: AuthToken;
error?: string;
lockedUntil?: number;
}

/**
 * Login attempts tracker
 */
class LoginAttemptsTracker {
private attempts: Map<string, { count: number; lockedUntil: number | null }> = new Map();

/**
 * Record a failed login attempt
 */
recordFailedAttempt(username: string): void {
const current = this.attempts.get(username) || { count: 0, lockedUntil: null };
current.count++;

if (current.count >= MAX_LOGIN_ATTEMPTS) {
current.lockedUntil = Date.now() + LOCKOUT_DURATION;
}

this.attempts.set(username, current);
}

/**
 * Check if account is locked
 */
isLocked(username: string): boolean {
const current = this.attempts.get(username);
if (!current || !current.lockedUntil) return false;

// Check if lockout period has passed
if (Date.now() >= current.lockedUntil) {
this.reset(username);
return false;
}

return true;
}

/**
 * Get locked until timestamp
 */
getLockedUntil(username: string): number | null {
const current = this.attempts.get(username);
return current?.lockedUntil || null;
}

/**
 * Reset attempts for a username
 */
reset(username: string): void {
this.attempts.delete(username);
}

/**
 * Get remaining attempts
 */
getRemainingAttempts(username: string): number {
const current = this.attempts.get(username);
if (!current) return MAX_LOGIN_ATTEMPTS;

return Math.max(0, MAX_LOGIN_ATTEMPTS - current.count);
}
}

/**
 * Login user use case
 */
export class LoginUserUseCase {
private static attemptsTracker = new LoginAttemptsTracker();

constructor(private authRepository: IAuthRepository) {}

/**
 * Execute login use case
 * @param credentials - User credentials
 * @returns Login result with token or error
 */
async execute(credentials: LoginCredentials): Promise<LoginResult> {
try {
// Validate input
const validatedData = loginSchema.parse(credentials);

// Check if account is locked
if (LoginUserUseCase.attemptsTracker.isLocked(validatedData.username)) {
const lockedUntil = LoginUserUseCase.attemptsTracker.getLockedUntil(validatedData.username);
const minutesLeft = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 60000) : 15;

return {
success: false,
error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
lockedUntil
};
}

// Attempt login
const token = await this.authRepository.login(validatedData.username, validatedData.password);

// Reset attempts on successful login
LoginUserUseCase.attemptsTracker.reset(validatedData.username);

return {
success: true,
token
};
} catch (error) {
// Record failed attempt
if (credentials.username) {
LoginUserUseCase.attemptsTracker.recordFailedAttempt(credentials.username);
}

const remainingAttempts = credentials.username
? LoginUserUseCase.attemptsTracker.getRemainingAttempts(credentials.username)
: MAX_LOGIN_ATTEMPTS;

if (error instanceof ApiError) {
let errorMessage = error.message;

// Add remaining attempts info if validation passed but auth failed
if (error.statusCode === 401 && remainingAttempts > 0) {
errorMessage += ` (${remainingAttempts} attempts remaining)`;
}

return {
success: false,
error: errorMessage
};
}

return {
success: false,
error: 'Login failed. Please try again.'
};
}
}

/**
 * Check if username is locked
 */
isAccountLocked(username: string): boolean {
return LoginUserUseCase.attemptsTracker.isLocked(username);
}

/**
 * Get remaining login attempts
 */
getRemainingAttempts(username: string): number {
return LoginUserUseCase.attemptsTracker.getRemainingAttempts(username);
}
}
