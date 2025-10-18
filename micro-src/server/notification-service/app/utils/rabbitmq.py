"""
RabbitMQ Consumer - Consume order events from RabbitMQ
"""

import json
import logging
from typing import Optional
import aio_pika
from aio_pika import ExchangeType, IncomingMessage

from app.config import settings

logger = logging.getLogger(__name__)


class RabbitMQConsumer:
    """
    RabbitMQ Consumer for order events
    """

    def __init__(self):
        """Initialize RabbitMQ Consumer"""
        self.connection: Optional[aio_pika.RobustConnection] = None
        self.channel: Optional[aio_pika.Channel] = None
        self.queue: Optional[aio_pika.Queue] = None

    async def connect(self):
        """
        Connect to RabbitMQ and setup queue
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
            
            # Set QoS - process one message at a time
            await self.channel.set_qos(prefetch_count=1)
            
            # Declare exchange
            exchange = await self.channel.declare_exchange(
                settings.RABBITMQ_EXCHANGE,
                ExchangeType.TOPIC,
                durable=True,
            )
            
            # Declare queue
            self.queue = await self.channel.declare_queue(
                settings.RABBITMQ_QUEUE,
                durable=True,
            )
            
            # Bind queue to exchange with routing key
            await self.queue.bind(
                exchange,
                routing_key=settings.RABBITMQ_ROUTING_KEY,
            )
            
            logger.info(
                f"✅ Connected to RabbitMQ at {settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}"
            )
            logger.info(f"✅ Queue '{settings.RABBITMQ_QUEUE}' bound to exchange '{settings.RABBITMQ_EXCHANGE}'")
            logger.info(f"✅ Listening for routing key: {settings.RABBITMQ_ROUTING_KEY}")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise

    async def process_message(self, message: IncomingMessage):
        """
        Process incoming message
        
        Args:
            message: Incoming RabbitMQ message
        """
        async with message.process():
            try:
                # Parse message body
                body = json.loads(message.body.decode())
                event = body.get("event")
                data = body.get("data", {})
                
                logger.info(f"📨 Received event: {event}")
                logger.info(f"📦 Message data: {json.dumps(data, indent=2)}")
                
                # Process order.created event
                if event == "order.created":
                    await self._send_order_confirmation(data)
                else:
                    logger.warning(f"⚠️ Unknown event type: {event}")
                
            except json.JSONDecodeError as e:
                logger.error(f"❌ Failed to parse message JSON: {e}")
            except Exception as e:
                logger.error(f"❌ Error processing message: {e}")

    async def _send_order_confirmation(self, order_data: dict):
        """
        Send order confirmation notification
        
        Args:
            order_data: Order data from event
        """
        order_id = order_data.get("order_id")
        user_id = order_data.get("user_id")
        product_name = order_data.get("product_name")
        quantity = order_data.get("quantity")
        total_price = order_data.get("total_price")
        
        # Log notification (in real app, this would send email/SMS/push notification)
        logger.info("=" * 80)
        logger.info("📧 SENDING ORDER CONFIRMATION EMAIL")
        logger.info("=" * 80)
        logger.info(f"To: User ID {user_id}")
        logger.info(f"Subject: Xác nhận đơn hàng #{order_id}")
        logger.info("-" * 80)
        logger.info("Dear Customer,")
        logger.info("")
        logger.info(f"Đơn hàng #{order_id} của bạn đã được tạo thành công!")
        logger.info("")
        logger.info("Chi tiết đơn hàng:")
        logger.info(f"  - Sản phẩm: {product_name}")
        logger.info(f"  - Số lượng: {quantity}")
        logger.info(f"  - Tổng tiền: {total_price:,.0f} VNĐ")
        logger.info("")
        logger.info("Cảm ơn bạn đã đặt hàng!")
        logger.info("=" * 80)
        
        # In a real application, you would:
        # 1. Get user email from User Service
        # 2. Send email using SMTP or email service (SendGrid, AWS SES, etc.)
        # 3. Send SMS notification
        # 4. Send push notification to mobile app
        # 5. Update notification status in database

    async def start_consuming(self):
        """
        Start consuming messages from queue
        """
        if not self.queue:
            await self.connect()
        
        logger.info("🎧 Starting to consume messages...")
        await self.queue.consume(self.process_message)

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


# Global consumer instance
rabbitmq_consumer = RabbitMQConsumer()
