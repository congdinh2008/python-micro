"""
Product Repository - Data Access Layer for Product model
"""

from sqlalchemy.orm import Session

from app.models import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """
    Repository for Product model
    Provides product-specific database operations
    """

    def __init__(self, db: Session):
        """
        Initialize ProductRepository
        
        Args:
            db: Database session
        """
        super().__init__(Product, db)
