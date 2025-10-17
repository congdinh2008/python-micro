"""
User Model - SQLAlchemy Model for users table
Manages user information and authentication
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean

from app.database import Base


class User(Base):
    """
    User model to store user information
    
    Attributes:
        id (int): Primary key, auto-increment
        username (str): Username, unique, not null
        hashed_password (str): Hashed password
        is_active (bool): User active status
        created_at (datetime): Account creation time
        updated_at (datetime): Last update time
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
        """String representation of User model"""
        return f"<User(id={self.id}, username='{self.username}')>"
