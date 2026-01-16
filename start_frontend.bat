@echo off
echo ========================================
echo   SkyGuard DAO - Frontend Startup
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo [2/3] Installing npm dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Vite development server...
call npm run dev

pause
