/**
 * @module Application/UseCases
 * @description Tests for LoginUserUseCase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUserUseCase } from './LoginUserUseCase';
import type { IAuthRepository } from '$lib/domain/interfaces/IAuthRepository';
import type { AuthToken } from '$lib/domain/entities/AuthToken';
import { ApiError } from '$lib/infrastructure/api/apiClient';

// Mock repository
const createMockAuthRepository = (): IAuthRepository => ({
login: vi.fn(),
validateToken: vi.fn(),
refreshToken: vi.fn()
});

describe('LoginUserUseCase', () => {
let mockRepository: IAuthRepository;
let useCase: LoginUserUseCase;

beforeEach(() => {
mockRepository = createMockAuthRepository();
useCase = new LoginUserUseCase(mockRepository);
});

describe('successful login', () => {
it('should return success with token on valid credentials', async () => {
const mockToken: AuthToken = {
access_token: 'mock-jwt-token',
token_type: 'bearer',
expires_at: Date.now() + 30 * 60 * 1000
};

vi.mocked(mockRepository.login).mockResolvedValue(mockToken);

const result = await useCase.execute({
username: 'testuser',
password: 'password123'
});

expect(result.success).toBe(true);
expect(result.token).toEqual(mockToken);
expect(result.error).toBeUndefined();
});

it('should reset login attempts on successful login', async () => {
const uniqueUsername = `testuser_reset_${Date.now()}`;
const mockToken: AuthToken = {
access_token: 'mock-jwt-token',
token_type: 'bearer',
expires_at: Date.now() + 30 * 60 * 1000
};

// Simulate failed attempt first
vi.mocked(mockRepository.login).mockRejectedValueOnce(
new ApiError('Invalid credentials', 401, 'validation')
);

await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});

// Check attempts were recorded
expect(useCase.getRemainingAttempts(uniqueUsername)).toBe(4);

// Now successful login
vi.mocked(mockRepository.login).mockResolvedValue(mockToken);

await useCase.execute({
username: uniqueUsername,
password: 'correctpassword'
});

// Attempts should be reset
expect(useCase.getRemainingAttempts(uniqueUsername)).toBe(5);
});
});

describe('validation errors', () => {
it('should fail with invalid username format', async () => {
const result = await useCase.execute({
username: 'ab', // too short
password: 'password123'
});

expect(result.success).toBe(false);
expect(result.error).toBeDefined();
expect(mockRepository.login).not.toHaveBeenCalled();
});

it('should fail with invalid password', async () => {
const result = await useCase.execute({
username: 'testuser',
password: '123' // too short
});

expect(result.success).toBe(false);
expect(result.error).toBeDefined();
expect(mockRepository.login).not.toHaveBeenCalled();
});
});

describe('authentication errors', () => {
it('should handle 401 authentication error', async () => {
const uniqueUsername = `testuser_auth_${Date.now()}`;
vi.mocked(mockRepository.login).mockRejectedValue(
new ApiError('Incorrect username or password', 401, 'validation')
);

const result = await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});

expect(result.success).toBe(false);
expect(result.error).toContain('Incorrect username or password');
expect(result.error).toContain('attempts remaining');
});

it('should handle network errors', async () => {
vi.mocked(mockRepository.login).mockRejectedValue(
new ApiError('Network error', undefined, 'network')
);

const result = await useCase.execute({
username: 'testuser',
password: 'password123'
});

expect(result.success).toBe(false);
expect(result.error).toContain('Network error');
});
});

describe('brute-force protection', () => {
it('should lock account after 5 failed attempts', async () => {
const uniqueUsername = `testuser_lock_${Date.now()}`;
vi.mocked(mockRepository.login).mockRejectedValue(
new ApiError('Invalid credentials', 401, 'validation')
);

// Make 5 failed attempts
for (let i = 0; i < 5; i++) {
await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});
}

// 6th attempt should be locked
const result = await useCase.execute({
username: uniqueUsername,
password: 'password123'
});

expect(result.success).toBe(false);
expect(result.error).toContain('Account locked');
expect(result.lockedUntil).toBeDefined();
expect(useCase.isAccountLocked(uniqueUsername)).toBe(true);
});

it('should show remaining attempts count', async () => {
const uniqueUsername = `testuser_attempts_${Date.now()}`;
vi.mocked(mockRepository.login).mockRejectedValue(
new ApiError('Invalid credentials', 401, 'validation')
);

// First failed attempt
const result1 = await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});
expect(result1.error).toContain('4 attempts remaining');

// Second failed attempt
const result2 = await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});
expect(result2.error).toContain('3 attempts remaining');
});

it('should not call API when account is locked', async () => {
const uniqueUsername = `testuser_api_${Date.now()}`;
const loginSpy = vi.mocked(mockRepository.login);
loginSpy.mockRejectedValue(new ApiError('Invalid credentials', 401, 'validation'));

// Lock the account
for (let i = 0; i < 5; i++) {
await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});
}

// Reset call count
loginSpy.mockClear();

// Try to login when locked
await useCase.execute({
username: uniqueUsername,
password: 'password123'
});

// API should not be called
expect(loginSpy).not.toHaveBeenCalled();
});
});

describe('getRemainingAttempts', () => {
it('should return 5 for new user', () => {
const uniqueUsername = `newuser_${Date.now()}`;
expect(useCase.getRemainingAttempts(uniqueUsername)).toBe(5);
});

it('should decrease with failed attempts', async () => {
const uniqueUsername = `testuser_decrease_${Date.now()}`;
vi.mocked(mockRepository.login).mockRejectedValue(
new ApiError('Invalid credentials', 401, 'validation')
);

await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});

expect(useCase.getRemainingAttempts(uniqueUsername)).toBe(4);

await useCase.execute({
username: uniqueUsername,
password: 'wrongpassword'
});

expect(useCase.getRemainingAttempts(uniqueUsername)).toBe(3);
});
});
});
