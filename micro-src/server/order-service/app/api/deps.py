"""
API Dependencies - Shared dependencies for API endpoints
"""

import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.utils import validate_token

logger = logging.getLogger(__name__)

# OAuth2 scheme for JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> int:
    """
    Get current user ID from JWT token
    Validates token via User Service REST API
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        User ID from token
        
    Raises:
        HTTPException if token is invalid
    """
    try:
        # Validate token via User Service
        result = await validate_token(token)
        
        if not result.get("valid"):
            logger.warning("❌ Invalid token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không hợp lệ hoặc đã hết hạn",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = result.get("user_id")
        if not user_id:
            logger.error("❌ Token valid but no user_id found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Không thể xác thực người dùng",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"✅ User authenticated: {user_id}")
        return user_id
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error validating token: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Không thể xác thực với User Service",
        )
