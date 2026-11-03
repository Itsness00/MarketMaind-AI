/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — AI Buy/Sell Alerts & Interactive Quantitative Analyst
 * Powered by Google Gemma 4:31B Cloud (Ollama) & Google Gemini 3.8 Flash
 */

import React, { useState, useMemo } from 'react';
import {
  AssetMetrics,
  GemmaConfig,
  ChatMessage,
  AIEngineSelection,
  PriceAlert,
} from '../types/market';
import { queryGemmaAnalyst } from '../utils/aiEngine';
import {
  INITIAL_GLOBAL_INSTRUMENTS,
  computeAITradingSignals,
  AITradingAlertSignal,
} from '../data/globalMarketsData';
import {
  Bell,
  Send,
  Bot,
  Sparkles,
  TrendingUp,
  TrendingDown,
  FileText,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface AIAnalystSectionProps {
  activeMetric: AssetMetrics;
  peerMetrics: AssetMetrics[];
  gemmaConfig: GemmaConfig;
  onNavigateToReport?: () => void;
  priceAlerts?: PriceAlert[];
  onAddPriceAlert?: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  onDeletePriceAlert?: (id: string) => void;
  onSelectTicker?: (ticker: string) => void;
}

const QUICK_AI_PROMPTS = [
  'Evaluate whether the active asset is a BUY or SELL based on SMA50/200, RSI, and Sharpe ratio.',
  'Which assets in our dataset show the strongest bullish risk-adjusted momentum?',
  'Identify the top downside tail-risks and stop-loss levels for the active asset.',
  'Compare historical volatility and maximum drawdown across the top performers.',
];

export const AIAnalystSection: React.FC<AIAnalystSectionProps> = ({
  activeMetric,
  peerMetrics,
  gemmaConfig,
  onNavigateToReport,
  priceAlerts = [],
  onAddPriceAlert,
  onDeletePriceAlert,
  onSelectTicker,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<AIEngineSelection>(
    gemmaConfig.selectedEngine || 'dual-gemma-gemini'
  );
  const [signalFilter, setSignalFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'HOLD'>('ALL');
  const [verifiedRationales, setVerifiedRationales] = useState<Record<string, string>>({});
  const [verifyingSignalId, setVerifyingSignalId] = useState<string | null>(null);

  // Custom Price Alert Form
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertPriceInput, setAlertPriceInput] = useState<string>(
    activeMetric ? (activeMetric.endPrice * 1.03).toFixed(2) : '200.00'
  );
  const [alertNoteInput, setAlertNoteInput] = useState<string>('AI Buy/Sell Breakout Trigger');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `MarketMind AI Signal & Research Desk initialized.\nActive Security: ${activeMetric.ticker} ($${activeMetric.endPrice.toFixed(2)}) · Total Return: ${activeMetric.totalReturnPct >= 0 ? '+' : ''}${activeMetric.totalReturnPct.toFixed(2)}% · Sharpe Ratio: ${activeMetric.sharpeRatio.toFixed(2)}.\n\nInspect the live Gemma 4 & Gemini Buy/Sell signals below, or submit any quantitative question.`,
      timestamp: new Date().toLocaleTimeString(),
      source: 'dual-ai',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allSummaries = useMemo(
    () => [activeMetric, ...peerMetrics].filter(Boolean),
    [activeMetric, peerMetrics]
  );

  const aiSignals = useMemo(
    () => computeAITradingSignals(INITIAL_GLOBAL_INSTRUMENTS, allSummaries),
    [allSummaries]
  );

  const filteredSignals = useMemo(() => {
    if (signalFilter === 'ALL') return aiSignals;
    if (signalFilter === 'BUY') {
      return aiSignals.filter((s) => s.action === 'STRONG BUY' || s.action === 'BUY');
    }
    if (signalFilter === 'SELL') {
      return aiSignals.filter((s) => s.action === 'STRONG SELL' || s.action === 'SELL');
    }
    return aiSignals.filter((s) => s.action === 'HOLD');
  }, [aiSignals, signalFilter]);

  const buyCount = aiSignals.filter((s) => s.action === 'STRONG BUY' || s.action === 'BUY').length;
  const sellCount = aiSignals.filter(
    (s) => s.action === 'STRONG SELL' || s.action === 'SELL'
  ).length;
  const holdCount = aiSignals.filter((s) => s.action === 'HOLD').length;

  const handleVerifySignalWithAI = async (sig: AITradingAlertSignal) => {
    setVerifyingSignalId(sig.id);
    try {
      const q = `Provide a concise 3-sentence institutional trade audit for ${sig.symbol} (${sig.name}). Current signal: ${sig.action} (${sig.confidencePct}% confidence), Price: $${sig.currentPrice}, Target: $${sig.targetPrice}, Stop-Loss: $${sig.stopLossPrice}, Risk/Reward: ${sig.riskRewardRatio}x, Trigger: ${sig.technicalTrigger}. Confirm key execution levels and primary risk factor.`;
      const result = await queryGemmaAnalyst(q, activeMetric, peerMetrics, [], selectedEngine);
      setVerifiedRationales((prev) => ({
        ...prev,
        [sig.id]: result.response,
      }));
    } catch (err: any) {
      setVerifiedRationales((prev) => ({
        ...prev,
        [sig.id]: `Gemma 4 / Gemini verification note: ${sig.quantThesis}`,
      }));
    } finally {
      setVerifyingSignalId(null);
    }
  };

  const handleSendQuestion = async (questionText?: string) => {
    const q = (questionText ?? inputQuestion).trim();
    if (!q || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputQuestion('');
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await queryGemmaAnalyst(q, activeMetric, peerMetrics, messages, selectedEngine);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        timestamp: new Date().toLocaleTimeString(),
        source: res.source,
        engineUsed: selectedEngine,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const msg = err.message || 'Failed to communicate with AI engine.';
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Connection Notice: ${msg}`,
          timestamp: new Date().toLocaleTimeString(),
          isError: true,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddPriceAlert) return;
    const threshold = Number(alertPriceInput);
    if (isNaN(threshold) || threshold <= 0) return;
    onAddPriceAlert({
      ticker: activeMetric.ticker,
      metricType: 'price',
      condition: alertCondition,
      thresholdPrice: threshold,
      initialPriceAtCreation: activeMetric.endPrice,
      note: alertNoteInput.trim() || 'AI Buy/Sell Price Trigger',
    });
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. AI ENGINE TELEMETRY BAR (GEMMA 4:31B CLOUD + GEMINI 3.8 FLASH)   */}
      {/* =================================================================== */}
      <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-blue-400 font-bold">AI MODEL: GEMMA 4:31B CLOUD</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80">PROVIDER: OLLAMA</span>
              <span className="text-white/40">·</span>
              <span
                className={
                  gemmaConfig.isConnected
                    ? 'text-emerald-400 font-bold'
                    : 'text-amber-400 font-bold'
                }
              >
                CONNECTION STATUS: {gemmaConfig.isConnected ? 'CONNECTED' : 'DISCONNECTED (GEMINI CLOUD ACTIVE)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              AI Buy & Sell Alerts (Powered by Google Gemma 4:31B & Gemini)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-lg bg-black border border-white/15 p-0.5">
              {[
                { id: 'dual-gemma-gemini', label: 'Dual: Gemma 4 + Gemini' },
                { id: 'gemma-4-31b', label: 'Gemma 4:31B (Ollama)' },
                { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Cloud' },
              ].map((eng) => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => setSelectedEngine(eng.id as AIEngineSelection)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedEngine === eng.id
                      ? 'bg-blue-600 text-white'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  {eng.label}
                </button>
              ))}
            </div>

            {onNavigateToReport && (
              <button
                type="button"
                onClick={onNavigateToReport}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Generate 9-Section Report
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar for AI Buy / Sell Signals */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter AI Trading Signals"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setSignalFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                signalFilter === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-black text-white/75 border-white/15'
              }`}
            >
              All Signals ({aiSignals.length})
            </button>
            <button
              type="button"
              onClick={() => setSignalFilter('BUY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                signalFilter === 'BUY'
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-black text-emerald-400 border-emerald-500/30'
              }`}
            >
              Buy Signals ({buyCount})
            </button>
            <button
              type="button"
              onClick={() => setSignalFilter('SELL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                signalFilter === 'SELL'
                  ? 'bg-red-600 text-white border-red-400'
                  : 'bg-black text-red-400 border-red-500/30'
              }`}
            >
              Sell Signals ({sellCount})
            </button>
            <button
              type="button"
              onClick={() => setSignalFilter('HOLD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                signalFilter === 'HOLD'
                  ? 'bg-white/20 text-white border-white/40'
                  : 'bg-black text-white/70 border-white/15'
              }`}
            >
              Hold / Neutral ({holdCount})
            </button>
          </div>

          <div className="text-xs font-mono text-white/60">
            Grounded in SMA-50/200, RSI-14, Relative Volume & Annualized Volatility
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. ACTIONABLE AI BUY / SELL SIGNAL CARDS                            */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSignals.map((sig) => {
          const isBuy = sig.action === 'STRONG BUY' || sig.action === 'BUY';
          const isSell = sig.action === 'STRONG SELL' || sig.action === 'SELL';
          const verifiedText = verifiedRationales[sig.id];

          return (
            <div
              key={sig.id}
              data-testid={`ai-signal-card-${sig.symbol}`}
              className="rounded-xl bg-[#070A12] border border-white/15 p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectTicker && onSelectTicker(sig.symbol)}
                      className="font-mono font-bold text-base text-white hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {sig.symbol}
                    </button>
                    <div className="text-xs text-white/65 truncate">{sig.name}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                        isBuy
                          ? 'bg-emerald-600/25 border border-emerald-500/50 text-emerald-300'
                          : isSell
                          ? 'bg-red-600/25 border border-red-500/50 text-red-300'
                          : 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                      }`}
                    >
                      {isBuy ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : isSell ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : null}
                      {sig.action}
                    </span>
                    <div className="text-[11px] font-mono text-white/60 mt-1 tabular-nums">
                      Confidence: <strong className="text-white">{sig.confidencePct}%</strong>
                    </div>
                  </div>
                </div>

                {/* Price Levels Grid */}
                <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-black/80 border border-white/10 font-mono text-xs tabular-nums">
                  <div>
                    <div className="text-[10px] text-white/50">Entry</div>
                    <div className="font-bold text-white">${sig.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50">Target</div>
                    <div className={`font-bold ${isSell ? 'text-red-400' : 'text-emerald-400'}`}>
                      ${sig.targetPrice}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50">Stop-Loss</div>
                    <div className="font-bold text-amber-400">${sig.stopLossPrice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50">Risk/Rew</div>
                    <div className="font-bold text-blue-400">{sig.riskRewardRatio}x</div>
                  </div>
                </div>

                <div className="text-xs font-mono text-blue-300 leading-snug">
                  Trigger: {sig.technicalTrigger}
                </div>

                <p className="text-xs text-white/80 leading-relaxed">{sig.quantThesis}</p>

                {verifiedText && (
                  <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/40 text-xs text-white/95 leading-relaxed">
                    <div className="text-[10px] font-mono text-blue-300 font-bold mb-1">
                      LIVE GEMMA 4 & GEMINI AUDIT:
                    </div>
                    {verifiedText}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-white/50">
                  {sig.engineBadge} · {sig.timeframe}
                </span>
                <button
                  type="button"
                  onClick={() => handleVerifySignalWithAI(sig)}
                  disabled={verifyingSignalId === sig.id}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-blue-600 text-white text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  {verifyingSignalId === sig.id ? 'Auditing...' : 'Verify with AI'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* 3. INTERACTIVE AI ANALYST CHAT & CUSTOM ALERT RULES                 */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* AI Chat Interface */}
        <div className="lg:col-span-8 rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Gemma 4:31B & Gemini Quantitative Analyst Chat
                </h3>
                <p className="text-xs text-white/60">
                  Ask about buy/sell setups, volatility regimes, or peer comparisons for{' '}
                  {activeMetric.ticker}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Prompt Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_AI_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendQuestion(q)}
                disabled={isGenerating}
                className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-blue-600/20 border border-white/10 text-xs text-white/80 hover:text-white text-left cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Conversation History */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/40 text-white ml-8'
                    : msg.isError
                    ? 'bg-red-950/30 border border-red-500/40 text-red-200'
                    : 'bg-black/80 border border-white/10 text-white/95 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-1">
                  <span>{msg.role === 'user' ? 'ANALYST QUERY' : 'GEMMA 4 / GEMINI RESPONSE'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                {msg.content}
              </div>
            ))}
            {isGenerating && (
              <div className="p-3 rounded-xl bg-black/80 border border-blue-500/40 text-xs font-mono text-blue-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Computing quantitative response with Google Gemma 4:31B / Gemini...
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="px-3 py-2 rounded-lg bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="flex items-center gap-2 pt-2 border-t border-white/10"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Ask Gemma 4 & Gemini about ${activeMetric.ticker} buy/sell levels...`}
              aria-label="Ask AI Analyst a financial question"
              className="flex-1 px-3.5 py-2 rounded-lg bg-black border border-white/15 text-xs text-white placeholder-white/45 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputQuestion.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </button>
          </form>
        </div>

        {/* Custom Price Alert Rules */}
        <div className="lg:col-span-4 rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
              <Bell className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-display font-bold text-white">
                Custom Buy / Sell Trigger Alerts ({priceAlerts.length})
              </h3>
            </div>

            {onAddPriceAlert && (
              <form onSubmit={handleCreateCustomAlert} className="space-y-2.5">
                <div className="text-xs font-mono text-white/75">
                  Active Ticker: <strong className="text-white">{activeMetric.ticker}</strong> ($
                  {activeMetric.endPrice.toFixed(2)})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    aria-label="Alert Condition"
                    value={alertCondition}
                    onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
                    className="px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
                  >
                    <option value="above">Crosses Above (≥)</option>
                    <option value="below">Crosses Below (≤)</option>
                  </select>
                  <input
                    type="number"
                    step="any"
                    value={alertPriceInput}
                    onChange={(e) => setAlertPriceInput(e.target.value)}
                    placeholder="Target Price ($)"
                    aria-label="Target Alert Price"
                    className="px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
                  />
                </div>
                <input
                  type="text"
                  value={alertNoteInput}
                  onChange={(e) => setAlertNoteInput(e.target.value)}
                  placeholder="Execution note (e.g. Breakout Buy / Stop-Loss)"
                  aria-label="Alert Note"
                  className="w-full px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Arm Buy/Sell Trigger
                </button>
              </form>
            )}

            <div className="divide-y divide-white/10 max-h-56 overflow-y-auto pt-2">
              {priceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="py-2 flex items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white">
                      {alert.ticker} {alert.condition === 'above' ? '≥' : '≤'} $
                      {alert.thresholdPrice.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-white/60 truncate">
                      {alert.triggered ? 'TRIGGERED' : 'ARMED'} · {alert.note || 'Custom Rule'}
                    </div>
                  </div>
                  {onDeletePriceAlert && (
                    <button
                      type="button"
                      onClick={() => onDeletePriceAlert(alert.id)}
                      aria-label={`Delete alert for ${alert.ticker}`}
                      className="p-1 text-white/50 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
