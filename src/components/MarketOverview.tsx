/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Multi-Asset Market Terminal
 * US Market, Europe Market, Asia Market, Crypto, Rates, Commodities, Currencies + D3 All-Markets Heatwave
 * Trending Tickers, Top Gainers, Top Losers & Top Economic Events
 */

import React, { useState, useMemo } from 'react';
import {
  MarketDataPoint,
  AssetMetrics,
  PriceAlert,
  MarketSessionStatus,
} from '../types/market';
import { InteractiveChart, ChartTimeframe } from './InteractiveChart';
import { MarketHeatmap } from './MarketHeatmap';
import { GlobalMarketHeatwave } from './GlobalMarketHeatwave';
import {
  parseAndValidateCSV,
  generateSampleCSVString,
  CSVValidationResult,
} from '../data/demonstrationData';
import {
  GlobalMarketCategory,
  GlobalMarketInstrument,
  GLOBAL_MARKET_CATEGORIES,
  INITIAL_GLOBAL_INSTRUMENTS,
  TOP_ECONOMIC_EVENTS,
  filterGlobalInstruments,
  computeMarketMovers,
} from '../data/globalMarketsData';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Calendar,
  Search,
  Upload,
  Download,
  RefreshCw,
  Zap,
  Play,
  Pause,
  Globe2,
  BarChart2,
  ArrowUpDown,
} from 'lucide-react';

interface MarketOverviewProps {
  dataPoints: Record<string, MarketDataPoint[]>;
  assetSummaries: AssetMetrics[];
  activeTicker: string;
  setActiveTicker: (ticker: string) => void;
  marketStatus: MarketSessionStatus;
  onSelectOrAddStock: (ticker: string, name?: string, sector?: string) => void;
  isLoadingTicker?: string | null;
  onLoadCustomDataset: (newDatasets: Record<string, MarketDataPoint[]>, provenance: string) => void;
  onResetToDemo: () => void;
  currentProvenance: string;
  priceAlerts: PriceAlert[];
  onAddPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  onDeletePriceAlert: (id: string) => void;
  onRearmPriceAlert: (id: string) => void;
  onSimulateMarketTick: (
    targetTicker?: string,
    shockPct?: number,
    volumeMultiplier?: number
  ) => void;
  isAutoStreaming: boolean;
  setIsAutoStreaming: (val: boolean) => void;
  globalInstruments?: GlobalMarketInstrument[];
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  dataPoints,
  assetSummaries,
  activeTicker,
  setActiveTicker,
  marketStatus,
  onSelectOrAddStock,
  onLoadCustomDataset,
  onResetToDemo,
  priceAlerts,
  onSimulateMarketTick,
  isAutoStreaming,
  setIsAutoStreaming,
  globalInstruments = INITIAL_GLOBAL_INSTRUMENTS,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GlobalMarketCategory>('ALL');
  const [heatmapViewMode, setHeatmapViewMode] = useState<
    'watchlist-top20' | 'all-markets' | 'both'
  >('watchlist-top20');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'changePct' | 'weekChangePct' | 'ytdChangePct' | 'volatilityPct'>('changePct');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>('1M');
  const [econFilterCountry, setEconFilterCountry] = useState<string>('ALL');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Synchronize live equity prices from assetSummaries into globalInstruments
  const liveGlobalInstruments = useMemo(() => {
    const summaryMap = new Map<string, AssetMetrics>();
    for (const s of assetSummaries) {
      summaryMap.set(s.ticker.toUpperCase(), s);
    }

    return globalInstruments.map((inst) => {
      const match = summaryMap.get(inst.symbol.toUpperCase());
      if (!match) return inst;
      const dayReturn =
        match.dailyReturns && match.dailyReturns.length > 0
          ? Number(match.dailyReturns[match.dailyReturns.length - 1].returnPct.toFixed(2))
          : inst.changePct;
      return {
        ...inst,
        price: Number(match.endPrice.toFixed(2)),
        changePct: dayReturn,
        volatilityPct: Number(match.annualizedVolatility.toFixed(1)),
      };
    });
  }, [globalInstruments, assetSummaries]);

