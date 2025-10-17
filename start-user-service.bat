@echo off
REM Script to start User Service on Windows

echo Starting User Service...

REM Navigate to user-service directory
cd user-service

REM Check if .env exists, if not create from .env.example
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your configuration before running!
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Run migrations
echo Running database migrations...
alembic upgrade head

REM Start the service
echo Starting User Service on port 8001...
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
