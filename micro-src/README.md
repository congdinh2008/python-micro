# 🚀 Python Microservices E-Commerce Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-24+-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A **production-ready microservices architecture** for e-commerce applications, built with **FastAPI**, **PostgreSQL**, **Redis**, **RabbitMQ**, and comprehensive **observability stack** (Prometheus, Grafana, Loki, Jaeger).

> **Complete DevOps Foundation**: Containerization • CI/CD • Distributed Tracing • Centralized Logging • Metrics & Monitoring

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start-5-minutes)
- [Architecture](#-architecture)
- [Services](#-services)
- [Technology Stack](#-technology-stack)
- [Development Guide](#-development-guide)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Observability & Monitoring](#-observability--monitoring)
- [CI/CD Pipeline](#-cicd-pipeline)
- [CORS Configuration](#-cors-configuration)
- [Troubleshooting](#-troubleshooting)
- [Changelog](#-changelog)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

This project demonstrates a **complete microservices architecture** with 4 independent services, implementing modern software engineering and DevOps best practices.

### Architecture Patterns
- ✅ **Microservices Architecture** - Database per Service pattern
- ✅ **Clean Architecture** - Repository Pattern with Dependency Injection
- ✅ **Event-Driven Architecture** - RabbitMQ for async messaging
- ✅ **API Gateway Pattern** - JWT-based authentication
- ✅ **Cache-Aside Pattern** - Redis for performance optimization

### DevOps & Observability
- ✅ **Containerization** - Docker multi-stage builds, non-root users
- ✅ **Orchestration** - Docker Compose with health checks
- ✅ **CI/CD** - GitHub Actions with automated testing & deployment
- ✅ **Distributed Tracing** - OpenTelemetry + Jaeger
- ✅ **Centralized Logging** - Loki + Promtail
- ✅ **Metrics & Monitoring** - Prometheus + Grafana
- ✅ **Security** - JWT authentication, bcrypt password hashing, CORS configuration

### System Capabilities
- **4 Microservices**: User, Product, Order, Notification
- **3 PostgreSQL Databases**: Isolated data per service
- **Redis Cache**: Product catalog caching with TTL
- **RabbitMQ**: Async event processing
- **Complete Observability**: Metrics, Logs, Traces in one place

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Docker Desktop** (24.0+) with Docker Compose
- **8GB RAM** available
- **10GB free disk space**
- **Required ports** available:
  - Application: 8001-8004
  - Databases: 5433-5435
  - Infrastructure: 6379 (Redis), 5672, 15672 (RabbitMQ)
  - Observability: 3000 (Grafana), 3100 (Loki), 9090 (Prometheus), 16686 (Jaeger)

### Three Ways to Deploy

#### Option 1: Automated Script (Recommended) ⭐

```bash
# Clone repository
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro/micro-src

# Run automated deployment
bash deploy.sh
```

The script automatically:
- ✅ Checks Docker installation
- ✅ Creates environment configuration
- ✅ Builds Docker images
- ✅ Starts all services
- ✅ Waits for health checks
- ✅ Displays service status

#### Option 2: Using Makefile

```bash
cd python-micro/micro-src

# Complete development setup
make dev-setup

# Or step by step
make setup      # Create .env file
make build      # Build Docker images
make up         # Start services
make status     # Check status
```

#### Option 3: Manual Docker Compose

```bash
cd python-micro/micro-src

# Create environment file
cp .env.example .env

# Start all services
docker compose up -d --build

# Wait for services (60 seconds)
sleep 60

# Verify services
docker compose ps
```

### Quick Status Check

```bash
# Using script
bash check-status.sh

# Using Makefile
make status

# Manual check
docker compose ps
```

### Step 2: Test the System (2 minutes)

```bash
# 1. Register a user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"Demo@123"}'

# 2. Login and get JWT token
# Option 1: With jq (recommended)
TOKEN=$(curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo&password=Demo@123" \
  | jq -r '.access_token')

# Option 2: Without jq (copy token manually)
# curl -X POST http://localhost:8001/login \
#   -H "Content-Type: application/x-www-form-urlencoded" \
#   -d "username=demo&password=Demo@123"
# Then set: TOKEN="<your_token_here>"

echo "Token: $TOKEN"

# 3. Create a product
curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name":"Laptop Dell XPS 15",
    "description":"High-performance laptop",
    "price":1299.99,
    "quantity":10
  }'

# 4. List products (will be cached in Redis)
curl http://localhost:8002/products | jq

# 5. Create an order (triggers notification)
curl -X POST http://localhost:8003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "product_id":1,
    "quantity":2
  }' | jq

# 6. View order notification in logs
docker compose logs notification-service --tail=20
```

### Step 3: Explore Observability (1 minute)

#### Access Monitoring Tools

| Tool | URL | Credentials | Purpose |
|------|-----|-------------|---------|
| **Grafana** | http://localhost:3000 | admin/admin | Unified dashboards |
| **Jaeger** | http://localhost:16686 | - | Distributed tracing |
| **Prometheus** | http://localhost:9090 | - | Metrics explorer |
| **RabbitMQ** | http://localhost:15672 | guest/guest | Message queue |

#### Grafana Dashboards
1. Open: http://localhost:3000
2. Login: admin / admin
3. Go to: Dashboards → Microservices Overview
4. See: Request rates, response times, error rates

#### Jaeger Traces
1. Open: http://localhost:16686
2. Select: "Order Service"
3. Click: "Find Traces"
4. View: Complete request flow across all services

#### Prometheus Metrics
1. Open: http://localhost:9090
2. Query examples:
   - `rate(http_requests_total[5m])` - Request rate
   - `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` - P95 latency

#### Loki Logs (in Grafana)
1. Grafana → Explore → Select Loki
2. Query: `{job=~".*-service"}`
3. Filter: `{job="order-service"} |= "created"`

### What You Just Deployed

#### 4 Microservices
✅ **User Service** - Authentication with JWT  
✅ **Product Service** - Catalog with Redis cache  
✅ **Order Service** - Orders with RabbitMQ events  
✅ **Notification Service** - Async notifications  

#### 3 Databases
✅ PostgreSQL for each service (isolated data)

#### 2 Infrastructure Services
✅ **Redis** - Caching layer  
✅ **RabbitMQ** - Message broker  

#### Complete Observability Stack
✅ **Prometheus** - Metrics collection  
✅ **Loki** - Log aggregation  
✅ **Jaeger** - Distributed tracing  
✅ **Grafana** - Unified visualization  
✅ **Promtail** - Log collector  

### Interactive API Documentation

- **User Service**: http://localhost:8001/docs
- **Product Service**: http://localhost:8002/docs
- **Order Service**: http://localhost:8003/docs
- **Notification Service**: http://localhost:8004/docs

Try the "Try it out" feature in Swagger UI!

### Common Commands

#### Using Makefile (Recommended)

```bash
make help           # Show all available commands
make status         # Check service status with health checks
make logs           # View all logs
make logs-service SERVICE=user-service  # View specific service
make health         # Detailed health check
make restart        # Restart all services
make down           # Stop services
make clean          # Remove all containers and volumes
make docs           # Open API documentation
make monitoring     # Open monitoring dashboards
```

#### Using Docker Compose

```bash
docker compose ps              # List containers
docker compose logs -f         # View logs
docker compose restart         # Restart all
docker compose down            # Stop all
docker compose down -v         # Stop and remove volumes
```

#### Using Scripts

```bash
bash check-status.sh           # Quick status check
bash deploy.sh                 # Full deployment
```

### Stop Services

```bash
# Graceful shutdown
make down
# or
docker compose down

# Complete cleanup (removes data)
make clean
# or
docker compose down -v --remove-orphans
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Applications                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┐
    ▼            ▼            ▼              ▼              ▼
┌────────┐  ┌─────────┐  ┌─────────┐    ┌─────────┐    ┌──────────┐
│ User   │  │Product  │  │ Order   │    │Notifica-│    │ Grafana  │
│Service │  │Service  │  │Service  │    │tion Svc │    │Dashboard │
│:8001   │  │:8002    │  │:8003    │    │:8004    │    │:3000     │
└───┬────┘  └────┬────┘  └────┬────┘    └────┬────┘    └────┬─────┘
    │            │            │              │              │
    │       ┌────▼────┐       │              │         ┌────▼────┐
    │       │ Redis   │       │              │         │  Loki   │
    │       │ Cache   │       │              │         │  :3100  │
    ▼       └─────────┘       ▼              ▼         └─────────┘
┌─────────┐             ┌──────────┐   ┌──────────┐  ┌──────────┐
│User DB  │             │ Order DB │   │ RabbitMQ │  │Promtail  │
│Postgres │             │ Postgres │   │  :5672   │  └──────────┘
└─────────┘             └──────────┘   └──────────┘  
                                                     ┌──────────┐
┌──────────┐                                         │Prometheus│
│Product DB│                                         │  :9090   │
│ Postgres │                                         └──────────┘
└──────────┘                                         
                                                     ┌──────────┐
                                                     │  Jaeger  │
                                                     │  :16686  │
                                                     └──────────┘
```

### Architecture Principles

#### Microservices Architecture
- **Independent Services**: Each service is independently deployable
- **Database per Service**: Each service has its own database
- **Service Communication**: REST API for synchronous, RabbitMQ for asynchronous
- **Decentralized Data Management**: No shared databases between services

#### Clean Architecture
- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Rule**: Dependencies point inward
- **Framework Independence**: Business logic independent of frameworks
- **Testability**: Each layer can be tested independently

#### Repository Pattern
- **Data Access Abstraction**: Repository layer abstracts data access
- **Generic Base Repository**: Reusable CRUD operations
- **Type Safety**: Python Generics for type-safe operations

### Service Communication Patterns

#### Synchronous Communication (REST API)

```
1. Product Service → User Service
   Purpose: Token validation
   Method: POST /validate-token
   
2. Order Service → User Service
   Purpose: Token validation
   Method: POST /validate-token
   
3. Order Service → Product Service
   Purpose: Product validation
   Method: GET /products/{id}
```

**Benefits**: Simple, immediate response, easy debugging  
**Trade-offs**: Service coupling, requires availability

#### Asynchronous Communication (RabbitMQ)

```
Order Service → RabbitMQ (order_events) → Notification Service

Flow:
1. Order Service publishes order.created event
2. RabbitMQ routes to order_notifications queue
3. Notification Service consumes and processes
```

**Benefits**: Loose coupling, resilience, scalability  
**Trade-offs**: Eventual consistency, complex debugging

---

## 🔧 Services

### Application Services

| Service | Port | Health Check | API Docs | Database |
|---------|------|--------------|----------|----------|
| **User Service** | 8001 | http://localhost:8001/health | http://localhost:8001/docs | PostgreSQL:5433 |
| **Product Service** | 8002 | http://localhost:8002/health | http://localhost:8002/docs | PostgreSQL:5434 |
| **Order Service** | 8003 | http://localhost:8003/health | http://localhost:8003/docs | PostgreSQL:5435 |
| **Notification Service** | 8004 | http://localhost:8004/health | http://localhost:8004/docs | - (stateless) |

### Service Details

#### 1. User Service (Port 8001)

**Purpose**: Centralized authentication and user management

**Responsibilities**:
- User registration with password hashing (bcrypt)
- JWT token generation and validation
- Token validation endpoint for other services
- User profile management

**Technology**: FastAPI, PostgreSQL, JWT, Bcrypt

**Database Schema**:
```sql
users
├── id (primary key)
├── username (unique, indexed)
├── hashed_password
├── is_active
├── created_at
└── updated_at
```

**Key Endpoints**:
- `POST /register` - User registration
- `POST /login` - Login (returns JWT token)
- `POST /validate-token` - Token validation (for other services)
- `GET /health` - Health check

**Dependencies**: PostgreSQL database only

#### 2. Product Service (Port 8002)

**Purpose**: Product catalog with caching

**Responsibilities**:
- Product CRUD operations
- Redis caching with cache-aside pattern
- Cache invalidation on updates
- Authentication via User Service

**Technology**: FastAPI, PostgreSQL, Redis, HTTPX

**Database Schema**:
```sql
products
├── id (primary key)
├── name
├── description
├── price (numeric)
├── quantity
├── created_at
└── updated_at
```

**Cache Strategy**:
- **Key**: `product:{id}`
- **TTL**: 300 seconds
- **Invalidation**: On update/delete
- **Fallback**: Direct DB query if Redis unavailable

**Key Endpoints**:
- `POST /products` - Create product (requires JWT)
- `GET /products` - List products (public)
- `GET /products/{id}` - Get product (cached, public)
- `PUT /products/{id}` - Update product (requires JWT, invalidates cache)
- `DELETE /products/{id}` - Delete product (requires JWT, invalidates cache)
- `GET /health` - Health check (includes Redis status)

**Dependencies**: PostgreSQL, Redis, User Service

#### 3. Order Service (Port 8003)

**Purpose**: Order processing with event publishing

**Responsibilities**:
- Order creation and management
- Product validation via Product Service
- User authentication via User Service
- Event publishing to RabbitMQ

**Technology**: FastAPI, PostgreSQL, RabbitMQ, HTTPX

**Database Schema**:
```sql
orders
├── id (primary key)
├── user_id
├── product_id
├── quantity
├── total_price
├── status (pending/completed/cancelled)
├── created_at
└── updated_at
```

**Event Publishing**:
- **Exchange**: `order_events` (topic)
- **Routing Key**: `order.created`
- **Message Format**: JSON
- **Persistence**: Durable messages

**Key Endpoints**:
- `POST /orders` - Create order (requires JWT, publishes event)
- `GET /orders` - List user's orders (requires JWT)
- `GET /orders/{id}` - Get order details (requires JWT)
- `PUT /orders/{id}` - Update order status (requires JWT)
- `DELETE /orders/{id}` - Delete order (requires JWT)
- `GET /health` - Health check (includes RabbitMQ status)

**Dependencies**: PostgreSQL, RabbitMQ, User Service, Product Service

#### 4. Notification Service (Port 8004)

**Purpose**: Asynchronous notification processing

**Responsibilities**:
- Consume order events from RabbitMQ
- Send email/SMS/push notifications
- Log notification activities

**Technology**: FastAPI, RabbitMQ (stateless, no database)

**Event Consumption**:
- **Queue**: `order_notifications`
- **Binding**: `order_events` exchange
- **Routing Key**: `order.created`
- **Acknowledgment**: Auto-acknowledge on success

**Key Endpoints**:
- `GET /health` - Health check (includes RabbitMQ status)

**Dependencies**: RabbitMQ only

### Infrastructure Services

| Service | Port(s) | Access | Credentials |
|---------|---------|--------|-------------|
| **PostgreSQL (User)** | 5433 | localhost:5433 | user/password |
| **PostgreSQL (Product)** | 5434 | localhost:5434 | user/password |
| **PostgreSQL (Order)** | 5435 | localhost:5435 | user/password |
| **Redis Cache** | 6379 | localhost:6379 | - |
| **RabbitMQ** | 5672, 15672 | http://localhost:15672 | guest/guest |

### Observability Stack

| Tool | Port | Access | Credentials | Purpose |
|------|------|--------|-------------|---------|
| **Grafana** | 3000 | http://localhost:3000 | admin/admin | Unified dashboards |
| **Prometheus** | 9090 | http://localhost:9090 | - | Metrics collection |
| **Loki** | 3100 | http://localhost:3100 | - | Log aggregation |
| **Jaeger** | 16686 | http://localhost:16686 | - | Distributed tracing |
| **Promtail** | - | - | - | Log collector |

---

## 💻 Technology Stack

### Backend Framework
- **FastAPI** - Modern Python web framework with automatic API documentation
- **SQLAlchemy 2.0** - Python SQL toolkit and Object-Relational Mapping
- **Alembic** - Database migration tool for SQLAlchemy
- **Pydantic** - Data validation using Python type annotations

### Databases & Cache
- **PostgreSQL 15** - Relational database (3 independent instances)
- **Redis 7** - In-memory data structure store for caching

### Messaging
- **RabbitMQ 3** - Message broker for async communication

### Observability
- **Prometheus** - Metrics collection and storage
- **Grafana** - Metrics visualization and dashboards
- **Loki** - Log aggregation system
- **Promtail** - Agent for shipping logs to Loki
- **Jaeger** - Distributed tracing platform
- **OpenTelemetry** - Observability framework for cloud-native software

### DevOps
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD automation

### Security
- **python-jose** - JWT implementation
- **passlib** - Password hashing library
- **bcrypt** - Modern password hashing

---

## 🛠️ Development Guide

### Project Structure

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
│   ├── tests/                # Unit and integration tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── start.sh
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
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── start.sh
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
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── start.sh
│
├── notification-service/     # Notification processing microservice
│   ├── app/
│   │   ├── config/
│   │   └── utils/           # RabbitMQ consumer
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── start.sh
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
└── README.md                 # This file
```

### Local Development

#### Run Individual Service

```bash
# Navigate to service directory
cd user-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start service
uvicorn app.main:app --reload --port 8001
```

#### Run with Docker Compose

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d user-service

# View logs
docker compose logs -f user-service

# Stop services
docker compose down

# Rebuild after code changes
docker compose up -d --build user-service
```

### Database Migrations

```bash
# Create new migration
cd user-service
alembic revision --autogenerate -m "Add new field to users"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# View current version
alembic current
```

### Environment Configuration

Each service has `.env.example` file. Copy and customize:

```bash
# User Service .env
DATABASE_URL=postgresql://user:password@localhost:5433/user_service_db
SECRET_KEY=your-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=8001

# Product Service .env
DATABASE_URL=postgresql://user:password@localhost:5434/product_service_db
USER_SERVICE_URL=http://localhost:8001
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=8002

# Order Service .env
DATABASE_URL=postgresql://user:password@localhost:5435/order_service_db
USER_SERVICE_URL=http://localhost:8001
PRODUCT_SERVICE_URL=http://localhost:8002
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
PORT=8003

# Notification Service .env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
PORT=8004
```

---

## 🧪 Testing

### Testing Strategy

#### 1. Manual Testing with curl

Start services locally or with Docker, then test endpoints:

```bash
# 1. Check health endpoints
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health

# 2. Register a user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "Test@123"}'

# 3. Login and get token
TOKEN=$(curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test@123" | jq -r '.access_token')

echo "Token: $TOKEN"

# 4. Validate token (User Service)
curl -X POST http://localhost:8001/validate-token \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"

# 5. Create product with token
curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "quantity": 10
  }'

# 6. Get all products (public)
curl http://localhost:8002/products

# 7. Get specific product (cached)
curl http://localhost:8002/products/1

# 8. Create order
curl -X POST http://localhost:8003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'

# 9. Check notification logs
docker compose logs notification-service --tail=20

# 10. Test unauthorized access (should return 401)
curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Unauthorized", "price": 10, "quantity": 1}'
```

#### 2. Testing with Swagger UI

Each service provides interactive API documentation:

**User Service**: http://localhost:8001/docs
1. Test `/register` endpoint
2. Test `/login` endpoint and copy the access_token
3. Test `/validate-token` endpoint

**Product Service**: http://localhost:8002/docs
1. Click "Authorize" button at top right
2. Paste token in format: `Bearer <your_token>`
3. Test all product endpoints

**Order Service**: http://localhost:8003/docs
1. Click "Authorize" button
2. Paste your JWT token
3. Test order creation and listing

**Notification Service**: http://localhost:8004/docs
1. Check health endpoint
2. View service status

#### 3. Integration Testing

Create `integration-test.sh`:

```bash
#!/bin/bash
set -e

echo "=== Integration Test ==="

echo "1. Testing User Service health..."
curl -s http://localhost:8001/health | jq

echo "2. Registering user..."
curl -s -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username": "integrationtest", "password": "Test@123"}' | jq

echo "3. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=integrationtest&password=Test@123" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

echo "4. Creating product..."
PRODUCT=$(curl -s -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Integration Test Product",
    "description": "Test product",
    "price": 199.99,
    "quantity": 5
  }')

PRODUCT_ID=$(echo "$PRODUCT" | jq -r '.id')

if [ "$PRODUCT_ID" = "null" ] || [ -z "$PRODUCT_ID" ]; then
  echo "❌ Failed to create product"
  exit 1
fi

echo "✅ Created product with ID: $PRODUCT_ID"

echo "5. Creating order..."
ORDER=$(curl -s -X POST http://localhost:8003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"product_id\": $PRODUCT_ID, \"quantity\": 2}")

echo "$ORDER" | jq

echo "6. Checking notification logs..."
docker compose logs notification-service --tail=10

echo "✅ Integration test completed successfully!"
```

Run the test:
```bash
chmod +x integration-test.sh
./integration-test.sh
```

#### 4. Unit Testing

Run pytest for individual services:

```bash
# User Service
cd user-service
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html

# Product Service
cd product-service
pytest tests/ -v --cov=app

# Order Service
cd order-service
pytest tests/ -v --cov=app
```

#### 5. Performance Testing

Using Apache Bench (ab):

```bash
# Test login endpoint
echo "username=testuser&password=Test@123" > login.txt
ab -n 1000 -c 10 -p login.txt -T 'application/x-www-form-urlencoded' \
  http://localhost:8001/login

# Test GET products endpoint
ab -n 1000 -c 10 http://localhost:8002/products

# Cleanup
rm login.txt
```

Using wrk (if installed):

```bash
# Test GET endpoint
wrk -t4 -c100 -d30s http://localhost:8002/products

# Test POST with authentication
cat > post.lua << 'EOF'
wrk.method = "POST"
wrk.headers["Content-Type"] = "application/json"
wrk.headers["Authorization"] = "Bearer YOUR_TOKEN_HERE"
wrk.body = '{"name":"Test","price":10,"quantity":5}'
EOF

wrk -t4 -c100 -d30s -s post.lua http://localhost:8002/products
rm post.lua
```

### Expected Test Results

**Successful Test Indicators**:
1. ✅ Health checks return status "healthy"
2. ✅ User registration returns user object with id
3. ✅ Login returns access_token and token_type
4. ✅ Token validation returns valid=true
5. ✅ Product CRUD operations work with valid token
6. ✅ Orders are created and notifications are sent
7. ✅ Unauthorized requests return 401 status

### Common Testing Issues

1. **Port in use**: Change ports in .env files
2. **User Service unreachable**: Check USER_SERVICE_URL in product-service/.env
3. **Database errors**: Run migrations with `alembic upgrade head`
4. **Token validation fails**: Ensure User Service is running
5. **Redis connection error**: Check if Redis container is running

---

## 🚀 Deployment

> **📖 Complete Deployment Guide**: For detailed deployment instructions, troubleshooting, and production best practices, see **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Deployment

#### Development (5 Minutes)

```bash
# Option 1: Automated Script (Recommended)
bash deploy.sh

# Option 2: Using Makefile
make dev-setup

# Option 3: Manual Docker Compose
cp .env.example .env
docker compose up -d --build
```

#### Verify Deployment

```bash
# Check status
bash check-status.sh

# Or use Makefile
make status
```

### Common Commands

```bash
# Service Management
make up              # Start services
make down            # Stop services
make restart         # Restart services
make status          # Check health

# Monitoring
make logs            # View all logs
make monitoring      # Open dashboards

# Testing
make test-api        # Run API tests

# Maintenance
make backup-db       # Backup databases
make clean           # Remove all containers
```

### Deployment Options

| Environment | Method | Configuration | Guide |
|-------------|--------|---------------|-------|
| **Local Development** | `make dev-setup` or `bash deploy.sh` | `.env` defaults | [Quick Start](#-quick-start-5-minutes) |
| **Staging** | Docker Compose + Nginx | `.env.staging` | [DEPLOYMENT.md](DEPLOYMENT.md#staging-environment) |
| **Production** | Docker Compose or K8s | `.env.production` | [DEPLOYMENT.md](DEPLOYMENT.md#-production-deployment) |

### Environment Configuration

```bash
# Copy template
cp .env.example .env

# Key variables to review
ENVIRONMENT=development
ALLOWED_ORIGINS=*
SECRET_KEY=your-secret-key-change-this-in-production-min-32-characters-required
```

**For production**, generate secure secrets:
```bash
openssl rand -hex 32  # SECRET_KEY
openssl rand -hex 16  # Database passwords
```

### Access Services After Deployment

- **API Documentation**: http://localhost:8001/docs
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **RabbitMQ**: http://localhost:15672 (guest/guest)

### Need Help?

- **Detailed Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Troubleshooting**: [DEPLOYMENT.md - Troubleshooting](DEPLOYMENT.md#-troubleshooting)
- **Production Setup**: [DEPLOYMENT.md - Production](DEPLOYMENT.md#-production-deployment)

---

## 📊 Observability & Monitoring

### Three Pillars of Observability

#### 1. Metrics (Prometheus + Grafana)

**Collection**:
- Prometheus scrapes `/metrics` endpoints every 15s
- Services expose metrics via `prometheus-fastapi-instrumentator`
- Redis metrics via `redis-exporter`

**Available Metrics**:
- **RED Metrics**: Rate, Errors, Duration
- **HTTP Metrics**: Request rate, response time (P50, P95, P99), error rate
- **System Metrics**: CPU, memory, disk, network
- **Database Metrics**: Connection pool, query performance
- **Cache Metrics**: Redis hit/miss rate, memory usage
- **Queue Metrics**: RabbitMQ message rate, queue depth

**Access Grafana**:
1. Open http://localhost:3000
2. Login: admin/admin
3. Navigate to "Microservices Overview" dashboard

**Sample Prometheus Queries**:
```promql
# Request rate per service
rate(http_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Cache hit rate
rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))
```

#### 2. Logging (Loki + Promtail)

**Collection**:
- Promtail scrapes Docker container logs
- Automatic label extraction from containers
- Structured JSON log parsing

**Log Structure**:
```json
{
  "timestamp": "2025-10-18T09:00:00.000Z",
  "level": "INFO",
  "service": "user-service",
  "message": "User registered successfully",
  "user_id": 123,
  "trace_id": "abc123"
}
```

**Query Logs in Grafana**:
1. Go to Explore in Grafana
2. Select Loki datasource
3. Example LogQL queries:

```logql
# All logs from order service
{job="order-service"}

# Error logs from all services
{job=~".*-service"} |= "ERROR"

# Logs for specific order
{job="order-service"} |= "order_id=123"

# Logs with trace correlation
{job=~".*-service"} | json | trace_id="abc123"
```

**Retention**: 7 days (configurable in Loki config)

#### 3. Tracing (Jaeger + OpenTelemetry)

**Instrumentation**:
- OpenTelemetry auto-instrumentation for:
  - FastAPI requests and responses
  - Database queries (SQLAlchemy)
  - HTTP clients (HTTPX)
  - Redis operations
  - RabbitMQ messages

**Trace Structure**:
```
Trace ID: abc123
  Span: HTTP POST /orders (Order Service) - 245ms
    Span: Validate token (HTTPX → User Service) - 25ms
    Span: Get product (HTTPX → Product Service) - 35ms
      Span: Redis GET product:1 - 2ms
      Span: PostgreSQL SELECT product - 15ms
    Span: PostgreSQL INSERT order - 45ms
    Span: RabbitMQ publish order.created - 12ms
```

**Access Jaeger**:
1. Open http://localhost:16686
2. Select service (e.g., "Order Service")
3. Click "Find Traces"
4. View detailed trace timeline and spans
5. Analyze service dependencies

**Benefits**:
- Identify performance bottlenecks
- Track errors across services
- Understand service dependencies
- Debug distributed transactions

### Correlation Between Pillars

**Logs ↔ Traces**:
- Trace ID automatically added to logs
- Click log entry → View complete trace
- Filter logs by trace ID

**Metrics ↔ Traces**:
- High error rate in metrics → Find failed traces
- Slow requests in metrics → Analyze trace timeline

**Traces ↔ Logs**:
- Trace span → Related log entries
- Error in trace → View error logs with context

### Grafana Dashboards

Pre-configured dashboards included:

1. **Microservices Overview**
   - Request rates across all services
   - Response times (P50, P95, P99)
   - Error rates
   - Service health status

2. **Database Performance**
   - Connection pool metrics
   - Query performance
   - Slow query tracking

3. **Redis Cache**
   - Hit/miss rates
   - Memory usage
   - Key eviction rates

4. **RabbitMQ**
   - Message rates
   - Queue depths
   - Consumer performance

### Setting Up Alerts

Configure Grafana alerts for critical metrics:

```yaml
# Example: High error rate alert
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value }} errors/sec"
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project includes a complete CI/CD pipeline using GitHub Actions.

**Triggers**:
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master`, `main`, or `develop`

**Pipeline Jobs**:

#### 1. Test Job (Matrix: 4 services)

Runs in parallel for all services:

**Steps**:
1. ✅ Checkout code
2. ✅ Set up Python 3.11 with pip caching
3. ✅ Install dependencies from `requirements.txt`
4. ✅ Run flake8 linting
   - Stop on syntax errors (E9, F63, F7, F82)
   - Report code quality issues
5. ✅ Run pytest with coverage
   - Execute all tests in `tests/` directory
   - Generate coverage report
6. ✅ Upload coverage to Codecov

**Output**:
- Linting report
- Test results
- Coverage percentage
- Code quality metrics

#### 2. Build & Push Job (Matrix: 4 services)

**Triggers**: Only on push events (not PRs)

**Steps**:
1. ✅ Checkout code
2. ✅ Set up Docker Buildx
3. ✅ Login to GitHub Container Registry (GHCR)
4. ✅ Login to Docker Hub (optional, main branch only)
5. ✅ Extract metadata for Docker tags
6. ✅ Build and push Docker images
   - Multi-platform: `linux/amd64`, `linux/arm64`
   - Cache layers for faster builds
   - Tags: branch name, commit SHA, latest

**Tags Generated**:
- `ghcr.io/congdinh2008/user-service:master`
- `ghcr.io/congdinh2008/user-service:sha-abc123`
- `ghcr.io/congdinh2008/user-service:latest` (main branch only)

**Output**:
- Docker images in GitHub Container Registry
- Docker images in Docker Hub (main branch)
- Multi-platform support

#### 3. Integration Test Job

**Triggers**: After successful build, push events only

**Steps**:
1. ✅ Checkout code
2. ✅ Create `.env` files from examples
3. ✅ Start all services with `docker compose up -d`
4. ✅ Wait and check service health (30 retries):
   - user-service:8001
   - product-service:8002
   - order-service:8003
   - notification-service:8004
5. ✅ Run integration tests:
   - User registration
   - User login and token retrieval
   - Product creation
   - Order creation
   - Notification verification
6. ✅ Show service logs on failure
7. ✅ Cleanup with `docker compose down -v`

**Output**:
- Health check results
- Integration test results
- Service logs (on failure only)

### CI/CD Configuration

**Location**: `.github/workflows/ci-cd.yml`

**Required GitHub Secrets**:
- `GITHUB_TOKEN` - Automatically provided
- `DOCKER_USERNAME` - Docker Hub username (optional)
- `DOCKER_PASSWORD` - Docker Hub password (optional)

### Local CI/CD Testing

Test the pipeline locally before pushing:

```bash
# Run linting
cd user-service
flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics

# Run tests
pytest tests/ -v

# Build Docker image
docker build -t user-service:test .

# Test integration
docker compose up -d
./integration-test.sh
docker compose down
```

### CI/CD Best Practices

1. **Fast Feedback**: Matrix parallelization for quick results
2. **Caching**: Docker layer caching and pip dependency caching
3. **Security**: No secrets in code, use GitHub Secrets
4. **Multi-platform**: Build for amd64 and arm64
5. **Testing**: Unit + Integration + Linting
6. **Versioning**: Semantic versioning with tags

### Monitoring CI/CD

**Check Pipeline Status**:
- GitHub Actions tab: https://github.com/congdinh2008/python-micro/actions
- Status badges in README
- Email notifications on failure

**Pipeline Performance**:
- ⏱️ Test Job: ~2-3 minutes per service (parallel)
- ⏱️ Build Job: ~5-7 minutes per service (parallel)
- ⏱️ Integration Job: ~2-3 minutes
- ⏱️ Total: ~10-15 minutes

---

## 🔒 CORS Configuration

### Security First

CORS (Cross-Origin Resource Sharing) is a critical security feature. Misconfiguration can expose your API to security vulnerabilities.

### Configuration Options

#### Option 1: Wildcard (Development Only) ⚠️

**Default behavior**: If `ALLOWED_ORIGINS` is not set, it defaults to `"*"`

```bash
# .env file
ALLOWED_ORIGINS=*
```

**⚠️ WARNING**: Only use `"*"` in development! Never in production!

#### Option 2: Specific Origins (Production) ✅

Set specific domains as comma-separated values:

```bash
# .env file
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com,https://admin.myapp.com
```

#### Option 3: JSON Array Format

```bash
# .env file
ALLOWED_ORIGINS=["https://myapp.com","https://www.myapp.com"]
```

### Deployment Best Practices

#### Development Environment
```bash
ALLOWED_ORIGINS=*
# or
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

#### Staging Environment
```bash
ALLOWED_ORIGINS=https://staging.myapp.com,https://staging-admin.myapp.com
```

#### Production Environment
```bash
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com,https://admin.myapp.com
```

### Service-Specific Configuration

Each service can have different CORS settings:

```bash
# User Service
ALLOWED_ORIGINS=https://app.myapp.com,https://www.myapp.com

# Product Service
ALLOWED_ORIGINS=https://shop.myapp.com,https://www.myapp.com

# Order Service
ALLOWED_ORIGINS=https://checkout.myapp.com,https://admin.myapp.com

# Notification Service
ALLOWED_ORIGINS=https://admin.myapp.com
```

### Testing CORS Configuration

```bash
# Test with curl
curl -H "Origin: https://myapp.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://localhost:8001/api/users

# Expected response headers
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE
Access-Control-Allow-Headers: *
```

### Common Pitfalls

**❌ Don't Do This**:
```bash
# Production with wildcard - Security risk!
ALLOWED_ORIGINS=*

# Trailing slashes
ALLOWED_ORIGINS=https://myapp.com/  # Wrong!

# Mixed protocols
ALLOWED_ORIGINS=http://myapp.com   # Wrong if using HTTPS
```

**✅ Do This**:
```bash
# Specific origins only
ALLOWED_ORIGINS=https://myapp.com   # Correct!

# Multiple origins
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com,https://api.myapp.com
```

### Security Checklist

- [ ] Remove `"*"` from production configuration
- [ ] Use HTTPS origins in production
- [ ] Specify only required domains
- [ ] Test CORS configuration before deployment
- [ ] Review and update origins when adding new frontends
- [ ] Never commit `.env` files with production secrets
- [ ] Use environment-specific `.env` files
- [ ] Document all allowed origins and their purpose

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker compose logs -f

# Check if ports are in use
netstat -tulpn | grep -E ':(3000|8001|8002|8003|8004|9090|16686)'

# Reset everything
docker compose down -v
docker compose up -d --build
```

### Can't Access Services

```bash
# Wait longer (first start takes 1-2 minutes)
watch docker compose ps

# Check individual service health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

### Database Connection Errors

```bash
# Check database containers
docker compose ps | grep db

# View database logs
docker compose logs user-db
docker compose logs product-db
docker compose logs order-db

# Restart database
docker compose restart user-db
```

### Redis Connection Issues

```bash
# Check Redis container
docker compose ps redis

# Test Redis connection
docker compose exec redis redis-cli ping
# Expected: PONG

# View Redis logs
docker compose logs redis
```

### RabbitMQ Issues

```bash
# Check RabbitMQ container
docker compose ps rabbitmq

# View RabbitMQ logs
docker compose logs rabbitmq

# Access RabbitMQ Management UI
# http://localhost:15672 (guest/guest)
```

### Token Validation Failures

**Issue**: Product/Order Service can't validate tokens

**Solution**:
1. Ensure User Service is running: `curl http://localhost:8001/health`
2. Check USER_SERVICE_URL in service .env files
3. Verify network connectivity between services

### Out of Memory

```bash
# Check Docker resources
docker stats

# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory: 8GB

# Check system memory
free -h  # Linux
vm_stat  # macOS
```

### Port Already in Use

```bash
# Find process using port
lsof -i :8001  # macOS/Linux
netstat -ano | findstr :8001  # Windows

# Kill process or change port in .env
PORT=8005  # Use different port
```

### Migration Errors

```bash
# Check migration status
cd user-service
alembic current
alembic history

# Reset migrations (CAUTION: data loss)
alembic downgrade base
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Fix migration"
```

### Common Error Messages

**"Connection refused"**:
- Service not running
- Wrong port configuration
- Firewall blocking connection

**"401 Unauthorized"**:
- Missing or invalid JWT token
- Token expired
- User Service not validating correctly

**"500 Internal Server Error"**:
- Check service logs: `docker compose logs <service>`
- Database connection issue
- Missing environment variable

**"Too many connections"**:
- Database connection pool exhausted
- Increase max_connections in PostgreSQL
- Check for connection leaks

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and migration notes.

**Current Version**: v1.4.0

**Recent Updates**:
- ✅ Complete observability stack (Prometheus, Grafana, Loki, Jaeger)
- ✅ Distributed tracing with OpenTelemetry
- ✅ CI/CD with GitHub Actions
- ✅ CORS configuration support
- ✅ Production-ready Docker setup

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Run tests:
   ```bash
   pytest tests/ -v
   ```
5. Run linting:
   ```bash
   flake8 app/
   ```
6. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
8. Open a Pull Request

### Code Style

- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings (Google style)
- Maximum line length: 88 characters (Black compatible)
- Use meaningful variable and function names

### Testing Requirements

- Write unit tests for new features
- Ensure all tests pass
- Maintain >80% code coverage
- Include integration tests for API endpoints

### Documentation

- Update README.md if needed
- Add docstrings to new functions/classes
- Update API documentation
- Include comments for complex logic

### Pull Request Guidelines

- Clear title and description
- Reference related issues
- Include screenshots for UI changes
- Update CHANGELOG.md
- Ensure CI/CD passes

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

**MIT License Summary**:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## 👥 Authors & Contributors

- **Cong Dinh** - Initial work - [@congdinh2008](https://github.com/congdinh2008)

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full list of contributors.

---

## 📞 Support & Contact

- 📧 **Email**: congdinh2008@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/congdinh2008/python-micro/issues)
- 📖 **Documentation**: [Project Wiki](https://github.com/congdinh2008/python-micro/wiki)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/congdinh2008/python-micro/discussions)

---

## 🙏 Acknowledgments

- FastAPI framework and community
- Docker and Docker Compose
- PostgreSQL, Redis, RabbitMQ communities
- Prometheus, Grafana, Jaeger projects
- All contributors and supporters

---

## 🔗 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Microservices Patterns](https://microservices.io/patterns/)

---

**⭐ If you find this project helpful, please give it a star on GitHub!**

**Built with ❤️ by Cong Dinh**
