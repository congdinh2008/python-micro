"""
Product Service Settings - Configuration from environment variables
Uses Pydantic Settings to validate and load configuration
"""

from typing import Any, List, Union
from pydantic import field_validator
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

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    CACHE_TTL: int = 300  # 5 minutes default

    # Application Configuration
    APP_NAME: str = "Product Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8002

    # CORS Configuration
    # Can be set via environment variable as comma-separated string
    # e.g., ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8000"
    # or in production: ALLOWED_ORIGINS="https://myapp.com,https://www.myapp.com"
    ALLOWED_ORIGINS: Union[List[str], str] = "*"  # "*" for development, restrict in production

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v: Any) -> Union[List[str], str]:
        """Parse ALLOWED_ORIGINS from comma-separated string, list, or wildcard"""
        if v == "*":
            return "*"
        if isinstance(v, str):
            # Split by comma and strip whitespace
            origins = [origin.strip() for origin in v.split(',') if origin.strip()]
            return origins if origins else "*"
        elif isinstance(v, list):
            return v if v else "*"
        return "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Create global settings instance
settings = Settings()
