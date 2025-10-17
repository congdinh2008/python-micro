"""
User Repository - Quản lý thao tác database cho User
Kế thừa BaseRepository và thêm các phương thức đặc thù cho User
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    Repository cho User model
    Cung cấp các phương thức để thao tác với bảng users
    """

    def __init__(self, db: Session):
        """
        Khởi tạo UserRepository

        Args:
            db (Session): Database session
        """
        super().__init__(User, db)

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Lấy user theo username

        Args:
            username (str): Username cần tìm

        Returns:
            Optional[User]: User nếu tìm thấy, None nếu không
        """
        return self.db.query(User).filter(User.username == username).first()

    def exists_by_username(self, username: str) -> bool:
        """
        Kiểm tra username đã tồn tại chưa

        Args:
            username (str): Username cần kiểm tra

        Returns:
            bool: True nếu username đã tồn tại, False nếu chưa
        """
        return self.db.query(User).filter(
            User.username == username
        ).first() is not None

    def get_active_user_by_username(self, username: str) -> Optional[User]:
        """
        Lấy user active theo username

        Args:
            username (str): Username cần tìm

        Returns:
            Optional[User]: User nếu tìm thấy và active, None nếu không
        """
        return self.db.query(User).filter(
            User.username == username,
            User.is_active == True
        ).first()
