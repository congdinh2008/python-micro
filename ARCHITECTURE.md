# 🏗️ System Architecture Documentation

## 📋 Overview

This document describes the architecture of the E-commerce Microservices system with complete DevOps Foundation implementation.

## 🎯 Architecture Principles

### Microservices Architecture
- **Independent Services**: Each service is independently deployable
- **Database per Service**: Each service has its own database
- **Service Communication**: REST API for synchronous, RabbitMQ for asynchronous
- **Decentralized Data Management**: No shared databases between services

### Clean Architecture
- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Rule**: Dependencies point inward
- **Framework Independence**: Business logic independent of frameworks
- **Testability**: Each layer can be tested independently

### Repository Pattern
- **Data Access Abstraction**: Repository layer abstracts data access
- **Generic Base Repository**: Reusable CRUD operations
- **Type Safety**: Python Generics for type-safe operations

## 🏢 Service Breakdown

### 1. User Service (Port 8001)

**Purpose**: Authentication and user management

**Responsibilities:**
- User registration and authentication
- JWT token generation and validation
- Password hashing and verification

**Technology Stack:**
- FastAPI
- PostgreSQL
- JWT (python-jose)
- Bcrypt (passlib)

**Database Schema:**
```sql
users
├── id (primary key)
├── username (unique)
├── hashed_password
├── is_active
├── created_at
└── updated_at
```

**Key Endpoints:**
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `POST /validate-token` - Validate JWT token (for other services)
- `GET /health` - Health check

**Dependencies:**
- PostgreSQL database
- No dependencies on other services

### 2. Product Service (Port 8002)

**Purpose**: Product catalog management with caching

**Responsibilities:**
- Product CRUD operations
- Redis caching for read performance
- Cache invalidation on updates
- Authentication delegation to User Service

**Technology Stack:**
- FastAPI
- PostgreSQL
- Redis
- HTTPX (for User Service communication)

**Database Schema:**
```sql
products
├── id (primary key)
├── name
├── description
├── price
├── quantity
├── created_at
└── updated_at
```

**Cache Strategy:**
- Cache key: `product:{id}`
- TTL: 300 seconds (configurable)
- Invalidation: On update/delete operations
- Graceful degradation: Work without Redis

**Key Endpoints:**
- `POST /products` - Create product (requires JWT)
- `GET /products` - List products (public)
- `GET /products/{id}` - Get product (public, cached)
- `PUT /products/{id}` - Update product (requires JWT)
- `DELETE /products/{id}` - Delete product (requires JWT)
- `GET /health` - Health check (includes Redis status)

**Dependencies:**
- PostgreSQL database
- Redis cache
- User Service (for authentication)

### 3. Order Service (Port 8003)

**Purpose**: Order management with event publishing

**Responsibilities:**
- Order CRUD operations
- Product validation via Product Service
- User validation via User Service
- Event publishing to RabbitMQ

**Technology Stack:**
- FastAPI
- PostgreSQL
- RabbitMQ (aio-pika)
- HTTPX (for service communication)

**Database Schema:**
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

**Event Publishing:**
- Exchange: `order_events` (topic)
- Routing key: `order.created`
- Message format: JSON
- Persistent messages

**Key Endpoints:**
- `POST /orders` - Create order (requires JWT)
- `GET /orders` - List user's orders (requires JWT)
- `GET /orders/{id}` - Get order details (requires JWT)
- `PUT /orders/{id}` - Update order status (requires JWT)
- `DELETE /orders/{id}` - Delete order (requires JWT)
- `GET /health` - Health check (includes RabbitMQ status)

**Dependencies:**
- PostgreSQL database
- RabbitMQ
- User Service (for authentication)
- Product Service (for product validation)

### 4. Notification Service (Port 8004)

**Purpose**: Asynchronous notification processing

**Responsibilities:**
- Consume order events from RabbitMQ
- Send notifications (email/SMS/push)
- Log notification activities

**Technology Stack:**
- FastAPI
- RabbitMQ (aio-pika)
- No database (stateless)

**Event Consumption:**
- Queue: `order_notifications`
- Binds to: `order_events` exchange
- Routing key: `order.created`
- Auto-acknowledge on success

**Key Endpoints:**
- `GET /health` - Health check (includes RabbitMQ status)

**Dependencies:**
- RabbitMQ

## 🔄 Service Communication Patterns

### Synchronous Communication (REST API)

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

