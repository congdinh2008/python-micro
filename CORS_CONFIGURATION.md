# CORS Configuration Guide

## 🔒 Security First

CORS (Cross-Origin Resource Sharing) is a critical security feature. Misconfiguration can expose your API to security vulnerabilities.

## 📋 Configuration Options

### Option 1: Wildcard (Development Only) ⚠️

**Default behavior**: If `ALLOWED_ORIGINS` is not set, it defaults to `"*"`

```bash
# .env file - Leave ALLOWED_ORIGINS unset or:
ALLOWED_ORIGINS=*
```

**⚠️ WARNING**: Only use `"*"` in development! Never in production!

### Option 2: Specific Origins (Recommended for Production) ✅

Set specific domains as comma-separated values:

```bash
# .env file
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com,https://admin.myapp.com
```

### Option 3: Docker Compose Environment Variables

In `docker-compose.yml`:

```yaml
services:
  user-service:
    environment:
      ALLOWED_ORIGINS: "https://myapp.com,https://www.myapp.com"
```

### Option 4: JSON Array Format (Alternative)

If you prefer JSON format:

```bash
# .env file
ALLOWED_ORIGINS=["https://myapp.com","https://www.myapp.com"]
```

## 🚀 Deployment Best Practices

### Development Environment
```bash
# .env or docker-compose.yml
ALLOWED_ORIGINS=*
# or
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Staging Environment
```bash
ALLOWED_ORIGINS=https://staging.myapp.com,https://staging-admin.myapp.com
```

### Production Environment
```bash
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com,https://admin.myapp.com
```

## 📝 Service-Specific Configuration

Each service can have different CORS settings:

### User Service (Port 8001)
```bash
# For user-facing applications
ALLOWED_ORIGINS=https://app.myapp.com,https://www.myapp.com
```

### Product Service (Port 8002)
```bash
# For product catalog pages
ALLOWED_ORIGINS=https://shop.myapp.com,https://www.myapp.com
```

### Order Service (Port 8003)
```bash
# For checkout and order management
ALLOWED_ORIGINS=https://checkout.myapp.com,https://admin.myapp.com
```

### Notification Service (Port 8004)
```bash
# For notification management dashboard
ALLOWED_ORIGINS=https://admin.myapp.com
```

## 🔍 Validation Logic

The settings automatically parse CORS origins:

```python
# Handles these formats:
"*"                                          # Wildcard (dev only)
"http://localhost:3000"                      # Single origin
"https://app.com,https://www.app.com"        # Multiple origins (comma-separated)
["https://app.com", "https://www.app.com"]   # JSON array
```

## ⚙️ Docker Compose Configuration

### Development (Local)
```yaml
services:
  user-service:
    environment:
      # Use wildcard for convenience
      ALLOWED_ORIGINS: "*"
```

### Production
```yaml
services:
  user-service:
    environment:
      # Restrict to specific domains
      ALLOWED_ORIGINS: "${ALLOWED_ORIGINS}"  # From .env file
```

## 🧪 Testing CORS Configuration

### Test with curl
```bash
curl -H "Origin: https://myapp.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://localhost:8001/api/users
```

### Expected Response Headers
```
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE
Access-Control-Allow-Headers: *
```

## ⚠️ Common Pitfalls

### ❌ Don't Do This in Production:
```bash
ALLOWED_ORIGINS=*  # Security risk!
```

### ❌ Don't Include Trailing Slashes:
```bash
ALLOWED_ORIGINS=https://myapp.com/  # Wrong!
ALLOWED_ORIGINS=https://myapp.com   # Correct!
```

### ❌ Don't Mix Protocols:
```bash
# If your frontend is HTTPS, backend should be too
ALLOWED_ORIGINS=http://myapp.com   # Wrong if using HTTPS
ALLOWED_ORIGINS=https://myapp.com  # Correct!
```

## 📚 Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [FastAPI CORS Middleware](https://fastapi.tiangolo.com/tutorial/cors/)
- [OWASP CORS Security Guide](https://cheatsheetseries.owasp.org/cheatsheets/CORS_Security_Cheat_Sheet.html)

## 🔐 Security Checklist

- [ ] Remove `"*"` from production configuration
- [ ] Use HTTPS origins in production
- [ ] Specify only required domains
- [ ] Test CORS configuration before deployment
- [ ] Review and update origins when adding new frontends
- [ ] Never commit `.env` files with production secrets
- [ ] Use environment-specific `.env` files
- [ ] Document all allowed origins and their purpose
