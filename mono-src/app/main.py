"""
Main FastAPI Application - Product Catalog Service
Entry point cho RESTful API với FastAPI, SQLAlchemy, JWT
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, products

# Tạo FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Product Catalog Service - Quản lý Sản phẩm và Xác thực JWT

    API RESTful để quản lý sản phẩm với authentication sử dụng JWT.
    Xây dựng với FastAPI, SQLAlchemy 2.0, PostgreSQL, và Repository Pattern.

    ### Tính năng chính:
    - ✅ **Authentication**: Đăng ký và đăng nhập với JWT
    - ✅ **Product Management**: CRUD operations cho sản phẩm
    - ✅ **Security**: JWT-based authentication cho các endpoints bảo mật
    - ✅ **Documentation**: Swagger/OpenAPI tự động

    ### Endpoints:
    - **POST /register** - Đăng ký tài khoản mới
    - **POST /login** - Đăng nhập và nhận JWT token
    - **GET /products** - Lấy danh sách sản phẩm (public)
    - **GET /products/{id}** - Lấy chi tiết sản phẩm (public)
    - **POST /products** - Tạo sản phẩm mới (yêu cầu JWT)
    - **PUT /products/{id}** - Cập nhật sản phẩm (yêu cầu JWT)
    - **DELETE /products/{id}** - Xóa sản phẩm (yêu cầu JWT)

    ### Authentication:
    Sau khi đăng nhập, sử dụng JWT token trong header:
    ```
    Authorization: Bearer <your_token>
    ```

    ### Repository & Architecture:
    - **Models**: SQLAlchemy models (User, Product)
    - **Repositories**: Data access layer với Repository Pattern
    - **Services**: Business logic layer
    - **API**: FastAPI routes và endpoints
    - **Schemas**: Pydantic models cho validation
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
# Cho phép frontend từ các origins được cấu hình truy cập API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)


@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Kiểm tra API đang hoạt động"
)
def root():
    """
    Root endpoint để kiểm tra API

    **Response:**
    - Message và version thông tin
    """
    return {
        "message": "Welcome to Product Catalog Service API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Kiểm tra trạng thái health của service"
)
def health_check():
    """
    Health check endpoint

    **Response:**
    - Status của service
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# Event handlers
@app.on_event("startup")
async def startup_event():
    """Event handler khi application khởi động"""
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} is starting...")
    print(f"📚 API Documentation: http://localhost:8000/docs")
    print(f"📖 ReDoc Documentation: http://localhost:8000/redoc")


@app.on_event("shutdown")
async def shutdown_event():
    """Event handler khi application shutdown"""
    print(f"🛑 {settings.APP_NAME} is shutting down...")
