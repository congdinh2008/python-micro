#!/bin/bash
# Complete API Test Suite - Improved Version
# Tests all microservices with comprehensive validation

set -e  # Exit on error

export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  MICROSERVICES API TEST - SUMMARY"
echo "=========================================="
echo ""

# Test Health Checks
echo -e "${BLUE}🏥 HEALTH CHECKS:${NC}"
ALL_HEALTHY=true

for SERVICE in "User:8001" "Product:8002" "Order:8003" "Notification:8004"; do
    NAME=$(echo $SERVICE | cut -d: -f1)
    PORT=$(echo $SERVICE | cut -d: -f2)
    
    if HEALTH=$(curl -s http://localhost:$PORT/health 2>&1); then
        STATUS=$(echo "$HEALTH" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$STATUS" = "healthy" ]; then
            echo -e "${GREEN}✅ $NAME Service ($PORT): healthy${NC}"
        else
            echo -e "${YELLOW}⚠️  $NAME Service ($PORT): $STATUS${NC}"
        fi
    else
        echo -e "${RED}❌ $NAME Service ($PORT): not responding${NC}"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = false ]; then
    echo -e "${RED}❌ Some services are not healthy. Please start with: make up${NC}"
    exit 1
fi
echo ""

# Create test user
USERNAME="testuser$(date +%s)"
PASSWORD="Test@123"

echo -e "${BLUE}📝 Creating test user: $USERNAME${NC}"
REGISTER=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

HTTP_CODE=$(echo "$REGISTER" | grep "HTTP_CODE" | cut -d: -f2)
if [ "$HTTP_CODE" != "201" ] && [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}❌ Failed to register user (HTTP $HTTP_CODE)${NC}"
    echo "$REGISTER" | grep -v "HTTP_CODE"
    exit 1
fi
echo -e "${GREEN}✅ User registered${NC}"
echo ""

# Login
echo -e "${BLUE}🔐 Login...${NC}"
LOGIN_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USERNAME&password=$PASSWORD")

HTTP_CODE=$(echo "$LOGIN_RESP" | grep "HTTP_CODE" | cut -d: -f2)
TOKEN=$(echo "$LOGIN_RESP" | grep -v "HTTP_CODE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Login failed (HTTP $HTTP_CODE)!${NC}"
  echo "$LOGIN_RESP" | grep -v "HTTP_CODE"
  exit 1
fi
echo -e "${GREEN}✅ Token received: ${TOKEN:0:40}...${NC}"
echo ""

# Create Product
echo -e "${BLUE}📦 Creating product...${NC}"
PRODUCT_NAME="Test Product $(date +%s)"
PRODUCT=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8002/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$PRODUCT_NAME\",\"description\":\"Test Product\",\"price\":99.99,\"quantity\":10}")

HTTP_CODE=$(echo "$PRODUCT" | grep "HTTP_CODE" | cut -d: -f2)
PRODUCT_BODY=$(echo "$PRODUCT" | grep -v "HTTP_CODE")
PRODUCT_ID=$(echo "$PRODUCT_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create product (HTTP $HTTP_CODE)${NC}"
    echo "$PRODUCT_BODY"
    exit 1
fi
echo -e "${GREEN}✅ Product created: ID=$PRODUCT_ID${NC}"
echo ""

# List Products
echo -e "${BLUE}📋 List all products...${NC}"
PRODUCTS=$(curl -s http://localhost:8002/products)
PRODUCT_COUNT=$(echo "$PRODUCTS" | grep -o '"id":' | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Found $PRODUCT_COUNT products${NC}"
echo ""

# Create Order
echo -e "${BLUE}🛒 Creating order for product $PRODUCT_ID...${NC}"
ORDER=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":$PRODUCT_ID,\"quantity\":2}")

HTTP_CODE=$(echo "$ORDER" | grep "HTTP_CODE" | cut -d: -f2)
ORDER_BODY=$(echo "$ORDER" | grep -v "HTTP_CODE")
ORDER_ID=$(echo "$ORDER_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Order created successfully (ID: $ORDER_ID)${NC}"
else
    echo -e "${RED}❌ Failed to create order (HTTP $HTTP_CODE)${NC}"
    echo "$ORDER_BODY"
    exit 1
fi
echo ""

echo "=========================================="
echo -e "${GREEN}  ✅ TEST SUITE COMPLETED!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  • User: $USERNAME"
echo "  • Product ID: $PRODUCT_ID ($PRODUCT_NAME)"
echo "  • Order ID: $ORDER_ID (Quantity: 2)"
echo "  • Total Products: $PRODUCT_COUNT"
echo ""
echo "Check notification service logs:"
echo "  docker compose logs notification-service | tail -20"
echo ""
