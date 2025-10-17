# 🚀 Python Microservices - User & Product Services

Kiến trúc Microservices với 2 service độc lập: **User Service** (Authentication) và **Product Service** (Product Management), xây dựng bằng FastAPI, SQLAlchemy 2.0, PostgreSQL, và áp dụng Clean Architecture.

## 🎯 Mục tiêu

- Xây dựng kiến trúc Microservices với services độc lập
- Tách biệt Authentication (User Service) và Product Management (Product Service)
- Giao tiếp giữa services qua REST API
- Áp dụng Repository Pattern và Clean Architecture
- Sử dụng SQLAlchemy 2.0 với PostgreSQL
- Quản lý schema bằng Alembic migrations độc lập cho mỗi service

## 🏗️ Kiến trúc Microservices

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    │                    │
        ┌───────────▼──────────┐  ┌─────▼──────────────┐
        │   User Service       │  │  Product Service   │
        │   (Port 8001)        │  │  (Port 8002)       │
        │                      │  │                    │
        │  - Register          │  │  - CRUD Products   │
        │  - Login             │◄─┤  - Validates JWT   │
        │  - Validate Token    │  │    via REST API    │
        └──────────┬───────────┘  └─────┬──────────────┘
                   │                     │
        ┌──────────▼───────────┐  ┌─────▼──────────────┐
        │  User Service DB     │  │ Product Service DB │
        │  (PostgreSQL)        │  │ (PostgreSQL)       │
        └──────────────────────┘  └────────────────────┘
```

## ✨ Tính năng

### 🔐 User Service (Port 8001)
- ✅ **Đăng ký tài khoản**: `POST /register` - Tạo user mới với username và password
- ✅ **Đăng nhập**: `POST /login` - Lấy JWT token để authentication
- ✅ **Xác thực token**: `POST /validate-token` - Validate JWT token (cho Product Service)
- ✅ **Health Check**: `GET /health` - Kiểm tra trạng thái service

### 📦 Product Service (Port 8002)
- ✅ **Tạo sản phẩm**: `POST /products` - Tạo sản phẩm mới (yêu cầu JWT)
- ✅ **Lấy danh sách**: `GET /products` - Lấy tất cả sản phẩm với pagination (public)
- ✅ **Lấy chi tiết**: `GET /products/{id}` - Chi tiết một sản phẩm (public)
- ✅ **Cập nhật**: `PUT /products/{id}` - Cập nhật sản phẩm (yêu cầu JWT)
- ✅ **Xóa**: `DELETE /products/{id}` - Xóa sản phẩm (yêu cầu JWT)
- ✅ **Health Check**: `GET /health` - Kiểm tra trạng thái service

## 📁 Cấu trúc Project

```
python-micro/
├── user-service/                 # User Service (Authentication)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── auth.py          # Auth endpoints
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   └── settings.py      # Configuration
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── database.py      # Database setup
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── user.py          # User model
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # Base repository
│   │   │   └── user_repository.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── user.py          # User schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── auth_service.py  # Auth business logic
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── security.py      # JWT & password hashing
│   ├── alembic/                 # Database migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── product-service/             # Product Service (Product Management)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py          # Auth dependencies
│   │   │   └── products.py      # Product endpoints
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   └── settings.py      # Configuration
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── database.py      # Database setup
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── product.py       # Product model
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # Base repository
│   │   │   └── product_repository.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── product.py       # Product schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── product_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── auth_client.py   # User Service client
│   ├── alembic/                 # Database migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml           # Docker Compose setup
├── start-user-service.sh        # Script to start User Service (Linux/Mac)
├── start-product-service.sh     # Script to start Product Service (Linux/Mac)
├── start-user-service.bat       # Script to start User Service (Windows)
├── start-product-service.bat    # Script to start Product Service (Windows)
└── README.md                    # This file
```

## 🏗️ Kiến trúc và Nguyên tắc

### Microservices Architecture

Hệ thống được chia thành 2 microservices độc lập:

1. **User Service**: Quản lý authentication và user management
   - Database riêng biệt (user_service_db)
   - JWT token generation và validation
   - Port: 8001

2. **Product Service**: Quản lý products
   - Database riêng biệt (product_service_db)
   - Gọi User Service để validate JWT tokens
   - Port: 8002

### Clean Architecture với Repository Pattern

Mỗi service áp dụng cùng kiến trúc:

```
API Layer (FastAPI Routes)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Models Layer (SQLAlchemy ORM)
    ↓
