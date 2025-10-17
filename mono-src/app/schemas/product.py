"""
Product Schemas - Pydantic models cho Product API
Sử dụng để validate request/response data
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ProductBase(BaseModel):
    """Base schema cho Product"""
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Tên sản phẩm"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Mô tả sản phẩm"
    )
    price: float = Field(
        ...,
        gt=0,
        description="Giá sản phẩm (phải > 0)"
    )
    quantity: int = Field(
        ...,
        ge=0,
        description="Số lượng trong kho (phải >= 0)"
    )

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate tên sản phẩm không được chỉ chứa khoảng trắng"""
        if not v.strip():
            raise ValueError("Tên sản phẩm không được để trống")
        return v.strip()


class ProductCreate(ProductBase):
    """Schema cho tạo sản phẩm mới"""
    pass


class ProductUpdate(BaseModel):
    """Schema cho cập nhật sản phẩm (tất cả fields đều optional)"""
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Tên sản phẩm mới"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Mô tả sản phẩm mới"
    )
    price: Optional[float] = Field(
        None,
        gt=0,
        description="Giá sản phẩm mới (phải > 0)"
    )
    quantity: Optional[int] = Field(
        None,
        ge=0,
        description="Số lượng mới (phải >= 0)"
    )

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate tên sản phẩm nếu được cung cấp"""
        if v is not None and not v.strip():
            raise ValueError("Tên sản phẩm không được để trống")
        return v.strip() if v else v


class ProductResponse(ProductBase):
    """Schema cho response Product"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
