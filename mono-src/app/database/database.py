"""
Database Setup - SQLAlchemy 2.0 Configuration
Quản lý kết nối database và session
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.config import settings

# Create database engine
# Sử dụng pool_pre_ping để kiểm tra connection trước khi sử dụng
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,  # Log SQL queries khi DEBUG=True
)

# Create SessionLocal class
# autocommit=False: Không tự động commit, phải gọi session.commit() manually
# autoflush=False: Không tự động flush trước khi query
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Create Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency để lấy database session
    Sử dụng trong FastAPI dependency injection

    Yields:
        Session: SQLAlchemy database session

    Example:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
