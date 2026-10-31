/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Official Institutional Top Navigation Header & Live Ticker Tape
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  AssetMetrics,
  GemmaConfig,
  MarketSessionStatus,
  StockDirectoryItem,
  UserProfile,
} from '../types/market';
import { searchMarketStocks } from '../data/demonstrationData';
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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090C15]/95 backdrop-blur-xl transition-colors">
      {/* Tier 1: Riddle UI Top Command Bar (Brand, Universal Search, Live Telemetry Controls) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-base tracking-tighter bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] border border-white/15">
              M
            </div>
            <div>
              <span className="text-base font-display font-bold tracking-tight text-white whitespace-nowrap block leading-tight">
                MARKETMIND AI
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 block leading-none mt-0.5">
                Riddle UI Terminal · Gemma 4 & Gemini
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
              className="w-full pl-10 pr-16 py-2 rounded-xl bg-[#0E1320] border border-white/[0.08] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-[10px] font-mono text-slate-400">
              12 EXCH
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

        {/* Zone 3: Riddle UI Utility Controls (Live Stream, Sources, Alerts, AI Engine, Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleAutoStream && (
            <button
              type="button"
              onClick={onToggleAutoStream}
              title="Toggle Real-Time Market Tick Stream (1H / 6H / Live)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                isAutoStreaming
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#0E1320] border-white/[0.08] text-slate-400 hover:text-white'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isAutoStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                }`}
              />
              <span className="font-bold">{isAutoStreaming ? 'LIVE 1H/6H ON' : 'LIVE OFF'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('news')}
            title={`Active Open-Source Data & News Connectors (${openSourcesCount})`}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1320] border border-white/[0.08] hover:border-indigo-500/40 text-xs font-mono text-slate-300 cursor-pointer whitespace-nowrap"
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
            <Bell
              className={`w-3.5 h-3.5 ${
                triggeredAlertsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-emerald-400'
              }`}
            />
            <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] font-bold text-white">
              {armedAlertsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title={`Google Gemma 4 & Gemini 3.8 Engines: ${gemmaConfig.isConnected ? 'Connected' : 'Ready'}`}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E1320] border border-white/[0.08] hover:border-white/20 text-xs font-mono transition-all text-left cursor-pointer whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden 2xl:inline text-slate-200 font-medium">
              GEMMA 4 + GEMINI
            </span>
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            title={`Analyst Profile: ${userProfile?.fullName || 'Institutional Analyst'}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-mono text-indigo-200 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
              {userProfile?.avatarInitials || 'MM'}
            </span>
            <span className="hidden md:inline text-xs font-semibold text-white truncate max-w-[90px]">
              {userProfile?.fullName?.split(' ')[0] || 'Profile'}
            </span>
          </button>
        </div>
      </div>

      {/* Tier 2: Dedicated Riddle UI Segmented Navigation Bar (Unbunched, Generous Spacing) */}
      <div className="w-full border-t border-white/[0.06] bg-[#0B0F1A]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <nav
            aria-label="Primary Workspace Navigation"
            data-testid="top-navigation-tabs"
            className="flex items-center gap-2 sm:gap-3"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-[0_4px_16px_rgba(37,99,235,0.4)] border border-blue-400/50'
                      : 'bg-[#121827] text-slate-300 hover:text-white hover:bg-[#182135] border border-white/[0.06]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-white' : 'text-blue-400/80'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Session Clock Pill on Right of Tab Bar */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E1320] border border-white/[0.07] shrink-0 text-[11px] font-mono text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isAutoStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="uppercase tracking-wider text-slate-300">{marketStatus.label}</span>
            <span className="text-slate-500">·</span>
            <span>{marketStatus.easternTime}</span>
          </div>
        </div>
      </div>

      {/* Tier 3: Live Streaming Market Ticker Tape */}
      {assetSummaries.length > 0 && (
        <div className="w-full bg-[#070A12] border-t border-white/[0.05] px-4 sm:px-6 py-1.5">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                LIVE TAPE (1H · 6H · 24H)
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto py-0.5">
              {assetSummaries.slice(0, 10).map((asset) => {
                const isUp = asset.totalReturnPct >= 0;
                const isSelected = asset.ticker === activeTicker;
                return (
                  <button
                    key={asset.ticker}
                    type="button"
                    onClick={() => {
                      onSelectOrAddStock(asset.ticker, asset.name, asset.sector);
                      if (activeTab === 'home') {
                        setActiveTab('overview');
                      }
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/25 border border-blue-500/40 text-white'
                        : 'hover:bg-white/5 text-slate-300 border border-transparent'
                    }`}
                  >
                    <span className="font-bold text-white">{asset.ticker}</span>
                    <span className="text-slate-200">${asset.endPrice.toFixed(2)}</span>
                    <span className={isUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {isUp ? '+' : ''}
                      {asset.totalReturnPct.toFixed(1)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
