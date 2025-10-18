#!/bin/bash

# ==============================================================================
# Quick Start Script - Fast Deployment Check
# ==============================================================================

set -e

echo "🚀 Quick Deployment Check"
echo ""

# Add Docker to PATH
if [ -d "/Applications/Docker.app/Contents/Resources/bin" ]; then
    export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Show running containers
echo "📦 Running Containers:"
docker compose ps
echo ""

# Check service health
echo "🏥 Service Health:"
echo ""

check_health() {
    local name=$1
    local port=$2
    
    if curl -s -f http://localhost:${port}/health > /dev/null 2>&1; then
        status=$(curl -s http://localhost:${port}/health | head -c 100)
        echo "   ✅ ${name} (${port}): ${status}"
    else
        echo "   ❌ ${name} (${port}): Not responding"
    fi
}

check_health "User Service" 8001
check_health "Product Service" 8002
check_health "Order Service" 8003
check_health "Notification Service" 8004

echo ""
echo "📊 Useful URLs:"
echo "   • API Docs:       http://localhost:8001/docs"
echo "   • Grafana:        http://localhost:3000 (admin/admin)"
echo "   • Jaeger:         http://localhost:16686"
echo "   • Prometheus:     http://localhost:9090"
echo "   • RabbitMQ:       http://localhost:15672 (guest/guest)"
echo ""
