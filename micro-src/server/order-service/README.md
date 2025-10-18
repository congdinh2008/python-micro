# 📦 Order Service

Order Service là microservice quản lý đơn hàng trong hệ thống. Service này tích hợp với RabbitMQ để publish events bất đồng bộ khi có đơn hàng mới.

## 🎯 Mục tiêu

- Quản lý CRUD operations cho đơn hàng
- Tích hợp với User Service (authentication) và Product Service (lấy thông tin sản phẩm)
- Publish `order.created` events đến RabbitMQ
- Áp dụng Clean Architecture và Repository Pattern

## ✨ Tính năng

- ✅ **Tạo đơn hàng**: `POST /orders` - Tạo đơn hàng mới và publish event (yêu cầu JWT)
- ✅ **Lấy danh sách đơn hàng**: `GET /orders` - Lấy tất cả đơn hàng của user hiện tại (yêu cầu JWT)
- ✅ **Lấy chi tiết đơn hàng**: `GET /orders/{id}` - Chi tiết một đơn hàng (yêu cầu JWT)
- ✅ **Cập nhật đơn hàng**: `PUT /orders/{id}` - Cập nhật trạng thái đơn hàng (yêu cầu JWT)
- ✅ **Xóa đơn hàng**: `DELETE /orders/{id}` - Xóa đơn hàng (yêu cầu JWT)
- ✅ **Health Check**: `GET /health` - Kiểm tra trạng thái service

## 🏗️ Kiến trúc

```
Order Service (Port 8003)
    ↓
┌─────────────────────────────────┐
│    API Layer (FastAPI)          │
├─────────────────────────────────┤
│    Service Layer                │
│  - Validate with Product Service│
│  - Create order in DB            │
│  - Publish to RabbitMQ          │
├─────────────────────────────────┤
│    Repository Layer             │
├─────────────────────────────────┤
│    Database (PostgreSQL)        │
└─────────────────────────────────┘
         │            │
         │            └──────────────┐
         │                           │
         ▼                           ▼
   Product Service            RabbitMQ Exchange
   (Get product info)         (order.created event)
```

## 📁 Cấu trúc Project

```
order-service/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                # Auth dependencies
│   │   └── orders.py              # Order endpoints
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py            # Configuration
│   ├── database/
│   │   ├── __init__.py
│   │   └── database.py            # Database setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── order.py               # Order model
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py                # Base repository
│   │   └── order_repository.py   # Order repository
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── order.py               # Order schemas
│   ├── services/
│   │   ├── __init__.py
│   │   └── order_service.py      # Order business logic
│   └── utils/
│       ├── __init__.py
│       ├── auth_client.py         # User Service client
│       └── rabbitmq.py            # RabbitMQ publisher
├── alembic/                       # Database migrations
├── alembic.ini
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

## 🚀 Hướng dẫn Cài đặt

### Yêu cầu

- Python 3.9+
- PostgreSQL 12+ (hoặc SQLite cho development)
- RabbitMQ 3.9+
- User Service (đang chạy ở port 8001)
- Product Service (đang chạy ở port 8002)

### Cài đặt và Chạy

#### 1. Clone repository
```bash
cd order-service
```

#### 2. Tạo virtual environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate  # Windows
```

#### 3. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

#### 4. Cấu hình môi trường
```bash
cp .env.example .env
# Sửa file .env với cấu hình của bạn
```

**Ví dụ .env:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/order_service_db
USER_SERVICE_URL=http://localhost:8001
PRODUCT_SERVICE_URL=http://localhost:8002
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_EXCHANGE=order_events
RABBITMQ_ROUTING_KEY=order.created
PORT=8003
```

#### 5. Chạy migrations
```bash
alembic upgrade head
```

#### 6. Khởi động service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

Service sẽ chạy tại: http://localhost:8003

## 📖 API Documentation

### Swagger UI
http://localhost:8003/docs

### ReDoc
http://localhost:8003/redoc

## 🔧 Sử dụng API

### 1. Tạo đơn hàng mới

**Request:**
```bash
curl -X POST http://localhost:8003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "product_id": 1,
  "product_name": "Laptop Dell XPS 15",
  "quantity": 2,
  "unit_price": 25000000.0,
  "total_price": 50000000.0,
  "status": "pending",
  "created_at": "2025-10-17T08:00:00",
  "updated_at": "2025-10-17T08:00:00"
}
```

**RabbitMQ Event Published:**
```json
{
  "event": "order.created",
  "data": {
    "order_id": 1,
    "user_id": 1,
    "product_id": 1,
    "product_name": "Laptop Dell XPS 15",
    "quantity": 2,
    "unit_price": 25000000.0,
    "total_price": 50000000.0,
    "status": "pending",
    "created_at": "2025-10-17T08:00:00"
  }
}
```

### 2. Lấy danh sách đơn hàng

**Request:**
```bash
curl http://localhost:8003/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Lấy chi tiết đơn hàng

