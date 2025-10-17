# GitHub Copilot Instructions for Python Microservices E-Commerce Platform

## 🎯 Project Overview

This is a **production-ready microservices e-commerce platform** demonstrating modern software architecture, DevOps practices, and observability. The system consists of 4 independent microservices with complete monitoring, logging, and tracing capabilities.

### Architecture Pattern
- **Microservices Architecture** with Database per Service
- **Clean Architecture** with Repository Pattern
- **Event-Driven Architecture** using RabbitMQ
- **REST API** for synchronous communication
- **Message Queue** for asynchronous communication

### Technology Stack
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic
- **Databases**: PostgreSQL 15 (3 instances - one per service)
- **Cache**: Redis 7
- **Message Broker**: RabbitMQ 3
- **Observability**: Prometheus, Grafana, Loki, Promtail, Jaeger, OpenTelemetry
- **Containerization**: Docker, Docker Compose
- **Frontend** (Planned): Svelte (to be implemented)

---

## 🏗️ System Architecture

### Services Overview

```
Client (Browser/Svelte) → API Services → Databases
                              ↓
                          Observability Stack
```

#### 1. **User Service** (Port 8001)
- **Purpose**: Authentication and user management
- **Database**: PostgreSQL (`user_service_db`)
- **Responsibilities**:
  - User registration and login
  - JWT token generation and validation
  - Password hashing (bcrypt)
  - Token validation endpoint for other services
- **Key Pattern**: Centralized authentication provider

#### 2. **Product Service** (Port 8002)
- **Purpose**: Product catalog management
- **Database**: PostgreSQL (`product_service_db`)
- **Cache**: Redis (TTL: 300s, Cache-aside pattern)
- **Responsibilities**:
  - Product CRUD operations
  - Cache management and invalidation
  - Delegates authentication to User Service
- **Key Pattern**: Cache-aside for read-heavy operations

#### 3. **Order Service** (Port 8003)
- **Purpose**: Order processing and management
- **Database**: PostgreSQL (`order_service_db`)
- **Message Queue**: RabbitMQ (publishes `order.created` events)
- **Responsibilities**:
  - Order creation and management
  - Product validation via Product Service
  - User authentication via User Service
  - Event publishing for notifications
- **Key Pattern**: Saga pattern for distributed transactions

#### 4. **Notification Service** (Port 8004)
- **Purpose**: Asynchronous notification processing
- **Message Queue**: RabbitMQ (consumes from `order_notifications` queue)
- **Responsibilities**:
  - Email/SMS/Push notification handling
  - Event-driven processing
- **Key Pattern**: Event consumer, stateless service

### Observability Stack
- **Prometheus** (Port 9090): Metrics collection
- **Grafana** (Port 3000): Visualization dashboards
- **Loki** (Port 3100): Log aggregation
- **Promtail**: Log collection
- **Jaeger** (Port 16686): Distributed tracing
- **OpenTelemetry**: Instrumentation

---

## 📁 Project Structure

```
python-micro/
├── user-service/              # Authentication microservice
│   ├── app/
│   │   ├── api/              # FastAPI routes
│   │   ├── config/           # Settings and configuration
│   │   ├── database/         # Database setup
│   │   ├── models/           # SQLAlchemy models
│   │   ├── repositories/     # Repository pattern implementation
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic layer
│   │   └── utils/            # Utilities (security, JWT)
│   ├── alembic/              # Database migrations
│   ├── start.sh              # Auto-migration startup script
│   ├── Dockerfile
│   └── requirements.txt
│
├── product-service/          # Product catalog microservice
│   ├── app/
│   │   ├── api/
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/           # Redis cache, auth client
│   ├── alembic/
│   ├── start.sh
│   ├── Dockerfile
│   └── requirements.txt
│
├── order-service/            # Order processing microservice
│   ├── app/
│   │   ├── api/
│   │   ├── config/
│   │   ├── database/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/           # RabbitMQ publisher, service clients
│   ├── alembic/
│   ├── start.sh
│   ├── Dockerfile
│   └── requirements.txt
│
├── notification-service/     # Notification processing microservice
│   ├── app/
│   │   ├── config/
│   │   └── utils/           # RabbitMQ consumer
│   ├── Dockerfile
│   └── requirements.txt
│
├── observability/            # Monitoring configuration
│   ├── grafana/
│   │   ├── dashboards/
│   │   └── provisioning/
│   ├── loki/
│   ├── prometheus/
│   └── promtail/
│
├── docker-compose.yml        # Orchestration
├── test-api.sh              # Basic API test script
├── test-complete.sh         # Comprehensive test script
├── verify-docs.sh           # API documentation verification
│
└── docs/
    ├── README.md
    ├── ARCHITECTURE.md       # Detailed architecture docs
    ├── API_DOCUMENTATION.md  # API reference
    ├── DEVOPS_README.md     # DevOps guide
    └── CHANGELOG.md         # Version history
```

