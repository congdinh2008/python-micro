# 📦 Ứng dụng Quản lý Sản phẩm CLI (Product Manager)

Ứng dụng quản lý sản phẩm dòng lệnh (Command Line Interface) được xây dựng bằng Python, áp dụng nguyên tắc OOP và SOLID principles.

## 🎯 Mục tiêu

- Thành thạo Python cơ bản và tư duy hướng đối tượng (OOP)
- Áp dụng nguyên tắc SOLID, đặc biệt là SRP (Single Responsibility Principle)
- Tổ chức code module hóa, dễ bảo trì và mở rộng

## ✨ Tính năng

- ✅ **Thêm sản phẩm mới**: Nhập tên, giá, và số lượng sản phẩm
- ✅ **Hiển thị danh sách sản phẩm**: Xem tất cả sản phẩm với thông tin chi tiết
- ✅ **Cập nhật sản phẩm**: Chỉnh sửa thông tin sản phẩm theo ID
- ✅ **Xóa sản phẩm**: Xóa sản phẩm khỏi danh sách với xác nhận
- ✅ **Thoát chương trình**: Đóng ứng dụng một cách an toàn

## 📁 Cấu trúc Project

```
python-micro/
├── product_manager/          # Package chính của ứng dụng
│   ├── __init__.py          # Module initialization
│   ├── models/              # Package chứa các model
│   │   ├── __init__.py
│   │   └── product.py       # Class Product - định nghĩa sản phẩm
│   ├── services/            # Package chứa business logic
│   │   ├── __init__.py
│   │   └── product_service.py  # Class ProductService - CRUD operations
│   └── ui/                  # Package chứa giao diện người dùng
│       ├── __init__.py
│       └── cli.py           # Class CLI - giao diện dòng lệnh
├── main.py                  # Entry point - điểm khởi chạy ứng dụng
└── README.md                # Tài liệu hướng dẫn
```

## 🏗️ Kiến trúc và Nguyên tắc

### 1. Single Responsibility Principle (SRP)

Mỗi class có một trách nhiệm duy nhất:

- **Product**: Chỉ quản lý thông tin của một sản phẩm
- **ProductService**: Chỉ xử lý business logic (CRUD operations)
- **CLI**: Chỉ xử lý tương tác với người dùng

### 2. Encapsulation (Đóng gói)

- Sử dụng private attributes (`_attribute`)
- Cung cấp properties với getter/setter để kiểm soát truy cập
- Validate dữ liệu trong setter

### 3. Separation of Concerns (Tách biệt mối quan tâm)

- Model layer: Định nghĩa cấu trúc dữ liệu
- Service layer: Xử lý logic nghiệp vụ
- UI layer: Tương tác với người dùng

### 4. In-Memory Storage

- Dữ liệu lưu trữ trong bộ nhớ (List)
- Không cần database hay file storage

## 🚀 Hướng dẫn Cài đặt và Chạy

### Yêu cầu

- Python 3.7 trở lên

### Các bước thực hiện

1. **Clone repository**:
   ```bash
   git clone https://github.com/congdinh2008/python-micro.git
   cd python-micro
   ```

2. **Chạy ứng dụng**:
   ```bash
   python main.py
   ```

   Hoặc trên Linux/Mac:
   ```bash
   python3 main.py
   ```

## 📖 Hướng dẫn Sử dụng

### Menu chính

Khi chạy ứng dụng, bạn sẽ thấy menu như sau:

```
============================================================
        CHÀO MỪNG ĐẾN VỚI ỨNG DỤNG QUẢN LÝ SẢN PHẨM
============================================================

------------------------------------------------------------
                        MENU CHÍNH
------------------------------------------------------------
1. ➕ Thêm sản phẩm mới
2. 📋 Hiển thị danh sách sản phẩm
3. ✏️  Cập nhật thông tin sản phẩm
4. 🗑️  Xóa sản phẩm
5. 🚪 Thoát chương trình
------------------------------------------------------------
```

### 1. Thêm sản phẩm mới

- Chọn option `1`
- Nhập tên sản phẩm
- Nhập giá sản phẩm (số dương)
- Nhập số lượng (số nguyên không âm)

**Ví dụ**:
```
Nhập tên sản phẩm: Laptop Dell XPS 15
Nhập giá sản phẩm (VNĐ): 25000000
Nhập số lượng: 10
```

### 2. Hiển thị danh sách sản phẩm

- Chọn option `2`
- Xem danh sách tất cả sản phẩm với:
  - ID sản phẩm
  - Tên sản phẩm
  - Giá (định dạng VNĐ)
  - Số lượng
  - Tổng số sản phẩm
  - Tổng giá trị kho

### 3. Cập nhật sản phẩm

- Chọn option `3`
- Xem danh sách sản phẩm hiện có
- Nhập ID sản phẩm cần cập nhật
- Nhập thông tin mới (nhấn Enter để giữ nguyên giá trị cũ)

### 4. Xóa sản phẩm

- Chọn option `4`
- Xem danh sách sản phẩm hiện có
- Nhập ID sản phẩm cần xóa
- Xác nhận xóa (y/n)

### 5. Thoát chương trình

- Chọn option `5`
- Ứng dụng sẽ đóng an toàn

## 💡 Tính năng Nổi bật

### Validation Dữ liệu

- **Tên sản phẩm**: Không được để trống
- **Giá**: Phải là số dương (> 0)
- **Số lượng**: Phải là số nguyên không âm (≥ 0)

### Auto-increment ID

- Mỗi sản phẩm tự động được gán ID duy nhất
- ID không thể thay đổi sau khi tạo

### Error Handling

- Xử lý lỗi nhập liệu
- Thông báo lỗi rõ ràng, dễ hiểu bằng tiếng Việt
- Tránh crash ứng dụng

### User-friendly Interface

- Menu trực quan với emoji
- Hướng dẫn rõ ràng từng bước
- Xác nhận trước khi thực hiện hành động quan trọng (xóa)

## 🔧 Mở rộng Trong Tương lai

Ứng dụng có thể được mở rộng với các tính năng:

- [ ] Lưu trữ dữ liệu vào file (JSON, CSV)
- [ ] Tìm kiếm sản phẩm theo tên
- [ ] Sắp xếp sản phẩm theo giá, tên, số lượng
- [ ] Thống kê và báo cáo
- [ ] Import/Export dữ liệu
- [ ] Hỗ trợ nhiều loại sản phẩm (inheritance)
- [ ] Quản lý danh mục sản phẩm
- [ ] Lịch sử thay đổi

## 📝 Code Quality

### PEP8 Compliance

Code tuân thủ chuẩn PEP8:
- Tên biến, hàm: snake_case
- Tên class: PascalCase
- Docstrings đầy đủ
- Type hints cho parameters và return values

### Documentation

- Mỗi class, method đều có docstring
- Comments giải thích logic phức tạp
- README chi tiết

### Best Practices

- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Clean Code principles
- Meaningful variable names

## 👨‍💻 Tác giả

- **Product Manager Team**
- Repository: [python-micro](https://github.com/congdinh2008/python-micro)

## 📄 License

Dự án này được tạo ra cho mục đích học tập và giảng dạy.

## 🙏 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Liên hệ

Nếu có câu hỏi hoặc đề xuất, vui lòng tạo issue trên GitHub.

---

**Happy Coding! 🚀**
