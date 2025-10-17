"""
Security Utilities - Password Hashing và JWT Token Management
Sử dụng bcrypt cho password hashing và jose cho JWT
"""

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password với hashed password

    Args:
        plain_password (str): Mật khẩu plain text
        hashed_password (str): Mật khẩu đã được hash

    Returns:
        bool: True nếu password đúng, False nếu sai
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash password sử dụng bcrypt

    Args:
        password (str): Password plain text

    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Tạo JWT access token

    Args:
        data (dict): Data để encode vào token (thường là username)
        expires_delta (Optional[timedelta]): Thời gian expire của token
            Nếu None, sử dụng default từ settings

    Returns:
        str: JWT access token

    Example:
        token = create_access_token(
            data={"sub": user.username},
            expires_delta=timedelta(minutes=30)
        )
    """
    to_encode = data.copy()

    # Tính thời gian expire
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Thêm claim 'exp' (expiration time)
    to_encode.update({"exp": expire})

    # Encode JWT token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode và validate JWT access token

    Args:
        token (str): JWT token cần decode

    Returns:
        Optional[str]: Username từ token nếu valid, None nếu invalid

    Example:
        username = decode_access_token(token)
        if username:
            # Token valid
            pass
    """
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Lấy username từ 'sub' claim
        username: str = payload.get("sub")
        if username is None:
            return None

        return username

    except JWTError:
        return None