---

## 🎨 Code Style and Conventions

### Python Code Style

#### General Guidelines
- Follow **PEP 8** style guide
- Use **type hints** for all function parameters and return values
- Use **docstrings** (Google style) for all classes and functions
- Maximum line length: **88 characters** (Black formatter compatible)
- Use **async/await** for I/O operations when possible

#### Naming Conventions
```python
# Classes: PascalCase
class UserRepository(BaseRepository[User]):
    pass

# Functions/Methods: snake_case
def get_user_by_username(username: str) -> Optional[User]:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
DEFAULT_PAGE_SIZE = 20

# Private methods: _leading_underscore
def _validate_token(self, token: str) -> bool:
    pass

# Files: snake_case.py
# user_repository.py, auth_service.py
```

#### Import Organization
```python
# 1. Standard library imports
from datetime import datetime
from typing import Optional, List

# 2. Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

# 3. Local application imports
from app.config import settings
from app.models import User
from app.repositories import UserRepository
```

### FastAPI Patterns

#### Route Definitions
```python
@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new user",
    description="Register a new user account with username and password",
    tags=["Users"]
)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Create a new user account.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        Created user information
        
    Raises:
        HTTPException 400: If username already exists
        HTTPException 422: If validation fails
    """
    pass
```

#### Dependency Injection Pattern
```python
# deps.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> int:
    """Get current authenticated user ID from JWT token."""
    pass

# Usage in routes
@router.get("/me")
async def get_current_user_info(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pass
```

### Repository Pattern

#### Base Repository
```python
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session

T = TypeVar('T')

class BaseRepository(Generic[T]):
    """Generic base repository with CRUD operations."""
    
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model
    
    def create(self, obj_data: dict) -> T:
        """Create new object."""
        pass
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Get object by ID."""
        pass
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """Get all objects with pagination."""
        pass
    
    def update(self, id: int, obj_data: dict) -> Optional[T]:
        """Update object."""
        pass
    
    def delete(self, id: int) -> bool:
        """Delete object."""
        pass
```

#### Specific Repository
```python
class UserRepository(BaseRepository[User]):
    """Repository for User model."""
    
    def __init__(self, db: Session):
        super().__init__(db, User)
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(
            User.username == username,
            User.is_active == True
        ).first()
    
    def exists_by_username(self, username: str) -> bool:
        """Check if username exists."""
        return self.db.query(User).filter(
            User.username == username
        ).first() is not None
```

### Service Layer Pattern

```python
class UserService:
    """Service class for user business logic."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
    
    def register_user(self, user_data: UserCreate) -> User:
        """
        Register new user with validation.
        
        Args:
            user_data: User registration data
            
        Returns:
            Created user
            
        Raises:
            ValueError: If username already exists
        """
        # Validation
        if self.user_repository.exists_by_username(user_data.username):
            raise ValueError(f"Username '{user_data.username}' already exists")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user_dict = {
            "username": user_data.username,
            "hashed_password": hashed_password,
            "is_active": True
        }
        
        return self.user_repository.create(user_dict)
```

