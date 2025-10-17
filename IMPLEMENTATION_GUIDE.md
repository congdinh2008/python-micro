# 📚 Product Catalog Service - Implementation Guide

## Tổng quan Implementation

Document này giải thích chi tiết về cách Product Catalog Service được xây dựng, các design patterns được áp dụng, và cách các components tương tác với nhau.

## 🏗️ Kiến trúc Tổng thể

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer (FastAPI)                   │
│  - Routes (auth.py, products.py)                        │
│  - Request/Response Handling                            │
│  - JWT Middleware                                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  - AuthService (business logic for auth)                │
│  - ProductService (business logic for products)         │
│  - Transaction management                               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Repository Layer                        │
│  - BaseRepository (Generic CRUD)                        │
│  - UserRepository (User data access)                    │
│  - ProductRepository (Product data access)              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Model Layer                           │
│  - User (SQLAlchemy ORM)                                │
│  - Product (SQLAlchemy ORM)                             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     Database                             │
│  - PostgreSQL / SQLite                                  │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Design Patterns Implemented

### 1. Repository Pattern

**Mục đích**: Tách biệt data access logic khỏi business logic.

**Implementation**:

```python
# Base Repository với Generic Type
class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def get_by_id(self, id: int) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    # ... other CRUD methods

# Specific Repository
class ProductRepository(BaseRepository[Product]):
    def search_by_name(self, name: str) -> List[Product]:
        return self.db.query(Product).filter(
            Product.name.ilike(f"%{name}%")
        ).all()
```

**Lợi ích**:
- Tái sử dụng code với Generic Base Repository
- Dễ test (có thể mock repository)
- Tách biệt SQL queries khỏi business logic

### 2. Dependency Injection

**Mục đích**: Loose coupling giữa các components.

**Implementation**:

```python
# Dependency để inject database session
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency để verify JWT và lấy current user
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    username = decode_access_token(token)
    # ... validation logic
    return user

# Sử dụng trong endpoint
@router.post("/products")
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # ...
```

**Lợi ích**:
- FastAPI tự động inject dependencies
- Dễ test với mock dependencies
- Clean code, không cần khởi tạo manual

### 3. Service Layer Pattern

**Mục đích**: Tách business logic khỏi API layer.

**Implementation**:

```python
class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.product_repository = ProductRepository(db)
    
    def create_product(self, product_data: ProductCreate) -> Product:
        # Business logic here
        product_dict = product_data.model_dump()
        return self.product_repository.create(product_dict)
    
    def get_product_by_id(self, product_id: int) -> Optional[Product]:
        return self.product_repository.get_by_id(product_id)
```

**Lợi ích**:
- Business logic tập trung ở một nơi
- API routes chỉ handle HTTP concerns
- Dễ reuse logic cho different interfaces

### 4. Schema/DTO Pattern

**Mục đích**: Validate và transform data giữa layers.

**Implementation**:

```python
# Request Schema
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Tên không được trống")
        return v.strip()

# Response Schema
class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
```

**Lợi ích**:
- Automatic validation với Pydantic
- Type safety
- Clear API contracts
- Tách biệt internal models khỏi API responses

## 🔐 Security Implementation

### JWT Authentication Flow

```
1. User đăng ký:
   POST /register {username, password}
   → Hash password với bcrypt
   → Lưu user vào database
   → Return user info (không có password)

2. User đăng nhập:
   POST /login {username, password}
   → Verify password
   → Generate JWT token
   → Return token

3. Access protected endpoint:
   GET /products (với Authorization: Bearer <token>)
   → Decode JWT token
   → Get user từ token
   → Verify user exists và active
   → Allow access
```

### Security Best Practices

1. **Password Hashing**: Sử dụng bcrypt với salt
2. **JWT Expiration**: Tokens có thời gian expire
3. **Environment Variables**: Sensitive data trong .env
4. **SQL Injection Prevention**: SQLAlchemy ORM tự động escape
5. **Type Safety**: Pydantic validation cho tất cả inputs

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_users_username ON users (username);
```

### Products Table

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    price NUMERIC(10, 2) NOT NULL,  -- Numeric cho precision
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_products_name ON products (name);
```

## 🔄 Request/Response Flow

### Example: Create Product

