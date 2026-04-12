@echo off
REM SkyGuard DAO - Start Both Backend and Frontend

echo ========================================
echo   SkyGuard DAO - Complete Startup
echo ========================================
echo.
echo This script will start both the Backend and Frontend servers
echo.
echo Backend will run on:  http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.
pause

REM Get the directory where this script is located
setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

REM Start Backend in a new window
echo [Starting Backend...]
start "SkyGuard DAO - Backend" cmd /k "cd /d %SCRIPT_DIR% && call start_backend.bat"

REM Wait a few seconds for backend to start
echo [Waiting for backend to initialize...]
timeout /t 3 /nobreak

REM Start Frontend in a new window
echo [Starting Frontend...]
start "SkyGuard DAO - Frontend" cmd /k "cd /d %SCRIPT_DIR% && call start_frontend.bat"

echo.
echo ========================================
echo Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Check the opened windows for any errors.
echo Close the windows to stop the servers.
echo.
pause
