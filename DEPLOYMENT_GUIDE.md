# 🚀 Deployment Guide - E-commerce Microservices

## 📋 Overview

This guide covers deployment scenarios from local development to production-ready deployments.

## 🏠 Local Development

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git
- 8GB RAM minimum
- 20GB free disk space

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro

# 2. Create environment files (optional customization)
for service in user-service product-service order-service notification-service; do
  if [ -f "$service/.env.example" ]; then
    cp "$service/.env.example" "$service/.env"
  fi
done

# 3. Start all services
docker-compose up -d

# 4. Verify all services are running
docker-compose ps

# 5. View logs
docker-compose logs -f

# 6. Wait for services to be healthy (1-2 minutes)
watch docker-compose ps
```

### Verification

```bash
# Check User Service
curl http://localhost:8001/health

# Check Product Service
curl http://localhost:8002/health

# Check Order Service
curl http://localhost:8003/health

# Check Notification Service
curl http://localhost:8004/health

# Check Grafana
curl http://localhost:3000

# Check Prometheus
curl http://localhost:9090/-/healthy

# Check Jaeger
curl http://localhost:16686
```

### Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| User Service API | http://localhost:8001/docs | - |
| Product Service API | http://localhost:8002/docs | - |
| Order Service API | http://localhost:8003/docs | - |
| Notification Service API | http://localhost:8004/docs | - |
| Grafana | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Jaeger UI | http://localhost:16686 | - |
| RabbitMQ Management | http://localhost:15672 | guest/guest |

## 🧪 Testing Environment

### Isolated Testing

```bash
# Use separate docker-compose for testing
docker-compose -f docker-compose.test.yml up -d

# Or use environment variables
COMPOSE_PROJECT_NAME=test docker-compose up -d
```

### Integration Testing

```bash
# Run the complete integration test
./test_assignment4.sh

# Or manual testing
# 1. Register user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123" \
  | jq -r '.access_token')

# 3. Create product
curl -X POST http://localhost:8002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Product","description":"Test","price":99.99,"quantity":10}'

# 4. List products
curl http://localhost:8002/products

# 5. Create order
curl -X POST http://localhost:8003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id":1,"quantity":2}'

# 6. Check notification logs
docker-compose logs notification-service
```

## 🏗️ Staging Environment

### Setup

```bash
# 1. Create staging directory
mkdir -p /opt/python-micro-staging
cd /opt/python-micro-staging

# 2. Clone repository
git clone https://github.com/congdinh2008/python-micro.git .

# 3. Create staging environment file
cat > .env.staging <<EOF
# Staging Configuration
COMPOSE_PROJECT_NAME=python-micro-staging
ENVIRONMENT=staging

# Database URLs
USER_DB_URL=postgresql://user:staging_pass@localhost:5433/user_service_staging
PRODUCT_DB_URL=postgresql://user:staging_pass@localhost:5434/product_service_staging
ORDER_DB_URL=postgresql://user:staging_pass@localhost:5435/order_service_staging

# Service URLs
USER_SERVICE_URL=http://user-service:8001
PRODUCT_SERVICE_URL=http://product-service:8002

# Security
SECRET_KEY=$(openssl rand -hex 32)

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=staging_user
RABBITMQ_PASSWORD=$(openssl rand -hex 16)

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
EOF

# 4. Start services
docker-compose --env-file .env.staging up -d

# 5. Setup reverse proxy (nginx example)
sudo apt install nginx -y

cat > /etc/nginx/sites-available/python-micro-staging <<'EOF'
server {
    listen 80;
    server_name staging.python-micro.example.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/python-micro-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🌐 Production Deployment

### Infrastructure Requirements

**Minimum Requirements:**
- **Compute**: 
  - 4 CPU cores
  - 16GB RAM
  - 100GB SSD
  
- **Network**:
  - Static IP or domain name
  - HTTPS certificate
  - Firewall configuration

**Recommended for Production:**
- **Compute**: 
  - 8+ CPU cores
  - 32GB+ RAM
  - 200GB+ SSD
  
- **High Availability**:
  - Load balancer
  - Multiple instances per service
  - Database replication
  - Redis cluster

### Production Setup

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install monitoring tools
sudo apt install -y htop iotop nethogs
```

#### 2. Application Deployment

```bash
# 1. Create production directory
sudo mkdir -p /opt/python-micro
cd /opt/python-micro

# 2. Clone repository
git clone https://github.com/congdinh2008/python-micro.git .

# 3. Create production environment file
sudo cat > .env.production <<EOF
# Production Configuration
COMPOSE_PROJECT_NAME=python-micro-prod
ENVIRONMENT=production

# Database URLs (use managed database services)
USER_DB_URL=postgresql://prod_user:${DB_PASSWORD}@prod-db.example.com:5432/user_service_prod
PRODUCT_DB_URL=postgresql://prod_user:${DB_PASSWORD}@prod-db.example.com:5432/product_service_prod
ORDER_DB_URL=postgresql://prod_user:${DB_PASSWORD}@prod-db.example.com:5432/order_service_prod

# Service URLs (internal)
USER_SERVICE_URL=http://user-service:8001
PRODUCT_SERVICE_URL=http://product-service:8002

# Security (generate unique keys)
SECRET_KEY=$(openssl rand -hex 32)

# Redis (use managed Redis service)
REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# RabbitMQ (use managed RabbitMQ service)
RABBITMQ_HOST=prod-rabbitmq.example.com
RABBITMQ_PORT=5672
RABBITMQ_USER=prod_user
RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD}

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317