```
1. Client Request:
   POST /products
   Authorization: Bearer eyJhbGc...
   Content-Type: application/json
   
   {
     "name": "Laptop",
     "price": 25000000,
     "quantity": 10
   }

2. FastAPI receives request
   ↓
3. JWT Middleware validates token
   → get_current_active_user dependency
   → decode_access_token()
   → Get user from database
   ↓
4. Pydantic validates request body
   → ProductCreate schema
   → Validate all fields
   ↓
5. Route handler calls Service
   → ProductService.create_product()
   ↓
6. Service calls Repository
   → ProductRepository.create()
   ↓
7. Repository interacts with Database
   → SQLAlchemy ORM
   → INSERT INTO products...
   ↓
8. Response flows back up
   → Product model
   → ProductResponse schema
   → JSON serialization
   ↓
9. Client receives response:
   {
     "id": 1,
     "name": "Laptop",
     "price": 25000000.00,
     "quantity": 10,
     "created_at": "2025-10-16T...",
     "updated_at": "2025-10-16T..."
   }
```

## 🧪 Testing Strategy

### Manual Testing với curl

```bash
# 1. Register
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=test123" | jq -r .access_token)

# 3. Create Product (authenticated)
curl -X POST http://localhost:8000/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Product", "price": 100, "quantity": 10}'

# 4. Get Products (public)
curl http://localhost:8000/products
```

### Testing với Swagger UI

1. Mở http://localhost:8000/docs
2. Test `/register` để tạo user
3. Test `/login` để get token
4. Click "Authorize" button, paste token
5. Test các protected endpoints

### Testing với Postman

Import `postman_collection.json` và:
- Environment variable `base_url`: http://localhost:8000
- Login request tự động save token vào environment
- Các requests khác tự động sử dụng token

## 🚀 Deployment Considerations

### Environment Variables

Production cần set:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Strong random key (32+ characters)
- `DEBUG=False`
- `ALLOWED_ORIGINS`: Production domains

### Database Migration

```bash
# Development
alembic upgrade head

# Production
alembic upgrade head
# Hoặc sử dụng CI/CD pipeline
```

### Running in Production

```bash
# Với Gunicorn + Uvicorn workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000

# Hoặc với Docker
docker run -p 8000:8000 -e DATABASE_URL=... app
```

## 📈 Performance Considerations

### Database

- Indexes trên `username` và `name` fields
- Connection pooling với SQLAlchemy
- `pool_pre_ping=True` để handle stale connections

### API

- Pagination cho list endpoints (skip/limit)
- JWT tokens không cần database lookup mỗi request
- FastAPI async support (có thể thêm async/await nếu cần)

### Caching (Future Enhancement)

- Redis cho session storage
- Cache product lists
- Rate limiting

## 🔧 Maintenance

### Adding New Features

1. **New Model**:
   - Create model in `app/models/`
   - Create migration: `alembic revision --autogenerate`
   - Run migration: `alembic upgrade head`

2. **New Repository**:
   - Extend `BaseRepository`
   - Add specific query methods

3. **New Service**:
   - Create service class
   - Inject repository
   - Add business logic

4. **New Endpoint**:
   - Create Pydantic schemas
   - Create route in `app/api/`
   - Use dependencies for auth if needed

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Review migration file
vim alembic/versions/xxx_description.py

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## 📝 Code Standards

### Naming Conventions

- **Variables/Functions**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private attributes**: `_leading_underscore`

### Documentation

- Docstrings cho tất cả public functions/classes
- Type hints đầy đủ
- Comments cho complex logic

### Error Handling

```python
# Good: Specific exceptions với clear messages
if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Không tìm thấy user có ID: {user_id}"
    )

# Bad: Generic exceptions
raise Exception("Error")
```

## 🎓 Learning Resources

### FastAPI
- [Official Docs](https://fastapi.tiangolo.com/)
- [Tutorial](https://fastapi.tiangolo.com/tutorial/)

### SQLAlchemy
- [Official Docs](https://docs.sqlalchemy.org/)
- [ORM Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)

### Repository Pattern
- [Martin Fowler's Pattern](https://martinfowler.com/eaaCatalog/repository.html)

### JWT
- [JWT.io](https://jwt.io/)
- [RFC 7519](https://tools.ietf.org/html/rfc7519)

## ❓ FAQ

### Q: Tại sao dùng Repository Pattern?
**A**: Tách biệt data access, dễ test, reusable code.

### Q: Tại sao dùng Pydantic?
**A**: Auto validation, type safety, clear API contracts.

### Q: JWT vs Session-based auth?
**A**: JWT stateless, scalable, không cần session storage.

### Q: SQLite vs PostgreSQL?
**A**: SQLite cho dev/test, PostgreSQL cho production.

### Q: Làm sao thêm RBAC (Role-Based Access Control)?
**A**: Thêm `role` field vào User model, tạo role dependencies.

---

**Built with ❤️ using FastAPI, SQLAlchemy, and Python**
