@echo off
REM Script để chạy Product Catalog Monolithic Service trên Windows

echo ========================================
echo   Product Catalog Monolithic Service
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo Warning: .env file does not exist. Creating from .env.example...
    copy .env.example .env
    echo Created .env file. Please update with your configuration.
    echo.
)

REM Check if database exists
if not exist product_catalog.db (
    echo Database not initialized. Running migrations...
    alembic upgrade head
    if errorlevel 1 (
        echo Error: Migration failed! Please check your database configuration.
        pause
        exit /b 1
    )
    echo Database created successfully.
    echo.
)

REM Run the application
echo Starting server at http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --port 8000

pause
