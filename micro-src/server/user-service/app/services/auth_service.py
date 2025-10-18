"""
Auth Service - Business Logic for Authentication
Handles registration, login, and JWT token generation
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
    decode_access_token,
)
from app.config import settings


class AuthService:
    """
    Service class for authentication logic
    Uses UserRepository for database operations
    """

    def __init__(self, db: Session):
        """
        Initialize AuthService
        
        Args:
            db: Database session
        """
        self.db = db
        self.user_repository = UserRepository(db)

    def register_user(self, user_data: UserCreate) -> User:
        """
        Register new user
        
        Args:
            user_data: Registration data (username, password)
            
        Returns:
            Created user
            
        Raises:
            ValueError: If username already exists
        """
        # Check if username already exists
        if self.user_repository.exists_by_username(user_data.username):
            raise ValueError(
                f"Username '{user_data.username}' đã tồn tại. "
                "Vui lòng chọn username khác."
            )

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Create new user
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
        Authenticate user with username and password
        
        Args:
            username: Username
            password: Plain text password
            
        Returns:
            User if authentication successful, None if failed
        """
        # Get user from database
        user = self.user_repository.get_active_user_by_username(username)

        # Check user exists and password is correct
        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def create_access_token_for_user(self, user: User) -> Token:
        """
        Create JWT access token for user
        
        Args:
            user: User to create token for
            
        Returns:
            JWT token response
        """
        # Create token with username in 'sub' claim
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
        Login and return JWT token
        
        Args:
            username: Username
            password: Password
            
        Returns:
            JWT token if login successful
            
        Raises:
            ValueError: If username or password is incorrect
        """
        # Authenticate user
        user = self.authenticate_user(username, password)

        if not user:
            raise ValueError("Username hoặc password không đúng")

        # Create and return token
        return self.create_access_token_for_user(user)

    def validate_token(self, token: str) -> Optional[str]:
        """
        Validate JWT token and return username
        
        Args:
            token: JWT token to validate
            
        Returns:
            Username if token is valid, None otherwise
        """
        username = decode_access_token(token)
        if username is None:
            return None
            
        # Verify user still exists and is active
        user = self.user_repository.get_active_user_by_username(username)
        if user is None:
            return None
            
        return username

    def validate_token_with_user(self, token: str) -> Optional[User]:
        """
        Validate JWT token and return User object
        
        Args:
            token: JWT token to validate
            
        Returns:
            User object if token is valid, None otherwise
        """
        username = decode_access_token(token)
        if username is None:
            return None
            
        # Verify user still exists and is active
        user = self.user_repository.get_active_user_by_username(username)
        return user
