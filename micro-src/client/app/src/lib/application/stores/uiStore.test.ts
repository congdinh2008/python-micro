/**
 * @module Tests/Application/Stores
 * @description Unit tests for UI store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { uiStore } from '$lib/application/stores/uiStore';

describe('UIStore', () => {
	beforeEach(() => {
		// Reset store before each test
		uiStore.reset();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('Toast Management', () => {
		it('should show a toast notification', () => {
			const toastId = uiStore.showToast({
				type: 'success',
				message: 'Test message'
			});

			const state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
			expect(state.toasts[0].id).toBe(toastId);
			expect(state.toasts[0].type).toBe('success');
			expect(state.toasts[0].message).toBe('Test message');
		});

		it('should auto-dismiss toast after duration', () => {
			uiStore.showToast({
				type: 'info',
				message: 'Auto dismiss',
				duration: 3000
			});

			let state = get(uiStore);
			expect(state.toasts).toHaveLength(1);

			// Fast-forward time
			vi.advanceTimersByTime(3000);

			state = get(uiStore);
			expect(state.toasts).toHaveLength(0);
		});

		it('should not auto-dismiss toast with duration 0', () => {
			uiStore.showToast({
				type: 'warning',
				message: 'No auto dismiss',
				duration: 0
			});

			let state = get(uiStore);
			expect(state.toasts).toHaveLength(1);

			// Fast-forward time
			vi.advanceTimersByTime(10000);

			state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
		});

		it('should dismiss a specific toast', () => {
			const id1 = uiStore.showToast({ type: 'success', message: 'Toast 1', duration: 0 });
			const id2 = uiStore.showToast({ type: 'info', message: 'Toast 2', duration: 0 });

			let state = get(uiStore);
			expect(state.toasts).toHaveLength(2);

			uiStore.dismissToast(id1);

			state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
			expect(state.toasts[0].id).toBe(id2);
		});

		it('should clear all toasts', () => {
			uiStore.showToast({ type: 'success', message: 'Toast 1', duration: 0 });
			uiStore.showToast({ type: 'info', message: 'Toast 2', duration: 0 });
			uiStore.showToast({ type: 'error', message: 'Toast 3', duration: 0 });

			let state = get(uiStore);
			expect(state.toasts).toHaveLength(3);

			uiStore.clearToasts();

			state = get(uiStore);
			expect(state.toasts).toHaveLength(0);
		});

		it('should show success toast with helper method', () => {
			uiStore.showSuccess('Success message', 'Success Title');

			const state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
			expect(state.toasts[0].type).toBe('success');
			expect(state.toasts[0].message).toBe('Success message');
			expect(state.toasts[0].title).toBe('Success Title');
		});

		it('should show error toast with longer duration', () => {
			uiStore.showError('Error message');

			const state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
			expect(state.toasts[0].type).toBe('error');
			expect(state.toasts[0].duration).toBe(7000);
		});

		it('should show warning toast with helper method', () => {
			uiStore.showWarning('Warning message');

			const state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
			expect(state.toasts[0].type).toBe('warning');
		});

		it('should show info toast with helper method', () => {
			uiStore.showInfo('Info message');

			const state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
			expect(state.toasts[0].type).toBe('info');
		});

		it('should queue multiple toasts', () => {
			uiStore.showSuccess('Toast 1');
			uiStore.showError('Toast 2');
			uiStore.showWarning('Toast 3');

			const state = get(uiStore);
			expect(state.toasts).toHaveLength(3);
		});
	});

	describe('Mobile Menu', () => {
		it('should toggle mobile menu', () => {
			let state = get(uiStore);
			expect(state.isMobileMenuOpen).toBe(false);

			uiStore.toggleMobileMenu();
			state = get(uiStore);
			expect(state.isMobileMenuOpen).toBe(true);

			uiStore.toggleMobileMenu();
			state = get(uiStore);
			expect(state.isMobileMenuOpen).toBe(false);
		});

		it('should close mobile menu', () => {
			uiStore.toggleMobileMenu();
			let state = get(uiStore);
			expect(state.isMobileMenuOpen).toBe(true);

			uiStore.closeMobileMenu();
			state = get(uiStore);
			expect(state.isMobileMenuOpen).toBe(false);
		});
	});

	describe('Cart Drawer', () => {
		it('should toggle cart drawer', () => {
			let state = get(uiStore);
			expect(state.isCartDrawerOpen).toBe(false);

			uiStore.toggleCartDrawer();
			state = get(uiStore);
			expect(state.isCartDrawerOpen).toBe(true);

			uiStore.toggleCartDrawer();
			state = get(uiStore);
			expect(state.isCartDrawerOpen).toBe(false);
		});

		it('should close cart drawer', () => {
			uiStore.toggleCartDrawer();
			let state = get(uiStore);
			expect(state.isCartDrawerOpen).toBe(true);

			uiStore.closeCartDrawer();
			state = get(uiStore);
			expect(state.isCartDrawerOpen).toBe(false);
		});
	});

	describe('Loading State', () => {
		it('should start loading', () => {
			uiStore.startLoading('Loading data...', 'fetch-products');

			const state = get(uiStore);
			expect(state.loading.isLoading).toBe(true);
			expect(state.loading.message).toBe('Loading data...');
			expect(state.loading.operationId).toBe('fetch-products');
		});

		it('should stop loading', () => {
			uiStore.startLoading('Loading...');
			let state = get(uiStore);
			expect(state.loading.isLoading).toBe(true);

			uiStore.stopLoading();
			state = get(uiStore);
			expect(state.loading.isLoading).toBe(false);
			expect(state.loading.message).toBeUndefined();
		});

		it('should set custom loading state', () => {
			uiStore.setLoading({
				isLoading: true,
				message: 'Custom loading',
				operationId: 'custom-op'
			});

			const state = get(uiStore);
			expect(state.loading.isLoading).toBe(true);
			expect(state.loading.message).toBe('Custom loading');
			expect(state.loading.operationId).toBe('custom-op');
		});
	});

	describe('Error State', () => {
		it('should show error state', () => {
			uiStore.showErrorState('Something went wrong', 'ERR_500', true);

			const state = get(uiStore);
			expect(state.error.hasError).toBe(true);
			expect(state.error.message).toBe('Something went wrong');
			expect(state.error.code).toBe('ERR_500');
			expect(state.error.retryable).toBe(true);
		});

		it('should clear error state', () => {
			uiStore.showErrorState('Error message');
			let state = get(uiStore);
			expect(state.error.hasError).toBe(true);

			uiStore.clearError();
			state = get(uiStore);
			expect(state.error.hasError).toBe(false);
			expect(state.error.message).toBeUndefined();
		});

		it('should set custom error state', () => {
			uiStore.setError({
				hasError: true,
				message: 'Custom error',
				code: 'CUSTOM_ERR'
			});

			const state = get(uiStore);
			expect(state.error.hasError).toBe(true);
			expect(state.error.message).toBe('Custom error');
			expect(state.error.code).toBe('CUSTOM_ERR');
		});
	});

	describe('Reset', () => {
		it('should reset all state to initial values', () => {
			// Modify state
			uiStore.showToast({ type: 'success', message: 'Test', duration: 0 });
			uiStore.toggleMobileMenu();
			uiStore.toggleCartDrawer();
			uiStore.startLoading('Loading...');
			uiStore.showErrorState('Error');

			let state = get(uiStore);
			expect(state.toasts).toHaveLength(1);
			expect(state.isMobileMenuOpen).toBe(true);
			expect(state.isCartDrawerOpen).toBe(true);
			expect(state.loading.isLoading).toBe(true);
			expect(state.error.hasError).toBe(true);

			// Reset
			uiStore.reset();

			state = get(uiStore);
			expect(state.toasts).toHaveLength(0);
			expect(state.isMobileMenuOpen).toBe(false);
			expect(state.isCartDrawerOpen).toBe(false);
			expect(state.loading.isLoading).toBe(false);
			expect(state.error.hasError).toBe(false);
		});
	});
});
