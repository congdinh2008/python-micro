/**
 * @module Infrastructure/Cache
 * @description Tests for cache manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from './cacheManager';

describe('CacheManager', () => {
	let cacheManager: CacheManager;

	beforeEach(() => {
		cacheManager = new CacheManager();
	});

	describe('get and set', () => {
		it('should store and retrieve data', () => {
			const data = { id: 1, name: 'Test' };
			cacheManager.set('test-key', data);

			const result = cacheManager.get('test-key');
			expect(result).toEqual(data);
		});

		it('should return null for non-existent key', () => {
			const result = cacheManager.get('non-existent');
			expect(result).toBeNull();
		});

		it('should return null for expired data', () => {
			const data = { id: 1, name: 'Test' };
			cacheManager.set('test-key', data, {
				staleTime: 0,
				cacheTime: 1 // 1ms cache time
			});

			// Wait for cache to expire
			return new Promise((resolve) => {
				setTimeout(() => {
					const result = cacheManager.get('test-key');
					expect(result).toBeNull();
					resolve(undefined);
				}, 10);
			});
		});
	});

	describe('isStale', () => {
		it('should return false for fresh data', () => {
			const data = { id: 1, name: 'Test' };
			cacheManager.set('test-key', data, {
				staleTime: 1000,
				cacheTime: 2000
			});

			const isStale = cacheManager.isStale('test-key');
			expect(isStale).toBe(false);
		});

		it('should return false for non-existent key', () => {
			const isStale = cacheManager.isStale('non-existent');
			expect(isStale).toBe(false);
		});
	});

	describe('invalidate', () => {
		it('should remove cached data', () => {
			const data = { id: 1, name: 'Test' };
			cacheManager.set('test-key', data);

			cacheManager.invalidate('test-key');

			const result = cacheManager.get('test-key');
			expect(result).toBeNull();
		});
	});

	describe('invalidatePattern', () => {
		it('should remove all matching keys', () => {
			cacheManager.set('products:1', { id: 1 });
			cacheManager.set('products:2', { id: 2 });
			cacheManager.set('users:1', { id: 1 });

			cacheManager.invalidatePattern(/^products:/);

			expect(cacheManager.get('products:1')).toBeNull();
			expect(cacheManager.get('products:2')).toBeNull();
			expect(cacheManager.get('users:1')).toEqual({ id: 1 });
		});
	});

	describe('clear', () => {
		it('should remove all cached data', () => {
			cacheManager.set('key1', { id: 1 });
			cacheManager.set('key2', { id: 2 });

			cacheManager.clear();

			expect(cacheManager.get('key1')).toBeNull();
			expect(cacheManager.get('key2')).toBeNull();
		});
	});
});
