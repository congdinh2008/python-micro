/**
 * @module Tests/UseCases
 * @description Unit tests for RegisterUserUseCase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterUserUseCase } from './RegisterUserUseCase';
import type { IUserRepository } from '$lib/domain/interfaces/IUserRepository';
import type { User } from '$lib/domain/entities/User';
import { ApiError } from '$lib/infrastructure/api/apiClient';

// Mock repository
class MockUserRepository implements IUserRepository {
	registerFn: (username: string, password: string) => Promise<User>;
	isAvailableFn: (username: string) => Promise<boolean>;

	constructor() {
		this.registerFn = vi.fn();
		this.isAvailableFn = vi.fn();
	}

	async register(username: string, password: string): Promise<User> {
		return this.registerFn(username, password);
	}

	async isUsernameAvailable(username: string): Promise<boolean> {
		return this.isAvailableFn(username);
	}
}

describe('RegisterUserUseCase', () => {
	let useCase: RegisterUserUseCase;
	let mockRepo: MockUserRepository;

	beforeEach(() => {
		mockRepo = new MockUserRepository();
		useCase = new RegisterUserUseCase(mockRepo);
	});

	describe('Successful Registration', () => {
		it('should register user with valid data', async () => {
			const mockUser: User = {
				id: 1,
				username: 'testuser',
				is_active: true,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			mockRepo.registerFn = vi.fn().mockResolvedValue(mockUser);

			const result = await useCase.execute({
				username: 'testuser',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			});

			expect(result.success).toBe(true);
			expect(result.user).toEqual(mockUser);
			expect(result.error).toBeUndefined();
		});
	});

	describe('Validation Errors', () => {
		it('should reject invalid username', async () => {
			const result = await useCase.execute({
				username: 'ab',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe('validation');
			expect(result.error?.field).toBe('username');
		});

		it('should reject invalid password', async () => {
			const result = await useCase.execute({
				username: 'testuser',
				password: 'short',
				confirmPassword: 'short'
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe('validation');
			expect(result.error?.field).toBe('password');
		});

		it('should reject mismatched passwords', async () => {
			const result = await useCase.execute({
				username: 'testuser',
				password: 'SecurePass@123',
				confirmPassword: 'DifferentPass@123'
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe('validation');
			expect(result.error?.field).toBe('confirmPassword');
		});

		it('should reject password matching username', async () => {
			const result = await useCase.execute({
				username: 'testuser',
				password: 'TestUser@123',
				confirmPassword: 'TestUser@123'
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe('validation');
			expect(result.error?.message).toContain('must not match username');
		});
	});

	describe('API Errors', () => {
		it('should handle username already exists error', async () => {
			mockRepo.registerFn = vi
				.fn()
				.mockRejectedValue(new ApiError('Username already exists', 400, 'validation'));

			const result = await useCase.execute({
				username: 'existinguser',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe('validation');
			expect(result.error?.message).toContain('already exists');
		});

		it('should handle network errors', async () => {
			mockRepo.registerFn = vi
				.fn()
				.mockRejectedValue(new ApiError('Network error', undefined, 'network'));

			const result = await useCase.execute({
				username: 'testuser',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe('network');
		});

		it('should handle server errors', async () => {
			mockRepo.registerFn = vi
				.fn()
				.mockRejectedValue(new ApiError('Internal server error', 500, 'server'));

			const result = await useCase.execute({
				username: 'testuser',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			});

			expect(result.success).toBe(false);
			expect(result.error?.type).toBe('server');
		});

		it('should handle unexpected errors', async () => {
			mockRepo.registerFn = vi.fn().mockRejectedValue(new Error('Unexpected error'));

			const result = await useCase.execute({
				username: 'testuser',
				password: 'SecurePass@123',
				confirmPassword: 'SecurePass@123'
			});

			expect(result.success).toBe(false);
			expect(result.error?.message).toBe('An unexpected error occurred. Please try again.');
		});
	});

	describe('Username Availability Check', () => {
		it('should return true for available username', async () => {
			mockRepo.isAvailableFn = vi.fn().mockResolvedValue(true);

			const isAvailable = await useCase.checkUsernameAvailability('testuser');
			expect(isAvailable).toBe(true);
		});

		it('should return false for taken username', async () => {
			mockRepo.isAvailableFn = vi.fn().mockResolvedValue(false);

			const isAvailable = await useCase.checkUsernameAvailability('existinguser');
			expect(isAvailable).toBe(false);
		});

		it('should return true on check error (fail open)', async () => {
			mockRepo.isAvailableFn = vi.fn().mockRejectedValue(new Error('Network error'));

			const isAvailable = await useCase.checkUsernameAvailability('testuser');
			expect(isAvailable).toBe(true);
		});
	});
});
