"""
Notification Service Settings - Configuration from environment variables
Uses Pydantic Settings to validate and load configuration
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings class for Notification Service configuration
    Loads from environment variables and .env file
    """

    # RabbitMQ Configuration
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    RABBITMQ_EXCHANGE: str = "order_events"
    RABBITMQ_QUEUE: str = "order_notifications"
    RABBITMQ_ROUTING_KEY: str = "order.created"

    # Application Configuration
    APP_NAME: str = "Notification Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8004

    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:8002",
        "http://localhost:8003",
        "http://localhost:8004",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Create global settings instance
settings = Settings()
