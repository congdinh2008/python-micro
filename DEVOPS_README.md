# 🚀 DevOps Foundation - E-commerce Microservices

## 📋 Tổng quan

Dự án này triển khai một hệ thống E-commerce Microservices production-ready với đầy đủ DevOps Foundation:
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions automation
- **Observability**: Logging (Loki), Metrics (Prometheus), Tracing (Jaeger)
- **Visualization**: Grafana dashboards

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Applications                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┬──────────────┐
    │            │            │              │              │
    ▼            ▼            ▼              ▼              ▼
┌────────┐  ┌─────────┐  ┌─────────┐   ┌─────────┐   ┌──────────┐
│ User   │  │Product  │  │ Order   │   │Notifica-│   │ Grafana  │
│Service │  │Service  │  │Service  │   │tion Svc │   │Dashboard │
│:8001   │  │:8002    │  │:8003    │   │:8004    │   │:3000     │
└───┬────┘  └────┬────┘  └────┬────┘   └────┬────┘   └────┬─────┘
    │            │            │              │              │
    │      ┌─────▼─────┐      │              │         ┌────▼────┐
    │      │   Redis   │      │              │         │  Loki   │
    │      │   Cache   │      │              │         │  :3100  │
    │      └───────────┘      │              │         └────┬────┘
    │                         │              │              │
    ▼                         ▼              ▼         ┌────▼────┐
┌─────────┐             ┌──────────┐   ┌──────────┐  │Promtail │
│User DB  │             │ Order DB │   │ RabbitMQ │  └─────────┘
│Postgres │             │ Postgres │   │  :5672   │
└─────────┘             └──────────┘   └──────────┘  ┌──────────┐
                                                      │Prometheus│
┌──────────┐                                         │  :9090   │
│Product DB│                                         └──────────┘
│ Postgres │
└──────────┘                                         ┌──────────┐
                                                     │  Jaeger  │
                                                     │  :16686  │
                                                     └──────────┘
```

## 🎯 Sprint Breakdown

### ✅ Sprint 1: Containerization (Complete)
- [x] Multi-stage Dockerfiles cho tất cả services
- [x] Non-root user trong containers
- [x] Health checks cho mọi service
- [x] Docker Compose orchestration
- [x] PostgreSQL, Redis, RabbitMQ integration

### ✅ Sprint 2: CI/CD Automation (Complete)
- [x] GitHub Actions workflow
- [x] Automated testing với matrix strategy
- [x] Docker image build & push (GHCR + Docker Hub)
- [x] Integration testing
- [x] Code coverage reporting
- [x] Multi-platform builds (amd64, arm64)

### ✅ Sprint 3: Observability - Logging & Metrics (Complete)
- [x] Loki - centralized logging
- [x] Promtail - log collection từ Docker containers
- [x] Prometheus - metrics collection
- [x] Grafana - visualization & dashboards
- [x] Prometheus metrics endpoints trong tất cả services
- [x] Redis exporter cho Redis metrics

### ✅ Sprint 4: Observability - Tracing (Complete)
- [x] OpenTelemetry integration
- [x] Jaeger distributed tracing
- [x] Auto-instrumentation cho FastAPI, SQLAlchemy, HTTPX
- [x] RabbitMQ & Redis instrumentation
- [x] Trace correlation với logs

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- (Optional) Make

### 1. Clone Repository
```bash
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro
```

### 2. Start All Services
```bash
docker-compose up -d
```

### 3. Wait for Services to be Healthy
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access Services

#### Application Services
- **User Service**: http://localhost:8001/docs
- **Product Service**: http://localhost:8002/docs
- **Order Service**: http://localhost:8003/docs
- **Notification Service**: http://localhost:8004/docs

#### Observability Stack
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger UI**: http://localhost:16686
- **Loki**: http://localhost:3100
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 📊 Monitoring & Observability

### Metrics (Prometheus + Grafana)

**Available Metrics:**
- HTTP request rate per service
- Response time (P50, P95, P99)
- Error rate by service
- Database connection pool metrics
- Redis cache hit/miss rate
- RabbitMQ message rate

**Access Grafana:**
1. Open http://localhost:3000
2. Login: admin/admin
3. Navigate to "Microservices Overview" dashboard

### Logging (Loki + Promtail)

**Log Collection:**
- All container logs automatically collected
- Structured logging with JSON format
- Log levels: DEBUG, INFO, WARNING, ERROR
- Searchable by service, container, timestamp

**Query Logs in Grafana:**
1. Go to Explore in Grafana
2. Select Loki datasource
3. Example queries:
   ```
   {job="user-service"}
   {job=~".*-service"} |= "error"
   {container="product-service"} | json | level="ERROR"
   ```

### Tracing (Jaeger + OpenTelemetry)

**Distributed Tracing Features:**
- End-to-end request tracing across services
- Database query tracing
- Cache operation tracing
- HTTP client call tracing
- RabbitMQ message tracing

**Access Jaeger:**
1. Open http://localhost:16686
2. Select service (e.g., "User Service")
3. Click "Find Traces"
4. View detailed trace timeline and spans

**Example Trace Flow:**
```
Client Request
  → User Service (JWT validation)
    → Product Service (get products)
      → Redis (cache check)
      → PostgreSQL (query if cache miss)
    → Order Service (create order)
      → PostgreSQL (save order)
      → RabbitMQ (publish event)
    → Notification Service (consume event)
