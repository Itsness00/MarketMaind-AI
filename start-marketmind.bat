@echo off
title MarketMind AI — Midnight Market Edition (Google Gemma 4:31B)
echo ============================================================================
echo   MARKETMIND AI — MIDNIGHT MARKET EDITION
echo   Hacktoberfest 2026 Open-Source AI Project
echo   Powered by Google Gemma 4:31B
echo ============================================================================
echo.

REM 1. Automatically create .env from .env.example if missing
if not exist ".env" (
    if exist ".env.example" (
        echo [1/3] Creating default .env configuration...
        copy /Y ".env.example" ".env" >nul
    )
) else (
    echo [1/3] .env configuration ready.
)

REM 2. Automatically install Node.js dependencies if node_modules is missing
if not exist "node_modules" (
    echo [2/3] Installing dependencies (first-time setup)...
    call npm install
) else (
    echo [2/3] Dependencies verified.
)

REM 3. Open browser to http://localhost:3000 after 2 seconds and start server
echo [3/3] Launching MarketMind AI (Google Gemma 4) on http://localhost:3000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
call npm start
pause
