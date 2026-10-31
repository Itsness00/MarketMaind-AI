# MarketMind AI — Institutional Financial Intelligence Platform
**Tagline:** *"Read the Signal. Question the Noise."*

MarketMind AI is an official open-source financial intelligence platform powered by **Google Gemma 4:31B**, featuring universal NYSE & NASDAQ equity coverage, real-time market session streaming when the market is open, and automated price & volume spike alerts.

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

## 📈 Primary Architecture — Powered by Google Gemma 4

### 1. Google Gemma 4:31B Financial Intelligence Engine
- **AI Provider:** Google Gemma
- **AI Model:** `Gemma 4:31B` (`gemma-4-31b-it`)
- **Connection Status:** Connected out of the box (no local daemon installation required)
- **Full-Stack Execution:** React 19 + Tailwind CSS frontend with a Node.js Express backend (`server.ts`).

### 2. Live Market Hours & Universal Stock Coverage
- **Live NYSE / NASDAQ Session Engine:** Automatically tracks US Eastern Time (`America/New_York`) for Regular Trading Hours (9:30 AM – 4:00 PM ET), Pre-Market (4:00 AM – 9:30 AM ET), After-Hours (4:00 PM – 8:00 PM ET), and Market Closed states, automatically streaming live market updates when the market is open.
- **Universal Stock Directory & Search:** Search and analyze any stock ticker in the market (`NVDA`, `MSFT`, `AAPL`, `GOOGL`, `AMZN`, `META`, `TSLA`, `AMD`, `LLY`, `JPM`, `BRK-B`, `COIN`, `PLTR`, `WMT`, `XOM`, or any custom symbol).

### 3. Node.js Backend API Endpoints
- `GET /api/health` — Reports active Google Gemma 4:31B availability (`connected: true`).
- `GET /api/market/status` — Real-time NYSE / NASDAQ session status in US Eastern Time.
- `GET /api/market/search` — Universal stock ticker & company search across all market sectors.
- `GET /api/market/history` — Live & 1-Year historical OHLCV series for any stock ticker symbol.
- `POST /api/analyze` — Receives validated financial statistics and user questions, formats the research context, and queries Google Gemma 4.
- `POST /api/report` — Compiles standardized 9-section institutional financial research reports using active metrics.
- `POST /api/chat` — Direct chat endpoint powered by Google Gemma 4.

### 4. Absolute Mathematical Grounding & Alert System
To prevent financial hallucination, all numerical indicators are calculated deterministically in application code before submission to Google Gemma 4:
- Daily percentage returns & cumulative total returns
- Annualized historical volatility ($\sigma \times \sqrt{252}$)
- Peak-to-trough Maximum Drawdown (MDD) with exact dates
- 1-Day 95% Historical Value-at-Risk (VaR)
- Sharpe Ratio proxy (4.5% risk-free rate) & Calmar Ratio
- Simple Moving Averages: SMA 20, SMA 50, SMA 200
- Real-Time Price & Volume Spike Alert Thresholds with Visual Screen Notifications

---

## 🧪 Testing Instructions
```bash
npm test
```

---

## 📄 License

Original application code is published under the **MIT License**. Google Gemma model weights are subject to the separate Google Gemma Terms of Use.
