"""
User Model - SQLAlchemy Model cho bảng users
Quản lý thông tin người dùng và authentication
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """
    User model để lưu trữ thông tin người dùng

    Attributes:
        id (int): Primary key, auto-increment
        username (str): Tên đăng nhập, unique, không được null
        hashed_password (str): Mật khẩu đã được hash
        is_active (bool): Trạng thái active của user
        created_at (datetime): Thời gian tạo account
        updated_at (datetime): Thời gian cập nhật cuối cùng
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def __repr__(self) -> str:
        """String representation của User model"""
        return f"<User(id={self.id}, username='{self.username}')>"
