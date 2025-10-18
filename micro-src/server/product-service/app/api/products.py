"""
Product Routes - Endpoints for product management
Authentication is delegated to User Service via REST API
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.services import ProductService
from app.api.deps import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "",
    response_model=List[ProductResponse],
    summary="Get all products",
    description="Get all products with pagination (no authentication required)"
)
def get_products(
    skip: int = Query(0, ge=0, description="Number of products to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of products"),
    db: Session = Depends(get_db)
):
    """
    Get all products
    
    **Query Parameters:**
    - **skip**: Number of products to skip (offset) - default: 0
    - **limit**: Maximum number of products to return - default: 100
    
    **Response:**
    - List of products with full information
    
    **Note:** This endpoint does not require authentication
    """
    product_service = ProductService(db)
    products = product_service.get_all_products(skip=skip, limit=limit)
    return products


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get product details",
    description="Get detailed information of a product (no authentication required)"
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Get product details by ID
    
    **Path Parameters:**
    - **product_id**: Product ID
    
    **Response:**
    - Product detailed information
    
    **Errors:**
    - 404: Product not found
    
    **Note:** This endpoint does not require authentication
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
    summary="Create new product",
    description="Create new product (requires JWT token)"
)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Create new product (Requires authentication)
    
    **Request Body:**
    - **name**: Product name (not empty)
    - **description**: Product description (optional)
    - **price**: Product price (must be > 0)
    - **quantity**: Stock quantity (must be >= 0)
    
    **Response:**
    - Created product information
    
    **Errors:**
    - 401: Not logged in or invalid token
    - 422: Validation error (invalid data)
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    - Token is validated via User Service REST API
    """
    product_service = ProductService(db)
    product = product_service.create_product(product_data)
    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update product",
    description="Update product information (requires JWT token)"
)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Update product (Requires authentication)
    
    **Path Parameters:**
    - **product_id**: Product ID to update
    
    **Request Body:**
    - **name**: New name (optional)
    - **description**: New description (optional)
    - **price**: New price (optional, must be > 0 if provided)
    - **quantity**: New quantity (optional, must be >= 0 if provided)
    
    **Response:**
    - Updated product information
    
    **Errors:**
    - 401: Not logged in or invalid token
    - 404: Product not found
    - 422: Validation error (invalid data)
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    - Token is validated via User Service REST API
    
    **Note:** Only provide fields to update
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
    summary="Delete product",
    description="Delete product from system (requires JWT token)"
)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Delete product (Requires authentication)
    
    **Path Parameters:**
    - **product_id**: Product ID to delete
    
    **Response:**
    - 204 No Content if successful
    
    **Errors:**
    - 401: Not logged in or invalid token
    - 404: Product not found
    
    **Authentication:**
    - Requires JWT token in header: `Authorization: Bearer <token>`
    - Token is validated via User Service REST API
    """
    product_service = ProductService(db)
    success = product_service.delete_product(product_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm có ID: {product_id}"
        )

    return None
