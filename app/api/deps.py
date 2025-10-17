"""
API Dependencies - JWT Authentication và Database Session
Sử dụng trong FastAPI dependency injection
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services import AuthService
from app.utils import decode_access_token

# OAuth2 scheme để lấy token từ header
# tokenUrl là endpoint để lấy token (POST /login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency để lấy current user từ JWT token
    Sử dụng trong các endpoints cần authentication

    Args:
        token (str): JWT token từ Authorization header
        db (Session): Database session

    Returns:
        User: Current user nếu token valid

    Raises:
        HTTPException: Nếu token invalid hoặc user không tồn tại

    Example:
        @app.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            return {"message": f"Hello {current_user.username}"}
    """
    # Exception credentials khi authentication thất bại
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode JWT token
    username = decode_access_token(token)
    if username is None:
        raise credentials_exception

    # Lấy user từ database
    auth_service = AuthService(db)
    user = auth_service.get_current_user(username)

    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency để lấy current active user
    Kiểm tra thêm user có active không

    Args:
        current_user (User): User từ get_current_user dependency

    Returns:
        User: Current active user

    Raises:
        HTTPException: Nếu user không active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User không active"
        )
    return current_user
