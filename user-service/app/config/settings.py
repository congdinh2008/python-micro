"""
User Service Settings - Configuration from environment variables
Uses Pydantic Settings to validate and load configuration
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings class for User Service configuration
    Loads from environment variables and .env file
    """

    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/user_service_db"

    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-this-in-production-min-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application Configuration
    APP_NAME: str = "User Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8001

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
