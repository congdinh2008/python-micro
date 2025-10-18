/**
 * @module Application/UseCases
 * @description Use case for user registration following Clean Architecture
 */

import type { IUserRepository } from '$lib/domain/interfaces/IUserRepository';
import type { User, UserRegistrationData } from '$lib/domain/entities/User';
import { registerSchema } from '$lib/domain/validation/registerSchema';
import { ApiError } from '$lib/infrastructure/api/apiClient';

/**
 * Result type for registration use case
 */
export interface RegisterUserResult {
	success: boolean;
	user?: User;
	error?: {
		message: string;
		type: 'validation' | 'network' | 'server';
		field?: string;
	};
}

/**
 * Use case for registering a new user
 * Coordinates validation, uniqueness check, and registration
 */
export class RegisterUserUseCase {
	constructor(private userRepository: IUserRepository) {}

	/**
	 * Execute user registration
	 * @param data - User registration data
	 * @returns Promise with registration result
	 */
	async execute(data: UserRegistrationData): Promise<RegisterUserResult> {
		try {
			// Step 1: Validate input data
			const validationResult = registerSchema.safeParse(data);
			if (!validationResult.success) {
				const firstError = validationResult.error.errors[0];
				return {
					success: false,
					error: {
						message: firstError.message,
						type: 'validation',
						field: firstError.path[0]?.toString()
					}
				};
			}

			// Step 2: Check username availability
			// Note: Commenting out for now as it would cause unnecessary API calls
			// The backend will handle username uniqueness check during registration
			/*
			const isAvailable = await this.userRepository.isUsernameAvailable(data.username);
			if (!isAvailable) {
				return {
					success: false,
					error: {
						message: 'Username already exists. Please choose another one.',
						type: 'validation',
						field: 'username'
					}
				};
			}
			*/

			// Step 3: Register user
			const user = await this.userRepository.register(data.username, data.password);

			return {
				success: true,
				user
			};
		} catch (error) {
			if (error instanceof ApiError) {
				return {
					success: false,
					error: {
						message: error.message,
						type: error.type
					}
				};
			}

			// Unknown error
			return {
				success: false,
				error: {
					message: 'An unexpected error occurred. Please try again.',
					type: 'server'
				}
			};
		}
	}

	/**
	 * Check if username is available (for real-time validation)
	 * @param username - Username to check
	 * @returns Promise resolving to true if available
	 */
	async checkUsernameAvailability(username: string): Promise<boolean> {
		try {
			return await this.userRepository.isUsernameAvailable(username);
		} catch {
			// If check fails, assume available to not block user
			return true;
		}
	}
}
