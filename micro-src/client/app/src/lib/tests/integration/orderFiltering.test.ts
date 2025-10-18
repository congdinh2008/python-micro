/**
 * @module Tests/Integration
 * @description Integration tests for order history filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { orderStore, orders, orderFilters } from '$lib/application/stores/orderStore';
import type { Order } from '$lib/domain/entities/Order';
import { OrderStatus } from '$lib/domain/entities/Order';

// Mock the order service API
vi.mock('$lib/infrastructure/api/apiClient', () => {
const mockOrders: Order[] = [
{
id: 1,
user_id: 1,
product_id: 101,
product_name: 'Laptop Pro',
quantity: 1,
unit_price: 1200,
total_price: 1200,
status: OrderStatus.PENDING,
created_at: '2025-10-15T10:00:00Z',
updated_at: '2025-10-15T10:00:00Z'
},
{
id: 2,
user_id: 1,
product_id: 102,
product_name: 'Wireless Mouse',
quantity: 2,
unit_price: 25,
total_price: 50,
status: OrderStatus.CONFIRMED,
created_at: '2025-10-16T12:00:00Z',
updated_at: '2025-10-16T12:00:00Z'
},
{
id: 3,
user_id: 1,
product_id: 103,
product_name: 'USB-C Cable',
quantity: 3,
unit_price: 15,
total_price: 45,
status: OrderStatus.DELIVERED,
created_at: '2025-10-17T14:00:00Z',
updated_at: '2025-10-18T09:00:00Z'
}
];

return {
orderServiceApi: {
get: vi.fn().mockResolvedValue(mockOrders),
post: vi.fn(),
put: vi.fn(),
delete: vi.fn()
}
};
});

describe('Order Filtering Integration Tests', () => {
beforeEach(() => {
orderStore.reset();
});

describe('Status Filtering', () => {
it('should filter orders by pending status', async () => {
await orderStore.fetchOrders();
await orderStore.updateFilters({ status: OrderStatus.PENDING });

const filteredOrders = get(orders);
expect(filteredOrders.length).toBe(1);
expect(filteredOrders[0].status).toBe(OrderStatus.PENDING);
});

it('should filter orders by confirmed status', async () => {
await orderStore.fetchOrders();
await orderStore.updateFilters({ status: OrderStatus.CONFIRMED });

const filteredOrders = get(orders);
expect(filteredOrders.length).toBe(1);
expect(filteredOrders[0].status).toBe(OrderStatus.CONFIRMED);
});
});

describe('Clear Filters', () => {
it('should clear all filters and show all orders', async () => {
await orderStore.fetchOrders();
await orderStore.updateFilters({ status: OrderStatus.PENDING });

await orderStore.clearFilters();

const allOrders = get(orders);
expect(allOrders.length).toBe(3);
});

it('should reset filter state to defaults', async () => {
await orderStore.updateFilters({ status: OrderStatus.PENDING });
await orderStore.clearFilters();

const currentFilters = get(orderFilters);
expect(currentFilters.status).toBeUndefined();
expect(currentFilters.skip).toBe(0);
expect(currentFilters.limit).toBe(20);
});
});
});
