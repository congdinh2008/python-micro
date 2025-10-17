"""
User Schemas - Pydantic models cho User API
Sử dụng để validate request/response data
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserBase(BaseModel):
    """Base schema cho User"""
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Tên đăng nhập (3-50 ký tự)"
    )


class UserCreate(UserBase):
    """Schema cho đăng ký user mới"""
    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="Mật khẩu (tối thiểu 6 ký tự)"
    )


class UserLogin(BaseModel):
    """Schema cho đăng nhập"""
    username: str = Field(..., description="Tên đăng nhập")
    password: str = Field(..., description="Mật khẩu")


class UserResponse(UserBase):
    """Schema cho response User (không trả về password)"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema cho JWT token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema cho data trong JWT token"""
    username: Optional[str] = None
