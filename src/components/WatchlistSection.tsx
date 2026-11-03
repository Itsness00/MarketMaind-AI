/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Dedicated Multi-Asset Institutional Watchlist & D3 Heatmap Manager
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AssetMetrics } from '../types/market';
import { MarketHeatmap } from './MarketHeatmap';
import { MARKET_STOCK_DIRECTORY } from '../data/demonstrationData';
import {
  Bookmark,
  Star,
  Plus,
  Search,
  BarChart2,
  FileText,
  Bell,
  ArrowUpDown,
} from 'lucide-react';

interface WatchlistSectionProps {
  assetSummaries: AssetMetrics[];
  activeTicker: string;
  onSelectTickerForTerminal: (ticker: string) => void;
  onSelectTickerForAI: (ticker: string) => void;
  onSelectTickerForReport: (ticker: string) => void;
  onSelectOrAddStock: (ticker: string, name?: string, sector?: string) => void;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  assetSummaries,
  activeTicker,
  onSelectTickerForTerminal,
  onSelectTickerForAI,
  onSelectTickerForReport,
  onSelectOrAddStock,
}) => {
  const [starredTickers, setStarredTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('marketmind_starred_watchlist_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return ['NVDA', 'AAPL', 'MSFT', 'META', 'AMZN', 'AVGO'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('marketmind_starred_watchlist_v1', JSON.stringify(starredTickers));
    } catch {
      // Ignore
    }
  }, [starredTickers]);

  const [filterMode, setFilterMode] = useState<'ALL' | 'STARRED' | 'GAINERS' | 'LOSERS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newTickerSymbol, setNewTickerSymbol] = useState<string>('');
  const [sortBy, setSortBy] = useState<'totalReturnPct' | 'annualizedVolatility' | 'sharpeRatio'>(
    'totalReturnPct'
  );
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const toggleStar = (ticker: string) => {
    setStarredTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  const handleAddTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newTickerSymbol.trim().toUpperCase();
    if (!cleaned) return;
    const match = MARKET_STOCK_DIRECTORY.find((s) => s.ticker.toUpperCase() === cleaned);
    onSelectOrAddStock(cleaned, match?.name, match?.sector);
    if (!starredTickers.includes(cleaned)) {
      setStarredTickers((prev) => [cleaned, ...prev]);
    }
    setNewTickerSymbol('');
  };

  const filteredWatchlist = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assetSummaries
      .filter((item) => {
        if (filterMode === 'STARRED' && !starredTickers.includes(item.ticker)) return false;
        if (filterMode === 'GAINERS' && item.totalReturnPct < 0) return false;
        if (filterMode === 'LOSERS' && item.totalReturnPct >= 0) return false;
        if (!q) return true;
        return (
          item.ticker.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          (item.sector || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const diff = a[sortBy] - b[sortBy];
        return sortAsc ? diff : -diff;
      });
  }, [assetSummaries, filterMode, starredTickers, searchQuery, sortBy, sortAsc]);

  return (
    <div className="space-y-6">
      {/* Header & Add to Watchlist Bar */}
      <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Bookmark className="w-4 h-4" />
              <span>INSTITUTIONAL WATCHLIST & PERFORMANCE MONITOR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              Active Multi-Asset Watchlist ({assetSummaries.length} Securities)
            </h2>
          </div>

          <form onSubmit={handleAddTickerSubmit} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newTickerSymbol}
              onChange={(e) => setNewTickerSymbol(e.target.value)}
              placeholder="Add symbol (e.g. LLY, 7203.T, ASML)..."
              aria-label="Add symbol to Watchlist"
              className="w-60 px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-mono text-white placeholder-white/45 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Watchlist
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: `All Watchlist (${assetSummaries.length})` },
                { id: 'STARRED', label: `Starred Favorites (${starredTickers.length})` },
                {
                  id: 'GAINERS',
                  label: `Advancing (${assetSummaries.filter((a) => a.totalReturnPct >= 0).length})`,
                },
                {
                  id: 'LOSERS',
                  label: `Declining (${assetSummaries.filter((a) => a.totalReturnPct < 0).length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border cursor-pointer ${
                  filterMode === tab.id
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-black text-white/75 border-white/15 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-white/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter watchlist..."
              aria-label="Filter Watchlist"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-mono text-white placeholder-white/45"
            />
          </div>
        </div>
      </div>

      {/* D3 Top 20 Watchlist Heatmap */}
      <MarketHeatmap
        assetSummaries={assetSummaries}
        activeTicker={activeTicker}
        onSelectTicker={onSelectTickerForTerminal}
      />

      {/* Watchlist Quantitative Table */}
      <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-white/60">
                <th className="py-2.5 px-3">Fav</th>
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Company / Instrument</th>
                <th className="py-2.5 px-3 text-right">Last Price</th>
                <th className="py-2.5 px-3 text-right">1D Return</th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'totalReturnPct') setSortAsc(!sortAsc);
                    else {
                      setSortBy('totalReturnPct');
                      setSortAsc(false);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Total Return <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'annualizedVolatility') setSortAsc(!sortAsc);
                    else {
                      setSortBy('annualizedVolatility');
                      setSortAsc(false);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Volatility <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'sharpeRatio') setSortAsc(!sortAsc);
                    else {
                      setSortBy('sharpeRatio');
                      setSortAsc(false);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    Sharpe <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-2.5 px-3 text-right">SMA 50 / 200</th>
                <th className="py-2.5 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs font-mono tabular-nums">
              {filteredWatchlist.map((asset) => {
                const isStarred = starredTickers.includes(asset.ticker);
                const dayReturn =
                  asset.dailyReturns && asset.dailyReturns.length > 0
                    ? asset.dailyReturns[asset.dailyReturns.length - 1].returnPct
                    : 0;
                const isTotalPos = asset.totalReturnPct >= 0;
                const isDayPos = dayReturn >= 0;

                return (
                  <tr
                    key={asset.ticker}
                    className={`hover:bg-white/[0.04] transition-colors ${
                      asset.ticker === activeTicker ? 'bg-blue-600/15' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => toggleStar(asset.ticker)}
                        aria-label={`Star ${asset.ticker}`}
                        className="cursor-pointer text-white/50 hover:text-amber-400"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{asset.ticker}</td>
                    <td className="py-2.5 px-3 font-sans text-white/85">
                      {asset.name}{' '}
                      <span className="text-white/45 text-[11px]">· {asset.sector}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-white">
                      ${asset.endPrice.toFixed(2)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-semibold ${
                        isDayPos ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isDayPos ? '+' : ''}
                      {dayReturn.toFixed(2)}%
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isTotalPos ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isTotalPos ? '+' : ''}
                      {asset.totalReturnPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/80">
                      {asset.annualizedVolatility.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-400 font-semibold">
                      {asset.sharpeRatio.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/70">
                      ${asset.currentSMA50.toFixed(0)} / ${asset.currentSMA200.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectTickerForTerminal(asset.ticker)}
                          title="Open in Market Terminal"
                          className="px-2 py-1 rounded bg-white/10 hover:bg-blue-600 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <BarChart2 className="w-3 h-3" />
                          Chart
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTickerForAI(asset.ticker)}
                          title="Inspect AI Buy/Sell Signal"
                          className="px-2 py-1 rounded bg-white/10 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Bell className="w-3 h-3" />
                          Signal
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTickerForReport(asset.ticker)}
                          title="Generate 9-Section Report"
                          className="px-2 py-1 rounded bg-white/10 hover:bg-blue-600 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
