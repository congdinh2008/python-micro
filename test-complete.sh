#!/bin/bash
# Complete API Test Suite

export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

echo "=========================================="
echo "  MICROSERVICES API TEST - SUMMARY"
echo "=========================================="
echo ""

# Test Health Checks
echo "🏥 HEALTH CHECKS:"
echo "User Service:    $(curl -s http://localhost:8001/health | grep -o '"status":"[^"]*"')"
echo "Product Service: $(curl -s http://localhost:8002/health | grep -o '"status":"[^"]*"')"
echo "Order Service:   $(curl -s http://localhost:8003/health | grep -o '"status":"[^"]*"')"
echo "Notification:    $(curl -s http://localhost:8004/health | grep -o '"status":"[^"]*"')"
echo ""

# Create test user
USERNAME="testuser$(date +%s)"
echo "📝 Creating test user: $USERNAME"
REGISTER=$(curl -s -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"Test123\"}")
echo "Register: $(echo $REGISTER | head -c 100)"
echo ""

# Login
echo "🔐 Login..."
LOGIN_RESP=$(curl -s -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$USERNAME&password=Test123")
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi
echo "✅ Token received: ${TOKEN:0:40}..."
echo ""

# Create Product
echo "📦 Creating product..."
PRODUCT=$(curl -s -X POST http://localhost:8002/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test","price":99.99,"quantity":10}')
PRODUCT_ID=$(echo "$PRODUCT" | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Product created: ID=$PRODUCT_ID"
echo ""

# List Products
echo "📋 List all products..."
curl -s http://localhost:8002/products | head -c 150
echo "..."
echo ""

# Create Order
echo "🛒 Creating order for product $PRODUCT_ID..."
ORDER=$(curl -s -w "\nHTTP:%{http_code}" -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\":$PRODUCT_ID,\"quantity\":2}")
echo "$ORDER"
echo ""

echo "=========================================="
echo "  TEST SUITE COMPLETED!"
echo "=========================================="
