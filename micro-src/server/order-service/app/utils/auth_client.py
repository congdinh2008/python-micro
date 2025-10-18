"""
Auth Client - Communicate with User Service for authentication
"""

import httpx
import logging

from app.config import settings

logger = logging.getLogger(__name__)


async def validate_token(token: str) -> dict:
    """
    Validate JWT token via User Service
    
    Args:
        token: JWT token to validate
        
    Returns:
        Dict with validation result and username if valid
        
    Raises:
        Exception if User Service is unreachable
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{settings.USER_SERVICE_URL}/validate-token",
                json={"token": token}
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Token validated successfully for user: {data.get('username')}")
                return data
            else:
                logger.warning(f"❌ Token validation failed: {response.status_code}")
                return {"valid": False}
                
    except httpx.TimeoutException:
        logger.error("⏱️ User Service timeout")
        raise Exception("User Service không phản hồi")
    except httpx.RequestError as e:
        logger.error(f"❌ Error connecting to User Service: {e}")
        raise Exception(f"Lỗi kết nối User Service: {str(e)}")
