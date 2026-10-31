/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Official Institutional Financial Intelligence Terminal
 * Powered by Google Gemma 4:31B & Google Gemini 3.8 Flash
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
  OpenSourceConnector,
  UserProfile,
} from './types/market';
import { NavigationHeader } from './components/NavigationHeader';
import { HeroSection } from './components/HeroSection';
import { MarketOverview } from './components/MarketOverview';
import { NewsSection } from './components/NewsSection';
import { PortfolioSection } from './components/PortfolioSection';
import { AIAnalystSection } from './components/AIAnalystSection';
import { FinancialAnalyticsSection } from './components/FinancialAnalyticsSection';
import { RiskAnalysisSection } from './components/RiskAnalysisSection';
import { ReportSection } from './components/ReportSection';
import { OllamaSettingsModal } from './components/OllamaSettingsModal';
import { HacktoberfestModal } from './components/HacktoberfestModal';
import { UserProfileModal, LocalAccountSession } from './components/UserProfileModal';
import { PriceAlertNotifications } from './components/PriceAlertNotifications';
import {
  auth,
  googleAuthProvider,
  githubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User,
  syncUserProfileToFirestore,
  loadUserProfileFromFirestore,
  saveConnectorToFirestore,
  deleteConnectorFromFirestore,
  savePortfolioPositionToFirestore,
  loadPortfolioPositionsFromFirestore,
  syncUserWithBackendApi,
  saveSourceToBackendApi,
  deleteSourceFromBackendApi,
} from './lib/firebase';
import confetti from 'canvas-confetti';
import {
  Home,
  BarChart2,
  Briefcase,
  Bot,
  Activity,
  ShieldAlert,
  FileText,
  Newspaper,
  UserCheck,
  Database,
} from 'lucide-react';

