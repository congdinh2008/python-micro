"""
Base Repository - Generic Repository Pattern Implementation
Provides common CRUD operations for all repositories
"""

from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base repository with generic CRUD operations
    """

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize base repository
        
        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get entity by ID"""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get all entities with pagination"""
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj_data: Dict[str, Any]) -> ModelType:
        """
        Create new entity
        
        Args:
            obj_data: Dictionary with entity data
            
        Returns:
            Created entity
        """
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: int, obj_data: Dict[str, Any]) -> Optional[ModelType]:
        """
        Update entity
        
        Args:
            id: Entity ID
            obj_data: Dictionary with updated data
            
        Returns:
            Updated entity or None if not found
        """
        db_obj = self.get_by_id(id)
        if db_obj is None:
            return None

        for key, value in obj_data.items():
            if hasattr(db_obj, key) and value is not None:
                setattr(db_obj, key, value)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        """
        Delete entity
        
        Args:
            id: Entity ID
            
        Returns:
            True if deleted, False if not found
        """
        db_obj = self.get_by_id(id)
        if db_obj is None:
            return False

        self.db.delete(db_obj)
        self.db.commit()
        return True
