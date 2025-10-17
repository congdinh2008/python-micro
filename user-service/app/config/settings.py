"""
User Service Settings - Configuration from environment variables
Uses Pydantic Settings to validate and load configuration
"""

from typing import Any, List, Union
from pydantic import field_validator
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
