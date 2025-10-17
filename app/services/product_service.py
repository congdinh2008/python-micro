"""
Product Service - Business Logic cho Product Management
Xử lý các thao tác CRUD với sản phẩm
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import ProductCreate, ProductUpdate
from app.repositories import ProductRepository


class ProductService:
    """
    Service class xử lý product business logic
    Sử dụng ProductRepository để thao tác với database
    """

    def __init__(self, db: Session):
        """
        Khởi tạo ProductService

        Args:
            db (Session): Database session
        """
        self.db = db
        self.product_repository = ProductRepository(db)

    def create_product(self, product_data: ProductCreate) -> Product:
        """
        Tạo sản phẩm mới

        Args:
            product_data (ProductCreate): Dữ liệu sản phẩm mới

        Returns:
            Product: Sản phẩm vừa được tạo
        """
        product_dict = product_data.model_dump()
        return self.product_repository.create(product_dict)

    def get_product_by_id(self, product_id: int) -> Optional[Product]:
        """
        Lấy sản phẩm theo ID

        Args:
            product_id (int): ID của sản phẩm

        Returns:
            Optional[Product]: Sản phẩm nếu tìm thấy, None nếu không
        """
        return self.product_repository.get_by_id(product_id)

    def get_all_products(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """
        Lấy danh sách tất cả sản phẩm với pagination

        Args:
            skip (int): Số sản phẩm bỏ qua (offset)
            limit (int): Số lượng sản phẩm tối đa trả về

        Returns:
            List[Product]: Danh sách sản phẩm
        """
        return self.product_repository.get_all(skip=skip, limit=limit)

    def update_product(
        self,
        product_id: int,
        product_data: ProductUpdate
    ) -> Optional[Product]:
        """
        Cập nhật sản phẩm

        Args:
            product_id (int): ID của sản phẩm cần cập nhật
            product_data (ProductUpdate): Dữ liệu cần cập nhật

        Returns:
            Optional[Product]: Sản phẩm đã cập nhật nếu tìm thấy, None nếu không
        """
        # Chỉ lấy các fields không phải None
        update_dict = product_data.model_dump(exclude_unset=True)

        if not update_dict:
            # Không có gì để update
            return self.product_repository.get_by_id(product_id)

        return self.product_repository.update(product_id, update_dict)

    def delete_product(self, product_id: int) -> bool:
        """
        Xóa sản phẩm

        Args:
            product_id (int): ID của sản phẩm cần xóa

        Returns:
            bool: True nếu xóa thành công, False nếu không tìm thấy
        """
        return self.product_repository.delete(product_id)

    def search_products_by_name(
        self,
        name: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """
        Tìm kiếm sản phẩm theo tên

        Args:
            name (str): Từ khóa tìm kiếm
            skip (int): Số sản phẩm bỏ qua
            limit (int): Số lượng sản phẩm tối đa

        Returns:
            List[Product]: Danh sách sản phẩm tìm được
        """
        return self.product_repository.search_by_name(
            name=name,
            skip=skip,
            limit=limit
        )

    def get_products_in_stock(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Product]:
        """
        Lấy các sản phẩm còn hàng

        Args:
            skip (int): Số sản phẩm bỏ qua
            limit (int): Số lượng sản phẩm tối đa

        Returns:
            List[Product]: Danh sách sản phẩm còn hàng
        """
        return self.product_repository.get_products_in_stock(
            skip=skip,
            limit=limit
        )

    def count_products(self) -> int:
        """
        Đếm tổng số sản phẩm

        Returns:
            int: Số lượng sản phẩm
        """
        return self.product_repository.count()
