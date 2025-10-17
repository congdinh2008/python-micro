"""
Auth Service - Business Logic cho Authentication
Xử lý đăng ký, đăng nhập, và JWT token generation
"""

from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models import User
from app.schemas import UserCreate, Token
from app.repositories import UserRepository
from app.utils import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.config import settings


class AuthService:
    """
    Service class xử lý authentication logic
    Sử dụng UserRepository để thao tác với database
    """

    def __init__(self, db: Session):
        """
        Khởi tạo AuthService

        Args:
            db (Session): Database session
        """
        self.db = db
        self.user_repository = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:
        """
        Đăng ký user mới

        Args:
            user_data (UserCreate): Dữ liệu đăng ký (username, password)

        Returns:
            User: User vừa được tạo

        Raises:
            ValueError: Nếu username đã tồn tại
        """
        # Kiểm tra username đã tồn tại chưa
        if self.user_repository.exists_by_username(user_data.username):
            raise ValueError(
                f"Username '{user_data.username}' đã tồn tại. "
                "Vui lòng chọn username khác."
            )

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Tạo user mới
        user_dict = {
            "username": user_data.username,
            "hashed_password": hashed_password,
            "is_active": True,
        }

        return self.user_repository.create(user_dict)

    def authenticate_user(
        self,
        username: str,
        password: str
    ) -> Optional[User]:
        """
        Xác thực user với username và password

        Args:
            username (str): Username
            password (str): Password plain text

        Returns:
            Optional[User]: User nếu xác thực thành công, None nếu thất bại
        """
        # Lấy user từ database
        user = self.user_repository.get_active_user_by_username(username)

        # Kiểm tra user tồn tại và password đúng
        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def create_access_token_for_user(self, user: User) -> Token:
        """
        Tạo JWT access token cho user

        Args:
            user (User): User cần tạo token

        Returns:
            Token: JWT token response
        """
        # Tạo token với username trong 'sub' claim
        access_token_expires = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )

        return Token(
            access_token=access_token,
            token_type="bearer"
        )

    def login(self, username: str, password: str) -> Token:
        """
        Đăng nhập và trả về JWT token

        Args:
            username (str): Username
            password (str): Password

        Returns:
            Token: JWT token nếu đăng nhập thành công

        Raises:
            ValueError: Nếu username hoặc password không đúng
        """
        # Xác thực user
        user = self.authenticate_user(username, password)

        if not user:
            raise ValueError("Username hoặc password không đúng")

        # Tạo và trả về token
        return self.create_access_token_for_user(user)

    def get_current_user(self, username: str) -> Optional[User]:
        """
        Lấy current user từ username (từ JWT token)

        Args:
            username (str): Username từ JWT token

        Returns:
            Optional[User]: User nếu tìm thấy và active, None nếu không
        """
        return self.user_repository.get_active_user_by_username(username)
