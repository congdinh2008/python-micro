/**
 * @module Application/UseCases/__tests__
 * @description Unit tests for CheckoutUseCase
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CheckoutUseCase } from './CheckoutUseCase';
import type { IOrderRepository } from '$lib/domain/interfaces/IOrderRepository';
import type { CartItem } from '$lib/domain/entities/Cart';
import type { Order } from '$lib/domain/entities/Order';
import { ApiError } from '$lib/infrastructure/api/apiClient';

describe('CheckoutUseCase', () => {
	let checkoutUseCase: CheckoutUseCase;
	let mockOrderRepository: IOrderRepository;

	const mockCartItems: CartItem[] = [
		{
			id: 1,
			productId: 1,
			name: 'Product 1',
			price: 100,
			quantity: 2,
			maxStock: 10
		},
		{
			id: 2,
			productId: 2,
			name: 'Product 2',
			price: 50,
			quantity: 1,
			maxStock: 5
		}
	];

	const mockOrder: Order = {
		id: 1,
		user_id: 1,
		product_id: 1,
		product_name: 'Product 1',
		quantity: 2,
		unit_price: 100,
		total_price: 200,
		status: 'pending' as any,
		created_at: '2025-10-18T00:00:00Z',
		updated_at: '2025-10-18T00:00:00Z'
	};

	beforeEach(async () => {
		// Create mock repository
		mockOrderRepository = {
			create: vi.fn(),
			getById: vi.fn(),
			getAll: vi.fn(),
			updateStatus: vi.fn()
		};

		// Create use case instance
		checkoutUseCase = new CheckoutUseCase(mockOrderRepository);
	});

	afterEach(async () => {
		vi.clearAllMocks();
		// Use real timers and wait to clear rate limiting
		await new Promise((resolve) => setTimeout(resolve, 2500));
	});

	describe('execute', () => {
		it('should successfully checkout with valid cart items', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create).mockResolvedValue(mockOrder);

			// Act
			const result = await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(result.success).toBe(true);
			expect(result.orders).toHaveLength(2);
			expect(result.error).toBeUndefined();
			expect(mockOrderRepository.create).toHaveBeenCalledTimes(2);
		});

		it('should reject empty cart', async () => {
			// Act
			const result = await checkoutUseCase.execute([]);

			// Assert
			expect(result.success).toBe(false);
			expect(result.error).toContain('Cart must not be empty');
			expect(mockOrderRepository.create).not.toHaveBeenCalled();
		});

		it('should reject items with insufficient stock', async () => {
			// Arrange
			const invalidItems: CartItem[] = [
				{
					id: 1,
					productId: 1,
					name: 'Product 1',
					price: 100,
					quantity: 15, // exceeds maxStock
					maxStock: 10
				}
			];

			// Act
			const result = await checkoutUseCase.execute(invalidItems);

			// Assert
			expect(result.success).toBe(false);
			expect(result.error).toContain('Insufficient stock');
			expect(mockOrderRepository.create).not.toHaveBeenCalled();
		});

		it('should reject items with invalid quantity', async () => {
			// Arrange
			const invalidItems: CartItem[] = [
				{
					id: 1,
					productId: 1,
					name: 'Product 1',
					price: 100,
					quantity: 0, // invalid quantity
					maxStock: 10
				}
			];

			// Act
			const result = await checkoutUseCase.execute(invalidItems);

			// Assert
			expect(result.success).toBe(false);
			expect(result.error).toContain('greater than 0');
			expect(mockOrderRepository.create).not.toHaveBeenCalled();
		});

		it('should reject items with invalid price', async () => {
			// Arrange
			const invalidItems: CartItem[] = [
				{
					id: 1,
					productId: 1,
					name: 'Product 1',
					price: -10, // invalid price
					quantity: 2,
					maxStock: 10
				}
			];

			// Act
			const result = await checkoutUseCase.execute(invalidItems);

			// Assert
			expect(result.success).toBe(false);
			expect(result.error).toContain('Invalid price');
			expect(mockOrderRepository.create).not.toHaveBeenCalled();
		});

		it('should prevent double-submit', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create).mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve(mockOrder), 100))
			);

			// Act
			const promise1 = checkoutUseCase.execute(mockCartItems);
			const promise2 = checkoutUseCase.execute(mockCartItems); // double submit

			const [result1, result2] = await Promise.all([promise1, promise2]);

			// Assert
			// First request should succeed
			expect(result1.success).toBe(true);

			// Second request should be rejected
			expect(result2.success).toBe(false);
			expect(result2.error).toContain('already in progress');
		});

		it('should handle partial success when some items fail', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create)
				.mockResolvedValueOnce(mockOrder) // first item succeeds
				.mockRejectedValueOnce(new ApiError('Product not found', 404)); // second item fails

			// Act
			const result = await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(result.success).toBe(true);
			expect(result.orders).toHaveLength(1);
			expect(result.failedItems).toHaveLength(1);
			expect(result.error).toContain('failed to checkout');
		});

		it('should handle API errors gracefully', async () => {
			// Arrange
			const apiError = new ApiError('Product not found', 404);
			vi.mocked(mockOrderRepository.create).mockRejectedValue(apiError);

			// Act
			const result = await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(result.success).toBe(false);
			expect(result.error).toContain('Failed to create any orders');
			expect(result.failedItems).toHaveLength(2);
		});

		it('should handle network errors', async () => {
			// Arrange
			const networkError = new ApiError('Network error', undefined, 'network');
			vi.mocked(mockOrderRepository.create).mockRejectedValue(networkError);

			// Act
			const result = await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(result.success).toBe(false);
			expect(result.error).toContain('Failed to create any orders');
		});

		it('should enforce rate limiting between checkouts', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create).mockResolvedValue(mockOrder);

			// Act - First checkout
			const result1 = await checkoutUseCase.execute(mockCartItems);
			expect(result1.success).toBe(true);

			// Act - Second checkout immediately after (should be rate limited)
			const result2 = await checkoutUseCase.execute(mockCartItems);

			// Assert - Should be rate limited
			expect(result2.success).toBe(false);
			expect(result2.error).toContain('wait a moment');

			// Wait for rate limit to pass
			await new Promise((resolve) => setTimeout(resolve, 2500));

			// Act - Third checkout after rate limit
			const result3 = await checkoutUseCase.execute(mockCartItems);

			// Assert - Should succeed
			expect(result3.success).toBe(true);
		});

		it('should create orders with correct data', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create).mockResolvedValue(mockOrder);

			// Act
			await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(mockOrderRepository.create).toHaveBeenNthCalledWith(1, {
				product_id: 1,
				quantity: 2
			});
			expect(mockOrderRepository.create).toHaveBeenNthCalledWith(2, {
				product_id: 2,
				quantity: 1
			});
		});

		it('should return all created orders on complete success', async () => {
			// Arrange
			const mockOrder2: Order = { ...mockOrder, id: 2, product_id: 2 };
			vi.mocked(mockOrderRepository.create)
				.mockResolvedValueOnce(mockOrder)
				.mockResolvedValueOnce(mockOrder2);

			// Act
			const result = await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(result.success).toBe(true);
			expect(result.orders).toHaveLength(2);
			expect(result.orders?.[0].id).toBe(1);
			expect(result.orders?.[1].id).toBe(2);
			expect(result.failedItems).toBeUndefined();
			expect(result.error).toBeUndefined();
		});
	});

	describe('isCheckoutInProgress', () => {
		it('should return false initially', () => {
			// Assert
			expect(checkoutUseCase.isCheckoutInProgress()).toBe(false);
		});

		it('should return true during checkout', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create).mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve(mockOrder), 100))
			);

			// Act
			const promise = checkoutUseCase.execute(mockCartItems);

			// Assert - Should be in progress
			expect(checkoutUseCase.isCheckoutInProgress()).toBe(true);

			// Wait for completion
			await promise;

			// Assert - Should no longer be in progress
			expect(checkoutUseCase.isCheckoutInProgress()).toBe(false);
		});

		it('should return false after checkout completes', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create).mockResolvedValue(mockOrder);

			// Act
			await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(checkoutUseCase.isCheckoutInProgress()).toBe(false);
		});

		it('should return false after checkout fails', async () => {
			// Arrange
			vi.mocked(mockOrderRepository.create).mockRejectedValue(
				new ApiError('Network error', undefined, 'network')
			);

			// Act
			await checkoutUseCase.execute(mockCartItems);

			// Assert
			expect(checkoutUseCase.isCheckoutInProgress()).toBe(false);
		});
	});
});
