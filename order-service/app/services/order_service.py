"""
Order Service - Business Logic for Order Management
Handles order creation and publishes events to RabbitMQ
"""

import logging
import httpx
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Order
from app.schemas import OrderCreate, OrderUpdate
from app.repositories import OrderRepository
from app.utils import publish_order_created
from app.config import settings

logger = logging.getLogger(__name__)


class OrderService:
    """
    Service class for order management logic
    Uses OrderRepository for database operations
    """

    def __init__(self, db: Session):
        """
        Initialize OrderService
        
        Args:
            db: Database session
        """
        self.db = db
        self.order_repository = OrderRepository(db)

    async def create_order(self, order_data: OrderCreate, user_id: int) -> Order:
        """
        Create new order and publish event to RabbitMQ
        
        Args:
            order_data: Order creation data
            user_id: User ID from JWT token
            
        Returns:
            Created order
            
        Raises:
            Exception if product not found or insufficient stock
        """
        # Get product details from Product Service
        product = await self._get_product(order_data.product_id)
        
        if not product:
            raise Exception(f"Không tìm thấy sản phẩm có ID: {order_data.product_id}")
        
        # Check stock availability
        if product["quantity"] < order_data.quantity:
            raise Exception(
                f"Sản phẩm không đủ số lượng. Còn lại: {product['quantity']}, "
                f"Yêu cầu: {order_data.quantity}"
            )
        
        # Calculate prices
        unit_price = product["price"]
        total_price = unit_price * order_data.quantity
        
        # Create order in database
        order_dict = {
            "user_id": user_id,
            "product_id": order_data.product_id,
            "product_name": product["name"],
            "quantity": order_data.quantity,
            "unit_price": unit_price,
            "total_price": total_price,
            "status": "pending",
        }
        
        order = self.order_repository.create(order_dict)
        logger.info(f"✅ Order created: ID={order.id}, User={user_id}, Product={order_data.product_id}")
        
        # Publish order.created event to RabbitMQ
        try:
            await publish_order_created({
                "order_id": order.id,
                "user_id": order.user_id,
                "product_id": order.product_id,
                "product_name": order.product_name,
                "quantity": order.quantity,
                "unit_price": order.unit_price,
                "total_price": order.total_price,
                "status": order.status,
                "created_at": order.created_at.isoformat(),
            })
            logger.info(f"✅ Published order.created event for order ID: {order.id}")
        except Exception as e:
            logger.error(f"❌ Failed to publish order.created event: {e}")
            # Don't fail the order creation if message publishing fails
        
        return order

    async def _get_product(self, product_id: int) -> Optional[dict]:
        """
        Get product details from Product Service
        
        Args:
            product_id: Product ID
            
        Returns:
            Product data or None if not found
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    f"{settings.PRODUCT_SERVICE_URL}/products/{product_id}"
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    return None
                else:
                    logger.error(f"Product Service returned status: {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error("⏱️ Product Service timeout")
            raise Exception("Product Service không phản hồi")
        except httpx.RequestError as e:
            logger.error(f"❌ Error connecting to Product Service: {e}")
            raise Exception(f"Lỗi kết nối Product Service: {str(e)}")

    def get_all_orders(self, skip: int = 0, limit: int = 100) -> List[Order]:
        """
        Get all orders with pagination
        
        Args:
            skip: Number of orders to skip
            limit: Maximum number of orders to return
            
        Returns:
            List of orders
        """
        return self.order_repository.get_all(skip=skip, limit=limit)

    def get_order_by_id(self, order_id: int) -> Optional[Order]:
        """
        Get order by ID
        
        Args:
            order_id: Order ID
            
        Returns:
            Order if found, None otherwise
        """
        return self.order_repository.get_by_id(order_id)

    def get_orders_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """
        Get orders by user ID
        
        Args:
            user_id: User ID
            skip: Number of orders to skip
            limit: Maximum number of orders to return
            
        Returns:
            List of orders
        """
        return self.order_repository.get_by_user_id(user_id, skip=skip, limit=limit)

    def update_order(self, order_id: int, order_data: OrderUpdate) -> Optional[Order]:
        """
        Update order status
        
        Args:
            order_id: Order ID
            order_data: Order update data
            
        Returns:
            Updated order or None if not found
        """
        update_dict = order_data.model_dump(exclude_unset=True)
        return self.order_repository.update(order_id, update_dict)

    def delete_order(self, order_id: int) -> bool:
        """
        Delete order
        
        Args:
            order_id: Order ID
            
        Returns:
            True if deleted, False if not found
        """
        return self.order_repository.delete(order_id)