**Benefits:**
- Simple and straightforward
- Immediate response
- Easy to debug

**Trade-offs:**
- Coupling between services
- Higher latency
- Requires service availability

### Asynchronous Communication (RabbitMQ)

```
Order Service → RabbitMQ → Notification Service

1. Order Service publishes order.created event
2. RabbitMQ routes to order_notifications queue
3. Notification Service consumes and processes
```

**Benefits:**
- Loose coupling
- Resilience (message persistence)
- Scalability
- Fire-and-forget pattern

**Trade-offs:**
- Eventual consistency
- Complex debugging
- Message handling overhead

## 🗄️ Data Management

### Database Strategy

**Principle**: Database per Service
- Each service owns its data
- No direct database access between services
- Data consistency via events or API calls

**Databases:**
- user-service-db (PostgreSQL)
- product-service-db (PostgreSQL)
- order-service-db (PostgreSQL)

**Benefits:**
- Service independence
- Technology flexibility
- Scalability
- Fault isolation

**Challenges:**
- Data consistency
- Distributed transactions
- Joins across services

### Caching Strategy

**Redis Cache (Product Service):**
- **Purpose**: Reduce database load, improve read performance
- **Pattern**: Cache-aside (lazy loading)
- **TTL**: 300 seconds
- **Invalidation**: On write operations

**Cache Flow:**
```
GET /products/{id}
  1. Check Redis cache
  2. If hit: Return cached data
  3. If miss:
     a. Query PostgreSQL
     b. Store in Redis with TTL
     c. Return data
```

## 📊 Observability Architecture

### Three Pillars of Observability

#### 1. Metrics (Prometheus + Grafana)

**Collection:**
- Prometheus scrapes `/metrics` endpoints every 15s
- Services expose metrics via prometheus-fastapi-instrumentator
- Redis metrics via redis-exporter

**Metrics Categories:**
- **RED metrics**: Rate, Errors, Duration
- **System metrics**: CPU, memory, connections
- **Business metrics**: Orders created, products viewed

**Storage:**
- Time-series database
- Retention: 7 days
- Aggregation: 15s intervals

**Visualization:**
- Grafana dashboards
- Real-time updates
- Alerting (optional)

#### 2. Logging (Loki + Promtail)

**Collection:**
- Promtail scrapes Docker container logs
- Automatic label extraction
- JSON log parsing

**Log Structure:**
```json
{
  "timestamp": "2025-10-17T09:00:00.000Z",
  "level": "INFO",
  "service": "user-service",
  "message": "User registered successfully",
  "user_id": 123
}
```

**Storage:**
- Loki time-series log storage
- Retention: 7 days
- Compression enabled

**Query:**
- LogQL query language
- Label-based filtering
- Full-text search

#### 3. Tracing (Jaeger + OpenTelemetry)

**Instrumentation:**
- OpenTelemetry auto-instrumentation
- FastAPI requests
- Database queries (SQLAlchemy)
- HTTP clients (HTTPX)
- Redis operations
- RabbitMQ messages

**Trace Structure:**
```
Trace ID: abc123
  Span: HTTP POST /orders (Order Service)
    Span: Validate token (HTTPX → User Service)
    Span: Get product (HTTPX → Product Service)
      Span: Redis GET product:1
      Span: PostgreSQL SELECT product
    Span: PostgreSQL INSERT order
    Span: RabbitMQ publish order.created
```

**Storage:**
- Jaeger storage backend
- Retention: Configurable
- Sampling: 100% (development)

**Analysis:**
- Service dependencies
- Latency breakdown
- Error tracking
- Performance bottlenecks

### Correlation Between Pillars

**Logs ↔ Traces:**
- Trace ID in logs
- Click log entry → View trace

**Metrics ↔ Traces:**
- High error rate in metrics → Find traces
- Slow requests → Analyze trace timeline

**Traces ↔ Logs:**
- Trace context → Related logs
- Error span → Error logs

## 🔒 Security Architecture

### Authentication & Authorization

**Pattern**: JWT-based authentication with delegation

```
1. User logs in → User Service generates JWT
2. Client includes JWT in Authorization header
3. Product/Order Service → Validates with User Service
4. User Service returns username if valid
5. Service processes request with user context
```

**Benefits:**
- Centralized auth logic
- No JWT secret sharing
- Easy token revocation
- Service independence

### Network Security

