# 🚀 Deployment Guide

Complete deployment guide for Python Microservices E-Commerce Platform - from quick start to production deployment.

## 📑 Table of Contents

- [Quick Start (5 Minutes)](#-quick-start-5-minutes)
- [Deployment Options](#-deployment-options)
- [Verification](#-verification)
- [Access Services](#-access-services)
- [Testing](#-testing)
- [Infrastructure Details](#-infrastructure-details)
- [Common Commands](#-common-commands)
- [Troubleshooting](#-troubleshooting)
- [Production Deployment](#-production-deployment)

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites

- **Docker Desktop** 24.0+ installed and running
- **8GB RAM** available
- **10GB free disk space**
- **macOS, Linux, or Windows** with WSL2

### Fastest Deploy (Recommended)

```bash
# Clone repository
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro/micro-src

# Run automated deployment
bash deploy.sh
```

The script automatically:
1. ✅ Checks Docker installation
2. ✅ Creates environment configuration
3. ✅ Builds Docker images (5-10 minutes first time)
4. ✅ Starts all services
5. ✅ Waits for health checks
6. ✅ Displays service status

---

## 🎯 Deployment Options

### Option 1: Automated Script ⭐ (Recommended)

**Best for**: First-time deployment, production setup

```bash
cd micro-src
bash deploy.sh
```

**Features**:
- Automatic Docker detection and PATH setup
- Environment validation
- Clean previous deployment
- Image building with progress
- Health check monitoring
- Comprehensive status reporting

### Option 2: Using Makefile

**Best for**: Development workflow

```bash
cd micro-src

# Complete development setup
make dev-setup

# Or step by step
make setup      # Create .env file
make build      # Build Docker images
make up         # Start services
make status     # Check status
```

**Available Commands** (30+):
```bash
make help           # Show all commands
make dev-setup      # Complete setup (first time)
make up             # Start services
make down           # Stop services
make restart        # Restart services
make status         # Detailed health check
make logs           # View logs
make test-api       # Run API tests
make monitoring     # Open dashboards
make clean          # Remove all containers
make backup-db      # Backup databases
```

### Option 3: Manual Docker Compose

**Best for**: Custom configuration

```bash
cd micro-src

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start services
docker compose up -d --build

# Wait for services (60 seconds)
sleep 60

# Check status
docker compose ps
```

---

## ✅ Verification

### Quick Health Check

```bash
# Using script
bash check-status.sh

# Using Makefile
make status

# Manual check
docker compose ps
```

### Service Health Endpoints

```bash
# Check each service
curl http://localhost:8001/health  # User Service
curl http://localhost:8002/health  # Product Service
curl http://localhost:8003/health  # Order Service
curl http://localhost:8004/health  # Notification Service
```

### Expected Output

All containers should show `Up (healthy)` status:

```
NAME                    IMAGE                        STATUS       PORTS
grafana                 grafana/grafana:10.1.0       Up (healthy) 0.0.0.0:3000->3000/tcp
jaeger                  jaegertracing/all-in-one:... Up           0.0.0.0:16686->16686/tcp
loki                    grafana/loki:2.9.0           Up           0.0.0.0:3100->3100/tcp
notification-service    notification-service:latest  Up (healthy) 0.0.0.0:8004->8004/tcp
order-db                postgres:15-alpine           Up (healthy) 0.0.0.0:5435->5432/tcp
order-service           order-service:latest         Up (healthy) 0.0.0.0:8003->8003/tcp
product-db              postgres:15-alpine           Up (healthy) 0.0.0.0:5434->5432/tcp
product-service         product-service:latest       Up (healthy) 0.0.0.0:8002->8002/tcp
prometheus              prom/prometheus:v2.47.0      Up           0.0.0.0:9090->9090/tcp
promtail                grafana/promtail:2.9.0       Up
rabbitmq-server         rabbitmq:3-management-...    Up (healthy) 5672/tcp, 15672/tcp
redis-cache             redis:7-alpine               Up (healthy) 0.0.0.0:6379->6379/tcp
redis-exporter          oliver006/redis_exporter:... Up           0.0.0.0:9121->9121/tcp
user-db                 postgres:15-alpine           Up (healthy) 0.0.0.0:5433->5432/tcp
user-service            user-service:latest          Up (healthy) 0.0.0.0:8001->8001/tcp
```

---

## 🌐 Access Services

### Application Services

| Service | URL | Documentation | Purpose |
|---------|-----|---------------|---------|
| **User Service** | http://localhost:8001 | http://localhost:8001/docs | Authentication & User Management |
| **Product Service** | http://localhost:8002 | http://localhost:8002/docs | Product Catalog with Redis Cache |
| **Order Service** | http://localhost:8003 | http://localhost:8003/docs | Order Processing with RabbitMQ |
| **Notification Service** | http://localhost:8004 | http://localhost:8004/docs | Async Notification Processing |

### Observability Stack

| Tool | URL | Credentials | Purpose |
|------|-----|-------------|---------|
| **Grafana** | http://localhost:3000 | admin/admin | Dashboards & Visualization |
| **Prometheus** | http://localhost:9090 | - | Metrics Collection |
| **Jaeger** | http://localhost:16686 | - | Distributed Tracing |
| **RabbitMQ** | http://localhost:15672 | guest/guest | Message Queue Management |

### Databases

| Database | Connection String | Port | Purpose |
|----------|-------------------|------|---------|
| **User DB** | `postgresql://user:password@localhost:5433/user_service_db` | 5433 | User data |
| **Product DB** | `postgresql://user:password@localhost:5434/product_service_db` | 5434 | Product catalog |
| **Order DB** | `postgresql://user:password@localhost:5435/order_service_db` | 5435 | Order data |
| **Redis** | `redis://localhost:6379` | 6379 | Cache layer |

---

## 🧪 Testing

### Quick API Test

```bash
# Using Makefile
make test-api

# Or manual script
bash deployment/scripts/test-api.sh
```

### Manual Testing

```bash
# 1. Register a user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}'

# 2. Login and get JWT token
TOKEN=$(curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=Test@123" | jq -r '.access_token')

# 3. Create a product
curl -X POST http://localhost:8002/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"Gaming Laptop","price":1299.99,"quantity":10}'

# 4. Get products (with Redis cache)
curl http://localhost:8002/products

# 5. Create an order (triggers RabbitMQ event)
curl -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'

# 6. Get orders
curl -H "Authorization: Bearer $TOKEN" http://localhost:8003/orders
```

### Integration Tests

```bash
# Run comprehensive integration tests
make test-complete

# View test results
cat test-results.txt
```

---

## 🏗️ Infrastructure Details

### What Was Deployed

#### Application Services (4)
- **User Service** (Port 8001) - JWT authentication, user management
- **Product Service** (Port 8002) - Product catalog with Redis caching
- **Order Service** (Port 8003) - Order processing with RabbitMQ events
- **Notification Service** (Port 8004) - Async notification processing

#### Databases (3 PostgreSQL + 1 Redis)
- **User DB** (Port 5433) - PostgreSQL 15
- **Product DB** (Port 5434) - PostgreSQL 15
- **Order DB** (Port 5435) - PostgreSQL 15
- **Redis Cache** (Port 6379) - Redis 7

#### Infrastructure (1)
- **RabbitMQ** (Ports 5672, 15672) - Message broker with management UI

#### Observability Stack (5)
- **Prometheus** (Port 9090) - Metrics collection
- **Grafana** (Port 3000) - Visualization dashboards
- **Loki** (Port 3100) - Log aggregation
- **Promtail** - Log collector
- **Jaeger** (Port 16686) - Distributed tracing

### Key Features

#### Docker Compose Configuration
- ✅ Environment variable driven
- ✅ Production-ready: restart policies, health checks, resource limits
- ✅ Proper networking: isolated backend & monitoring networks
- ✅ Log rotation: 10MB max, 3 files per service
- ✅ Security: non-root users, read-only mounts
- ✅ Named volumes for data persistence

#### Environment Configuration (`.env`)
- All configuration centralized
- Default development values
- Production security guidelines
- Clear documentation for each variable

---

## 🎮 Common Commands

### Service Management

```bash
# Start services
make up

# Stop services
make down

# Restart services
make restart

# Check status
make status

# View logs (all services)
make logs

# View logs (specific service)
make logs-service SERVICE=user-service
```

### Development

```bash
# Open shell in container
make shell-service SERVICE=user-service

# Connect to Redis CLI
make redis-cli

# Connect to database
make exec-db DB=user-db

# Open API documentation
make docs
```

### Monitoring

```bash
# Open monitoring dashboards
make monitoring

# View Grafana
open http://localhost:3000

# View Prometheus
open http://localhost:9090

# View Jaeger traces
open http://localhost:16686
```

### Maintenance

```bash
# Backup all databases
make backup-db

# Restore database
make restore-db DB=user-db FILE=backups/user-db-xxx.sql

# Clean all containers and volumes
make clean

# Production readiness check
make prod-check
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker Not Running

**Error**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# macOS
open /Applications/Docker.app

# Linux
sudo systemctl start docker

# Verify
docker info
```

#### 2. Port Already in Use

**Error**: `Bind for 0.0.0.0:8001 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port
lsof -i :8001

# Kill the process
kill -9 <PID>

# Or change port in .env file
USER_SERVICE_PORT=8011
```

#### 3. Service Not Healthy

**Error**: Service stuck in "starting" state

**Solution**:
```bash
# Check logs
make logs-service SERVICE=user-service

# Common fixes:
# - Wait longer (databases take 30-60s to start)
# - Check database connection
# - Verify environment variables
# - Check disk space

# Restart service
docker compose restart user-service
```

#### 4. Database Connection Failed

**Error**: `could not connect to database`

**Solution**:
```bash
# Check if database is running
docker compose ps | grep db

# Check database logs
docker compose logs user-db

# Test connection
docker compose exec user-db psql -U user -d user_service_db -c "SELECT 1;"

# Restart database
docker compose restart user-db
```

#### 5. Build Failed

**Error**: Build errors during image creation

**Solution**:
```bash
# Clean Docker cache
docker builder prune -af

# Rebuild without cache
docker compose build --no-cache

# Check disk space
df -h
```

#### 6. Out of Memory

**Error**: Container killed by OOM

**Solution**:
```bash
# Check Docker resources (macOS)
# Docker Desktop → Settings → Resources

# Increase memory to 8GB minimum

# Or reduce services
# Comment out observability services in docker-compose.yml
```

### Health Check Commands

```bash
# Check all services
bash check-status.sh

# Check specific service health
curl http://localhost:8001/health

# View service logs
docker compose logs -f user-service

# Check container resource usage
docker stats

# Restart unhealthy service
docker compose restart <service-name>
```

### Reset Everything

```bash
# Complete clean restart
make clean
make dev-setup

# Or manually
docker compose down -v --remove-orphans
docker system prune -af --volumes
bash deploy.sh
```

---

## 🚀 Production Deployment

### Pre-Production Checklist

```bash
# Run production readiness check
make prod-check
```

### Environment Configuration

#### 1. Update `.env` File

```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env
```

#### 2. Critical Settings

```bash
# Environment
ENVIRONMENT=production
VERSION=v1.0.0

# Security - Generate strong secrets
USER_SERVICE_SECRET_KEY=$(openssl rand -hex 32)

# Database - Use strong passwords
USER_DB_PASSWORD=$(openssl rand -base64 32)
PRODUCT_DB_PASSWORD=$(openssl rand -base64 32)
ORDER_DB_PASSWORD=$(openssl rand -base64 32)

# CORS - Specify exact origins (no wildcard)
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com

# Observability - Strong credentials
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16)
```

### Database Migration

#### Use Managed Database Services

**AWS RDS**:
```bash
USER_DATABASE_URL=postgresql://user:pass@rds.amazonaws.com:5432/userdb
PRODUCT_DATABASE_URL=postgresql://user:pass@rds.amazonaws.com:5432/productdb
ORDER_DATABASE_URL=postgresql://user:pass@rds.amazonaws.com:5432/orderdb
```

**Azure Database for PostgreSQL**:
```bash
USER_DATABASE_URL=postgresql://user@server:pass@server.postgres.database.azure.com:5432/userdb
```

### Cache & Message Broker

#### Use Managed Services

**AWS**:
- ElastiCache (Redis)
- Amazon MQ (RabbitMQ)

**Azure**:
- Azure Cache for Redis
- Azure Service Bus

**Configuration**:
```bash
REDIS_URL=redis://cache.amazonaws.com:6379
RABBITMQ_URL=amqps://mq.amazonaws.com:5671
```

### SSL/TLS Configuration

#### Use Reverse Proxy (Nginx/Traefik)

```yaml
# docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
```

### Deployment Steps

```bash
# 1. Update environment
cp .env.example .env
# Edit .env with production values

# 2. Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# 3. Run database migrations
docker compose run user-service alembic upgrade head
docker compose run product-service alembic upgrade head
docker compose run order-service alembic upgrade head

# 4. Start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. Verify deployment
make status

# 6. Run smoke tests
make test-api
```

### Monitoring & Alerts

#### Configure Grafana Alerts

1. Open Grafana: http://localhost:3000
2. Login with admin credentials
3. Navigate to Alerting → Alert rules
4. Configure alerts for:
   - High CPU usage
   - Memory usage
   - Disk space
   - Service downtime
   - Error rates

### Backup Strategy

```bash
# Automated daily backups
0 2 * * * cd /path/to/micro-src && make backup-db

# Backup to S3/Azure Blob
aws s3 sync ./backups s3://my-backups/micro-services/
```

### Scaling Considerations

#### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  user-service:
    deploy:
      replicas: 3
  product-service:
    deploy:
      replicas: 3
```

#### Load Balancer

```yaml
  nginx:
    image: nginx:alpine
    depends_on:
      - user-service
      - product-service
      - order-service
    ports:
      - "80:80"
```

---

## 📚 Additional Resources

- **Architecture Documentation**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Documentation**: [README.md - API Reference](README.md#api-reference)
- **DevOps Guide**: [DEVOPS_README.md](DEVOPS_README.md)
- **Testing Guide**: [TESTING.md](TESTING.md)
- **CORS Configuration**: [CORS_CONFIGURATION.md](CORS_CONFIGURATION.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

## 🆘 Support

### Documentation
- Project README: [README.md](README.md)
- Quick Start: [QUICKSTART.md](QUICKSTART.md)

### Community
- GitHub Issues: https://github.com/congdinh2008/python-micro/issues
- Discussions: https://github.com/congdinh2008/python-micro/discussions

### Contact
- Author: Cong Dinh (@congdinh2008)
- License: MIT

---

**Version**: 1.4.0  
**Last Updated**: 2025-10-18  
**Maintainer**: Cong Dinh (@congdinh2008)