Database (PostgreSQL)
```

### Các nguyên tắc áp dụng:

#### 1. Repository Pattern
- **BaseRepository**: Generic repository với CRUD operations cơ bản
- **Specific Repositories**: UserRepository, ProductRepository kế thừa BaseRepository
- Tách biệt data access logic khỏi business logic

#### 2. Dependency Injection
- FastAPI Depends() để inject dependencies
- Database session, authentication được inject vào endpoints

#### 3. Security Best Practices
- **Password Hashing**: Bcrypt để hash passwords (User Service)
- **JWT Authentication**: Token-based authentication
- **Separate Concerns**: Product Service KHÔNG decode JWT, chỉ forward đến User Service
- **Environment Variables**: Sensitive data trong .env file

#### 4. Inter-Service Communication
- **REST API**: Product Service gọi User Service qua HTTP
- **No Shared Database**: Mỗi service có database riêng
- **Loose Coupling**: Services không phụ thuộc lẫn nhau về code

#### 5. Validation với Pydantic
- **Request Validation**: Tự động validate input data
- **Response Models**: Type-safe response schemas
- **Settings Management**: Type-safe environment configuration

## 🚀 Hướng dẫn Cài đặt và Chạy

### Yêu cầu Hệ thống

- Python 3.9 trở lên
- PostgreSQL 12+ (hoặc SQLite cho development)
- Docker & Docker Compose (optional, cho deployment dễ dàng)
- pip hoặc pipenv

### Phương án 1: Chạy với Docker Compose (Khuyến nghị)

Đây là cách dễ nhất để chạy cả 2 services cùng databases:

```bash
# Clone repository
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services sẽ chạy tại:
- **User Service**: http://localhost:8001
- **Product Service**: http://localhost:8002
- **User Service DB**: localhost:5433
- **Product Service DB**: localhost:5434

### Phương án 2: Chạy Manual (Development)

#### Bước 1: Clone repository
```bash
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro
```

#### Bước 2: Setup User Service

```bash
# Linux/Mac
./start-user-service.sh

# Windows
start-user-service.bat
```

Hoặc manual:

```bash
cd user-service

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Bước 3: Setup Product Service

Mở terminal mới:

```bash
# Linux/Mac
./start-product-service.sh

# Windows
start-product-service.bat
```

Hoặc manual:

```bash
cd product-service

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env - đảm bảo USER_SERVICE_URL đúng

# Run migrations
alembic upgrade head

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

### Cấu hình Environment Variables

#### User Service (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/user_service_db
# Or SQLite: DATABASE_URL=sqlite:///./user_service.db

SECRET_KEY=your-secret-key-change-this-in-production-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=8001
```

#### Product Service (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/product_service_db
# Or SQLite: DATABASE_URL=sqlite:///./product_service.db

USER_SERVICE_URL=http://localhost:8001
PORT=8002
```

> ⚠️ **Security Note**: Trong production, đổi `SECRET_KEY` thành một chuỗi ngẫu nhiên dài ít nhất 32 ký tự.

## 📖 Hướng dẫn Sử dụng API

### Truy cập API Documentation

- **User Service**:
  - Swagger UI: http://localhost:8001/docs
  - ReDoc: http://localhost:8001/redoc

- **Product Service**:
  - Swagger UI: http://localhost:8002/docs
  - ReDoc: http://localhost:8002/redoc

### Luồng Authentication giữa Services

```
1. Client → POST /register (User Service) → Create user
2. Client → POST /login (User Service) → Get JWT token
3. Client → POST /products (Product Service + JWT) 
   → Product Service → POST /validate-token (User Service)
   → User Service validates token → Return username
   → Product Service creates product
```

### 1. Đăng ký User mới (User Service)

```bash
curl -X POST http://localhost:8001/register \
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

### 2. Đăng nhập và lấy JWT Token (User Service)

```bash
curl -X POST http://localhost:8001/login \
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

### 3. Tạo Sản phẩm mới (Product Service - yêu cầu JWT)

