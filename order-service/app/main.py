"""
Order Service - FastAPI Application
Microservice for order management with RabbitMQ integration
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.api import orders
from app.utils.rabbitmq import rabbitmq_publisher

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Order Service - Order Management Microservice
    
    Microservice for handling order CRUD operations with RabbitMQ integration.
    Authentication is delegated to User Service via REST API.
    
    ### Endpoints:
    - **POST /orders** - Create new order (requires JWT)
    - **GET /orders** - Get all orders for current user (requires JWT)
    - **GET /orders/{id}** - Get order by ID (requires JWT)
    - **PUT /orders/{id}** - Update order status (requires JWT)
    - **DELETE /orders/{id}** - Delete order (requires JWT)
    - **GET /health** - Health check endpoint
    
    ### Features:
    - Independent microservice with its own database
    - Authentication via User Service REST API
    - RabbitMQ integration for async event publishing
    - Clean Architecture with Repository Pattern
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router)

# Setup Prometheus metrics
Instrumentator().instrument(app).expose(app)


@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Check if Order Service is running"
)
def root():
    """
    Root endpoint to check Order Service status
    """
    return {
        "message": "Welcome to Order Service API",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check health status of Order Service"
)
async def health_check():
    """
    Health check endpoint
    """
    rabbitmq_status = "healthy" if await rabbitmq_publisher.healthcheck() else "unavailable"
    
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "user_service_url": settings.USER_SERVICE_URL,
        "product_service_url": settings.PRODUCT_SERVICE_URL,
        "rabbitmq": {
            "status": rabbitmq_status,
            "host": settings.RABBITMQ_HOST,
            "port": settings.RABBITMQ_PORT,
            "exchange": settings.RABBITMQ_EXCHANGE,
        },
    }


# Event handlers
@app.on_event("startup")
async def startup_event():
    """Event handler when application starts"""
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} is starting...")
    logger.info(f"📚 API Documentation: http://localhost:{settings.PORT}/docs")
    logger.info(f"📖 ReDoc Documentation: http://localhost:{settings.PORT}/redoc")
    logger.info(f"🔐 User Service URL: {settings.USER_SERVICE_URL}")
    logger.info(f"📦 Product Service URL: {settings.PRODUCT_SERVICE_URL}")
    
    # Connect to RabbitMQ
    try:
        await rabbitmq_publisher.connect()
        logger.info("✅ RabbitMQ connected successfully")
    except Exception as e:
        logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
        logger.warning("⚠️ Service will continue without RabbitMQ (events won't be published)")


@app.on_event("shutdown")
async def shutdown_event():
    """Event handler when application shuts down"""
    logger.info(f"🛑 {settings.APP_NAME} is shutting down...")
    
    # Close RabbitMQ connection
    try:
        await rabbitmq_publisher.close()
        logger.info("✅ RabbitMQ connection closed gracefully")
    except Exception as e:
        logger.error(f"❌ Error closing RabbitMQ connection: {e}")
