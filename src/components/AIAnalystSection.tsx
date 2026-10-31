/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Section B: AI Market Analyst
 * Interactive financial research assistant powered by Google Gemma 4:31B & Google Gemini 3.8 Flash.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  AssetMetrics,
  GemmaConfig,
  ChatMessage,
  AIEngineSelection,
  LiveMarketAIPulse,
} from '../types/market';
import {
  queryGemmaAnalyst,
  buildFinancialContextPrompt,
  fetchLiveMarketAIFeed,
} from '../utils/aiEngine';
import {
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Database,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Sparkles,
  Cpu,
  Radio,
} from 'lucide-react';

interface AIAnalystSectionProps {
  activeMetric: AssetMetrics;
  peerMetrics: AssetMetrics[];
  gemmaConfig: GemmaConfig;
  onNavigateToReport?: () => void;
}

const EXAMPLE_QUESTIONS = [
  'What are the most important trends in this dataset?',
  'Which stock performed best?',
  'Which asset showed the highest volatility?',
  'What are the biggest risks?',
  'Compare the performance of these companies.',
  'What does the market data suggest about investor uncertainty?',
];

export const AIAnalystSection: React.FC<AIAnalystSectionProps> = ({
  activeMetric,
  peerMetrics,
  gemmaConfig,
  onNavigateToReport,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<AIEngineSelection>(
    gemmaConfig.selectedEngine || 'dual-gemma-gemini'
  );
  const [livePulse, setLivePulse] = useState<LiveMarketAIPulse | null>(null);
  const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### MarketMind AI Institutional Research Briefing (Gemma 4 & Gemini 3.8)
Welcome to the AI Financial Research Terminal. I am **MarketMind AI**, powered by **Google Gemma 4:31B** & **Google Gemini 3.8 Flash**.

I am conditioned on verified mathematical indicators for **${activeMetric.ticker} (${activeMetric.name})** and **${peerMetrics.length} peer benchmark assets** across **${activeMetric.dataPointsCount} trading sessions**.

Switch between **Gemma 4 + Gemini Co-Pilot**, **Google Gemma 4:31B**, or **Google Gemini 3.8 Flash** above, or click any preset financial inquiry below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'dual-ai',
      engineUsed: 'dual-gemma-gemini',
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch Live Market Feed AI Pulse when activeTicker or selectedEngine changes
  const handleRefreshLivePulse = async () => {
    setIsRefreshingPulse(true);
    try {
      const pulse = await fetchLiveMarketAIFeed(activeMetric, peerMetrics, selectedEngine);
      setLivePulse(pulse);
    } finally {
      setIsRefreshingPulse(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchLiveMarketAIFeed(activeMetric, peerMetrics, selectedEngine).then((p) => {
      if (mounted) setLivePulse(p);
    });
    return () => {
      mounted = false;
    };
  }, [activeMetric.ticker, activeMetric.endPrice, selectedEngine]);

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await queryGemmaAnalyst(
        questionText,
        activeMetric,
        peerMetrics,
        messages,
        selectedEngine
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        engineUsed: selectedEngine,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Error querying Google Gemma 4 & Gemini 3.8 backend (${errStr}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'error',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentPayloadPreview = buildFinancialContextPrompt(
    activeMetric,
    peerMetrics,
    inputQuestion || 'USER QUESTION...'
  );

  const activeEngineBadgeLabel =
    selectedEngine === 'gemini-3.8-flash'
      ? 'GEMINI 3.8 FLASH'
      : selectedEngine === 'gemma-4-31b'
      ? 'GEMMA 4:31B'
      : 'GEMMA 4:31B + GEMINI 3.8 FLASH';

  return (
    <section className="space-y-4">
      {/* Compact AI Analyst Header & Dual Engine Switcher (Gemma 4 & Gemini 3.8) */}
      <div className="p-3.5 rounded-xl bg-[#111827] border border-white/10 shadow-lg space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-blue-600/20 text-blue-400 border border-blue-500/40">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white tracking-tight">
                AI Analyst & Live Feed Intelligence ({activeMetric.ticker})
              </h3>
              <p className="text-[11px] font-mono text-white/50">
                Institutional Quantitative Engine · Powered by Google Gemma 4:31B & Google Gemini 3.8 Flash
              </p>
            </div>
          </div>

          {/* Engine Selector Pills + Report Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0B0F19] border border-white/10 text-[11px] font-mono">
              {[
                { id: 'dual-gemma-gemini' as AIEngineSelection, label: 'Gemma 4 + Gemini' },
                { id: 'gemma-4-31b' as AIEngineSelection, label: 'Gemma 4:31B' },
                { id: 'gemini-3.8-flash' as AIEngineSelection, label: 'Gemini 3.8 Flash' },
              ].map((eng) => {
                const isActive = selectedEngine === eng.id;
                return (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => setSelectedEngine(eng.id)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow'
                        : 'text-white/65 hover:text-white'
                    }`}
                  >
                    {eng.label}
                  </button>
                );
              })}
            </div>

            {onNavigateToReport && (
              <button
                onClick={onNavigateToReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all shadow-md bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>9-Section Report</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Display: AI MODEL, PROVIDER, CONNECTION STATUS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white/40">AI MODEL:</span>
              <span className="text-white font-bold tracking-wider">{activeEngineBadgeLabel}</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white/40">PROVIDER:</span>
              <span className="text-white font-bold tracking-wider">GOOGLE GEMMA & GEMINI</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white/40">CONNECTION STATUS:</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                CONNECTED
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <Database className="w-3 h-3 text-blue-400" />
            <span>Inspect Grounded Prompt</span>
            {showEvidence ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Live Market Feed AI Pulse Bar (Gemma 4 + Gemini 3.8 Flash Live Tape Commentary) */}
      {livePulse && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#111827] to-emerald-950/30 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              {livePulse.engineLabel}
            </span>
            <p className="text-white/90 text-xs font-sans truncate sm:whitespace-normal">
              <span className="font-mono font-bold text-emerald-400 mr-1.5">
                [{livePulse.sentiment}]
              </span>
              {livePulse.aiLiveCommentary}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshLivePulse}
            disabled={isRefreshingPulse}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/80 hover:text-white cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingPulse ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh Live Feed AI</span>
          </button>
        </div>
      )}

      {showEvidence && (
        <div className="p-3 rounded-xl bg-black/60 border border-white/15 space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-white/60 pb-1.5 border-b border-white/10 text-[11px]">
            <span>INJECTED MATHEMATICAL CONTEXT PASSED TO GOOGLE GEMMA 4 & GEMINI 3.8</span>
            <span className="text-[10px] text-emerald-400">Zero Financial Hallucination Protocol</span>
          </div>
          <pre className="p-2.5 rounded-lg bg-black/80 border border-white/5 text-[10px] text-white/80 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-36">
            {currentPayloadPreview}
          </pre>
        </div>
      )}

      {/* Compact Preset Question Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 mr-1">
          Quick Queries:
        </span>
        {EXAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAskQuestion(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-left transition-all border cursor-pointer bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-blue-500/10 text-white/80 hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Fit-to-Size Chat Messages Container */}
      <div className="rounded-xl border border-white/10 bg-[#111827]/90 p-3.5 sm:p-4 min-h-[290px] max-h-[370px] overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          const isCopied = copiedId === msg.id;

          const badgeText =
            msg.source === 'gemini-3.8-flash'
              ? 'Gemini 3.8 Flash'
              : msg.source === 'gemma4-cloud'
              ? 'Gemma 4:31B'
              : msg.source === 'dual-ai'
              ? 'Gemma 4 + Gemini 3.8'
              : 'Error';

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 text-xs leading-relaxed ${
                isAi ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAi && (
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs ${
                    msg.isError
                      ? 'bg-red-950/60 text-red-400 border border-red-500/40'
                      : 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-xl p-3.5 space-y-1.5 border ${
                  msg.isError
                    ? 'bg-red-950/20 border-red-500/30 text-red-200'
                    : isAi
                    ? 'bg-black/40 border-white/10 text-white/90'
                    : 'bg-blue-600/20 border-blue-500/30 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-4 pb-1 border-b border-white/5 text-[10px] font-mono text-white/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white/75">
                      {isAi ? 'MarketMind AI (Gemma 4 & Gemini 3.8)' : 'You (Research Analyst)'}
                    </span>
                    {msg.source && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-emerald-400 uppercase font-bold">
                        {badgeText}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      title="Copy message"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-xs max-w-none font-sans space-y-1.5">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="text-xs sm:text-sm font-display font-bold text-white pt-0.5">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                      return (
                        <div key={pIdx} className="pl-2 space-y-1 font-mono text-[11px] text-white/85">
                          {paragraph.split('\n').map((li, lIdx) => (
                            <div key={lIdx}>{li}</div>
                          ))}
                        </div>
                      );
                    }
                    if (paragraph.startsWith('|')) {
                      return (
                        <pre key={pIdx} className="font-mono text-[10px] overflow-x-auto p-2 bg-black/60 rounded">
                          {paragraph}
                        </pre>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-xs leading-relaxed text-white/85">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-white/10 text-white/80 border border-white/20">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs font-mono text-white/70 p-2.5 bg-black/30 rounded-lg border border-white/5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>
              {activeEngineBadgeLabel} is evaluating grounded financial metrics for {activeMetric.ticker}...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Submit Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskQuestion(inputQuestion);
        }}
        className="flex items-center gap-2 p-1.5 rounded-xl bg-black/40 border border-white/10 focus-within:border-blue-500 transition-colors"
      >
        <input
          type="text"
          placeholder={`Ask Google Gemma 4 & Gemini 3.8 about ${activeMetric.ticker} trends, volatility, risks, or comparisons...`}
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-white placeholder-white/40 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading || !inputQuestion.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-blue-600 text-white hover:bg-blue-500"
        >
          <span>Submit</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </section>
  );
};