**Isolation:**
- Default network: Service-to-service communication
- Monitoring network: Observability stack
- No direct database access from outside

**Exposed Ports:**
- Service APIs: 8001-8004
- Grafana: 3000
- Prometheus: 9090
- Jaeger: 16686
- RabbitMQ Management: 15672

### Data Security

**Sensitive Data:**
- Passwords: Bcrypt hashing
- JWT secret: Environment variable
- Database credentials: Environment variables
- No secrets in code or images

## 📦 Deployment Architecture

### Docker Compose (Development/Testing)

**Services:**
- 4 application services
- 3 PostgreSQL databases
- 1 Redis cache
- 1 RabbitMQ message broker
- 1 Prometheus metrics server
- 1 Loki log aggregator
- 1 Promtail log collector
- 1 Grafana visualization
- 1 Jaeger tracing backend
- 1 Redis exporter

**Networks:**
- default: Application services
- monitoring: Observability stack

**Volumes:**
- Database persistence
- Cache persistence
- Log persistence
- Metrics persistence
- Grafana dashboards

### Production Deployment (Kubernetes - Future)

**Recommended Setup:**
```
- Deployment per service
- HorizontalPodAutoscaler for scaling
- Service mesh (Istio) for advanced networking
- External databases (managed services)
- External Redis (managed service)
- Ingress controller for routing
- Cert-manager for TLS
```

## 🚀 CI/CD Architecture

### GitHub Actions Pipeline

**Stages:**
1. **Code Quality**
   - Linting (flake8)
   - Type checking (optional)
   
2. **Testing**
   - Unit tests
   - Integration tests
   - Coverage reporting

3. **Build**
   - Multi-stage Docker builds
   - Multi-platform images (amd64, arm64)
   - Image scanning (optional)

4. **Publish**
   - GitHub Container Registry (GHCR)
   - Docker Hub (optional)
   - Semantic versioning

5. **Deploy** (Future)
   - Kubernetes deployment
   - Smoke tests
   - Rollback on failure

## 🎯 Design Decisions

### Why Microservices?

**Pros:**
- Independent deployment and scaling
- Technology flexibility
- Team autonomy
- Fault isolation

**Cons:**
- Increased complexity
- Network latency
- Distributed data management
- Operational overhead

**Decision**: Microservices chosen for educational value and production readiness demonstration.

### Why Repository Pattern?

**Pros:**
- Testability (easy to mock)
- Maintainability (clear data access layer)
- Flexibility (easy to switch databases)

**Cons:**
- Extra abstraction layer
- More code to maintain

**Decision**: Repository pattern chosen for clean architecture and best practices demonstration.

### Why Three Observability Tools?

**Why Not Just One?**
- Metrics: Time-series, aggregation, alerting
- Logs: Detailed context, debugging
- Traces: Service dependencies, latency analysis

Each tool serves a specific purpose and together provide complete observability.

## 📈 Scaling Considerations

### Horizontal Scaling

**Stateless Services:**
- User Service: ✅ Stateless
- Product Service: ✅ Stateless (Redis shared)
- Order Service: ✅ Stateless
- Notification Service: ✅ Stateless (competing consumers)

**Scaling Strategy:**
```
docker-compose up --scale user-service=3 \
                  --scale product-service=3 \
                  --scale order-service=2 \
                  --scale notification-service=2
```

### Performance Optimization

**Caching:**
- Redis cache in Product Service
- TTL-based invalidation
- Cache warming (optional)

**Database:**
- Connection pooling
- Read replicas (future)
- Database indexing

**Async Processing:**
- RabbitMQ for background jobs
- Non-blocking I/O
- Event-driven architecture

## 🔮 Future Enhancements

1. **Service Mesh (Istio)**
   - Advanced routing
   - Circuit breaker
   - Retry policies
   - mTLS

2. **API Gateway**
   - Single entry point
   - Rate limiting
   - Request routing
   - Authentication

3. **Event Sourcing**
   - Complete audit trail
   - Replay events
   - CQRS pattern

4. **Advanced Monitoring**
   - Alerting rules
   - SLO/SLA tracking
   - Capacity planning
   - Cost optimization

## 📚 References

- [Microservices Patterns](https://microservices.io/patterns/)
- [The Twelve-Factor App](https://12factor.net/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Last Updated**: 2025-10-17
**Version**: 1.0.0
**Author**: Cong Dinh
