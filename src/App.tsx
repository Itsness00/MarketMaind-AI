/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Official Institutional Financial Intelligence Terminal
 * Powered by Google Gemma 4:31B
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  generateDeterministicDemonstrationData,
  MARKET_STOCK_DIRECTORY,
  generateSeriesForAnyTicker,
  getOrCreateStockInfo,
} from './data/demonstrationData';
import {
  computeAssetMetrics,
  evaluatePriceAlerts,
  appendMarketSessionTick,
  getMarketSessionStatus,
  getGlobalMarketsStatus,
} from './utils/analytics';
import { testGemmaConnection, DEFAULT_GEMMA_CONFIG } from './utils/aiEngine';
import {
  MarketDataPoint,
  AssetMetrics,
  GemmaConfig,
  PriceAlert,
  AlertNotification,
  MarketSessionStatus,
  GlobalMarketExchangeStatus,
  PortfolioHolding,
} from './types/market';
import { NavigationHeader } from './components/NavigationHeader';
import { HeroSection } from './components/HeroSection';
import { MarketOverview } from './components/MarketOverview';
import { PortfolioSection } from './components/PortfolioSection';
import { AIAnalystSection } from './components/AIAnalystSection';
import { FinancialAnalyticsSection } from './components/FinancialAnalyticsSection';
import { RiskAnalysisSection } from './components/RiskAnalysisSection';
import { ReportSection } from './components/ReportSection';
import { OllamaSettingsModal } from './components/OllamaSettingsModal';
import { HacktoberfestModal } from './components/HacktoberfestModal';
import { PriceAlertNotifications } from './components/PriceAlertNotifications';
import confetti from 'canvas-confetti';
import {
  Home,
  BarChart2,
  Briefcase,
  Bot,
  Activity,
  ShieldAlert,
  FileText,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeTicker, setActiveTicker] = useState<string>('NVDA');
  const [isLoadingTicker, setIsLoadingTicker] = useState<string | null>(null);

  // Real-time US (NYSE / NASDAQ) & International Global Market Hours Status
  const [marketStatus, setMarketStatus] = useState<MarketSessionStatus>(() =>
    getMarketSessionStatus(new Date())
  );
  const [globalMarkets, setGlobalMarkets] = useState<GlobalMarketExchangeStatus[]>(() =>
    getGlobalMarketsStatus(new Date())
  );

  // Datasets state (starts with 10 flagship stocks, expandable to any stock in the market)
  const [dataPoints, setDataPoints] = useState<Record<string, MarketDataPoint[]>>(() =>
    generateDeterministicDemonstrationData()
  );
  const [currentProvenance, setCurrentProvenance] = useState<string>(
    'Institutional Equity Feed (NYSE & NASDAQ · 252 Trading Sessions)'
  );

  // Custom ticker metadata map (for stocks added dynamically via search)
  const [customTickerNames, setCustomTickerNames] = useState<Record<string, string>>({});
  const [customTickerSectors, setCustomTickerSectors] = useState<Record<string, string>>({});

  // Google Gemma 4 Config State
  const [gemmaConfig, setGemmaConfig] = useState<GemmaConfig>(DEFAULT_GEMMA_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHacktoberfestOpen, setIsHacktoberfestOpen] = useState(false);

  // Name & Sector maps across all directory + custom stocks
  const tickerNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    MARKET_STOCK_DIRECTORY.forEach((a) => {
      map[a.ticker] = a.name;
    });
    return { ...map, ...customTickerNames };
  }, [customTickerNames]);

  const tickerSectorMap = useMemo(() => {
    const map: Record<string, string> = {};
    MARKET_STOCK_DIRECTORY.forEach((a) => {
      map[a.ticker] = a.sector;
    });
    return { ...map, ...customTickerSectors };
  }, [customTickerSectors]);

  // Compute metrics for all loaded tickers
  const assetSummaries = useMemo<AssetMetrics[]>(() => {
    const tickers = Object.keys(dataPoints);
    return tickers
      .map((t) => {
        try {
          return computeAssetMetrics(dataPoints[t], tickerNameMap, 0.045, tickerSectorMap);
        } catch {
          return null;
        }
      })
      .filter((m): m is AssetMetrics => m !== null);
  }, [dataPoints, tickerNameMap, tickerSectorMap]);

  // Price & Volume Alerts & Visual Screen Notifications State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('marketmind_price_alerts_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    const initialNvdaSeries = generateDeterministicDemonstrationData()['NVDA'] || [];
    const lastPt = initialNvdaSeries[initialNvdaSeries.length - 1];
    const nvdaClose = lastPt?.close || 138;
    const recent20 = initialNvdaSeries.slice(-20);
    const nvdaAvgVol =
      recent20.length > 0
        ? Math.round(recent20.reduce((s, p) => s + (p.volume || 25000000), 0) / recent20.length)
        : lastPt?.volume || 25000000;

    return [
      {
        id: 'default_alert_above',
        ticker: 'NVDA',
        metricType: 'price',
        condition: 'above',
        thresholdPrice: Number((nvdaClose * 1.015).toFixed(2)),
        initialPriceAtCreation: nvdaClose,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggered: false,
        note: 'Bullish breakout target (+1.5%)',
      },
      {
        id: 'default_alert_volume_spike',
        ticker: 'NVDA',
        metricType: 'volume',
        condition: 'above',
        thresholdPrice: Math.round(nvdaAvgVol * 1.5),
        initialPriceAtCreation: lastPt?.volume || nvdaAvgVol,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggered: false,
        note: 'Sudden institutional volume spike (≥ 1.5x 20D avg)',
      },
      {
        id: 'default_alert_below',
        ticker: 'NVDA',
        metricType: 'price',
        condition: 'below',
        thresholdPrice: Number((nvdaClose * 0.985).toFixed(2)),
        initialPriceAtCreation: nvdaClose,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggered: false,
        note: 'Support pullback watch (-1.5%)',
      },
    ];
  });

  const [alertNotifications, setAlertNotifications] = useState<AlertNotification[]>([]);

  // Portfolio Share Holdings State (persisted to localStorage with realistic institutional defaults)
  const buildDefaultPortfolioHoldings = (): PortfolioHolding[] => {
    const initialData = generateDeterministicDemonstrationData();
    const defaultShares: Record<string, number> = {
      NVDA: 150,
      MSFT: 80,
      AAPL: 120,
      GOOGL: 100,
      AMZN: 90,
      SPY: 60,
    };
    return Object.keys(defaultShares).map((ticker) => {
      const series = initialData[ticker] || [];
      const entryBasis = series[0]?.close || 100;
      return {
        ticker,
        shares: defaultShares[ticker],
        avgCostPerShare: Number(entryBasis.toFixed(2)),
      };
    });
  };

  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>(() => {
    try {
      const saved = localStorage.getItem('marketmind_portfolio_holdings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return buildDefaultPortfolioHoldings();
  });

  useEffect(() => {
    try {
      localStorage.setItem('marketmind_portfolio_holdings_v1', JSON.stringify(portfolioHoldings));
    } catch {
      // Ignore storage error
    }
  }, [portfolioHoldings]);

  const handleUpdatePortfolioHolding = (
    ticker: string,
    shares: number,
    avgCostPerShare: number
  ) => {
    const clean = ticker.trim().toUpperCase();
    setPortfolioHoldings((prev) => {
      const exists = prev.some((h) => h.ticker === clean);
      if (exists) {
        return prev.map((h) =>
          h.ticker === clean
            ? {
                ...h,
                shares: Math.max(0, shares),
                avgCostPerShare: Math.max(0.01, avgCostPerShare),
                updatedAt: new Date().toLocaleTimeString(),
              }
            : h
        );
      }
      return [
        ...prev,
        {
          ticker: clean,
          shares: Math.max(0, shares),
          avgCostPerShare: Math.max(0.01, avgCostPerShare),
          updatedAt: new Date().toLocaleTimeString(),
        },
      ];
    });
  };

  const handleResetPortfolioHoldings = () => {
    setPortfolioHoldings(buildDefaultPortfolioHoldings());
  };
  // Automatically stream live market ticks when the market is open!
  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(() =>
    getMarketSessionStatus(new Date()).isOpen
  );
  const previousPricesRef = useRef<Record<string, number>>({});
  const previousVolumesRef = useRef<Record<string, number>>({});

  // Update real-time NYSE/NASDAQ & International market clocks every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextStatus = getMarketSessionStatus(now);
      setMarketStatus((prev) => {
        if (!prev.isOpen && nextStatus.isOpen) {
          setIsAutoStreaming(true);
        }
        return nextStatus;
      });
      setGlobalMarkets(getGlobalMarketsStatus(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('marketmind_price_alerts_v3', JSON.stringify(priceAlerts));
    } catch {
      // Ignore storage error
    }
  }, [priceAlerts]);

  // Evaluate armed price and volume alerts whenever market data updates
  const checkAndTriggerAlerts = (
    updatedDataPoints: Record<string, MarketDataPoint[]>,
    currentAlerts: PriceAlert[]
  ) => {
    const latestPrices: Record<string, number> = {};
    const latestVolumes: Record<string, number> = {};
    for (const t of Object.keys(updatedDataPoints)) {
      const series = updatedDataPoints[t];
      if (series && series.length > 0) {
        const last = series[series.length - 1];
        latestPrices[t] = last.close;
        latestVolumes[t] = last.volume ?? 0;
      }
    }

    const { updatedAlerts, newNotifications } = evaluatePriceAlerts(
      currentAlerts,
      latestPrices,
      previousPricesRef.current,
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      latestVolumes,
      previousVolumesRef.current
    );

    previousPricesRef.current = latestPrices;
    previousVolumesRef.current = latestVolumes;

    if (newNotifications.length > 0) {
      setPriceAlerts(updatedAlerts);
      setAlertNotifications((prev) => [...newNotifications, ...prev].slice(0, 8));
      try {
        confetti({
          particleCount: 28,
          spread: 55,
          origin: { x: 0.88, y: 0.18 },
          colors: ['#3B82F6', '#10B981', '#8B5CF6'],
        });
      } catch {
        // Ignore confetti error in headless environment
      }
    }
  };

  // Initialize previousPricesRef and previousVolumesRef on mount
  useEffect(() => {
    const priceMap: Record<string, number> = {};
    const volMap: Record<string, number> = {};
    assetSummaries.forEach((a) => {
      priceMap[a.ticker] = a.endPrice;
      volMap[a.ticker] = a.currentVolume;
    });
    previousPricesRef.current = priceMap;
    previousVolumesRef.current = volMap;
  }, []);

  // Auto-stream live market ticks when enabled (or when market is open)
  useEffect(() => {
    if (!isAutoStreaming) return;
    const interval = setInterval(() => {
      setDataPoints((prevData) => {
        const nextData = appendMarketSessionTick(prevData);
        setPriceAlerts((currAlerts) => {
          const latestPrices: Record<string, number> = {};
          const latestVolumes: Record<string, number> = {};
          for (const t of Object.keys(nextData)) {
            const series = nextData[t];
            if (series && series.length > 0) {
              const last = series[series.length - 1];
              latestPrices[t] = last.close;
              latestVolumes[t] = last.volume ?? 0;
            }
          }
          const { updatedAlerts, newNotifications } = evaluatePriceAlerts(
            currAlerts,
            latestPrices,
            previousPricesRef.current,
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            latestVolumes,
            previousVolumesRef.current
          );
          previousPricesRef.current = latestPrices;
          previousVolumesRef.current = latestVolumes;
          if (newNotifications.length > 0) {
            setAlertNotifications((prevNotifs) => [...newNotifications, ...prevNotifs].slice(0, 8));
          }
          return updatedAlerts;
        });
        return nextData;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isAutoStreaming]);

  // Select or dynamically load ANY stock in the market into the active watchlist
  const handleSelectOrAddStock = async (
    rawTicker: string,
    customName?: string,
    customSector?: string
  ) => {
    const ticker = rawTicker.trim().toUpperCase();
    if (!ticker) return;

    // If already loaded in watchlist, activate immediately
    if (dataPoints[ticker] && dataPoints[ticker].length > 0) {
      setActiveTicker(ticker);
      return;
    }

    const stockInfo = getOrCreateStockInfo(ticker, customName, customSector);
    setCustomTickerNames((prev) => ({ ...prev, [ticker]: stockInfo.name }));
    setCustomTickerSectors((prev) => ({ ...prev, [ticker]: stockInfo.sector }));

    // Immediately populate deterministic series so UI is instant, then upgrade with live backend history if available
    const immediateSeries = generateSeriesForAnyTicker(ticker, stockInfo);
    setDataPoints((prev) => ({
      ...prev,
      [ticker]: immediateSeries,
    }));
    setActiveTicker(ticker);
    setIsLoadingTicker(ticker);

    try {
      const res = await fetch(
        `/api/market/history?symbol=${encodeURIComponent(ticker)}&name=${encodeURIComponent(
          stockInfo.name
        )}&sector=${encodeURIComponent(stockInfo.sector)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.series) && data.series.length >= 20) {
          if (data.name) {
            setCustomTickerNames((prev) => ({ ...prev, [ticker]: data.name }));
          }
          if (data.sector) {
            setCustomTickerSectors((prev) => ({ ...prev, [ticker]: data.sector }));
          }
          setDataPoints((prev) => {
            const updated = { ...prev, [ticker]: data.series };
            checkAndTriggerAlerts(updated, priceAlerts);
            return updated;
          });
          if (data.provenance) {
            setCurrentProvenance(data.provenance);
          }
        }
      }
    } catch {
      // Immediate deterministic series is already active
    } finally {
      setIsLoadingTicker(null);
    }
  };

  // Simulate a single market tick, directional price move, or sudden volume spike
  const handleSimulateMarketTick = (
    targetTicker?: string,
    shockPct?: number,
    volumeMultiplier?: number
  ) => {
    const nextData = appendMarketSessionTick(
      dataPoints,
      targetTicker,
      shockPct,
      volumeMultiplier
    );
    setDataPoints(nextData);
    setCurrentProvenance(
      `Live Market Feed (${nextData[activeTicker]?.length || 252} Sessions)`
    );
    checkAndTriggerAlerts(nextData, priceAlerts);
  };

  // Add a new price or volume alert
  const handleAddPriceAlert = (
    newAlertData: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>
  ) => {
    const newAlert: PriceAlert = {
      ...newAlertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggered: false,
    };
    const nextAlerts = [newAlert, ...priceAlerts];
    setPriceAlerts(nextAlerts);
  };

  // Delete a price alert
  const handleDeletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Re-arm a triggered price alert
  const handleRearmPriceAlert = (id: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              triggered: false,
              triggeredAt: undefined,
              triggeredPrice: undefined,
            }
          : a
      )
    );
  };

  // Dismiss visual notification
  const handleDismissNotification = (id: string) => {
    setAlertNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDismissAllNotifications = () => {
    setAlertNotifications([]);
  };

  // Active Metric & Peers
  const activeMetric = useMemo(() => {
    return assetSummaries.find((a) => a.ticker === activeTicker) || assetSummaries[0];
  }, [assetSummaries, activeTicker]);

  const peerMetrics = useMemo(() => {
    return assetSummaries.filter((a) => a.ticker !== activeTicker);
  }, [assetSummaries, activeTicker]);

  // Verify Google Gemma 4 backend connection on mount
  useEffect(() => {
    let isMounted = true;
    testGemmaConnection().then((res) => {
      if (isMounted) {
        setGemmaConfig((prev) => ({
          ...prev,
          isConnected: res.connected,
          model: res.model || 'Gemma 4:31B',
          provider: res.provider || 'Google Gemma',
          modelAvailable: res.modelAvailable,
          modelsFound: res.modelsFound,
          message: res.message,
          lastChecked: new Date().toLocaleTimeString(),
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle custom dataset load (and evaluate armed alerts against new prices)
  const handleLoadCustomDataset = (
    newDatasets: Record<string, MarketDataPoint[]>,
    provenance: string
  ) => {
    setDataPoints(newDatasets);
    setCurrentProvenance(provenance);
    const firstTicker = Object.keys(newDatasets)[0];
    if (firstTicker) {
      setActiveTicker(firstTicker);
    }
    checkAndTriggerAlerts(newDatasets, priceAlerts);
  };

  // Reset to default institutional watchlist
  const handleResetToDemo = () => {
    setIsAutoStreaming(marketStatus.isOpen);
    const defaultData = generateDeterministicDemonstrationData();
    setDataPoints(defaultData);
    setCurrentProvenance('Institutional Equity Feed (NYSE & NASDAQ · 252 Trading Sessions)');
    setActiveTicker('NVDA');
  };

  const armedAlertsCount = priceAlerts.filter((a) => !a.triggered).length;
  const triggeredAlertsCount = priceAlerts.filter((a) => a.triggered).length;

  return (
    <div className="min-h-screen relative flex flex-col transition-colors bg-[#0B0F19] text-[#F1F5F9] selection:bg-blue-500/30 selection:text-blue-300">
      {/* On-Screen Visual Price & Volume Alert Notification Stack */}
      <PriceAlertNotifications
        notifications={alertNotifications}
        onDismiss={handleDismissNotification}
        onDismissAll={handleDismissAllNotifications}
        onSelectTicker={(ticker) => {
          setActiveTicker(ticker);
          setActiveTab('overview');
        }}
      />

      {/* Top Bar Navigation */}
      <NavigationHeader
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        gemmaConfig={gemmaConfig}
        marketStatus={marketStatus}
        onSelectOrAddStock={handleSelectOrAddStock}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHacktoberfest={() => setIsHacktoberfestOpen(true)}
        armedAlertsCount={armedAlertsCount}
        triggeredAlertsCount={triggeredAlertsCount}
      />

      {/* Dedicated Home Page ONLY when activeTab === 'home' */}
      {activeTab === 'home' ? (
        <main className="flex-1 w-full relative z-10 flex flex-col justify-center">
          <HeroSection
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            gemmaConfig={gemmaConfig}
            marketStatus={marketStatus}
            globalMarkets={globalMarkets}
            assetSummaries={assetSummaries}
            activeTicker={activeTicker}
            onSelectTicker={(ticker, name, sector) => {
              handleSelectOrAddStock(ticker, name, sector);
              setActiveTab('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : (
        /* Workspace View for Terminal, Portfolio, AI Analyst, Quant, Risk, and Reports */
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-4 relative z-10 space-y-4">
          {/* Streamlined Workspace Switcher & Active Equity Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 bg-[#111827] rounded-xl border border-white/10">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer shrink-0"
              >
                <Home className="w-3.5 h-3.5 text-blue-400" />
                <span>Home</span>
              </button>

              <span className="text-white/15 font-mono">|</span>

              {[
                { id: 'overview', label: 'Market Terminal', icon: BarChart2 },
                { id: 'portfolio', label: 'Portfolio & P&L', icon: Briefcase },
                { id: 'analyst', label: 'AI Analyst', icon: Bot },
                { id: 'analytics', label: 'Quantitative', icon: Activity },
                { id: 'risk', label: 'Risk & Stress', icon: ShieldAlert },
                { id: 'report', label: 'Research Report', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md'
                        : 'text-white/65 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Equity Quick Selector across all workspace tabs */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-white/10 text-xs font-mono shrink-0">
              <span className="text-white/50 text-[11px]">ACTIVE EQUITY:</span>
              <select
                aria-label="Active Equity Selector"
                value={activeTicker}
                onChange={(e) => setActiveTicker(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {assetSummaries.map((a) => (
                  <option key={a.ticker} value={a.ticker} className="bg-[#111827] text-white">
                    {a.ticker} (${a.endPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section View Routing */}
          {activeTab === 'overview' && (
            <MarketOverview
              dataPoints={dataPoints}
              assetSummaries={assetSummaries}
              activeTicker={activeTicker}
              setActiveTicker={setActiveTicker}
              marketStatus={marketStatus}
              onSelectOrAddStock={handleSelectOrAddStock}
              isLoadingTicker={isLoadingTicker}
              onLoadCustomDataset={handleLoadCustomDataset}
              onResetToDemo={handleResetToDemo}
              currentProvenance={currentProvenance}
              priceAlerts={priceAlerts}
              onAddPriceAlert={handleAddPriceAlert}
              onDeletePriceAlert={handleDeletePriceAlert}
              onRearmPriceAlert={handleRearmPriceAlert}
              onSimulateMarketTick={handleSimulateMarketTick}
              isAutoStreaming={isAutoStreaming}
              setIsAutoStreaming={setIsAutoStreaming}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioSection
              assetSummaries={assetSummaries}
              holdings={portfolioHoldings}
              onUpdateHolding={handleUpdatePortfolioHolding}
              onResetHoldings={handleResetPortfolioHoldings}
              marketStatus={marketStatus}
              onSimulateMarketTick={handleSimulateMarketTick}
              isAutoStreaming={isAutoStreaming}
              setIsAutoStreaming={setIsAutoStreaming}
              onSelectTickerForTerminal={(ticker) => {
                setActiveTicker(ticker);
                setActiveTab('overview');
              }}
              onSelectOrAddStock={handleSelectOrAddStock}
            />
          )}

          {activeTab === 'analyst' && activeMetric && (
            <AIAnalystSection
              activeMetric={activeMetric}
              peerMetrics={peerMetrics}
              gemmaConfig={gemmaConfig}
              onNavigateToReport={() => setActiveTab('report')}
            />
          )}

          {activeTab === 'analytics' && activeMetric && (
            <FinancialAnalyticsSection
              activeMetric={activeMetric}
              peerMetrics={peerMetrics}
            />
          )}

          {activeTab === 'risk' && activeMetric && (
            <RiskAnalysisSection
              activeMetric={activeMetric}
              peerMetrics={peerMetrics}
              allDatasets={dataPoints}
            />
          )}

          {activeTab === 'report' && activeMetric && (
            <ReportSection
              activeMetric={activeMetric}
              peerMetrics={peerMetrics}
              currentProvenance={currentProvenance}
            />
          )}
        </main>
      )}

      {/* Compact Fit-to-Size Footer */}
      <footer className="w-full border-t border-white/10 bg-[#0B0F19] px-6 py-3.5 mt-4 relative z-10 text-xs font-mono text-white/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-white text-xs">MARKETMIND AI</span>
            <span>·</span>
            <span className="text-blue-400">Institutional Financial Intelligence Platform</span>
            <span className="hidden sm:inline text-white/30">·</span>
            <span className="hidden sm:inline text-[11px] text-white/40">
              Powered by Google Gemma 4:31B & Google Gemini 3.8 Flash
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsHacktoberfestOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              1-Click Launch & GitHub Code
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Gemma 4 & Gemini Engine
            </button>
            <span className="text-white/30">MIT License</span>
          </div>
        </div>
      </footer>

      {/* Google Gemma 4 Engine & Instant Link Modal */}
      <OllamaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={gemmaConfig}
        onSaveConfig={setGemmaConfig}
      />

      {/* GitHub Instant Launch Modal */}
      <HacktoberfestModal
        isOpen={isHacktoberfestOpen}
        onClose={() => setIsHacktoberfestOpen(false)}
      />
    </div>
  );
}