  const categoryInstruments = useMemo(
    () => filterGlobalInstruments(liveGlobalInstruments, selectedCategory, tableSearch),
    [liveGlobalInstruments, selectedCategory, tableSearch]
  );

  const sortedInstruments = useMemo(() => {
    return [...categoryInstruments].sort((a, b) => {
      const diff = a[sortBy] - b[sortBy];
      return sortAsc ? diff : -diff;
    });
  }, [categoryInstruments, sortBy, sortAsc]);

  // Movers computed across either active category or entire multi-asset market
  const moversScope = useMemo(
    () =>
      selectedCategory === 'ALL'
        ? liveGlobalInstruments
        : liveGlobalInstruments.filter((i) => i.category === selectedCategory),
    [liveGlobalInstruments, selectedCategory]
  );

  const { trending, topGainers, topLosers } = useMemo(
    () => computeMarketMovers(moversScope, 5),
    [moversScope]
  );

  const filteredEconomicEvents = useMemo(() => {
    if (econFilterCountry === 'ALL') return TOP_ECONOMIC_EVENTS;
    return TOP_ECONOMIC_EVENTS.filter((e) => e.country === econFilterCountry);
  }, [econFilterCountry]);

  const handleSelectInstrument = (symbol: string, name?: string, categoryLabel?: string) => {
    onSelectOrAddStock(symbol, name, categoryLabel);
  };