# Grafana
GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
EOF

# 4. Set proper permissions
sudo chown -R root:docker /opt/python-micro
sudo chmod 640 .env.production

# 5. Pull images
docker-compose pull

# 6. Start services
docker-compose --env-file .env.production up -d

# 7. Verify deployment
docker-compose ps
docker-compose logs -f
```

#### 3. Nginx Reverse Proxy

```bash
# Install nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Create nginx configuration
sudo cat > /etc/nginx/sites-available/python-micro <<'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# User Service
server {
    listen 80;
    server_name api.python-micro.com;

    # SSL configuration will be added by certbot
    
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Grafana
server {
    listen 80;
    server_name grafana.python-micro.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/python-micro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d api.python-micro.com -d grafana.python-micro.com
```

#### 4. Firewall Configuration

```bash
# UFW firewall setup
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Block direct access to services
sudo ufw deny 8001:8004/tcp
sudo ufw deny 3000/tcp
sudo ufw deny 9090/tcp
sudo ufw deny 16686/tcp
```

#### 5. Systemd Service

```bash
# Create systemd service
sudo cat > /etc/systemd/system/python-micro.service <<EOF
[Unit]
Description=Python Micro E-commerce Services
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/python-micro
ExecStart=/usr/local/bin/docker-compose --env-file .env.production up -d
ExecStop=/usr/local/bin/docker-compose --env-file .env.production down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable python-micro
sudo systemctl start python-micro
sudo systemctl status python-micro
```

### Monitoring Production

```bash
# Check service status
sudo systemctl status python-micro

# View logs
cd /opt/python-micro
docker-compose logs -f --tail=100

# Check resource usage
docker stats

# Monitor containers
watch 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

## 🔄 Updates & Rollbacks

### Update Deployment

```bash
cd /opt/python-micro

# 1. Pull latest changes
git fetch origin
git checkout main
git pull origin main

# 2. Backup current deployment
docker-compose down
cp -r . ../python-micro-backup-$(date +%Y%m%d)

# 3. Rebuild images
docker-compose build --no-cache

# 4. Start updated services
docker-compose up -d

# 5. Verify
docker-compose ps
curl http://localhost:8001/health
```

### Rollback

```bash
cd /opt/python-micro

# 1. Stop current deployment
docker-compose down

# 2. Restore from backup
cd /opt/python-micro-backup-20250101
docker-compose up -d

# Or rollback Git
cd /opt/python-micro
git log --oneline -n 10
git checkout <previous-commit>
docker-compose up -d --build
```

## 🔐 Security Hardening

### SSL/TLS Configuration

```bash
# Use strong SSL settings in nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
add_header Strict-Transport-Security "max-age=31536000" always;
```

### Database Security

```bash
# Use separate database user per service
CREATE USER user_service WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE user_service_prod TO user_service;

# Enable SSL for database connections
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Secrets Management

```bash
# Use Docker secrets (Swarm) or external secrets manager
# Example with AWS Secrets Manager:
aws secretsmanager create-secret \
  --name python-micro/db-password \
  --secret-string "strong_password"

# Retrieve in deployment script
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id python-micro/db-password \
  --query SecretString --output text)
```

## 📊 Monitoring Production

### Health Checks

```bash
# Create health check script
cat > /opt/python-micro/health-check.sh <<'EOF'
#!/bin/bash

services=(
  "http://localhost:8001/health"
  "http://localhost:8002/health"
  "http://localhost:8003/health"
  "http://localhost:8004/health"
)

for service in "${services[@]}"; do
  if ! curl -f -s $service > /dev/null; then
    echo "❌ Service failed: $service"
    # Send alert
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"Service health check failed: $service\"}"
  fi
done
EOF

chmod +x /opt/python-micro/health-check.sh

# Add to crontab
crontab -e
# */5 * * * * /opt/python-micro/health-check.sh
```

### Log Rotation

```bash
# Configure Docker log rotation
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

## 📋 Backup & Recovery

### Database Backup

```bash
# Create backup script
cat > /opt/python-micro/backup-db.sh <<'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/python-micro"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup each database
docker exec user-service-db pg_dump -U user user_service_db | gzip > $BACKUP_DIR/user_db_$DATE.sql.gz
docker exec product-service-db pg_dump -U user product_service_db | gzip > $BACKUP_DIR/product_db_$DATE.sql.gz
docker exec order-service-db pg_dump -U user order_service_db | gzip > $BACKUP_DIR/order_db_$DATE.sql.gz

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/python-micro/backup-db.sh

# Schedule daily backup
crontab -e
# 0 2 * * * /opt/python-micro/backup-db.sh
```

### Restore Database

```bash
# Restore from backup
gunzip -c /opt/backups/python-micro/user_db_20250101_020000.sql.gz | \
  docker exec -i user-service-db psql -U user -d user_service_db
```

## 🚨 Disaster Recovery

### Complete System Recovery

```bash
# 1. Restore application code
cd /opt
git clone https://github.com/congdinh2008/python-micro.git
cd python-micro

# 2. Restore environment configuration
cp /backup/.env.production .env.production

# 3. Restore databases
./restore-databases.sh

# 4. Start services
docker-compose --env-file .env.production up -d

# 5. Verify
./health-check.sh
```

## 📚 Additional Resources

- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Security Best Practices](https://nginx.org/en/docs/security.html)
- [PostgreSQL Production Checklist](https://www.postgresql.org/docs/current/runtime-config.html)

---

**Last Updated**: 2025-10-17
**Version**: 1.0.0
**Maintainer**: Cong Dinh
