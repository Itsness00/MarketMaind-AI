/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Dedicated Home Page (Hero Only)
 */

import React from 'react';
import {
  GemmaConfig,
  AssetMetrics,
  MarketSessionStatus,
  GlobalMarketExchangeStatus,
} from '../types/market';
import {
  ArrowRight,
  Bot,
  Cpu,
  Radio,
  TrendingUp,
  Globe2,
  BarChart2,
  Briefcase,
  Activity,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface HeroSectionProps {
  onNavigateTab: (tab: string) => void;
  gemmaConfig: GemmaConfig;
  marketStatus: MarketSessionStatus;
  globalMarkets: GlobalMarketExchangeStatus[];
  assetSummaries: AssetMetrics[];
  activeTicker: string;
  onSelectTicker: (ticker: string, name?: string, sector?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateTab,
  marketStatus,
  globalMarkets,
  assetSummaries,
  activeTicker,
  onSelectTicker,
}) => {
  return (
    <section className="relative z-10 w-full py-5 px-6 bg-gradient-to-b from-[#0F172A]/85 to-[#0B0F19] flex flex-col justify-center">
      <div className="max-w-[1440px] mx-auto w-full space-y-5">
        {/* Institutional Exchange & Global Session Status Banner */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${
              marketStatus.isOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : marketStatus.isExtendedHours
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                marketStatus.isOpen ? 'text-emerald-400 animate-pulse' : 'text-blue-400'
              }`}
            />
            <span className="font-bold tracking-wider uppercase">
              {marketStatus.exchange}: {marketStatus.label}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/80">{marketStatus.easternTime}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">{marketStatus.nextTransition}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/75">
            <Globe2 className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Global Markets: NYSE · NASDAQ · LSE · EURONEXT · XETRA · SIX · TSE · HKEX · SSE · NSE · ASX · TSX · B3
            </span>
          </div>
        </div>

        {/* Main Hero Grid (Fit-to-Size) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3.5">
            {/* Exact Required Home Page Headline & Copy */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-blue-400 font-semibold block">
                INSTITUTIONAL FINANCIAL INTELLIGENCE PLATFORM
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-display font-extrabold tracking-tight text-white leading-[1.12]">
                QUANTITATIVE MARKET <br className="hidden sm:inline" />
                RESEARCH & LIVE ANALYTICS.
              </h1>
            </div>

            {/* Secondary Headline */}
            <h2 className="text-base sm:text-lg font-mono tracking-tight font-medium text-blue-400">
              "READ THE SIGNAL. QUESTION THE NOISE."
            </h2>

            {/* Editorial Description */}
            <p className="text-sm sm:text-[15px] text-white/75 max-w-2xl leading-relaxed font-sans">
              Analyze any publicly traded stock across NYSE and NASDAQ with real-time market session
              streaming, automated price & volume spike alerts, institutional risk modeling, and
              grounded financial intelligence powered by Google Gemma 4:31B.
            </p>

            {/* Primary Navigation Buttons to Launch Directly into Workspaces */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab('overview')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-lg bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/25 cursor-pointer"
              >
                <span>Open Market Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('news')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold text-white bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 transition-all cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Live News & Open Sources</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('portfolio')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold text-white bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 transition-all cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portfolio & Live P&L</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('analyst')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>Launch Gemma & Gemini AI Analyst</span>
              </button>
            </div>

            {/* Secondary Quick-Jump Links for Quant, Risk, and Reports */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {[
                { id: 'overview', label: 'Global Markets Directory', icon: BarChart2 },
                { id: 'news', label: 'Open-Source Connectors', icon: Globe2 },
                { id: 'analytics', label: 'Quantitative Suite', icon: Activity },
                { id: 'risk', label: 'Risk & Stress Lab', icon: ShieldAlert },
                { id: 'report', label: '9-Section AI Reports', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigateTab(item.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <Icon className="w-3 h-3 text-blue-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Model Connection Indicator */}
            <div className="pt-0.5 flex flex-wrap items-center gap-3 text-[11px] font-mono">
              <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#111827] border border-white/10">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-white/60">AI ENGINES:</span>
                  <span className="text-white font-semibold">GEMMA 4:31B + GEMINI 3.8 FLASH</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white/60">LIVE FEED AI:</span>
                  <span className="text-emerald-400 font-semibold">ACTIVE</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white/60">STATUS:</span>
                  <span className="font-semibold text-emerald-400">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Watchlist Quick-Launch Matrix */}
          <div className="lg:col-span-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="text-[11px] uppercase tracking-widest font-mono text-white/60 font-semibold">
                  Active Watchlist ({assetSummaries.length} Equities)
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {marketStatus.isOpen ? 'LIVE STREAM' : 'REAL-TIME READY'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 my-3 max-h-48 overflow-y-auto pr-1">
                {assetSummaries.slice(0, 9).map((asset) => {
                  const isSelected = asset.ticker === activeTicker;
                  const isUp = asset.totalReturnPct >= 0;
                  return (
                    <button
                      key={asset.ticker}
                      type="button"
                      onClick={() => onSelectTicker(asset.ticker)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-white/5 border-white/5 text-white/75 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold truncate">
                          {asset.ticker}
                        </span>
                        <span className="text-[10px] font-mono text-white/50">
                          ${asset.endPrice.toFixed(0)}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] font-mono font-semibold mt-0.5 tabular-nums ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {asset.totalReturnPct.toFixed(1)}%
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-[11px] font-mono text-white/55 leading-relaxed border-t border-white/10">
                Select any stock above or open the Market Terminal for live Gemma 4 & Gemini feed commentary.
              </div>
            </div>
          </div>
        </div>

        {/* Compact Global Exchanges Status Strip inside the Home View */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-white/60">
          <span className="text-white/80 font-bold uppercase tracking-wider">
            World Exchanges Live Clocks:
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {globalMarkets.slice(0, 8).map((ex) => (
              <span key={ex.id} className="inline-flex items-center gap-1">
                <span className="text-white font-semibold">{ex.exchange}</span>
                <span className="text-white/45">({ex.localTime})</span>
                <span
                  className={
                    ex.isOpen
                      ? 'text-emerald-400 font-bold'
                      : 'text-white/40'
                  }
                >
                  {ex.sessionLabel}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
