# MarketMind AI — Midnight Market Edition
### Hacktoberfest 2026 Open-Source AI Project
**Tagline:** *"Read the Signal. Question the Noise."*

MarketMind AI is an open-source financial intelligence assistant engineered to help analysts, students, and researchers evaluate financial market series, compute mathematical risk indicators, and generate structured AI research memoranda using **Google Gemma 4** and **Ollama**.

---

## 🎃 What Problem MarketMind AI Solves
Financial data analysis is often fragmented: spreadsheet calculations lack natural language synthesis, while generic LLMs hallucinate inaccurate stock prices and fake percentages.

MarketMind AI decouples calculation from narrative:
1. **Deterministic Calculation:** All returns, SMAs, volatility, max drawdowns, and Value-at-Risk are computed with explicit mathematical formulas.
2. **Grounded AI Synthesis:** Verified metrics are injected into Google Gemma 4 via Ollama using a disciplined financial research analyst persona.
3. **Zero Financial Hallucination:** The model interprets verified data rather than guessing stock numbers.

---

## 🚀 Quickstart Guide (Windows 11 / Linux / macOS)

### 1. Prerequisites
- **Python 3.11+** installed
- **Ollama** installed: [ollama.com](https://ollama.com)

### 2. Pull the Gemma 4 Model
Open PowerShell or Terminal:
```bash
ollama run gemma4:e4b
```
*(Ollama will automatically download and start the Google Gemma 4 E4B weights at `http://127.0.0.1:11434`)*

### 3. Clone and Install Dependencies
```bash
git clone https://github.com/marketmind-ai/marketmind-ai.git
cd marketmind-ai

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows
# or: source venv/bin/activate  # On Linux/macOS

pip install -r requirements.txt
```

### 4. Run Tests
```bash
pytest tests/
```

### 5. Launch Application
```bash
streamlit run app.py
```

---

## ⏱️ 2-Minute Hackathon Demonstration Script
1. **0:00 - 0:30 (The Signal vs. Noise):** Open MarketMind AI. Highlight the Midnight Market Japanese minimalist aesthetic. Show the live **AI ENGINE: GEMMA 4** connection indicator.
2. **0:30 - 1:00 (Mathematical Grounding):** Switch between NVDA and SPY. Inspect the Candlestick chart with SMA 20/50 overlays. Show that every return and drawdown metric is computed directly from raw CSV data.
3. **1:00 - 1:30 (Gemma 4 in Action):** Ask Gemma 4: *"What are the biggest risks in this dataset?"* Expand the Context Drawer to show that Gemma receives verified numbers, eliminating hallucination.
4. **1:30 - 2:00 (Institutional Deliverable):** Generate the 9-Section Structured Financial Research Report and download as Markdown with one click.

---

## 📄 License
Published under the **MIT License**. Google Gemma model weights are subject to the Gemma Terms of Use.
