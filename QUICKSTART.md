# ⚡ Quick Start Guide - E-commerce Microservices

## 🎯 5-Minute Demo

### Prerequisites
- Docker & Docker Compose installed
- 8GB RAM available
- jq (for JSON parsing) - Install: `sudo apt install jq` or `brew install jq`
- Required ports available:
  - Application: 8001-8004
  - Databases: 5433-5435
  - Infrastructure: 6379 (Redis), 5672/15672 (RabbitMQ)
  - Observability: 3000 (Grafana), 3100 (Loki), 9090 (Prometheus), 16686 (Jaeger)

### Step 1: Start Services (2 minutes)

```bash
# Clone and start
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 60

# Verify all services are running
docker-compose ps
```

### Step 2: Test the System (2 minutes)

```bash
# 1. Register a user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# 2. Login and get token
# Option 1: With jq (recommended)
TOKEN=$(curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo&password=demo123" \
  | jq -r '.access_token')

# Option 2: Without jq (copy token manually)
# curl -X POST http://localhost:8001/login \
#   -H "Content-Type: application/x-www-form-urlencoded" \
#   -d "username=demo&password=demo123"
# Then set: TOKEN="<your_token_here>"

echo "Token: $TOKEN"

# 3. Create a product
curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "MacBook Pro",
    "description": "Apple MacBook Pro 16-inch",
    "price": 2499.99,
    "quantity": 10
  }'

# 4. List products (cached)
curl http://localhost:8002/products | jq

# 5. Create an order (triggers notification)
curl -X POST http://localhost:8003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }' | jq

# 6. View order notification in logs
docker-compose logs notification-service --tail=20
```

### Step 3: Explore Observability (1 minute)

#### Grafana Dashboards
1. Open: http://localhost:3000
2. Login: admin / admin
3. Go to: Dashboards → Microservices Overview
4. See: Request rates, response times, error rates

#### Jaeger Traces
1. Open: http://localhost:16686
2. Select: "Order Service"
3. Click: "Find Traces"
4. View: Complete request flow across all services

#### Prometheus Metrics
1. Open: http://localhost:9090
2. Query examples:
   - `rate(http_requests_total[5m])` - Request rate
   - `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` - P95 latency

#### Loki Logs (in Grafana)
1. Grafana → Explore → Select Loki
2. Query: `{job=~".*-service"}`
3. Filter: `{job="order-service"} |= "created"`

## 🎨 Interactive API Documentation

- **User Service**: http://localhost:8001/docs
- **Product Service**: http://localhost:8002/docs
- **Order Service**: http://localhost:8003/docs
- **Notification Service**: http://localhost:8004/docs

Try the "Try it out" feature in Swagger UI!

## 🚀 What You Just Deployed

### 4 Microservices
✅ User Service - Authentication with JWT
✅ Product Service - Catalog with Redis cache
✅ Order Service - Orders with RabbitMQ events
✅ Notification Service - Async notifications

### 3 Databases
✅ PostgreSQL for each service (isolated data)

### 2 Infrastructure Services
✅ Redis - Caching layer
✅ RabbitMQ - Message broker

### Complete Observability Stack
✅ Prometheus - Metrics collection
✅ Loki - Log aggregation
✅ Jaeger - Distributed tracing
✅ Grafana - Unified visualization
✅ Promtail - Log collector

## 🎯 Key Features to Explore

### 1. Redis Caching
```bash
# First request - cache miss
time curl http://localhost:8002/products/1

# Second request - cache hit (faster!)
time curl http://localhost:8002/products/1

# View cache in Redis
docker exec -it redis-cache redis-cli
> KEYS *
> GET product:1
> TTL product:1
```

### 2. RabbitMQ Messaging
```bash
# Create an order
curl -X POST http://localhost:8003/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":1}'

# Check RabbitMQ Management UI
# Open in browser: http://localhost:15672 (guest/guest)
# Linux: xdg-open http://localhost:15672
# macOS: open http://localhost:15672
# Windows: start http://localhost:15672

# View message flow in:
# - Exchanges → order_events
# - Queues → order_notifications
```

### 3. Distributed Tracing
```bash
# Generate some traffic
for i in {1..10}; do
  curl http://localhost:8002/products
done

# View in Jaeger
# Open in browser: http://localhost:16686
# Then: Select "Product Service" → Find Traces
# Click on any trace to see:
# - Service dependencies
# - Database queries
# - Cache operations
# - Response times
```

### 4. Live Metrics
```bash
# Generate load
while true; do
  curl -s http://localhost:8002/products > /dev/null
  sleep 1
done

# Watch in Grafana
# Open: http://localhost:3000
# Dashboard: Microservices Overview
# See: Real-time request rate graph
```

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 📚 Next Steps

### Learn More
- 📖 [DEVOPS_README.md](DEVOPS_README.md) - Complete DevOps guide
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- 🚀 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment

### Customize
- Edit `observability/grafana/dashboards/` - Add custom dashboards
- Edit `observability/prometheus/prometheus.yml` - Add metrics
- Edit `docker-compose.yml` - Scale services
- Edit `.env` files - Configure services

### Scale It
```bash
# Scale services horizontally
docker-compose up -d --scale product-service=3 --scale order-service=2

# Verify scaling
docker-compose ps
```

## 🐛 Troubleshooting

### Services not starting?
```bash
# Check logs
docker-compose logs -f

# Check if ports are available
netstat -tulpn | grep -E ':(3000|8001|8002|8003|8004|9090|16686)'

# Reset everything
docker-compose down -v
docker-compose up -d --build
```

### Can't access services?
```bash
# Wait longer (first start takes 1-2 minutes)
watch docker-compose ps

# Check health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
```

### Out of memory?
```bash
# Check Docker resources
docker stats

# Increase Docker memory limit to 8GB
# Docker Desktop → Settings → Resources → Memory: 8GB
```

## 💡 Pro Tips

1. **Use Docker Desktop**: Dashboard view of all containers
2. **Keep logs clean**: `docker-compose logs -f --tail=100`
3. **Monitor resources**: `docker stats` in another terminal
4. **Bookmark UIs**: Save time accessing observability tools
5. **Learn LogQL**: Query logs like a pro in Grafana

## 🎓 What You Learned

- ✅ Microservices architecture
- ✅ Docker containerization
- ✅ Service orchestration
- ✅ API design (REST)
- ✅ Authentication (JWT)
- ✅ Caching (Redis)
- ✅ Message queues (RabbitMQ)
- ✅ Distributed tracing (Jaeger)
- ✅ Metrics (Prometheus)
- ✅ Logging (Loki)
- ✅ Visualization (Grafana)

## 🎉 You're Ready!

You now have a complete, production-ready microservices system running locally with full observability!

Share your experience:
- ⭐ Star the repository
- 🐛 Report issues
- 💡 Suggest improvements
- 📧 Contact: congdinh2008@gmail.com

---

**Happy Coding! 🚀**
