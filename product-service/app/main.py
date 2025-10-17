"""
Product Service - FastAPI Application
Microservice for product management with authentication via User Service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.api import products

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Product Service - Product Management Microservice
    
    Microservice for handling product CRUD operations.
    Authentication is delegated to User Service via REST API.
    
    ### Endpoints:
    - **GET /products** - Get all products (public)
    - **GET /products/{id}** - Get product by ID (public)
    - **POST /products** - Create new product (requires JWT)
    - **PUT /products/{id}** - Update product (requires JWT)
    - **DELETE /products/{id}** - Delete product (requires JWT)
    - **GET /health** - Health check endpoint
    
    ### Architecture:
    - Independent microservice with its own database
    - Authentication via User Service REST API
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
app.include_router(products.router)

# Setup Prometheus metrics
Instrumentator().instrument(app).expose(app)


@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Check if Product Service is running"
)
def root():
    """
    Root endpoint to check Product Service status
    """
    return {
        "message": "Welcome to Product Service API",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check health status of Product Service"
)
def health_check():
    """
    Health check endpoint
    """
    from app.utils.cache import cache_manager
    
    redis_status = "healthy" if cache_manager.healthcheck() else "unavailable"
    
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "user_service_url": settings.USER_SERVICE_URL,
        "redis": {
            "status": redis_status,
            "host": settings.REDIS_HOST,
            "port": settings.REDIS_PORT,
        },
    }


# Event handlers
@app.on_event("startup")
async def startup_event():
    """Event handler when application starts"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} is starting...")
    print(f"📚 API Documentation: http://localhost:{settings.PORT}/docs")
    print(f"📖 ReDoc Documentation: http://localhost:{settings.PORT}/redoc")
    print(f"🔐 User Service URL: {settings.USER_SERVICE_URL}")


@app.on_event("shutdown")
async def shutdown_event():
    """Event handler when application shuts down"""
    print(f"🛑 {settings.APP_NAME} is shutting down...")
