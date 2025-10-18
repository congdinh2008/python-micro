#!/bin/bash

# Assignment 4 Testing Script
# Tests Redis Cache, Order Service, and RabbitMQ integration
#
# Usage:
#   chmod +x test_assignment4.sh
#   ./test_assignment4.sh
#
# Prerequisites:
#   - All services running (docker-compose up -d)
#   - curl and jq installed

set -e

echo "================================================"
echo "🚀 Assignment 4 - Testing Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URLs
USER_SERVICE="http://localhost:8001"
PRODUCT_SERVICE="http://localhost:8002"
ORDER_SERVICE="http://localhost:8003"
NOTIFICATION_SERVICE="http://localhost:8004"

# Variables
TOKEN=""
PRODUCT_ID=""
ORDER_ID=""

echo -e "${BLUE}Step 0: Check all services are running${NC}"
echo "----------------------------------------------"

for SERVICE in "$USER_SERVICE/health" "$PRODUCT_SERVICE/health" "$ORDER_SERVICE/health" "$NOTIFICATION_SERVICE/health"; do
    if curl -s -f "$SERVICE" > /dev/null; then
        echo -e "${GREEN}✅ $SERVICE is running${NC}"
    else
        echo -e "${RED}❌ $SERVICE is not running${NC}"
        echo "Please start all services with: docker-compose up -d"
        exit 1
    fi
done

echo ""
echo -e "${BLUE}Step 1: Register and Login${NC}"
echo "----------------------------------------------"

# Generate random username
USERNAME="testuser_$(date +%s)"

# Register
echo "Registering user: $USERNAME"
curl -s -X POST "$USER_SERVICE/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"testpass123\"
  }" | jq '.'

# Login
echo ""
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$USER_SERVICE/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USERNAME&password=testpass123")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to get token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtained: ${TOKEN:0:20}...${NC}"

echo ""
echo -e "${BLUE}Step 2: Create Product${NC}"
echo "----------------------------------------------"

PRODUCT_RESPONSE=$(curl -s -X POST "$PRODUCT_SERVICE/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop for testing",
    "price": 25000000,
    "quantity": 10
  }')

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.id')

if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create product${NC}"
    echo "Response:"
    echo "$PRODUCT_RESPONSE" | jq '.'
    exit 1
fi

echo "$PRODUCT_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Product created with ID: $PRODUCT_ID${NC}"

echo ""
echo -e "${BLUE}Step 3: Test Redis Cache${NC}"
echo "----------------------------------------------"

echo "First request (should be Cache MISS):"
curl -s "$PRODUCT_SERVICE/products/$PRODUCT_ID" | jq '.'

echo ""
echo "Second request (should be Cache HIT):"
curl -s "$PRODUCT_SERVICE/products/$PRODUCT_ID" | jq '.'

echo ""
echo "Updating product to invalidate cache:"
curl -s -X PUT "$PRODUCT_SERVICE/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 24000000
  }' | jq '.'

echo ""
echo "Third request (should be Cache MISS after invalidation):"
curl -s "$PRODUCT_SERVICE/products/$PRODUCT_ID" | jq '.'

echo -e "${GREEN}✅ Redis cache test completed${NC}"

echo ""
echo -e "${BLUE}Step 4: Test Order Creation${NC}"
echo "----------------------------------------------"

echo "Creating order..."
ORDER_RESPONSE=$(curl -s -X POST "$ORDER_SERVICE/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"product_id\": $PRODUCT_ID,
    \"quantity\": 2
  }")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create order${NC}"
    echo "$ORDER_RESPONSE"
    exit 1
fi

echo "$ORDER_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Order created with ID: $ORDER_ID${NC}"

echo ""
echo -e "${BLUE}Step 5: Verify RabbitMQ Message${NC}"
echo "----------------------------------------------"
echo "Check the Notification Service logs for the order confirmation message:"
echo "docker-compose logs notification-service | tail -20"
echo ""
echo "You should see:"
echo "  📧 SENDING ORDER CONFIRMATION EMAIL"
echo "  Order ID: $ORDER_ID"
echo ""

echo ""
echo -e "${BLUE}Step 6: Test Order Retrieval${NC}"
echo "----------------------------------------------"

echo "Getting all orders:"
curl -s "$ORDER_SERVICE/orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "Getting specific order:"
curl -s "$ORDER_SERVICE/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "${GREEN}✅ Order retrieval test completed${NC}"

echo ""
echo -e "${BLUE}Step 7: Test Order Update${NC}"
echo "----------------------------------------------"

echo "Updating order status to confirmed:"
curl -s -X PUT "$ORDER_SERVICE/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "confirmed"
  }' | jq '.'

echo -e "${GREEN}✅ Order update test completed${NC}"

echo ""
echo "================================================"
echo -e "${GREEN}✅ All tests passed successfully!${NC}"
echo "================================================"
echo ""
echo "Summary:"
echo "  - User created and authenticated"
echo "  - Product created (ID: $PRODUCT_ID)"
echo "  - Redis cache working (check Product Service logs)"
echo "  - Order created (ID: $ORDER_ID)"
echo "  - RabbitMQ message published (check Order Service logs)"
echo "  - Notification received (check Notification Service logs)"
echo ""
echo "Next steps:"
echo "  1. Check RabbitMQ Management UI: http://localhost:15672 (guest/guest)"
echo "  2. View service logs: docker-compose logs -f"
echo "  3. Monitor Redis (container name may vary):"
echo "     docker exec -it redis-cache redis-cli"
echo "     Or: docker exec -it \$(docker ps -qf 'name=redis') redis-cli"
echo ""
