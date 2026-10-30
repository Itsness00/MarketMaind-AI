@echo off
title MarketMind AI — Midnight Market Edition (Gemma 4:31B Cloud)
echo ============================================================================
echo   MARKETMIND AI — MIDNIGHT MARKET EDITION
echo   Hacktoberfest 2026 Open-Source AI Project
echo   Powered by Google Gemma 4:31B Cloud and Ollama
echo ============================================================================
echo.

REM 1. Automatically create .env from .env.example if missing
if not exist ".env" (
    if exist ".env.example" (
        echo [1/4] Creating default .env configuration...
        copy /Y ".env.example" ".env" >nul
    )
) else (
    echo [1/4] .env configuration already exists.
)

REM 2. Automatically install Node.js dependencies if node_modules is missing
if not exist "node_modules" (
    echo [2/4] Installing dependencies (first-time setup)...
    call npm install
) else (
    echo [2/4] Dependencies verified.
)

REM 3. Ensure Ollama is running & warm up gemma4:31b-cloud
echo [3/4] Checking Ollama service at http://127.0.0.1:11434...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo       Ollama daemon not detected. Attempting to launch Ollama...
    start "" ollama serve >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    echo       Ollama is online and ready.
)

REM 4. Open browser to http://localhost:3000 after 2 seconds and start server
echo [4/4] Launching MarketMind AI on http://localhost:3000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
call npm run dev
pause
