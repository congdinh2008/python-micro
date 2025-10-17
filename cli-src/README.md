# Product Manager CLI Application

## 📋 Tổng quan

Đây là ứng dụng quản lý sản phẩm đơn giản sử dụng giao diện dòng lệnh (CLI), được xây dựng với Python thuần túy. Ứng dụng này minh họa các nguyên tắc lập trình hướng đối tượng (OOP) và kiến trúc phân lớp (layered architecture).

### Mục đích

Tách biệt source code của CLI application vào thư mục riêng `cli-src/` để:
- Tách biệt rõ ràng giữa CLI application và microservices
- Dễ dàng quản lý và bảo trì
- Tránh nhầm lẫn giữa các phần code khác nhau trong project
- Minh họa OOP principles trước khi học microservices

---

## 📚 Mục lục

1. [🚀 Quick Start](#-quick-start)
2. [🏗️ Kiến trúc](#️-kiến-trúc)
3. [🎯 Nguyên tắc thiết kế](#-nguyên-tắc-thiết-kế)
4. [💻 Cách sử dụng](#-cách-sử-dụng)
5. [📝 Ví dụ sử dụng](#-ví-dụ-sử-dụng)
6. [🔍 Chi tiết kỹ thuật](#-chi-tiết-kỹ-thuật)
7. [🧪 Testing](#-testing)
8. [🔄 So sánh với Microservices](#-so-sánh-với-microservices)
9. [📦 Tổ chức Source Code](#-tổ-chức-source-code)
10. [🔮 Mở rộng tương lai](#-mở-rộng-tương-lai)

---

## 🚀 Quick Start

### Yêu cầu
- Python 3.7+
- Không cần dependencies bên ngoài (chỉ dùng Python standard library)

### Chạy nhanh ứng dụng

#### Cách 1: Sử dụng Python trực tiếp

```bash
cd cli-src
python main.py
```

hoặc từ thư mục gốc:

```bash
python cli-src/main.py
```

#### Cách 2: Sử dụng script

**Linux/macOS:**
```bash
cd cli-src
./run.sh
```

**Windows:**
```cmd
cd cli-src
run.bat
```

### Ví dụ nhanh

#### 1. Thêm sản phẩm đầu tiên
```
Chọn: 1
Nhập tên sản phẩm: Laptop Dell XPS 13
Nhập giá sản phẩm (VNĐ): 25000000
Nhập số lượng: 5
```

#### 2. Xem danh sách sản phẩm
```
Chọn: 2
```

#### 3. Cập nhật sản phẩm
```
Chọn: 3
Nhập ID sản phẩm cần cập nhật: 1
Tên mới: [Enter để giữ nguyên]
Giá mới: 24000000
Số lượng mới: [Enter để giữ nguyên]
```

#### 4. Xóa sản phẩm
```
Chọn: 4
Nhập ID sản phẩm cần xóa: 1
Bạn có chắc chắn muốn xóa? (y/n): y
```

### ⚠️ Lưu ý quan trọng

- **Dữ liệu chỉ tồn tại trong bộ nhớ**: Khi thoát chương trình, tất cả dữ liệu sẽ bị mất
- **Giá phải > 0**: Không được nhập giá âm hoặc bằng 0
- **Số lượng phải >= 0**: Không được nhập số lượng âm
- **ID tự động**: Không cần nhập ID khi tạo sản phẩm mới

---

---

## 🏗️ Kiến trúc

Ứng dụng được tổ chức theo mô hình 3 lớp:

```
cli-src/
├── main.py                    # Entry point của ứng dụng
└── product_manager/           # Package chính
    ├── __init__.py
    ├── models/                # Lớp Data Models
    │   ├── __init__.py
    │   └── product.py        # Model Product
    ├── services/              # Lớp Business Logic
    │   ├── __init__.py
    │   └── product_service.py # Service xử lý CRUD
    └── ui/                    # Lớp Presentation
        ├── __init__.py
        └── cli.py            # Command Line Interface
```

### Các lớp và trách nhiệm

#### 1. **Models Layer** (`models/`)
- **Trách nhiệm**: Định nghĩa cấu trúc dữ liệu
- **File**: `product.py`
- **Class**: `Product`
- **Chức năng**:
  - Đại diện cho một sản phẩm với các thuộc tính: id, name, price, quantity
  - Validation dữ liệu (giá > 0, số lượng >= 0, tên không rỗng)
  - Encapsulation với properties và private attributes

#### 2. **Services Layer** (`services/`)
- **Trách nhiệm**: Xử lý business logic
- **File**: `product_service.py`
- **Class**: `ProductService`
- **Chức năng**:
  - Quản lý danh sách sản phẩm (in-memory storage)
  - Các thao tác CRUD: Create, Read, Update, Delete
  - Tìm kiếm sản phẩm theo ID hoặc tên
  - Tính toán thống kê (tổng giá trị kho)

#### 3. **UI Layer** (`ui/`)
- **Trách nhiệm**: Tương tác với người dùng
- **File**: `cli.py`
- **Class**: `CLI`
- **Chức năng**:
  - Hiển thị menu và nhận input từ người dùng
  - Gọi các methods từ ProductService
  - Xử lý lỗi và hiển thị thông báo

### Layered Architecture (3 lớp)

```
┌─────────────────────────────────┐
│     UI Layer (cli.py)           │
│  - Hiển thị menu                │
│  - Nhận input                   │
│  - Xử lý lỗi UI                 │
└────────────┬────────────────────┘
             │ gọi methods
             ▼
┌─────────────────────────────────┐
│  Service Layer (product_service)│
│  - Business logic               │
│  - CRUD operations              │
│  - Validation                   │
└────────────┬────────────────────┘
             │ sử dụng
             ▼
┌─────────────────────────────────┐
│   Model Layer (product.py)      │
│  - Data structure               │
│  - Properties                   │
│  - Encapsulation                │
└─────────────────────────────────┘
```

### Separation of Concerns

- **Models**: Chỉ chứa cấu trúc dữ liệu và validation cơ bản
- **Services**: Chứa business logic, không biết về UI
- **UI**: Chỉ xử lý tương tác người dùng, không chứa logic

---

## 🎯 Nguyên tắc thiết kế

### 1. **Separation of Concerns**
- Mỗi lớp có một trách nhiệm riêng biệt
- UI không chứa business logic
- Business logic không trực tiếp xử lý input/output

### 2. **Single Responsibility Principle (SRP)**
- `Product`: Chỉ quản lý thông tin của một sản phẩm
- `ProductService`: Chỉ xử lý các thao tác với danh sách sản phẩm
- `CLI`: Chỉ xử lý tương tác với người dùng

### 3. **Encapsulation**
- Sử dụng private attributes (`_attribute`)
- Truy cập dữ liệu qua properties (`@property`)
- Validation trong setters

### 4. **DRY (Don't Repeat Yourself)**
- Code được tổ chức thành các methods có thể tái sử dụng
- Tránh lặp lại logic

### 5. **Clean Code**
- Docstrings đầy đủ
- Type hints
- Meaningful names
- Error handling

---

---

## � Cách sử dụng

### Yêu cầu
- Python 3.7+

### Chạy ứng dụng

```bash
cd cli-src
python main.py
```

hoặc

```bash
python cli-src/main.py
```

### Menu chức năng

| Chức năng | Mô tả |
|-----------|-------|
| **1. ➕ Thêm sản phẩm** | Tạo sản phẩm mới với tên, giá, số lượng |
| **2. 📋 Xem danh sách** | Hiển thị tất cả sản phẩm + thống kê |
| **3. ✏️ Cập nhật** | Sửa thông tin sản phẩm theo ID |
| **4. 🗑️ Xóa** | Xóa sản phẩm theo ID (có xác nhận) |
| **5. 🚪 Thoát** | Đóng ứng dụng |

### 🐛 Xử lý lỗi

Ứng dụng tự động validate và hiển thị lỗi khi:
- Tên sản phẩm để trống
- Giá <= 0
- Số lượng < 0
- ID không tồn tại
- Nhập sai định dạng số

---

## 📝 Ví dụ sử dụng

### Thêm sản phẩm

```
Nhập tên sản phẩm: iPhone 15 Pro
Nhập giá sản phẩm (VNĐ): 29990000
Nhập số lượng: 10

✅ Thêm sản phẩm thành công!
   Product #1: iPhone 15 Pro | Giá: 29,990,000 VNĐ | Số lượng: 10 | Tổng giá trị: 299,900,000 VNĐ
```

### Hiển thị danh sách

```
Tổng số sản phẩm: 3
Tổng giá trị kho: 499,900,000 VNĐ

Product #1: iPhone 15 Pro | Giá: 29,990,000 VNĐ | Số lượng: 10 | Tổng giá trị: 299,900,000 VNĐ
Product #2: MacBook Pro M3 | Giá: 49,990,000 VNĐ | Số lượng: 5 | Tổng giá trị: 249,950,000 VNĐ
Product #3: AirPods Pro | Giá: 6,990,000 VNĐ | Số lượng: 20 | Tổng giá trị: 139,800,000 VNĐ
```

---

## 🔍 Chi tiết kỹ thuật

### Product Model

```python
class Product:
    """
    Attributes:
        _id (int): Auto-increment ID
        _name (str): Product name
        _price (float): Price (must be > 0)
        _quantity (int): Quantity (must be >= 0)
    """
```

**Validation rules:**
- `name`: Không được rỗng hoặc chỉ chứa khoảng trắng
- `price`: Phải là số và lớn hơn 0
- `quantity`: Phải là số nguyên và >= 0
- `id`: Read-only, tự động tăng

### ProductService

**Methods:**
- `add_product(name, price, quantity)`: Thêm sản phẩm mới
- `get_all_products()`: Lấy danh sách tất cả sản phẩm
- `find_product_by_id(product_id)`: Tìm sản phẩm theo ID
- `find_products_by_name(name)`: Tìm sản phẩm theo tên
- `update_product(product_id, name, price, quantity)`: Cập nhật sản phẩm
- `delete_product(product_id)`: Xóa sản phẩm
- `get_product_count()`: Đếm số lượng sản phẩm
- `get_total_value()`: Tính tổng giá trị kho

### CLI

**Methods:**
- `run()`: Khởi chạy ứng dụng
- `_display_menu()`: Hiển thị menu
- `_add_product_flow()`: Luồng thêm sản phẩm
- `_display_products_flow()`: Luồng hiển thị danh sách
- `_update_product_flow()`: Luồng cập nhật sản phẩm
- `_delete_product_flow()`: Luồng xóa sản phẩm
- `_exit_application()`: Thoát ứng dụng

---

## 🧪 Testing

Ứng dụng này được thiết kế với khả năng test cao:

- **Unit Tests**: Có thể test từng class riêng biệt
- **Integration Tests**: Có thể test tương tác giữa các lớp
- **Mocking**: UI và Service có thể được mock dễ dàng

---

## 🔄 So sánh với Microservices

| Feature | CLI App | Microservices |
|---------|---------|---------------|
| **Storage** | In-memory | PostgreSQL |
| **Architecture** | Layered (3-tier) | Microservices |
| **Dependencies** | None (stdlib) | FastAPI, SQLAlchemy, etc. |
| **Persistence** | ❌ | ✅ |
| **API** | ❌ CLI only | ✅ REST API |
| **Scalability** | Single instance | Horizontal scaling |
| **Complexity** | Low | High |
| **Use case** | Learning OOP | Production system |

---

## 📦 Tổ chức Source Code

### Cấu trúc thư mục

```
cli-src/                           # CLI Application Directory
├── .gitignore                     # Git ignore cho CLI app
├── main.py                        # Entry point
├── requirements.txt               # Dependencies (Python stdlib only)
├── run.sh                        # Run script for Linux/macOS
├── run.bat                       # Run script for Windows
├── README.md                     # Documentation (file này)
└── product_manager/              # Main package
    ├── __init__.py
    ├── models/                   # Data models layer
    │   ├── __init__.py
    │   └── product.py           # Product model với OOP
    ├── services/                # Business logic layer
    │   ├── __init__.py
    │   └── product_service.py   # CRUD operations
    └── ui/                      # Presentation layer
        ├── __init__.py
        └── cli.py              # Command Line Interface
```

### Files đã di chuyển từ root directory

| File/Folder | From | To |
|-------------|------|-----|
| `product_manager/` | Root directory | `cli-src/product_manager/` |
| `main.py` | Root directory | `cli-src/main.py` |

### Validation

✅ **Ứng dụng đã được test và chạy thành công:**
- Import paths hoạt động đúng
- Menu hiển thị đẹp
- Có thể thoát ứng dụng bình thường
- Structure code rõ ràng và organized
- Cross-platform scripts created
- Code follows PEP 8

---

## 🎓 Mục đích học tập

Ứng dụng này được thiết kế để minh họa:

1. **OOP Fundamentals**:
   - Classes và Objects
   - Encapsulation
   - Properties và Private Attributes
   - Type Hints

2. **Software Architecture**:
   - Layered Architecture
   - Separation of Concerns
   - SOLID Principles

3. **Python Best Practices**:
   - Docstrings
   - Error Handling
   - Code Organization
   - Package Structure

---

## � Mở rộng tương lai

### Bài tập mở rộng

Có thể mở rộng CLI app với các tính năng sau:

1. **Thêm persistence**: Lưu dữ liệu vào file JSON hoặc SQLite
2. **Thêm search**: Tìm kiếm nâng cao với nhiều tiêu chí
3. **Thêm sorting**: Sắp xếp theo giá, tên, số lượng
4. **Thêm categories**: Phân loại sản phẩm theo danh mục
5. **Export/Import**: Xuất/nhập dữ liệu từ CSV/Excel
6. **Unit Tests**: Viết test cases cho các class với pytest
7. **Configuration file**: Thêm file config cho ứng dụng
8. **Logging**: Thêm logging functionality
9. **Color output**: Sử dụng colorama cho output màu sắc
10. **Bulk operations**: Thao tác hàng loạt với nhiều sản phẩm

---

## 📚 Tài liệu tham khảo

### Resources
- [Python Official Documentation](https://docs.python.org/3/)
- [Real Python - OOP](https://realpython.com/python3-object-oriented-programming/)
- [Python Packages](https://realpython.com/python-modules-packages/)

---

## 📊 Statistics

- **Total Python Code**: 596 lines
- **Python Modules**: 8 files
- **Architecture**: Layered (3-tier)
- **Dependencies**: 0 (Python stdlib only)
- **Cross-Platform**: ✅ Windows/Linux/macOS

---

---

## 📄 License

MIT License - Free to use for educational purposes

## 👤 Author

**Product Manager Team**  
Version: 1.0.0  
Date: October 18, 2025

---

**Note**: Ứng dụng này chỉ lưu dữ liệu trong bộ nhớ (in-memory). Dữ liệu sẽ bị mất khi thoát chương trình. Được thiết kế cho mục đích học tập về OOP và layered architecture.

