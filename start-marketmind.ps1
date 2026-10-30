# MarketMind AI — One-Click PowerShell Launcher (Windows 11)
$ErrorActionPreference = "SilentlyContinue"
Write-Host "============================================================================" -ForegroundColor DarkYellow
Write-Host "  MARKETMIND AI — MIDNIGHT MARKET EDITION" -ForegroundColor White
Write-Host "  Powered by Google Gemma 4:31B Cloud & Ollama" -ForegroundColor Gray
Write-Host "============================================================================" -ForegroundColor DarkYellow

# 1. Create .env automatically if missing
if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Write-Host "[1/4] Creating .env configuration..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[1/4] .env configuration ready." -ForegroundColor Green
}

# 2. Install npm packages if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "[2/4] Installing Node.js packages..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "[2/4] Dependencies verified." -ForegroundColor Green
}

# 3. Verify Ollama connection
Write-Host "[3/4] Verifying Ollama service (http://127.0.0.1:11434)..." -ForegroundColor Cyan
try {
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2
    Write-Host "      Ollama daemon is active." -ForegroundColor Green
} catch {
    Write-Host "      Starting Ollama daemon in background..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# 4. Launch Browser and Server
Write-Host "[4/4] Opening http://localhost:3000 and starting MarketMind AI..." -ForegroundColor Green
Start-Job -ScriptBlock { Start-Sleep -Seconds 2; Start-Process "http://localhost:3000" } | Out-Null
npm run dev
