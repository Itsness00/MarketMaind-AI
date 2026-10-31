/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Official Institutional Top Navigation Header
 */

import React, { useState, useRef, useEffect } from 'react';
import { GemmaConfig, MarketSessionStatus, StockDirectoryItem } from '../types/market';
import { searchMarketStocks } from '../data/demonstrationData';
import { Settings, Bell, Search, Radio, PlusCircle, Home } from 'lucide-react';

interface NavigationHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gemmaConfig: GemmaConfig;
  marketStatus: MarketSessionStatus;
  onSelectOrAddStock: (ticker: string, name?: string, sector?: string) => void;
  onOpenSettings: () => void;
  onOpenHacktoberfest: () => void;
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
  armedAlertsCount = 0,
  triggeredAlertsCount = 0,
}) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StockDirectoryItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'overview', label: 'Market Terminal' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'analyst', label: 'AI Analyst' },
    { id: 'analytics', label: 'Quantitative' },
    { id: 'risk', label: 'Risk & Stress' },
    { id: 'report', label: 'Reports' },
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F19]/95 backdrop-blur-md px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Institutional Brand Wordmark (Clicks to Home Page) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm tracking-tighter bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              M
            </div>
            <div>
              <span className="text-base font-display font-bold tracking-tight text-white whitespace-nowrap block leading-tight">
                MARKETMIND AI
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-blue-400/80 block leading-none mt-0.5">
                Global Terminal
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Primary Navigation & Universal US + International Ticker Search */}
        <div className="hidden lg:flex items-center gap-2.5 min-w-0">
          <nav
            aria-label="Primary Navigation"
            className="flex items-center gap-2.5 text-xs font-mono font-medium text-white/65"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1.5 transition-all whitespace-nowrap shrink-0 hover:text-white cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'text-blue-400 border-b-2 border-blue-500 font-bold'
                      : 'border-b-2 border-transparent'
                  }`}
                >
                  {item.id === 'home' && <Home className="w-3 h-3" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Universal Any-Stock Search Input (US & International) */}
          <div ref={dropdownRef} className="relative w-36 xl:w-44 shrink-0">
            <form onSubmit={handleQuickSubmit} className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={quickQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setQuickQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search ticker (7203.T)..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#111827] border border-white/15 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </form>

            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-[#111827] border border-white/15 shadow-2xl overflow-hidden z-50 divide-y divide-white/5 max-h-80 overflow-y-auto">
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
                    className="w-full px-3 py-2 text-left hover:bg-blue-600/20 flex items-center justify-between gap-2 transition-colors cursor-pointer font-mono text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{stock.ticker}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-white/50">
                          {stock.exchange}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/60 truncate">{stock.name}</div>
                    </div>
                    <PlusCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 3: Alerts & Google Gemma 4 Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {/* NYSE / NASDAQ Live Market Hours Status Badge (2xl+) */}
          <div
            title={`${marketStatus.exchange} · ${marketStatus.easternTime} · ${marketStatus.nextTransition}`}
            className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono ${
              marketStatus.isOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : marketStatus.isExtendedHours
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-white/70'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                marketStatus.isOpen
                  ? 'text-emerald-400 animate-pulse'
                  : marketStatus.isExtendedHours
                  ? 'text-amber-400'
                  : 'text-white/40'
              }`}
            />
            <span className="font-bold whitespace-nowrap">{marketStatus.label}</span>
          </div>

          {/* Price & Volume Alerts Status Badge */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            title={`Market Alerts: ${armedAlertsCount} Armed, ${triggeredAlertsCount} Triggered`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              triggeredAlertsCount > 0
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 hover:border-white/20 text-white/80'
            }`}
          >
            <Bell
              className={`w-3.5 h-3.5 ${
                triggeredAlertsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-emerald-400'
              }`}
            />
            <span className="hidden xl:inline text-[11px]">ALERTS</span>
            <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] font-bold text-white">
              {armedAlertsCount}
            </span>
          </button>

          {/* Google Gemma 4 & Gemini 3.8 Status Indicator */}
          <button
            type="button"
            onClick={onOpenSettings}
            title={`Google Gemma 4 & Gemini 3.8 Engines: ${gemmaConfig.isConnected ? 'Connected' : 'Ready'}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-xs font-mono transition-all text-left cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden md:inline text-white/90 font-medium whitespace-nowrap">
              GEMMA 4 + GEMINI
            </span>
            <Settings className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Quick Navigation Strip */}
      <div className="lg:hidden max-w-7xl mx-auto pt-2 mt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white/5 text-white/70 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
