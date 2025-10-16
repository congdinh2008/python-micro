# 🚀 Product Catalog Service - RESTful API với FastAPI

API RESTful để quản lý sản phẩm và xác thực người dùng với JWT, xây dựng bằng FastAPI, SQLAlchemy 2.0, PostgreSQL, và áp dụng Repository Pattern.

## 🎯 Mục tiêu

- Xây dựng RESTful API chuyên nghiệp với FastAPI
- Quản lý sản phẩm và xác thực người dùng bằng JWT
- Áp dụng Repository Pattern và Clean Architecture
- Sử dụng SQLAlchemy 2.0 với PostgreSQL/SQLite
- Quản lý schema bằng Alembic migrations

## ✨ Tính năng

### Authentication & Authorization
- ✅ **Đăng ký tài khoản**: `POST /register` - Tạo user mới với username và password
- ✅ **Đăng nhập**: `POST /login` - Lấy JWT token để authentication

### Quản lý Sản phẩm
- ✅ **Tạo sản phẩm**: `POST /products` - Tạo sản phẩm mới (yêu cầu JWT)
- ✅ **Lấy danh sách**: `GET /products` - Lấy tất cả sản phẩm với pagination (public)
- ✅ **Lấy chi tiết**: `GET /products/{id}` - Chi tiết một sản phẩm (public)
- ✅ **Cập nhật**: `PUT /products/{id}` - Cập nhật sản phẩm (yêu cầu JWT)
- ✅ **Xóa**: `DELETE /products/{id}` - Xóa sản phẩm (yêu cầu JWT)

## 📁 Cấu trúc Project

```
python-micro/
├── app/                          # Application package
│   ├── __init__.py
│   ├── main.py                   # FastAPI application entry point
│   ├── config/                   # Configuration
│   │   ├── __init__.py
│   │   └── settings.py          # Environment settings với Pydantic
│   ├── database/                 # Database setup
│   │   ├── __init__.py
│   │   └── database.py          # SQLAlchemy engine và session
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   └── product.py           # Product model
│   ├── repositories/             # Repository Pattern (Data Access Layer)
│   │   ├── __init__.py
│   │   ├── base.py              # Base repository với generic CRUD
│   │   ├── user_repository.py   # User repository
│   │   └── product_repository.py # Product repository
│   ├── services/                 # Business Logic Layer
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Authentication service
│   │   └── product_service.py   # Product service
│   ├── schemas/                  # Pydantic schemas (validation)
│   │   ├── __init__.py
│   │   ├── user.py              # User schemas
│   │   └── product.py           # Product schemas
│   ├── api/                      # API Routes
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependencies (JWT verification)
│   │   ├── auth.py              # Auth endpoints
│   │   └── products.py          # Product endpoints
│   └── utils/                    # Utilities
│       ├── __init__.py
│       └── security.py          # Password hashing, JWT
├── alembic/                      # Database migrations
│   ├── versions/                # Migration files
│   └── env.py                   # Alembic environment
├── product_manager/              # Legacy CLI app (giữ lại)
├── alembic.ini                   # Alembic configuration
├── .env.example                  # Environment variables template
├── requirements.txt              # Python dependencies
└── README.md                     # Documentation
```

## 🏗️ Kiến trúc và Nguyên tắc

### Clean Architecture với Repository Pattern

```
API Layer (FastAPI Routes)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Models Layer (SQLAlchemy ORM)
    ↓
Database (PostgreSQL/SQLite)
```

### Các nguyên tắc áp dụng:

#### 1. Repository Pattern
- **BaseRepository**: Generic repository với CRUD operations cơ bản
- **UserRepository, ProductRepository**: Specific repositories kế thừa BaseRepository
- Tách biệt data access logic khỏi business logic

#### 2. Dependency Injection
- FastAPI Depends() để inject dependencies
- Database session, authentication được inject vào endpoints

#### 3. Security Best Practices
- **Password Hashing**: Bcrypt để hash passwords
- **JWT Authentication**: Token-based authentication
- **Protected Endpoints**: Middleware verify JWT tokens
- **Environment Variables**: Sensitive data trong .env file

#### 4. Validation với Pydantic
- **Request Validation**: Tự động validate input data
- **Response Models**: Type-safe response schemas
- **Settings Management**: Type-safe environment configuration

## 🚀 Hướng dẫn Cài đặt và Chạy

### Yêu cầu Hệ thống

