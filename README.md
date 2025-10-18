# 🚀 Python Microservices E-Commerce Platform

[![CI/CD Pipeline](https://github.com/congdinh2008/python-micro/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/congdinh2008/python-micro/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

> **Production-ready microservices architecture** demonstrating modern software design patterns, DevOps practices, and complete observability stack.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Services](#-services)
- [Observability](#-observability)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

This project is a **comprehensive microservices e-commerce platform** built with Python, showcasing:

- ✅ **4 Independent Microservices** with clean architecture
- ✅ **Complete Observability Stack** (Prometheus, Grafana, Loki, Jaeger)
- ✅ **Event-Driven Architecture** using RabbitMQ
- ✅ **Caching Strategy** with Redis
- ✅ **Database per Service** pattern with PostgreSQL
- ✅ **Containerized Deployment** with Docker Compose
- ✅ **CI/CD Pipeline** with GitHub Actions
- ✅ **API Documentation** with Swagger/OpenAPI

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Client/UI     │
│   (Svelte)      │
└────────┬────────┘
         │
    ┌────▼────────────────────────────────┐
    │      API Gateway (Future)           │
    └────┬────────────────────────────────┘
         │
    ┌────▼────────┬──────────┬──────────┬──────────┐
    │             │          │          │          │
┌───▼───┐   ┌────▼───┐ ┌────▼────┐ ┌───▼──────┐  │
│ User  │   │Product │ │ Order   │ │Notification│
│Service│   │Service │ │ Service │ │  Service  │
└───┬───┘   └────┬───┘ └────┬────┘ └───┬──────┘  │
    │            │          │           │         │
┌───▼───┐   ┌────▼───┐ ┌────▼────┐ ┌───▼──────┐  │
│UserDB │   │ProdDB  │ │OrderDB  │ │ RabbitMQ │  │
└───────┘   └────┬───┘ └─────────┘ └──────────┘  │
                 │                                 │
            ┌────▼────┐                            │
            │  Redis  │◄───────────────────────────┘
            └─────────┘

    Observability Stack:
    ┌─────────────────────────────────────┐
    │ Prometheus → Grafana → Loki → Jaeger│
    └─────────────────────────────────────┘
```

---

## ✨ Features

### Core Functionality
- 👤 **User Management**: Registration, authentication with JWT
- 📦 **Product Catalog**: CRUD operations with caching
- 🛒 **Order Processing**: Order creation with inventory management
- 📧 **Notifications**: Async event-driven notifications

### Technical Features
- 🔐 **Security**: JWT authentication, password hashing with bcrypt
- 💾 **Caching**: Redis cache-aside pattern (300s TTL)
- 📨 **Messaging**: RabbitMQ for async communication
- 🗄️ **Database**: PostgreSQL with Alembic migrations
- 📊 **Monitoring**: Metrics, logs, and distributed tracing
- 🔍 **Health Checks**: Comprehensive health endpoints
- 📖 **API Docs**: Auto-generated Swagger UI

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) 0.104+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Validation**: Pydantic

### Infrastructure
- **Databases**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Broker**: RabbitMQ 3
- **Containerization**: Docker & Docker Compose

### Observability
- **Metrics**: Prometheus + Redis Exporter
- **Visualization**: Grafana 10
- **Logging**: Loki + Promtail
- **Tracing**: Jaeger + OpenTelemetry

### DevOps
- **CI/CD**: GitHub Actions
- **Container Registry**: GHCR, Docker Hub

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop 4.0+
- Docker Compose 2.0+
- Python 3.11+ (for local development)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro/micro-src
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env if needed
```

3. **Start all services**
```bash
docker compose up -d
```

4. **Wait for services to be ready** (30-60 seconds)
```bash
docker compose ps
```

5. **Access the services**
- User Service: http://localhost:8001/docs
- Product Service: http://localhost:8002/docs
- Order Service: http://localhost:8003/docs
- Notification Service: http://localhost:8004/docs
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686
- RabbitMQ: http://localhost:15672 (guest/guest)

### Quick Test

```bash
# Register a user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}'

# Login
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test@123"
```

---

## 📁 Project Structure

```
python-micro/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline
├── micro-src/                 # Microservices implementation
│   ├── server/
│   │   ├── user-service/      # Authentication service
│   │   ├── product-service/   # Product catalog service
│   │   ├── order-service/     # Order management service
│   │   └── notification-service/ # Notification service
│   ├── deployment/
│   │   ├── observability/     # Monitoring configs
│   │   └── scripts/           # Deployment scripts
│   ├── docker-compose.yml     # Orchestration
│   └── .env.example           # Environment template
├── mono-src/                  # Monolithic version (reference)
├── cli-src/                   # CLI version (reference)
└── docs/                      # Documentation
```

---

## 🔧 Services

### 1. User Service (Port 8001)
- User registration and authentication
- JWT token generation and validation
- Password hashing with bcrypt

**Endpoints:**
- `POST /register` - Register new user
- `POST /login` - Authenticate user
- `POST /validate-token` - Validate JWT token
- `GET /health` - Health check

### 2. Product Service (Port 8002)
- Product CRUD operations
- Redis caching (Cache-aside pattern)
- Authentication via User Service

**Endpoints:**
- `GET /products` - List all products
- `GET /products/{id}` - Get product by ID
- `POST /products` - Create product (auth required)
- `PUT /products/{id}` - Update product (auth required)
- `DELETE /products/{id}` - Delete product (auth required)
- `GET /health` - Health check

### 3. Order Service (Port 8003)
- Order creation and management
- Product validation via Product Service
- Event publishing to RabbitMQ

**Endpoints:**
- `GET /orders` - List user orders (auth required)
- `GET /orders/{id}` - Get order by ID (auth required)
- `POST /orders` - Create order (auth required)
- `GET /health` - Health check

### 4. Notification Service (Port 8004)
- Async event consumption from RabbitMQ
- Email/SMS/Push notification handling
- Event-driven architecture

**Endpoints:**
- `GET /health` - Health check

---

## 📊 Observability

### Metrics (Prometheus)
- Service-level metrics (requests, latency, errors)
- Infrastructure metrics (CPU, memory, disk)
- Custom business metrics

**Access**: http://localhost:9090

### Dashboards (Grafana)
- Pre-configured dashboards for all services
- Real-time monitoring
- Alerting configuration

**Access**: http://localhost:3000 (admin/admin)

### Logs (Loki)
- Centralized log aggregation
- Searchable and filterable
- Correlated with metrics

**Query via Grafana**: http://localhost:3000

### Tracing (Jaeger)
- Distributed request tracing
- Service dependency mapping
- Performance bottleneck identification

**Access**: http://localhost:16686

---

## 💻 Development

### Local Development Setup

1. **Install dependencies**
```bash
cd micro-src/server/user-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Run database migrations**
```bash
alembic upgrade head
```

3. **Start the service**
```bash
uvicorn app.main:app --reload --port 8001
```

### Code Style

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

---

## 🧪 Testing

### Run Unit Tests

```bash
cd micro-src/server/user-service
pytest tests/ -v
```

### Run Integration Tests

```bash
cd micro-src
./deployment/scripts/test-complete.sh
```

### Coverage Report

```bash
pytest tests/ --cov=app --cov-report=html
```

---

## 🚢 Deployment

### Docker Compose (Production)

```bash
cd micro-src
docker compose -f docker-compose.yml up -d
```

### Kubernetes (Coming Soon)

```bash
kubectl apply -f k8s/
```

### Health Check

```bash
# Check all services
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

---

## 📚 Documentation

- [Architecture Documentation](./micro-src/ARCHITECTURE.md)
- [API Documentation](./micro-src/API_DOCUMENTATION.md)
- [DevOps Guide](./micro-src/DEVOPS_README.md)
- [Deployment Status](./micro-src/DEPLOYMENT_STATUS.md)
- [Changelog](./micro-src/CHANGELOG.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow PEP 8 style guide
- Write docstrings for all functions and classes
- Add unit tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Cong Dinh** ([@congdinh2008](https://github.com/congdinh2008))

---

## 🙏 Acknowledgments

- FastAPI framework and community
- Martin Fowler's Microservices Architecture
- The Twelve-Factor App methodology
- Clean Architecture by Robert C. Martin

---

## 📞 Support

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/congdinh2008/python-micro/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/congdinh2008/python-micro/discussions)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=congdinh2008/python-micro&type=Date)](https://star-history.com/#congdinh2008/python-micro&Date)

---

**Made with ❤️ and Python**
