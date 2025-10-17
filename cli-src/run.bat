@echo off
REM Script để chạy Product Manager CLI Application trên Windows

echo ========================================
echo   Product Manager CLI Application
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Run the application
python main.py

pause
