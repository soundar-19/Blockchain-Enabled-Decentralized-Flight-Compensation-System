@echo off
REM SkyGuard DAO - Backend Startup Script

echo ========================================
echo   SkyGuard DAO - Backend Startup
echo ========================================
echo.

echo [1/3] Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo [2/3] Installing Python dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Flask backend server...
echo.
echo Backend will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

REM Start the Flask app directly
python api/app.py

pause
