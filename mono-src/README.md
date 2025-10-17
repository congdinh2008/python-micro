# Product Catalog Service - Monolithic Application

## 📋 Tổng quan

Đây là **Monolithic Product Catalog Service** - một ứng dụng đơn khối (monolith) được xây dựng với FastAPI, SQLAlchemy 2.0, và PostgreSQL. Ứng dụng này kết hợp cả chức năng quản lý người dùng (authentication) và quản lý sản phẩm trong một service duy nhất.

### Mục đích

- Minh họa kiến trúc **Monolithic** trước khi chuyển sang Microservices
- So sánh với kiến trúc Microservices (user-service, product-service, order-service)
- Học cách xây dựng RESTful API với FastAPI
- Áp dụng Repository Pattern và Clean Architecture

---

## 📚 Mục lục

1. [🚀 Quick Start](#-quick-start)
2. [🏗️ Kiến trúc](#️-kiến-trúc)
3. [🎯 Tính năng](#-tính-năng)
4. [💻 Cài đặt và Chạy](#-cài-đặt-và-chạy)
5. [📝 API Endpoints](#-api-endpoints)
6. [🔐 Authentication](#-authentication)
7. [🗄️ Database](#️-database)
8. [🔄 So sánh với Microservices](#-so-sánh-với-microservices)
9. [📦 Cấu trúc Source Code](#-cấu-trúc-source-code)

---

## 🚀 Quick Start

### Yêu cầu

- Python 3.11+
- PostgreSQL 15+
- pip hoặc poetry

### Chạy nhanh

```bash
# 1. Tạo môi trường ảo
python -m venv venv
source venv/bin/activate  # Linux/macOS
# hoặc
venv\Scripts\activate  # Windows

# 2. Cài đặt dependencies
cd mono-src
pip install -r requirements.txt

# 3. Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn

# 4. Chạy migrations
alembic upgrade head

# 5. Khởi động server
./run.sh
# hoặc
uvicorn app.main:app --reload
```

Server sẽ chạy tại: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 🧪 Test nhanh với cURL

Sau khi server đã chạy, bạn có thể test nhanh các API:

```bash
# 1. Đăng ký tài khoản
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"Demo@123"}'

# 2. Đăng nhập và lấy token
TOKEN=$(curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo&password=Demo@123" \
  | jq -r '.access_token')

# 3. Xem danh sách sản phẩm (public)
curl http://localhost:8000/products

# 4. Tạo sản phẩm mới (cần authentication)
curl -X POST "http://localhost:8000/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15 Pro","description":"Latest iPhone","price":29990000,"quantity":50}'

# 5. Lấy chi tiết sản phẩm
curl http://localhost:8000/products/1
```

**Hoặc sử dụng Swagger UI**: http://localhost:8000/docs

---

## 🏗️ Kiến trúc

### Monolithic Architecture

```
┌─────────────────────────────────────────────────────┐
│         Product Catalog Service (Port 8000)         │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  API Layer (FastAPI Routes)                  │   │
│  │  • /register, /login                         │   │
│  │  • /products (CRUD)                          │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                   │
│  ┌──────────────▼───────────────────────────────┐   │
│  │  Service Layer (Business Logic)              │   │
│  │  • AuthService                               │   │
│  │  • ProductService                            │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                   │
│  ┌──────────────▼───────────────────────────────┐   │
│  │  Repository Layer (Data Access)              │   │
│  │  • UserRepository                            │   │
│  │  • ProductRepository                         │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                   │
│  ┌──────────────▼───────────────────────────────┐   │
│  │  Model Layer (SQLAlchemy ORM)                │   │
│  │  • User Model                                │   │
│  │  • Product Model                             │   │
│  └──────────────┬───────────────────────────────┘   │
│                 │                                   │
└─────────────────┼───────────────────────────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │  PostgreSQL Database │
        │  product_catalog     │
        └──────────────────────┘
```

### Layered Architecture

1. **API Layer** - FastAPI routes và endpoints
2. **Service Layer** - Business logic
3. **Repository Layer** - Data access với Repository Pattern
4. **Model Layer** - SQLAlchemy models
5. **Schema Layer** - Pydantic models cho validation

---

## 🎯 Tính năng

### Authentication & User Management

- ✅ **User Registration** - Đăng ký tài khoản mới
- ✅ **User Login** - Đăng nhập với JWT token
- ✅ **Password Hashing** - Bảo mật với bcrypt
- ✅ **JWT Authentication** - Token-based authentication

### Product Management

- ✅ **Create Product** - Tạo sản phẩm mới (cần JWT)
- ✅ **List Products** - Xem danh sách sản phẩm (public)
- ✅ **Get Product** - Xem chi tiết sản phẩm (public)
- ✅ **Update Product** - Cập nhật sản phẩm (cần JWT)
- ✅ **Delete Product** - Xóa sản phẩm (cần JWT)

### Technical Features

- ✅ **Repository Pattern** - Clean data access layer
- ✅ **Dependency Injection** - FastAPI dependencies
- ✅ **Database Migration** - Alembic
- ✅ **Input Validation** - Pydantic schemas
- ✅ **Auto Documentation** - Swagger/OpenAPI
- ✅ **CORS Support** - Cross-origin requests

---

## 💻 Cài đặt và Chạy

### 1. Clone và Setup

```bash
cd mono-src

# Tạo virtual environment
python -m venv venv
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### 2. Cấu hình Database

Tạo PostgreSQL database:

```sql
CREATE DATABASE product_catalog;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE product_catalog TO your_user;
```

Cấu hình file `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/product_catalog
SECRET_KEY=your-super-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=Product Catalog Service
APP_VERSION=1.0.0
DEBUG=True
```

### 3. Database Migration

```bash
# Tạo migration mới (nếu thay đổi models)
alembic revision --autogenerate -m "Description"

# Chạy migrations
alembic upgrade head

# Rollback (nếu cần)
alembic downgrade -1
```

### 4. Khởi động Server

**Cách 1: Sử dụng script**

```bash
./run.sh
```

**Cách 2: Trực tiếp với uvicorn**

```bash
uvicorn app.main:app --reload --port 8000
```

**Cách 3: Với log level**

```bash
uvicorn app.main:app --reload --log-level debug
```

### 5. Truy cập Application

- **API Server**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## 📝 API Endpoints

### Authentication Endpoints

#### POST /register - Đăng ký tài khoản

**Request:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "is_active": true,
  "created_at": "2025-10-18T10:00:00"
}
```

#### POST /login - Đăng nhập

**Request:**
```
Content-Type: application/x-www-form-urlencoded

username=john_doe&password=SecurePass123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Product Endpoints

#### GET /products - Lấy danh sách sản phẩm

**Query Parameters:**
- `skip` (optional): Số sản phẩm bỏ qua (default: 0)
- `limit` (optional): Số sản phẩm tối đa (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone model",
    "price": 29990000,
    "quantity": 50,
    "created_at": "2025-10-18T10:00:00",
    "updated_at": "2025-10-18T10:00:00"
  }
]
```

#### GET /products/{id} - Lấy chi tiết sản phẩm

**Response:**
```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone model",
  "price": 29990000,
  "quantity": 50,
  "created_at": "2025-10-18T10:00:00",
  "updated_at": "2025-10-18T10:00:00"
}
```

#### POST /products - Tạo sản phẩm mới (🔒 Cần JWT)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```json
{
  "name": "MacBook Pro M3",
  "description": "Powerful laptop for developers",
  "price": 49990000,
  "quantity": 20
}
```

**Response:**
```json
{
  "id": 2,
  "name": "MacBook Pro M3",
  "description": "Powerful laptop for developers",
  "price": 49990000,
  "quantity": 20,
  "created_at": "2025-10-18T11:00:00",
  "updated_at": "2025-10-18T11:00:00"
}
```

#### PUT /products/{id} - Cập nhật sản phẩm (🔒 Cần JWT)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```json
{
  "name": "MacBook Pro M3 Max",
  "price": 54990000,
  "quantity": 15
}
```

#### DELETE /products/{id} - Xóa sản phẩm (🔒 Cần JWT)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

## 🔐 Authentication

### JWT Token Flow

```
1. User registers/logs in
   POST /register or /login
   
2. Server returns JWT token
   { "access_token": "...", "token_type": "bearer" }
   
3. Client includes token in requests
   Authorization: Bearer <token>
   
4. Server validates token
   Extracts user_id from token
   
5. Request processed
   Returns requested data
```

### Sử dụng JWT Token

**Trong cURL:**
```bash
curl -X GET "http://localhost:8000/products" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Trong Swagger UI:**
1. Click nút "Authorize" 🔓
2. Nhập: `Bearer <your_token>`
3. Click "Authorize"
4. Bây giờ có thể gọi protected endpoints

**Trong JavaScript:**
```javascript
fetch('http://localhost:8000/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 🗄️ Database

### Schema

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Alembic Migrations

```bash
# Tạo migration mới
alembic revision --autogenerate -m "Add new column to products"

# Xem history
alembic history

# Upgrade
alembic upgrade head

# Downgrade
alembic downgrade -1

# Downgrade to specific version
alembic downgrade <revision_id>
```

---

## 🔄 So sánh với Microservices

| Aspect | Monolithic (mono-src) | Microservices (user/product/order-service) |
|--------|----------------------|-------------------------------------------|
| **Architecture** | Single application | Multiple independent services |
| **Database** | Single shared DB | Database per service |
| **Deployment** | Deploy as one unit | Deploy services independently |
| **Scaling** | Scale entire app | Scale services independently |
| **Development** | Simpler initially | More complex setup |
| **Communication** | In-process calls | HTTP/REST, Message queues |
| **Data Consistency** | Easy (single DB) | Complex (distributed transactions) |
| **Tech Stack** | Single stack | Can use different stacks |
| **Testing** | Easier integration tests | Need contract testing |
| **Complexity** | Low | High |
| **Best For** | Small/Medium apps | Large distributed systems |

### Khi nào dùng Monolithic?

✅ **Nên dùng khi:**
- Dự án vừa và nhỏ
- Team nhỏ (< 10 developers)
- Yêu cầu đơn giản
- Cần deploy và maintain nhanh
- Budget hạn chế
- Consistency quan trọng

❌ **Không nên dùng khi:**
- Dự án lớn, phức tạp
- Nhiều teams độc lập
- Cần scale từng phần riêng biệt
- Yêu cầu high availability
- Công nghệ đa dạng

---

## 📦 Cấu trúc Source Code

```
mono-src/
├── .env.example                # Environment configuration example
├── .env.development.example    # Development config
├── .env.production.example     # Production config
├── alembic.ini                 # Alembic configuration
├── requirements.txt            # Python dependencies
├── run.sh                      # Quick start script
├── README.md                   # This file
│
├── alembic/                    # Database migrations
│   ├── env.py                  # Alembic environment
│   ├── script.py.mako          # Migration template
│   └── versions/               # Migration files
│       └── *.py
│
└── app/                        # Main application
    ├── __init__.py
    ├── main.py                 # FastAPI app entry point
    │
    ├── api/                    # API routes layer
    │   ├── __init__.py
    │   ├── auth.py            # Authentication endpoints
    │   ├── products.py        # Product endpoints
    │   └── deps.py            # Shared dependencies
    │
    ├── config/                 # Configuration
    │   ├── __init__.py
    │   └── settings.py        # App settings
    │
    ├── database/               # Database setup
    │   ├── __init__.py
    │   └── database.py        # SQLAlchemy setup
    │
    ├── models/                 # SQLAlchemy models
    │   ├── __init__.py
    │   ├── user.py            # User model
    │   └── product.py         # Product model
    │
    ├── repositories/           # Repository pattern
    │   ├── __init__.py
    │   ├── base.py            # Base repository
    │   ├── user_repository.py # User data access
    │   └── product_repository.py # Product data access
    │
    ├── schemas/                # Pydantic schemas
    │   ├── __init__.py
    │   ├── user.py            # User schemas
    │   └── product.py         # Product schemas
    │
    ├── services/               # Business logic
    │   ├── __init__.py
    │   ├── auth_service.py    # Auth business logic
    │   └── product_service.py # Product business logic
    │
    └── utils/                  # Utilities
        ├── __init__.py
        └── security.py        # Password hashing, JWT
```

### Giải thích các lớp

#### 1. API Layer (`app/api/`)
- **Mục đích**: Định nghĩa HTTP endpoints
- **Trách nhiệm**: Nhận requests, validate input, gọi services, trả về responses
- **Files**:
  - `auth.py`: POST /register, POST /login
  - `products.py`: CRUD endpoints cho products
  - `deps.py`: Shared dependencies (get_db, get_current_user)

#### 2. Service Layer (`app/services/`)
- **Mục đích**: Business logic
- **Trách nhiệm**: Xử lý logic nghiệp vụ, gọi repositories
- **Files**:
  - `auth_service.py`: Xử lý đăng ký, đăng nhập
  - `product_service.py`: Xử lý CRUD logic

#### 3. Repository Layer (`app/repositories/`)
- **Mục đích**: Data access abstraction
- **Trách nhiệm**: Tương tác với database, CRUD operations
- **Pattern**: Repository Pattern
- **Files**:
  - `base.py`: Generic base repository
  - `user_repository.py`: User data access
  - `product_repository.py`: Product data access

#### 4. Model Layer (`app/models/`)
- **Mục đích**: Database schema definition
- **Trách nhiệm**: Define tables, relationships
- **ORM**: SQLAlchemy 2.0
- **Files**:
  - `user.py`: User table
  - `product.py`: Product table

#### 5. Schema Layer (`app/schemas/`)
- **Mục đích**: Request/Response validation
- **Trách nhiệm**: Validate input/output data
- **Framework**: Pydantic
- **Files**:
  - `user.py`: UserCreate, UserResponse, Token
  - `product.py`: ProductCreate, ProductUpdate, ProductResponse

---

## 🧪 Testing

### Manual Testing với cURL

```bash
# 1. Register
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}'

# 2. Login
TOKEN=$(curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test@123" \
  | jq -r '.access_token')

# 3. Create Product
curl -X POST "http://localhost:8000/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","price":29990000,"quantity":10}'

# 4. Get Products
curl -X GET "http://localhost:8000/products"

# 5. Get Product by ID
curl -X GET "http://localhost:8000/products/1"

# 6. Update Product
curl -X PUT "http://localhost:8000/products/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15 Pro","price":34990000}'

# 7. Delete Product
curl -X DELETE "http://localhost:8000/products/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Dependencies

```
FastAPI==0.104.1         # Web framework
uvicorn==0.24.0         # ASGI server
SQLAlchemy==2.0.23      # ORM
alembic==1.12.1         # Database migrations
psycopg2-binary==2.9.9  # PostgreSQL driver
pydantic==2.5.0         # Data validation
pydantic-settings==2.1.0 # Settings management
python-jose==3.3.0      # JWT
passlib==1.7.4          # Password hashing
bcrypt==4.1.1           # Bcrypt
python-multipart==0.0.6 # Form data
```

---

## 🔮 Mở rộng tương lai

Có thể mở rộng monolithic app này với:

- [ ] Add caching layer (Redis)
- [ ] Add pagination helper
- [ ] Add filtering và sorting
- [ ] Add full-text search
- [ ] Add file upload (product images)
- [ ] Add rate limiting
- [ ] Add logging và monitoring
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add Docker support
- [ ] Add CI/CD pipeline

Hoặc **migrate sang Microservices** (đã có sẵn trong project):
- ✅ User Service (port 8001)
- ✅ Product Service (port 8002)
- ✅ Order Service (port 8003)
- ✅ Notification Service (port 8004)

---

## 📚 Tài liệu tham khảo

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📄 License

MIT License - Free to use for educational purposes

## 👤 Author

**Cong Dinh**  
Date: October 18, 2025  
Version: 1.0.0

---

**Note**: Đây là monolithic application để học và so sánh với microservices architecture. Trong production, cân nhắc sử dụng microservices nếu dự án có quy mô lớn và phức tạp.
