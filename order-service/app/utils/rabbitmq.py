"""
RabbitMQ Publisher - Publish order events to RabbitMQ
"""

import json
import logging
from typing import Optional
import aio_pika
from aio_pika import ExchangeType, DeliveryMode

from app.config import settings

logger = logging.getLogger(__name__)


class RabbitMQPublisher:
    """
    RabbitMQ Publisher for order events
    """

    def __init__(self):
        """Initialize RabbitMQ Publisher"""
        self.connection: Optional[aio_pika.RobustConnection] = None
        self.channel: Optional[aio_pika.Channel] = None
        self.exchange: Optional[aio_pika.Exchange] = None

    async def connect(self):
        """
        Connect to RabbitMQ and setup exchange
        """
        try:
            # Create connection
            self.connection = await aio_pika.connect_robust(
                host=settings.RABBITMQ_HOST,
                port=settings.RABBITMQ_PORT,
                login=settings.RABBITMQ_USER,
                password=settings.RABBITMQ_PASSWORD,
            )
            
            # Create channel
            self.channel = await self.connection.channel()
            
            # Declare exchange
            self.exchange = await self.channel.declare_exchange(
                settings.RABBITMQ_EXCHANGE,
                ExchangeType.TOPIC,
                durable=True,
            )
            
            logger.info(
                f"✅ Connected to RabbitMQ at {settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}"
            )
            logger.info(f"✅ Exchange '{settings.RABBITMQ_EXCHANGE}' declared")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise

    async def publish_message(self, routing_key: str, message: dict):
        """
        Publish message to RabbitMQ
        
        Args:
            routing_key: Routing key for the message
            message: Message data as dict
        """
        if not self.exchange:
            await self.connect()

        try:
            # Convert message to JSON
            message_body = json.dumps(message).encode()
            
            # Create message with persistent delivery mode
            msg = aio_pika.Message(
                body=message_body,
                delivery_mode=DeliveryMode.PERSISTENT,
                content_type="application/json",
            )
            
            # Publish message
            await self.exchange.publish(
                msg,
                routing_key=routing_key,
            )
            
            logger.info(f"✅ Published message to '{routing_key}': {message}")
            
        except Exception as e:
            logger.error(f"❌ Failed to publish message: {e}")
            raise

    async def close(self):
        """
        Close RabbitMQ connection
        """
        if self.connection and not self.connection.is_closed:
            await self.connection.close()
            logger.info("✅ RabbitMQ connection closed")

    async def healthcheck(self) -> bool:
        """
        Check if RabbitMQ connection is healthy
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            if not self.connection or self.connection.is_closed:
                await self.connect()
            return not self.connection.is_closed
        except Exception:
            return False


# Global publisher instance
rabbitmq_publisher = RabbitMQPublisher()


async def publish_order_created(order_data: dict):
    """
    Publish order.created event
    
    Args:
        order_data: Order data to publish
    """
    await rabbitmq_publisher.publish_message(
        routing_key=settings.RABBITMQ_ROUTING_KEY,
        message={
            "event": "order.created",
            "data": order_data,
        }
    )
