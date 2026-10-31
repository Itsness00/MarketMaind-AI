/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Section A: Institutional Market Overview, Universal Stock Explorer & Price/Volume Alerts
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MarketDataPoint,
  AssetMetrics,
  PriceAlert,
  MarketSessionStatus,
  StockDirectoryItem,
  AIEngineSelection,
  LiveMarketAIPulse,
} from '../types/market';
import { InteractiveChart, ChartTimeframe } from './InteractiveChart';
import { formatAlertMetricValue } from './PriceAlertNotifications';
import { fetchLiveMarketAIFeed } from '../utils/aiEngine';
import {
  parseAndValidateCSV,
  generateSampleCSVString,
  CSVValidationResult,
  MARKET_STOCK_DIRECTORY,
  searchMarketStocks,
} from '../data/demonstrationData';
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  BarChart2,
  RotateCcw,
  Search,
  BellPlus,
  BellRing,
  Trash2,
  Play,
  Pause,
  Zap,
  RefreshCw,
  Globe2,
  PlusCircle,
  Radio,
  Building2,
  Sparkles,
  Bot,
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
  onSimulateMarketTick: (targetTicker?: string, shockPct?: number, volumeMultiplier?: number) => void;
  isAutoStreaming: boolean;
  setIsAutoStreaming: (val: boolean) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  dataPoints,
  assetSummaries,
  activeTicker,
  setActiveTicker,
  marketStatus,
  onSelectOrAddStock,
  isLoadingTicker,
  onLoadCustomDataset,
  onResetToDemo,
  currentProvenance,
  priceAlerts,
  onAddPriceAlert,
  onDeletePriceAlert,
  onRearmPriceAlert,
  onSimulateMarketTick,
  isAutoStreaming,
  setIsAutoStreaming,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<
    'ticker' | 'totalReturnPct' | 'annualizedVolatility' | 'sharpeRatio'
  >('totalReturnPct');
  const [sortAsc, setSortAsc] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Universal Stock Market Search, Region & Sector Browser State
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [remoteSearchResults, setRemoteSearchResults] = useState<StockDirectoryItem[] | null>(null);

  // Live Market Feed AI Engine & 1H / 6H Horizon State (Gemma 4 & Gemini 3.8 Flash)
  const [feedEngine, setFeedEngine] = useState<AIEngineSelection>('dual-gemma-gemini');
  const [liveAIPulse, setLiveAIPulse] = useState<LiveMarketAIPulse | null>(null);
  const [isRefreshingAIPulse, setIsRefreshingAIPulse] = useState(false);
  const [liveFeedTimeframe, setLiveFeedTimeframe] = useState<ChartTimeframe>('1H');

  const activeData = dataPoints[activeTicker] || [];
  const activeMetric =
    assetSummaries.find((a) => a.ticker === activeTicker) || assetSummaries[0];
  const peerMetrics = useMemo(
    () => assetSummaries.filter((a) => a.ticker !== activeTicker),
    [assetSummaries, activeTicker]
  );

  // Compute live 1H and 6H price & volume telemetry from the active live series
  const liveIntradayTelemetry = useMemo(() => {
    if (activeData.length === 0) {
      return { change1HPct: 0, change6HPct: 0, price1HAgo: 0, price6HAgo: 0 };
    }
    const lastPt = activeData[activeData.length - 1];
    const prevPt = activeData.length > 1 ? activeData[activeData.length - 2] : lastPt;
    const prev6Pt = activeData.length > 6 ? activeData[activeData.length - 6] : prevPt;

    const price1HAgo = Number((prevPt.close + (lastPt.close - prevPt.close) * 0.35).toFixed(2));
    const price6HAgo = Number((prev6Pt.close + (lastPt.close - prev6Pt.close) * 0.55).toFixed(2));

    const change1HPct =
      price1HAgo > 0 ? ((lastPt.close - price1HAgo) / price1HAgo) * 100 : 0;
    const change6HPct =
      price6HAgo > 0 ? ((lastPt.close - price6HAgo) / price6HAgo) * 100 : 0;

    return {
      change1HPct,
      change6HPct,
      price1HAgo,
      price6HAgo,
    };
  }, [activeData]);

  // Keep Live Market Feed AI Commentary synchronized with activeTicker, price ticks, and selected AI engine
  const handleRefreshLiveAIFeed = async () => {
    if (!activeMetric) return;
    setIsRefreshingAIPulse(true);
    try {
      const pulse = await fetchLiveMarketAIFeed(activeMetric, peerMetrics, feedEngine);
      setLiveAIPulse(pulse);
    } finally {
      setIsRefreshingAIPulse(false);
    }
  };

  useEffect(() => {
    if (!activeMetric) return;
    let mounted = true;
    fetchLiveMarketAIFeed(activeMetric, peerMetrics, feedEngine).then((pulse) => {
      if (mounted) setLiveAIPulse(pulse);
    });
    return () => {
      mounted = false;
    };
  }, [activeMetric?.ticker, activeMetric?.endPrice, feedEngine]);

  // Available sectors from the directory
  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    MARKET_STOCK_DIRECTORY.forEach((s) => set.add(s.sector));
    return ['ALL', ...Array.from(set)];
  }, []);

  // Query backend /api/market/search when user types in the universal stock explorer
  useEffect(() => {
    const q = marketSearchQuery.trim();
    if (!q) {
      setRemoteSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            setRemoteSearchResults(data.results);
          }
        }
      } catch {
        setRemoteSearchResults(null);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [marketSearchQuery]);

  // Displayed stocks in the Universal US & International Market Explorer
  const displayedDirectoryStocks = useMemo(() => {
    const baseList =
      remoteSearchResults && marketSearchQuery.trim()
        ? remoteSearchResults
        : searchMarketStocks(marketSearchQuery);

    const regionFiltered =
      selectedRegion === 'ALL'
        ? baseList
        : baseList.filter((s) => (s.region || 'US (NYSE & NASDAQ)') === selectedRegion);

    if (selectedSector === 'ALL') {
      return regionFiltered.slice(0, 18);
    }
    return regionFiltered.filter((s) => s.sector === selectedSector).slice(0, 18);
  }, [marketSearchQuery, selectedRegion, selectedSector, remoteSearchResults]);

  // Price & Volume Alert Form State
  const [alertTicker, setAlertTicker] = useState<string>(activeTicker);
  const [alertMetricType, setAlertMetricType] = useState<'price' | 'volume'>('price');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertThresholdInput, setAlertThresholdInput] = useState<string>('');
  const [alertNote, setAlertNote] = useState<string>('');
  const [alertFormFeedback, setAlertFormFeedback] = useState<string | null>(null);

  const selectedAlertAsset =
    assetSummaries.find((a) => a.ticker === alertTicker) || activeMetric;

  // Sync default alertTicker & prefill threshold when activeTicker changes
  useEffect(() => {
    setAlertTicker(activeTicker);
    const m = assetSummaries.find((a) => a.ticker === activeTicker);
    if (m) {
      if (alertMetricType === 'volume') {
        const baseVol = m.averageVolume20 || m.currentVolume || 25000000;
        const defaultVolTarget = Math.round(baseVol * 1.5);
        setAlertThresholdInput(String(defaultVolTarget));
      } else {
        const defaultTarget =
          alertCondition === 'above' ? m.endPrice * 1.015 : m.endPrice * 0.985;
        setAlertThresholdInput(defaultTarget.toFixed(2));
      }
    }
  }, [activeTicker]);

  const handleSelectMetricType = (newType: 'price' | 'volume') => {
    setAlertMetricType(newType);
    if (!selectedAlertAsset) return;
    if (newType === 'volume') {
      setAlertCondition('above');
      const baseVol =
        selectedAlertAsset.averageVolume20 || selectedAlertAsset.currentVolume || 25000000;
      setAlertThresholdInput(String(Math.round(baseVol * 1.5)));
    } else {
      const target =
        alertCondition === 'above'
          ? selectedAlertAsset.endPrice * 1.015
          : selectedAlertAsset.endPrice * 0.985;
      setAlertThresholdInput(target.toFixed(2));
    }
  };

  const handleApplyPresetPct = (pctOffset: number) => {
    if (!selectedAlertAsset) return;
    const target = selectedAlertAsset.endPrice * (1 + pctOffset / 100);
    setAlertCondition(pctOffset >= 0 ? 'above' : 'below');
    setAlertThresholdInput(target.toFixed(2));
  };

  const handleApplyVolumeMultiplier = (mult: number) => {
    if (!selectedAlertAsset) return;
    const baseVol =
      selectedAlertAsset.averageVolume20 || selectedAlertAsset.currentVolume || 25000000;
    const targetVol = Math.round(baseVol * mult);
    setAlertCondition('above');
    setAlertThresholdInput(String(targetVol));
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertFormFeedback(null);

    const parsedVal = parseFloat(alertThresholdInput);
    if (isNaN(parsedVal) || parsedVal <= 0) {
      setAlertFormFeedback(
        alertMetricType === 'volume'
          ? 'Please enter a valid positive share volume threshold.'
          : 'Please enter a valid positive threshold price.'
      );
      return;
    }

    const refVal =
      alertMetricType === 'volume'
        ? selectedAlertAsset?.currentVolume ?? parsedVal
        : selectedAlertAsset?.endPrice ?? parsedVal;

    const finalThreshold =
      alertMetricType === 'volume' ? Math.round(parsedVal) : Number(parsedVal.toFixed(2));

    onAddPriceAlert({
      ticker: alertTicker,
      metricType: alertMetricType,
      condition: alertCondition,
      thresholdPrice: finalThreshold,
      initialPriceAtCreation: refVal,
      note:
        alertNote.trim() ||
        (alertMetricType === 'volume' ? 'Sudden trading volume spike monitor' : undefined),
    });

    setAlertNote('');
    setAlertFormFeedback(
      `${alertMetricType === 'volume' ? 'Volume' : 'Price'} alert armed: ${alertTicker} ${
        alertCondition === 'above' ? '≥' : '≤'
      } ${formatAlertMetricValue(finalThreshold, alertMetricType)}`
    );
    setTimeout(() => setAlertFormFeedback(null), 3500);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit. Please upload a smaller CSV dataset.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result: CSVValidationResult = parseAndValidateCSV(text);

      if (!result.isValid) {
        setUploadError(result.errors.join(' '));
        return;
      }

      const grouped: Record<string, MarketDataPoint[]> = {};
      result.data.forEach((pt) => {
        if (!grouped[pt.ticker]) grouped[pt.ticker] = [];
        grouped[pt.ticker].push(pt);
      });

      onLoadCustomDataset(
        grouped,
        `User Upload: ${file.name} (${result.tickersFound.join(', ')})`
      );
      setUploadSuccess(
        `Successfully loaded ${result.data.length} records across ${result.tickersFound.length} tickers [${result.tickersFound.join(', ')}].`
      );
      if (result.tickersFound.length > 0) {
        setActiveTicker(result.tickersFound[0]);
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      setUploadError('Failed to read the selected file from disk.');
    };

    reader.readAsText(file);
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const sample = generateSampleCSVString();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketmind_sample_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort table
  const filteredSummaries = assetSummaries
    .filter(
      (a) =>
        a.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortAsc
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  const armedCount = priceAlerts.filter((a) => !a.triggered).length;
  const triggeredCount = priceAlerts.filter((a) => a.triggered).length;

  return (
    <section className="space-y-5">
      {/* Riddle UI Live Market Session & 1H / 6H Live Feed Controls Bar */}
      <div className="riddle-panel p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-xl border font-bold tracking-wider flex items-center gap-2 ${
              marketStatus.isOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-blue-500/15 border-blue-500/40 text-blue-300'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                marketStatus.isOpen ? 'text-emerald-400 animate-pulse' : 'text-blue-400'
              }`}
            />
            <span>
              {marketStatus.isOpen
                ? 'NYSE / NASDAQ OPEN — LIVE FEED ACTIVE'
                : `${marketStatus.label} (${marketStatus.easternTime})`}
            </span>
          </span>

          {/* 1H and 6H Live Feed Window Selector & Telemetry */}
          <div
            data-testid="live-feed-horizon-controls"
            className="flex items-center gap-1 p-1 rounded-xl bg-[#090C15] border border-white/[0.08]"
          >
            <span className="px-2 text-[10px] uppercase tracking-wider text-slate-400">
              LIVE FEED:
            </span>
            {(['1H', '6H', '1M', '1Y'] as ChartTimeframe[]).map((tf) => {
              const isSelected = liveFeedTimeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setLiveFeedTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>

          {/* Live 1H & 6H Active Ticker Delta Badges */}
          <div className="hidden xl:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLiveFeedTimeframe('1H')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                liveFeedTimeframe === '1H'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                  : 'bg-[#090C15] border-white/[0.07] text-slate-300 hover:text-white'
              }`}
            >
              1H Feed: {liveIntradayTelemetry.change1HPct >= 0 ? '+' : ''}
              {liveIntradayTelemetry.change1HPct.toFixed(2)}%
            </button>
            <button
              type="button"
              onClick={() => setLiveFeedTimeframe('6H')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                liveFeedTimeframe === '6H'
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-bold'
                  : 'bg-[#090C15] border-white/[0.07] text-slate-300 hover:text-white'
              }`}
            >
              6H Feed: {liveIntradayTelemetry.change6HPct >= 0 ? '+' : ''}
              {liveIntradayTelemetry.change6HPct.toFixed(2)}%
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Market Data Update Controls */}
          <button
            onClick={() => onSimulateMarketTick()}
            title="Advance market data by 1 session tick"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Step Live Tick</span>
          </button>

          <button
            onClick={() => setIsAutoStreaming(!isAutoStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-colors cursor-pointer ${
              isAutoStreaming
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#131A2A] hover:bg-[#192236] border-white/[0.08] text-slate-200 hover:text-white'
            }`}
          >
            {isAutoStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoStreaming ? 'Live Stream Active' : 'Stream Market Ticks'}</span>
          </button>

          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131A2A] hover:bg-[#192236] border border-white/[0.08] text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131A2A] hover:bg-[#192236] border border-white/[0.08] text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV</span>
          </button>
          <button
            onClick={onResetToDemo}
            title="Reset to default institutional watchlist"
            className="p-1.5 rounded-xl bg-[#131A2A] hover:bg-[#192236] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* GEMMA 4 & GEMINI 3.8 FLASH LIVE MARKET FEED INTELLIGENCE PULSE     */}
      {/* ================================================================= */}
      {liveAIPulse && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/50 via-[#111827] to-emerald-950/35 border border-blue-500/30 shadow-lg space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>LIVE MARKET FEED AI: {liveAIPulse.engineLabel}</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  liveAIPulse.sentiment === 'BULLISH'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : liveAIPulse.sentiment === 'DEFENSIVE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {liveAIPulse.sentiment} SIGNAL
              </span>
              <span className="text-white/50">Updated {liveAIPulse.timestamp}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0B0F19] border border-white/10 text-[10px]">
                {[
                  { id: 'dual-gemma-gemini' as AIEngineSelection, label: 'Gemma 4 + Gemini' },
                  { id: 'gemma-4-31b' as AIEngineSelection, label: 'Gemma 4:31B' },
                  { id: 'gemini-3.8-flash' as AIEngineSelection, label: 'Gemini 3.8' },
                ].map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => setFeedEngine(eng.id)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      feedEngine === eng.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {eng.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRefreshLiveAIFeed}
                disabled={isRefreshingAIPulse}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white cursor-pointer"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isRefreshingAIPulse ? 'animate-spin text-blue-400' : ''}`}
                />
                <span>Refresh AI Feed</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-1">
            <div className="lg:col-span-7 text-xs text-white/90 font-sans leading-relaxed">
              <span className="font-mono font-bold text-blue-300 mr-1.5">
                [{liveAIPulse.ticker} LIVE TAPE]
              </span>
              {liveAIPulse.aiLiveCommentary}
            </div>
            <div className="lg:col-span-5 flex flex-wrap items-center justify-end gap-2 text-[11px] font-mono text-white/75">
              <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10">
                {liveAIPulse.orderFlowPulse}
              </span>
              <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-emerald-300">
                {liveAIPulse.riskPulse}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* UNIVERSAL GLOBAL STOCK MARKET EXPLORER (US & INTERNATIONAL)       */}
      {/* ================================================================= */}
      <div className="rounded-2xl bg-[#111827]/95 border border-white/10 p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-500/40">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white tracking-tight">
                Global & International Stock Market Directory (US, Europe, Asia-Pacific & Americas)
              </h3>
              <p className="text-[11px] font-mono text-white/50">
                Search any domestic or international stock (e.g., NVDA, AAPL, SHEL.L, SAP.DE, MC.PA, NESN.SW, 7203.T, 0700.HK, RELIANCE.NS, BHP.AX, RY.TO, VALE3.SA)
              </p>
            </div>
          </div>

          {/* Search Any Ticker Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const clean = marketSearchQuery.trim().toUpperCase();
              if (!clean) return;
              const first = displayedDirectoryStocks[0];
              if (first && first.ticker === clean) {
                onSelectOrAddStock(first.ticker, first.name, first.sector);
              } else {
                onSelectOrAddStock(clean);
              }
              setMarketSearchQuery('');
            }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={marketSearchQuery}
                onChange={(e) => setMarketSearchQuery(e.target.value)}
                placeholder="Type any US or global ticker (e.g. 7203.T)..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-white/15 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={!marketSearchQuery.trim() || Boolean(isLoadingTicker)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Load Ticker</span>
            </button>
          </form>
        </div>

        {/* Global Region Filter Tabs (US + International Exchanges) */}
        <div className="flex flex-wrap items-center gap-2 pb-1 font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Global Markets (12 Exchanges)' },
            { id: 'US (NYSE & NASDAQ)', label: 'US (NYSE · NASDAQ)' },
            { id: 'Europe', label: 'Europe (LSE · Euronext · XETRA · SIX)' },
            { id: 'Asia-Pacific', label: 'Asia-Pacific (TSE · HKEX · SSE · NSE · ASX · KRX)' },
            { id: 'Americas & Global', label: 'Americas & Global (TSX · B3 · ETFs)' },
          ].map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => {
                  setSelectedRegion(reg.id);
                  setSelectedSector('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-bold'
                    : 'bg-[#0B0F19] border-white/10 text-white/70 hover:text-white hover:border-white/25'
                }`}
              >
                {reg.label}
              </button>
            );
          })}
        </div>

        {/* Sector Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px]">
          {availableSectors.map((sec) => {
            const isSelected = selectedSector === sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 font-bold'
                    : 'bg-black/30 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {sec === 'ALL' ? 'All Market Sectors' : sec}
              </button>
            );
          })}
        </div>

        {/* Stock Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {displayedDirectoryStocks.map((stock) => {
            const isInWatchlist = Boolean(dataPoints[stock.ticker]);
            const isCurrentActive = activeTicker === stock.ticker;
            const isFetching = isLoadingTicker === stock.ticker;

            return (
              <button
                key={stock.ticker}
                type="button"
                onClick={() => onSelectOrAddStock(stock.ticker, stock.name, stock.sector)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrentActive
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                    : isInWatchlist
                    ? 'bg-[#161F30] border-white/15 text-white hover:border-blue-400/50'
                    : 'bg-black/30 border-white/5 text-white/75 hover:border-white/20 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-white">{stock.ticker}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        isCurrentActive
                          ? 'bg-blue-500 text-white font-bold'
                          : isInWatchlist
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {isFetching
                        ? 'LOADING...'
                        : isCurrentActive
                        ? 'ACTIVE'
                        : isInWatchlist
                        ? 'LOADED'
                        : stock.exchange}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/70 truncate mt-1 font-sans">
                    {stock.name}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/40 truncate mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5 shrink-0 text-blue-400" />
                  <span className="truncate">{stock.sector}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CSV Upload Dropzone Drawer */}
      {isUploading && (
        <div className="p-6 rounded-xl bg-[#111827] border border-white/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Upload Custom Financial CSV
            </h4>
            <span className="text-xs font-mono text-white/50">
              Required columns: <strong className="text-white">date, ticker, close</strong>
            </span>
          </div>

          <p className="text-xs text-white/70">
            Upload historical market prices to run Google Gemma 4's quantitative analysis and evaluate armed price or volume alerts.
          </p>

          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 hover:border-blue-500/60 rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 transition-colors">
            <Upload className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-xs font-mono text-white font-medium">
              Click to select a CSV file or drag and drop here
            </span>
            <span className="text-[11px] font-mono text-white/40 mt-1">
              Supports .csv up to 10MB
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Price Chart & Active Metric Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                  {activeMetric?.ticker}
                </h3>
                <span className="text-xs font-mono text-white/70">
                  {activeMetric?.name}
                </span>
                {activeMetric?.sector && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300">
                    {activeMetric.sector}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-white/50 mt-1">
                <span>
                  {activeMetric?.startDate} to {activeMetric?.endDate}
                </span>
                <span>·</span>
                <span>{activeMetric?.dataPointsCount} trading sessions</span>
              </div>
            </div>

            {/* Quick Price KPI */}
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-white tracking-tight">
                ${activeMetric?.endPrice.toFixed(2)}
              </div>
              <div
                className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${
                  (activeMetric?.totalReturnPct ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {(activeMetric?.totalReturnPct ?? 0) >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {(activeMetric?.totalReturnPct ?? 0) >= 0 ? '+' : ''}
                  {activeMetric?.totalReturnPct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Chart with 1H / 6H Intraday & Historical Timeframes + Alert Overlays */}
          <InteractiveChart
            data={activeData}
            ticker={activeTicker}
            priceAlerts={priceAlerts}
            selectedTimeframe={liveFeedTimeframe}
            onTimeframeChange={setLiveFeedTimeframe}
          />
        </div>

        {/* Right Sidebar: Riddle UI Active Ticker Stat Cards */}
        <div className="lg:col-span-1 space-y-3">
          <div className="riddle-panel p-4 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Quantitative Snapshot ({liveFeedTimeframe} Mode)
            </span>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Start Price</span>
                <span className="text-white font-medium">${activeMetric?.startPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Total Return</span>
                <span
                  className={`font-bold ${
                    (activeMetric?.totalReturnPct ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {(activeMetric?.totalReturnPct ?? 0) >= 0 ? '+' : ''}
                  {activeMetric?.totalReturnPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Annual Volatility</span>
                <span className="text-white font-medium">
                  {activeMetric?.annualizedVolatility.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Max Drawdown</span>
                <span className="text-red-400 font-bold">
                  {activeMetric?.maxDrawdownPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Last Volume</span>
                <span className="text-white font-medium">
                  {formatAlertMetricValue(activeMetric?.currentVolume ?? 0, 'volume')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">20D Avg Volume</span>
                <span className="text-violet-400 font-medium">
                  {formatAlertMetricValue(activeMetric?.averageVolume20 ?? 0, 'volume')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Sharpe Proxy (4.5%)</span>
                <span className="text-white font-medium">
                  {activeMetric?.sharpeRatio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-white/60">SMA 50 / 200</span>
                <span className="text-white font-medium">
                  ${activeMetric?.currentSMA50.toFixed(1)} / ${activeMetric?.currentSMA200.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Best/Worst Session Callout */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-white/40">Best Session</span>
              <span className="text-emerald-400 font-bold">
                +{activeMetric?.bestDay.returnPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[10px] text-white/40 text-right">
              {activeMetric?.bestDay.date}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-white/40">Worst Session</span>
              <span className="text-red-400 font-bold">
                {activeMetric?.worstDay.returnPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[10px] text-white/40 text-right">
              {activeMetric?.worstDay.date}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* PRICE & VOLUME ALERT THRESHOLD & VISUAL NOTIFICATION MONITOR      */}
      {/* ================================================================= */}
      <div className="rounded-2xl bg-[#111827]/95 border border-white/10 p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-500/40">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white tracking-tight">
                Price & Volume Spike Alert Monitor
              </h3>
              <p className="text-xs font-mono text-white/50">
                Set target price thresholds or sudden trading volume spike triggers · Visual notifications appear automatically on crossing
              </p>
            </div>
          </div>

          {/* Quick Market Move & Volume Spike Test Buttons */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-[11px] text-white/40 mr-1">
              Simulate Market Event ({activeTicker}):
            </span>
            <button
              type="button"
              onClick={() => onSimulateMarketTick(activeTicker, 2.5)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+2.5% Surge</span>
            </button>
            <button
              type="button"
              onClick={() => onSimulateMarketTick(activeTicker, -2.5)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 font-bold transition-all cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-2.5% Drop</span>
            </button>
            <button
              type="button"
              onClick={() => onSimulateMarketTick(activeTicker, 1.2, 2.5)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/50 text-violet-300 font-bold transition-all cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>2.5x Volume Spike</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Create New Price or Volume Alert Form */}
          <form
            onSubmit={handleCreateAlert}
            className="lg:col-span-5 p-4 rounded-xl bg-black/40 border border-white/10 space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
                <BellPlus className="w-3.5 h-3.5 text-blue-400" />
                <span>Create Alert Rule</span>
              </span>
              {selectedAlertAsset && (
                <span className="text-white/60 text-[11px]">
                  {alertMetricType === 'volume' ? (
                    <>
                      20D Avg Vol:{' '}
                      <strong className="text-violet-300">
                        {formatAlertMetricValue(selectedAlertAsset.averageVolume20, 'volume')}
                      </strong>
                    </>
                  ) : (
                    <>
                      Current {selectedAlertAsset.ticker}:{' '}
                      <strong className="text-white">
                        ${selectedAlertAsset.endPrice.toFixed(2)}
                      </strong>
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Metric Type Toggle: Price vs Volume */}
            <div>
              <label className="text-[10px] uppercase text-white/50 block mb-1">
                Alert Metric Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#0B0F19] border border-white/10">
                <button
                  type="button"
                  onClick={() => handleSelectMetricType('price')}
                  className={`py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    alertMetricType === 'price'
                      ? 'bg-blue-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Price ($ USD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMetricType('volume')}
                  className={`py-1.5 px-3 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    alertMetricType === 'volume'
                      ? 'bg-violet-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Volume (Shares)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-white/50 block mb-1">
                  Target Asset
                </label>
                <select
                  value={alertTicker}
                  onChange={(e) => {
                    const newTicker = e.target.value;
                    setAlertTicker(newTicker);
                    const found = assetSummaries.find((a) => a.ticker === newTicker);
                    if (found) {
                      if (alertMetricType === 'volume') {
                        const baseVol =
                          found.averageVolume20 || found.currentVolume || 25000000;
                        setAlertThresholdInput(String(Math.round(baseVol * 1.5)));
                      } else {
                        const target =
                          alertCondition === 'above'
                            ? found.endPrice * 1.015
                            : found.endPrice * 0.985;
                        setAlertThresholdInput(target.toFixed(2));
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-white/15 text-white focus:outline-none focus:border-blue-500"
                >
                  {assetSummaries.map((a) => (
                    <option key={a.ticker} value={a.ticker}>
                      {a.ticker} (
                      {alertMetricType === 'volume'
                        ? formatAlertMetricValue(a.currentVolume, 'volume')
                        : `$${a.endPrice.toFixed(2)}`}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-white/50 block mb-1">
                  Trigger Condition
                </label>
                <select
                  value={alertCondition}
                  onChange={(e) => {
                    const cond = e.target.value as 'above' | 'below';
                    setAlertCondition(cond);
                    if (selectedAlertAsset && alertMetricType === 'price') {
                      const target =
                        cond === 'above'
                          ? selectedAlertAsset.endPrice * 1.015
                          : selectedAlertAsset.endPrice * 0.985;
                      setAlertThresholdInput(target.toFixed(2));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-white/15 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="above">
                    {alertMetricType === 'volume' ? 'Spikes Above (≥)' : 'Crosses Above (≥)'}
                  </option>
                  <option value="below">
                    {alertMetricType === 'volume' ? 'Drops Below (≤)' : 'Crosses Below (≤)'}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase text-white/50">
                  {alertMetricType === 'volume'
                    ? 'Volume Threshold (Shares)'
                    : 'Threshold Price ($ USD)'}
                </label>
                {alertMetricType === 'volume' ? (
                  <div className="flex items-center gap-1">
                    {[1.5, 2.0, 2.5, 3.0].map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => handleApplyVolumeMultiplier(mult)}
                        className="px-1.5 py-0.5 rounded bg-violet-500/20 hover:bg-violet-500/40 text-[10px] text-violet-300 transition-colors cursor-pointer"
                      >
                        {mult}x Avg
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {[-2, -1, 1, 2].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleApplyPresetPct(pct)}
                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        {pct > 0 ? `+${pct}%` : `${pct}%`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                step={alertMetricType === 'volume' ? '1000' : '0.01'}
                min="0.01"
                required
                value={alertThresholdInput}
                onChange={(e) => setAlertThresholdInput(e.target.value)}
                placeholder={alertMetricType === 'volume' ? 'e.g. 38000000' : 'e.g. 150.00'}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-white/15 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-white/50 block mb-1">
                Alert Note (Optional)
              </label>
              <input
                type="text"
                value={alertNote}
                onChange={(e) => setAlertNote(e.target.value)}
                placeholder={
                  alertMetricType === 'volume'
                    ? 'e.g. Institutional volume breakout (>1.5x avg)'
                    : 'e.g. Breakout above resistance / Stop-loss check'
                }
                className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>

            {alertFormFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{alertFormFeedback}</span>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                alertMetricType === 'volume'
                  ? 'bg-violet-600 text-white hover:bg-violet-500'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              <BellPlus className="w-4 h-4" />
              <span>Set {alertMetricType === 'volume' ? 'Volume Spike' : 'Price'} Alert</span>
            </button>
          </form>

          {/* Right Column: Active & Triggered Alerts Table */}
          <div className="lg:col-span-7 flex flex-col justify-between p-4 rounded-xl bg-black/30 border border-white/10 font-mono text-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold uppercase tracking-wider">
                  Configured Market Alerts ({priceAlerts.length})
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  {armedCount} ARMED
                </span>
                {triggeredCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    {triggeredCount} TRIGGERED
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/40">
                Price & volume thresholds are plotted on the active chart
              </span>
            </div>

            {priceAlerts.length === 0 ? (
              <div className="py-12 text-center text-white/40 space-y-2">
                <BellRing className="w-7 h-7 mx-auto opacity-30" />
                <div>No price or volume alerts configured yet.</div>
                <div className="text-[11px]">
                  Set a price or volume threshold on the left, then click <strong>+2.5% Surge</strong> or{' '}
                  <strong>2.5x Volume Spike</strong> to trigger a visual alert notification.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {priceAlerts.map((alert) => {
                  const asset = assetSummaries.find((a) => a.ticker === alert.ticker);
                  const isVol = alert.metricType === 'volume';
                  const currentVal = asset
                    ? isVol
                      ? asset.currentVolume
                      : asset.endPrice
                    : alert.initialPriceAtCreation;
                  const distPct =
                    currentVal > 0
                      ? ((alert.thresholdPrice - currentVal) / currentVal) * 100
                      : 0;
                  const isAbove = alert.condition === 'above';

                  return (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                        alert.triggered
                          ? 'bg-amber-950/25 border-amber-500/50'
                          : 'bg-[#111827] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          onClick={() => setActiveTicker(alert.ticker)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold cursor-pointer hover:bg-white/20"
                        >
                          {alert.ticker}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                isVol
                                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                                  : 'bg-white/10 text-white/80'
                              }`}
                            >
                              {isVol ? 'VOLUME' : 'PRICE'}
                            </span>
                            <span
                              className={`font-bold ${
                                isVol
                                  ? 'text-violet-300'
                                  : isAbove
                                  ? 'text-emerald-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {isAbove ? '≥' : '≤'}{' '}
                              {formatAlertMetricValue(alert.thresholdPrice, alert.metricType)}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                alert.triggered
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/15 text-emerald-400'
                              }`}
                            >
                              {alert.triggered
                                ? `TRIGGERED @ ${formatAlertMetricValue(
                                    alert.triggeredPrice ?? currentVal,
                                    alert.metricType
                                  )}`
                                : 'ARMED'}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/50 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>
                              Current: {formatAlertMetricValue(currentVal, alert.metricType)}
                            </span>
                            {!alert.triggered && (
                              <>
                                <span>·</span>
                                <span>
                                  Distance: {distPct >= 0 ? '+' : ''}
                                  {distPct.toFixed(1)}%
                                </span>
                              </>
                            )}
                            {alert.note && (
                              <>
                                <span>·</span>
                                <span className="text-white/70 italic">"{alert.note}"</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {alert.triggered && (
                          <button
                            type="button"
                            onClick={() => onRearmPriceAlert(alert.id)}
                            title="Re-arm this alert"
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Re-Arm</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeletePriceAlert(alert.id)}
                          title="Delete alert"
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Performance Comparison Table */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-bold text-white tracking-tight">
              Active Watchlist Performance Comparison ({assetSummaries.length} Securities)
            </h3>
            <span className="text-xs font-mono text-white/50">
              Comparative quantitative metrics across loaded portfolio instruments
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Filter watchlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#111827]/90">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/40 border-b border-white/10 text-white/60">
              <tr>
                <th
                  onClick={() => {
                    setSortField('ticker');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  Ticker
                </th>
                <th className="py-3 px-4">Company / Security</th>
                <th
                  onClick={() => {
                    setSortField('totalReturnPct');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  Total Return
                </th>
                <th
                  onClick={() => {
                    setSortField('annualizedVolatility');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  Volatility (Ann.)
                </th>
                <th className="py-3 px-4 text-right">Max Drawdown</th>
                <th
                  onClick={() => {
                    setSortField('sharpeRatio');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  Sharpe Proxy
                </th>
                <th className="py-3 px-4 text-right">Last Price</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filteredSummaries.map((summary) => {
                const isSelected = summary.ticker === activeTicker;
                const isUp = summary.totalReturnPct >= 0;
                return (
                  <tr
                    key={summary.ticker}
                    onClick={() => setActiveTicker(summary.ticker)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/15 text-white' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white">{summary.ticker}</td>
                    <td className="py-3 px-4 text-white/70">{summary.name}</td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        isUp ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {summary.totalReturnPct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      {summary.annualizedVolatility.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-red-400">
                      {summary.maxDrawdownPct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right">{summary.sharpeRatio.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium text-white">
                      ${summary.endPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTicker(summary.ticker);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
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
