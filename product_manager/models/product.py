"""
Product Model - Class đại diện cho một sản phẩm

Class này tuân thủ nguyên tắc:
- Encapsulation: Sử dụng private attributes và properties
- Single Responsibility: Chỉ quản lý thông tin của một sản phẩm
"""


class Product:
    """
    Class Product đại diện cho một sản phẩm trong hệ thống

    Attributes:
        _id (int): Mã định danh duy nhất của sản phẩm (tự động tăng)
        _name (str): Tên sản phẩm
        _price (float): Giá sản phẩm (phải > 0)
        _quantity (int): Số lượng sản phẩm trong kho (phải >= 0)
    """

    # Class variable để tự động tăng ID
    _next_id = 1

    def __init__(self, name: str, price: float, quantity: int):
        """
        Khởi tạo một sản phẩm mới

        Args:
            name (str): Tên sản phẩm
            price (float): Giá sản phẩm
            quantity (int): Số lượng sản phẩm

        Raises:
            ValueError: Nếu giá trị không hợp lệ
        """
        self._id = Product._next_id
        Product._next_id += 1

        # Sử dụng setter để validate
        self.name = name
        self.price = price
        self.quantity = quantity

    # Properties cho ID (read-only)
    @property
    def id(self) -> int:
        """Getter cho ID (không thể thay đổi sau khi tạo)"""
        return self._id

    # Properties cho Name
    @property
    def name(self) -> str:
        """Getter cho tên sản phẩm"""
        return self._name

    @name.setter
    def name(self, value: str):
        """
        Setter cho tên sản phẩm

        Args:
            value (str): Tên sản phẩm mới

        Raises:
            ValueError: Nếu tên rỗng hoặc chỉ chứa khoảng trắng
        """
        if not value or not value.strip():
            raise ValueError("Tên sản phẩm không được để trống")
        self._name = value.strip()

    # Properties cho Price
    @property
    def price(self) -> float:
        """Getter cho giá sản phẩm"""
        return self._price

    @price.setter
    def price(self, value: float):
        """
        Setter cho giá sản phẩm

        Args:
            value (float): Giá sản phẩm mới

        Raises:
            ValueError: Nếu giá <= 0
        """
        try:
            price_value = float(value)
            if price_value <= 0:
                raise ValueError("Giá sản phẩm phải lớn hơn 0")
            self._price = price_value
        except (TypeError, ValueError) as e:
            raise ValueError(f"Giá sản phẩm không hợp lệ: {e}")

    # Properties cho Quantity
    @property
    def quantity(self) -> int:
        """Getter cho số lượng sản phẩm"""
        return self._quantity

    @quantity.setter
    def quantity(self, value: int):
        """
        Setter cho số lượng sản phẩm

        Args:
            value (int): Số lượng sản phẩm mới

        Raises:
            ValueError: Nếu số lượng < 0
        """
        try:
            quantity_value = int(value)
            if quantity_value < 0:
                raise ValueError("Số lượng sản phẩm không được âm")
            self._quantity = quantity_value
        except (TypeError, ValueError) as e:
            raise ValueError(f"Số lượng sản phẩm không hợp lệ: {e}")

    def to_dict(self) -> dict:
        """
        Chuyển đổi sản phẩm thành dictionary

        Returns:
            dict: Dictionary chứa thông tin sản phẩm
        """
        return {
            'id': self._id,
            'name': self._name,
            'price': self._price,
            'quantity': self._quantity
        }

    def __str__(self) -> str:
        """
        Trả về chuỗi mô tả sản phẩm

        Returns:
            str: Chuỗi mô tả sản phẩm
        """
        return (f"ID: {self._id} | Tên: {self._name} | "
                f"Giá: {self._price:,.0f} VNĐ | Số lượng: {self._quantity}")

    def __repr__(self) -> str:
        """
        Trả về chuỗi đại diện cho object (dùng cho debugging)

        Returns:
            str: Chuỗi đại diện object
        """
        return (f"Product(id={self._id}, name='{self._name}', "
                f"price={self._price}, quantity={self._quantity})")
