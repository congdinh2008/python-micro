"""
Product Schemas - Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


class ProductBase(BaseModel):
    """Base schema for Product with common attributes"""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    description: Optional[str] = Field(None, max_length=1000, description="Product description")
    price: Decimal = Field(..., gt=0, description="Product price (must be > 0)")
    quantity: int = Field(..., ge=0, description="Stock quantity (must be >= 0)")


class ProductCreate(ProductBase):
    """Schema for product creation"""
    pass


class ProductUpdate(BaseModel):
    """Schema for product update (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Product name")
    description: Optional[str] = Field(None, max_length=1000, description="Product description")
    price: Optional[Decimal] = Field(None, gt=0, description="Product price (must be > 0)")
    quantity: Optional[int] = Field(None, ge=0, description="Stock quantity (must be >= 0)")


class ProductResponse(ProductBase):
    """Schema for product response"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
