"""
User Service - FastAPI Application
Microservice for user authentication with JWT
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## User Service - Authentication Microservice
    
    Microservice for handling user authentication with JWT tokens.
    
    ### Endpoints:
    - **POST /register** - Register new user account
    - **POST /login** - Login and receive JWT token
    - **POST /validate-token** - Validate JWT token
    - **GET /health** - Health check endpoint
    
    ### Architecture:
    - Independent microservice with its own database
    - JWT-based authentication
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
app.include_router(auth.router)


@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Check if User Service is running"
)
def root():
    """
    Root endpoint to check User Service status
    """
    return {
        "message": "Welcome to User Service API",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check health status of User Service"
)
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Event handlers
@app.on_event("startup")
async def startup_event():
    """Event handler when application starts"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} is starting...")
    print(f"📚 API Documentation: http://localhost:{settings.PORT}/docs")
    print(f"📖 ReDoc Documentation: http://localhost:{settings.PORT}/redoc")


@app.on_event("shutdown")
async def shutdown_event():
    """Event handler when application shuts down"""
    print(f"🛑 {settings.APP_NAME} is shutting down...")
