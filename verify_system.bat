@echo off
echo ========================================
echo   SkyGuard DAO - System Verification
echo ========================================
echo.

set ERROR_COUNT=0

echo [1/10] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Python is not installed or not in PATH
    set /a ERROR_COUNT+=1
) else (
    python --version
    echo [PASS] Python is installed
)
echo.

echo [2/10] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Node.js is not installed or not in PATH
    set /a ERROR_COUNT+=1
) else (
    node --version
    echo [PASS] Node.js is installed
)
echo.

echo [3/10] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] npm is not installed or not in PATH
    set /a ERROR_COUNT+=1
) else (
    npm --version
    echo [PASS] npm is installed
)
echo.

echo [4/10] Checking backend directory structure...
if exist "backend\api\app.py" (
    echo [PASS] Backend API found
) else (
    echo [FAIL] Backend API not found
    set /a ERROR_COUNT+=1
)
echo.

echo [5/10] Checking blockchain implementation...
if exist "backend\blockchain\blockchain.py" (
    echo [PASS] Blockchain implementation found
) else (
    echo [FAIL] Blockchain implementation not found
    set /a ERROR_COUNT+=1
)
echo.

echo [6/10] Checking smart contracts...
if exist "backend\blockchain\smart_contracts.py" (
    echo [PASS] Smart contracts found
) else (
    echo [FAIL] Smart contracts not found
    set /a ERROR_COUNT+=1
)
echo.

echo [7/10] Checking frontend structure...
if exist "frontend\src\App.jsx" (
    echo [PASS] Frontend App component found
) else (
    echo [FAIL] Frontend App component not found
    set /a ERROR_COUNT+=1
)
echo.

echo [8/10] Checking frontend configuration...
if exist "frontend\package.json" (
    echo [PASS] package.json found
) else (
    echo [FAIL] package.json not found
    set /a ERROR_COUNT+=1
)
if exist "frontend\vite.config.js" (
    echo [PASS] vite.config.js found
) else (
    echo [FAIL] vite.config.js not found
    set /a ERROR_COUNT+=1
)
echo.

echo [9/10] Checking Python dependencies file...
if exist "backend\requirements.txt" (
    echo [PASS] requirements.txt found
) else (
    echo [FAIL] requirements.txt not found
    set /a ERROR_COUNT+=1
)
echo.

echo [10/10] Checking scripts...
if exist "scripts\generate_dummy_data.py" (
    echo [PASS] Data generation script found
) else (
    echo [FAIL] Data generation script not found
    set /a ERROR_COUNT+=1
)
echo.

echo ========================================
echo   Verification Complete
echo ========================================
echo.

if %ERROR_COUNT%==0 (
    echo [SUCCESS] All checks passed! System is ready to run.
    echo.
    echo Next steps:
    echo 1. Run start_backend.bat in one terminal
    echo 2. Run start_frontend.bat in another terminal
    echo 3. Open http://localhost:5173 in your browser
) else (
    echo [WARNING] %ERROR_COUNT% check(s) failed.
    echo Please review the errors above and fix them before running.
)
echo.

pause
