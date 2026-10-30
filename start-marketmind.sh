#!/usr/bin/env bash
set -e

echo "============================================================================"
echo "  MARKETMIND AI — MIDNIGHT MARKET EDITION"
echo "  Powered by Google Gemma 4:31B"
echo "============================================================================"

# 1. Create .env automatically if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "[1/3] Creating default .env configuration..."
  cp .env.example .env
else
  echo "[1/3] .env configuration ready."
fi

# 2. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "[2/3] Installing dependencies..."
  npm install
else
  echo "[2/3] Dependencies verified."
fi

# 3. Open browser & start server
echo "[3/3] Starting MarketMind AI (Google Gemma 4) on http://localhost:3000 ..."
(sleep 2 && (xdg-open http://localhost:3000 >/dev/null 2>&1 || open http://localhost:3000 >/dev/null 2>&1 || true)) &
npm start
