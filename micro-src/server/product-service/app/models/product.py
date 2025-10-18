"""
Product Model - SQLAlchemy Model for products table
Manages product information
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.orm import validates

from app.database import Base


class Product(Base):
    """
    Product model to store product information
    
    Attributes:
        id (int): Primary key, auto-increment
        name (str): Product name, not null
        description (str): Product description (optional)
        price (Decimal): Product price, must be > 0 (precision=10, scale=2)
        quantity (int): Stock quantity, must be >= 0
        created_at (datetime): Product creation time
        updated_at (datetime): Last update time
    """

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    # Use Numeric for monetary values to avoid floating-point precision issues
    price = Column(Numeric(precision=10, scale=2), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    @validates('price')
    def validate_price(self, key, value):
        """Validate product price must be > 0"""
        if value <= 0:
            raise ValueError("Giá sản phẩm phải lớn hơn 0")
        return value

    @validates('quantity')
    def validate_quantity(self, key, value):
        """Validate quantity must be >= 0"""
        if value < 0:
            raise ValueError("Số lượng sản phẩm không được âm")
        return value

    def __repr__(self) -> str:
        """String representation of Product model"""
        return (
            f"<Product(id={self.id}, name='{self.name}', "
            f"price={self.price}, quantity={self.quantity})>"
        )
