"""
Product Model - SQLAlchemy Model cho bảng products
Quản lý thông tin sản phẩm
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.orm import validates

from app.database import Base


class Product(Base):
    """
    Product model để lưu trữ thông tin sản phẩm

    Attributes:
        id (int): Primary key, auto-increment
        name (str): Tên sản phẩm, không được null
        description (str): Mô tả sản phẩm (optional)
        price (Decimal): Giá sản phẩm, phải > 0 (precision=10, scale=2)
        quantity (int): Số lượng trong kho, phải >= 0
        created_at (datetime): Thời gian tạo sản phẩm
        updated_at (datetime): Thời gian cập nhật cuối cùng
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
        """Validate giá sản phẩm phải > 0"""
        if value <= 0:
            raise ValueError("Giá sản phẩm phải lớn hơn 0")
        return value

    @validates('quantity')
    def validate_quantity(self, key, value):
        """Validate số lượng phải >= 0"""
        if value < 0:
            raise ValueError("Số lượng sản phẩm không được âm")
        return value

    def __repr__(self) -> str:
        """String representation của Product model"""
        return (
            f"<Product(id={self.id}, name='{self.name}', "
            f"price={self.price}, quantity={self.quantity})>"
        )
