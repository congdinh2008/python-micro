#!/bin/bash
# API Testing Script

export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"

echo "========================================"
echo "  PYTHON MICROSERVICES - API TESTING"
echo "========================================"
echo ""

# 1. Register User
echo "=== 1. REGISTER USER ==="
curl -w "\n" -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo2025","password":"Pass123"}'
echo ""

# 2. Login
echo "=== 2. LOGIN & GET TOKEN ==="
LOGIN_RESP=$(curl -s -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo2025&password=Pass123")
echo "$LOGIN_RESP"

TOKEN=$(echo "$LOGIN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:60}..."
echo ""

# 3. Get Products
echo "=== 3. GET ALL PRODUCTS ==="
curl -w "\n" http://localhost:8002/products
echo ""

# 4. Create Product  
echo "=== 4. CREATE PRODUCT ==="
curl -w "\n" -X POST http://localhost:8002/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"MacBook Pro M3","description":"Latest MacBook","price":2499.99,"quantity":3}'
echo ""

# 5. Create Order
echo "=== 5. CREATE ORDER ==="
curl -w "\n" -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":1}'
echo ""

echo "========================================"
echo "  API TESTING COMPLETE!"
echo "========================================"
