# force-mock-mode.ps1 - Force MOCK mode in all environments
$ErrorActionPreference = 'Stop'

$rootDir = $PSScriptRoot | Split-Path -Parent

# Force MOCK mode in all possible env files
$envFiles = @(
    "$rootDir\frontend\.env",
    "$rootDir\frontend\.env.local",
    "$rootDir\frontend\.env.development",
    "$rootDir\frontend\.env.development.local"
)

$mockEnvContent = @"
REACT_APP_MODE=MOCK
REACT_APP_DEMO_DATA=true
REACT_APP_BACKEND_URL=http://127.0.0.1:8001
"@

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
        if ($content -notmatch "REACT_APP_MODE=MOCK") {
            $mockEnvContent + "`r`n" + $content | Out-File -FilePath $envFile -Encoding utf8
        }
    } else {
        $mockEnvContent | Out-File -FilePath $envFile -Encoding utf8
    }
}

Write-Host "✅ MOCK mode forced in all environment files" -ForegroundColor Green
Write-Host "Now run: .\scripts\start-mock.ps1" -ForegroundColor Yellow