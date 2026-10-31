/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Official Institutional Financial Terminal Types & Schemas
 */

export interface MarketDataPoint {
  date: string;
  ticker: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface ReturnRecord {
  date: string;
  returnPct: number;
  price: number;
}

export interface AssetMetrics {
  ticker: string;
  name: string;
  sector?: string;
  dataPointsCount: number;
  startDate: string;
  endDate: string;
  startPrice: number;
  endPrice: number;
  totalReturnPct: number;
  annualizedReturnPct: number;
  annualizedVolatility: number;
  maxDrawdownPct: number;
  maxDrawdownPeakDate: string;
  maxDrawdownTroughDate: string;
  bestDay: { date: string; returnPct: number };
  worstDay: { date: string; returnPct: number };
  var95Pct: number; // 95% 1-day Value at Risk (historical)
  sharpeRatio: number; // Proxy assuming 4.5% risk-free rate
  calmarRatio: number;
  currentSMA20: number;
  currentSMA50: number;
  currentSMA200: number;
  currentVolume: number;
  averageVolume20: number;
  dailyReturns: ReturnRecord[];
}

export interface CorrelationMatrix {
  tickers: string[];
  matrix: number[][];
}

export type AIEngineSelection = 'gemma-4-31b' | 'gemini-3.8-flash' | 'dual-gemma-gemini';

export interface GemmaConfig {
  baseUrl: string;
  model: string;
  provider: string;
  selectedEngine?: AIEngineSelection;
  isConnected: boolean;
  isChecking: boolean;
  modelAvailable?: boolean;
  modelsFound?: string[];
  lastChecked?: string;
  message?: string;
  error?: string;
}

export interface LiveMarketAIPulse {
  ticker: string;
  price: number;
  totalReturnPct: number;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'DEFENSIVE';
  engineLabel: string;
  headline: string;
  orderFlowPulse: string;
  riskPulse: string;
  aiLiveCommentary: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mathematicalContext?: Record<string, string | number>;
  source?: 'gemma4-cloud' | 'gemini-3.8-flash' | 'dual-ai' | 'error';
  engineUsed?: AIEngineSelection;
  isError?: boolean;
}

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  marketImpactPct: number;
  volatilityMultiplier: number;
  recoveryMonthsEstimate: number;
}

export interface PriceAlert {
  id: string;
  ticker: string;
  metricType?: 'price' | 'volume';
  condition: 'above' | 'below';
  thresholdPrice: number;
  initialPriceAtCreation: number;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  note?: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  ticker: string;
  metricType: 'price' | 'volume';
  condition: 'above' | 'below';
  thresholdPrice: number;
  previousPrice: number;
  currentPrice: number;
  timestamp: string;
  note?: string;
}

export type MarketSessionState = 'REGULAR' | 'PRE_MARKET' | 'AFTER_HOURS' | 'CLOSED';

export interface MarketSessionStatus {
  isOpen: boolean;
  isExtendedHours: boolean;
  session: MarketSessionState;
  label: string;
  easternTime: string;
  exchange: string;
  nextTransition: string;
}

export type StockExchange =
  | 'NASDAQ'
  | 'NYSE'
  | 'NYSE Arca'
  | 'LSE'
  | 'EURONEXT'
  | 'XETRA'
  | 'SIX'
  | 'TSE'
  | 'HKEX'
  | 'SSE'
  | 'KRX'
  | 'NSE'
  | 'ASX'
  | 'TSX'
  | 'B3';

export type MarketRegion =
  | 'US (NYSE & NASDAQ)'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Americas & Global';

export interface StockDirectoryItem {
  ticker: string;
  name: string;
  sector: string;
  exchange: StockExchange;
  region?: MarketRegion;
  country?: string;
  currency?: string;
  basePrice: number;
  drift: number;
  volatility: number;
  description: string;
}

export interface GlobalMarketExchangeStatus {
  id: string;
  exchange: string;
  name: string;
  city: string;
  country: string;
  region: MarketRegion;
  timezone: string;
  currency: string;
  isOpen: boolean;
  sessionLabel: 'OPEN' | 'CLOSED' | 'LUNCH BREAK';
  localTime: string;
  tradingHoursLocal: string;
}

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  avgCostPerShare: number;
  updatedAt?: string;
}

export interface PortfolioPositionMetrics {
  ticker: string;
  name: string;
  sector: string;
  shares: number;
  avgCostPerShare: number;
  currentPrice: number;
  previousClose: number;
  dayReturnPct: number;
  costBasisTotal: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  dayPnL: number;
  allocationWeightPct: number;
}

export interface PortfolioSummaryMetrics {
  totalMarketValue: number;
  totalCostBasis: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPct: number;
  totalDayPnL: number;
  totalDayPnLPct: number;
  activePositionsCount: number;
  totalSharesCount: number;
  positions: PortfolioPositionMetrics[];
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  relatedTickers: string[];
  category: 'EARNINGS' | 'MACRO' | 'AI & SEMIS' | 'GLOBAL MARKETS' | 'OPEN SOURCE FEED';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactScore: number; // 1 to 100
  aiTakeaway: string;
}

export interface OpenSourceConnector {
  id: string;
  name: string;
  category: 'MARKET_DATA' | 'NEWS_WIRE' | 'MACRO_ECON' | 'ON_CHAIN_ALT' | 'AI_ENDPOINT';
  endpointUrl: string;
  protocol: 'REST_JSON' | 'RSS_XML' | 'GRAPHQL' | 'OPEN_API';
  description: string;
  enabled: boolean;
  isCustom?: boolean;
  lastSyncStatus?: 'VERIFIED' | 'OFFLINE' | 'UNTESTED';
  lastSyncedAt?: string;
  sampleFields?: string[];
}

export interface LiveTradeTick {
  id: string;
  ticker: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  exchange: string;
  timestamp: string;
}

export interface UserProfile {
  fullName: string;
  roleTitle: string;
  institution: string;
  email: string;
  avatarInitials: string;
  baseCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';
  riskMandate: 'CONSERVATIVE' | 'BALANCED_QUANT' | 'AGGRESSIVE_ALPHA' | 'TAIL_RISK_HEDGED';
  preferredAIEngine: AIEngineSelection;
  defaultRegion: 'ALL' | MarketRegion;
  liveStreamAutoStart: boolean;
  bioNotes: string;
  updatedAt: string;
}
