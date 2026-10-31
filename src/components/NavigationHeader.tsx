/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — BD Emerson Architectural Top Navigation Header, Full-Width Unbunched Tabs & Dual News/Live-Tape Slide Animations
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  AssetMetrics,
  GemmaConfig,
  MarketSessionStatus,
  StockDirectoryItem,
  UserProfile,
} from '../types/market';
import { searchMarketStocks, MARKET_STOCK_DIRECTORY } from '../data/demonstrationData';
import {
  Settings,
  Bell,
  Search,
  Radio,
  PlusCircle,
  Home,
  UserCheck,
  Database,
  Newspaper,
  Github,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';

interface NavigationHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gemmaConfig: GemmaConfig;
  marketStatus: MarketSessionStatus;
  onSelectOrAddStock: (ticker: string, name?: string, sector?: string) => void;
  onOpenSettings: () => void;
  onOpenHacktoberfest: () => void;
  onOpenProfile: () => void;
  userProfile?: UserProfile;
  isAutoStreaming?: boolean;
  onToggleAutoStream?: () => void;
  assetSummaries?: AssetMetrics[];
  activeTicker?: string;
  openSourcesCount?: number;
  armedAlertsCount?: number;
  triggeredAlertsCount?: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  setActiveTab,
  gemmaConfig,
  marketStatus,
  onSelectOrAddStock,
  onOpenSettings,
  onOpenHacktoberfest,
  onOpenProfile,
  userProfile,
  isAutoStreaming = true,
  onToggleAutoStream,
  assetSummaries = [],
  activeTicker = 'NVDA',
  openSourcesCount = 5,
  armedAlertsCount = 0,
  triggeredAlertsCount = 0,
}) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StockDirectoryItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Top Markets News-Slide State (Row A under tabs)
  const [newsSlideIndex, setNewsSlideIndex] = useState<number>(0);
  const [isNewsSlidePlaying, setIsNewsSlidePlaying] = useState<boolean>(true);

  // 2. Live Tape (1H · 6H · 24H) Slide Animation State (Row B under tabs)
  const [liveTapeSlideIndex, setLiveTapeSlideIndex] = useState<number>(0);
  const [isLiveTapePlaying, setIsLiveTapePlaying] = useState<boolean>(true);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'overview', label: 'Market Terminal', icon: Radio },
    { id: 'news', label: 'Live News', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio', icon: PlusCircle },
    { id: 'analyst', label: 'AI Analyst', icon: Settings },
    { id: 'analytics', label: 'Quant Metrics', icon: Database },
    { id: 'risk', label: 'Risk Lab', icon: Bell },
    { id: 'report', label: 'Reports', icon: UserCheck },
  ];

  // Build Top Markets News Slides from live assetSummaries
  const topMarketNewsSlides = useMemo(() => {
    if (!assetSummaries || assetSummaries.length === 0) return [];
    const sortedByMomentum = [...assetSummaries].sort(
      (a, b) => Math.abs(b.totalReturnPct) - Math.abs(a.totalReturnPct)
    );
    const topAssets = sortedByMomentum.slice(0, 6);

    const headlineTemplates: Record<string, string> = {
      NVDA: 'AI data-center GPU demand drives institutional block accumulation & strong 1H/6H Sharpe momentum',
      META: 'Advertising yield expansion & hyperscale AI infrastructure lift operating margin trajectory',
      AAPL: 'Global hardware ecosystem & silicon upgrade cycle anchor institutional low-volatility inflows',
      AMZN: 'AWS cloud backlog acceleration & fulfillment automation widen free-cash-flow runway',
      GOOGL: 'Search monetization resilience & Gemini cloud enterprise adoption support valuation multiple',
      MSFT: 'Enterprise Copilot seat expansion & Azure infrastructure scale anchor institutional desk allocation',
      SPY: 'S&P 500 benchmark tracks cross-sector earnings breadth and institutional liquidity positioning',
      QQQ: 'NASDAQ-100 technology leadership paces intraday 1H & 6H momentum across growth equities',
      JPM: 'Net interest income resilience & capital markets advisory activity bolster Tier-1 banking desk',
      TSLA: 'Autonomous fleet compute & energy storage deployments drive high-beta intraday volume',
    };

    return topAssets.map((asset, idx) => {
      const isUp = asset.totalReturnPct >= 0;
      const peer1 = assetSummaries[(idx + 1) % assetSummaries.length];
      const peer2 = assetSummaries[(idx + 2) % assetSummaries.length];
      const headline =
        headlineTemplates[asset.ticker] ||
        `${asset.name} (${asset.ticker}) posts ${isUp ? '+' : ''}${asset.totalReturnPct.toFixed(
          1
        )}% return with ${asset.annualizedVolatility.toFixed(1)}% annualized volatility`;

      return {
        indexLabel: `0${idx + 1}`,
        category:
          idx === 0
            ? 'TOP MARKET FLASH'
            : idx === 1
            ? 'INSTITUTIONAL FLOW'
            : 'LIVE MARKET PULSE',
        asset,
        headline,
        peers: [peer1, peer2].filter(Boolean),
      };
    });
  }, [assetSummaries]);

  // Build Live Tape (1H · 6H · 24H) Multi-Card Slide Pages (4 spacious cards per slide)
  const liveTapeSlides = useMemo(() => {
    const page1 = assetSummaries.slice(0, 4).map((a) => {
      const lastRet =
        a.dailyReturns && a.dailyReturns.length > 0
          ? a.dailyReturns[a.dailyReturns.length - 1].returnPct
          : a.totalReturnPct / 60;
      return {
        ticker: a.ticker,
        name: a.name,
        sector: a.sector,
        price: a.endPrice,
        change1H: Number((lastRet * 0.45).toFixed(2)),
        change6H: Number((lastRet * 0.85).toFixed(2)),
        change24H: Number(a.totalReturnPct.toFixed(1)),
        exchange: 'NASDAQ/NYSE',
      };
    });

    const page2 = assetSummaries.slice(4, 8).map((a) => {
      const lastRet =
        a.dailyReturns && a.dailyReturns.length > 0
          ? a.dailyReturns[a.dailyReturns.length - 1].returnPct
          : a.totalReturnPct / 60;
      return {
        ticker: a.ticker,
        name: a.name,
        sector: a.sector,
        price: a.endPrice,
        change1H: Number((lastRet * 0.42).toFixed(2)),
        change6H: Number((lastRet * 0.82).toFixed(2)),
        change24H: Number(a.totalReturnPct.toFixed(1)),
        exchange: 'NYSE/NASDAQ',
      };
    });

    const intlStocks = MARKET_STOCK_DIRECTORY.filter(
      (s) => s.region && s.region !== 'US (NYSE & NASDAQ)'
    ).slice(0, 4);

    const page3 = intlStocks.map((s, idx) => ({
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      price: s.basePrice,
      change1H: Number(((idx % 2 === 0 ? 1 : -1) * (0.42 + idx * 0.18)).toFixed(2)),
      change6H: Number(((idx % 2 === 0 ? 1 : -1) * (1.35 + idx * 0.45)).toFixed(2)),
      change24H: Number(((idx % 2 === 0 ? 1 : -1) * (18.4 + idx * 6.2)).toFixed(1)),
      exchange: s.exchange,
    }));

    return [
      {
        id: 'tape-slide-1',
        indexLabel: '01',
        label: 'US MEGA-CAP',
        items: page1,
      },
      {
        id: 'tape-slide-2',
        indexLabel: '02',
        label: 'WALL ST & ETFS',
        items: page2.length > 0 ? page2 : page1,
      },
      {
        id: 'tape-slide-3',
        indexLabel: '03',
        label: 'GLOBAL DESKS',
        items: page3.length > 0 ? page3 : page1,
      },
    ];
  }, [assetSummaries]);

  // Auto-advance Top Markets News Slide
  useEffect(() => {
    if (!isNewsSlidePlaying || topMarketNewsSlides.length <= 1) return;
    const timer = setInterval(() => {
      setNewsSlideIndex((prev) => (prev + 1) % topMarketNewsSlides.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [isNewsSlidePlaying, topMarketNewsSlides.length]);

  // Auto-advance Live Tape (1H · 6H · 24H) Slide
  useEffect(() => {
    if (!isLiveTapePlaying || liveTapeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setLiveTapeSlideIndex((prev) => (prev + 1) % liveTapeSlides.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isLiveTapePlaying, liveTapeSlides.length]);

  const currentNewsSlide =
    topMarketNewsSlides[newsSlideIndex % Math.max(1, topMarketNewsSlides.length)] ||
    topMarketNewsSlides[0];

  const currentLiveTapeSlide =
    liveTapeSlides[liveTapeSlideIndex % Math.max(1, liveTapeSlides.length)] ||
    liveTapeSlides[0];

  const renderMiniSparkline = (asset: AssetMetrics) => {
    const isUp = asset.totalReturnPct >= 0;
    const seed = asset.ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const pts: number[] = [];
    for (let i = 0; i < 10; i++) {
      const p = i / 9;
      const base = isUp ? p * 10 : (1 - p) * 10;
      const wave = Math.sin(seed + i * 0.9) * 3;
      pts.push(Math.max(2, Math.min(18, 16 - (base + wave))));
    }
    const d = pts.map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i * 56) / 9} ${y.toFixed(1)}`).join(' ');
    return (
      <svg viewBox="0 0 56 20" className="w-14 h-5 overflow-visible shrink-0" aria-hidden="true">
        <path
          d={d}
          fill="none"
          stroke={isUp ? '#10B981' : '#F43F5E'}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  useEffect(() => {
    const q = quickQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const local = searchMarketStocks(q).slice(0, 8);
    setSearchResults(local);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            setSearchResults(data.results.slice(0, 8));
          }
        }
      } catch {
        // Fallback to local universal search already populated
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [quickQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickQuery.trim().toUpperCase();
    if (!clean) return;
    const match = searchResults[0];
    if (match) {
      onSelectOrAddStock(match.ticker, match.name, match.sector);
    } else {
      onSelectOrAddStock(clean);
    }
    setQuickQuery('');
    setIsDropdownOpen(false);
    setActiveTab('overview');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.09] bg-[#06080E]/95 backdrop-blur-xl transition-colors">
      {/* Tier 1: BD Emerson Top Command Bar (Brand, Universal Search, Live Telemetry Controls) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm tracking-tighter bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] border border-white/15">
              M
            </div>
            <div>
              <span className="text-sm sm:text-base font-display font-bold tracking-tight text-white whitespace-nowrap block leading-tight">
                MARKETMIND AI
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block leading-none mt-0.5">
                BD Emerson Architecture · Gemma 4 & Gemini
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Universal Any-Stock Search Bar (US & International) */}
        <div ref={dropdownRef} className="hidden md:block relative flex-1 max-w-md mx-4">
          <form onSubmit={handleQuickSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={quickQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setQuickQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Search any US or global ticker (e.g. NVDA, AAPL, 7203.T, SHEL.L)..."
              className="w-full pl-10 pr-16 py-1.5 rounded-xl bg-[#0E1320] border border-white/[0.08] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-[10px] font-mono text-slate-400">
              13 EXCH
            </span>
          </form>

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-[#0E1320] border border-white/15 shadow-2xl overflow-hidden z-50 divide-y divide-white/[0.06] max-h-80 overflow-y-auto">
              {searchResults.map((stock) => (
                <button
                  key={stock.ticker}
                  type="button"
                  onClick={() => {
                    onSelectOrAddStock(stock.ticker, stock.name, stock.sector);
                    setQuickQuery('');
                    setIsDropdownOpen(false);
                    setActiveTab('overview');
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-blue-600/20 flex items-center justify-between gap-2 transition-colors cursor-pointer font-mono text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{stock.ticker}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {stock.exchange}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{stock.name}</div>
                  </div>
                  <PlusCircle className="w-4 h-4 text-blue-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zone 3: Utility Controls (Live Stream, Sources, Alerts, GitHub & Device, AI Engine, Account) */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleAutoStream && (
            <button
              type="button"
              onClick={onToggleAutoStream}
              title="Toggle Real-Time Market Tick Stream (1H / 6H / Live)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                isAutoStreaming
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#0E1320] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{isAutoStreaming ? 'LIVE 1H/6H ON' : 'LIVE OFF'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('news')}
            title={`Active Open-Source Data & News Connectors (${openSourcesCount})`}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E1320] border border-white/[0.08] hover:border-indigo-500/40 text-xs font-mono text-slate-300 cursor-pointer whitespace-nowrap"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>SOURCES</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-600/30 text-[10px] font-bold text-indigo-200">
              {openSourcesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            title={`Market Alerts: ${armedAlertsCount} Armed, ${triggeredAlertsCount} Triggered (Bottom Pop)`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              triggeredAlertsCount > 0
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#0E1320] border-white/[0.08] hover:border-white/20 text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] font-bold text-white">
              {armedAlertsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenHacktoberfest}
            title="GitHub Repository — Clone & Keep MarketMind AI on Your Own Device"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E1320] border border-white/[0.1] hover:border-blue-500/40 text-xs font-mono text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap"
          >
            <Github className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline font-semibold">GitHub & Device</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title={`Google Gemma 4 & Gemini 3.8 Engines: ${gemmaConfig.isConnected ? 'Connected' : 'Ready'}`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E1320] border border-white/[0.08] hover:border-white/20 text-xs font-mono transition-all text-left cursor-pointer whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden 2xl:inline text-slate-200 font-medium">GEMMA 4 + GEMINI</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            title={`Account Login (Email / GitHub / Google), Custom Device APIs & Profile: ${userProfile?.fullName || 'Institutional Analyst'}`}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-mono text-indigo-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
              {userProfile?.avatarInitials || 'MM'}
            </span>
            <span className="hidden md:inline text-xs font-semibold text-white truncate max-w-[110px]">
              {userProfile?.fullName?.split(' ')[0] || 'Account'}
            </span>
          </button>
        </div>
      </div>

      {/* Tier 2: Full-Width Unbunched Navigation Tabs (Evenly Distributed with Full Labels & Generous Gaps) */}
      <div className="w-full border-t border-white/[0.08] bg-[#080C15]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 overflow-x-auto no-scrollbar">
          <nav
            aria-label="Primary Workspace Navigation"
            data-testid="top-navigation-tabs"
            className="w-full min-w-[980px] flex items-center justify-between gap-3.5"
          >
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-[0_4px_18px_rgba(37,99,235,0.45)] border border-sky-400/60'
                      : 'bg-[#0E1525] text-slate-300 hover:text-white hover:bg-[#152036] border border-white/[0.08]'
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      isActive ? 'text-sky-200 font-bold' : 'text-sky-400/80'
                    }`}
                  >
                    0{idx + 1}.
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-sky-400/80'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tier 3: Top Markets News-Slide Bar + Live Tape (1H · 6H · 24H) Slide Animation Bar (Under Tabs & Above Page) */}
      {currentNewsSlide && (
        <div
          data-testid="top-markets-news-slides"
          className="w-full bg-[#050811] border-t border-white/[0.08] px-4 sm:px-6 py-2"
        >
          <div className="max-w-[1440px] mx-auto flex flex-col gap-2">
            {/* Slide Track 1: Top Markets News-Slide Carousel */}
            <div className="flex items-center justify-between gap-3">
              {/* Left Broadcast Tag & Slide Counter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                  NEWS SLIDE {currentNewsSlide.indexLabel}/0{topMarketNewsSlides.length}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
                  {currentNewsSlide.category}
                </span>
              </div>

              {/* Center Animated News Slide Content */}
              <div
                key={`news_slide_${currentNewsSlide.asset.ticker}_${newsSlideIndex}`}
                className="flex-1 min-w-0 animate-bd-slide flex items-center justify-between gap-3 bg-[#0B1120] border border-white/[0.08] rounded-xl px-3.5 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectOrAddStock(
                      currentNewsSlide.asset.ticker,
                      currentNewsSlide.asset.name,
                      currentNewsSlide.asset.sector
                    );
                    if (activeTab === 'home') {
                      setActiveTab('overview');
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 text-left group cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-extrabold text-white group-hover:text-sky-300 transition-colors">
                      {currentNewsSlide.asset.ticker}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-100 tabular-nums">
                      ${currentNewsSlide.asset.endPrice.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold tabular-nums flex items-center gap-0.5 ${
                        currentNewsSlide.asset.totalReturnPct >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {currentNewsSlide.asset.totalReturnPct >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {currentNewsSlide.asset.totalReturnPct >= 0 ? '+' : ''}
                      {currentNewsSlide.asset.totalReturnPct.toFixed(1)}%
                    </span>
                  </div>

                  {renderMiniSparkline(currentNewsSlide.asset)}

                  <span className="text-slate-600 hidden md:inline">·</span>

                  <span className="text-xs font-sans text-slate-200 truncate hidden md:block group-hover:text-white transition-colors">
                    {currentNewsSlide.headline}
                  </span>
                </button>

                {/* Companion Top Market Chips inside the News Slide */}
                <div className="hidden lg:flex items-center gap-2 shrink-0 pl-2 border-l border-white/[0.08]">
                  {currentNewsSlide.peers.map((peer) => {
                    const peerUp = peer.totalReturnPct >= 0;
                    return (
                      <button
                        key={peer.ticker}
                        type="button"
                        onClick={() => {
                          onSelectOrAddStock(peer.ticker, peer.name, peer.sector);
                          if (activeTab === 'home') {
                            setActiveTab('overview');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#11192E] hover:bg-[#192542] border border-white/[0.07] text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span className="font-bold text-white">{peer.ticker}</span>
                        <span className="text-slate-300 tabular-nums">
                          ${peer.endPrice.toFixed(2)}
                        </span>
                        <span
                          className={`tabular-nums font-semibold ${
                            peerUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {peerUp ? '+' : ''}
                          {peer.totalReturnPct.toFixed(1)}%
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-sky-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right News-Slide Controls (Slide Dots, Play/Pause, Prev/Next) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="hidden xl:flex items-center gap-1 mr-1">
                  {topMarketNewsSlides.map((s, idx) => (
                    <button
                      key={s.asset.ticker}
                      type="button"
                      onClick={() => setNewsSlideIndex(idx)}
                      aria-label={`News Slide ${idx + 1}: ${s.asset.ticker}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === newsSlideIndex
                          ? 'w-5 bg-sky-400'
                          : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewsSlidePlaying((v) => !v)}
                  aria-label={
                    isNewsSlidePlaying
                      ? 'Pause Top Markets News Slide'
                      : 'Play Top Markets News Slide'
                  }
                  className="p-1.5 rounded-lg bg-[#0E1525] hover:bg-[#162038] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isNewsSlidePlaying ? (
                    <Pause className="w-3 h-3 text-sky-400" />
                  ) : (
                    <Play className="w-3 h-3 text-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewsSlideIndex(
                      (prev) =>
                        (prev - 1 + topMarketNewsSlides.length) % topMarketNewsSlides.length
                    )
                  }
                  aria-label="Previous Top Market News Slide"
                  className="p-1.5 rounded-lg bg-[#0E1525] hover:bg-[#162038] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewsSlideIndex((prev) => (prev + 1) % topMarketNewsSlides.length)
                  }
                  aria-label="Next Top Market News Slide"
                  className="p-1.5 rounded-lg bg-[#0E1525] hover:bg-[#162038] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slide Track 2: Live Tape (1H · 6H · 24H) Animated Slide Deck (4 Spacious Cards per Slide) */}
            <div
              data-testid="live-tape-slide-deck"
              className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.06]"
            >
              {/* Left Live Tape Slide Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
                  LIVE TAPE SLIDE {currentLiveTapeSlide.indexLabel}/0{liveTapeSlides.length}
                </span>
                <span className="hidden lg:inline text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold whitespace-nowrap">
                  {currentLiveTapeSlide.label} (1H · 6H · 24H)
                </span>
              </div>

              {/* Center Animated Live Tape Slide Cards (4 Spacious Columns) */}
              <div
                key={`live_tape_slide_${currentLiveTapeSlide.id}_${liveTapeSlideIndex}`}
                className="flex-1 min-w-0 animate-live-tape-slide grid grid-cols-2 lg:grid-cols-4 gap-2.5"
              >
                {currentLiveTapeSlide.items.map((item) => {
                  const isUp24 = item.change24H >= 0;
                  const isUp1H = item.change1H >= 0;
                  const isSelected = item.ticker === activeTicker;
                  return (
                    <button
                      key={item.ticker}
                      type="button"
                      onClick={() => {
                        onSelectOrAddStock(item.ticker, item.name, item.sector);
                        if (activeTab === 'home') {
                          setActiveTab('overview');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-mono flex items-center justify-between gap-2 transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-blue-600/25 border border-sky-400/60 text-white shadow-sm'
                          : 'bg-[#0B1120] hover:bg-[#131D35] text-slate-200 border border-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-white">{item.ticker}</span>
                        <span className="text-slate-300 tabular-nums">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] tabular-nums ${
                            isUp1H ? 'text-sky-300' : 'text-amber-300'
                          }`}
                          title="1H Live Change"
                        >
                          1H {isUp1H ? '+' : ''}
                          {item.change1H.toFixed(1)}%
                        </span>
                        <span
                          className={`font-bold tabular-nums ${
                            isUp24 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                          title="24H / 1Y Return"
                        >
                          {isUp24 ? '+' : ''}
                          {item.change24H.toFixed(1)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Live Tape Slide Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="hidden xl:flex items-center gap-1 mr-1">
                  {liveTapeSlides.map((ts, idx) => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => setLiveTapeSlideIndex(idx)}
                      aria-label={`Live Tape Slide ${idx + 1}: ${ts.label}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === liveTapeSlideIndex
                          ? 'w-5 bg-emerald-400'
                          : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsLiveTapePlaying((v) => !v)}
                  aria-label={isLiveTapePlaying ? 'Pause Live Tape Slide' : 'Play Live Tape Slide'}
                  className="p-1.5 rounded-lg bg-[#0E1525] hover:bg-[#162038] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {isLiveTapePlaying ? (
                    <Pause className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Play className="w-3 h-3 text-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLiveTapeSlideIndex(
                      (prev) => (prev - 1 + liveTapeSlides.length) % liveTapeSlides.length
                    )
                  }
                  aria-label="Previous Live Tape Slide"
                  className="p-1.5 rounded-lg bg-[#0E1525] hover:bg-[#162038] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLiveTapeSlideIndex((prev) => (prev + 1) % liveTapeSlides.length)
                  }
                  aria-label="Next Live Tape Slide"
                  className="p-1.5 rounded-lg bg-[#0E1525] hover:bg-[#162038] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
