# 🔐 User Service - Authentication Microservice

Independent microservice for user authentication with JWT tokens.

## 📋 Features

- ✅ **User Registration**: `POST /register` - Create new user accounts
- ✅ **User Login**: `POST /login` - Authenticate and receive JWT token
- ✅ **Token Validation**: `POST /validate-token` - Validate JWT tokens (for other services)
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

## 🚀 Installation & Setup

### Prerequisites

- Python 3.9+
- PostgreSQL 12+ (or SQLite for development)
- pip or pipenv

### Steps

#### 1. Navigate to User Service directory
```bash
cd user-service
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
DATABASE_URL=postgresql://user:password@localhost:5432/user_service_db
SECRET_KEY=your-secret-key-change-this-in-production
PORT=8001
```

#### 5. Run Database Migrations
```bash
alembic upgrade head
```

#### 6. Run the Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Service will be available at: **http://localhost:8001**

## 📖 API Documentation

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 📝 API Endpoints

### 1. Register New User

```bash
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Validate Token

```bash
curl -X POST http://localhost:8001/validate-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response:**
```json
{
  "valid": true,
  "username": "testuser",
  "message": "Token is valid"
}
```

### 4. Health Check

```bash
curl http://localhost:8001/health
```

## 🔐 Security

- Passwords are hashed using bcrypt
- JWT tokens with configurable expiration
- Token validation for inter-service communication
- Environment-based configuration

## 🗄️ Database

User Service uses its own PostgreSQL database:
- Database name: `user_service_db`
- Table: `users`

### Schema
- `id`: Primary key
- `username`: Unique username
- `hashed_password`: Bcrypt hashed password
- `is_active`: User status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## 🔧 Configuration

All configuration is done through environment variables:

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT signing key (32+ characters)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: 30)
- `PORT`: Service port (default: 8001)

## 📦 Project Structure

```
user-service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   └── auth.py            # Authentication endpoints
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py        # Configuration
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py        # Database setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py            # User model
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py            # Base repository
│   │   └── user_repository.py # User repository
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py            # Pydantic schemas
│   ├── services/
│   │   ├── __init__.py
│   │   └── auth_service.py    # Auth business logic
│   └── utils/
│       ├── __init__.py
│       └── security.py        # Security utilities
├── alembic/                    # Database migrations
├── .env.example                # Environment template
├── requirements.txt            # Dependencies
└── README.md                   # This file
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Create database
createdb user_service_db

# Or use SQLite
DATABASE_URL=sqlite:///./user_service.db
```

### Port Already in Use
```bash
# Use different port
uvicorn app.main:app --port 8003
```

## 👥 Integration with Other Services

Product Service or other services can validate tokens by calling:

```python
import httpx

async def validate_token(token: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8001/validate-token",
            json={"token": token}
        )
        return response.json()
```

---

**Built with FastAPI and Clean Architecture principles**
