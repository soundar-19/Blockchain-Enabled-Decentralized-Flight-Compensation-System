@echo off
REM Start Backend and Frontend simultaneously
REM This batch file opens both in separate windows

echo.
echo ================================================
echo  SkyGuard - Starting Backend + Frontend
echo ================================================
echo.

REM Get the directory where this batch file is located
set PROJECT_DIR=%~dp0

REM Start Backend in a new window
echo Starting Backend on http://localhost:5000...
start "SkyGuard Backend" cmd /k "cd /d "%PROJECT_DIR%backend" && python run_backend.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start Frontend in a new window
echo Starting Frontend on http://localhost:5173...
start "SkyGuard Frontend" cmd /k "cd /d "%PROJECT_DIR%frontend" && npm run dev"

echo.
echo ================================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ================================================
echo.
echo Two windows have opened - one for backend, one for frontend.
echo Close either window with Ctrl+C or the X button to stop that service.
echo.

pause
