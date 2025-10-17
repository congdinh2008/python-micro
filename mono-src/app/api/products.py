"""
Product Routes - Endpoints cho quản lý sản phẩm
GET /products - Lấy danh sách sản phẩm (public)
GET /products/{product_id} - Lấy chi tiết sản phẩm (public)
POST /products - Tạo sản phẩm mới (yêu cầu JWT)
PUT /products/{product_id} - Cập nhật sản phẩm (yêu cầu JWT)
DELETE /products/{product_id} - Xóa sản phẩm (yêu cầu JWT)
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.services import ProductService
from app.models import User
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "",
    response_model=List[ProductResponse],
    summary="Lấy danh sách sản phẩm",
    description="Lấy danh sách tất cả sản phẩm với pagination (không yêu cầu authentication)"
)
def get_products(
    skip: int = Query(0, ge=0, description="Số sản phẩm bỏ qua"),
    limit: int = Query(100, ge=1, le=100, description="Số lượng sản phẩm tối đa"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách sản phẩm

    **Query Parameters:**
    - **skip**: Số sản phẩm bỏ qua (offset) - default: 0
    - **limit**: Số lượng sản phẩm tối đa trả về - default: 100

    **Response:**
    - List các sản phẩm với đầy đủ thông tin

    **Note:** Endpoint này không yêu cầu authentication
    """
    product_service = ProductService(db)
    products = product_service.get_all_products(skip=skip, limit=limit)
    return products


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Lấy chi tiết sản phẩm",
    description="Lấy thông tin chi tiết của một sản phẩm (không yêu cầu authentication)"
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Lấy chi tiết sản phẩm theo ID

    **Path Parameters:**
    - **product_id**: ID của sản phẩm

    **Response:**
    - Thông tin chi tiết sản phẩm

    **Errors:**
    - 404: Không tìm thấy sản phẩm

    **Note:** Endpoint này không yêu cầu authentication
    """
    product_service = ProductService(db)
    product = product_service.get_product_by_id(product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm có ID: {product_id}"
        )

    return product


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo sản phẩm mới",
    description="Tạo sản phẩm mới (yêu cầu JWT token)"
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo sản phẩm mới (Yêu cầu authentication)

    **Request Body:**
    - **name**: Tên sản phẩm (không được trống)
    - **description**: Mô tả sản phẩm (optional)
    - **price**: Giá sản phẩm (phải > 0)
    - **quantity**: Số lượng trong kho (phải >= 0)

    **Response:**
    - Thông tin sản phẩm vừa được tạo

    **Errors:**
    - 401: Chưa đăng nhập hoặc token không hợp lệ
    - 422: Validation error (dữ liệu không hợp lệ)

    **Authentication:**
    - Yêu cầu JWT token trong header: `Authorization: Bearer <token>`
    """
    product_service = ProductService(db)
    product = product_service.create_product(product_data)
    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Cập nhật sản phẩm",
    description="Cập nhật thông tin sản phẩm (yêu cầu JWT token)"
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật sản phẩm (Yêu cầu authentication)

    **Path Parameters:**
    - **product_id**: ID của sản phẩm cần cập nhật

    **Request Body:**
    - **name**: Tên mới (optional)
    - **description**: Mô tả mới (optional)
    - **price**: Giá mới (optional, phải > 0 nếu cung cấp)
    - **quantity**: Số lượng mới (optional, phải >= 0 nếu cung cấp)

    **Response:**
    - Thông tin sản phẩm đã được cập nhật

    **Errors:**
    - 401: Chưa đăng nhập hoặc token không hợp lệ
    - 404: Không tìm thấy sản phẩm
    - 422: Validation error (dữ liệu không hợp lệ)

    **Authentication:**
    - Yêu cầu JWT token trong header: `Authorization: Bearer <token>`

    **Note:** Chỉ cần cung cấp các fields muốn cập nhật
    """
    product_service = ProductService(db)
    product = product_service.update_product(product_id, product_data)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm có ID: {product_id}"
        )

    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xóa sản phẩm",
    description="Xóa sản phẩm khỏi hệ thống (yêu cầu JWT token)"
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa sản phẩm (Yêu cầu authentication)

    **Path Parameters:**
    - **product_id**: ID của sản phẩm cần xóa

    **Response:**
    - 204 No Content nếu xóa thành công

    **Errors:**
    - 401: Chưa đăng nhập hoặc token không hợp lệ
    - 404: Không tìm thấy sản phẩm

    **Authentication:**
    - Yêu cầu JWT token trong header: `Authorization: Bearer <token>`
    """
    product_service = ProductService(db)
    success = product_service.delete_product(product_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm có ID: {product_id}"
        )

    return None
