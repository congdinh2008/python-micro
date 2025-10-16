"""
CLI - Command Line Interface cho ứng dụng quản lý sản phẩm

Class này tuân thủ nguyên tắc:
- Single Responsibility: Chỉ xử lý tương tác với người dùng qua CLI
- Separation of Concerns: Không chứa business logic, chỉ gọi ProductService
"""

import sys
from product_manager.services import ProductService


class CLI:
    """
    Class xử lý giao diện dòng lệnh (Command Line Interface)

    Attributes:
        _service (ProductService): Service để xử lý business logic
    """

    def __init__(self):
        """Khởi tạo CLI với ProductService"""
        self._service = ProductService()

    def run(self):
        """
        Chạy ứng dụng CLI
        Hiển thị menu và xử lý các lựa chọn của người dùng
        """
        print("\n" + "=" * 60)
        print("CHÀO MỪNG ĐẾN VỚI ỨNG DỤNG QUẢN LÝ SẢN PHẨM".center(60))
        print("=" * 60)

        while True:
            self._display_menu()
            choice = self._get_input("\nNhập lựa chọn của bạn: ")

            if choice == "1":
                self._add_product_flow()
            elif choice == "2":
                self._display_products_flow()
            elif choice == "3":
                self._update_product_flow()
            elif choice == "4":
                self._delete_product_flow()
            elif choice == "5":
                self._exit_application()
                break
            else:
                print("❌ Lựa chọn không hợp lệ! Vui lòng chọn từ 1-5.")

            self._wait_for_enter()

    def _display_menu(self):
        """Hiển thị menu chính"""
        print("\n" + "-" * 60)
        print("MENU CHÍNH".center(60))
        print("-" * 60)
        print("1. ➕ Thêm sản phẩm mới")
        print("2. 📋 Hiển thị danh sách sản phẩm")
        print("3. ✏️  Cập nhật thông tin sản phẩm")
        print("4. 🗑️  Xóa sản phẩm")
        print("5. 🚪 Thoát chương trình")
        print("-" * 60)

    def _add_product_flow(self):
        """Luồng xử lý thêm sản phẩm mới"""
        print("\n" + "=" * 60)
        print("THÊM SẢN PHẨM MỚI".center(60))
        print("=" * 60)

        try:
            name = self._get_input("Nhập tên sản phẩm: ")
            if not name:
                print("❌ Tên sản phẩm không được để trống!")
                return

            price_str = self._get_input("Nhập giá sản phẩm (VNĐ): ")
            price = float(price_str)

            quantity_str = self._get_input("Nhập số lượng: ")
            quantity = int(quantity_str)

            product = self._service.add_product(name, price, quantity)
            print("\n✅ Thêm sản phẩm thành công!")
            print(f"   {product}")

        except ValueError as e:
            print(f"\n❌ Lỗi: {e}")
        except Exception as e:
            print(f"\n❌ Có lỗi xảy ra: {e}")

    def _display_products_flow(self):
        """Luồng xử lý hiển thị danh sách sản phẩm"""
        print("\n" + "=" * 60)
        print("DANH SÁCH SẢN PHẨM".center(60))
        print("=" * 60)

        products = self._service.get_all_products()

        if not products:
            print("\n📭 Chưa có sản phẩm nào trong danh sách.")
            return

        print(f"\nTổng số sản phẩm: {self._service.get_product_count()}")
        print(f"Tổng giá trị kho: {self._service.get_total_value():,.0f} VNĐ")
        print("\n" + "-" * 60)

        for product in products:
            print(product)

    def _update_product_flow(self):
        """Luồng xử lý cập nhật sản phẩm"""
        print("\n" + "=" * 60)
        print("CẬP NHẬT THÔNG TIN SẢN PHẨM".center(60))
        print("=" * 60)

        if self._service.get_product_count() == 0:
            print("\n📭 Chưa có sản phẩm nào để cập nhật.")
            return

        # Hiển thị danh sách sản phẩm hiện có
        print("\nDanh sách sản phẩm hiện có:")
        print("-" * 60)
        for product in self._service.get_all_products():
            print(product)
        print("-" * 60)

        try:
            # Nhập ID sản phẩm cần cập nhật
            product_id_str = self._get_input(
                "\nNhập ID sản phẩm cần cập nhật: ")
            product_id = int(product_id_str)

            # Tìm sản phẩm
            product = self._service.find_product_by_id(product_id)
            if not product:
                print(f"\n❌ Không tìm thấy sản phẩm có ID: {product_id}")
                return

            print(f"\nThông tin hiện tại: {product}")
            print("\n💡 Để giữ nguyên giá trị, nhấn Enter để bỏ qua")

            # Nhập thông tin mới
            name = self._get_input(f"Tên mới (hiện tại: {product.name}): ")
            name = name if name else None

            price_str = self._get_input(
                f"Giá mới (hiện tại: {product.price:,.0f} VNĐ): "
            )
            price = float(price_str) if price_str else None

            quantity_str = self._get_input(
                f"Số lượng mới (hiện tại: {product.quantity}): "
            )
            quantity = int(quantity_str) if quantity_str else None

            # Cập nhật
            if self._service.update_product(product_id, name, price, quantity):
                updated_product = self._service.find_product_by_id(product_id)
                print("\n✅ Cập nhật sản phẩm thành công!")
                print(f"   {updated_product}")
            else:
                print("\n❌ Không thể cập nhật sản phẩm!")

        except ValueError as e:
            print(f"\n❌ Lỗi: {e}")
        except Exception as e:
            print(f"\n❌ Có lỗi xảy ra: {e}")

    def _delete_product_flow(self):
        """Luồng xử lý xóa sản phẩm"""
        print("\n" + "=" * 60)
        print("XÓA SẢN PHẨM".center(60))
        print("=" * 60)

        if self._service.get_product_count() == 0:
            print("\n📭 Chưa có sản phẩm nào để xóa.")
            return

        # Hiển thị danh sách sản phẩm hiện có
        print("\nDanh sách sản phẩm hiện có:")
        print("-" * 60)
        for product in self._service.get_all_products():
            print(product)
        print("-" * 60)

        try:
            product_id_str = self._get_input("\nNhập ID sản phẩm cần xóa: ")
            product_id = int(product_id_str)

            # Tìm sản phẩm để hiển thị trước khi xóa
            product = self._service.find_product_by_id(product_id)
            if not product:
                print(f"\n❌ Không tìm thấy sản phẩm có ID: {product_id}")
                return

            # Xác nhận xóa
            print(f"\nSản phẩm sẽ bị xóa: {product}")
            confirm = self._get_input("Bạn có chắc chắn muốn xóa? (y/n): ")

            if confirm.lower() in ['y', 'yes', 'có']:
                if self._service.delete_product(product_id):
                    print("\n✅ Đã xóa sản phẩm thành công!")
                else:
                    print("\n❌ Không thể xóa sản phẩm!")
            else:
                print("\n🚫 Đã hủy thao tác xóa.")

        except ValueError as e:
            print(f"\n❌ Lỗi: {e}")
        except Exception as e:
            print(f"\n❌ Có lỗi xảy ra: {e}")

    def _exit_application(self):
        """Thoát ứng dụng"""
        print("\n" + "=" * 60)
        print("CẢM ƠN BẠN ĐÃ SỬ DỤNG ỨNG DỤNG!".center(60))
        print("HẸN GẶP LẠI! 👋".center(60))
        print("=" * 60 + "\n")

    @staticmethod
    def _get_input(prompt: str) -> str:
        """
        Lấy input từ người dùng

        Args:
            prompt (str): Thông điệp hiển thị khi yêu cầu input

        Returns:
            str: Chuỗi input từ người dùng (đã loại bỏ khoảng trắng thừa)
        """
        try:
            return input(prompt).strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n🚫 Đã hủy thao tác. Đang thoát chương trình...")
            sys.exit(0)

    @staticmethod
    def _wait_for_enter():
        """Đợi người dùng nhấn Enter để tiếp tục"""
        try:
            input("\n⏎ Nhấn Enter để tiếp tục...")
        except (KeyboardInterrupt, EOFError):
            print("\n\n🚫 Đã hủy thao tác. Đang thoát chương trình...")
            sys.exit(0)