```bash
# Set token variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
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

### 4. Lấy danh sách Sản phẩm (Product Service - public)

```bash
curl http://localhost:8002/products
```

**Query Parameters**:
- `skip`: Số sản phẩm bỏ qua (default: 0)
- `limit`: Số lượng tối đa trả về (default: 100)

```bash
curl "http://localhost:8002/products?skip=0&limit=10"
```

### 5. Lấy chi tiết Sản phẩm (Product Service - public)

```bash
curl http://localhost:8002/products/1
```

### 6. Cập nhật Sản phẩm (Product Service - yêu cầu JWT)

```bash
curl -X PUT http://localhost:8002/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 24000000,
    "quantity": 15
  }'
```

> 💡 Chỉ cần cung cấp các fields muốn cập nhật

### 7. Xóa Sản phẩm (Product Service - yêu cầu JWT)

```bash
curl -X DELETE http://localhost:8002/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Response**: 204 No Content

### 8. Health Checks

```bash
# User Service health
curl http://localhost:8001/health

# Product Service health
curl http://localhost:8002/health
```

## 💡 Tính năng Nổi bật

### 1. Microservices Architecture
- **Independent Services**: Mỗi service chạy độc lập với database riêng
- **Loose Coupling**: Services giao tiếp qua REST API
- **Scalability**: Có thể scale từng service riêng biệt
- **Technology Freedom**: Mỗi service có thể dùng tech stack riêng

### 2. Repository Pattern
- **Tách biệt Data Access**: Repository layer độc lập với business logic
- **Generic Base Repository**: Reusable CRUD operations
- **Type-safe**: Sử dụng Python Generics cho type safety

### 3. JWT Authentication with Service Delegation
- **User Service**: Generate và validate JWT tokens
- **Product Service**: Delegate validation đến User Service
- **No JWT Secrets in Product Service**: Tăng bảo mật
- **Centralized Auth**: Tất cả auth logic ở một nơi

### 4. Clean Architecture
- **Separation of Concerns**: Mỗi layer có trách nhiệm rõ ràng
- **Testability**: Dễ dàng test từng layer
- **Maintainability**: Code dễ maintain và extend

### 5. Automatic Validation
- **Pydantic Schemas**: Tự động validate request/response data
- **Type Checking**: Type hints đầy đủ trong toàn bộ codebase
- **Clear Error Messages**: Error messages rõ ràng bằng tiếng Việt

### 6. Database Migrations
- **Alembic Integration**: Quản lý database schema changes
- **Independent Migrations**: Mỗi service có migrations riêng
- **Version Control**: Track database changes trong version control
- **Easy Rollback**: Có thể rollback migrations nếu cần

### 7. API Documentation
- **Swagger UI**: Interactive API documentation tự động cho cả 2 services
- **ReDoc**: Alternative documentation interface
- **OpenAPI Spec**: Standard OpenAPI 3.0 specification

### 8. Docker Support
- **Docker Compose**: Chạy tất cả services với 1 command
- **Isolated Environment**: Mỗi service trong container riêng
- **Easy Deployment**: Deploy dễ dàng lên production

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

1. **SECRET_KEY (User Service)**: Sử dụng một secret key mạnh, ngẫu nhiên
   ```bash
   # Generate secure secret key
   openssl rand -hex 32
   ```

2. **Database URLs**: Không commit DATABASE_URL vào Git
   ```bash
   # Thêm .env vào .gitignore
   echo ".env" >> .gitignore
   echo "user-service/.env" >> .gitignore
   echo "product-service/.env" >> .gitignore
   ```

3. **HTTPS**: Sử dụng HTTPS cho production
4. **CORS**: Chỉ allow origins cần thiết
5. **Rate Limiting**: Implement rate limiting để tránh abuse
6. **Environment**: Set `DEBUG=False` trong production
7. **Service URLs**: Sử dụng internal service URLs trong production
8. **Network Isolation**: Chỉ expose public endpoints ra internet

### Best Practices

- ✅ Luôn validate input data với Pydantic
- ✅ Sử dụng environment variables cho sensitive data
- ✅ Hash passwords trước khi lưu vào database
- ✅ Set expiration time cho JWT tokens
- ✅ Implement proper error handling
- ✅ Log security events
- ✅ Separate databases cho mỗi service
- ✅ Use service-to-service authentication
- ✅ Monitor inter-service communication

## 🔄 Inter-Service Communication

### How Product Service Validates Tokens

```python
# Product Service calls User Service
import httpx

async def validate_token(token: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{USER_SERVICE_URL}/validate-token",
            json={"token": token},
            timeout=5.0
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("valid"):
                return data.get("username")
        
        return None
```

