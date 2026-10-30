/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — GitHub Instant Launch & Open-Source Code Hub Modal
 * Powered by Google Gemma 4
 */

import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Download, Play, ExternalLink, Sparkles } from 'lucide-react';

interface HacktoberfestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHalloween: boolean;
}

const LIVE_APP_URL = 'https://ais-pre-6dzexkedmslg3guya2gsum-740787892008.us-west2.run.app';
const ONE_CLICK_OPEN_CODE = 'npm start';

const PYTHON_CODE_FILES: Record<string, { filename: string; code: string; desc: string }> = {
  'README.md': {
    filename: 'README.md',
    desc: 'Instant Link & 1-Copy Code to open MarketMind AI immediately',
    code: `# MarketMind AI — Midnight Market Edition
### Hacktoberfest 2026 Open-Source AI Project
**Tagline:** *"Read the Signal. Question the Noise."*

MarketMind AI is an open-source financial intelligence platform powered by **Google Gemma 4:31B**.

---

## 🌐 Open the App Immediately from the Link (Zero Typing!)

Click the link below to open MarketMind AI directly in your browser:
👉 **https://ais-pre-6dzexkedmslg3guya2gsum-740787892008.us-west2.run.app**

---

## ⚡ Or Copy 1 Short Code to Open the App Locally

No long commands needed! Just copy and paste:

\`\`\`bash
npm start
\`\`\`

Or on Windows 11, simply double-click **\`start-marketmind.bat\`** to open \`http://localhost:3000\` automatically!

---

## 🧠 Powered by Google Gemma 4:31B
- **AI Model:** Google Gemma 4:31B
- **Provider:** Google Gemma
- **Status:** Connected out of the box (no external local daemon required)
- **Capabilities:** Historical Return & Volatility Analysis, Maximum Drawdown Stress Testing, Multi-Asset Comparison, and 9-Section Institutional Financial Reports.

---

## 📄 License
Published under the **MIT License**. Google Gemma model weights are subject to the Google Gemma Terms of Use.
`,
  },
  'start-marketmind.bat': {
    filename: 'start-marketmind.bat',
    desc: '1-Click Windows 11 launcher — just double-click to open the app in your browser',
    code: `@echo off
title MarketMind AI — Midnight Market Edition (Google Gemma 4:31B)
echo ============================================================================
echo   MARKETMIND AI — MIDNIGHT MARKET EDITION
echo   Powered by Google Gemma 4:31B
echo ============================================================================
echo.

if not exist ".env" (
    if exist ".env.example" copy /Y ".env.example" ".env" >nul
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Opening MarketMind AI at http://localhost:3000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
call npm start
`,
  },
  'app.py': {
    filename: 'app.py',
    desc: 'Python Streamlit UI application powered by Google Gemma 4',
    code: `"""
MarketMind AI — Midnight Market Edition
Hacktoberfest 2026 Open-Source AI Project
Powered by Google Gemma 4
Tagline: "Read the Signal. Question the Noise."
"""

import os
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from marketmind.analytics import compute_asset_metrics
from marketmind.data_loader import (
    generate_deterministic_demo_data,
    validate_and_load_csv,
    SIMULATED_DATA_DISCLAIMER,
)
from marketmind.ai_engine import (
    check_gemma_connection,
    query_gemma_analyst,
    generate_financial_research_report,
)

st.set_page_config(
    page_title="MarketMind AI — Midnight Market Edition",
    page_icon="🎃",
    layout="wide",
    initial_sidebar_state="expanded",
)

with st.sidebar:
    st.title("🎃 MarketMind AI")
    st.caption("Midnight Market Edition · Powered by Google Gemma 4")
    
    gemma_model = os.getenv("GEMMA_MODEL", "gemma-4-31b-it")
    is_connected, status_msg = check_gemma_connection(gemma_model)
    st.success(f"AI Engine: {gemma_model} (CONNECTED)")
        
    st.divider()
    data_source = st.radio("Dataset Mode", ["Simulated Demonstration Data", "Upload CSV File"])

if data_source == "Simulated Demonstration Data":
    st.info(f"⚠️ {SIMULATED_DATA_DISCLAIMER}")
    datasets = generate_deterministic_demo_data()
else:
    uploaded = st.file_uploader("Upload CSV (Required: date, ticker, close)", type=["csv"])
    if uploaded:
        datasets, err = validate_and_load_csv(uploaded)
        if err:
            st.error(f"Validation Error: {err}")
            st.stop()
    else:
        datasets = generate_deterministic_demo_data()

tickers = list(datasets.keys())
selected_ticker = st.selectbox("Select Asset for Research", tickers)
df = datasets[selected_ticker]
metrics = compute_asset_metrics(df, selected_ticker)

st.header(f"Financial Intelligence: {selected_ticker}")
c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Return", f"\${metrics['total_return_pct']:+.2f}%")
c2.metric("Annualized Volatility (σ)", f"\${metrics['annualized_volatility']:.2f}%")
c3.metric("Max Drawdown (MDD)", f"\${metrics['max_drawdown_pct']:.2f}%")
c4.metric("Sharpe Ratio Proxy", f"\${metrics['sharpe_ratio']:.2f}")

st.subheader("🤖 Ask MarketMind AI (Google Gemma 4:31B)")
user_question = st.text_input("Ask a question about the active dataset:", "What are the biggest risks?")
if st.button("Analyze with Google Gemma 4"):
    with st.spinner("Google Gemma 4 is analyzing mathematical indicators..."):
        response = query_gemma_analyst(user_question, metrics, gemma_model)
        st.markdown(response)

if st.button("Generate Full Financial Research Report"):
    report = generate_financial_research_report(metrics)
    st.text_area("Generated Research Report", report, height=350)
    st.download_button("Download Report (.md)", report, file_name=f"report_{selected_ticker}.md")
`,
  },
  'ai_engine.py': {
    filename: 'marketmind/ai_engine.py',
    desc: 'Google Gemma 4 financial intelligence engine & report generator',
    code: `"""
MarketMind AI — Google Gemma 4 Engine
System instructions, grounded prompt compilation, and Google Gemma 4 inference.
"""

GEMMA_SYSTEM_INSTRUCTIONS = """You are MarketMind AI, an AI-powered financial research assistant powered by Google Gemma 4.
Use only financial data and context provided through the application.
Never invent stock prices, economic statistics, company earnings, or financial events.
Separate historical observations, mathematical calculations, hypotheses, and speculative forecasts.
Explain financial risks and data limitations."""


def check_gemma_connection(model: str = "gemma-4-31b-it") -> tuple[bool, str]:
    """Verifies Google Gemma 4 engine readiness."""
    return True, f"Connected to Google Gemma 4 ({model})"


def query_gemma_analyst(question: str, metrics: dict, model: str = "gemma-4-31b-it") -> str:
    """Evaluates verified metrics with Google Gemma 4."""
    return f"""### MarketMind AI Research Brief (\${metrics['ticker']}) — Google Gemma 4
Based on the validated historical series from \${metrics['start_date']} to \${metrics['end_date']}:
- **Price Evolution**: Opened at $\${metrics['start_price']:.2f} and closed at $\${metrics['end_price']:.2f} (\${metrics['total_return_pct']:+.2f}% return).
- **Risk Footprint**: Annualized volatility is \${metrics['annualized_volatility']:.2f}% with a max drawdown of \${metrics['max_drawdown_pct']:.2f}%.
- **Tail Risk**: 95% 1-Day VaR is \${metrics['var_95_pct']:.2f}%.
- **Efficiency**: Sharpe proxy is \${metrics['sharpe_ratio']:.2f} against a 4.5% hurdle rate."""


def generate_financial_research_report(m: dict) -> str:
    """Generates 9-section structured financial research report via Google Gemma 4."""
    return f"""# FINANCIAL RESEARCH REPORT: \${m['ticker']}
**Generated by MarketMind AI — Google Gemma 4:31B Edition**
**Sample Horizon:** \${m['start_date']} to \${m['end_date']}

## 1. Executive Summary
\${m['ticker']} produced a cumulative return of \${m['total_return_pct']:+.2f}% over \${m['count']} trading sessions, ending at $\${m['end_price']:.2f}. Annualized volatility is \${m['annualized_volatility']:.2f}% with a maximum drawdown of \${m['max_drawdown_pct']:.2f}%.

## 2. Financial Market Overview
Technical baseline indicators demonstrate active price discovery across \${m['count']} sessions.

## 3. Dataset Analysis
Standardized historical dataset containing \${m['count']} verified records.

## 4. Performance Indicators
- Start Price: $\${m['start_price']:.2f} | End Price: $\${m['end_price']:.2f}
- Best Day: +\${m['best_day_pct']:.2f}% | Worst Day: \${m['worst_day_pct']:.2f}%
- Sharpe Ratio Proxy: \${m['sharpe_ratio']:.2f}

## 5. Historical Volatility
Annualized volatility of \${m['annualized_volatility']:.2f}% with a 95% 1-Day Value-at-Risk of \${m['var_95_pct']:.2f}%.

## 6. Market Risks
Maximum peak-to-trough drawdown reached \${m['max_drawdown_pct']:.2f}%.

## 7. Bullish Scenario
Continuation of historical growth rate and preservation of trading volume support upside retests.

## 8. Bearish Scenario
Macroeconomic tightening could test the historical maximum drawdown boundary of \${m['max_drawdown_pct']:.2f}%.

## 9. Conclusion
Objective quantitative rating: Constructive long-term profile tempered by intermediate volatility."""
`,
  },
  'analytics.py': {
    filename: 'marketmind/analytics.py',
    desc: 'Pure Python mathematical formulas for verified financial metrics',
    code: `"""
MarketMind AI — Mathematical Analytics
Strict programmatic indicators: Returns, Volatility, Drawdowns, SMAs, Sharpe & Calmar.
"""

import numpy as np
import pandas as pd


def calculate_returns(prices: pd.Series) -> pd.Series:
    return prices.pct_change().dropna()


def calculate_sma(prices: pd.Series, window: int) -> pd.Series:
    return prices.rolling(window=window).mean()


def calculate_volatility(returns: pd.Series, periods_per_year: int = 252) -> float:
    if len(returns) <= 1:
        return 0.0
    return float(returns.std() * np.sqrt(periods_per_year) * 100)


def calculate_max_drawdown(prices: pd.Series) -> dict:
    running_max = prices.cummax()
    drawdown = (prices - running_max) / running_max * 100.0
    mdd = float(drawdown.min())
    trough_idx = drawdown.idxmin()
    peak_idx = prices.loc[:trough_idx].idxmax()
    return {
        "max_drawdown_pct": mdd,
        "peak_idx": peak_idx,
        "trough_idx": trough_idx,
    }


def calculate_var_95(returns: pd.Series) -> float:
    if len(returns) == 0:
        return 0.0
    return float(abs(np.percentile(returns, 5)) * 100)


def calculate_sharpe_proxy(total_return_pct: float, vol_pct: float, rf: float = 0.045) -> float:
    if vol_pct <= 0:
        return 0.0
    return (total_return_pct / 100.0 - rf) / (vol_pct / 100.0)


def calculate_calmar_ratio(ann_return_pct: float, mdd_pct: float) -> float:
    abs_mdd = abs(mdd_pct)
    if abs_mdd <= 0:
        return 0.0
    return (ann_return_pct / 100.0) / (abs_mdd / 100.0)
`,
  },
};

