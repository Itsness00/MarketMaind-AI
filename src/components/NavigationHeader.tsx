/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Top Dual Live Tickers (News Ticker + Multi-Asset Stock Ticker) & Institutional Navigation Header
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  AssetMetrics,
  GemmaConfig,
  MarketSessionStatus,
  StockDirectoryItem,
  UserProfile,
} from '../types/market';
import { searchMarketStocks } from '../data/demonstrationData';
import {
  INSTITUTIONAL_NEWS_FEED,
  INITIAL_GLOBAL_INSTRUMENTS,
  GlobalMarketInstrument,
  CuratedNewsArticle,
} from '../data/globalMarketsData';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Newspaper,
  Settings,
  BarChart2,
  Briefcase,
  Activity,
  Bell,
  Bookmark,
  FileText,
  Radio,
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
  globalInstruments?: GlobalMarketInstrument[];
  newsArticles?: CuratedNewsArticle[];
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  setActiveTab,
  gemmaConfig,
  onSelectOrAddStock,
  onOpenSettings,
  onOpenProfile,
  userProfile,
  isAutoStreaming = true,
  onToggleAutoStream,
  assetSummaries = [],
  activeTicker = 'NVDA',
  globalInstruments = INITIAL_GLOBAL_INSTRUMENTS,
  newsArticles = INSTITUTIONAL_NEWS_FEED,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Top News Ticker State
  const [newsIndex, setNewsIndex] = useState<number>(0);
  const [isNewsPaused, setIsNewsPaused] = useState<boolean>(false);

  // Top Stock Ticker State
  const [stockSlideIndex, setStockSlideIndex] = useState<number>(0);
  const [isStockTickerPaused, setIsStockTickerPaused] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults: StockDirectoryItem[] = searchQuery.trim()
    ? searchMarketStocks(searchQuery, 8)
    : [];

  const handleSelectStock = (stock: StockDirectoryItem) => {
    onSelectOrAddStock(stock.ticker, stock.name, stock.sector);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setActiveTab('terminal');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchQuery.trim().toUpperCase();
    if (!cleaned) return;
    if (searchResults.length > 0 && searchResults[0].ticker === cleaned) {
      handleSelectStock(searchResults[0]);
    } else {
      onSelectOrAddStock(cleaned);
      setSearchQuery('');
      setIsDropdownOpen(false);
      setActiveTab('terminal');
    }
  };

  // Merge live assetSummaries prices into globalInstruments for the top Stock Ticker
  const mergedStockStrip = useMemo(() => {
    const summaryMap = new Map<string, AssetMetrics>();
    for (const s of assetSummaries) {
      summaryMap.set(s.ticker.toUpperCase(), s);
    }

    return globalInstruments.map((inst) => {
      const match = summaryMap.get(inst.symbol.toUpperCase());
      if (!match) return inst;
      const lastDayReturn =
        match.dailyReturns && match.dailyReturns.length > 0
          ? match.dailyReturns[match.dailyReturns.length - 1].returnPct
          : inst.changePct;
      return {
        ...inst,
        price: Number(match.endPrice.toFixed(2)),
        changePct: Number(lastDayReturn.toFixed(2)),
      };
    });
  }, [globalInstruments, assetSummaries]);

  // Group stock ticker items into pages of 6 for crisp, readable top-bar sliding
  const stockSlides = useMemo(() => {
    const pages: GlobalMarketInstrument[][] = [];
    const chunkSize = 6;
    for (let i = 0; i < mergedStockStrip.length; i += chunkSize) {
      pages.push(mergedStockStrip.slice(i, i + chunkSize));
    }
    return pages.length > 0 ? pages : [[]];
  }, [mergedStockStrip]);

  useEffect(() => {
    if (isNewsPaused || newsArticles.length <= 1) return;
    const timer = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % newsArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isNewsPaused, newsArticles.length]);

  useEffect(() => {
    if (isStockTickerPaused || stockSlides.length <= 1) return;
    const timer = setInterval(() => {
      setStockSlideIndex((prev) => (prev + 1) % stockSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isStockTickerPaused, stockSlides.length]);

  const currentNews = newsArticles[newsIndex % Math.max(1, newsArticles.length)] || newsArticles[0];
  const currentStockSlide = stockSlides[stockSlideIndex % Math.max(1, stockSlides.length)] || [];

  const navItems = [
    { id: 'terminal', label: 'Market Terminal', icon: BarChart2 },
    { id: 'news', label: 'News Wire', icon: Newspaper },
    { id: 'portfolio', label: 'Portfolio & Net Worth', icon: Briefcase },
    { id: 'analytics', label: 'Quant Metrics', icon: Activity },
    { id: 'ai-alerts', label: 'AI Alerts (Buy/Sell)', icon: Bell },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030508]/95 backdrop-blur-md border-b border-white/15">
      {/* ===================================================================== */}
      {/* TOP BAR 1: LIVE FINANCIAL NEWS TICKER (WSJ, Bloomberg, MarketWatch...) */}
      {/* ===================================================================== */}
      <div
        aria-label="Top Financial News Ticker"
        data-testid="top-news-ticker"
        className="w-full bg-[#060913] border-b border-white/10 px-3 sm:px-6 py-1.5"
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-mono font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
              <Newspaper className="w-3 h-3" />
              NEWS TICKER
            </span>
            {currentNews && (
              <button
                type="button"
                onClick={() => setActiveTab('news')}
                className="flex items-center gap-2 min-w-0 flex-1 text-left group cursor-pointer"
              >
                <span className="text-xs font-mono font-bold text-blue-400 whitespace-nowrap shrink-0">
                  [{currentNews.source}]
                </span>
                <span className="text-xs text-white/95 font-medium truncate group-hover:text-blue-300 transition-colors">
                  {currentNews.headline}
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-white/55 whitespace-nowrap shrink-0">
                  · {currentNews.relatedTickers.slice(0, 3).join(', ')} · {currentNews.publishedAt}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden md:inline text-[11px] font-mono text-white/50 tabular-nums mr-1">
              {String((newsIndex % newsArticles.length) + 1).padStart(2, '0')}/
              {String(newsArticles.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setIsNewsPaused((p) => !p)}
              aria-label={isNewsPaused ? 'Play News Ticker' : 'Pause News Ticker'}
              className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              {isNewsPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() =>
                setNewsIndex((prev) => (prev - 1 + newsArticles.length) % newsArticles.length)
              }
              aria-label="Previous News Headline"
              className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setNewsIndex((prev) => (prev + 1) % newsArticles.length)}
              aria-label="Next News Headline"
              className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TOP BAR 2: LIVE MULTI-ASSET STOCK TICKER (US, EU, Asia, Crypto, FX)   */}
      {/* ===================================================================== */}
      <div
        aria-label="Top Multi-Asset Stock Ticker"
        data-testid="top-stock-ticker"
        className="w-full bg-[#04060C] border-b border-white/10 px-3 sm:px-6 py-1.5"
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold tracking-wider uppercase whitespace-nowrap shrink-0">
              <Radio className="w-3 h-3" />
              STOCK TICKER
            </span>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              {currentStockSlide.map((item) => {
                const isPos = item.changePct >= 0;
                const isSelected = activeTicker.toUpperCase() === item.symbol.toUpperCase();
                return (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => {
                      onSelectOrAddStock(item.symbol, item.name, item.categoryLabel);
                      setActiveTab('terminal');
                    }}
                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-white/90 hover:bg-white/10 hover:border-white/25'
                    }`}
                  >
                    <span className="font-bold text-white">{item.symbol}</span>
                    <span className="text-white/80">
                      {item.unitPrefix}
                      {item.price.toLocaleString(undefined, {
                        minimumFractionDigits: item.price < 10 ? 2 : 2,
                        maximumFractionDigits: item.price < 10 ? 4 : 2,
                      })}
                      {item.unitSuffix}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        isPos ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPos ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPos ? '+' : ''}
                      {item.changePct.toFixed(2)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden md:inline text-[11px] font-mono text-white/50 tabular-nums mr-1">
              DESK {stockSlideIndex + 1}/{stockSlides.length}
            </span>
            <button
              type="button"
              onClick={() => setIsStockTickerPaused((p) => !p)}
              aria-label={isStockTickerPaused ? 'Play Stock Ticker' : 'Pause Stock Ticker'}
              className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              {isStockTickerPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() =>
                setStockSlideIndex((prev) => (prev - 1 + stockSlides.length) % stockSlides.length)
              }
              aria-label="Previous Stock Ticker Page"
              className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setStockSlideIndex((prev) => (prev + 1) % stockSlides.length)}
              aria-label="Next Stock Ticker Page"
              className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TOP BAR 3: MAIN NAVIGATION & GLOBAL SEARCH                            */}
      {/* ===================================================================== */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('terminal')}
          className="flex items-center gap-2 text-left cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-display font-extrabold text-xs text-white">
            MM
          </div>
          <span className="font-display font-extrabold text-base tracking-tight text-white">
            MarketMind AI
          </span>
        </button>

        {/* Primary Workspace Navigation Links */}
        <nav
          aria-label="Primary Workspace Navigation"
          className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] xl:text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-white/75 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Search + AI Engine + Profile */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div ref={dropdownRef} className="relative w-32 xl:w-40">
            <form onSubmit={handleCustomSubmit}>
              <Search className="w-3.5 h-3.5 text-white/50 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search ticker..."
                aria-label="Search any global ticker"
                className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder-white/45 focus:outline-none focus:border-blue-500 font-mono"
              />
            </form>

            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-1.5 w-80 rounded-xl bg-[#070A12] border border-white/20 shadow-2xl overflow-hidden z-50">
                <div className="max-h-64 overflow-y-auto divide-y divide-white/10">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.ticker}
                      type="button"
                      onClick={() => handleSelectStock(stock)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-blue-600/20 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-xs text-white">
                          {stock.ticker}{' '}
                          <span className="text-white/50 font-normal">· {stock.exchange}</span>
                        </div>
                        <div className="text-xs text-white/70 truncate">{stock.name}</div>
                      </div>
                      <span className="text-xs font-mono text-blue-400 shrink-0">
                        ${stock.basePrice.toFixed(2)}
                      </span>
                    </button>
                  ))}
                  {searchResults.length === 0 && (
                    <button
                      type="button"
                      onClick={handleCustomSubmit}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-blue-600/20 text-xs font-mono text-blue-300 cursor-pointer"
                    >
                      Load custom symbol &ldquo;{searchQuery.trim().toUpperCase()}&rdquo; →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {onToggleAutoStream && (
            <button
              type="button"
              onClick={onToggleAutoStream}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isAutoStreaming
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/15 text-white/65'
              }`}
            >
              {isAutoStreaming ? 'LIVE ON' : 'PAUSED'}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            title="Configure Google Gemma 4:31B (Ollama) & Gemini 3.8 Engines"
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">
              {gemmaConfig.isConnected ? 'Gemma 4 + Gemini' : 'Gemini + Ollama'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            {userProfile?.avatarInitials || 'AM'}
          </button>
        </div>
      </div>
    </header>
  );
};
