@echo off
REM Run Dev: Start Backend (with venv if present) and Frontend in separate windows

REM Determine script directory
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

echo ========================================
echo Starting SkyGuard Dev Environment
echo ========================================

REM Start Backend in a new window, prefer .venv then venv then system Python
echo [Backend] Checking for virtual environment...
if exist "%SCRIPT_DIR%backend\.venv\Scripts\activate.bat" (
    echo Found backend\.venv - activating and starting backend
    start "SkyGuard Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && .venv\Scripts\activate.bat && python run.py"
) else if exist "%SCRIPT_DIR%backend\venv\Scripts\activate.bat" (
    echo Found backend\venv - activating and starting backend
    start "SkyGuard Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && venv\Scripts\activate.bat && python run.py"
) else (
    echo No virtualenv found - starting backend with system Python
    start "SkyGuard Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && python run.py"
)

REM Give backend a moment to initialize
timeout /t 2 /nobreak >nul

REM Start Frontend in a new window (install deps if needed)
echo [Frontend] Starting Vite dev server (will install deps if needed)...
start "SkyGuard Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm install --no-audit --no-fund && npm run dev"

echo.
echo Dev servers are starting in separate windows.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Close the opened windows to stop the servers.
pause
