# 🚀 Python Microservices E-Commerce Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-24+-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready microservices architecture for e-commerce applications, built with **FastAPI**, **PostgreSQL**, **Redis**, **RabbitMQ**, and comprehensive observability stack.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Services](#-services)
- [Technology Stack](#-technology-stack)
- [Documentation](#-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Monitoring](#-monitoring)

---

## 🎯 Overview

This project demonstrates a **complete microservices architecture** with 4 independent services, implementing industry best practices:

- ✅ **Clean Architecture** with Repository Pattern
- ✅ **Event-Driven Architecture** with RabbitMQ
- ✅ **Distributed Tracing** with OpenTelemetry & Jaeger
- ✅ **Centralized Logging** with Loki & Promtail
- ✅ **Metrics & Monitoring** with Prometheus & Grafana
- ✅ **API Gateway Pattern** with JWT authentication
- ✅ **Cache Strategy** with Redis
- ✅ **Database per Service** pattern
- ✅ **Docker Containerization** & Orchestration

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
└──────────────┬─────────────────┬─────────────────┬──────────┘
               │                 │                 │
               ▼                 ▼                 ▼
         ┌──────────┐      ┌──────────┐     ┌──────────┐
         │  User    │◄─────│ Product  │◄────│  Order   │
         │ Service  │      │ Service  │     │ Service  │
         │  :8001   │      │  :8002   │     │  :8003   │
         └────┬─────┘      └────┬─────┘     └────┬─────┘
              │                 │                 │
              │           ┌─────▼─────┐           │
              │           │   Redis   │           │
              │           └───────────┘           │
              ▼                                   ▼
         ┌─────────┐                       ┌──────────────┐
         │User DB  │                       │   RabbitMQ   │
         └─────────┘                       └──────┬───────┘
                                                  │
         ┌─────────┐                              ▼
         │Product  │                    ┌────────────────┐
         │   DB    │                    │ Notification   │
         └─────────┘                    │   Service      │
                                        │    :8004       │
         ┌─────────┐                    └────────────────┘
         │Order DB │
         └─────────┘                    ┌────────────────┐
                                        │ Observability  │
         ┌──────────────────────────────┤                │
         │ Prometheus │ Grafana │ Loki  │ • Metrics      │
         │ Jaeger │ Promtail           │ • Logs         │
         └────────────────────────────────┤ • Traces       │
                                        └────────────────┘
```

### Communication Flow

**1. Authentication:**
```
Client → User Service → JWT Token → Client
```

**2. Product Flow (with Cache):**
```
Client → Product Service → Redis Cache → PostgreSQL
                         ↓
                 User Service (Token Validation)
```

**3. Order Flow (Event-Driven):**
```
Client → Order Service → PostgreSQL
                       ↓
               Product Service (Validation)
                       ↓
               User Service (Auth)
                       ↓
               RabbitMQ (order.created)
                       ↓
               Notification Service
```

---

## ✨ Features

### 🔐 User Service (Port 8001)
- User registration and authentication
- JWT token generation and validation
- Password hashing with bcrypt
- Token validation endpoint for other services

### 📦 Product Service (Port 8002)
- Complete product CRUD operations
- Redis caching for performance
- Cache invalidation strategy
- JWT authentication

### 🛒 Order Service (Port 8003)
- Order creation and management
- Product validation
- User authentication
- Event publishing to RabbitMQ

### 📧 Notification Service (Port 8004)
- Async message processing
- Email/SMS/Push notifications
- Event-driven architecture

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (24.0+)
- Docker Compose (2.0+)
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro

# 2. Start all services
docker compose up -d

# 3. Wait for health checks (30-60 seconds)
docker compose ps

# 4. Verify services
curl http://localhost:8001/health  # User Service
curl http://localhost:8002/health  # Product Service
curl http://localhost:8003/health  # Order Service
curl http://localhost:8004/health  # Notification Service
```

### First API Calls

```bash
# 1. Register user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"Demo@123"}'

# 2. Login (get JWT token)
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"Demo@123"}'

# 3. Create product (use token from step 2)
curl -X POST http://localhost:8002/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"High-end laptop","price":1299.99,"stock":10}'

# 4. Create order
curl -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":1}'
```

---

## 🔧 Services

### Microservices

| Service | Port | Health Check | API Docs |
|---------|------|--------------|----------|
| User Service | 8001 | http://localhost:8001/health | http://localhost:8001/docs |
| Product Service | 8002 | http://localhost:8002/health | http://localhost:8002/docs |
| Order Service | 8003 | http://localhost:8003/health | http://localhost:8003/docs |
| Notification Service | 8004 | http://localhost:8004/health | http://localhost:8004/docs |

### Infrastructure

| Service | Port | Access |
|---------|------|--------|
| PostgreSQL (User) | 5433 | localhost:5433 |
| PostgreSQL (Product) | 5434 | localhost:5434 |
| PostgreSQL (Order) | 5435 | localhost:5435 |
| Redis Cache | 6379 | localhost:6379 |
| RabbitMQ | 15672 | http://localhost:15672 (guest/guest) |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3000 | http://localhost:3000 (admin/admin) |
| Jaeger | 16686 | http://localhost:16686 |
| Loki | 3100 | http://localhost:3100 |

---

## 💻 Technology Stack

### Backend Framework
- **FastAPI** - Modern Python web framework
- **SQLAlchemy 2.0** - ORM for database operations
- **Alembic** - Database migration tool
- **Pydantic** - Data validation

### Databases & Cache
- **PostgreSQL 15** - Primary database (3 instances)
- **Redis 7** - Caching layer

### Messaging
- **RabbitMQ 3** - Message queue

### Observability
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Loki** - Log aggregation
- **Promtail** - Log collector
- **Jaeger** - Distributed tracing
- **OpenTelemetry** - Observability framework

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Step-by-step guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture details |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment |
| [DEVOPS_README.md](./DEVOPS_README.md) | Observability setup |
| [TESTING.md](./TESTING.md) | Testing guide |
| [CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md) | CORS setup |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## 🛠️ Development

### Project Structure

```
python-micro/
├── user-service/           # Authentication service
├── product-service/        # Product catalog
├── order-service/          # Order processing
├── notification-service/   # Async notifications
├── observability/          # Monitoring configs
├── docker-compose.yml      # Orchestration
└── README.md              # This file
```

### Environment Setup

```bash
# Development (default "*" CORS)
cp .env.development.example .env

# Production (specific origins)
cp .env.production.example .env
```

### Run Locally

```bash
# Individual service
cd user-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

### Database Migrations

```bash
# Create migration
cd user-service
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## 🚢 Deployment

### Docker Deployment

```bash
# Start all services
docker compose up -d

# Scale services
docker compose up -d --scale product-service=3

# View logs
docker compose logs -f [service-name]

# Stop all
docker compose down
```

### Production Checklist

- [ ] Update `.env` with production values
- [ ] Set strong `SECRET_KEY` for JWT
- [ ] Configure specific CORS origins
- [ ] Set up database backups
- [ ] Configure SSL/TLS
- [ ] Set up monitoring alerts
- [ ] Enable rate limiting

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for details.

---

## 📊 Monitoring

### Access Monitoring Tools

```bash
# Grafana Dashboard
http://localhost:3000
# Login: admin/admin

# Prometheus Metrics
http://localhost:9090

# Jaeger Traces
http://localhost:16686

# RabbitMQ Management
http://localhost:15672
# Login: guest/guest
```

### Key Metrics

- **Request Rate** - Requests per second
- **Response Time** - p50, p95, p99 latencies
- **Error Rate** - 4xx and 5xx responses
- **Cache Hit Rate** - Redis effectiveness
- **Queue Depth** - RabbitMQ backlog

See [DEVOPS_README.md](./DEVOPS_README.md) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 👥 Authors

- **Cong Dinh** - [@congdinh2008](https://github.com/congdinh2008)

---

## 📞 Support

- 📧 Email: congdinh2008@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/congdinh2008/python-micro/issues)

---

## 🗺️ Roadmap

See [CHANGELOG.md](./CHANGELOG.md) for version history.

### Upcoming Features

- API Gateway with Kong/Nginx
- Kubernetes deployment
- GraphQL API layer
- CI/CD with GitHub Actions
- Service mesh integration

---

**⭐ If you find this project helpful, please give it a star!**

---

**Last Updated:** October 17, 2025  
**Version:** 1.4.0  
**Status:** ✅ Production Ready
