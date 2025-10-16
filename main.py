"""
Main Entry Point - Điểm khởi đầu của ứng dụng Product Manager

Chạy file này để khởi động ứng dụng quản lý sản phẩm CLI
"""

from product_manager.ui import CLI


def main():
    """
    Hàm main - Khởi chạy ứng dụng
    """
    try:
        cli = CLI()
        cli.run()
    except Exception as e:
        print(f"\n❌ Lỗi không mong muốn: {e}")
        print("Vui lòng liên hệ với nhà phát triển để được hỗ trợ.")


if __name__ == "__main__":
    main()
