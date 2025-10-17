"""
Base Repository - Generic Repository Pattern
Cung cấp các phương thức CRUD cơ bản cho tất cả repositories
"""

from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.orm import Session

from app.database import Base

# Type variable cho model
ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Base repository với các phương thức CRUD cơ bản
    Sử dụng Generic để reuse code cho nhiều models khác nhau

    Attributes:
        model: SQLAlchemy model class
        db: Database session
    """

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Khởi tạo repository

        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    def get_by_id(self, id: int) -> Optional[ModelType]:
        """
        Lấy một record theo ID

        Args:
            id (int): ID của record

        Returns:
            Optional[ModelType]: Record nếu tìm thấy, None nếu không
        """
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """
        Lấy tất cả records với pagination

        Args:
            skip (int): Số records bỏ qua (offset)
            limit (int): Số lượng records tối đa trả về

        Returns:
            List[ModelType]: List các records
        """
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj_in: dict) -> ModelType:
        """
        Tạo một record mới

        Args:
            obj_in (dict): Dictionary chứa data để tạo record

        Returns:
            ModelType: Record vừa được tạo
        """
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: int, obj_in: dict) -> Optional[ModelType]:
        """
        Cập nhật một record

        Args:
            id (int): ID của record cần cập nhật
            obj_in (dict): Dictionary chứa data cần cập nhật

        Returns:
            Optional[ModelType]: Record đã cập nhật nếu tìm thấy, None nếu không
        """
        db_obj = self.get_by_id(id)
        if db_obj is None:
            return None

        # Update từng field
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        """
        Xóa một record

        Args:
            id (int): ID của record cần xóa

        Returns:
            bool: True nếu xóa thành công, False nếu không tìm thấy
        """
        db_obj = self.get_by_id(id)
        if db_obj is None:
            return False

        self.db.delete(db_obj)
        self.db.commit()
        return True

    def count(self) -> int:
        """
        Đếm tổng số records

        Returns:
            int: Số lượng records
        """
        return self.db.query(self.model).count()
