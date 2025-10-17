"""
Product Service Settings - Configuration from environment variables
Uses Pydantic Settings to validate and load configuration
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings class for Product Service configuration
    Loads from environment variables and .env file
    """

    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/product_service_db"

    # User Service Configuration
    USER_SERVICE_URL: str = "http://localhost:8001"

    # Application Configuration
    APP_NAME: str = "Product Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8002

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Create global settings instance
settings = Settings()
