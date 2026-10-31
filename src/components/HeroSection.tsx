/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Dedicated Home Page (BD Emerson Architectural Design & Live Market Animation Slides)
 */

import React from 'react';
import {
  GemmaConfig,
  AssetMetrics,
  MarketSessionStatus,
  GlobalMarketExchangeStatus,
} from '../types/market';
import { LiveMarketSlides } from './LiveMarketSlides';
import {
  ArrowRight,
  Bot,
  Cpu,
  Radio,
  Globe2,
  BarChart2,
  Briefcase,
  Activity,
  ShieldAlert,
  FileText,
  Layers,
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
    <section className="relative z-10 w-full py-3.5 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-[1440px] mx-auto w-full space-y-3.5">
        {/* BD Emerson Dark Architectural Hero Container with Isometric 3D Structural Motif */}
        <div className="relative rounded-2xl bg-[#080C15]/95 border border-white/[0.1] p-4 sm:p-5 overflow-hidden shadow-2xl">
          {/* Isometric 3D Wireframe Architecture (BD Emerson Motif) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 w-[360px] h-[360px] opacity-25 hidden lg:block"
          >
            <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
              {/* Outer Isometric Cube */}
              <polygon
                points="200,24 356,114 356,294 200,384 44,294 44,114"
                stroke="#38BDF8"
                strokeWidth="1.2"
              />
              {/* Inner Isometric Prism */}
              <polygon
                points="200,76 310,140 310,268 200,332 90,268 90,140"
                stroke="#2563EB"
                strokeWidth="1.2"
                strokeDasharray="6 6"
              />
              {/* Core Isometric Tetrahedron */}
              <polygon
                points="200,128 264,165 264,239 200,276 136,239 136,165"
                stroke="#10B981"
                strokeWidth="1"
              />
              {/* Axis Vectors */}
              <line x1="200" y1="24" x2="200" y2="384" stroke="#38BDF8" strokeWidth="0.8" />
              <line x1="44" y1="114" x2="356" y2="294" stroke="#38BDF8" strokeWidth="0.8" />
              <line x1="356" y1="114" x2="44" y2="294" stroke="#38BDF8" strokeWidth="0.8" />
            </svg>
          </div>

          {/* Unboxed Editorial Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08] text-xs font-mono text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sky-400 font-bold">01. ARCHITECTURE</span>
              <span>·</span>
              <span className="text-white font-semibold">
                {marketStatus.exchange}: {marketStatus.label}
              </span>
              <span>·</span>
              <span>{marketStatus.easternTime}</span>
              <span>·</span>
              <span>{marketStatus.nextTransition}</span>
            </div>

            <div className="text-slate-400">
              Global Coverage: NYSE · NASDAQ · LSE · EURONEXT · XETRA · SIX · TSE · HKEX · SSE · NSE · ASX · TSX · B3
            </div>
          </div>

          {/* Main Hero Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3.5 items-stretch">
            <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
              {/* Exact Required Home Page Headline & Copy */}
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-[0.22em] font-mono text-sky-400 font-semibold block">
                  INSTITUTIONAL FINANCIAL INTELLIGENCE PLATFORM
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-display font-extrabold tracking-tight text-white leading-[1.08] balance">
                  QUANTITATIVE MARKET <br className="hidden sm:inline" />
                  RESEARCH & LIVE ANALYTICS.
                </h1>
                <h2 className="text-base sm:text-lg font-mono tracking-tight font-semibold text-sky-400 pt-0.5">
                  "READ THE SIGNAL. QUESTION THE NOISE."
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-sans">
                  Analyze any publicly traded stock across NYSE and NASDAQ with real-time market
                  session streaming, automated price & volume spike alerts, institutional risk
                  modeling, and grounded financial intelligence powered by Google Gemma 4:31B.
                </p>
              </div>

              {/* Primary Navigation Actions */}
              <div className="space-y-2.5 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('overview')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap"
                  >
                    <span>01. Open Market Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('news')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-semibold text-white bg-[#111829] hover:bg-[#172138] border border-white/[0.1] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Radio className="w-3.5 h-3.5 text-sky-400" />
                    <span>02. Live News & Open Sources</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('portfolio')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-semibold text-white bg-[#111829] hover:bg-[#172138] border border-white/[0.1] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>03. Portfolio & Live P&L</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('analyst')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-semibold text-white bg-[#111829] hover:bg-[#172138] border border-white/[0.1] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                    <span>04. Gemma 4 & Gemini AI Analyst</span>
                  </button>
                </div>

                {/* Editorial Numbered Quick-Jump Strip */}
                <div className="flex flex-wrap items-center gap-4 pt-0.5 text-xs font-mono text-slate-400">
                  {[
                    { id: 'overview', num: '05.', label: 'Global Markets Directory' },
                    { id: 'analytics', num: '06.', label: 'Quantitative Suite' },
                    { id: 'risk', num: '07.', label: 'Risk & Stress Lab' },
                    { id: 'report', num: '08.', label: '9-Section Research Reports' },
                  ].map((item) => (
                    <button
                      key={item.id + item.num}
                      type="button"
                      onClick={() => onNavigateTab(item.id)}
                      className="hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                    >
                      <span className="text-sky-400 font-bold">{item.num}</span>
                      <span className="underline-offset-4 hover:underline">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: BD Emerson High-Contrast Alabaster Architectural Specification Card */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bd-contrast-panel p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-900/10 pb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                      02. INSTITUTIONAL TELEMETRY
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-600">
                      BD EMERSON GRID
                    </span>
                  </div>

                  <h3 className="text-sm font-display font-bold text-slate-900 leading-snug">
                    Dual-Engine Financial Intelligence & Real-Time Market Architecture
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="text-[10px] font-mono text-slate-500">PRIMARY AI</div>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        Gemma 4:31B
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="text-[10px] font-mono text-slate-500">LIVE FEED AI</div>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        Gemini 3.8 Flash
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="text-[10px] font-mono text-slate-500">GLOBAL EXCHANGES</div>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                        13 Live Venues
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                      <div className="text-[10px] font-mono text-slate-500">WATCHLIST</div>
                      <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5 tabular-nums">
                        {assetSummaries.length} Active Equities
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-900/10 flex items-center justify-between text-xs font-mono text-slate-700">
                  <span>1H · 6H · 24H Live Windows</span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('overview')}
                    className="font-bold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1"
                  >
                    <span>Enter Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Animation Slides of the Markets (Interactive Carousel + Continuous Marquee Slide) */}
        <LiveMarketSlides
          assetSummaries={assetSummaries}
          globalMarkets={globalMarkets}
          marketStatus={marketStatus}
          activeTicker={activeTicker}
          onSelectTicker={onSelectTicker}
          compact
        />
      </div>
    </section>
  );
};
