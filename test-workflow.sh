#!/bin/bash
# =============================================================================
# Local CI/CD Workflow Test Script
# =============================================================================
# This script simulates the CI/CD pipeline locally before pushing to GitHub
# Usage: ./test-workflow.sh [service-name]
#        If no service specified, tests all services
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKING_DIR="micro-src/server"
SERVICES=("user-service" "product-service" "order-service" "notification-service")

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Lint and Test Services
test_service() {
    local service=$1
    print_header "Testing ${service}"
    
    cd "${WORKING_DIR}/${service}" || exit 1
    
    # Install dependencies
    print_info "Installing dependencies..."
    python -m pip install --upgrade pip -q
    pip install -r requirements.txt -q
    pip install pytest pytest-asyncio pytest-cov httpx flake8 -q
    
    # Run linting
    print_info "Running linting..."
    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || {
        print_error "Linting failed for ${service}"
        cd - > /dev/null
        return 1
    }
    
    # Run tests if they exist
    if [ -d "tests" ] && [ "$(ls -A tests/*.py 2>/dev/null)" ]; then
        print_info "Running tests..."
        pytest tests/ -v --cov=app --cov-report=term || {
            print_error "Tests failed for ${service}"
            cd - > /dev/null
            return 1
        }
    else
        print_warning "No tests found for ${service}"
    fi
    
    print_success "${service} passed all checks"
    cd - > /dev/null
    return 0
}

# Step 2: Build Docker Images
build_service() {
    local service=$1
    print_header "Building Docker image for ${service}"
    
    docker build -t "${service}:test" "${WORKING_DIR}/${service}" || {
        print_error "Docker build failed for ${service}"
        return 1
    }
    
    print_success "Docker image built for ${service}"
    return 0
}

# Step 3: Integration Tests
run_integration_tests() {
    print_header "Running Integration Tests"
    
    cd micro-src || exit 1
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_info "Creating .env from .env.example..."
            cp .env.example .env
        fi
    fi
    
    # Start services
    print_info "Starting services with Docker Compose..."
    docker compose up -d
    
    print_info "Waiting for services to be ready (60s)..."
    sleep 60
    
    # Check infrastructure
    print_info "Checking infrastructure..."
    docker compose exec -T user-db pg_isready -U user || print_warning "User DB not ready"
    docker compose exec -T product-db pg_isready -U user || print_warning "Product DB not ready"
    docker compose exec -T order-db pg_isready -U user || print_warning "Order DB not ready"
    docker compose exec -T redis redis-cli ping || print_warning "Redis not ready"
    
    # Check service health
    print_info "Checking service health..."
    local all_healthy=true
    for service_port in "user-service:8001" "product-service:8002" "order-service:8003" "notification-service:8004"; do
        IFS=':' read -r name port <<< "$service_port"
        if curl -f "http://localhost:${port}/health" 2>/dev/null; then
            print_success "${name} is healthy"
        else
            print_error "${name} is not healthy"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = false ]; then
        print_error "Some services are not healthy"
        docker compose logs
        docker compose down -v
        cd - > /dev/null
        return 1
    fi
    
    # Run integration tests
    print_info "Running integration tests..."
    
    TIMESTAMP=$(date +%s)
    TEST_USER="test_user_${TIMESTAMP}"
    
    # Test user registration
    print_info "Testing user registration..."
    REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8001/register \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"${TEST_USER}\",\"password\":\"Test@123\"}")
    
    if echo "$REGISTER_RESPONSE" | grep -q "username"; then
        print_success "User registration successful"
    else
        print_error "User registration failed: $REGISTER_RESPONSE"
        docker compose down -v
        cd - > /dev/null
        return 1
    fi
    
    # Test user login
    print_info "Testing user login..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/login \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=${TEST_USER}&password=Test@123")
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    
    if [ -n "$TOKEN" ]; then
        print_success "User login successful"
    else
        print_error "User login failed"
        docker compose down -v
        cd - > /dev/null
        return 1
    fi
    
    # Test product creation
    print_info "Testing product creation..."
    PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:8002/products \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"name\":\"Test Product ${TIMESTAMP}\",\"description\":\"Test\",\"price\":99.99,\"quantity\":10}")
    
    PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
    
    if [ -n "$PRODUCT_ID" ]; then
        print_success "Product creation successful (ID: $PRODUCT_ID)"
    else
        print_error "Product creation failed"
        docker compose down -v
        cd - > /dev/null
        return 1
    fi
    
    # Test order creation
    print_info "Testing order creation..."
    ORDER_RESPONSE=$(curl -s -X POST http://localhost:8003/orders \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "{\"product_id\":${PRODUCT_ID},\"quantity\":2}")
    
    if echo "$ORDER_RESPONSE" | grep -q "id"; then
        print_success "Order creation successful"
    else
        print_error "Order creation failed"
        docker compose down -v
        cd - > /dev/null
        return 1
    fi
    
    print_success "All integration tests passed!"
    
    # Cleanup
    print_info "Stopping services..."
    docker compose down -v
    
    cd - > /dev/null
    return 0
}

# Main execution
main() {
    print_header "Local CI/CD Workflow Test"
    
    # Check if specific service is specified
    if [ $# -eq 1 ]; then
        SERVICES=("$1")
        print_info "Testing single service: $1"
    else
        print_info "Testing all services"
    fi
    
    # Test each service
    for service in "${SERVICES[@]}"; do
        if ! test_service "$service"; then
            print_error "Workflow failed at testing ${service}"
            exit 1
        fi
    done
    
    # Build Docker images
    for service in "${SERVICES[@]}"; do
        if ! build_service "$service"; then
            print_error "Workflow failed at building ${service}"
            exit 1
        fi
    done
    
    # Run integration tests (only if testing all services)
    if [ $# -eq 0 ]; then
        if ! run_integration_tests; then
            print_error "Integration tests failed"
            exit 1
        fi
    else
        print_info "Skipping integration tests (single service mode)"
    fi
    
    print_header "🎉 All Workflow Tests Passed! 🎉"
    print_success "Your code is ready to be pushed!"
    
    return 0
}

# Run main
main "$@"
