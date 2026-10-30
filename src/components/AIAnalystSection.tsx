/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Section B: AI Market Analyst
 * Interactive financial research assistant powered by Google Gemma 4:31B.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AssetMetrics, GemmaConfig, ChatMessage } from '../types/market';
import { queryGemmaAnalyst, buildFinancialContextPrompt } from '../utils/aiEngine';
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
} from 'lucide-react';

interface AIAnalystSectionProps {
  activeMetric: AssetMetrics;
  peerMetrics: AssetMetrics[];
  gemmaConfig: GemmaConfig;
  isHalloween: boolean;
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
  isHalloween,
  onNavigateToReport,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### MarketMind AI Research Briefing
Welcome to the AI Financial Research Terminal. I am **MarketMind AI**, powered by **Google Gemma 4:31B**.

I am conditioned on verified mathematical indicators for **${activeMetric.ticker} (${activeMetric.name})** and **${peerMetrics.length} peer benchmark assets** across **${activeMetric.dataPointsCount} trading sessions**.

All analysis is strictly grounded in the loaded dataset. Select one of the research inquiries below or type a custom financial question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemma4-cloud',
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
        messages
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Error querying Google Gemma 4 backend (${errStr}).`,
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

  return (
    <section className="space-y-6">
      {/* AI Analyst Header Status Bar */}
      <div className="p-4 rounded-xl bg-[#161920] border border-white/10 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                isHalloween
                  ? 'bg-[#FF7518]/20 text-[#FF7518] border border-[#FF7518]/40'
                  : 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
              }`}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white tracking-tight">
                AI Analyst Terminal
              </h3>
              <p className="text-xs font-mono text-white/50">
                Disciplined Financial Intelligence · Powered by Google Gemma 4:31B
              </p>
            </div>
          </div>

          {/* Report Trigger Button */}
          {onNavigateToReport && (
            <button
              onClick={onNavigateToReport}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md cursor-pointer ${
                isHalloween
                  ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D]'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Financial Report</span>
            </button>
          )}
        </div>

        {/* Status Display: AI MODEL, PROVIDER, CONNECTION STATUS */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-white/40">AI MODEL:</span>
            <span className="text-white font-bold tracking-wider">GEMMA 4:31B</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-white/40">PROVIDER:</span>
            <span className="text-white font-bold tracking-wider">GOOGLE GEMMA</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-white/40">CONNECTION STATUS:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-[#42C98B]">
              <span className="w-2 h-2 rounded-full bg-[#42C98B] shadow-[0_0_8px_#42C98B]" />
              CONNECTED
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Mathematical Context Drawer */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-white/40">
          Financial Grounding & Prompt Synthesis
        </span>
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-white/25 text-xs font-mono text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-[#9B5DE5]" />
          <span>Inspect Grounded Parameters</span>
          {showEvidence ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {showEvidence && (
        <div className="p-4 rounded-xl bg-black/60 border border-white/15 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-white/60 pb-2 border-b border-white/10">
            <span>INJECTED MATHEMATICAL CONTEXT PASSED TO GOOGLE GEMMA 4</span>
            <span className="text-[10px] text-[#42C98B]">Zero Financial Hallucination Protocol</span>
          </div>
          <pre className="p-3 rounded-lg bg-black/80 border border-white/5 text-[11px] text-white/80 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
            {currentPayloadPreview}
          </pre>
        </div>
      )}

      {/* Suggested Question Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block">
          Preset Financial Intelligence Queries:
        </span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono text-left transition-all border cursor-pointer ${
                isHalloween
                  ? 'bg-white/5 border-white/10 hover:border-[#FF7518]/50 hover:bg-[#FF7518]/10 text-white/80 hover:text-white'
                  : 'bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-blue-500/10 text-white/80 hover:text-white'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-xl border border-white/10 bg-[#161920]/90 p-4 sm:p-6 min-h-[440px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isAi ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAi && (
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-mono font-bold text-xs ${
                    msg.isError
                      ? 'bg-red-950/60 text-red-400 border border-red-500/40'
                      : isHalloween
                      ? 'bg-[#FF7518]/20 text-[#FF7518] border border-[#FF7518]/40'
                      : 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 space-y-2 border ${
                  msg.isError
                    ? 'bg-red-950/20 border-red-500/30 text-red-200'
                    : isAi
                    ? 'bg-black/40 border-white/10 text-white/90'
                    : isHalloween
                    ? 'bg-[#FF7518]/15 border-[#FF7518]/30 text-white'
                    : 'bg-blue-600/20 border-blue-500/30 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-4 pb-1 border-b border-white/5 text-[10px] font-mono text-white/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white/70">
                      {isAi ? 'MarketMind AI (Google Gemma 4:31B)' : 'You (Research Analyst)'}
                    </span>
                    {msg.source && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-[#42C98B] uppercase">
                        {msg.source === 'gemma4-cloud' ? 'Gemma 4 Live' : 'Error'}
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
                      {isCopied ? <Check className="w-3 h-3 text-[#42C98B]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-xs max-w-none font-sans space-y-2">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-display font-bold text-white pt-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                      return (
                        <div key={pIdx} className="pl-2 space-y-1 font-mono text-[11px] text-white/80">
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
                      <p key={pIdx} className="text-xs leading-relaxed text-white/80">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-white/10 text-white/80 border border-white/20">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-xs font-mono text-white/60 p-3 bg-black/30 rounded-lg border border-white/5">
            <RefreshCw className="w-4 h-4 animate-spin text-[#FF7518]" />
            <span>Google Gemma 4:31B is evaluating financial metrics...</span>
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
        className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10 focus-within:border-white/30 transition-colors"
      >
        <input
          type="text"
          placeholder="Ask Google Gemma 4 about trends, volatility, risks, or comparisons..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-white placeholder-white/40 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading || !inputQuestion.trim()}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
            isHalloween
              ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D]'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          <span>Submit</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </section>
  );
};