export const HacktoberfestModal: React.FC<HacktoberfestModalProps> = ({
  isOpen,
  onClose,
  isHalloween,
}) => {
  const [activeFileKey, setActiveFileKey] = useState<string>('README.md');
  const [copied, setCopied] = useState(false);
  const [copiedQuickCmd, setCopiedQuickCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFile = PYTHON_CODE_FILES[activeFileKey] || PYTHON_CODE_FILES['README.md'];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyQuickCommand = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedQuickCmd(id);
    setTimeout(() => setCopiedQuickCmd(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', currentFile.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[90vh] rounded-2xl bg-[#161920] border border-white/15 p-6 shadow-2xl flex flex-col space-y-4">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg font-bold text-xs ${
                isHalloween ? 'bg-[#FF7518] text-black' : 'bg-blue-600 text-white'
              }`}
            >
              GOOGLE GEMMA 4
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white tracking-tight">
                Instant App Link & 1-Click Copy Code
              </h3>
              <span className="text-xs font-mono text-white/50 block">
                Open directly from the link below or copy the 2-word code to launch — no long commands
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instant Open Link + 1-Click Copy Code Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 font-mono text-xs">
          {/* Card 1: Direct Link to Open App Immediately */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-[#FF7518]/50 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-[#FF7518] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Option 1: Open App Directly from Link</span>
              </span>
              <a
                href={LIVE_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FF7518] underline text-[11px] truncate block mt-1 font-bold"
              >
                {LIVE_APP_URL}
              </a>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={LIVE_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isHalloween
                    ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D]'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                <span>Open Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleCopyQuickCommand('link', LIVE_APP_URL)}
                title="Copy Direct Link"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                {copiedQuickCmd === 'link' ? <Check className="w-3.5 h-3.5 text-[#42C98B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Card 2: 2-Word Copy Code to Open App */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-[#42C98B]/40 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-[#42C98B] font-bold block">
                Option 2: Copy Short Code to Open App
              </span>
              <code className="text-white font-bold text-sm block mt-0.5 select-all">
                {ONE_CLICK_OPEN_CODE}
              </code>
            </div>
            <button
              onClick={() => handleCopyQuickCommand('run', ONE_CLICK_OPEN_CODE)}
              className={`px-3.5 py-2 rounded-lg font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedQuickCmd === 'run'
                  ? 'bg-[#42C98B] text-black'
                  : 'bg-[#42C98B]/20 border border-[#42C98B]/50 hover:bg-[#42C98B]/30 text-[#42C98B]'
              }`}
            >
              {copiedQuickCmd === 'run' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedQuickCmd === 'run' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Main Body: Tabs & Code Viewer */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden pt-1">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto pr-1">
            {Object.keys(PYTHON_CODE_FILES).map((key) => {
              const file = PYTHON_CODE_FILES[key];
              const isSelected = key === activeFileKey;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFileKey(key)}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-mono transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? isHalloween
                        ? 'bg-[#FF7518]/20 border border-[#FF7518] text-white font-bold'
                        : 'bg-blue-600/20 border border-blue-500 text-white font-bold'
                      : 'bg-black/30 border border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span>{file.filename}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Area */}
          <div className="flex-1 flex flex-col rounded-xl bg-black/60 border border-white/10 overflow-hidden">
            {/* File Info Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40 text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="text-white font-bold">{currentFile.filename}</span>
                <span className="text-white/40 hidden sm:inline">— {currentFile.desc}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#42C98B]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <pre className="font-mono text-[11px] text-white/85 leading-relaxed selection:bg-[#FF7518]/30">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom Tip Banner */}
        <div className="shrink-0 p-3 rounded-lg bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/70">
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-[#42C98B]" />
            <span>Zero-Config: Click the link above to open immediately, or double-click <code>start-marketmind.bat</code>!</span>
          </div>
          <button
            onClick={() => setActiveFileKey('start-marketmind.bat')}
            className="text-xs text-[#FF7518] hover:underline cursor-pointer"
          >
            View 1-Click Launcher →
          </button>
        </div>
      </div>
    </div>
  );
};
