"""
Repositories module for User Service
"""

from app.repositories.base import BaseRepository
from app.repositories.user_repository import UserRepository

__all__ = ["BaseRepository", "UserRepository"]
