# MarketMind AI — One-Click PowerShell Launcher (Windows 11)
$ErrorActionPreference = "SilentlyContinue"
Write-Host "============================================================================" -ForegroundColor DarkYellow
Write-Host "  MARKETMIND AI — MIDNIGHT MARKET EDITION" -ForegroundColor White
Write-Host "  Powered by Google Gemma 4:31B" -ForegroundColor Gray
Write-Host "============================================================================" -ForegroundColor DarkYellow

# 1. Create .env automatically if missing
if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Write-Host "[1/3] Creating .env configuration..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[1/3] .env configuration ready." -ForegroundColor Green
}

# 2. Install npm packages if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "[2/3] Installing Node.js packages..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "[2/3] Dependencies verified." -ForegroundColor Green
}

# 3. Launch Browser and Server
Write-Host "[3/3] Opening http://localhost:3000 and starting MarketMind AI (Google Gemma 4)..." -ForegroundColor Green
Start-Job -ScriptBlock { Start-Sleep -Seconds 2; Start-Process "http://localhost:3000" } | Out-Null
npm start
