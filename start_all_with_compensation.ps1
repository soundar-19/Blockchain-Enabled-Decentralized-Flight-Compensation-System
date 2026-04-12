#!/usr/bin/env pwsh
<#
.SYNOPSIS
    SkyGuard DAO Flight Compensation System - Complete Startup Script
    
.DESCRIPTION
    Starts both the Flask backend API and React frontend development server
    
.NOTES
    Requires: Python 3.8+, Node.js 16+, MongoDB running
#>

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SkyGuard DAO - Flight Compensation System" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

function Start-Service {
    param([string]$Name, [string]$Path, [string]$Command)
    
    Write-Host "Starting $Name..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command `"Set-Location '$Path'; & '$Command'`""
    Write-Host "✓ $Name started in new window" -ForegroundColor Green
}

# Check Python
Write-Host "Checking Python installation..."
if (-not (Test-Command python)) {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Python found" -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js installation..."
if (-not (Test-Command node)) {
    Write-Host "❌ Node.js not found! Please install Node.js 16+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Node.js found" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Backend Configuration" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$backendEnvPath = "backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "⚠ WARNING: backend\.env not found" -ForegroundColor Yellow
    Write-Host "Please create backend\.env based on backend\.env.example" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "Installing backend dependencies..."
Push-Location backend
try {
    python -m pip install -q -r requirements.txt
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Frontend Configuration" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$frontendEnvPath = "frontend\.env"
if (-not (Test-Path $frontendEnvPath)) {
    Write-Host "⚠ WARNING: frontend\.env not found" -ForegroundColor Yellow
    Write-Host "Please create frontend\.env based on frontend\.env.example" -ForegroundColor Yellow
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies (may take a minute)..."
Push-Location frontend
try {
    npm install --silent 2>&1 | Out-Null
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting Services" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
$backendPath = Resolve-Path "backend"
Start-Service "Flask Backend" $backendPath "python run.py"

Start-Sleep -Seconds 3

# Start Frontend
$frontendPath = Resolve-Path "frontend"
Start-Service "React Frontend" $frontendPath "npm run dev"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✨ All Services Started!" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services should open automatically in new windows." -ForegroundColor Green
Write-Host "If they don't, use the URLs above." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
