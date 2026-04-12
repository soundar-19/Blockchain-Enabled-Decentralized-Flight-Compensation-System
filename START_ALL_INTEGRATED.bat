@echo off
REM ============================================================
REM SkyGuard DAO - Complete Integration Startup Script
REM ============================================================
REM This script starts both backend and frontend services
REM ============================================================

echo.
echo ============================================================
echo  SkyGuard DAO - Full Integration Startup
echo ============================================================
echo.
echo This script will:
echo  1. Start Backend (Flask) on port 5000
echo  2. Start Frontend (React) on port 5177
echo  3. Open browser to http://localhost:5177
echo.
echo Press ENTER to continue, or CTRL+C to cancel...
pause

REM Store the workspace directory
set WORKSPACE=d:\Blockchain_Enabled_Flight_Compensation_System

REM Check if directories exist
if not exist "%WORKSPACE%\backend" (
    echo ERROR: Backend directory not found at %WORKSPACE%\backend
    pause
    exit /b 1
)

if not exist "%WORKSPACE%\frontend" (
    echo ERROR: Frontend directory not found at %WORKSPACE%\frontend
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Starting Backend (Flask)...
echo ============================================================
echo.

REM Start backend in new window
start "SkyGuard DAO Backend" /D "%WORKSPACE%\backend" cmd /k "python run.py"

echo Backend starting... waiting 3 seconds before starting frontend
timeout /t 3 /nobreak

echo.
echo ============================================================
echo Starting Frontend (React + Vite)...
echo ============================================================
echo.

REM Start frontend in new window
start "SkyGuard DAO Frontend" /D "%WORKSPACE%\frontend" cmd /k "npm run dev"

echo Frontend starting... waiting 3 seconds before opening browser
timeout /t 3 /nobreak

echo.
echo ============================================================
echo Services Starting!
echo ============================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5177
echo API:      http://localhost:5000/api
echo.
echo Opening browser to http://localhost:5177...
echo.

REM Open browser
start http://localhost:5177

echo.
echo ============================================================
echo Both services are starting!
echo ============================================================
echo.
echo To stop services:
echo  1. Close each terminal window
echo  2. Or press CTRL+C in each terminal
echo.
echo Documentation:
echo  - QUICK_REFERENCE.md - Quick start guide
echo  - FULL_INTEGRATION_GUIDE.md - Complete manual
echo  - DATA_FLOW_ARCHITECTURE.md - System design
echo.
pause
