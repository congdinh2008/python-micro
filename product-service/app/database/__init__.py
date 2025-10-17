"""
Database module for Product Service
"""

from app.database.database import Base, get_db, engine

__all__ = ["Base", "get_db", "engine"]
