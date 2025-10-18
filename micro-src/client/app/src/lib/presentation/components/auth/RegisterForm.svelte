<script lang="ts">
	/**
	 * @component RegisterForm
	 * @description User registration form with real-time validation and Clean Architecture
	 */

	import { goto } from '$app/navigation';
	import Input from '../ui/Input.svelte';
	import Button from '../ui/Button.svelte';
	import Alert from '../ui/Alert.svelte';
	import { RegisterUserUseCase } from '$lib/application/usecases/RegisterUserUseCase';
	import { userRepository } from '$lib/infrastructure/repositories/UserRepository';
	import {
		validateUsername,
		validatePassword,
		validateConfirmPassword
	} from '$lib/domain/validation/registerSchema';

	// Initialize use case with dependency injection
	const registerUseCase = new RegisterUserUseCase(userRepository);

	// Form state
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	// Error state
	let usernameError = $state<string | null>(null);
	let passwordError = $state<string | null>(null);
	let confirmPasswordError = $state<string | null>(null);
	let formError = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// UI state
	let isSubmitting = $state(false);
	let isUsernameChecking = $state(false);

	// Debounce timers
	let usernameDebounce: number | undefined;
	let passwordDebounce: number | undefined;

	/**
	 * Validate username with debounce (300ms)
	 */
	function handleUsernameInput(value: string) {
		username = value;
		clearTimeout(usernameDebounce);

		// Clear previous errors
		usernameError = null;

		// Immediate validation for empty or very short input
		if (value.length === 0) {
			return;
		}

		if (value.length < 3) {
			usernameError = 'Username must be at least 3 characters';
			return;
		}

		// Debounced validation
		usernameDebounce = window.setTimeout(() => {
			const error = validateUsername(value);
			usernameError = error;

			// Optionally check availability (commented out to avoid excessive API calls)
			// if (!error) {
			//   checkUsernameAvailability(value);
			// }
		}, 300);
	}

	/**
	 * Check username availability (async validation)
	 */
	async function checkUsernameAvailability(username: string) {
		isUsernameChecking = true;
		try {
			const isAvailable = await registerUseCase.checkUsernameAvailability(username);
			if (!isAvailable) {
				usernameError = 'Username already exists. Please choose another one.';
			}
		} catch {
			// Silently fail to not block user
		} finally {
			isUsernameChecking = false;
		}
	}

	/**
	 * Validate password with debounce (300ms)
	 */
	function handlePasswordInput(value: string) {
		password = value;
		clearTimeout(passwordDebounce);

		// Clear previous errors
		passwordError = null;

		// Immediate validation for empty input
		if (value.length === 0) {
			return;
		}

		// Debounced validation
		passwordDebounce = window.setTimeout(() => {
			const error = validatePassword(value, username);
			passwordError = error;

			// Re-validate confirm password if it has value
			if (confirmPassword) {
				confirmPasswordError = validateConfirmPassword(value, confirmPassword);
			}
		}, 300);
	}

	/**
	 * Validate confirm password
	 */
	function handleConfirmPasswordInput(value: string) {
		confirmPassword = value;
		confirmPasswordError = validateConfirmPassword(password, value);
	}

	/**
	 * Validate on blur for better UX
	 */
	function handleUsernameBlur() {
		if (username) {
			usernameError = validateUsername(username);
		}
	}

	function handlePasswordBlur() {
		if (password) {
			passwordError = validatePassword(password, username);
		}
	}

	function handleConfirmPasswordBlur() {
		if (confirmPassword) {
			confirmPasswordError = validateConfirmPassword(password, confirmPassword);
		}
	}

	/**
	 * Handle form submission
	 */
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		// Clear previous messages
		formError = null;
		successMessage = null;

		// Validate all fields before submission
		usernameError = validateUsername(username);
		passwordError = validatePassword(password, username);
		confirmPasswordError = validateConfirmPassword(password, confirmPassword);

		// Check if there are any errors
		if (usernameError || passwordError || confirmPasswordError) {
			formError = 'Please fix the errors above before submitting.';
			return;
		}

		// Submit form
		isSubmitting = true;

		try {
			const result = await registerUseCase.execute({
				username,
				password,
				confirmPassword
			});

			if (result.success) {
				successMessage = 'Registration successful! Redirecting to login...';

				// Redirect to login page after 2 seconds
				setTimeout(() => {
					goto('/auth/login');
				}, 2000);
			} else if (result.error) {
				// Handle specific field errors
				if (result.error.field === 'username') {
					usernameError = result.error.message;
				} else if (result.error.field === 'password') {
					passwordError = result.error.message;
				} else {
					formError = result.error.message;
				}
			}
		} catch (error) {
			formError = 'An unexpected error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}


</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<h1 class="text-3xl font-bold text-gray-900">Create your account</h1>
			<p class="mt-2 text-sm text-gray-600">
				Already have an account?
				<a href="/auth/login" class="font-medium text-primary-600 hover:text-primary-500 focus-ring">
					Sign in
				</a>
			</p>
		</div>

		<!-- Form -->
		<div class="bg-white rounded-lg shadow-md p-8">
			<!-- Success Message -->
			{#if successMessage}
				<div class="mb-6">
					<Alert type="success" message={successMessage} />
				</div>
			{/if}

			<!-- Error Message -->
			{#if formError}
				<div class="mb-6">
					<Alert type="error" message={formError} dismissible onDismiss={() => (formError = null)} />
				</div>
			{/if}

			<!-- Form Fields -->
			<form onsubmit={handleSubmit} novalidate>
				<!-- Username -->
				<Input
					id="username"
					name="username"
					type="text"
					label="Username"
					placeholder="Enter your username"
					required
					bind:value={username}
					error={usernameError}
					disabled={isSubmitting}
					autocomplete="username"
					onInput={handleUsernameInput}
					onBlur={handleUsernameBlur}
				/>

				{#if isUsernameChecking}
					<p class="text-sm text-gray-500 -mt-2 mb-4">Checking availability...</p>
				{/if}

				<!-- Password -->
				<Input
					id="password"
					name="password"
					type="password"
					label="Password"
					placeholder="Enter your password"
					required
					bind:value={password}
					error={passwordError}
					disabled={isSubmitting}
					autocomplete="new-password"
					onInput={handlePasswordInput}
					onBlur={handlePasswordBlur}
				/>

				<!-- Password requirements -->
				<div class="mb-4 -mt-2 text-xs text-gray-500 space-y-1">
					<p>Password must contain:</p>
					<ul class="list-disc list-inside ml-2">
						<li class={password.length >= 8 ? 'text-green-600' : ''}>At least 8 characters</li>
						<li class={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
							One uppercase letter
						</li>
						<li class={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
							One special character
						</li>
					</ul>
				</div>

				<!-- Confirm Password -->
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					label="Confirm Password"
					placeholder="Re-enter your password"
					required
					bind:value={confirmPassword}
					error={confirmPasswordError}
					disabled={isSubmitting}
					autocomplete="new-password"
					onInput={handleConfirmPasswordInput}
					onBlur={handleConfirmPasswordBlur}
				/>

				<!-- Submit Button -->
				<Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
					{#snippet children()}
						<span>Register</span>
					{/snippet}
				</Button>
			</form>

			<!-- Security Notice -->
			<div class="mt-6 text-center">
				<p class="text-xs text-gray-500">
					By registering, you agree to our
					<a href="/terms" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
					and
					<a href="/privacy" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
				</p>
			</div>
		</div>
	</div>
</div>
