"""
Order Repository - Data access for orders
"""

from typing import List
from sqlalchemy.orm import Session

from app.models import Order
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """
    Repository for Order model
    Provides data access methods for orders
    """

    def __init__(self, db: Session):
        """
        Initialize OrderRepository
        
        Args:
            db: Database session
        """
        super().__init__(Order, db)

    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """
        Get orders by user ID
        
        Args:
            user_id: User ID
            skip: Number of orders to skip
            limit: Maximum number of orders to return
            
        Returns:
            List of orders
        """
        return (
            self.db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_product_id(self, product_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """
        Get orders by product ID
        
        Args:
            product_id: Product ID
            skip: Number of orders to skip
            limit: Maximum number of orders to return
            
        Returns:
            List of orders
        """
        return (
            self.db.query(Order)
            .filter(Order.product_id == product_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
