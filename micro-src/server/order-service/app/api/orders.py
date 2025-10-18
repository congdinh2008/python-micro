"""
Order Routes - Endpoints for order management
Authentication is delegated to User Service via REST API
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import OrderCreate, OrderUpdate, OrderResponse
from app.services import OrderService
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new order",
    description="Create new order and publish event to RabbitMQ (requires JWT token)"
)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Create new order (Requires authentication)
    
    **Request Body:**
    - **product_id**: Product ID (must be > 0)
    - **quantity**: Order quantity (must be > 0)
    
    **Response:**
    - Created order information
    
    **Errors:**
    - 401: Not logged in or invalid token
    - 404: Product not found
    - 400: Insufficient stock
    - 422: Validation error (invalid data)
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    - Token is validated via User Service REST API
    
    **Event Publishing:**
    - Publishes `order.created` event to RabbitMQ for Notification Service
    """
    order_service = OrderService(db)
    
    try:
        order = await order_service.create_order(order_data, current_user)
        logger.info(f"✅ Order created successfully: ID={order.id}")
        return order
    except Exception as e:
        logger.error(f"❌ Error creating order: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "",
    response_model=List[OrderResponse],
    summary="Get all orders",
    description="Get all orders with pagination (requires JWT token)"
)
async def get_orders(
    skip: int = Query(0, ge=0, description="Number of orders to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of orders"),
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Get all orders for current user
    
    **Query Parameters:**
    - **skip**: Number of orders to skip (offset) - default: 0
    - **limit**: Maximum number of orders to return - default: 100
    
    **Response:**
    - List of orders for current user
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    """
    order_service = OrderService(db)
    orders = order_service.get_orders_by_user(current_user, skip=skip, limit=limit)
    return orders


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order details",
    description="Get detailed information of an order (requires JWT token)"
)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Get order details by ID
    
    **Path Parameters:**
    - **order_id**: Order ID
    
    **Response:**
    - Order detailed information
    
    **Errors:**
    - 404: Order not found
    - 403: Not authorized to view this order
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    """
    order_service = OrderService(db)
    order = order_service.get_order_by_id(order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy đơn hàng có ID: {order_id}"
        )

    # Check if user owns this order
    if order.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem đơn hàng này"
        )

    return order


@router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Update order status",
    description="Update order status (requires JWT token)"
)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Update order status (Requires authentication)
    
    **Path Parameters:**
    - **order_id**: Order ID to update
    
    **Request Body:**
    - **status**: New order status (optional)
    
    **Response:**
    - Updated order information
    
    **Errors:**
    - 401: Not logged in or invalid token
    - 404: Order not found
    - 403: Not authorized to update this order
    - 422: Validation error (invalid data)
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    """
    order_service = OrderService(db)
    
    # Check if order exists and user owns it
    order = order_service.get_order_by_id(order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy đơn hàng có ID: {order_id}"
        )
    
    if order.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật đơn hàng này"
        )
    
    # Update order
    updated_order = order_service.update_order(order_id, order_data)
    logger.info(f"✅ Order updated: ID={order_id}")
    return updated_order


@router.delete(
    "/{order_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete order",
    description="Delete order from system (requires JWT token)"
)
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user)
):
    """
    Delete order (Requires authentication)
    
    **Path Parameters:**
    - **order_id**: Order ID to delete
    
    **Response:**
    - 204 No Content if successful
    
    **Errors:**
    - 401: Not logged in or invalid token
    - 404: Order not found
    - 403: Not authorized to delete this order
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    """
    order_service = OrderService(db)
    
    # Check if order exists and user owns it
    order = order_service.get_order_by_id(order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy đơn hàng có ID: {order_id}"
        )
    
    if order.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa đơn hàng này"
        )
    
    # Delete order
    success = order_service.delete_order(order_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi khi xóa đơn hàng"
        )
    
    logger.info(f"✅ Order deleted: ID={order_id}")
    return None
