"""
Product Service - Business Logic for Product Management
Handles product CRUD operations
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import ProductCreate, ProductUpdate
from app.repositories import ProductRepository


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
        Get product by ID
        
        Args:
            product_id: Product ID
            
        Returns:
            Product if found, None otherwise
        """
        return self.product_repository.get_by_id(product_id)

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
        Update product
        
        Args:
            product_id: Product ID
            product_data: Product update data
            
        Returns:
            Updated product or None if not found
        """
        # Only include fields that were actually provided
        update_dict = product_data.model_dump(exclude_unset=True)
        return self.product_repository.update(product_id, update_dict)

    def delete_product(self, product_id: int) -> bool:
        """
        Delete product
        
        Args:
            product_id: Product ID
            
        Returns:
            True if deleted, False if not found
        """
        return self.product_repository.delete(product_id)
