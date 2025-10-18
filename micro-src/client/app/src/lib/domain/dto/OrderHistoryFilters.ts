/**
 * @module Domain/DTO
 * @description Order history filter data transfer objects
 */

/**
 * Order history filters for querying orders
 */
export interface OrderHistoryFilters {
/**
 * Filter by order status
 * @example "pending", "confirmed", "shipped", "delivered", "cancelled"
 */
status?: string;

/**
 * Filter by date range [startDate, endDate]
 * ISO 8601 date strings
 */
dateRange?: [string, string];

/**
 * Pagination: number of records to skip
 */
skip?: number;

/**
 * Pagination: number of records to return
 */
limit?: number;
}

/**
 * Default filter values
 */
export const DEFAULT_ORDER_FILTERS: OrderHistoryFilters = {
status: undefined,
dateRange: undefined,
skip: 0,
limit: 20
};

/**
 * Available order status options for filtering
 */
export const ORDER_STATUS_OPTIONS = [
{ value: '', label: 'All Statuses' },
{ value: 'pending', label: 'Pending' },
{ value: 'confirmed', label: 'Confirmed' },
{ value: 'shipped', label: 'Shipped' },
{ value: 'delivered', label: 'Delivered' },
{ value: 'cancelled', label: 'Cancelled' }
] as const;
