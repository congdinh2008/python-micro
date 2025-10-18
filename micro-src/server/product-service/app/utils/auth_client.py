"""
Auth Client - HTTP Client for User Service Authentication
Validates JWT tokens by calling User Service REST API
"""

import httpx
from typing import Optional

from app.config import settings


class AuthClient:
    """
    Client for communicating with User Service
    Validates JWT tokens via REST API
    """

    def __init__(self):
        """Initialize AuthClient with User Service URL"""
        self.user_service_url = settings.USER_SERVICE_URL

    async def validate_token(self, token: str) -> Optional[str]:
        """
        Validate JWT token by calling User Service
        
        Args:
            token: JWT token to validate
            
        Returns:
            Username if token is valid, None otherwise
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.user_service_url}/validate-token",
                    json={"token": token},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("valid"):
                        return data.get("username")
                
                return None
                
        except (httpx.HTTPError, httpx.TimeoutException) as e:
            print(f"Error validating token with User Service: {e}")
            return None

    def validate_token_sync(self, token: str) -> Optional[str]:
        """
        Validate JWT token by calling User Service (synchronous version)
        
        Args:
            token: JWT token to validate
            
        Returns:
            Username if token is valid, None otherwise
        """
        try:
            with httpx.Client() as client:
                response = client.post(
                    f"{self.user_service_url}/validate-token",
                    json={"token": token},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("valid"):
                        return data.get("username")
                
                return None
                
        except (httpx.HTTPError, httpx.TimeoutException) as e:
            print(f"Error validating token with User Service: {e}")
            return None
