"""
Database module for User Service
"""

from app.database.database import Base, get_db, engine

__all__ = ["Base", "get_db", "engine"]