**Request:**
```bash
curl http://localhost:8003/orders/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Cập nhật trạng thái đơn hàng

**Request:**
```bash
curl -X PUT http://localhost:8003/orders/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "confirmed"
  }'
```

**Order Status:**
- `pending` - Đơn hàng đang chờ xử lý
- `confirmed` - Đơn hàng đã được xác nhận
- `shipped` - Đơn hàng đang giao
- `delivered` - Đơn hàng đã giao
- `cancelled` - Đơn hàng đã hủy

### 5. Xóa đơn hàng

**Request:**
```bash
curl -X DELETE http://localhost:8003/orders/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔌 RabbitMQ Integration

### Exchange Configuration
- **Type**: Topic
- **Name**: `order_events` (configurable via env)
- **Durable**: Yes

### Routing Key
- `order.created` - Được publish khi tạo đơn hàng mới

### Message Format
```json
{
  "event": "order.created",
  "data": {
    "order_id": 1,
    "user_id": 1,
    "product_id": 1,
    "product_name": "Product Name",
    "quantity": 2,
    "unit_price": 100000.0,
    "total_price": 200000.0,
    "status": "pending",
    "created_at": "2025-10-17T08:00:00"
  }
}
```

## 🔐 Authentication

Order Service sử dụng JWT tokens được validate qua User Service:

1. Client gửi request với JWT token trong header
2. Order Service forward token đến User Service để validate
3. User Service trả về user_id nếu token hợp lệ
4. Order Service sử dụng user_id để tạo/quản lý đơn hàng

## 💡 Best Practices

### Error Handling
- ✅ Proper exception handling trong toàn bộ code
- ✅ Meaningful error messages tiếng Việt
- ✅ HTTP status codes chuẩn

### Logging
- ✅ Log level phù hợp (INFO, WARNING, ERROR)
- ✅ Log tất cả RabbitMQ events
- ✅ Log inter-service communication

### Retry & Resilience
- ✅ RabbitMQ connection retry với `aio-pika` robust connection
- ✅ Timeout configuration cho HTTP requests
- ✅ Graceful shutdown handling

### Security
- ✅ Token validation qua User Service
- ✅ User ownership check cho đơn hàng
- ✅ Input validation với Pydantic

## 🧪 Testing

### Manual Testing Flow

1. **Start dependencies:**
```bash
# Start User Service (port 8001)
# Start Product Service (port 8002)
# Start RabbitMQ
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
```

2. **Start Order Service:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

3. **Get JWT token from User Service**
4. **Create a product in Product Service**
5. **Create an order** - Check logs for RabbitMQ event
6. **Check Notification Service logs** - Should receive the event

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8003/health
```

Response includes:
- Service status
- RabbitMQ connection status
- User Service URL
- Product Service URL

### RabbitMQ Management UI
http://localhost:15672
- Username: guest
- Password: guest

## 🐳 Docker

### Build
```bash
docker build -t order-service .
```

### Run
```bash
docker run -d \
  -p 8003:8003 \
  -e DATABASE_URL=postgresql://user:password@host:5432/order_service_db \
  -e USER_SERVICE_URL=http://user-service:8001 \
  -e PRODUCT_SERVICE_URL=http://product-service:8002 \
  -e RABBITMQ_HOST=rabbitmq \
  order-service
```

## 🔄 Database Migrations

### Tạo migration mới
```bash
alembic revision --autogenerate -m "Description"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback
```bash
alembic downgrade -1
```

## 🚧 Future Enhancements

- [ ] Order inventory reservation
- [ ] Payment integration
- [ ] Order status tracking events
- [ ] Scheduled order processing
- [ ] Order analytics and reporting
- [ ] Bulk order operations

---

**Happy Coding! 🚀**
