# 📦 Product Service - Product Management Microservice

Independent microservice for product CRUD operations. Authentication is delegated to User Service via REST API.

## 📋 Features

- ✅ **Get Products**: `GET /products` - List all products (public)
- ✅ **Get Product**: `GET /products/{id}` - Get product details (public)
- ✅ **Create Product**: `POST /products` - Create new product (requires JWT)
- ✅ **Update Product**: `PUT /products/{id}` - Update product (requires JWT)
- ✅ **Delete Product**: `DELETE /products/{id}` - Delete product (requires JWT)
- ✅ **Health Check**: `GET /health` - Service health status

## 🏗️ Architecture

This service follows Clean Architecture with Repository Pattern:

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

### Authentication Flow

```
Client → Product Service (with JWT) → User Service (validate token) → Response
```

Product Service does NOT decode JWT tokens. It delegates authentication to User Service via REST API.

## 🚀 Installation & Setup

### Prerequisites

- Python 3.9+
- PostgreSQL 12+ (or SQLite for development)
- User Service running on http://localhost:8001
- pip or pipenv

### Steps

#### 1. Navigate to Product Service directory
```bash
cd product-service
```

#### 2. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/product_service_db
USER_SERVICE_URL=http://localhost:8001
PORT=8002
```

#### 5. Run Database Migrations
```bash
alembic upgrade head
```

#### 6. Run the Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

Service will be available at: **http://localhost:8002**

## 📖 API Documentation

- **Swagger UI**: http://localhost:8002/docs
- **ReDoc**: http://localhost:8002/redoc

## 📝 API Endpoints

### 1. Get All Products (Public)

```bash
curl http://localhost:8002/products
```

### 2. Get Product Details (Public)

```bash
curl http://localhost:8002/products/1
```

### 3. Create Product (Requires JWT)

First, get JWT token from User Service:
```bash
TOKEN=$(curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123" | jq -r '.access_token')
```

Then create product:
```bash
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

### 4. Update Product (Requires JWT)

```bash
curl -X PUT http://localhost:8002/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 24000000,
    "quantity": 15
  }'
```

### 5. Delete Product (Requires JWT)

```bash
curl -X DELETE http://localhost:8002/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Health Check

```bash
curl http://localhost:8002/health
```

## 🔐 Authentication

Product Service does NOT:
- Store user information
- Decode JWT tokens
- Have JWT secret keys

Product Service DOES:
- Forward JWT tokens to User Service for validation
- Receive username from User Service if token is valid
- Protect endpoints based on User Service validation

### Authentication Flow Example

1. Client sends request with JWT token to Product Service
2. Product Service extracts token from Authorization header
3. Product Service calls User Service `/validate-token` endpoint
4. User Service validates token and returns username
5. Product Service proceeds with request if validation successful

## 🗄️ Database

Product Service uses its own PostgreSQL database:
- Database name: `product_service_db`
- Table: `products`

### Schema
- `id`: Primary key
- `name`: Product name
- `description`: Product description
- `price`: Product price (Numeric)
- `quantity`: Stock quantity
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## 🔧 Configuration

All configuration is done through environment variables:

- `DATABASE_URL`: Database connection string
- `USER_SERVICE_URL`: User Service endpoint for token validation
- `PORT`: Service port (default: 8002)

## 📦 Project Structure

```
product-service/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                 # Auth dependencies
│   │   └── products.py             # Product endpoints
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py             # Configuration
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py             # Database setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── product.py              # Product model
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py                 # Base repository
│   │   └── product_repository.py   # Product repository
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── product.py              # Pydantic schemas
│   ├── services/
│   │   ├── __init__.py
│   │   └── product_service.py      # Product business logic
│   └── utils/
│       ├── __init__.py
│       └── auth_client.py          # User Service client
├── alembic/                         # Database migrations
├── .env.example                     # Environment template
├── requirements.txt                 # Dependencies
└── README.md                        # This file
```

## 🐛 Troubleshooting

### User Service Connection Error

```bash
# Make sure User Service is running
curl http://localhost:8001/health

# Check USER_SERVICE_URL in .env
USER_SERVICE_URL=http://localhost:8001
```

### Database Connection Error
```bash
# Create database
createdb product_service_db

# Or use SQLite
DATABASE_URL=sqlite:///./product_service.db
```

### Port Already in Use
```bash
# Use different port
uvicorn app.main:app --port 8003
```

## 🔄 Inter-Service Communication

Product Service communicates with User Service using HTTP:

```python
# Example: Token validation
import httpx

async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8001/validate-token",
        json={"token": token}
    )
    data = response.json()
    if data.get("valid"):
        username = data.get("username")
```

## 🎯 Best Practices

- ✅ No JWT secret keys in Product Service
- ✅ All authentication delegated to User Service
- ✅ Environment-based configuration
- ✅ Separate database from User Service
- ✅ Clean Architecture principles
- ✅ Repository Pattern for data access
- ✅ Comprehensive error handling

---

**Built with FastAPI and Microservices Architecture**
