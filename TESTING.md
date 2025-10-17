# Testing Guide for Microservices

This document provides instructions for testing the User Service and Product Service microservices.

## Prerequisites

- Python 3.9+
- PostgreSQL 12+ (or SQLite for development)
- pip or pipenv

## Testing Strategy

### 1. Manual Testing with curl

#### Start Services

Terminal 1 (User Service):
```bash
cd user-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with SQLite: DATABASE_URL=sqlite:///./user_service.db
alembic upgrade head
uvicorn app.main:app --port 8001 --reload
```

Terminal 2 (Product Service):
```bash
cd product-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with:
#   DATABASE_URL=sqlite:///./product_service.db
#   USER_SERVICE_URL=http://localhost:8001
alembic upgrade head
uvicorn app.main:app --port 8002 --reload
```

#### Test Sequence

```bash
# 1. Check health endpoints
curl http://localhost:8001/health
curl http://localhost:8002/health

# 2. Register a user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# 3. Login and get token
TOKEN=$(curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123" | jq -r '.access_token')

echo "Token: $TOKEN"

# 4. Validate token directly (User Service)
curl -X POST http://localhost:8001/validate-token \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"

# 5. Create product with token (Product Service validates via User Service)
curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 99.99,
    "quantity": 10
  }'

# 6. Get all products (public endpoint)
curl http://localhost:8002/products

# 7. Get specific product
curl http://localhost:8002/products/1

# 8. Update product (requires token)
curl -X PUT http://localhost:8002/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"price": 89.99, "quantity": 15}'

# 9. Delete product (requires token)
curl -X DELETE http://localhost:8002/products/1 \
  -H "Authorization: Bearer $TOKEN"

# 10. Try to create product without token (should fail with 401)
curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Product",
    "price": 50.00,
    "quantity": 5
  }'
```

### 2. Testing with Swagger UI

#### User Service
1. Open http://localhost:8001/docs
2. Test `/register` endpoint
3. Test `/login` endpoint and copy the access_token
4. Test `/validate-token` endpoint

#### Product Service
1. Open http://localhost:8002/docs
2. Click "Authorize" button at top right
3. Paste token in format: `Bearer <your_token>`
4. Test all product endpoints

### 3. Integration Testing

Test the complete flow between services:

```bash
#!/bin/bash
# integration-test.sh

set -e

echo "=== Integration Test ==="

echo "1. Testing User Service health..."
curl -s http://localhost:8001/health | jq

echo "2. Registering user..."
curl -s -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username": "integrationtest", "password": "test123"}' | jq

echo "3. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=integrationtest&password=test123" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

echo "4. Testing Product Service health..."
curl -s http://localhost:8002/health | jq

echo "5. Creating product with token..."
PRODUCT=$(curl -s -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Integration Test Product",
    "description": "Product created during integration test",
    "price": 199.99,
    "quantity": 5
  }')

echo "$PRODUCT" | jq

PRODUCT_ID=$(echo "$PRODUCT" | jq -r '.id')

if [ "$PRODUCT_ID" = "null" ] || [ -z "$PRODUCT_ID" ]; then
  echo "❌ Failed to create product"
  exit 1
fi

echo "✅ Created product with ID: $PRODUCT_ID"

echo "6. Getting product..."
curl -s http://localhost:8002/products/$PRODUCT_ID | jq

echo "7. Updating product..."
curl -s -X PUT http://localhost:8002/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"price": 149.99}' | jq

echo "8. Getting all products..."
curl -s http://localhost:8002/products | jq

echo "9. Testing unauthorized access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Unauthorized", "price": 10, "quantity": 1}')

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Correctly rejected unauthorized request"
else
  echo "❌ Should have rejected unauthorized request (got $HTTP_CODE)"
  exit 1
fi

echo "10. Deleting product..."
curl -s -X DELETE http://localhost:8002/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "✅ Integration test completed successfully!"
```

### 4. Docker Testing

```bash
# Start all services with Docker Compose
docker-compose up -d

# Wait for services to be ready
sleep 10

# Run integration tests
./integration-test.sh

# Stop services
docker-compose down
```

## Expected Results

### Successful Test Indicators

1. **Health Checks**: Both services return status "healthy"
2. **User Registration**: Returns user object with id and username
3. **Login**: Returns access_token and token_type
4. **Token Validation**: Returns valid=true and username
5. **Create Product**: Returns product object with id
6. **Unauthorized Access**: Returns 401 status code
7. **CRUD Operations**: All work correctly with valid token

### Common Issues

1. **Port in use**: Change ports in .env files
2. **User Service unreachable**: Check USER_SERVICE_URL in product-service/.env
3. **Database errors**: Ensure migrations are run with `alembic upgrade head`
4. **Token validation fails**: Verify SECRET_KEY is same in both services' configs (only User Service needs it)

## Performance Testing

Use tools like Apache Bench or wrk:

```bash
# Test User Service login endpoint
ab -n 1000 -c 10 -p login.txt -T 'application/x-www-form-urlencoded' \
  http://localhost:8001/login

# Test Product Service GET endpoint
ab -n 1000 -c 10 http://localhost:8002/products
```

## Security Testing

1. **Test with expired token**: Should return 401
2. **Test with invalid token**: Should return 401
3. **Test with missing token**: Should return 401
4. **Test SQL injection in inputs**: Should be prevented by Pydantic validation
5. **Test XSS in product descriptions**: Should be escaped by FastAPI

## Monitoring

- Check logs for errors
- Monitor response times
- Track successful vs failed authentications
- Monitor inter-service communication

---

For more information, see the README files in each service directory.
