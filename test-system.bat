@echo off
echo ========================================
echo   VERISIGHT SYSTEM TEST
echo ========================================
echo.

echo [1/5] Checking MongoDB...
tasklist | findstr mongod >nul
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is NOT running
    echo    Please start MongoDB first
)
echo.

echo [2/5] Testing Backend Dependencies...
cd backend
python -c "import fastapi, motor, jose; print('✅ Backend dependencies OK')" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies missing
    echo    Run: pip install -r requirements.txt
)
echo.

echo [3/5] Testing AI Agents...
python -c "from ai_agents.event_detector import EventDetectorAgent; from ai_agents.source_verifier import SourceVerifierAgent; from ai_agents.confidence_scorer import ConfidenceScorerAgent; from ai_agents.summary_composer import SummaryComposerAgent; print('✅ AI Agents OK')" 2>nul
if %errorlevel% neq 0 (
    echo ❌ AI Agents import failed
)
echo.

echo [4/5] Testing Backend Server...
python -c "import server; print('✅ Server imports OK')" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Server import failed
)
echo.

echo [5/5] Testing Backend API...
cd ..
curl -s http://localhost:8001/api/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API is responding
    curl -s http://localhost:8001/api/ | findstr "Verisight"
) else (
    echo ⚠️  Backend API not running
    echo    Start with: START-APP.bat
)
echo.

echo [6/6] Checking Frontend...
cd frontend
if exist node_modules (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies missing
    echo    Run: npm install --legacy-peer-deps
)
cd ..
echo.

echo ========================================
echo   TEST COMPLETE
echo ========================================
echo.
echo To start the application:
echo   Double-click START-APP.bat
echo.
pause
