# 📧 Notification Service

Notification Service là microservice xử lý thông báo trong hệ thống. Service này lắng nghe các events từ RabbitMQ và gửi thông báo đến users (email, SMS, push notifications).

## 🎯 Mục tiêu

- Consume events từ RabbitMQ
- Xử lý `order.created` events
- Gửi thông báo xác nhận đơn hàng
- Loose coupling với các services khác
- Async message processing

## ✨ Tính năng

- ✅ **RabbitMQ Consumer**: Lắng nghe events từ order_events exchange
- ✅ **Order Confirmation**: Xử lý order.created events
- ✅ **Notification Logging**: Log chi tiết thông báo (giả lập gửi email)
- ✅ **Health Check**: `GET /health` - Kiểm tra trạng thái service
- ✅ **Graceful Shutdown**: Đóng kết nối RabbitMQ một cách an toàn

## 🏗️ Kiến trúc

```
RabbitMQ Exchange (order_events)
         │
         │ routing_key: order.created
         ▼
    Queue (order_notifications)
         │
         ▼
┌─────────────────────────────────┐
│  Notification Service (8004)    │
│                                 │
│  ┌──────────────────────────┐  │
│  │  RabbitMQ Consumer       │  │
│  │  - Listen for events     │  │
│  │  - Process messages      │  │
│  └──────────────────────────┘  │
│              │                  │
│              ▼                  │
│  ┌──────────────────────────┐  │
│  │  Notification Handler    │  │
│  │  - Send email            │  │
│  │  - Send SMS              │  │
│  │  - Send push notification│  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## 📁 Cấu trúc Project

```
notification-service/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI application
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py        # Configuration
│   └── utils/
│       ├── __init__.py
│       └── rabbitmq.py        # RabbitMQ consumer
├── requirements.txt
├── .env.example
├── Dockerfile
└── README.md
```

## 🚀 Hướng dẫn Cài đặt

### Yêu cầu

- Python 3.9+
- RabbitMQ 3.9+

### Cài đặt và Chạy

#### 1. Clone repository
```bash
cd notification-service
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
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_EXCHANGE=order_events
RABBITMQ_QUEUE=order_notifications
RABBITMQ_ROUTING_KEY=order.created
PORT=8004
```

#### 5. Khởi động service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

Service sẽ chạy tại: http://localhost:8004

## 📖 API Documentation

### Swagger UI
http://localhost:8004/docs

### ReDoc
http://localhost:8004/redoc

## 🔌 RabbitMQ Consumer

### Queue Configuration
- **Exchange**: `order_events` (Topic)
- **Queue**: `order_notifications` (Durable)
- **Routing Key**: `order.created`
- **Prefetch Count**: 1 (Process one message at a time)

### Message Processing

Khi nhận được event `order.created`, service sẽ:

1. Parse message body
2. Extract order information
3. Log notification details (giả lập gửi email)

**Example Log Output:**
```
================================================================================
📧 SENDING ORDER CONFIRMATION EMAIL
================================================================================
To: User ID 1
Subject: Xác nhận đơn hàng #1
--------------------------------------------------------------------------------
Dear Customer,

Đơn hàng #1 của bạn đã được tạo thành công!

Chi tiết đơn hàng:
  - Sản phẩm: Laptop Dell XPS 15
  - Số lượng: 2
  - Tổng tiền: 50,000,000 VNĐ

Cảm ơn bạn đã đặt hàng!
================================================================================
```

### Message Format

Service expects messages in this format:
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

## 🧪 Testing

### 1. Start RabbitMQ
```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management-alpine
```

### 2. Start Notification Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

### 3. Create an order via Order Service
```bash
curl -X POST http://localhost:8003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

### 4. Check Notification Service logs
You should see the order confirmation notification in the logs.

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8004/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Notification Service",
  "version": "1.0.0",
  "rabbitmq": {
    "status": "healthy",
    "host": "localhost",
    "port": 5672,
    "exchange": "order_events",
    "queue": "order_notifications"
  }
}
```

### RabbitMQ Management UI
http://localhost:15672
- Username: guest
- Password: guest

Check:
- Exchange: `order_events`
- Queue: `order_notifications`
- Bindings and message rates

## 💡 Best Practices

### Error Handling
- ✅ Try-catch blocks trong message processing
- ✅ Log all errors với proper levels
- ✅ Message acknowledgement only sau khi xử lý thành công

### Logging
- ✅ Structured logging format
- ✅ Log message received
- ✅ Log notification sent
- ✅ Log errors với stack trace

### Retry & Resilience
- ✅ RabbitMQ robust connection (auto-reconnect)
- ✅ Message prefetch limit (process one at a time)
- ✅ Graceful shutdown (close connections properly)

### Security
- ✅ Environment-based configuration
- ✅ No hardcoded credentials
- ✅ Secure RabbitMQ connection

## 🐳 Docker

### Build
```bash
docker build -t notification-service .
```

### Run
```bash
docker run -d \
  -p 8004:8004 \
  -e RABBITMQ_HOST=rabbitmq \
  -e RABBITMQ_PORT=5672 \
  -e RABBITMQ_USER=guest \
  -e RABBITMQ_PASSWORD=guest \
  notification-service
```

## 🔄 Future Enhancements

### Email Integration
```python
# Current: Logging only
logger.info("📧 SENDING EMAIL...")

# Future: Actual email sending
import smtplib
from email.mime.text import MIMEText

def send_email(to: str, subject: str, body: str):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = settings.EMAIL_FROM
    msg['To'] = to
    
    with smtplib.SMTP(settings.SMTP_HOST) as server:
        server.send_message(msg)
```

### SMS Integration
```python
# Using Twilio
from twilio.rest import Client

def send_sms(to: str, message: str):
    client = Client(settings.TWILIO_SID, settings.TWILIO_TOKEN)
    client.messages.create(
        to=to,
        from_=settings.TWILIO_PHONE,
        body=message
    )
```

### Push Notification
```python
# Using Firebase Cloud Messaging
from firebase_admin import messaging

def send_push(token: str, title: str, body: str):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=token,
    )
    messaging.send(message)
```

## 📝 Event Types (Future)

Currently supports:
- ✅ `order.created`

Future events:
- [ ] `order.confirmed`
- [ ] `order.shipped`
- [ ] `order.delivered`
- [ ] `order.cancelled`
- [ ] `payment.success`
- [ ] `payment.failed`

## 🚧 Roadmap

- [ ] Database for notification history
- [ ] Email template system
- [ ] SMS integration (Twilio)
- [ ] Push notification (Firebase)
- [ ] Notification preferences per user
- [ ] Retry logic for failed notifications
- [ ] Notification delivery tracking
- [ ] Unsubscribe functionality

---

**Happy Coding! 🚀**
