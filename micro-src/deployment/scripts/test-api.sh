#!/bin/bash
# API Testing Script - Improved Version
# Tests basic API functionality with proper error handling

set -e  # Exit on error

export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  PYTHON MICROSERVICES - API TESTING"
echo "========================================"
echo ""

# Generate unique username
USERNAME="testuser_$(date +%s)"
PASSWORD="Test@123"

# Check if services are running
echo -e "${BLUE}🔍 Checking services...${NC}"
for PORT in 8001 8002 8003 8004; do
    if curl -s -f http://localhost:$PORT/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Service on port $PORT is running${NC}"
    else
        echo -e "${RED}❌ Service on port $PORT is not running${NC}"
        echo "Please start services with: make up"
        exit 1
    fi
done
echo ""

# 1. Register User
echo -e "${BLUE}=== 1. REGISTER USER ===${NC}"
echo "Username: $USERNAME"
REGISTER_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

HTTP_CODE=$(echo "$REGISTER_RESP" | grep "HTTP_CODE" | cut -d: -f2)
REGISTER_BODY=$(echo "$REGISTER_RESP" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ User registered successfully${NC}"
    echo "$REGISTER_BODY"
else
    echo -e "${RED}❌ Failed to register user (HTTP $HTTP_CODE)${NC}"
    echo "$REGISTER_BODY"
    exit 1
fi
echo ""

# 2. Login
echo -e "${BLUE}=== 2. LOGIN & GET TOKEN ===${NC}"
LOGIN_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USERNAME&password=$PASSWORD")

HTTP_CODE=$(echo "$LOGIN_RESP" | grep "HTTP_CODE" | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_RESP" | grep -v "HTTP_CODE")

TOKEN=$(echo "$LOGIN_BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token${NC}"
    echo "$LOGIN_BODY"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:60}..."
echo ""

# 3. Get Products
echo -e "${BLUE}=== 3. GET ALL PRODUCTS ===${NC}"
PRODUCTS_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:8002/products)
HTTP_CODE=$(echo "$PRODUCTS_RESP" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Products retrieved successfully${NC}"
    echo "$PRODUCTS_RESP" | grep -v "HTTP_CODE" | head -c 200
    echo "..."
else
    echo -e "${RED}❌ Failed to get products${NC}"
fi
echo ""

# 4. Create Product  
echo -e "${BLUE}=== 4. CREATE PRODUCT ===${NC}"
PRODUCT_NAME="MacBook Pro M3 - $(date +%s)"
PRODUCT_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8002/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$PRODUCT_NAME\",\"description\":\"Latest MacBook\",\"price\":2499.99,\"quantity\":3}")

HTTP_CODE=$(echo "$PRODUCT_RESP" | grep "HTTP_CODE" | cut -d: -f2)
PRODUCT_BODY=$(echo "$PRODUCT_RESP" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    PRODUCT_ID=$(echo "$PRODUCT_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo -e "${GREEN}✅ Product created successfully (ID: $PRODUCT_ID)${NC}"
    echo "$PRODUCT_BODY"
else
    echo -e "${RED}❌ Failed to create product (HTTP $HTTP_CODE)${NC}"
    echo "$PRODUCT_BODY"
    exit 1
fi
echo ""

# 5. Create Order
echo -e "${BLUE}=== 5. CREATE ORDER ===${NC}"
if [ -z "$PRODUCT_ID" ]; then
    echo -e "${YELLOW}⚠️  No product ID, using product_id=1${NC}"
    PRODUCT_ID=1
fi

ORDER_RESP=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":$PRODUCT_ID,\"quantity\":1}")

HTTP_CODE=$(echo "$ORDER_RESP" | grep "HTTP_CODE" | cut -d: -f2)
ORDER_BODY=$(echo "$ORDER_RESP" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    ORDER_ID=$(echo "$ORDER_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo -e "${GREEN}✅ Order created successfully (ID: $ORDER_ID)${NC}"
    echo "$ORDER_BODY"
else
    echo -e "${RED}❌ Failed to create order (HTTP $HTTP_CODE)${NC}"
    echo "$ORDER_BODY"
    exit 1
fi
echo ""

echo "========================================"
echo -e "${GREEN}  ✅ API TESTING COMPLETE!${NC}"
echo "========================================"
echo ""
echo "Summary:"
echo "  • User: $USERNAME"
echo "  • Product ID: $PRODUCT_ID"
echo "  • Order ID: $ORDER_ID"
echo ""
echo "Check notification service logs:"
echo "  docker compose logs notification-service | tail -20"
echo ""
