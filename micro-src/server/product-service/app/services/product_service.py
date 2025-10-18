"""
Product Service - Business Logic for Product Management
Handles product CRUD operations with Redis caching
"""

import logging
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import ProductCreate, ProductUpdate
from app.repositories import ProductRepository
from app.utils.cache import cache_manager

logger = logging.getLogger(__name__)


class ProductService:
    """
    Service class for product management logic
    Uses ProductRepository for database operations
    """

    def __init__(self, db: Session):
        """
        Initialize ProductService
        
        Args:
            db: Database session
        """
        self.db = db
        self.product_repository = ProductRepository(db)

    def get_all_products(self, skip: int = 0, limit: int = 100) -> List[Product]:
        """
        Get all products with pagination
        
        Args:
            skip: Number of products to skip
            limit: Maximum number of products to return
            
        Returns:
            List of products
        """
        return self.product_repository.get_all(skip=skip, limit=limit)

    def get_product_by_id(self, product_id: int) -> Optional[Product]:
        """
        Get product by ID with Redis caching
        
        Args:
            product_id: Product ID
            
        Returns:
            Product if found, None otherwise
        """
        # Try to get from cache first
        cached_product = cache_manager.get_product(product_id)
        if cached_product:
            logger.info(f"Returning cached product for ID: {product_id}")
            # Convert dict back to Product model
            product = Product(**cached_product)
            return product
        
        # If not in cache, get from database
        product = self.product_repository.get_by_id(product_id)
        
        # Cache the result if found
        if product:
            product_dict = {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": float(product.price),
                "quantity": product.quantity,
                "created_at": product.created_at,
                "updated_at": product.updated_at,
            }
            cache_manager.set_product(product_id, product_dict)
            logger.info(f"Cached product ID: {product_id} from database")
        
        return product

    def create_product(self, product_data: ProductCreate) -> Product:
        """
        Create new product
        
        Args:
            product_data: Product creation data
            
        Returns:
            Created product
        """
        product_dict = product_data.model_dump()
        return self.product_repository.create(product_dict)

    def update_product(
        self,
        product_id: int,
        product_data: ProductUpdate
    ) -> Optional[Product]:
        """
        Update product and invalidate cache
        
        Args:
            product_id: Product ID
            product_data: Product update data
            
        Returns:
            Updated product or None if not found
        """
        # Only include fields that were actually provided
        update_dict = product_data.model_dump(exclude_unset=True)
        product = self.product_repository.update(product_id, update_dict)
        
        # Invalidate cache after update
        if product:
            cache_manager.invalidate_product(product_id)
            logger.info(f"Invalidated cache for updated product ID: {product_id}")
        
        return product

    def delete_product(self, product_id: int) -> bool:
        """
        Delete product and invalidate cache
        
        Args:
            product_id: Product ID
            
        Returns:
            True if deleted, False if not found
        """
        success = self.product_repository.delete(product_id)
        
        # Invalidate cache after deletion
        if success:
            cache_manager.invalidate_product(product_id)
            logger.info(f"Invalidated cache for deleted product ID: {product_id}")
        
        return success
