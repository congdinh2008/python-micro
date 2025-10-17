"""
Application Settings - Quản lý cấu hình từ biến môi trường
Sử dụng Pydantic Settings để validate và load configuration
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings class để quản lý cấu hình ứng dụng
    Load từ biến môi trường và file .env
    """

    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/product_catalog"

    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-this-in-production-min-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application Configuration
    APP_NAME: str = "Product Catalog Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Create global settings instance
settings = Settings()
