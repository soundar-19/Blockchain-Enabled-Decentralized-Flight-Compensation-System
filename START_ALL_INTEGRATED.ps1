#!/usr/bin/env pwsh
# ============================================================
# SkyGuard DAO - Complete Integration Startup (PowerShell)
# ============================================================
# This script starts both backend and frontend services
# ============================================================

Write-Host "`n" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SkyGuard DAO - Full Integration Startup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Start Backend (Flask) on port 5000" -ForegroundColor White
Write-Host "  2. Start Frontend (React) on port 5177" -ForegroundColor White
Write-Host "  3. Open browser to http://localhost:5177" -ForegroundColor White
Write-Host ""

$workspace = "d:\Blockchain_Enabled_Flight_Compensation_System"

# Check directories exist
if (-not (Test-Path "$workspace\backend")) {
    Write-Host "ERROR: Backend directory not found at $workspace\backend" -ForegroundColor Red
    Read-Host "Press ENTER to exit"
    Exit 1
}

if (-not (Test-Path "$workspace\frontend")) {
    Write-Host "ERROR: Frontend directory not found at $workspace\frontend" -ForegroundColor Red
    Read-Host "Press ENTER to exit"
    Exit 1
}

Write-Host "Press ENTER to continue, or CTRL+C to cancel..." -ForegroundColor Yellow
Read-Host ""

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting Backend (Flask)..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Start backend
$backendProcess = Start-Process -FilePath "python.exe" -ArgumentList "run.py" -WorkingDirectory "$workspace\backend" -PassThru -NoNewWindow

Write-Host "Backend started with PID: $($backendProcess.Id)" -ForegroundColor Green
Write-Host "Waiting 3 seconds before starting frontend..." -ForegroundColor Yellow

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting Frontend (React + Vite)..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Start frontend
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$workspace\frontend" -PassThru -NoNewWindow

Write-Host "Frontend started with PID: $($frontendProcess.Id)" -ForegroundColor Green
Write-Host "Waiting 3 seconds before opening browser..." -ForegroundColor Yellow

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Services Starting!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend:  " -ForegroundColor White -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Green

Write-Host "Frontend: " -ForegroundColor White -NoNewline
Write-Host "http://localhost:5177" -ForegroundColor Green

Write-Host "API:      " -ForegroundColor White -NoNewline
Write-Host "http://localhost:5000/api" -ForegroundColor Green

Write-Host ""
Write-Host "Opening browser to http://localhost:5177..." -ForegroundColor Yellow
Write-Host ""

# Open browser
Start-Process "http://localhost:5177"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Both services are starting!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "  1. Close each terminal window" -ForegroundColor White
Write-Host "  2. Or press CTRL+C in each terminal" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - QUICK_REFERENCE.md - Quick start guide" -ForegroundColor White
Write-Host "  - FULL_INTEGRATION_GUIDE.md - Complete manual" -ForegroundColor White
Write-Host "  - DATA_FLOW_ARCHITECTURE.md - System design" -ForegroundColor White
Write-Host ""

Write-Host "Keep this window open to see logs..." -ForegroundColor Green
Write-Host ""

# Wait for processes
$backendProcess | Wait-Process
$frontendProcess | Wait-Process

Write-Host ""
Write-Host "Services have stopped." -ForegroundColor Yellow
