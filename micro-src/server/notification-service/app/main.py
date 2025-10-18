"""
Notification Service - FastAPI Application
Microservice for consuming order notifications from RabbitMQ
"""

import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.utils.rabbitmq import rabbitmq_consumer
from app.utils.tracing import setup_tracing

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
    ## Notification Service - Order Notification Microservice
    
    Microservice for consuming order events from RabbitMQ and sending notifications.
    
    ### Features:
    - Consumes order.created events from RabbitMQ
    - Sends order confirmation notifications (email, SMS, push)
    - Independent microservice without database
    - Clean Architecture with async message processing
    
    ### Endpoints:
    - **GET /health** - Health check endpoint
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

# Setup Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Setup OpenTelemetry tracing
setup_tracing(app, service_name=settings.APP_NAME, service_version=settings.APP_VERSION)


@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Check if Notification Service is running"
)
def root():
    """
    Root endpoint to check Notification Service status
    """
    return {
        "message": "Welcome to Notification Service API",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check health status of Notification Service"
)
async def health_check():
    """
    Health check endpoint
    """
    rabbitmq_status = "healthy" if await rabbitmq_consumer.healthcheck() else "unavailable"
    
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "rabbitmq": {
            "status": rabbitmq_status,
            "host": settings.RABBITMQ_HOST,
            "port": settings.RABBITMQ_PORT,
            "exchange": settings.RABBITMQ_EXCHANGE,
            "queue": settings.RABBITMQ_QUEUE,
        },
    }


# Event handlers
@app.on_event("startup")
async def startup_event():
    """Event handler when application starts"""
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} is starting...")
    logger.info(f"📚 API Documentation: http://localhost:{settings.PORT}/docs")
    logger.info(f"📖 ReDoc Documentation: http://localhost:{settings.PORT}/redoc")
    
    # Connect to RabbitMQ and start consuming
    try:
        await rabbitmq_consumer.connect()
        logger.info("✅ RabbitMQ connected successfully")
        
        # Start consuming messages in background
        asyncio.create_task(rabbitmq_consumer.start_consuming())
        logger.info("✅ Started consuming messages from RabbitMQ")
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
        logger.warning("⚠️ Service will continue but notifications won't be processed")


@app.on_event("shutdown")
async def shutdown_event():
    """Event handler when application shuts down"""
    logger.info(f"🛑 {settings.APP_NAME} is shutting down...")
    
    # Close RabbitMQ connection
    try:
        await rabbitmq_consumer.close()
        logger.info("✅ RabbitMQ connection closed gracefully")
    except Exception as e:
        logger.error(f"❌ Error closing RabbitMQ connection: {e}")