  const activeData = dataPoints[activeTicker] || [];
  const activeMetric =
    assetSummaries.find((a) => a.ticker === activeTicker) || assetSummaries[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result: CSVValidationResult = parseAndValidateCSV(content);
      if (result.isValid) {
        onLoadCustomDataset(result.datasets, `Custom CSV: ${file.name}`);
        setUploadStatus(`Loaded ${result.rowCount} rows (${result.tickersFound.join(', ')})`);
      } else {
        setUploadStatus(`CSV Error: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = generateSampleCSVString();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marketmind_multi_asset_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. TERMINAL HEADER & 7 GLOBAL MARKET ASSET CLASS SELECTOR           */}
      {/* =================================================================== */}
      <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-white/60">
              <span className="text-blue-400 font-semibold">GLOBAL MULTI-ASSET TERMINAL</span>
              <span>·</span>
              <span>{marketStatus.label}</span>
              <span>·</span>
              <span>{marketStatus.easternTime}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              US, Europe, Asia, Crypto, Rates, Commodities & Currencies
            </h1>
          </div>

          {/* Live Tick Simulation & CSV Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSimulateMarketTick(activeTicker)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Step Live Tick
            </button>
            <button
              type="button"
              onClick={() => setIsAutoStreaming(!isAutoStreaming)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                isAutoStreaming
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/15 text-white/70'
              }`}
            >
              {isAutoStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isAutoStreaming ? 'Stream Active' : 'Stream Paused'}
            </button>
            <label className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-white/85 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Upload CSV</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleDownloadSampleCSV}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-white/85 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Sample CSV
            </button>
            <button
              type="button"
              onClick={onResetToDemo}
              title="Reset to default multi-asset dataset"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div className="px-3 py-2 rounded-lg bg-blue-600/15 border border-blue-500/40 text-xs font-mono text-blue-200">
            {uploadStatus}
          </div>
        )}

        {/* 7 Global Market Category Tabs */}
        <div
          role="tablist"
          aria-label="Global Market Asset Classes"
          className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2"
        >
          {GLOBAL_MARKET_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const catItems =
              cat.id === 'ALL'
                ? liveGlobalInstruments
                : liveGlobalInstruments.filter((i) => i.category === cat.id);
            const avgChange =
              catItems.length > 0
                ? catItems.reduce((acc, i) => acc + i.changePct, 0) / catItems.length
                : 0;

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-2.5 rounded-lg text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600/25 border-blue-400 text-white'
                    : 'bg-black/70 border-white/10 text-white/75 hover:border-white/25 hover:text-white'
                }`}
              >
                <div className="text-xs font-display font-bold truncate">{cat.shortLabel}</div>
                <div className="flex items-center justify-between gap-1 mt-1 font-mono text-[11px] tabular-nums">
                  <span className="text-white/50">{catItems.length} assets</span>
                  <span className={avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {avgChange >= 0 ? '+' : ''}
                    {avgChange.toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. D3 MARKET HEATMAP (SECTOR & VOLATILITY) & GLOBAL HEATWAVE        */}
      {/* =================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-lg bg-[#070A12] border border-white/15 p-1">
            <button
              type="button"
              data-testid="toggle-watchlist-heatmap"
              onClick={() => setHeatmapViewMode('watchlist-top20')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                heatmapViewMode === 'watchlist-top20'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              D3 Market Heatmap (Sector Filter & Volatility)
            </button>
            <button
              type="button"
              data-testid="toggle-global-heatwave"
              onClick={() => setHeatmapViewMode('all-markets')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                heatmapViewMode === 'all-markets'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Heatwave of All Markets (US · EU · Asia · Crypto · Rates · Commodities · FX)
            </button>
            <button
              type="button"
              data-testid="toggle-both-heatmaps"
              onClick={() => setHeatmapViewMode('both')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                heatmapViewMode === 'both'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Show Both Heatmaps
            </button>
          </div>
        </div>

        {(heatmapViewMode === 'watchlist-top20' || heatmapViewMode === 'both') && (
          <MarketHeatmap
            assetSummaries={assetSummaries}
            activeTicker={activeTicker}
            onSelectTicker={setActiveTicker}
          />
        )}

        {(heatmapViewMode === 'all-markets' || heatmapViewMode === 'both') && (
          <GlobalMarketHeatwave
            instruments={liveGlobalInstruments}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedSymbol={activeTicker}
            onSelectSymbol={(sym) => {
              const found = liveGlobalInstruments.find((i) => i.symbol === sym);
              handleSelectInstrument(sym, found?.name, found?.categoryLabel);
            }}
          />
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. TRENDING TICKERS, TOP GAINERS, TOP LOSERS & TOP ECONOMIC EVENTS   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Column 1: Trending Tickers */}
        <section
          aria-label="Trending Tickers"
          className="rounded-xl bg-[#070A12] border border-white/15 p-4 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-display font-bold text-white">Trending Tickers</h3>
            </div>
            <span className="text-[11px] font-mono text-white/55">Vol Surge</span>
          </div>
          <div className="divide-y divide-white/10">
            {trending.map((item) => {
              const isPos = item.changePct >= 0;
              return (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() =>
                    handleSelectInstrument(item.symbol, item.name, item.categoryLabel)
                  }
                  className="w-full py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/5 px-1.5 rounded transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-white">{item.symbol}</span>
                      <span className="text-[10px] font-mono text-white/50">
                        · {item.volumeRatio.toFixed(2)}x vol
                      </span>
                    </div>
                    <div className="text-[11px] text-white/65 truncate">{item.name}</div>
                  </div>
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div className="text-xs text-white">
                      {item.unitPrefix}
                      {item.price.toLocaleString()}
                      {item.unitSuffix}
                    </div>
                    <div
                      className={`text-[11px] font-semibold ${
                        isPos ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {item.changePct.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Column 2: Top Gainers */}
        <section
          aria-label="Top Gainers"
          className="rounded-xl bg-[#070A12] border border-white/15 p-4 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-display font-bold text-white">Top Gainers</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Advancing (+%)</span>
          </div>
          <div className="divide-y divide-white/10">
            {topGainers.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => handleSelectInstrument(item.symbol, item.name, item.categoryLabel)}
                className="w-full py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/5 px-1.5 rounded transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-white">{item.symbol}</span>
                    <span className="text-[10px] font-mono text-white/50">
                      · {item.categoryLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/65 truncate">{item.name}</div>
                </div>
                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-xs text-white">
                    {item.unitPrefix}
                    {item.price.toLocaleString()}
                    {item.unitSuffix}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    +{item.changePct.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Column 3: Top Losers */}
        <section
          aria-label="Top Losers"
          className="rounded-xl bg-[#070A12] border border-white/15 p-4 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-display font-bold text-white">Top Losers</h3>
            </div>
            <span className="text-[11px] font-mono text-red-400">Declining (-%)</span>
          </div>
          <div className="divide-y divide-white/10">
            {topLosers.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => handleSelectInstrument(item.symbol, item.name, item.categoryLabel)}
                className="w-full py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/5 px-1.5 rounded transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-white">{item.symbol}</span>
                    <span className="text-[10px] font-mono text-white/50">
                      · {item.categoryLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/65 truncate">{item.name}</div>
                </div>
                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-xs text-white">
                    {item.unitPrefix}
                    {item.price.toLocaleString()}
                    {item.unitSuffix}
                  </div>
                  <div className="text-[11px] font-semibold text-red-400">
                    {item.changePct.toFixed(2)}%
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Column 4: Top Economic Events */}
        <section
          aria-label="Top Economic Events"
          className="rounded-xl bg-[#070A12] border border-white/15 p-4 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-display font-bold text-white">Top Economic Events</h3>
            </div>
            <select
              aria-label="Filter Economic Events by Region"
              value={econFilterCountry}
              onChange={(e) => setEconFilterCountry(e.target.value)}
              className="bg-black border border-white/15 rounded px-2 py-0.5 text-[11px] font-mono text-white"
            >
              <option value="ALL">All Regions</option>
              <option value="US">US (Fed/BLS)</option>
              <option value="EU">Eurozone</option>
              <option value="JP">Japan (BoJ)</option>
              <option value="CN">China</option>
            </select>
          </div>
          <div className="divide-y divide-white/10 max-h-80 overflow-y-auto pr-1">
            {filteredEconomicEvents.slice(0, 5).map((ev) => (
              <div key={ev.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-white/80 font-semibold">
                    {ev.country} · {ev.timeET}
                  </span>
                  <span
                    className={
                      ev.impact === 'HIGH'
                        ? 'text-red-400 font-bold'
                        : 'text-amber-400 font-semibold'
                    }
                  >
                    {ev.impact} IMPACT
                  </span>
                </div>
                <div className="text-xs font-medium text-white leading-snug">{ev.event}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-white/65 tabular-nums pt-0.5">
                  <span>
                    Actual: <strong className="text-white">{ev.actual}</strong>
                  </span>
                  <span>Fcst: {ev.forecast}</span>
                  <span>Prev: {ev.previous}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* =================================================================== */}
      {/* 4. INTERACTIVE ASSET CHART & QUANTITATIVE TELEMETRY                 */}
      {/* =================================================================== */}
      {activeMetric && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          <div className="xl:col-span-8 rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base font-display font-bold text-white">
                    {activeMetric.ticker} — {activeMetric.name}
                  </h3>
                  <span className="text-xs font-mono text-white/60">
                    · {activeMetric.sector || 'Multi-Asset'}
                  </span>
                </div>
                <p className="text-xs font-mono text-white/60 mt-0.5">
                  Last Close: ${activeMetric.endPrice.toFixed(2)} · 180D Return:{' '}
                  <span
                    className={
                      activeMetric.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }
                  >
                    {activeMetric.totalReturnPct >= 0 ? '+' : ''}
                    {activeMetric.totalReturnPct.toFixed(2)}%
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1 bg-black border border-white/15 rounded-lg p-0.5">
                {(['1H', '6H', '1M', '3M', '6M', '1Y'] as ChartTimeframe[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      chartTimeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'text-white/65 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <InteractiveChart
              data={activeData}
              ticker={activeTicker}
              priceAlerts={priceAlerts.filter((a) => a.ticker === activeTicker)}
              initialTimeframe={chartTimeframe}
              onTimeframeChange={setChartTimeframe}
            />
          </div>

          <div className="xl:col-span-4 rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-display font-bold text-white pb-2.5 border-b border-white/10">
                Quantitative Telemetry — {activeMetric.ticker}
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-3 font-mono text-xs tabular-nums">
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">Last Price</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    ${activeMetric.endPrice.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">Total Return</div>
                  <div
                    className={`text-base font-bold mt-0.5 ${
                      activeMetric.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {activeMetric.totalReturnPct >= 0 ? '+' : ''}
                    {activeMetric.totalReturnPct.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">Annual Volatility</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {activeMetric.annualizedVolatility.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">Sharpe Ratio</div>
                  <div className="text-sm font-bold text-blue-400 mt-0.5">
                    {activeMetric.sharpeRatio.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">Max Drawdown</div>
                  <div className="text-sm font-bold text-red-400 mt-0.5">
                    {activeMetric.maxDrawdownPct.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">95% 1D VaR</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    -{activeMetric.var95Pct.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">SMA 20 / 50</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    ${activeMetric.currentSMA20.toFixed(1)} / ${activeMetric.currentSMA50.toFixed(1)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/70 border border-white/10">
                  <div className="text-white/55 text-[11px]">Session Volume</div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {(activeMetric.currentVolume / 1_000_000).toFixed(2)}M shs
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-black/80 border border-white/10 space-y-2">
              <div className="text-xs font-mono font-semibold text-white/80">
                Simulate Instant Market Shock ({activeMetric.ticker})
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSimulateMarketTick(activeTicker, 2.5, 1.8)}
                  className="px-2.5 py-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold cursor-pointer"
                >
                  +2.5% Surge
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateMarketTick(activeTicker, -2.5, 1.8)}
                  className="px-2.5 py-1.5 rounded bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-mono font-semibold cursor-pointer"
                >
                  -2.5% Pullback
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateMarketTick(activeTicker, 0.8, 2.6)}
                  className="px-2.5 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono font-semibold cursor-pointer"
                >
                  2.5x Volume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. MULTI-ASSET GLOBAL MARKET TABLE                                  */}
      {/* =================================================================== */}
      <section
        aria-label="Global Multi-Asset Market Directory"
        className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-display font-bold text-white">
                Multi-Asset Market Directory ({sortedInstruments.length} Instruments)
              </h3>
              <p className="text-xs text-white/60">
                Click any US, European, Asian, Crypto, Sovereign Rate, Commodity, or FX instrument to load its live chart
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-white/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter symbol, name, region..."
              aria-label="Filter Multi-Asset Table"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs text-white placeholder-white/45 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-white/60">
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Instrument</th>
                <th className="py-2.5 px-3">Market Class</th>
                <th className="py-2.5 px-3 text-right">Last Price</th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'changePct') setSortAsc(!sortAsc);
                    else {
                      setSortBy('changePct');
                      setSortAsc(false);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    1D Change <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'weekChangePct') setSortAsc(!sortAsc);
                    else {
                      setSortBy('weekChangePct');
                      setSortAsc(false);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    1W % <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'ytdChangePct') setSortAsc(!sortAsc);
                    else {
                      setSortBy('ytdChangePct');
                      setSortAsc(false);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    YTD % <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-2.5 px-3 text-right">Volume / Liquidity</th>
                <th className="py-2.5 px-3 text-right">RSI-14</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs font-mono tabular-nums">
              {sortedInstruments.map((inst) => {
                const isPos = inst.changePct >= 0;
                const isSelected = activeTicker.toUpperCase() === inst.symbol.toUpperCase();
                return (
                  <tr
                    key={inst.symbol}
                    onClick={() =>
                      handleSelectInstrument(inst.symbol, inst.name, inst.categoryLabel)
                    }
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/15' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white">{inst.symbol}</td>
                    <td className="py-2.5 px-3 font-sans text-white/85">{inst.name}</td>
                    <td className="py-2.5 px-3 text-white/65">
                      {inst.categoryLabel} · {inst.region}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-white">
                      {inst.unitPrefix}
                      {inst.price.toLocaleString(undefined, {
                        minimumFractionDigits: inst.price < 10 ? 2 : 2,
                        maximumFractionDigits: inst.price < 10 ? 4 : 2,
                      })}
                      {inst.unitSuffix}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isPos ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {inst.changePct.toFixed(2)}%
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right ${
                        inst.weekChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {inst.weekChangePct >= 0 ? '+' : ''}
                      {inst.weekChangePct.toFixed(2)}%
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right ${
                        inst.ytdChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {inst.ytdChangePct >= 0 ? '+' : ''}
                      {inst.ytdChangePct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/75">
                      {inst.volumeLabel} ({inst.volumeRatio.toFixed(2)}x)
                    </td>
                    <td className="py-2.5 px-3 text-right text-white/80">
                      {inst.rsi14.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectInstrument(inst.symbol, inst.name, inst.categoryLabel);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
