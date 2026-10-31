/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — BD Emerson Architectural Live Market Animation Slides & Global Exchange Carousel
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  AssetMetrics,
  GlobalMarketExchangeStatus,
  MarketSessionStatus,
} from '../types/market';
import { MARKET_STOCK_DIRECTORY } from '../data/demonstrationData';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Globe2,
  ArrowUpRight,
  Layers,
  Activity,
  ShieldCheck,
} from 'lucide-react';

interface LiveMarketSlidesProps {
  assetSummaries: AssetMetrics[];
  globalMarkets?: GlobalMarketExchangeStatus[];
  marketStatus: MarketSessionStatus;
  activeTicker: string;
  onSelectTicker: (ticker: string, name?: string, sector?: string) => void;
  compact?: boolean;
}

export const LiveMarketSlides: React.FC<LiveMarketSlidesProps> = ({
  assetSummaries,
  globalMarkets = [],
  marketStatus,
  activeTicker,
  onSelectTicker,
  compact = false,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const internationalShowcase = useMemo(() => {
    return MARKET_STOCK_DIRECTORY.filter(
      (s) => s.region && s.region !== 'US (NYSE & NASDAQ)'
    ).slice(0, 6);
  }, []);

  const slides = useMemo(
    () => [
      {
        id: 'us-flagship',
        indexLabel: '01',
        category: 'US FLAGSHIP & AI SEMICONDUCTORS',
        title: 'Live NYSE & NASDAQ Momentum Leaders',
        subtitle:
          'Real-time price action, 1H/6H intraday velocity, and risk-adjusted Sharpe ratios across core institutional holdings.',
      },
      {
        id: 'global-exchanges',
        indexLabel: '02',
        category: 'INTERNATIONAL EXCHANGES & SOVEREIGN DESKS',
        title: 'World Market Sessions & Cross-Border Equities',
        subtitle:
          'Live session telemetry across London (LSE), Amsterdam (EURONEXT), Frankfurt (XETRA), Tokyo (TSE), Hong Kong (HKEX), and Mumbai (NSE).',
      },
      {
        id: 'quant-volatility',
        indexLabel: '03',
        category: 'QUANTITATIVE RISK & VOLATILITY MATRIX',
        title: 'Institutional Drawdown, VaR & Volume Telemetry',
        subtitle:
          'Parametric tail-risk boundaries, annualized volatility regimes, and 20-day relative volume spikes.',
      },
    ],
    []
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const handlePrev = () => {
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[activeSlideIndex] || slides[0];

  // Build deterministic SVG sparkline path from asset metrics
  const renderSparklineSvg = (asset: AssetMetrics, isUp: boolean) => {
    const seed = asset.ticker.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const pts: number[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const trend = isUp ? progress * 14 : (1 - progress) * 14;
      const wave = Math.sin(seed * 0.4 + i * 0.85) * 4.5 + Math.cos(seed + i * 0.5) * 2.5;
      const y = 24 - (trend + wave);
      pts.push(Math.max(3, Math.min(27, y)));
    }
    const d = pts
      .map((y, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx * 96) / (count - 1)} ${y.toFixed(1)}`)
      .join(' ');
    const strokeColor = isUp ? '#10B981' : '#F43F5E';

    return (
      <svg
        viewBox="0 0 96 30"
        className="w-24 h-7 overflow-visible shrink-0"
        aria-hidden="true"
      >
        <path
          d={d}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Duplicate assets for seamless infinite CSS marquee slide track
  const marqueeAssets = useMemo(() => {
    const base = assetSummaries.slice(0, 10);
    return [...base, ...base];
  }, [assetSummaries]);

  return (
    <div
      data-testid="live-market-animation-slides"
      className="w-full space-y-3"
    >
      {/* Top BD Emerson Architectural Slide Deck Container */}
      <div className="relative rounded-2xl bg-[#090D18]/95 border border-white/[0.1] overflow-hidden shadow-2xl">
        {/* BD Emerson Isometric Geometric Corner Accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-72 h-72 opacity-20"
        >
          <svg viewBox="0 0 240 240" fill="none" className="w-full h-full">
            <polygon
              points="120,16 216,72 216,168 120,224 24,168 24,72"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <polygon
              points="120,44 192,86 192,154 120,196 48,154 48,86"
              stroke="#2563EB"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line x1="120" y1="16" x2="120" y2="224" stroke="#38BDF8" strokeWidth="0.75" />
            <line x1="24" y1="72" x2="216" y2="168" stroke="#38BDF8" strokeWidth="0.75" />
            <line x1="216" y1="72" x2="24" y2="168" stroke="#38BDF8" strokeWidth="0.75" />
          </svg>
        </div>

        {/* Slide Deck Header Bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-[#060911]/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono text-[11px] font-bold tracking-wider">
              {currentSlide.indexLabel} / 0{slides.length}
            </span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-sky-400 font-semibold">
                {currentSlide.category}
              </div>
              <h3 className="text-sm sm:text-base font-display font-bold text-white tracking-tight">
                {currentSlide.title}
              </h3>
            </div>
          </div>

          {/* Slide Navigation Tabs & Transport Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#0D1322] border border-white/[0.08]">
              {slides.map((s, idx) => {
                const isCurrent = idx === activeSlideIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.indexLabel}. {s.id === 'us-flagship' ? 'US Equities' : s.id === 'global-exchanges' ? 'World Markets' : 'Quant & Risk'}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsAutoPlaying((v) => !v)}
              aria-label={isAutoPlaying ? 'Pause Live Market Slides' : 'Play Live Market Slides'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0D1322] hover:bg-[#151E32] border border-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">AUTO-SLIDE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">PAUSED</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Market Slide"
                className="p-1.5 rounded-xl bg-[#0D1322] hover:bg-[#151E32] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Market Slide"
                className="p-1.5 rounded-xl bg-[#0D1322] hover:bg-[#151E32] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Animated Slide Body */}
        <div key={currentSlide.id} className="p-4 sm:p-5 animate-bd-slide">
          {activeSlideIndex === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {assetSummaries.slice(0, compact ? 4 : 8).map((asset, idx) => {
                const isUp = asset.totalReturnPct >= 0;
                const isSelected = asset.ticker === activeTicker;
                return (
                  <button
                    key={asset.ticker}
                    type="button"
                    onClick={() => onSelectTicker(asset.ticker, asset.name, asset.sector)}
                    className={`group relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#131D33] border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.15)]'
                        : 'bg-[#0D1322]/90 border-white/[0.07] hover:border-white/25 hover:bg-[#121A2E]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">
                            0{idx + 1}
                          </span>
                          <span className="text-sm font-mono font-bold text-white group-hover:text-sky-300 transition-colors">
                            {asset.ticker}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                          {asset.name}
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>

                    <div className="my-2.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-mono font-bold text-white tabular-nums">
                          ${asset.endPrice.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-mono font-semibold tabular-nums flex items-center gap-1 ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {isUp ? '+' : ''}
                            {asset.totalReturnPct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      {renderSparklineSvg(asset, isUp)}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>SHARPE {asset.sharpeRatio.toFixed(2)}</span>
                      <span>VOL {asset.annualizedVolatility.toFixed(1)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeSlideIndex === 1 && (
            <div className="space-y-3">
              {/* World Exchange Clocks Grid */}
              {globalMarkets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {globalMarkets.slice(0, 4).map((ex, i) => (
                    <div
                      key={ex.id}
                      className="p-3 rounded-xl bg-[#0D1322] border border-white/[0.07] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-slate-400">
                          0{i + 1} · {ex.city}
                        </div>
                        <div className="text-xs font-mono font-bold text-white mt-0.5">
                          {ex.exchange}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-xs text-slate-200 tabular-nums">{ex.localTime}</div>
                        <div
                          className={`text-[10px] font-bold ${
                            ex.isOpen ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {ex.sessionLabel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* International Equities Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {internationalShowcase.slice(0, compact ? 3 : 6).map((stock, idx) => (
                  <button
                    key={stock.ticker}
                    type="button"
                    onClick={() => onSelectTicker(stock.ticker, stock.name, stock.sector)}
                    className="p-3 rounded-xl bg-[#0D1322]/90 hover:bg-[#141D33] border border-white/[0.08] hover:border-sky-400/50 text-left transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-sky-400 font-bold">
                          0{idx + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {stock.ticker}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          · {stock.exchange}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 truncate mt-0.5">{stock.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {stock.region} · {stock.sector}
                      </div>
                    </div>
                    <Globe2 className="w-4 h-4 text-sky-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSlideIndex === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {assetSummaries.slice(0, 4).map((asset, idx) => (
                <button
                  key={asset.ticker}
                  type="button"
                  onClick={() => onSelectTicker(asset.ticker, asset.name, asset.sector)}
                  className="p-3.5 rounded-xl bg-[#0D1322] hover:bg-[#131C31] border border-white/[0.08] hover:border-sky-400/40 text-left transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">
                      0{idx + 1}. {asset.ticker} RISK PROFILE
                    </span>
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400">MAX DRAWDOWN</div>
                      <div className="text-rose-400 font-bold tabular-nums">
                        {asset.maxDrawdownPct.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">ANNUAL VOL</div>
                      <div className="text-amber-300 font-bold tabular-nums">
                        {asset.annualizedVolatility.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">SHARPE RATIO</div>
                      <div className="text-emerald-400 font-bold tabular-nums">
                        {asset.sharpeRatio.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">REL VOLUME</div>
                      <div className="text-sky-300 font-bold tabular-nums">
                        {(
                          (asset.currentVolume || 1) /
                          Math.max(1, asset.averageVolume20 || asset.currentVolume || 1)
                        ).toFixed(2)}
                        x
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Continuous Smooth Sliding Market Marquee Strip (BD Emerson Motion Band) */}
      <div className="w-full rounded-xl bg-[#060911] border border-white/[0.08] py-2 px-3 overflow-hidden relative">
        <div className="animate-bd-marquee flex items-center gap-3">
          {marqueeAssets.map((asset, idx) => {
            const isUp = asset.totalReturnPct >= 0;
            return (
              <button
                key={`${asset.ticker}_${idx}`}
                type="button"
                onClick={() => onSelectTicker(asset.ticker, asset.name, asset.sector)}
                className="flex items-center gap-2.5 px-3 py-1 rounded-lg bg-[#0D1322] hover:bg-[#162038] border border-white/[0.06] text-xs font-mono whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                <span className="text-[10px] text-slate-500">
                  {String((idx % 10) + 1).padStart(2, '0')}
                </span>
                <span className="font-bold text-white">{asset.ticker}</span>
                <span className="text-slate-200 tabular-nums">${asset.endPrice.toFixed(2)}</span>
                <span
                  className={`font-semibold tabular-nums ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {asset.totalReturnPct.toFixed(1)}%
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-slate-400">
                  Vol {(asset.currentVolume / 1_000_000).toFixed(1)}M
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