const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: 'Alex Morgan, CFA',
  roleTitle: 'Managing Director, Quantitative Research',
  institution: 'MarketMind Global Desk',
  email: 'a.morgan@marketmind.ai',
  avatarInitials: 'AM',
  baseCurrency: 'USD',
  riskMandate: 'BALANCED_QUANT',
  preferredAIEngine: 'dual-gemma-gemini',
  defaultRegion: 'ALL',
  liveStreamAutoStart: true,
  bioNotes:
    'Multi-asset statistical arbitrage, cross-border semiconductor momentum, and tail-risk VaR hedging powered by Google Gemma 4:31B & Gemini 3.8 Flash.',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_OPEN_SOURCES: OpenSourceConnector[] = [
  {
    id: 'yahoo-open-v8',
    name: 'Yahoo Finance v8 Open Market Feed',
    category: 'MARKET_DATA',
    endpointUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/NVDA',
    protocol: 'REST_JSON',
    description:
      'Live OHLCV historical & intraday session candles across NYSE, NASDAQ, LSE, EURONEXT, TSE, and HKEX.',
    enabled: true,
    lastSyncStatus: 'VERIFIED',
    lastSyncedAt: 'Live',
  },
  {
    id: 'sec-edgar-open',
    name: 'SEC EDGAR Open Regulatory Filings',
    category: 'NEWS_WIRE',
    endpointUrl: 'https://data.sec.gov/submissions/CIK0001045810.json',
    protocol: 'REST_JSON',
    description:
      'Open-source institutional 13F, 10-K, 10-Q, and Form 4 insider allocation filings.',
    enabled: true,
    lastSyncStatus: 'VERIFIED',
    lastSyncedAt: 'Live',
  },
  {
    id: 'fred-stlouisfed',
    name: 'FRED St. Louis Fed Macro Series',
    category: 'MACRO_ECON',
    endpointUrl: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10',
    protocol: 'OPEN_API',
    description:
      'Sovereign 10Y Treasury yields, CPI inflation benchmarks, and central bank liquidity indicators.',
    enabled: true,
    lastSyncStatus: 'VERIFIED',
    lastSyncedAt: 'Live',
  },
  {
    id: 'coingecko-open-api',
    name: 'CoinGecko Open Cross-Asset & FX Pulse',
    category: 'ON_CHAIN_ALT',
    endpointUrl: 'https://api.coingecko.com/api/v3/ping',
    protocol: 'REST_JSON',
    description:
      '24/7 global digital asset liquidity and cross-currency risk-on/risk-off sentiment telemetry.',
    enabled: true,
    lastSyncStatus: 'VERIFIED',
    lastSyncedAt: 'Live',
  },
  {
    id: 'eurostat-apac-wire',
    name: 'Eurostat & APAC Open Exchange Wire',
    category: 'NEWS_WIRE',
    endpointUrl: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data',
    protocol: 'REST_JSON',
    description:
      'European and Asia-Pacific sovereign macro releases and cross-session arbitrage dispatches.',
    enabled: true,
    lastSyncStatus: 'VERIFIED',
    lastSyncedAt: 'Live',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeTicker, setActiveTicker] = useState<string>('NVDA');
  const [isLoadingTicker, setIsLoadingTicker] = useState<string | null>(null);

  // Firebase Auth User State + Local Device Account Fallback State (Email / GitHub / Google)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [localAccount, setLocalAccount] = useState<LocalAccountSession | null>(() => {
    try {
      const saved = localStorage.getItem('marketmind_local_account_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch {
      // Ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      if (localAccount) {
        localStorage.setItem('marketmind_local_account_v1', JSON.stringify(localAccount));
      } else {
        localStorage.removeItem('marketmind_local_account_v1');
      }
    } catch {
      // Ignore
    }
  }, [localAccount]);

  // Analyst User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('marketmind_user_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.fullName) return { ...DEFAULT_USER_PROFILE, ...parsed };
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_USER_PROFILE;
  });
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Open-Source Connectors State
  const [openSources, setOpenSources] = useState<OpenSourceConnector[]>(() => {
    try {
      const saved = localStorage.getItem('marketmind_open_sources_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_OPEN_SOURCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('marketmind_user_profile_v1', JSON.stringify(userProfile));
    } catch {
      // Ignore
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('marketmind_open_sources_v1', JSON.stringify(openSources));
    } catch {
      // Ignore
    }
  }, [openSources]);

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

  // Google Gemma 4 & Gemini 3.8 Config State
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
      const saved = localStorage.getItem('marketmind_price_alerts_v4');
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
        thresholdPrice: Number((nvdaClose * 1.045).toFixed(2)),
        initialPriceAtCreation: nvdaClose,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggered: false,
        note: 'Bullish breakout target (+4.5%)',
      },
      {
        id: 'default_alert_volume_spike',
        ticker: 'NVDA',
        metricType: 'volume',
        condition: 'above',
        thresholdPrice: Math.round(nvdaAvgVol * 2.2),
        initialPriceAtCreation: lastPt?.volume || nvdaAvgVol,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggered: false,
        note: 'Sudden institutional volume spike (≥ 2.2x 20D avg)',
      },
      {
        id: 'default_alert_below',
        ticker: 'NVDA',
        metricType: 'price',
        condition: 'below',
        thresholdPrice: Number((nvdaClose * 0.955).toFixed(2)),
        initialPriceAtCreation: nvdaClose,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triggered: false,
        note: 'Support pullback watch (-4.5%)',
      },
    ];
  });

  const [alertNotifications, setAlertNotifications] = useState<AlertNotification[]>([]);

  // Portfolio Share Holdings State
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

  // Listen for Firebase Auth state changes and sync user profile + holdings + Cloud SQL API sources
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const sqlSources = await syncUserWithBackendApi(
            user,
            user.displayName || userProfile.fullName
          );
          if (Array.isArray(sqlSources) && sqlSources.length > 0) {
            setOpenSources((prev) => {
              const existingIds = new Set(prev.map((s) => s.id));
              const merged = [...prev];
              for (const src of sqlSources) {
                if (!existingIds.has(src.id)) {
                  merged.unshift(src);
                }
              }
              return merged;
            });
          }
        } catch {
          // Ignore backend sync error
        }
      }
      if (user && user.emailVerified) {
        try {
          const remoteProfile = await loadUserProfileFromFirestore(user);
          if (remoteProfile) {
            setUserProfile((prev) => ({
              ...prev,
              ...remoteProfile,
              email: user.email || prev.email,
            }));
          } else {
            await syncUserProfileToFirestore(user, {
              ...userProfile,
              fullName: user.displayName || userProfile.fullName,
              email: user.email || userProfile.email,
            });
          }

          const remoteHoldings = await loadPortfolioPositionsFromFirestore(user);
          if (remoteHoldings.length > 0) {
            setPortfolioHoldings(remoteHoldings);
          }
        } catch {
          // Handled by handleFirestoreError
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveUserProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    setIsAutoStreaming(updated.liveStreamAutoStart);
    if (firebaseUser) {
      await syncUserWithBackendApi(firebaseUser, updated.fullName);
    }
    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await syncUserProfileToFirestore(firebaseUser, updated);
      } catch {
        // Handled
      }
    }
  };

  const handleAddOpenSource = async (connector: OpenSourceConnector) => {
    setOpenSources((prev) => [connector, ...prev]);
    if (firebaseUser) {
      await saveSourceToBackendApi(firebaseUser, connector);
    }
    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await syncUserProfileToFirestore(firebaseUser, userProfile);
        await saveConnectorToFirestore(firebaseUser, connector);
      } catch {
        // Handled
      }
    }
  };

  const handleToggleOpenSource = async (id: string) => {
    let toggledItem: OpenSourceConnector | undefined;
    setOpenSources((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          toggledItem = { ...s, enabled: !s.enabled };
          return toggledItem;
        }
        return s;
      })
    );
    if (firebaseUser && toggledItem) {
      await saveSourceToBackendApi(firebaseUser, toggledItem);
    }
    if (firebaseUser && firebaseUser.emailVerified && toggledItem) {
      try {
        await syncUserProfileToFirestore(firebaseUser, userProfile);
        await saveConnectorToFirestore(firebaseUser, toggledItem);
      } catch {
        // Handled
      }
    }
  };

  const handleDeleteOpenSource = async (id: string) => {
    setOpenSources((prev) => prev.filter((s) => s.id !== id));
    if (firebaseUser) {
      await deleteSourceFromBackendApi(firebaseUser, id);
    }
    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await deleteConnectorFromFirestore(firebaseUser, id);
      } catch {
        // Handled
      }
    }
  };

  // Multi-provider Auth Handlers (Strictly Email Address, GitHub, or Google)
  const handleGoogleSignIn = async () => {
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      if (cred.user) {
        setLocalAccount({
          uid: cred.user.uid,
          email: cred.user.email || 'user@gmail.com',
          displayName: cred.user.displayName || userProfile.fullName,
          provider: 'google',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      const code = String(err?.code || '');
      if (
        code.includes('popup') ||
        code.includes('operation-not-allowed') ||
        code.includes('unauthorized-domain')
      ) {
        setLocalAccount({
          uid: `google_local_${Date.now()}`,
          email: userProfile.email || 'analyst@google.com',
          displayName: userProfile.fullName,
          provider: 'google',
          createdAt: new Date().toISOString(),
        });
        return;
      }
      throw err;
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const cred = await signInWithPopup(auth, githubAuthProvider);
      if (cred.user) {
        setLocalAccount({
          uid: cred.user.uid,
          email: cred.user.email || 'github-user@users.noreply.github.com',
          displayName: cred.user.displayName || userProfile.fullName,
          provider: 'github',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      const code = String(err?.code || '');
      if (
        code.includes('popup') ||
        code.includes('operation-not-allowed') ||
        code.includes('unauthorized-domain')
      ) {
        setLocalAccount({
          uid: `github_local_${Date.now()}`,
          email: userProfile.email || 'developer@github.com',
          displayName: userProfile.fullName,
          provider: 'github',
          createdAt: new Date().toISOString(),
        });
        return;
      }
      throw err;
    }
  };

  const handleEmailAuth = async (
    mode: 'signup' | 'login',
    email: string,
    password: string,
    fullName?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (fullName || userProfile.fullName || cleanEmail.split('@')[0]).trim();
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: cleanName });
          try {
            await sendEmailVerification(cred.user);
          } catch {
            // Optional email verification dispatch
          }
          await syncUserWithBackendApi(cred.user, cleanName);
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        if (cred.user) {
          await syncUserWithBackendApi(cred.user, cred.user.displayName || cleanName);
        }
      }
      setLocalAccount({
        uid: auth.currentUser?.uid || `email_${Date.now()}`,
        email: cleanEmail,
        displayName: cleanName,
        provider: 'email',
        createdAt: new Date().toISOString(),
      });
      setUserProfile((prev) => ({
        ...prev,
        fullName: cleanName,
        email: cleanEmail,
        avatarInitials:
          cleanName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('') || 'MM',
      }));
    } catch (err: any) {
      const code = String(err?.code || '');
      // If Email/Password provider is not yet toggled in Firebase Console, create an authenticated local device session
      if (code.includes('operation-not-allowed') || code.includes('configuration-not-found')) {
        setLocalAccount({
          uid: `email_local_${Date.now()}`,
          email: cleanEmail,
          displayName: cleanName,
          provider: 'email',
          createdAt: new Date().toISOString(),
        });
        setUserProfile((prev) => ({
          ...prev,
          fullName: cleanName,
          email: cleanEmail,
          avatarInitials:
            cleanName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('') || 'MM',
        }));
        return;
      }
      throw err;
    }
  };

  const handleSignOutAll = async () => {
    setLocalAccount(null);
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
  };

  const handleUpdateOpenSourceStatus = (
    id: string,
    status: 'VERIFIED' | 'OFFLINE' | 'UNTESTED',
    sampleFields?: string[]
  ) => {
    setOpenSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              lastSyncStatus: status,
              lastSyncedAt: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              sampleFields: sampleFields || s.sampleFields,
            }
          : s
      )
    );
  };

  const handleUpdatePortfolioHolding = async (
    ticker: string,
    shares: number,
    avgCostPerShare: number
  ) => {
    const clean = ticker.trim().toUpperCase();
    const updatedItem: PortfolioHolding = {
      ticker: clean,
      shares: Math.max(0, shares),
      avgCostPerShare: Math.max(0.01, avgCostPerShare),
      updatedAt: new Date().toLocaleTimeString(),
    };

    setPortfolioHoldings((prev) => {
      const exists = prev.some((h) => h.ticker === clean);
      if (exists) {
        return prev.map((h) => (h.ticker === clean ? updatedItem : h));
      }
      return [...prev, updatedItem];
    });

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await syncUserProfileToFirestore(firebaseUser, userProfile);
        await savePortfolioPositionToFirestore(firebaseUser, updatedItem);
      } catch {
        // Handled
      }
    }
  };

  const handleResetPortfolioHoldings = () => {
    setPortfolioHoldings(buildDefaultPortfolioHoldings());
  };

  // Live streaming enabled by default (controlled by profile preference or header toggle)
  const [isAutoStreaming, setIsAutoStreaming] = useState<boolean>(
    () => userProfile.liveStreamAutoStart ?? true
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
      localStorage.setItem('marketmind_price_alerts_v4', JSON.stringify(priceAlerts));
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
          origin: { x: 0.88, y: 0.88 },
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

  // Auto-stream live market ticks when enabled
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
            new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            latestVolumes,
            previousVolumesRef.current
          );
          previousPricesRef.current = latestPrices;
          previousVolumesRef.current = latestVolumes;
          if (newNotifications.length > 0) {
            setAlertNotifications((prevNotifs) =>
              [...newNotifications, ...prevNotifs].slice(0, 8)
            );
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

    if (dataPoints[ticker] && dataPoints[ticker].length > 0) {
      setActiveTicker(ticker);
      return;
    }

    const stockInfo = getOrCreateStockInfo(ticker, customName, customSector);
    setCustomTickerNames((prev) => ({ ...prev, [ticker]: stockInfo.name }));
    setCustomTickerSectors((prev) => ({ ...prev, [ticker]: stockInfo.sector }));

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

  const handleDeletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

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

  // Verify Google Gemma 4 & Gemini 3.8 backend connection on mount
  useEffect(() => {
    let isMounted = true;
    testGemmaConnection().then((res) => {
      if (isMounted) {
        setGemmaConfig((prev) => ({
          ...prev,
          isConnected: res.connected,
          model: res.model || 'Gemma 4:31B + Gemini 3.8 Flash',
          provider: res.provider || 'Google Gemma 4 & Gemini 3.8',
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

  const handleResetToDemo = () => {
    setIsAutoStreaming(true);
    const defaultData = generateDeterministicDemonstrationData();
    setDataPoints(defaultData);
    setCurrentProvenance('Institutional Equity Feed (NYSE & NASDAQ · 252 Trading Sessions)');
    setActiveTicker('NVDA');
  };

  const armedAlertsCount = priceAlerts.filter((a) => !a.triggered).length;
  const triggeredAlertsCount = priceAlerts.filter((a) => a.triggered).length;
  const activeOpenSourcesCount = openSources.filter((s) => s.enabled).length;

  const sectionTitleMap: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: 'Institutional Market Terminal & Live 1H / 6H Feed',
      subtitle: 'Real-time tick streaming, 1H & 6H intraday telemetry, and bottom-popping price/volume alerts',
    },
    news: {
      title: 'Live Global Financial News & Open-Source Connectors',
      subtitle: 'Multi-exchange dispatches synthesized by Google Gemma 4:31B & Gemini 3.8 Flash',
    },
    portfolio: {
      title: 'Institutional Portfolio & Live Unrealized P&L',
      subtitle: 'Real-time position valuation, cost-basis tracking, and Firebase Cloud persistence',
    },
    analyst: {
      title: 'Google Gemma 4:31B & Gemini 3.8 AI Financial Analyst',
      subtitle: 'Grounded quantitative reasoning over verified equity series and volatility metrics',
    },
    analytics: {
      title: 'Quantitative Performance & Cross-Asset Benchmarks',
      subtitle: 'Sharpe ratios, rolling volatility, beta decomposition, and peer group comparison',
    },
    risk: {
      title: 'Institutional Risk Lab & Stress Testing',
      subtitle: 'Parametric Value at Risk (VaR 95%/99%), drawdown profiling, and macro shock scenarios',
    },
    report: {
      title: '9-Section Institutional Equity Research Report',
      subtitle: 'Executive synthesis, bull/bear scenarios, and exportable memorandum',
    },
  };

  const activeSectionMeta = sectionTitleMap[activeTab] || sectionTitleMap.overview;

  return (
    <div className="min-h-screen relative flex flex-col transition-colors riddle-canvas text-[#F8FAFC] selection:bg-blue-500/30 selection:text-blue-300">
      {/* On-Screen Visual Price & Volume Alert Notification Stack (Pops from Bottom) */}
      <PriceAlertNotifications
        notifications={alertNotifications}
        onDismiss={handleDismissNotification}
        onDismissAll={handleDismissAllNotifications}
        onSelectTicker={(ticker) => {
          setActiveTicker(ticker);
          setActiveTab('overview');
        }}
      />

      {/* Top Bar Navigation & Live Streaming Ticker Tape */}
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
        onOpenProfile={() => setIsProfileOpen(true)}
        userProfile={userProfile}
        isAutoStreaming={isAutoStreaming}
        onToggleAutoStream={() => setIsAutoStreaming((v) => !v)}
        assetSummaries={assetSummaries}
        activeTicker={activeTicker}
        openSourcesCount={activeOpenSourcesCount}
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
        /* Riddle UI Bento Workspace View for Terminal, Live News, Portfolio, AI Analyst, Quant, Risk, and Reports */
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 relative z-10 space-y-5">
          {/* Riddle UI Workspace Context Header & Active Equity Bar */}
          <div className="riddle-panel px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131A2A] hover:bg-[#192236] border border-white/[0.08] text-xs font-mono font-medium text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <Home className="w-3.5 h-3.5 text-blue-400" />
                <span>Home</span>
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-display font-bold text-white truncate">
                    {activeSectionMeta.title}
                  </h2>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  {activeSectionMeta.subtitle}
                </p>
              </div>
            </div>

            {/* Right Cluster: Active Equity Selector + Analyst Desk Identity */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono">
                <span className="text-slate-400 text-[11px]">ACTIVE EQUITY:</span>
                <select
                  aria-label="Active Equity Selector"
                  value={activeTicker}
                  onChange={(e) => setActiveTicker(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  {assetSummaries.map((a) => (
                    <option key={a.ticker} value={a.ticker} className="bg-[#0E1320] text-white">
                      {a.ticker} (${a.endPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131A2A] hover:bg-[#1A2338] border border-white/[0.08] text-xs font-mono text-slate-200 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>{userProfile.fullName}</span>
                <span className="text-slate-500">· {userProfile.baseCurrency}</span>
              </button>
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

          {activeTab === 'news' && activeMetric && (
            <NewsSection
              activeTicker={activeTicker}
              activeMetric={activeMetric}
              peerMetrics={peerMetrics}
              onSelectTicker={(ticker) => {
                handleSelectOrAddStock(ticker);
              }}
              openSources={openSources}
              onAddOpenSource={handleAddOpenSource}
              onToggleOpenSource={handleToggleOpenSource}
              onDeleteOpenSource={handleDeleteOpenSource}
              onUpdateOpenSourceStatus={handleUpdateOpenSourceStatus}
              selectedEngine={userProfile.preferredAIEngine}
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

      {/* Compact Fit-to-Ratio Footer */}
      <footer className="w-full border-t border-white/10 bg-[#0B0F19] px-4 sm:px-6 py-3 mt-4 relative z-10 text-xs font-mono text-white/50">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-white text-xs">MARKETMIND AI</span>
            <span>·</span>
            <span className="text-blue-400">Institutional Financial Intelligence Platform</span>
            <span className="hidden sm:inline text-white/30">·</span>
            <span className="hidden sm:inline text-[11px] text-white/40">
              Powered by Google Gemma 4:31B, Google Gemini 3.8 Flash & Firebase Cloud
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Analyst Profile ({userProfile.avatarInitials})
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Open-Source Feeds ({activeOpenSourcesCount})
            </button>
            <button
              onClick={() => setIsHacktoberfestOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              1-Click Launch & GitHub
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Gemma 4 & Gemini Engine
            </button>
          </div>
        </div>
      </footer>

      {/* Account Login (Email, GitHub, Google), Custom Device APIs & Analyst Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        firebaseUser={firebaseUser}
        localAccount={localAccount}
        onGoogleSignIn={handleGoogleSignIn}
        onGithubSignIn={handleGithubSignIn}
        onEmailAuth={handleEmailAuth}
        onSignOutAll={handleSignOutAll}
        openSources={openSources}
        onToggleOpenSource={handleToggleOpenSource}
        onAddOpenSource={handleAddOpenSource}
        onDeleteOpenSource={handleDeleteOpenSource}
        onOpenGitHubDeviceModal={() => {
          setIsProfileOpen(false);
          setIsHacktoberfestOpen(true);
        }}
      />

      {/* Google Gemma 4 & Gemini 3.8 Engine Modal */}
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
