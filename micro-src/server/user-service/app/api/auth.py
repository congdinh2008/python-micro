"""
Authentication Routes - Endpoints for registration, login and token validation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserCreate, UserResponse, Token, TokenValidationRequest, TokenValidationResponse
from app.services import AuthService

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create new user account with username and password"
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register new user
    
    **Request Body:**
    - **username**: Username (3-50 characters, unique)
    - **password**: Password (minimum 6 characters)
    
    **Response:**
    - User information (without password)
    
    **Errors:**
    - 400: Username already exists
    - 422: Validation error
    """
    auth_service = AuthService(db)

    try:
        user = auth_service.register_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post(
    "/login",
    response_model=Token,
    summary="Login",
    description="Login and receive JWT access token"
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login and get JWT token
    
    **Request Body (Form Data):**
    - **username**: Username
    - **password**: Password
    
    **Response:**
    - **access_token**: JWT token for subsequent requests
    - **token_type**: "bearer"
    
    **Errors:**
    - 401: Username or password incorrect
    
    **How to use token:**
    ```
    Authorization: Bearer <access_token>
    ```
    """
    auth_service = AuthService(db)

    try:
        token = auth_service.login(form_data.username, form_data.password)
        return token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/validate-token",
    response_model=TokenValidationResponse,
    summary="Validate JWT token",
    description="Validate JWT token and return user information"
)
def validate_token(
    request: TokenValidationRequest,
    db: Session = Depends(get_db)
):
    """
    Validate JWT token
    
    **Request Body:**
    - **token**: JWT token to validate
    
    **Response:**
    - **valid**: True if token is valid, False otherwise
    - **username**: Username if token is valid, None otherwise
    - **user_id**: User ID if token is valid, None otherwise
    - **message**: Error message if token is invalid
    
    **Use Case:**
    - Product Service calls this endpoint to validate tokens
    - Returns username and user_id if token is valid for further authorization
    """
    auth_service = AuthService(db)

    user = auth_service.validate_token_with_user(request.token)
    
    if user:
        return TokenValidationResponse(
            valid=True,
            username=user.username,
            user_id=user.id,
            message="Token is valid"
        )
    else:
        return TokenValidationResponse(
            valid=False,
            username=None,
            user_id=None,
            message="Token is invalid or expired"
        )
