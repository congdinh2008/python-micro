# 📜 Testing Scripts Documentation

This directory contains testing scripts for the Python Microservices E-Commerce Platform.

## 📁 Available Scripts

### 1. `test-api.sh` - Basic API Testing

**Purpose**: Quick smoke test of all API endpoints

**What it tests**:
- ✅ Service health checks
- ✅ User registration
- ✅ User login & JWT token generation
- ✅ Product creation with authentication
- ✅ Order creation with product validation

**Usage**:
```bash
# Direct execution
bash deployment/scripts/test-api.sh

# Or using Makefile
make test-api
```

**Features**:
- 🎯 Dynamic username generation (no conflicts)
- ✅ Comprehensive error handling
- 🎨 Color-coded output
- 📊 HTTP status code validation

---

### 2. `test-complete.sh` - Comprehensive Integration Testing

**Purpose**: Full end-to-end testing with detailed validation

**What it tests**:
- 🏥 Health checks for all 4 services
- 👤 User management (register, login)
- 📦 Product CRUD operations
- 🛒 Order creation and management
- 📊 Data validation and error handling

**Usage**:
```bash
# Direct execution
bash deployment/scripts/test-complete.sh

# Or using Makefile
make test-complete
```

**Features**:
- 🔍 Pre-flight health checks
- 🎯 Dynamic data generation
- ✅ Exit on first error (`set -e`)
- 📈 Summary statistics
- 💡 Helpful next steps

---

### 3. `test_assignment4.sh` - Assignment 4 Integration Tests ⭐

**Purpose**: Test Redis cache, Order Service, and RabbitMQ integration

**What it tests**:
- ✅ User authentication flow
- 🗄️ **Redis Cache**: Cache HIT/MISS/Invalidation
- 📦 Product CRUD with caching
- 🛒 Order creation with RabbitMQ events
- 📧 Notification service message processing
- 🔄 Order status updates

**Usage**:
```bash
# Direct execution
bash deployment/scripts/test_assignment4.sh

# Or using Makefile (recommended)
make test-assignment4
```

**Features**:
- 🎯 Tests all Assignment 4 requirements
- 🗄️ Redis cache validation (MISS → HIT → Invalidation)
- 📨 RabbitMQ message publishing verification
- ✅ Comprehensive error handling with `set -e`
- 🎨 Color-coded output (GREEN=success, RED=error, BLUE=info)
- 📊 Detailed summary with IDs and instructions

**Example Output**:
```
✅ Product created with ID: 5
✅ Redis cache test completed
✅ Order created with ID: 12
✅ Order update test completed

Summary:
  • User created and authenticated
  • Product created (ID: 5)
  • Redis cache working (check Product Service logs)
  • Order created (ID: 12)
  • RabbitMQ message published
  • Notification received
```

---

## 🎯 Quick Comparison

| Script | Level | Time | Best For |
|--------|-------|------|----------|
| `test-api.sh` | Basic | ~30s | Quick smoke test |
| `test-complete.sh` | Comprehensive | ~45s | Full integration test |
| `test_assignment4.sh` | Advanced | ~60s | Assignment 4 validation |

---

## 🚀 Prerequisites

### Required Services
All scripts require these services to be running:

```bash
# Start all services
make up
# or
bash deploy.sh
# or
docker compose up -d

# Verify services are running
make status
```

**Required Services**:
- ✅ User Service (Port 8001)
- ✅ Product Service (Port 8002)
- ✅ Order Service (Port 8003)
- ✅ Notification Service (Port 8004)
- ✅ PostgreSQL databases (3 instances)
- ✅ Redis cache
- ✅ RabbitMQ message broker

### Required Tools
- `curl` - For HTTP requests
- `jq` (optional) - For JSON parsing (test-complete.sh)
- `bash` - Shell interpreter

---

## 📊 Common Commands

```bash
# Run all tests in sequence
make test-api && make test-complete && make test-assignment4

# Run specific test
make test-assignment4

# Check service logs after tests
docker compose logs -f notification-service

# Check RabbitMQ messages
open http://localhost:15672  # guest/guest

# Check Redis cache
docker exec -it redis-cache redis-cli
> KEYS product:*
> GET product:1
```

---

## 🔧 Troubleshooting

### Services Not Responding

**Error**: `❌ Service on port 8001 is not running`

**Solution**:
```bash
# Check service status
docker compose ps

# Restart services
make restart

# Check logs
make logs
```

### Authentication Failed

**Error**: `❌ Failed to get token`

**Solution**:
```bash
# Check User Service logs
docker compose logs user-service

# Test User Service directly
curl http://localhost:8001/health
```

### Product Creation Failed

**Error**: `❌ Failed to create product`

**Solution**:
```bash
# Check if token is valid
echo $TOKEN

# Check Product Service logs
docker compose logs product-service

# Verify Redis is running
docker compose ps redis
```

### Order Creation Failed

**Error**: `❌ Failed to create order`

**Solution**:
```bash
# Check Order Service logs
docker compose logs order-service

# Verify RabbitMQ is running
docker compose ps rabbitmq

# Check product exists
curl http://localhost:8002/products
```

---

## 🎨 Script Features

### Color-Coded Output
- 🟢 **GREEN**: Success messages
- 🔴 **RED**: Error messages
- 🔵 **BLUE**: Information
- 🟡 **YELLOW**: Warnings

### Error Handling
All scripts use:
```bash
set -e  # Exit immediately on error
```

This ensures tests fail fast on any error.

### Dynamic Data
Scripts generate unique data:
```bash
USERNAME="testuser_$(date +%s)"
PRODUCT_NAME="Test Product $(date +%s)"
```

This prevents conflicts on multiple test runs.

---

## 📝 Writing Custom Tests

### Template for New Test Script

```bash
#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting custom test...${NC}"

# Check services
for PORT in 8001 8002 8003; do
    if ! curl -s -f http://localhost:$PORT/health > /dev/null; then
        echo -e "${RED}❌ Service on port $PORT not running${NC}"
        exit 1
    fi
done

# Your test logic here
echo -e "${GREEN}✅ Test completed${NC}"
```

---

## 📚 Related Documentation

- **Deployment Guide**: [DEPLOYMENT.md](../../DEPLOYMENT.md)
- **API Documentation**: [README.md](../../README.md#api-reference)
- **Testing Guide**: [TESTING.md](../../TESTING.md)
- **Troubleshooting**: [DEPLOYMENT.md - Troubleshooting](../../DEPLOYMENT.md#-troubleshooting)

---

## 🆘 Getting Help

### View Logs
```bash
# All services
make logs

# Specific service
make logs-service SERVICE=user-service
```

### Check Service Status
```bash
make status
```

### Reset Everything
```bash
make clean
make dev-setup
```

---

**Last Updated**: 2025-10-18  
**Maintainer**: Cong Dinh (@congdinh2008)
