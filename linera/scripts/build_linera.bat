@echo off
echo Building Linera Contracts...

REM Check if Rust is installed
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo Cargo not found. Please install Rust: https://rustup.rs/
    exit /b 1
)

REM Check if wasm32 target is installed
rustup target list | findstr "wasm32-unknown-unknown (installed)" >nul
if %errorlevel% neq 0 (
    echo Installing wasm32-unknown-unknown target...
    rustup target add wasm32-unknown-unknown
)

REM Navigate to linera directory
cd /d "%~dp0\.."

echo Building oracle_feed contract...
cargo build --release --target wasm32-unknown-unknown -p oracle_feed

echo Building market contract...
cargo build --release --target wasm32-unknown-unknown -p market

echo.
echo Build complete!
echo.
echo WASM files location:
echo   - oracle_feed: target\wasm32-unknown-unknown\release\oracle_feed.wasm
echo   - market: target\wasm32-unknown-unknown\release\market.wasm
echo.
pause
