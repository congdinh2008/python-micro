"""
Redis Cache Manager
Handles caching operations for Product Service
"""

import json
import logging
from typing import Optional, Any
import redis
from redis.exceptions import RedisError

from app.config import settings

logger = logging.getLogger(__name__)


class CacheManager:
    """
    Redis cache manager for Product Service
    Handles caching with TTL and invalidation
    """

    def __init__(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5,
            )
            # Test connection
            self.redis_client.ping()
            logger.info(
                f"✅ Redis connected successfully at {settings.REDIS_HOST}:{settings.REDIS_PORT}"
            )
        except RedisError as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            self.redis_client = None

    def _get_product_key(self, product_id: int) -> str:
        """
        Generate cache key for product
        
        Args:
            product_id: Product ID
            
        Returns:
            Cache key string
        """
        return f"product:{product_id}"

    def get_product(self, product_id: int) -> Optional[dict]:
        """
        Get product from cache
        
        Args:
            product_id: Product ID
            
        Returns:
            Product data dict or None if not in cache
        """
        if not self.redis_client:
            return None

        try:
            key = self._get_product_key(product_id)
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.info(f"✅ Cache HIT for product ID: {product_id}")
                return json.loads(cached_data)
            
            logger.info(f"❌ Cache MISS for product ID: {product_id}")
            return None
        except RedisError as e:
            logger.error(f"Redis GET error for product {product_id}: {e}")
            return None

    def set_product(self, product_id: int, product_data: dict, ttl: Optional[int] = None) -> bool:
        """
        Store product in cache with TTL
        
        Args:
            product_id: Product ID
            product_data: Product data to cache
            ttl: Time to live in seconds (default from settings)
            
        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            key = self._get_product_key(product_id)
            ttl = ttl or settings.CACHE_TTL
            
            # Convert datetime objects to ISO format strings for JSON serialization
            serializable_data = self._prepare_for_json(product_data)
            
            self.redis_client.setex(
                key,
                ttl,
                json.dumps(serializable_data)
            )
            logger.info(f"✅ Cached product ID: {product_id} with TTL: {ttl}s")
            return True
        except (RedisError, TypeError, ValueError) as e:
            logger.error(f"Redis SET error for product {product_id}: {e}")
            return False

    def invalidate_product(self, product_id: int) -> bool:
        """
        Invalidate (delete) product from cache
        
        Args:
            product_id: Product ID
            
        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            key = self._get_product_key(product_id)
            result = self.redis_client.delete(key)
            if result:
                logger.info(f"✅ Cache invalidated for product ID: {product_id}")
            return bool(result)
        except RedisError as e:
            logger.error(f"Redis DELETE error for product {product_id}: {e}")
            return False

    def clear_all(self) -> bool:
        """
        Clear all product caches
        
        Returns:
            True if successful, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            # Get all product keys
            keys = self.redis_client.keys("product:*")
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"✅ Cleared {len(keys)} product cache entries")
            return True
        except RedisError as e:
            logger.error(f"Redis CLEAR error: {e}")
            return False

    def _prepare_for_json(self, data: Any) -> Any:
        """
        Prepare data for JSON serialization
        Converts datetime objects to ISO format strings
        
        Args:
            data: Data to prepare
            
        Returns:
            JSON-serializable data
        """
        if isinstance(data, dict):
            return {
                key: self._prepare_for_json(value)
                for key, value in data.items()
            }
        elif isinstance(data, list):
            return [self._prepare_for_json(item) for item in data]
        elif hasattr(data, 'isoformat'):  # datetime objects
            return data.isoformat()
        else:
            return data

    def healthcheck(self) -> bool:
        """
        Check if Redis is healthy
        
        Returns:
            True if Redis is responsive, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            return self.redis_client.ping()
        except RedisError:
            return False


# Global cache manager instance
cache_manager = CacheManager()
