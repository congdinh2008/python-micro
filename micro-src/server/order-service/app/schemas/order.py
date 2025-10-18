"""
Order Schemas - Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum


class OrderStatus(str, Enum):
    """Order status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderCreate(BaseModel):
    """
    Schema for creating a new order
    """
    product_id: int = Field(..., gt=0, description="Product ID")
    quantity: int = Field(..., gt=0, description="Order quantity")

    @field_validator("product_id")
    @classmethod
    def validate_product_id(cls, v):
        if v <= 0:
            raise ValueError("Product ID phải lớn hơn 0")
        return v

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError("Số lượng phải lớn hơn 0")
        return v


class OrderUpdate(BaseModel):
    """
    Schema for updating an order
    """
    status: Optional[OrderStatus] = Field(None, description="Order status")


class OrderResponse(BaseModel):
    """
    Schema for order response
    """
    id: int
    user_id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    status: OrderStatus
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "user_id": 1,
                "product_id": 1,
                "product_name": "Laptop Dell XPS 15",
                "quantity": 2,
                "unit_price": 25000000.0,
                "total_price": 50000000.0,
                "status": "pending",
                "created_at": "2025-10-17T08:00:00",
                "updated_at": "2025-10-17T08:00:00",
            }
        }
    }
