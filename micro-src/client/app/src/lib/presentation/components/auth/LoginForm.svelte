<script lang="ts">
/**
 * @component LoginForm
 * @description User login form with validation, loading states, and brute-force protection
 */

import { authStore, authError, authLoading } from '$lib/application/stores/authStore';
import { loginSchema } from '$lib/domain/validation/loginSchema';
import Input from '../ui/Input.svelte';
import Button from '../ui/Button.svelte';
import Alert from '../ui/Alert.svelte';
import { goto } from '$app/navigation';
import { z } from 'zod';

// Props
interface Props {
/** Redirect path after successful login */
redirectTo?: string;
}

let { redirectTo = '/' }: Props = $props();

// Form state using Svelte 5 runes
let username = $state('');
let password = $state('');
let validationErrors = $state<{ username?: string; password?: string }>({});
let showPassword = $state(false);

// Derived states
let isSubmitting = $derived($authLoading);
let hasErrors = $derived(Object.keys(validationErrors).length > 0 || $authError !== null);
let canSubmit = $derived(!isSubmitting && username.length > 0 && password.length > 0);

/**
 * Validate form inputs
 */
function validateForm(): boolean {
validationErrors = {};

try {
loginSchema.parse({ username, password });
return true;
} catch (error) {
if (error instanceof z.ZodError) {
error.errors.forEach((err) => {
const field = err.path[0] as 'username' | 'password';
validationErrors[field] = err.message;
});
}
return false;
}
}

/**
 * Handle form submission
 */
async function handleSubmit(event: Event) {
event.preventDefault();

// Clear previous errors
authStore.clearError();
validationErrors = {};

// Validate inputs
if (!validateForm()) {
return;
}

try {
await authStore.login(username, password);

// Login successful - redirect
await goto(redirectTo);
} catch (error) {
// Error is handled by the store and displayed in UI
console.error('Login failed:', error);
}
}

/**
 * Handle input changes and clear field-specific errors
 */
function handleUsernameChange() {
if (validationErrors.username) {
validationErrors = { ...validationErrors, username: undefined };
}
authStore.clearError();
}

function handlePasswordChange() {
if (validationErrors.password) {
validationErrors = { ...validationErrors, password: undefined };
}
authStore.clearError();
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
showPassword = !showPassword;
}
</script>

<div class="login-form-container" data-testid="login-form">
<div class="login-form-header">
<h2 class="login-form-title">Sign In</h2>
<p class="login-form-subtitle">Welcome back! Please sign in to continue.</p>
</div>

{#if $authError}
<Alert type="error" message={$authError} />
{/if}

<form onsubmit={handleSubmit} novalidate class="login-form">
<!-- Username Input -->
<div class="form-group">
<Input
id="username"
name="username"
type="text"
label="Username"
bind:value={username}
error={validationErrors.username}
disabled={isSubmitting}
required
autocomplete="username"
placeholder="Enter your username"
oninput={handleUsernameChange}
aria-describedby={validationErrors.username ? 'username-error' : undefined}
/>
</div>

<!-- Password Input -->
<div class="form-group">
<div class="password-input-wrapper">
<Input
id="password"
name="password"
type={showPassword ? 'text' : 'password'}
label="Password"
bind:value={password}
error={validationErrors.password}
disabled={isSubmitting}
required
autocomplete="current-password"
placeholder="Enter your password"
oninput={handlePasswordChange}
aria-describedby={validationErrors.password ? 'password-error' : undefined}
/>
<button
type="button"
class="password-toggle"
onclick={togglePasswordVisibility}
aria-label={showPassword ? 'Hide password' : 'Show password'}
tabindex="0"
>
{#if showPassword}
<svg
class="icon"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
aria-hidden="true"
>
<path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
/>
</svg>
{:else}
<svg
class="icon"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
aria-hidden="true"
>
<path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
/>
<path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
/>
</svg>
{/if}
</button>
</div>
</div>

<!-- Submit Button -->
<Button
type="submit"
variant="primary"
disabled={!canSubmit}
loading={isSubmitting}
fullWidth
aria-label="Sign in to your account"
>
{isSubmitting ? 'Signing in...' : 'Sign In'}
</Button>

<!-- Additional Links -->
<div class="form-footer">
<p class="footer-text">
Don't have an account?
<a href="/auth/register" class="footer-link">Sign up</a>
</p>
</div>
</form>
</div>

<style>
.login-form-container {
width: 100%;
max-width: 400px;
margin: 0 auto;
}

.login-form-header {
text-align: center;
margin-bottom: 2rem;
}

.login-form-title {
font-size: 1.875rem;
font-weight: 700;
color: #111827;
margin-bottom: 0.5rem;
}

.login-form-subtitle {
font-size: 0.875rem;
color: #6b7280;
}

.login-form {
display: flex;
flex-direction: column;
gap: 1.5rem;
}

.form-group {
position: relative;
}

.password-input-wrapper {
position: relative;
}

.password-toggle {
position: absolute;
right: 0.75rem;
top: 2.5rem;
padding: 0.5rem;
background: none;
border: none;
cursor: pointer;
color: #6b7280;
transition: color 0.2s;
display: flex;
align-items: center;
justify-content: center;
}

.password-toggle:hover {
color: #111827;
}

.password-toggle:focus {
outline: 2px solid #3b82f6;
outline-offset: 2px;
border-radius: 0.25rem;
}

.icon {
width: 1.25rem;
height: 1.25rem;
}

.form-footer {
text-align: center;
margin-top: 1rem;
}

.footer-text {
font-size: 0.875rem;
color: #6b7280;
}

.footer-link {
color: #3b82f6;
text-decoration: none;
font-weight: 500;
transition: color 0.2s;
}

.footer-link:hover {
color: #2563eb;
text-decoration: underline;
}

.footer-link:focus {
outline: 2px solid #3b82f6;
outline-offset: 2px;
border-radius: 0.125rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
.login-form-container {
padding: 0 1rem;
}

.login-form-title {
font-size: 1.5rem;
}
}
</style>
