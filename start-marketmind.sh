#!/usr/bin/env bash
set -e

echo "============================================================================"
echo "  MARKETMIND AI — MIDNIGHT MARKET EDITION"
echo "  Powered by Google Gemma 4:31B Cloud & Ollama"
echo "============================================================================"

# 1. Create .env automatically if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "[1/4] Creating default .env configuration..."
  cp .env.example .env
else
  echo "[1/4] .env configuration ready."
fi

# 2. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "[2/4] Installing dependencies..."
  npm install
else
  echo "[2/4] Dependencies verified."
fi

# 3. Check Ollama
echo "[3/4] Checking Ollama at http://127.0.0.1:11434..."
if ! curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo "      Ollama not detected. Attempting to start ollama serve..."
  (ollama serve >/dev/null 2>&1 &) || true
  sleep 2
else
  echo "      Ollama is running."
fi

# 4. Open browser & start server
echo "[4/4] Starting MarketMind AI on http://localhost:3000 ..."
(sleep 2 && (xdg-open http://localhost:3000 >/dev/null 2>&1 || open http://localhost:3000 >/dev/null 2>&1 || true)) &
npm run dev
