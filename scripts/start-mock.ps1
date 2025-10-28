# start-mock.ps1 - Quick start mock mode
$ErrorActionPreference = 'Stop'

Write-Host "`n=== Verisight Mock Mode ===" -ForegroundColor Cyan
Write-Host "Starting backend + frontend (mock mode)...`n" -ForegroundColor Yellow

# Set env
$rootDir = $PSScriptRoot | Split-Path -Parent
$envPath = "$rootDir\frontend\.env.local"
"REACT_APP_MODE=MOCK`nREACT_APP_DEMO_DATA=true`nREACT_APP_BACKEND_URL=http://127.0.0.1:8001" | Out-File -FilePath $envPath -Encoding utf8
Write-Host "[ENV] REACT_APP_MODE=MOCK" -ForegroundColor Cyan
Write-Host "[ENV] REACT_APP_DEMO_DATA=true" -ForegroundColor Cyan
Write-Host "[ENV] REACT_APP_BACKEND_URL=http://127.0.0.1:8001" -ForegroundColor Cyan

# Seed fixtures
Push-Location "$rootDir\frontend"
npm run mock:seed 2>&1 | Out-Null
Pop-Location

# Switch to mock mode
& "$PSScriptRoot\toggle-mode.ps1" -Mode mock

# Start backend in new window
$backendDir = Join-Path $PSScriptRoot '..\backend'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; `$env:ENV='development'; python -m uvicorn server:app --host 127.0.0.1 --port 8001 --reload"

Start-Sleep -Seconds 2

# Start frontend in new window
$frontendDir = Join-Path $PSScriptRoot '..\frontend'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm start"

Write-Host "`n[OK] Services starting..." -ForegroundColor Green
Write-Host "Backend: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Press Ctrl+C in each window to stop" -ForegroundColor Yellow