### Benefits of This Architecture

1. **No JWT Secrets in Product Service**: Tăng bảo mật
2. **Centralized Token Management**: Dễ maintain và update
3. **Service Independence**: Product Service không cần biết JWT implementation
4. **Easy to Scale**: Có thể thêm nhiều services khác sử dụng cùng User Service
5. **Token Revocation**: Dễ dàng revoke tokens ở User Service

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

### Với Docker Compose (Recommended)

```bash
# Build và start services
docker-compose up -d --build

# Scale services nếu cần
docker-compose up -d --scale user-service=2 --scale product-service=3

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Với Kubernetes

Tạo deployment files cho mỗi service:

```yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: your-registry/user-service:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: user-service-secrets
              key: database-url
```

### Environment Variables cho Production

```env
# User Service
DATABASE_URL=postgresql://user:secure-password@prod-db:5432/user_service_db
SECRET_KEY=<generate-with-openssl-rand-hex-32>
DEBUG=False
PORT=8001

# Product Service  
DATABASE_URL=postgresql://user:secure-password@prod-db:5432/product_service_db
USER_SERVICE_URL=http://user-service:8001
DEBUG=False
PORT=8002
```

## 🔧 Troubleshooting

### User Service không khởi động được

**Error**: `FATAL: database "user_service_db" does not exist`

**Solution**:
```bash
# Tạo database trong PostgreSQL
createdb user_service_db

# Hoặc sử dụng SQLite (development)
# Trong user-service/.env:
DATABASE_URL=sqlite:///./user_service.db
```

### Product Service không kết nối được User Service

**Error**: `Error validating token with User Service`

**Solution**:
```bash
# Kiểm tra User Service đang chạy
curl http://localhost:8001/health

# Kiểm tra USER_SERVICE_URL trong product-service/.env
USER_SERVICE_URL=http://localhost:8001
```

### Port đã được sử dụng

**Error**: `Address already in use`

**Solution**:
```bash
# User Service - sử dụng port khác
uvicorn app.main:app --port 8003

# Product Service - sử dụng port khác
uvicorn app.main:app --port 8004
```

### Lỗi Migration

**Error**: `Can't locate revision identified by 'xxx'`

**Solution**:
```bash
# Trong user-service hoặc product-service
rm -rf alembic/versions/*.py
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Docker Compose không khởi động

**Solution**:
```bash
# Xem logs để debug
docker-compose logs -f

# Restart services
docker-compose down
docker-compose up -d --build
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

## 📝 Code Quality & Best Practices

### PEP8 Compliance
- Tên biến, hàm: snake_case
- Tên class: PascalCase
- Docstrings đầy đủ cho tất cả modules, classes, functions
- Type hints đầy đủ cho parameters và return values

### Architecture Principles
- **Microservices**: Services độc lập với databases riêng
- **Repository Pattern**: Tách biệt data access layer
- **Dependency Injection**: FastAPI Depends() cho loose coupling
- **Single Responsibility**: Mỗi layer có trách nhiệm rõ ràng
- **Clean Code**: Code dễ đọc, dễ maintain, dễ test
- **Service Communication**: REST API giữa services
- **No Shared State**: Mỗi service quản lý state riêng

### Testing Strategy
- **Unit Tests**: Test từng layer riêng biệt
- **Integration Tests**: Test giao tiếp giữa services
- **API Tests**: Test endpoints với Swagger UI
- **Load Tests**: Test performance và scalability

## 🎓 Learning Outcomes

Dự án này giúp bạn học:

- ✅ Microservices Architecture patterns
- ✅ Service-to-service communication via REST API
- ✅ JWT authentication and authorization
- ✅ Repository Pattern implementation
- ✅ Clean Architecture principles
- ✅ Database migrations với Alembic
- ✅ Docker và Docker Compose
- ✅ FastAPI framework
- ✅ SQLAlchemy 2.0 ORM
- ✅ Pydantic validation
- ✅ Environment-based configuration

## 👨‍💻 Tác giả

- **Cong Dinh**
- Repository: [python-micro](https://github.com/congdinh2008/python-micro)
- Email: congdinh2008@gmail.com

## 📄 License

Dự án này được tạo ra cho mục đích học tập và giảng dạy.

---

**Happy Coding! 🚀 Built with ❤️ using FastAPI and Microservices Architecture**
