@echo off
echo ========================================
echo   SkyGuard DAO - Backend Startup
echo ========================================
echo.

echo [1/4] Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Generating dummy blockchain data...
cd ..
python scripts\generate_dummy_data.py

echo.
echo [4/4] Starting Flask backend server...
python backend\api\app.py

pause
