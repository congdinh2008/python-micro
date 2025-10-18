/**
 * @module Infrastructure/Cache
 * @description Cache manager with stale-while-revalidate pattern
 */

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
	data: T;
	timestamp: number;
	staleAt: number;
	expiresAt: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
	/**
	 * Time in milliseconds before cache is considered stale
	 * During this period, cached data is returned immediately
	 */
	staleTime?: number;

	/**
	 * Time in milliseconds before cache expires completely
	 * After this period, cache is deleted and fresh data is fetched
	 */
	cacheTime?: number;
}

/**
 * Cache manager for client-side caching with stale-while-revalidate pattern
 */
export class CacheManager {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private cache: Map<string, CacheEntry<any>> = new Map();
	private defaultStaleTime = 5 * 60 * 1000; // 5 minutes
	private defaultCacheTime = 10 * 60 * 1000; // 10 minutes

	/**
	 * Get data from cache
	 * @param key - Cache key
	 * @returns Cached data or null if not found or expired
	 */
	get<T>(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// Check if cache has expired completely
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return null;
		}

		return entry.data as T;
	}

	/**
	 * Check if cached data is stale but still valid
	 * @param key - Cache key
	 * @returns true if data is stale but not expired
	 */
	isStale(key: string): boolean {
		const entry = this.cache.get(key);

		if (!entry) {
			return false;
		}

		const now = Date.now();

		return now > entry.staleAt && now <= entry.expiresAt;
	}

	/**
	 * Set data in cache
	 * @param key - Cache key
	 * @param data - Data to cache
	 * @param config - Cache configuration
	 */
	set<T>(key: string, data: T, config?: CacheConfig): void {
		const now = Date.now();
		const staleTime = config?.staleTime ?? this.defaultStaleTime;
		const cacheTime = config?.cacheTime ?? this.defaultCacheTime;

		this.cache.set(key, {
			data,
			timestamp: now,
			staleAt: now + staleTime,
			expiresAt: now + cacheTime
		});
	}

	/**
	 * Invalidate cache entry
	 * @param key - Cache key
	 */
	invalidate(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * Invalidate all cache entries matching pattern
	 * @param pattern - RegExp or string pattern to match keys
	 */
	invalidatePattern(pattern: string | RegExp): void {
		const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Clear all cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Remove expired entries
	 */
	cleanup(): void {
		const now = Date.now();

		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiresAt) {
				this.cache.delete(key);
			}
		}
	}
}

/**
 * Global cache manager instance
 */
export const cacheManager = new CacheManager();

// Cleanup expired cache every 5 minutes
if (typeof window !== 'undefined') {
	setInterval(() => {
		cacheManager.cleanup();
	}, 5 * 60 * 1000);
}
