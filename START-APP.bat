@echo off
echo ========================================
echo   VERISIGHT - Truth in Real Time
echo ========================================
echo.
echo Checking for existing processes...

REM Kill existing backend on port 8001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001') do taskkill /F /PID %%a 2>nul

REM Kill existing frontend on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul

echo.
echo Starting Backend and Frontend...
echo.

start "Verisight Backend" cmd /k "cd backend && python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 3 /nobreak >nul
start "Verisight Frontend" cmd /k "cd frontend && npm start"

echo.
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8001/docs
echo.
echo Press any key to exit...
pause >nul
