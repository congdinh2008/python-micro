"""
Repositories module for Product Service
"""

from app.repositories.base import BaseRepository
from app.repositories.product_repository import ProductRepository

__all__ = ["BaseRepository", "ProductRepository"]
