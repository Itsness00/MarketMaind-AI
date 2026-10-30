# MarketMind AI — Midnight Market Edition
### Hacktoberfest 2026 Open-Source AI Project
**Tagline:** *"Read the Signal. Question the Noise."*

MarketMind AI is an open-source financial intelligence platform powered by **Google Gemma 4:31B**.

---

## 🌐 Open the App Immediately from the Link (Zero Typing!)

Just click the link below to open MarketMind AI directly in your browser without typing any commands:

### 👉 [https://ais-pre-6dzexkedmslg3guya2gsum-740787892008.us-west2.run.app](https://ais-pre-6dzexkedmslg3guya2gsum-740787892008.us-west2.run.app)

---

## ⚡ Or Copy 1 Short Code to Open the App Locally

If you downloaded the project, you do **not** need to type long setup commands.

### Option A: Copy 2 Words in Terminal
```bash
npm start
```
*(Or click `http://localhost:3000`)*

### Option B: Double-Click Launcher (Windows 11)
Simply **double-click `start-marketmind.bat`** in the project folder! It automatically configures `.env`, installs packages if needed, and opens `http://localhost:3000` in your browser.

---

## 🎃 Primary Architecture — Powered by Google Gemma 4

### 1. Google Gemma 4:31B Financial Intelligence Engine
- **AI Provider:** Google Gemma
- **AI Model:** `Gemma 4:31B` (`gemma-4-31b-it`)
- **Connection Status:** Connected out of the box (no local daemon installation required)
- **Full-Stack Execution:** React 19 + Tailwind CSS frontend with a Node.js Express backend (`server.ts`).

### 2. Node.js Backend API Endpoints
- `GET /api/health` — Reports active Google Gemma 4:31B availability (`connected: true`).
- `POST /api/analyze` — Receives validated financial statistics and user questions, formats the research context, and queries Google Gemma 4.
- `POST /api/report` — Compiles standardized 9-section institutional financial research reports using active metrics.
- `POST /api/chat` — Direct chat endpoint powered by Google Gemma 4.

### 3. Absolute Mathematical Grounding
To prevent financial hallucination, all numerical indicators are calculated deterministically in application code before submission to Google Gemma 4:
- Daily percentage returns & cumulative total returns
- Annualized historical volatility ($\sigma \times \sqrt{252}$)
- Peak-to-trough Maximum Drawdown (MDD) with exact dates
- 1-Day 95% Historical Value-at-Risk (VaR)
- Sharpe Ratio proxy (4.5% risk-free rate) & Calmar Ratio
- Simple Moving Averages: SMA 20, SMA 50, SMA 200

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
