"""
Authentication Routes - Endpoints cho đăng ký và đăng nhập
POST /register - Đăng ký tài khoản mới
POST /login - Đăng nhập và nhận JWT token
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserCreate, UserResponse, Token
from app.services import AuthService

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản mới",
    description="Tạo tài khoản người dùng mới với username và password"
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Đăng ký user mới

    **Request Body:**
    - **username**: Tên đăng nhập (3-50 ký tự, unique)
    - **password**: Mật khẩu (tối thiểu 6 ký tự)

    **Response:**
    - Thông tin user vừa được tạo (không bao gồm password)

    **Errors:**
    - 400: Username đã tồn tại
    - 422: Validation error (username hoặc password không hợp lệ)
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
    summary="Đăng nhập",
    description="Đăng nhập và nhận JWT access token"
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Đăng nhập và lấy JWT token

    **Request Body (Form Data):**
    - **username**: Tên đăng nhập
    - **password**: Mật khẩu

    **Response:**
    - **access_token**: JWT token để sử dụng cho các requests tiếp theo
    - **token_type**: "bearer"

    **Errors:**
    - 401: Username hoặc password không đúng

    **Cách sử dụng token:**
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
