/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Real-Time Institutional Portfolio & Watchlist Holdings Tracker
 */

import React, { useState, useMemo } from 'react';
import {
  AssetMetrics,
  MarketSessionStatus,
  PortfolioHolding,
} from '../types/market';
import { computePortfolioMetrics } from '../utils/analytics';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Play,
  Pause,
  Zap,
  Plus,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface PortfolioSectionProps {
  assetSummaries: AssetMetrics[];
  holdings: PortfolioHolding[];
  onUpdateHolding: (ticker: string, shares: number, avgCostPerShare: number) => void;
  onResetHoldings: () => void;
  marketStatus: MarketSessionStatus;
  onSimulateMarketTick: (
    targetTicker?: string,
    shockPct?: number,
    volumeMultiplier?: number
  ) => void;
  isAutoStreaming: boolean;
  setIsAutoStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectTickerForTerminal: (ticker: string) => void;
  onSelectOrAddStock: (ticker: string, name?: string, sector?: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  assetSummaries,
  holdings,
  onUpdateHolding,
  onResetHoldings,
  marketStatus,
  onSimulateMarketTick,
  isAutoStreaming,
  setIsAutoStreaming,
  onSelectTickerForTerminal,
  onSelectOrAddStock,
}) => {
  const portfolio = useMemo(
    () => computePortfolioMetrics(holdings, assetSummaries),
    [holdings, assetSummaries]
  );

  // Quick Add / Update Position form state
  const [selectedTicker, setSelectedTicker] = useState<string>(
    assetSummaries[0]?.ticker || 'NVDA'
  );
  const [customSymbolInput, setCustomSymbolInput] = useState<string>('');
  const [sharesInput, setSharesInput] = useState<string>('100');
  const [avgCostInput, setAvgCostInput] = useState<string>(() => {
    const first = assetSummaries[0];
    return first ? first.startPrice.toFixed(2) : '125.00';
  });
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Sync default cost input when user picks a different watchlist stock in the quick editor
  const handleSelectWatchlistTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    const existing = portfolio.positions.find((p) => p.ticker === ticker);
    if (existing) {
      setSharesInput(existing.shares > 0 ? String(existing.shares) : '50');
      setAvgCostInput(existing.avgCostPerShare.toFixed(2));
    } else {
      const summary = assetSummaries.find((a) => a.ticker === ticker);
      if (summary) {
        setSharesInput('50');
        setAvgCostInput(summary.startPrice.toFixed(2));
      }
    }
  };

  const handleQuickSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTicker = customSymbolInput.trim()
      ? customSymbolInput.trim().toUpperCase()
      : selectedTicker;
    if (!targetTicker) return;

    const parsedShares = Math.max(0, parseFloat(sharesInput) || 0);
    const parsedCost = Math.max(0.01, parseFloat(avgCostInput) || 100);

    // If custom ticker isn't in the watchlist yet, dynamically add it to the watchlist too
    if (!assetSummaries.some((a) => a.ticker === targetTicker)) {
      onSelectOrAddStock(targetTicker);
    }

    onUpdateHolding(targetTicker, parsedShares, parsedCost);
    setCustomSymbolInput('');
    setSelectedTicker(targetTicker);
    setFeedbackBanner(
      `Updated ${targetTicker} position: ${parsedShares.toLocaleString()} shares @ $${parsedCost.toFixed(2)} avg cost.`
    );
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  const formatCurrency = (val: number) => {
    const abs = Math.abs(val);
    const formatted = abs.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return val < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const formatSignedCurrency = (val: number) => {
    const abs = Math.abs(val);
    const formatted = abs.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (val > 0) return `+$${formatted}`;
    if (val < 0) return `-$${formatted}`;
    return `$0.00`;
  };

  const formatSignedPct = (val: number) => {
    if (val > 0) return `+${val.toFixed(2)}%`;
    if (val < 0) return `${val.toFixed(2)}%`;
    return `0.00%`;
  };

  const activePositions = portfolio.positions.filter((p) => p.shares > 0);

  // Allocation bar palette
  const barColors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-teal-500',
    'bg-rose-500',
  ];

  return (
    <section className="space-y-8" aria-label="Portfolio Holdings and Real-Time Unrealized P&L">
      {/* Top Header & Live Market Feed Controls */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold text-white tracking-tight">
                  Institutional Portfolio & Live P&L Tracker
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Real-Time Mark-to-Market
                </span>
              </div>
              <p className="text-xs font-mono text-white/60">
                Input share quantities & cost basis for your watchlist stocks to track live unrealized gains and losses.
              </p>
            </div>
          </div>
        </div>

        {/* Live Market Feed Simulation & Stream Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoStreaming((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
              isAutoStreaming
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
            }`}
          >
            {isAutoStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>LIVE FEED STREAMING</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-blue-400" />
                <span>STREAM LIVE TICKS</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSimulateMarketTick()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Step Live Tick</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateMarketTick(undefined, 2.5)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+2.5% Market Rally</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateMarketTick(undefined, -2.5)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-2.5% Pullback</span>
          </button>

          <button
            type="button"
            onClick={onResetHoldings}
            title="Reset portfolio holdings to institutional defaults"
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default Shares</span>
          </button>
        </div>
      </div>

      {/* Top 4 Portfolio Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Market Value */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span>TOTAL PORTFOLIO VALUE</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div
            className="text-2xl font-mono font-bold text-white tracking-tight"
            data-testid="portfolio-total-value"
          >
            {formatCurrency(portfolio.totalMarketValue)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1 border-t border-white/5">
            <span>{portfolio.activePositionsCount} Active Holdings</span>
            <span>{portfolio.totalSharesCount.toLocaleString()} Total Shares</span>
          </div>
        </div>

        {/* Card 2: Total Unrealized Gains / Losses ($ & %) */}
        <div
          className={`p-5 rounded-2xl border space-y-2 ${
            portfolio.totalUnrealizedPnL >= 0
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono text-white/70">
            <span>UNREALIZED GAIN / LOSS</span>
            {portfolio.totalUnrealizedPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-2xl font-mono font-bold tracking-tight ${
              portfolio.totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
            data-testid="portfolio-unrealized-pnl"
          >
            {formatSignedCurrency(portfolio.totalUnrealizedPnL)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-white/10">
            <span className="text-white/60">Total Return vs Basis</span>
            <span
              className={`font-bold ${
                portfolio.totalUnrealizedPnLPct >= 0 ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {formatSignedPct(portfolio.totalUnrealizedPnLPct)}
            </span>
          </div>
        </div>

        {/* Card 3: Session / Intraday P&L */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span>LIVE SESSION P&L (1D)</span>
            <PieChart className="w-4 h-4 text-indigo-400" />
          </div>
          <div
            className={`text-2xl font-mono font-bold tracking-tight ${
              portfolio.totalDayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatSignedCurrency(portfolio.totalDayPnL)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1 border-t border-white/5">
            <span>{marketStatus.label}</span>
            <span
              className={`font-bold ${
                portfolio.totalDayPnLPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatSignedPct(portfolio.totalDayPnLPct)}
            </span>
          </div>
        </div>

        {/* Card 4: Total Cost Basis */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span>TOTAL COST BASIS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {formatCurrency(portfolio.totalCostBasis)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1 border-t border-white/5">
            <span>Watchlist Coverage</span>
            <span>{assetSummaries.length} Tracked Equities</span>
          </div>
        </div>
      </div>

      {/* Portfolio Allocation Visual Distribution Bar */}
      {activePositions.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#111827] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/80 font-bold uppercase tracking-wider">
              Portfolio Capital Allocation & Unrealized P&L Attribution
            </span>
            <span className="text-white/50">
              100% Invested across {activePositions.length} Watchlist Stocks
            </span>
          </div>

          <div className="h-3.5 w-full rounded-full bg-black/50 overflow-hidden flex border border-white/10">
            {activePositions.map((pos, idx) => (
              <div
                key={pos.ticker}
                style={{ width: `${Math.max(pos.allocationWeightPct, 1)}%` }}
                title={`${pos.ticker}: ${pos.allocationWeightPct.toFixed(1)}% (${formatCurrency(
                  pos.marketValue
                )})`}
                className={`${barColors[idx % barColors.length]} h-full transition-all duration-300`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            {activePositions.map((pos, idx) => (
              <div key={pos.ticker} className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={`w-2.5 h-2.5 rounded-sm ${barColors[idx % barColors.length]}`}
                />
                <span className="font-bold text-white">{pos.ticker}</span>
                <span className="text-white/50">{pos.allocationWeightPct.toFixed(1)}%</span>
                <span
                  className={
                    pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  ({formatSignedPct(pos.unrealizedPnLPct)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Position Input Form (Add / Update Shares for Any Watchlist or Market Stock) */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Update Watchlist Share Position or Add New Stock Holding
            </h3>
            <p className="text-xs font-mono text-white/50">
              Select a stock from your watchlist (or type any NYSE/NASDAQ symbol), set the number of shares you own, and track real-time P&L.
            </p>
          </div>
          {feedbackBanner && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{feedbackBanner}</span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleQuickSavePosition}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          {/* Watchlist Stock Selector */}
          <div className="space-y-1">
            <label
              htmlFor="portfolio-watchlist-select"
              className="block text-[11px] font-mono text-white/60 uppercase"
            >
              Watchlist Stock
            </label>
            <select
              id="portfolio-watchlist-select"
              value={selectedTicker}
              onChange={(e) => handleSelectWatchlistTicker(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            >
              {assetSummaries.map((a) => (
                <option key={a.ticker} value={a.ticker}>
                  {a.ticker} — {a.name} (${a.endPrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Optional Custom Ticker Input */}
          <div className="space-y-1">
            <label
              htmlFor="portfolio-custom-ticker"
              className="block text-[11px] font-mono text-white/60 uppercase"
            >
              Or Any Market Ticker
            </label>
            <input
              id="portfolio-custom-ticker"
              type="text"
              value={customSymbolInput}
              onChange={(e) => setCustomSymbolInput(e.target.value.toUpperCase())}
              placeholder="Optional (e.g. AMD, NFLX)"
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/15 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Number of Shares Owned */}
          <div className="space-y-1">
            <label
              htmlFor="portfolio-shares-input"
              className="block text-[11px] font-mono text-white/60 uppercase"
            >
              Shares Owned
            </label>
            <input
              id="portfolio-shares-input"
              type="number"
              min="0"
              step="any"
              value={sharesInput}
              onChange={(e) => setSharesInput(e.target.value)}
              placeholder="e.g. 150"
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Average Cost Basis Per Share ($) */}
          <div className="space-y-1">
            <label
              htmlFor="portfolio-avg-cost-input"
              className="block text-[11px] font-mono text-white/60 uppercase"
            >
              Avg Cost / Share ($)
            </label>
            <input
              id="portfolio-avg-cost-input"
              type="number"
              min="0.01"
              step="any"
              value={avgCostInput}
              onChange={(e) => setAvgCostInput(e.target.value)}
              placeholder="e.g. 120.00"
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-lg transition-all cursor-pointer h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Save Position</span>
          </button>
        </form>
      </div>

      {/* Watchlist Holdings & Real-Time Unrealized Gains/Losses Table */}
      <div className="rounded-2xl bg-[#111827] border border-white/10 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Watchlist Stocks — Live Share Holdings & Unrealized P&L Ledger
            </h3>
            <p className="text-xs font-mono text-white/50">
              Edit shares or cost basis directly in any row below. Unrealized gains/losses recalculate instantaneously with every live market tick.
            </p>
          </div>
          <span className="text-xs font-mono text-blue-400">
            Showing all {portfolio.positions.length} Watchlist Stocks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0B0F19]/60 text-[11px] font-mono text-white/50 uppercase">
                <th className="py-3.5 px-4">Asset</th>
                <th className="py-3.5 px-4">Shares Owned</th>
                <th className="py-3.5 px-4">Avg Cost / Share</th>
                <th className="py-3.5 px-4 text-right">Live Price (1D)</th>
                <th className="py-3.5 px-4 text-right">Cost Basis</th>
                <th className="py-3.5 px-4 text-right">Market Value</th>
                <th className="py-3.5 px-4 text-right">Unrealized Gain / Loss</th>
                <th className="py-3.5 px-4 text-right">Session P&L</th>
                <th className="py-3.5 px-4 text-right">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {portfolio.positions.map((pos) => {
                const isPositive = pos.unrealizedPnL >= 0;
                const isDayPositive = pos.dayPnL >= 0;
                const hasPosition = pos.shares > 0;

                return (
                  <tr
                    key={pos.ticker}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      hasPosition ? 'bg-transparent' : 'opacity-65'
                    }`}
                  >
                    {/* Asset Ticker & Name */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onSelectTickerForTerminal(pos.ticker)}
                        className="text-left group cursor-pointer focus:outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                            {pos.ticker}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                            {pos.sector}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/50 truncate max-w-[160px]">
                          {pos.name}
                        </div>
                      </button>
                    </td>

                    {/* Inline Shares Input + Quick Stepper Buttons */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          aria-label={`Shares owned for ${pos.ticker}`}
                          value={pos.shares}
                          onChange={(e) => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                            onUpdateHolding(pos.ticker, val, pos.avgCostPerShare);
                          }}
                          className="w-24 px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-white/15 text-white font-bold focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateHolding(
                              pos.ticker,
                              pos.shares + 10,
                              pos.avgCostPerShare
                            )
                          }
                          title={`Add 10 shares of ${pos.ticker}`}
                          className="px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    {/* Inline Average Cost Per Share Input */}
                    <td className="py-3.5 px-4">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40">
                          $
                        </span>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          aria-label={`Average cost for ${pos.ticker}`}
                          value={pos.avgCostPerShare}
                          onChange={(e) => {
                            const val = Math.max(0.01, parseFloat(e.target.value) || 0.01);
                            onUpdateHolding(pos.ticker, pos.shares, val);
                          }}
                          className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-[#0B0F19] border border-white/15 text-white/90 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </td>

                    {/* Live Market Price & 1D Return % */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-bold text-white">
                        ${pos.currentPrice.toFixed(2)}
                      </div>
                      <div
                        className={`text-[11px] ${
                          pos.dayReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatSignedPct(pos.dayReturnPct)}
                      </div>
                    </td>

                    {/* Total Cost Basis */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-white/70">
                      {hasPosition ? formatCurrency(pos.costBasisTotal) : '—'}
                    </td>

                    {/* Current Market Value */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-white">
                      {hasPosition ? formatCurrency(pos.marketValue) : '$0.00'}
                    </td>

                    {/* Unrealized Gain / Loss ($ & %) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {hasPosition ? (
                        <div className="inline-flex flex-col items-end">
                          <span
                            className={`font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatSignedCurrency(pos.unrealizedPnL)}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded ${
                              isPositive
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            {formatSignedPct(pos.unrealizedPnLPct)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/30">0 shares</span>
                      )}
                    </td>

                    {/* Session / 1D P&L */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {hasPosition ? (
                        <span
                          className={`font-medium ${
                            isDayPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatSignedCurrency(pos.dayPnL)}
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>

                    {/* Portfolio Allocation Weight % */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-white/70 w-12 text-right">
                          {pos.allocationWeightPct.toFixed(1)}%
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, pos.allocationWeightPct)}%` }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