```

## 🔧 Development Workflow

### Local Development

```bash
# Start only infrastructure (DBs, Redis, RabbitMQ)
docker-compose up -d user-db product-db order-db redis rabbitmq

# Run a service locally for development
cd user-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Running Tests

```bash
# Run tests for a specific service
cd user-service
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build user-service

# Build with no cache
docker-compose build --no-cache
```

## 📈 CI/CD Pipeline

### GitHub Actions Workflow

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Pipeline Stages:**

1. **Test**
   - Lint code with flake8
   - Run unit tests
   - Generate coverage report
   - Upload to Codecov

2. **Build & Push**
   - Build Docker images
   - Push to GitHub Container Registry (GHCR)
   - Push to Docker Hub (on main branch)
   - Tag with branch name and commit SHA

3. **Integration Test**
   - Start all services with docker-compose
   - Run health checks
   - Execute integration tests
   - Clean up

### Required Secrets

Configure in GitHub repository settings:
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `GITHUB_TOKEN`: Automatically provided by GitHub

## 🔐 Security Best Practices

### Implemented Security Features

1. **Container Security**
   - Non-root user in all containers
   - Minimal base images (python:3.11-slim)
   - No hardcoded secrets
   - Multi-stage builds for smaller images

2. **Network Security**
   - Isolated networks for different concerns
   - Internal service communication only
   - Exposed only necessary ports

3. **Application Security**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Environment-based configuration
   - Input validation with Pydantic

4. **Observability Security**
   - Sensitive data not logged
   - Grafana authentication enabled
   - Trace sampling to avoid overload

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check if port is already in use
netstat -tulpn | grep :8001

# Restart specific service
docker-compose restart service-name
```

### Database Connection Issues

```bash
# Check database health
docker-compose ps

# Connect to database
docker exec -it user-service-db psql -U user -d user_service_db

# Reset database
docker-compose down -v
docker-compose up -d
```

### Metrics Not Showing in Grafana

```bash
# Check if Prometheus is scraping
curl http://localhost:9090/api/v1/targets

# Check service metrics endpoint
curl http://localhost:8001/metrics

# Restart Prometheus
docker-compose restart prometheus
```

### Logs Not Appearing in Loki

```bash
# Check Promtail status
docker-compose logs promtail

# Verify Loki is receiving logs
curl http://localhost:3100/ready

# Check Docker socket permissions
ls -la /var/run/docker.sock
```

### Traces Not in Jaeger

```bash
# Check Jaeger collector
curl http://localhost:14269/

# Verify OTLP endpoint
docker-compose logs jaeger

# Check service environment variable
docker-compose exec user-service env | grep OTEL
```

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)

### Dashboards
- Microservices Overview: Pre-configured in Grafana
- Custom dashboards can be added to `observability/grafana/dashboards/`

### Architecture Diagrams
- System architecture diagram included in this document
- Trace flow examples in Jaeger UI

## 🎓 Learning Outcomes

By completing this project, you will learn:

✅ **Containerization**
- Multi-stage Docker builds
- Docker Compose orchestration
- Container health checks
- Non-root container users

✅ **CI/CD**
- GitHub Actions workflows
- Automated testing
- Container image builds
- Multi-platform support

✅ **Observability**
- Metrics collection with Prometheus
- Log aggregation with Loki
- Distributed tracing with Jaeger
- Dashboard creation in Grafana

✅ **Microservices**
- Service-to-service communication
- Event-driven architecture
- Distributed systems patterns
- Production-ready deployment

## 👨‍💻 Tác giả

- **Cong Dinh**
- Repository: [python-micro](https://github.com/congdinh2008/python-micro)
- Email: congdinh2008@gmail.com

## 📄 License

Dự án này được tạo ra cho mục đích học tập và giảng dạy.

---

**Built with ❤️ using FastAPI, Docker, Prometheus, Loki, Jaeger, and Grafana**
