@echo off
echo Stopping Verisight...

REM Kill backend on port 8001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001') do (
    echo Stopping Backend (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Kill frontend on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Stopping Frontend (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

echo.
echo Verisight stopped.
pause
