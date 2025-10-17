# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Flexible CORS configuration with environment variable support
- Comprehensive CORS documentation and templates
- Development and production environment templates

### Changed
- Improved Docker permission handling for non-root users
- Updated CORS configuration to support multiple formats

### Fixed
- Docker permission errors in all service containers
- Missing TokenValidation schema exports in user-service
- CORS parsing errors in notification and order services

## [1.4.0] - 2024-10-17

### Added - DevOps & Observability
- **Observability Stack**: Prometheus, Grafana, Loki, Promtail, Jaeger
- **Distributed Tracing**: OpenTelemetry integration with Jaeger
- **Centralized Logging**: Loki + Promtail for log aggregation
- **Metrics & Monitoring**: Prometheus + Grafana dashboards
- **Redis Metrics**: Redis Exporter for cache monitoring
- **Health Checks**: Comprehensive health checks for all services

### Added - Documentation
- Complete DevOps documentation (DEVOPS_README.md)
- Deployment guide with production best practices
- Observability configuration guide
- Architecture diagrams and flow charts

### Changed
- Enhanced docker-compose.yml with full observability stack
- Improved service dependencies and health checks
- Updated all services with OTLP (OpenTelemetry Protocol) support

## [1.3.0] - 2024-10-15

### Added - Notification Service
- **Notification Service** (Port 8004): Async notification processing
- RabbitMQ consumer for order events
- Email/SMS/Push notification support
- Background worker for message processing

### Added - Order Service Improvements
- RabbitMQ publisher for order.created events
- Message queue integration with notification service
- Event-driven architecture for order processing

### Changed
- Updated architecture to support async messaging
- Enhanced docker-compose with RabbitMQ
- Improved service orchestration

## [1.2.0] - 2024-10-10

### Added - Order Service
- **Order Service** (Port 8003): Complete order management system
- Order creation, listing, update, and deletion
- User authentication via JWT
- Product validation via Product Service
- PostgreSQL database for order storage
- Alembic migrations for Order Service
- Docker containerization

### Added - Inter-Service Communication
- User Service token validation endpoint
- Product Service product validation
- RESTful API communication between services

### Changed
- Enhanced docker-compose with 3 databases (user, product, order)
- Updated service dependencies and networking
- Improved API documentation

## [1.1.0] - 2024-10-05

### Added - Product Service
- **Product Service** (Port 8002): Product management with caching
- Redis cache integration for product data
- Product CRUD operations with cache invalidation
- Authentication via User Service JWT validation
- PostgreSQL database for product storage
- Alembic migrations for Product Service
- Docker containerization

### Changed
- Updated docker-compose with Redis and Product database
- Enhanced User Service with token validation endpoint
- Improved authentication flow between services

## [1.0.0] - 2024-10-01

### Added - User Service (Initial Release)
- **User Service** (Port 8001): Authentication and user management
- User registration and login
- JWT token generation and validation
- Password hashing with bcrypt
- PostgreSQL database for user storage
- SQLAlchemy 2.0 ORM
- Alembic migrations
- FastAPI framework
- Clean Architecture with Repository Pattern
- Docker containerization
- Docker Compose orchestration

### Added - Project Structure
- Microservices architecture foundation
- Separate databases per service
- Environment-based configuration
- Health check endpoints
- API documentation with Swagger/ReDoc

---

## 🏗️ Architecture Evolution

### Phase 1: User Service (v1.0.0)
```
Client → User Service (8001) → PostgreSQL
         ├─ Register
         ├─ Login
         └─ JWT Generation
```

### Phase 2: Product Service (v1.1.0)
```
Client → Product Service (8002) → PostgreSQL
         ├─ Products CRUD       → Redis Cache
         └─ Auth Validation     → User Service (8001)
```

### Phase 3: Order Service (v1.2.0)
```
Client → Order Service (8003) → PostgreSQL
         ├─ Orders CRUD        → Product Service (8002)
         └─ Auth Validation    → User Service (8001)
```

### Phase 4: Notification Service (v1.3.0)
```
Order Service (8003) → RabbitMQ → Notification Service (8004)
                       ├─ order.created
                       └─ Async Messaging
```

### Phase 5: Observability (v1.4.0)
```
All Services → OpenTelemetry → Jaeger (Tracing)
             → Logs          → Loki (Logging)
             → Metrics       → Prometheus → Grafana
```

---

## 🔄 Migration Notes

### Upgrading from v1.3.0 to v1.4.0
1. Update docker-compose.yml with observability services
2. Configure OpenTelemetry endpoints in service .env files
3. Start observability stack: `docker compose up -d`
4. Access Grafana at http://localhost:3000
5. Access Jaeger at http://localhost:16686

### Upgrading from v1.2.0 to v1.3.0
1. Add RabbitMQ to docker-compose.yml
2. Start Notification Service: `docker compose up -d notification-service`
3. Verify RabbitMQ connection in Order Service logs

### Upgrading from v1.1.0 to v1.2.0
1. Add Order Service configuration
2. Run Order Service migrations: `alembic upgrade head`
3. Start Order Service: `docker compose up -d order-service`

### Upgrading from v1.0.0 to v1.1.0
1. Add Redis and Product database to docker-compose.yml
2. Run Product Service migrations: `alembic upgrade head`
3. Configure USER_SERVICE_URL in Product Service .env
4. Start Product Service: `docker compose up -d product-service`

---

## 📊 Features by Version

| Feature | v1.0.0 | v1.1.0 | v1.2.0 | v1.3.0 | v1.4.0 |
|---------|--------|--------|--------|--------|--------|
| User Service | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product Service | ❌ | ✅ | ✅ | ✅ | ✅ |
| Order Service | ❌ | ❌ | ✅ | ✅ | ✅ |
| Notification Service | ❌ | ❌ | ❌ | ✅ | ✅ |
| Redis Cache | ❌ | ✅ | ✅ | ✅ | ✅ |
| RabbitMQ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Prometheus | ❌ | ❌ | ❌ | ❌ | ✅ |
| Grafana | ❌ | ❌ | ❌ | ❌ | ✅ |
| Loki/Promtail | ❌ | ❌ | ❌ | ❌ | ✅ |
| Jaeger Tracing | ❌ | ❌ | ❌ | ❌ | ✅ |
| OpenTelemetry | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🐛 Known Issues

### v1.4.0
- None reported

### v1.3.0
- Fixed: Docker permission errors (resolved in v1.4.0)
- Fixed: CORS configuration issues (resolved in v1.4.0)

### v1.2.0
- Order Service requires manual database setup on first run

### v1.1.0
- Redis cache may need manual flush after Product Service restarts

---

## 🔮 Roadmap

### v1.5.0 (Planned)
- [ ] API Gateway with rate limiting
- [ ] Service mesh (Istio/Linkerd)
- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipeline with GitHub Actions

### v2.0.0 (Future)
- [ ] GraphQL API layer
- [ ] Event sourcing with CQRS
- [ ] Advanced caching strategies
- [ ] Multi-region deployment

---

## 📚 Documentation

- [README.md](./README.md) - Project overview and quick start
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture details
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [TESTING.md](./TESTING.md) - Testing documentation
- [CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md) - CORS setup guide

---

## 👥 Contributors

- congdinh2008 - Initial work and all subsequent releases

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Last Updated:** October 17, 2025