### Pydantic Schema Patterns

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    """Base schema with common attributes."""
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    """Schema for user creation."""
    password: str = Field(..., min_length=6)
    
    @field_validator('password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        return v

class UserResponse(UserBase):
    """Schema for user response (no password)."""
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}
```

### SQLAlchemy Model Pattern

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class User(Base):
    """User model for authentication."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"
```

---

## 🔐 Security Best Practices

### Authentication Flow
1. User Service generates JWT tokens
2. Other services validate tokens via User Service REST API
3. **Never share JWT secret keys** between services
4. Services don't decode JWT tokens themselves

### Password Security
```python
import bcrypt

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )
```

### Environment Variables
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings from environment variables."""
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str  # Never hardcode!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Service URLs
    USER_SERVICE_URL: str = "http://user-service:8001"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

---

## 🔄 Service Communication Patterns

### Inter-Service REST API Calls

```python
import httpx
from typing import Optional

class AuthClient:
    """Client for User Service authentication."""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    async def validate_token(self, token: str) -> Optional[dict]:
        """
        Validate JWT token via User Service.
        
        Args:
            token: JWT token to validate
            
        Returns:
            User info if valid, None if invalid
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/validate-token",
                    json={"token": token},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("valid"):
                        return {
                            "username": data.get("username"),
                            "user_id": data.get("user_id")
                        }
                return None
                
            except httpx.RequestError as e:
                logger.error(f"Error validating token: {e}")
                return None
```

### Event Publishing (RabbitMQ)

```python
import aio_pika
import json

class EventPublisher:
    """RabbitMQ event publisher."""
    
    async def publish_order_created(self, order_data: dict):
        """Publish order.created event."""
        connection = await aio_pika.connect_robust(
            f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASSWORD}"
            f"@{settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}/"
        )
        
        async with connection:
            channel = await connection.channel()
            
            exchange = await channel.declare_exchange(
                "order_events",
                aio_pika.ExchangeType.TOPIC,
                durable=True
            )
            
            message = aio_pika.Message(
                body=json.dumps(order_data).encode(),
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            )
            
            await exchange.publish(
                message,
                routing_key="order.created"
            )
```

### Event Consumption (RabbitMQ)

```python
import aio_pika

class NotificationConsumer:
    """RabbitMQ event consumer for notifications."""
    
    async def start_consuming(self):
        """Start consuming order events."""
        connection = await aio_pika.connect_robust(
            f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASSWORD}"
            f"@{settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}/"
        )
        
        async with connection:
            channel = await connection.channel()
            await channel.set_qos(prefetch_count=10)
            
            exchange = await channel.declare_exchange(
                "order_events",
                aio_pika.ExchangeType.TOPIC,
                durable=True
            )
            
            queue = await channel.declare_queue(
                "order_notifications",
                durable=True
            )
            
            await queue.bind(exchange, routing_key="order.created")
            
            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    async with message.process():
                        await self.process_order_notification(message.body)
```

---

## 🗄️ Database Patterns

### Alembic Migrations

```python
# alembic/env.py
from app.database import Base
from app.models import User, Product, Order  # Import all models

target_metadata = Base.metadata

# Auto-generate migrations
alembic revision --autogenerate -m "Create users table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Database Session Management

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 🎯 Svelte Frontend Integration (Planned)

### Project Structure for Svelte UI

```
frontend/
├── src/
│   ├── lib/
│   │   ├── api/           # API client modules
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   └── orders.ts
│   │   ├── stores/        # Svelte stores
│   │   │   ├── auth.ts
│   │   │   ├── cart.ts
│   │   │   └── products.ts
│   │   └── utils/
│   │       ├── http.ts
│   │       └── validators.ts
│   ├── routes/
│   │   ├── +page.svelte          # Home page
│   │   ├── login/
│   │   ├── products/
│   │   └── orders/
│   └── app.html
├── static/
├── svelte.config.js
└── package.json
```

### API Client Pattern (TypeScript)

