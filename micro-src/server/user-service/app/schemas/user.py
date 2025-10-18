"""
User Schemas - Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class UserBase(BaseModel):
    """Base schema for User with common attributes"""
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Username (3-50 characters)"
    )


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(
        ...,
        min_length=6,
        description="Password (minimum 6 characters)"
    )


class UserResponse(UserBase):
    """Schema for user response (without password)"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token payload data"""
    username: Optional[str] = None


class TokenValidationRequest(BaseModel):
    """Schema for token validation request"""
    token: str = Field(..., description="JWT token to validate")


class TokenValidationResponse(BaseModel):
    """Schema for token validation response"""
    valid: bool
    username: Optional[str] = None
    user_id: Optional[int] = None
    message: Optional[str] = None