- Python 3.9 trở lên
- PostgreSQL 12+ (hoặc SQLite cho development)
- pip hoặc pipenv

### Các bước Cài đặt

#### 1. Clone repository
```bash
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro
```

#### 2. Tạo Virtual Environment (khuyến nghị)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 3. Cài đặt Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Cấu hình Environment Variables
Tạo file `.env` từ template:
```bash
cp .env.example .env
```

Sửa file `.env` với cấu hình của bạn:
```env
# Database Configuration
DATABASE_URL=sqlite:///./product_catalog.db
# Hoặc với PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/product_catalog

# JWT Configuration
SECRET_KEY=your-secret-key-change-this-in-production-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Configuration
APP_NAME=Product Catalog Service
APP_VERSION=1.0.0
DEBUG=True

# CORS Configuration
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

> ⚠️ **Security Note**: Trong production, đổi `SECRET_KEY` thành một chuỗi ngẫu nhiên dài ít nhất 32 ký tự.

#### 5. Chạy Database Migrations
```bash
# Tạo migration mới (nếu thay đổi models)
alembic revision --autogenerate -m "Description of changes"

# Chạy migrations
alembic upgrade head
```

#### 6. Chạy Application
```bash
uvicorn app.main:app --reload

# Hoặc chỉ định host và port
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Server sẽ chạy tại: **http://localhost:8000**

#### 7. Truy cập API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📖 Hướng dẫn Sử dụng API

### 1. Đăng ký User mới

```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

**Response**:
```json
{
  "id": 1,
  "username": "testuser",
  "is_active": true,
  "created_at": "2025-10-16T18:00:00.000000",
  "updated_at": "2025-10-16T18:00:00.000000"
}
```

### 2. Đăng nhập và lấy JWT Token

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

> 💡 Lưu `access_token` để sử dụng cho các requests tiếp theo

### 3. Tạo Sản phẩm mới (yêu cầu JWT)

```bash
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop",
    "price": 25000000,
    "quantity": 10
  }'
```

**Response**:
```json
{
  "id": 1,
  "name": "Laptop Dell XPS 15",
  "description": "High-performance laptop",
  "price": 25000000.0,
  "quantity": 10,
  "created_at": "2025-10-16T18:00:00.000000",
  "updated_at": "2025-10-16T18:00:00.000000"
}
```

### 4. Lấy danh sách Sản phẩm (public)

```bash
curl http://localhost:8000/products
```

**Query Parameters**:
- `skip`: Số sản phẩm bỏ qua (default: 0)
- `limit`: Số lượng tối đa trả về (default: 100)

```bash
curl "http://localhost:8000/products?skip=0&limit=10"
```

### 5. Lấy chi tiết Sản phẩm (public)

```bash
curl http://localhost:8000/products/1
```

### 6. Cập nhật Sản phẩm (yêu cầu JWT)

```bash
curl -X PUT http://localhost:8000/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "price": 24000000,
    "quantity": 15
  }'
```

> 💡 Chỉ cần cung cấp các fields muốn cập nhật

### 7. Xóa Sản phẩm (yêu cầu JWT)

```bash
curl -X DELETE http://localhost:8000/products/1 \
  -H "Authorization: Bearer <your_token>"
```

**Response**: 204 No Content

## 💡 Tính năng Nổi bật

### 1. Repository Pattern
- **Tách biệt Data Access**: Repository layer độc lập với business logic
- **Generic Base Repository**: Reusable CRUD operations
- **Type-safe**: Sử dụng Python Generics cho type safety

### 2. JWT Authentication
- **Secure Token**: Token-based authentication với expiration
- **Password Hashing**: Bcrypt để bảo mật passwords
- **Protected Routes**: Middleware tự động verify JWT tokens

### 3. Automatic Validation
- **Pydantic Schemas**: Tự động validate request/response data
- **Type Checking**: Type hints đầy đủ trong toàn bộ codebase
- **Clear Error Messages**: Error messages rõ ràng bằng tiếng Việt

### 4. Database Migrations
- **Alembic Integration**: Quản lý database schema changes
- **Version Control**: Track database changes trong version control
- **Easy Rollback**: Có thể rollback migrations nếu cần

### 5. API Documentation
- **Swagger UI**: Interactive API documentation tự động
- **ReDoc**: Alternative documentation interface
- **OpenAPI Spec**: Standard OpenAPI 3.0 specification

### 6. CORS Support
- **Configurable Origins**: Cấu hình CORS cho frontend applications
- **Secure by Default**: Chỉ allow origins được cấu hình

## 🔧 Database Migrations với Alembic

### Tạo Migration mới

Khi thay đổi models (thêm/sửa/xóa fields):

```bash
alembic revision --autogenerate -m "Mô tả thay đổi"
```

### Chạy Migrations

```bash
# Upgrade đến version mới nhất
alembic upgrade head

