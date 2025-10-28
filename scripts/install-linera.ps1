# Install Linera CLI for Windows
# Usage: .\scripts\install-linera.ps1

Write-Host "`n=== Linera CLI Installation ===" -ForegroundColor Cyan

# Check if cargo is available
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Rust/Cargo not found. Install from https://rustup.rs" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Installing Linera CLI via cargo..." -ForegroundColor Yellow
Write-Host "[INFO] This may take 5-10 minutes..." -ForegroundColor Yellow

try {
    cargo install linera-service --locked
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[OK] Linera CLI installed successfully!" -ForegroundColor Green
        Write-Host "[INFO] Verify with: linera --version" -ForegroundColor Cyan
        
        # Add cargo bin to PATH for current session
        $cargoPath = "$env:USERPROFILE\.cargo\bin"
        if ($env:PATH -notlike "*$cargoPath*") {
            $env:PATH = "$cargoPath;$env:PATH"
            Write-Host "[INFO] Added $cargoPath to PATH (current session)" -ForegroundColor Yellow
        }
        
        # Test installation
        Write-Host "`n[TEST] Running linera --version..." -ForegroundColor Cyan
        & "$cargoPath\linera.exe" --version
        
    } else {
        Write-Host "[ERROR] Installation failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Installation failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n[NEXT] Run .\scripts\dev-check.ps1 to validate setup" -ForegroundColor Green
