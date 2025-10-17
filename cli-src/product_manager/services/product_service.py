"""
Product Service - Xử lý business logic cho quản lý sản phẩm

Class này tuân thủ nguyên tắc:
- Single Responsibility: Chỉ quản lý các thao tác CRUD với danh sách sản phẩm
- Encapsulation: Dữ liệu được lưu trữ private, chỉ truy cập qua methods
"""

from typing import List, Optional
from product_manager.models import Product


class ProductService:
    """
    Service class để quản lý danh sách sản phẩm

    Attributes:
        _products (List[Product]): Danh sách sản phẩm (lưu in-memory)
    """

    def __init__(self):
        """Khởi tạo ProductService với danh sách rỗng"""
        self._products: List[Product] = []

    def add_product(self, name: str, price: float, quantity: int) -> Product:
        """
        Thêm một sản phẩm mới vào danh sách

        Args:
            name (str): Tên sản phẩm
            price (float): Giá sản phẩm
            quantity (int): Số lượng sản phẩm

        Returns:
            Product: Sản phẩm vừa được tạo

        Raises:
            ValueError: Nếu dữ liệu không hợp lệ
        """
        product = Product(name, price, quantity)
        self._products.append(product)
        return product

    def get_all_products(self) -> List[Product]:
        """
        Lấy danh sách tất cả sản phẩm

        Returns:
            List[Product]: Danh sách sản phẩm (copy để tránh modification)
        """
        return self._products.copy()

    def find_product_by_id(self, product_id: int) -> Optional[Product]:
        """
        Tìm sản phẩm theo ID

        Args:
            product_id (int): ID của sản phẩm cần tìm

        Returns:
            Optional[Product]: Sản phẩm nếu tìm thấy, None nếu không tìm thấy
        """
        for product in self._products:
            if product.id == product_id:
                return product
        return None

    def find_products_by_name(self, name: str) -> List[Product]:
        """
        Tìm các sản phẩm theo tên (tìm kiếm không phân biệt hoa thường)

        Args:
            name (str): Tên sản phẩm cần tìm

        Returns:
            List[Product]: Danh sách sản phẩm có tên chứa từ khóa tìm kiếm
        """
        name_lower = name.lower()
        return [p for p in self._products if name_lower in p.name.lower()]

    def update_product(
            self, product_id: int, name: Optional[str] = None,
            price: Optional[float] = None,
            quantity: Optional[int] = None) -> bool:
        """
        Cập nhật thông tin sản phẩm

        Args:
            product_id (int): ID của sản phẩm cần cập nhật
            name (Optional[str]): Tên mới (None nếu không thay đổi)
            price (Optional[float]): Giá mới (None nếu không thay đổi)
            quantity (Optional[int]): Số lượng mới (None nếu không thay đổi)

        Returns:
            bool: True nếu cập nhật thành công, False nếu không tìm thấy sản phẩm

        Raises:
            ValueError: Nếu dữ liệu mới không hợp lệ
        """
        product = self.find_product_by_id(product_id)
        if not product:
            return False

        # Cập nhật các thuộc tính nếu được cung cấp
        if name is not None:
            product.name = name
        if price is not None:
            product.price = price
        if quantity is not None:
            product.quantity = quantity

        return True

    def delete_product(self, product_id: int) -> bool:
        """
        Xóa sản phẩm khỏi danh sách

        Args:
            product_id (int): ID của sản phẩm cần xóa

        Returns:
            bool: True nếu xóa thành công, False nếu không tìm thấy sản phẩm
        """
        product = self.find_product_by_id(product_id)
        if product:
            self._products.remove(product)
            return True
        return False

    def get_product_count(self) -> int:
        """
        Lấy số lượng sản phẩm trong danh sách

        Returns:
            int: Số lượng sản phẩm
        """
        return len(self._products)

    def get_total_value(self) -> float:
        """
        Tính tổng giá trị tất cả sản phẩm trong kho

        Returns:
            float: Tổng giá trị (giá * số lượng của tất cả sản phẩm)
        """
        return sum(p.price * p.quantity for p in self._products)