# Upgrade đến một version cụ thể
alembic upgrade <revision_id>
```

### Rollback Migrations

```bash
# Downgrade về version trước
alembic downgrade -1

# Downgrade đến một version cụ thể
alembic downgrade <revision_id>
```

### Xem Migration History

```bash
alembic history

# Xem current version
alembic current
```

## 🔐 Security Notes

### Production Deployment

Khi deploy lên production, đảm bảo:

1. **SECRET_KEY**: Sử dụng một secret key mạnh, ngẫu nhiên
   ```bash
   # Generate secure secret key
   openssl rand -hex 32
   ```

2. **Database URL**: Không commit DATABASE_URL vào Git
   ```bash
   # Thêm .env vào .gitignore
   echo ".env" >> .gitignore
   ```

3. **HTTPS**: Sử dụng HTTPS cho production
4. **CORS**: Chỉ allow origins cần thiết
5. **Rate Limiting**: Implement rate limiting để tránh abuse
6. **Environment**: Set `DEBUG=False` trong production

### Best Practices

- ✅ Luôn validate input data với Pydantic
- ✅ Sử dụng environment variables cho sensitive data
- ✅ Hash passwords trước khi lưu vào database
- ✅ Set expiration time cho JWT tokens
- ✅ Implement proper error handling
- ✅ Log security events

## 🧪 Testing

### Manual Testing với curl

Xem phần "Hướng dẫn Sử dụng API" ở trên.

### Testing với Swagger UI

1. Truy cập http://localhost:8000/docs
2. Click "Try it out" trên các endpoints
3. Nhập data và execute
4. Xem response trực tiếp

### Postman Collection

Có thể import các curl commands vào Postman để tạo collection:
1. Mở Postman
2. Import → Raw text → Paste curl commands
3. Lưu thành collection để reuse

## 🚀 Production Deployment

### Với Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Với systemd (Linux)

Tạo service file `/etc/systemd/system/product-catalog.service`:

```ini
[Unit]
Description=Product Catalog Service
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/python-micro
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

Enable và start service:
```bash
sudo systemctl enable product-catalog
sudo systemctl start product-catalog
```

## 🔧 Troubleshooting

### Lỗi Database Connection

**Error**: `FATAL: database "product_catalog" does not exist`

**Solution**:
```bash
# Tạo database trong PostgreSQL
createdb product_catalog

# Hoặc sử dụng SQLite (development)
DATABASE_URL=sqlite:///./product_catalog.db
```

### Lỗi Migration

**Error**: `Can't locate revision identified by 'xxx'`

**Solution**:
```bash
# Xóa database và migrations, tạo lại
rm product_catalog.db
rm alembic/versions/*.py
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Lỗi Import Module

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
```bash
# Đảm bảo chạy từ thư mục gốc của project
cd /path/to/python-micro
uvicorn app.main:app --reload
```

## 🤝 Contribution

Contributions are welcome! Please:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

- Issues: https://github.com/congdinh2008/python-micro/issues
- Email: congdinh2008@gmail.com

## 📝 Code Quality

### PEP8 Compliance
- Tên biến, hàm: snake_case
- Tên class: PascalCase
- Docstrings đầy đủ cho tất cả modules, classes, functions
- Type hints đầy đủ cho parameters và return values

### Architecture Principles
- **Repository Pattern**: Tách biệt data access layer
- **Dependency Injection**: FastAPI Depends() cho loose coupling
- **Single Responsibility**: Mỗi layer có trách nhiệm rõ ràng
- **Clean Code**: Code dễ đọc, dễ maintain, dễ test

## 👨‍💻 Tác giả

- **Cong Dinh**
- Repository: [python-micro](https://github.com/congdinh2008/python-micro)
- Email: congdinh2008@gmail.com

## 📄 License

Dự án này được tạo ra cho mục đích học tập và giảng dạy.

---

**Happy Coding! 🚀 Built with ❤️ using FastAPI**
