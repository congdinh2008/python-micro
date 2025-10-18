"""
User Repository - Data Access Layer for User model
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    Repository for User model
    Provides user-specific database operations
    """

    def __init__(self, db: Session):
        """
        Initialize UserRepository
        
        Args:
            db: Database session
        """
        super().__init__(User, db)

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username
        
        Args:
            username: Username to search for
            
        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.username == username).first()

    def get_active_user_by_username(self, username: str) -> Optional[User]:
        """
        Get active user by username
        
        Args:
            username: Username to search for
            
        Returns:
            Active user if found, None otherwise
        """
        return self.db.query(User).filter(
            User.username == username,
            User.is_active == True
        ).first()

    def exists_by_username(self, username: str) -> bool:
        """
        Check if username already exists
        
        Args:
            username: Username to check
            
        Returns:
            True if username exists, False otherwise
        """
        return self.db.query(User).filter(
            User.username == username
        ).first() is not None
