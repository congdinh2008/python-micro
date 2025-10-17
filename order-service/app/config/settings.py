"""
Order Service Settings - Configuration from environment variables
Uses Pydantic Settings to validate and load configuration
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings class for Order Service configuration
    Loads from environment variables and .env file
    """

    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/order_service_db"

    # User Service Configuration
    USER_SERVICE_URL: str = "http://localhost:8001"

    # Product Service Configuration
    PRODUCT_SERVICE_URL: str = "http://localhost:8002"

    # RabbitMQ Configuration
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_EXCHANGE: str = "order_events"
    RABBITMQ_QUEUE: str = "order_notifications"
    RABBITMQ_ROUTING_KEY: str = "order.created"

    # Application Configuration
    APP_NAME: str = "Order Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8003

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
        "http://localhost:8003",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Create global settings instance
settings = Settings()
