# MarketMind AI — Midnight Market Edition
### Hacktoberfest 2026 Open-Source AI Project
**Tagline:** *"Read the Signal. Question the Noise."*

MarketMind AI is an open-source financial intelligence platform powered by **Google's Gemma 4:31B Cloud** model via **Ollama**.

---

## ⚡ 1-Click / 1-Line Instant Launch (Zero Long Commands!)

You do **not** need to type multiple setup commands. Just copy and paste **one single line** below, or double-click the launcher after downloading!

### Option A: One-Line Copy & Paste (Windows 11 PowerShell / CMD)
Copy and paste this single command to clone, install, and launch the app immediately:
```powershell
git clone https://github.com/marketmind-ai/marketmind-ai.git && cd marketmind-ai && start-marketmind.bat
```

### Option B: Already Downloaded / Exported ZIP?
1. Open the folder on your computer.
2. **Double-click `start-marketmind.bat`** (Windows) or run `./start-marketmind.sh` (Mac/Linux).
3. It automatically configures `.env`, installs packages, checks your local Ollama (`gemma4:31b-cloud`), and opens `http://localhost:3000` in your browser!

### Option C: Run Directly in Any Terminal (1 Short Command)
If you already have the folder open in VS Code or Terminal, just copy:
```bash
npm run launch
```
*(Then click `http://localhost:3000`)*

---

## 🎃 Primary Objectives & Architecture

### 1. Gemma 4:31B Cloud Integration via Ollama
- **AI Provider:** Ollama
- **AI Model:** `gemma4:31b-cloud` (Google Gemma 4:31B Cloud running through Ollama's authenticated cloud infrastructure)
- **Local Ollama Daemon:** `http://127.0.0.1:11434`
- **Chat Endpoint:** `POST /api/chat`
- **Full-Stack Execution:** React 19 + Tailwind CSS frontend with a Node.js Express backend proxying server-side requests to Ollama.
- **Zero Gemini API Dependency:** No external paid API keys or Gemini dependencies required for financial analysis after local deployment.

### 2. Node.js Backend API Endpoints
- `GET /api/health` — Verifies whether the Node.js backend can reach the local Ollama daemon and checks availability of `gemma4:31b-cloud`.
- `POST /api/analyze` — Receives validated financial statistics and user questions, formats the research context, and queries Gemma 4:31B Cloud.
- `POST /api/report` — Compiles standardized 9-section institutional financial research reports using active metrics.
- `POST /api/chat` — Direct chat endpoint interfacing with Ollama's native chat schema.

### 3. Absolute Mathematical Grounding
To prevent financial hallucination, all numerical indicators are calculated deterministically in application code before submission to Gemma:
- Daily percentage returns & cumulative total returns
- Annualized historical volatility ($\sigma \times \sqrt{252}$)
- Peak-to-trough Maximum Drawdown (MDD) with exact dates
- 1-Day 95% Historical Value-at-Risk (VaR)
- Sharpe Ratio proxy (4.5% risk-free rate) & Calmar Ratio
- Simple Moving Averages: SMA 20, SMA 50, SMA 200

---

## 💻 Prerequisites on Windows 11
- **Node.js 20+** installed
- **Ollama for Windows** installed from [ollama.com](https://ollama.com) with `gemma4:31b-cloud` authenticated (`ollama run gemma4:31b-cloud`)

---

## 🧪 Testing Instructions
```bash
npm test
```

---

## 📋 9-Section Financial Research Reports

MarketMind AI generates structured reports containing:
1. Executive Summary
2. Financial Market Overview
3. Dataset Analysis
4. Performance Indicators
5. Historical Volatility
6. Market Risks
7. Bullish Scenario
8. Bearish Scenario
9. Conclusion

---

## 📄 License

Original application code is published under the **MIT License**. Google Gemma model weights are subject to the separate Google Gemma Terms of Use.
