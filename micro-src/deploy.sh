#!/bin/bash

# ==============================================================================
# Docker Setup and Deployment Script
# ==============================================================================

set -e

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          Python Microservices - Docker Deployment Setup                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==============================================================================
# 1. Check Docker Installation
# ==============================================================================

echo "🔍 Step 1: Checking Docker installation..."

# Add Docker to PATH if it exists
if [ -d "/Applications/Docker.app/Contents/Resources/bin" ]; then
    export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
    echo "✅ Docker path added"
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "${RED}❌ Docker command not found${NC}"
    echo ""
    echo "Please ensure Docker Desktop is installed and running:"
    echo "1. Open Docker Desktop from Applications"
    echo "2. Wait for Docker to start (whale icon in menu bar)"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "${RED}❌ Docker daemon is not running${NC}"
    echo ""
    echo "Please start Docker Desktop:"
    echo "1. Open Docker Desktop from Applications"
    echo "2. Wait for the Docker engine to start"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Docker daemon is running"

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "${RED}❌ Docker Compose not found${NC}"
    exit 1
fi

echo "✅ Docker Compose found: $(docker compose version)"
echo ""

# ==============================================================================
# 2. Check Environment Configuration
# ==============================================================================

echo "🔍 Step 2: Checking environment configuration..."

if [ ! -f .env ]; then
    echo "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo "✅ .env file created"
    echo "${YELLOW}⚠️  Please review .env file and update if needed${NC}"
    echo ""
fi

echo "✅ Environment configuration ready"
echo ""

# ==============================================================================
# 3. Clean Previous Deployment
# ==============================================================================

echo "🔍 Step 3: Cleaning previous deployment..."

# Stop and remove containers, networks, volumes
docker compose down -v --remove-orphans 2>/dev/null || true
echo "✅ Previous deployment cleaned"
echo ""

# ==============================================================================
# 4. Build Docker Images
# ==============================================================================

echo "🔨 Step 4: Building Docker images..."
echo "${YELLOW}This may take several minutes on first run...${NC}"
echo ""

docker compose build --no-cache

echo "✅ Docker images built successfully"
echo ""

# ==============================================================================
# 5. Start Services
# ==============================================================================

echo "🚀 Step 5: Starting services..."
echo ""

docker compose up -d

echo "✅ Services started"
echo ""

# ==============================================================================
# 6. Wait for Services to be Healthy
# ==============================================================================

echo "⏳ Step 6: Waiting for services to be healthy..."
echo ""

MAX_RETRIES=30
RETRY_COUNT=0

check_service() {
    local service_name=$1
    local port=$2
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s -f http://localhost:${port}/health > /dev/null 2>&1; then
            echo "✅ ${service_name} is healthy"
            return 0
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "   Waiting for ${service_name}... (${RETRY_COUNT}/${MAX_RETRIES})"
        sleep 2
    done
    
    echo "${RED}❌ ${service_name} failed to start${NC}"
    return 1
}

# Wait for databases first
echo "Waiting for databases to start..."
sleep 20

# Check each service
RETRY_COUNT=0
check_service "User Service" 8001

RETRY_COUNT=0
check_service "Product Service" 8002

RETRY_COUNT=0
check_service "Order Service" 8003

RETRY_COUNT=0
check_service "Notification Service" 8004

echo ""
echo "✅ All services are healthy!"
echo ""

# ==============================================================================
# 7. Display Service Status
# ==============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                          Deployment Summary                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "${GREEN}📦 Running Containers:${NC}"
docker compose ps
echo ""

echo "${GREEN}🌐 Service Endpoints:${NC}"
echo "   • User Service:         http://localhost:8001/docs"
echo "   • Product Service:      http://localhost:8002/docs"
echo "   • Order Service:        http://localhost:8003/docs"
echo "   • Notification Service: http://localhost:8004/docs"
echo ""

echo "${GREEN}📊 Observability Stack:${NC}"
echo "   • Grafana:              http://localhost:3000 (admin/admin)"
echo "   • Prometheus:           http://localhost:9090"
echo "   • Jaeger:               http://localhost:16686"
echo "   • RabbitMQ Management:  http://localhost:15672 (guest/guest)"
echo ""

echo "${GREEN}💾 Databases:${NC}"
echo "   • User DB:              localhost:5433"
echo "   • Product DB:           localhost:5434"
echo "   • Order DB:             localhost:5435"
echo "   • Redis:                localhost:6379"
echo ""

# ==============================================================================
# 8. Run Basic Health Check
# ==============================================================================

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                          Health Check                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "🏥 Service Health Status:"
echo ""

for port in 8001 8002 8003 8004; do
    response=$(curl -s http://localhost:${port}/health)
    if [ $? -eq 0 ]; then
        echo "   ✅ Port ${port}: ${response}"
    else
        echo "   ❌ Port ${port}: Not responding"
    fi
done

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                     🎉 Deployment Successful! 🎉                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "${BLUE}Next Steps:${NC}"
echo "1. Test API endpoints: make test-api"
echo "2. Run integration tests: make test-complete"
echo "3. Open API documentation: make docs"
echo "4. View monitoring dashboards: make monitoring"
echo "5. View logs: make logs"
echo ""

echo "${YELLOW}Quick Commands:${NC}"
echo "   make help          - Show all available commands"
echo "   make status        - Check service status"
echo "   make logs          - View all logs"
echo "   make down          - Stop all services"
echo "   make clean         - Remove all containers and volumes"
echo ""

echo "Happy coding! 🚀"
