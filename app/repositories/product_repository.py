"""
Product Repository - Quản lý thao tác database cho Product
Kế thừa BaseRepository và thêm các phương thức đặc thù cho Product
"""

from typing import List
from sqlalchemy.orm import Session

from app.models import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """
    Repository cho Product model
    Cung cấp các phương thức để thao tác với bảng products
    """

    def __init__(self, db: Session):
        """
        Khởi tạo ProductRepository

        Args:
            db (Session): Database session
        """
        super().__init__(Product, db)

    def search_by_name(
        self,
        name: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """
        Tìm kiếm sản phẩm theo tên (case-insensitive)

        Args:
            name (str): Từ khóa tìm kiếm
            skip (int): Số records bỏ qua
            limit (int): Số lượng records tối đa

        Returns:
            List[Product]: List sản phẩm tìm được
        """
        return self.db.query(Product).filter(
            Product.name.ilike(f"%{name}%")
        ).offset(skip).limit(limit).all()

    def get_products_in_stock(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """
        Lấy các sản phẩm còn hàng trong kho (quantity > 0)

        Args:
            skip (int): Số records bỏ qua
            limit (int): Số lượng records tối đa

        Returns:
            List[Product]: List sản phẩm còn hàng
        """
        return self.db.query(Product).filter(
            Product.quantity > 0
        ).offset(skip).limit(limit).all()

    def get_products_by_price_range(
        self,
        min_price: float,
        max_price: float,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """
        Lấy sản phẩm trong khoảng giá

        Args:
            min_price (float): Giá tối thiểu
            max_price (float): Giá tối đa
            skip (int): Số records bỏ qua
            limit (int): Số lượng records tối đa

        Returns:
            List[Product]: List sản phẩm trong khoảng giá
        """
        return self.db.query(Product).filter(
            Product.price >= min_price,
            Product.price <= max_price
        ).offset(skip).limit(limit).all()
