"""
API Dependencies - JWT Authentication via User Service
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.utils import AuthClient

# OAuth2 scheme to get token from header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> str:
    """
    Dependency to get current user by validating JWT token via User Service
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        Username if token is valid
        
    Raises:
        HTTPException: If token is invalid or User Service is unavailable
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Validate token with User Service
    auth_client = AuthClient()
    username = await auth_client.validate_token(token)

    if username is None:
        raise credentials_exception

    return username