```typescript
// src/lib/api/client.ts
interface ApiConfig {
  baseUrl: string;
  token?: string;
}

class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.token = config.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(
      `${this.baseUrl}${endpoint}`,
      {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // Service-specific methods
  auth = {
    login: (username: string, password: string) =>
      this.request<{ access_token: string; token_type: string }>(
        '/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ username, password }),
        }
      ),
    
    register: (userData: UserCreate) =>
      this.request<UserResponse>('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  };

  products = {
    list: (skip = 0, limit = 20) =>
      this.request<Product[]>(`/products?skip=${skip}&limit=${limit}`),
    
    get: (id: number) =>
      this.request<Product>(`/products/${id}`),
    
    create: (productData: ProductCreate) =>
      this.request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      }),
  };

  orders = {
    create: (orderData: OrderCreate) =>
      this.request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    
    list: (skip = 0, limit = 20) =>
      this.request<Order[]>(`/orders?skip=${skip}&limit=${limit}`),
  };
}

// Export configured instances
export const userApi = new ApiClient({ baseUrl: 'http://localhost:8001' });
export const productApi = new ApiClient({ baseUrl: 'http://localhost:8002' });
export const orderApi = new ApiClient({ baseUrl: 'http://localhost:8003' });
```

### Svelte Store Pattern

```typescript
// src/lib/stores/auth.ts
import { writable } from 'svelte/store';
import { userApi } from '$lib/api/client';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserResponse | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  return {
    subscribe,
    
    login: async (username: string, password: string) => {
      const response = await userApi.auth.login(username, password);
      const token = response.access_token;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      update(state => ({
        ...state,
        isAuthenticated: true,
        token,
      }));
      
      return token;
    },
    
    logout: () => {
      localStorage.removeItem('token');
      set({
        isAuthenticated: false,
        token: null,
        user: null,
      });
    },
    
    initialize: () => {
      const token = localStorage.getItem('token');
      if (token) {
        update(state => ({
          ...state,
          isAuthenticated: true,
          token,
        }));
      }
    },
  };
}

export const authStore = createAuthStore();
```

### Svelte Component Pattern

```svelte
<!-- src/routes/products/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { productApi } from '$lib/api/client';
  import { authStore } from '$lib/stores/auth';
  
  let products: Product[] = [];
  let loading = true;
  let error = '';
  
  onMount(async () => {
    try {
      products = await productApi.products.list();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="loading">Loading products...</div>
{:else if error}
  <div class="error">{error}</div>
{:else}
  <div class="product-grid">
    {#each products as product (product.id)}
      <div class="product-card">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <p class="price">${product.price}</p>
        <button on:click={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
  
  .product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2563eb;
  }
</style>
```

---

## 📊 Testing Patterns

### Unit Tests

```python
import pytest
from app.services import UserService
from app.models import User

def test_register_user_success(db_session):
    """Test successful user registration."""
    service = UserService(db_session)
    user_data = UserCreate(username="testuser", password="Test@123")
    
    user = service.register_user(user_data)
    
    assert user.username == "testuser"
    assert user.is_active is True
    assert user.id is not None

def test_register_user_duplicate_username(db_session):
    """Test registration with existing username."""
    service = UserService(db_session)
    user_data = UserCreate(username="testuser", password="Test@123")
    
    service.register_user(user_data)
    
    with pytest.raises(ValueError, match="already exists"):
        service.register_user(user_data)
```

