@echo off
REM ============================================================
REM SkyGuard DAO - Flight Compensation System
REM Complete startup script for Backend + Frontend
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo ^^ SkyGuard DAO - Flight Compensation System
echo ============================================================
echo.
echo Starting up all services...
echo.

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+
    pause
    exit /b 1
)
echo ✓ Python found

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 16+
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Check MongoDB
echo Checking MongoDB...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo ⚠ MongoDB not found in PATH. Assuming MongoDB service is running...
)

echo.
echo ============================================================
echo Starting Backend (Flask API)
echo ============================================================

REM Install backend dependencies
cd backend
if not exist ".env" (
    echo ⚠ WARNING: .env file not found
    echo Please ensure backend\.env exists with proper configuration
    echo Reference: backend\.env.example
)

python -m pip install -q -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed

REM Start backend in new window
echo ✓ Starting Flask backend on http://localhost:5000
start "SkyGuard Backend" python run.py
cd ..

timeout /t 3 /nobreak

echo.
echo ============================================================
echo Starting Frontend (React + Vite)
echo ============================================================

cd frontend

if not exist ".env" (
    echo ⚠ WARNING: .env file not found
    echo Please ensure frontend\.env exists with proper configuration
    echo Reference: frontend\.env.example
)

REM Install frontend dependencies
echo Installing frontend dependencies (may take a minute)...
call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed

REM Start frontend in new window
echo ✓ Starting Vite development server on http://localhost:5173
start "SkyGuard Frontend" npm run dev
cd ..

echo.
echo ============================================================
echo ✨ All Services Started!
echo ============================================================
echo.
echo 📍 Backend:  http://localhost:5000
echo 📍 Frontend: http://localhost:5173
echo.
echo Services should open automatically in new windows.
echo If they don't, use the URLs above.
echo.
echo Press any key to continue...
pause

exit /b 0