### Integration Tests

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_product_with_auth():
    """Test product creation with authentication."""
    # Login first
    login_response = client.post(
        "/login",
        data={"username": "testuser", "password": "Test@123"}
    )
    token = login_response.json()["access_token"]
    
    # Create product
    response = client.post(
        "/products",
        json={"name": "Test Product", "price": 99.99, "quantity": 10},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    assert response.json()["name"] == "Test Product"
```

---

## 🚀 Docker and Deployment

### Dockerfile Pattern

```dockerfile
# Multi-stage build
FROM python:3.11-slim as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl && \
    rm -rf /var/lib/apt/lists/*

# Copy dependencies and code
COPY --from=builder /root/.local /usr/local
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["./start.sh"]
```

### Startup Script Pattern

```bash
#!/bin/bash
set -e

echo "Waiting for database..."
sleep 5

# Create migrations directory
mkdir -p /app/alembic/versions

# Generate migration if needed
if [ ! "$(ls -A /app/alembic/versions)" ]; then
    echo "Creating initial migration..."
    alembic revision --autogenerate -m "Initial migration"
fi

# Apply migrations
echo "Running database migrations..."
alembic upgrade head

# Start application
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

---

## 📝 Documentation Standards

### API Documentation
- Use FastAPI's automatic OpenAPI documentation
- Add clear descriptions to all endpoints
- Include request/response examples
- Document all possible error responses

### Code Documentation
- Write docstrings for all public functions and classes
- Use type hints consistently
- Add inline comments for complex logic
- Keep README files up-to-date

### Architecture Documentation
- Maintain ARCHITECTURE.md with system design
- Document design decisions and trade-offs
- Include sequence diagrams for complex flows
- Keep deployment guides current

---

## 🔍 Observability

### Logging Pattern

```python
import logging

logger = logging.getLogger(__name__)

# Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
logger.info("User logged in successfully", extra={"user_id": user.id})
logger.error("Failed to connect to database", exc_info=True)
```

### Metrics Pattern

```python
from prometheus_client import Counter, Histogram

# Counter for requests
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

# Histogram for latency
REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

# Usage
REQUEST_COUNT.labels(method='POST', endpoint='/orders', status='201').inc()
```

### Tracing Pattern

```python
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Instrument FastAPI app
FastAPIInstrumentor.instrument_app(app)

# Manual span creation
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("validate_order"):
    # Your code here
    pass
```

---

## 🎓 Best Practices Summary

### DO ✅
- Use type hints for all function signatures
- Write comprehensive docstrings
- Follow Repository Pattern for data access
- Use dependency injection in FastAPI
- Validate input with Pydantic schemas
- Handle errors gracefully with proper HTTP status codes
- Use environment variables for configuration
- Write unit and integration tests
- Add proper logging and monitoring
- Use async/await for I/O operations
- Keep services independent and loosely coupled
- Document API endpoints thoroughly

### DON'T ❌
- Don't share JWT secret keys between services
- Don't use raw SQL queries (use ORM)
- Don't hardcode configuration values
- Don't ignore error handling
- Don't skip input validation
- Don't create circular dependencies between services
- Don't expose internal implementation details in APIs
- Don't forget to add health check endpoints
- Don't skip database migrations
- Don't commit sensitive data to git

---

## 🆘 Common Issues and Solutions

### Database Connection Issues
```python
# Use pool_pre_ping to handle stale connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

### JWT Token Validation
```python
# Always validate tokens via User Service
# Don't decode JWT in other services
async def validate_token(token: str) -> dict:
    response = await httpx.post(
        f"{settings.USER_SERVICE_URL}/validate-token",
        json={"token": token},
        timeout=5.0
    )
    return response.json()
```

### RabbitMQ Connection Recovery
```python
# Use connect_robust for automatic reconnection
connection = await aio_pika.connect_robust(
    f"amqp://{settings.RABBITMQ_HOST}/",
    reconnect_interval=5
)
```

---

## 📚 Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **SQLAlchemy 2.0 Documentation**: https://docs.sqlalchemy.org
- **Pydantic Documentation**: https://docs.pydantic.dev
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Microservices Patterns**: https://microservices.io/patterns/
- **Svelte Documentation**: https://svelte.dev/docs
- **OpenTelemetry Python**: https://opentelemetry.io/docs/languages/python/

---

## 🎯 Project Goals

This project serves as:
1. **Educational Resource**: Learn microservices architecture
2. **Reference Implementation**: Best practices demonstration
3. **Production Template**: Starting point for real projects
4. **DevOps Showcase**: Complete CI/CD and observability

---

**Version**: 1.4.0  
**Last Updated**: 2025-10-18  
**Maintainer**: Cong Dinh (@congdinh2008)  
**License**: MIT
