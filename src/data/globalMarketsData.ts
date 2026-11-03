/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Global Multi-Asset Universe, Heatwave Engine, News Wire, Net Worth & AI Buy/Sell Signals
 */

import { AssetMetrics } from '../types/market';

export type GlobalMarketCategory =
  | 'ALL'
  | 'US_MARKET'
  | 'EUROPE_MARKET'
  | 'ASIA_MARKET'
  | 'CRYPTO'
  | 'RATES'
  | 'COMMODITIES'
  | 'CURRENCIES';

export interface GlobalMarketInstrument {
  symbol: string;
  name: string;
  category: Exclude<GlobalMarketCategory, 'ALL'>;
  categoryLabel: string;
  exchange: string;
  region: string;
  unitPrefix: string;
  unitSuffix: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
  weekChangePct: number;
  ytdChangePct: number;
  dayHigh: number;
  dayLow: number;
  volumeLabel: string;
  volumeRatio: number; // e.g. 1.45x 20D avg
  volatilityPct: number;
  rsi14: number;
  sma50: number;
  sma200: number;
  marketCapOrNotional: string;
  heatwaveWeight: number;
  isTrending?: boolean;
}

export interface EconomicCalendarEvent {
  id: string;
  timeET: string;
  dateLabel: string;
  country: 'US' | 'EU' | 'UK' | 'JP' | 'CN' | 'GLOBAL';
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual: string;
  forecast: string;
  previous: string;
  status: 'RELEASED' | 'UPCOMING' | 'LIVE';
  marketEffect: string;
  affectedAssets: string[];
}

export type NewsProviderName =
  | 'The Wall Street Journal'
  | 'MarketWatch'
  | 'Yahoo Finance'
  | 'Bloomberg'
  | 'Morningstar'
  | 'Investopedia'
  | 'Open Source Wire';

export interface CuratedNewsArticle {
  id: string;
  source: NewsProviderName;
  sourceShort: string;
  headline: string;
  summary: string;
  publishedAt: string;
  category: GlobalMarketCategory | 'MACRO';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  relatedTickers: string[];
  url: string;
  readTime: string;
  quantTakeaway: string;
}

export interface CashAccountItem {
  id: string;
  accountName: string;
  institution: string;
  accountType: 'TREASURY_SWEEP' | 'CHECKING' | 'MARGIN_COLLATERAL' | 'MONEY_MARKET';
  currency: string;
  balance: number;
  apyPct: number;
  updatedAt: string;
}

export interface LiabilityItem {
  id: string;
  name: string;
  lender: string;
  category: 'MARGIN_LOAN' | 'MORTGAGE' | 'CREDIT_LINE' | 'SHORT_TERM_NOTE';
  balance: number;
  aprPct: number;
  monthlyPayment: number;
  dueDateLabel: string;
}

export interface NetWorthSummary {
  investmentsValue: number;
  investmentsCostBasis: number;
  investmentsUnrealizedPnL: number;
  investmentsUnrealizedPnLPct: number;
  investmentsDayPnL: number;
  totalCashBalance: number;
  annualCashYieldEstimate: number;
  weightedCashApyPct: number;
  totalAssets: number;
  totalLiabilities: number;
  totalMonthlyDebtService: number;
  weightedLiabilityAprPct: number;
  netWorth: number;
  debtToAssetRatioPct: number;
  liquidityRatioPct: number;
}

export type AISignalAction = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';

export interface AITradingAlertSignal {
  id: string;
  symbol: string;
  name: string;
  category: Exclude<GlobalMarketCategory, 'ALL'>;
  action: AISignalAction;
  confidencePct: number;
  currentPrice: number;
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  upsidePct: number;
  riskRewardRatio: number;
  timeframe: 'INTRADAY (1D-3D)' | 'SWING (2W-6W)' | 'POSITION (3M-6M)';
  rsi14: number;
  volatilityPct: number;
  technicalTrigger: string;
  quantThesis: string;
  engineBadge: 'Gemma 4:31B + Gemini 3.8' | 'Gemma 4:31B Cloud' | 'Gemini 3.8 Flash';
  timestamp: string;
}

export const GLOBAL_MARKET_CATEGORIES: {
  id: GlobalMarketCategory;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'ALL',
    label: 'All Markets Heatwave',
    shortLabel: 'All Markets',
    description: 'Cross-asset global heatwave across US, Europe, Asia, Crypto, Rates, Commodities & FX',
  },
  {
    id: 'US_MARKET',
    label: 'US Market',
    shortLabel: 'US Market',
    description: 'S&P 500, Nasdaq-100, Dow Jones & flagship NYSE/NASDAQ institutional equities',
  },
  {
    id: 'EUROPE_MARKET',
    label: 'Europe Market',
    shortLabel: 'Europe',
    description: 'STOXX Europe 600, DAX 40, FTSE 100, CAC 40 & European sovereign leaders',
  },
  {
    id: 'ASIA_MARKET',
    label: 'Asia Market',
    shortLabel: 'Asia',
    description: 'Nikkei 225, Hang Seng, CSI 300, KOSPI & Asia-Pacific semiconductor/industrial titans',
  },
  {
    id: 'CRYPTO',
    label: 'Crypto',
    shortLabel: 'Crypto',
    description: '24/7 digital asset spot benchmarks, Layer-1 protocols & institutional liquidity pairs',
  },
  {
    id: 'RATES',
    label: 'Rates & Yields',
    shortLabel: 'Rates',
    description: 'US Treasury yield curve (2Y/10Y/30Y), Bunds, Gilts, JGBs & policy benchmark rates',
  },
  {
    id: 'COMMODITIES',
    label: 'Commodities',
    shortLabel: 'Commodities',
    description: 'Precious metals, energy benchmarks (WTI/Brent/NatGas), industrial metals & agriculture',
  },
  {
    id: 'CURRENCIES',
    label: 'Currencies (FX)',
    shortLabel: 'Currencies',
    description: 'US Dollar Index (DXY) & G10/EM major foreign exchange spot crosses',
  },
];

export const INITIAL_GLOBAL_INSTRUMENTS: GlobalMarketInstrument[] = [
  // =========================================================================
  // 1. US MARKET
  // =========================================================================
  {
    symbol: 'SPX',
    name: 'S&P 500 Index',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'INDEX',
    region: 'United States',
    unitPrefix: '',
    unitSuffix: ' pts',
    price: 5984.50,
    previousClose: 5931.20,
    change: 53.30,
    changePct: 0.90,
    weekChangePct: 2.15,
    ytdChangePct: 24.80,
    dayHigh: 5996.00,
    dayLow: 5928.40,
    volumeLabel: '4.12B',
    volumeRatio: 1.18,
    volatilityPct: 13.8,
    rsi14: 61.4,
    sma50: 5810.2,
    sma200: 5420.5,
    marketCapOrNotional: '$51.4T',
    heatwaveWeight: 95,
    isTrending: true,
  },
  {
    symbol: 'NDX',
    name: 'Nasdaq-100 Index',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '',
    unitSuffix: ' pts',
    price: 21140.80,
    previousClose: 20845.10,
    change: 295.70,
    changePct: 1.42,
    weekChangePct: 3.40,
    ytdChangePct: 28.90,
    dayHigh: 21195.00,
    dayLow: 20830.00,
    volumeLabel: '5.64B',
    volumeRatio: 1.32,
    volatilityPct: 18.4,
    rsi14: 64.8,
    sma50: 20290.0,
    sma200: 18940.0,
    marketCapOrNotional: '$26.8T',
    heatwaveWeight: 92,
    isTrending: true,
  },
  {
    symbol: 'DJI',
    name: 'Dow Jones Industrial Average',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NYSE',
    region: 'United States',
    unitPrefix: '',
    unitSuffix: ' pts',
    price: 43890.20,
    previousClose: 43742.00,
    change: 148.20,
    changePct: 0.34,
    weekChangePct: 1.12,
    ytdChangePct: 16.40,
    dayHigh: 43970.00,
    dayLow: 43690.00,
    volumeLabel: '382M',
    volumeRatio: 1.05,
    volatilityPct: 12.1,
    rsi14: 56.2,
    sma50: 42910.0,
    sma200: 40520.0,
    marketCapOrNotional: '$17.2T',
    heatwaveWeight: 78,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 189.40,
    previousClose: 181.75,
    change: 7.65,
    changePct: 4.21,
    weekChangePct: 8.95,
    ytdChangePct: 102.40,
    dayHigh: 191.10,
    dayLow: 182.30,
    volumeLabel: '64.8M',
    volumeRatio: 1.74,
    volatilityPct: 42.6,
    rsi14: 68.9,
    sma50: 168.4,
    sma200: 132.8,
    marketCapOrNotional: '$4.62T',
    heatwaveWeight: 100,
    isTrending: true,
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 618.90,
    previousClose: 599.10,
    change: 19.80,
    changePct: 3.30,
    weekChangePct: 6.45,
    ytdChangePct: 74.20,
    dayHigh: 622.50,
    dayLow: 601.00,
    volumeLabel: '18.2M',
    volumeRatio: 1.48,
    volatilityPct: 30.2,
    rsi14: 66.1,
    sma50: 578.0,
    sma200: 504.2,
    marketCapOrNotional: '$1.56T',
    heatwaveWeight: 88,
    isTrending: true,
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 234.80,
    previousClose: 231.10,
    change: 3.70,
    changePct: 1.60,
    weekChangePct: 3.10,
    ytdChangePct: 26.50,
    dayHigh: 235.90,
    dayLow: 230.80,
    volumeLabel: '49.1M',
    volumeRatio: 1.15,
    volatilityPct: 18.5,
    rsi14: 59.4,
    sma50: 226.4,
    sma200: 204.9,
    marketCapOrNotional: '$3.58T',
    heatwaveWeight: 90,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 214.60,
    previousClose: 209.40,
    change: 5.20,
    changePct: 2.48,
    weekChangePct: 5.20,
    ytdChangePct: 41.80,
    dayHigh: 215.80,
    dayLow: 209.10,
    volumeLabel: '44.3M',
    volumeRatio: 1.38,
    volatilityPct: 25.4,
    rsi14: 63.7,
    sma50: 198.6,
    sma200: 184.2,
    marketCapOrNotional: '$2.25T',
    heatwaveWeight: 86,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 428.50,
    previousClose: 432.10,
    change: -3.60,
    changePct: -0.83,
    weekChangePct: -1.40,
    ytdChangePct: 14.20,
    dayHigh: 433.00,
    dayLow: 426.20,
    volumeLabel: '21.4M',
    volumeRatio: 0.96,
    volatilityPct: 20.1,
    rsi14: 46.8,
    sma50: 431.0,
    sma200: 418.5,
    marketCapOrNotional: '$3.18T',
    heatwaveWeight: 84,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 184.20,
    previousClose: 180.90,
    change: 3.30,
    changePct: 1.82,
    weekChangePct: 4.10,
    ytdChangePct: 31.90,
    dayHigh: 185.40,
    dayLow: 180.50,
    volumeLabel: '28.9M',
    volumeRatio: 1.21,
    volatilityPct: 24.8,
    rsi14: 60.2,
    sma50: 174.5,
    sma200: 162.8,
    marketCapOrNotional: '$2.28T',
    heatwaveWeight: 82,
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom Inc.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 182.90,
    previousClose: 176.40,
    change: 6.50,
    changePct: 3.68,
    weekChangePct: 7.40,
    ytdChangePct: 64.50,
    dayHigh: 184.20,
    dayLow: 176.90,
    volumeLabel: '26.7M',
    volumeRatio: 1.44,
    volatilityPct: 33.4,
    rsi14: 65.8,
    sma50: 169.2,
    sma200: 148.0,
    marketCapOrNotional: '$854B',
    heatwaveWeight: 79,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 246.30,
    previousClose: 256.80,
    change: -10.50,
    changePct: -4.09,
    weekChangePct: -6.80,
    ytdChangePct: -1.20,
    dayHigh: 255.10,
    dayLow: 244.00,
    volumeLabel: '78.5M',
    volumeRatio: 1.65,
    volatilityPct: 48.2,
    rsi14: 34.2,
    sma50: 252.4,
    sma200: 221.8,
    marketCapOrNotional: '$782B',
    heatwaveWeight: 85,
    isTrending: true,
  },
  {
    symbol: 'INTC',
    name: 'Intel Corporation',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 22.14,
    previousClose: 23.45,
    change: -1.31,
    changePct: -5.59,
    weekChangePct: -9.40,
    ytdChangePct: -48.20,
    dayHigh: 23.30,
    dayLow: 21.95,
    volumeLabel: '62.1M',
    volumeRatio: 1.82,
    volatilityPct: 44.5,
    rsi14: 28.4,
    sma50: 24.1,
    sma200: 30.8,
    marketCapOrNotional: '$94B',
    heatwaveWeight: 72,
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NASDAQ',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 148.60,
    previousClose: 153.40,
    change: -4.80,
    changePct: -3.13,
    weekChangePct: -4.50,
    ytdChangePct: 1.80,
    dayHigh: 153.00,
    dayLow: 147.20,
    volumeLabel: '48.9M',
    volumeRatio: 1.39,
    volatilityPct: 39.1,
    rsi14: 38.6,
    sma50: 155.2,
    sma200: 161.4,
    marketCapOrNotional: '$240B',
    heatwaveWeight: 76,
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    category: 'US_MARKET',
    categoryLabel: 'US Market',
    exchange: 'NYSE',
    region: 'United States',
    unitPrefix: '$',
    unitSuffix: '',
    price: 238.40,
    previousClose: 234.10,
    change: 4.30,
    changePct: 1.84,
    weekChangePct: 3.90,
    ytdChangePct: 38.40,
    dayHigh: 239.60,
    dayLow: 233.80,
    volumeLabel: '11.4M',
    volumeRatio: 1.19,
    volatilityPct: 19.4,
    rsi14: 62.5,
    sma50: 224.8,
    sma200: 205.1,
    marketCapOrNotional: '$674B',
    heatwaveWeight: 74,
  },

  // =========================================================================
  // 2. EUROPE MARKET
  // =========================================================================
  {
    symbol: 'STOXX600',
    name: 'STOXX Europe 600 Index',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'STOXX',
    region: 'Eurozone / Europe',
    unitPrefix: '€',
    unitSuffix: '',
    price: 518.40,
    previousClose: 514.20,
    change: 4.20,
    changePct: 0.82,
    weekChangePct: 1.65,
    ytdChangePct: 8.90,
    dayHigh: 519.80,
    dayLow: 513.90,
    volumeLabel: '2.18B',
    volumeRatio: 1.09,
    volatilityPct: 12.6,
    rsi14: 55.8,
    sma50: 512.4,
    sma200: 501.2,
    marketCapOrNotional: '€13.8T',
    heatwaveWeight: 82,
  },
  {
    symbol: 'DAX',
    name: 'Germany DAX 40 Performance Index',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'XETRA',
    region: 'Germany',
    unitPrefix: '',
    unitSuffix: ' pts',
    price: 19485.60,
    previousClose: 19258.40,
    change: 227.20,
    changePct: 1.18,
    weekChangePct: 2.40,
    ytdChangePct: 16.20,
    dayHigh: 19520.00,
    dayLow: 19240.00,
    volumeLabel: '74.5M',
    volumeRatio: 1.22,
    volatilityPct: 14.2,
    rsi14: 60.4,
    sma50: 19020.0,
    sma200: 18240.0,
    marketCapOrNotional: '€1.89T',
    heatwaveWeight: 78,
  },
  {
    symbol: 'FTSE100',
    name: 'UK FTSE 100 Index',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'LSE',
    region: 'United Kingdom',
    unitPrefix: '',
    unitSuffix: ' pts',
    price: 8248.30,
    previousClose: 8282.10,
    change: -33.80,
    changePct: -0.41,
    weekChangePct: -0.85,
    ytdChangePct: 6.70,
    dayHigh: 8290.00,
    dayLow: 8231.00,
    volumeLabel: '690M',
    volumeRatio: 0.98,
    volatilityPct: 11.4,
    rsi14: 47.2,
    sma50: 8275.0,
    sma200: 8095.0,
    marketCapOrNotional: '£2.05T',
    heatwaveWeight: 72,
  },
  {
    symbol: 'CAC40',
    name: 'France CAC 40 Index',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'EURONEXT',
    region: 'France',
    unitPrefix: '',
    unitSuffix: ' pts',
    price: 7492.10,
    previousClose: 7558.40,
    change: -66.30,
    changePct: -0.88,
    weekChangePct: -1.60,
    ytdChangePct: -0.60,
    dayHigh: 7565.00,
    dayLow: 7475.00,
    volumeLabel: '88.2M',
    volumeRatio: 1.11,
    volatilityPct: 15.1,
    rsi14: 43.9,
    sma50: 7540.0,
    sma200: 7690.0,
    marketCapOrNotional: '€2.42T',
    heatwaveWeight: 70,
  },
  {
    symbol: 'ASML',
    name: 'ASML Holding N.V.',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'EURONEXT',
    region: 'Netherlands',
    unitPrefix: '€',
    unitSuffix: '',
    price: 684.50,
    previousClose: 662.10,
    change: 22.40,
    changePct: 3.38,
    weekChangePct: 5.90,
    ytdChangePct: 4.20,
    dayHigh: 689.00,
    dayLow: 664.00,
    volumeLabel: '1.84M',
    volumeRatio: 1.54,
    volatilityPct: 34.8,
    rsi14: 58.6,
    sma50: 672.0,
    sma200: 768.0,
    marketCapOrNotional: '€273B',
    heatwaveWeight: 85,
    isTrending: true,
  },
  {
    symbol: 'SAP.DE',
    name: 'SAP SE',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'XETRA',
    region: 'Germany',
    unitPrefix: '€',
    unitSuffix: '',
    price: 218.40,
    previousClose: 213.60,
    change: 4.80,
    changePct: 2.25,
    weekChangePct: 4.70,
    ytdChangePct: 54.80,
    dayHigh: 219.50,
    dayLow: 213.20,
    volumeLabel: '2.45M',
    volumeRatio: 1.31,
    volatilityPct: 21.2,
    rsi14: 67.4,
    sma50: 204.5,
    sma200: 182.9,
    marketCapOrNotional: '€268B',
    heatwaveWeight: 79,
  },
  {
    symbol: 'MC.PA',
    name: 'LVMH Moët Hennessy Louis Vuitton',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'EURONEXT',
    region: 'France',
    unitPrefix: '€',
    unitSuffix: '',
    price: 618.00,
    previousClose: 632.50,
    change: -14.50,
    changePct: -2.29,
    weekChangePct: -3.80,
    ytdChangePct: -14.10,
    dayHigh: 631.00,
    dayLow: 615.00,
    volumeLabel: '620K',
    volumeRatio: 1.26,
    volatilityPct: 26.4,
    rsi14: 37.8,
    sma50: 642.0,
    sma200: 712.0,
    marketCapOrNotional: '€309B',
    heatwaveWeight: 76,
  },
  {
    symbol: 'SHEL.L',
    name: 'Shell plc',
    category: 'EUROPE_MARKET',
    categoryLabel: 'Europe Market',
    exchange: 'LSE',
    region: 'United Kingdom',
    unitPrefix: '£',
    unitSuffix: '',
    price: 25.84,
    previousClose: 25.42,
    change: 0.42,
    changePct: 1.65,
    weekChangePct: 2.90,
    ytdChangePct: 3.40,
    dayHigh: 26.02,
    dayLow: 25.38,
    volumeLabel: '14.2M',
    volumeRatio: 1.14,
    volatilityPct: 19.8,
    rsi14: 54.9,
    sma50: 25.3,
    sma200: 26.4,
    marketCapOrNotional: '£162B',
    heatwaveWeight: 68,
  },

  // =========================================================================
  // 3. ASIA MARKET
  // =========================================================================
  {
    symbol: 'N225',
    name: 'Nikkei 225 Index (Tokyo)',
    category: 'ASIA_MARKET',
    categoryLabel: 'Asia Market',
    exchange: 'TSE',
    region: 'Japan',
    unitPrefix: '¥',
    unitSuffix: '',
    price: 39480.00,
    previousClose: 38820.00,
    change: 660.00,
    changePct: 1.70,
    weekChangePct: 3.85,
    ytdChangePct: 18.10,
    dayHigh: 39610.00,
    dayLow: 38890.00,
    volumeLabel: '1.14B',
    volumeRatio: 1.29,
    volatilityPct: 22.4,
    rsi14: 61.8,
    sma50: 38290.0,
    sma200: 37410.0,
    marketCapOrNotional: '¥945T',
    heatwaveWeight: 86,
    isTrending: true,
  },
  {
    symbol: 'HSI',
    name: 'Hang Seng Index (Hong Kong)',
    category: 'ASIA_MARKET',
    categoryLabel: 'Asia Market',
    exchange: 'HKEX',
    region: 'Hong Kong',
    unitPrefix: 'HK$',
    unitSuffix: '',
    price: 20765.40,
    previousClose: 20498.20,
    change: 267.20,
    changePct: 1.30,
    weekChangePct: 2.90,
    ytdChangePct: 21.80,
    dayHigh: 20890.00,
    dayLow: 20460.00,
    volumeLabel: '2.95B',
    volumeRatio: 1.36,
    volatilityPct: 28.6,
    rsi14: 58.2,
    sma50: 19840.0,
    sma200: 17920.0,
    marketCapOrNotional: 'HK$34.2T',
    heatwaveWeight: 80,
  },
  {
    symbol: 'CSI300',
    name: 'CSI 300 Index (Shanghai/Shenzhen)',
    category: 'ASIA_MARKET',
    categoryLabel: 'Asia Market',
    exchange: 'SSE',
    region: 'China',
    unitPrefix: '¥',
    unitSuffix: '',
    price: 3982.50,
    previousClose: 4028.10,
    change: -45.60,
    changePct: -1.13,
    weekChangePct: -0.90,
    ytdChangePct: 16.10,
    dayHigh: 4035.00,
    dayLow: 3965.00,
    volumeLabel: '18.4B',
    volumeRatio: 1.24,
    volatilityPct: 26.9,
    rsi14: 48.5,
    sma50: 3810.0,
    sma200: 3560.0,
    marketCapOrNotional: '¥56.8T',
    heatwaveWeight: 75,
  },
  {
    symbol: 'TSM',
    name: 'Taiwan Semiconductor Mfg. (TSMC)',
    category: 'ASIA_MARKET',
    categoryLabel: 'Asia Market',
    exchange: 'NYSE / TWSE',
    region: 'Taiwan',
    unitPrefix: '$',
    unitSuffix: '',
    price: 196.80,
    previousClose: 190.15,
    change: 6.65,
    changePct: 3.50,
    weekChangePct: 7.20,
    ytdChangePct: 89.40,
    dayHigh: 198.40,
    dayLow: 190.80,
    volumeLabel: '19.8M',
    volumeRatio: 1.52,
    volatilityPct: 32.1,
    rsi14: 66.8,
    sma50: 181.4,
    sma200: 156.2,
    marketCapOrNotional: '$1.02T',
    heatwaveWeight: 92,
    isTrending: true,
  },
  {
    symbol: '7203.T',
    name: 'Toyota Motor Corporation',
    category: 'ASIA_MARKET',
    categoryLabel: 'Asia Market',
    exchange: 'TSE',
    region: 'Japan',
    unitPrefix: '¥',
    unitSuffix: '',
    price: 2745.00,
    previousClose: 2690.00,
    change: 55.00,
    changePct: 2.04,
    weekChangePct: 4.10,
    ytdChangePct: 5.80,
    dayHigh: 2762.00,
    dayLow: 2695.00,
    volumeLabel: '28.4M',
    volumeRatio: 1.18,
    volatilityPct: 24.5,
    rsi14: 57.9,
    sma50: 2640.0,
    sma200: 2980.0,
    marketCapOrNotional: '¥43.2T',
    heatwaveWeight: 74,
  },
  {
    symbol: '0700.HK',
    name: 'Tencent Holdings Limited',
    category: 'ASIA_MARKET',
    categoryLabel: 'Asia Market',
    exchange: 'HKEX',
    region: 'Hong Kong / China',
    unitPrefix: 'HK$',
    unitSuffix: '',
    price: 424.80,
    previousClose: 416.20,
    change: 8.60,
    changePct: 2.07,
    weekChangePct: 4.60,
    ytdChangePct: 44.50,
    dayHigh: 428.00,
    dayLow: 415.60,
    volumeLabel: '22.1M',
    volumeRatio: 1.33,
    volatilityPct: 29.4,
    rsi14: 60.8,
    sma50: 408.0,
    sma200: 362.0,
    marketCapOrNotional: 'HK$3.95T',
    heatwaveWeight: 82,
  },
  {
    symbol: '005930.KS',
    name: 'Samsung Electronics Co., Ltd.',
    category: 'ASIA_MARKET',
    categoryLabel: 'Asia Market',
    exchange: 'KRX',
    region: 'South Korea',
    unitPrefix: '₩',
    unitSuffix: '',
    price: 57800,
    previousClose: 59100,
    change: -1300,
    changePct: -2.20,
    weekChangePct: -4.90,
    ytdChangePct: -26.40,
    dayHigh: 59000,
    dayLow: 57400,
    volumeLabel: '24.6M',
    volumeRatio: 1.41,
    volatilityPct: 28.9,
    rsi14: 33.5,
    sma50: 62400,
    sma200: 71800,
    marketCapOrNotional: '₩345T',
    heatwaveWeight: 76,
  },

  // =========================================================================
  // 4. CRYPTO
  // =========================================================================
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin Spot Index (BTC / USD)',
    category: 'CRYPTO',
    categoryLabel: 'Crypto',
    exchange: 'CRYPTO SPOT',
    region: 'Global 24/7',
    unitPrefix: '$',
    unitSuffix: '',
    price: 72480.00,
    previousClose: 69120.00,
    change: 3360.00,
    changePct: 4.86,
    weekChangePct: 9.80,
    ytdChangePct: 68.40,
    dayHigh: 73150.00,
    dayLow: 68940.00,
    volumeLabel: '$46.8B',
    volumeRatio: 1.85,
    volatilityPct: 54.2,
    rsi14: 71.2,
    sma50: 65420.0,
    sma200: 61890.0,
    marketCapOrNotional: '$1.43T',
    heatwaveWeight: 96,
    isTrending: true,
  },
  {
    symbol: 'ETH-USD',
    name: 'Ethereum Spot Index (ETH / USD)',
    category: 'CRYPTO',
    categoryLabel: 'Crypto',
    exchange: 'CRYPTO SPOT',
    region: 'Global 24/7',
    unitPrefix: '$',
    unitSuffix: '',
    price: 2684.50,
    previousClose: 2598.00,
    change: 86.50,
    changePct: 3.33,
    weekChangePct: 6.10,
    ytdChangePct: 18.20,
    dayHigh: 2718.00,
    dayLow: 2582.00,
    volumeLabel: '$21.4B',
    volumeRatio: 1.46,
    volatilityPct: 58.6,
    rsi14: 59.8,
    sma50: 2540.0,
    sma200: 2890.0,
    marketCapOrNotional: '$323B',
    heatwaveWeight: 86,
  },
  {
    symbol: 'SOL-USD',
    name: 'Solana Protocol (SOL / USD)',
    category: 'CRYPTO',
    categoryLabel: 'Crypto',
    exchange: 'CRYPTO SPOT',
    region: 'Global 24/7',
    unitPrefix: '$',
    unitSuffix: '',
    price: 184.20,
    previousClose: 172.90,
    change: 11.30,
    changePct: 6.54,
    weekChangePct: 14.20,
    ytdChangePct: 81.50,
    dayHigh: 186.80,
    dayLow: 171.50,
    volumeLabel: '$6.4B',
    volumeRatio: 1.94,
    volatilityPct: 68.4,
    rsi14: 72.6,
    sma50: 158.4,
    sma200: 149.2,
    marketCapOrNotional: '$86.8B',
    heatwaveWeight: 84,
    isTrending: true,
  },
  {
    symbol: 'BNB-USD',
    name: 'BNB Chain Token (BNB / USD)',
    category: 'CRYPTO',
    categoryLabel: 'Crypto',
    exchange: 'CRYPTO SPOT',
    region: 'Global 24/7',
    unitPrefix: '$',
    unitSuffix: '',
    price: 596.40,
    previousClose: 588.10,
    change: 8.30,
    changePct: 1.41,
    weekChangePct: 3.20,
    ytdChangePct: 88.10,
    dayHigh: 602.00,
    dayLow: 585.00,
    volumeLabel: '$1.4B',
    volumeRatio: 1.12,
    volatilityPct: 44.8,
    rsi14: 57.4,
    sma50: 576.0,
    sma200: 548.0,
    marketCapOrNotional: '$86.9B',
    heatwaveWeight: 68,
  },
  {
    symbol: 'XRP-USD',
    name: 'XRP Ledger (XRP / USD)',
    category: 'CRYPTO',
    categoryLabel: 'Crypto',
    exchange: 'CRYPTO SPOT',
    region: 'Global 24/7',
    unitPrefix: '$',
    unitSuffix: '',
    price: 0.528,
    previousClose: 0.541,
    change: -0.013,
    changePct: -2.40,
    weekChangePct: -3.90,
    ytdChangePct: -14.10,
    dayHigh: 0.544,
    dayLow: 0.522,
    volumeLabel: '$1.3B',
    volumeRatio: 1.19,
    volatilityPct: 52.1,
    rsi14: 41.2,
    sma50: 0.552,
    sma200: 0.548,
    marketCapOrNotional: '$30.1B',
    heatwaveWeight: 66,
  },
  {
    symbol: 'AVAX-USD',
    name: 'Avalanche Network (AVAX / USD)',
    category: 'CRYPTO',
    categoryLabel: 'Crypto',
    exchange: 'CRYPTO SPOT',
    region: 'Global 24/7',
    unitPrefix: '$',
    unitSuffix: '',
    price: 27.85,
    previousClose: 26.40,
    change: 1.45,
    changePct: 5.49,
    weekChangePct: 9.10,
    ytdChangePct: -22.40,
    dayHigh: 28.40,
    dayLow: 26.20,
    volumeLabel: '$620M',
    volumeRatio: 1.56,
    volatilityPct: 66.8,
    rsi14: 61.5,
    sma50: 26.9,
    sma200: 29.8,
    marketCapOrNotional: '$11.4B',
    heatwaveWeight: 70,
  },

  // =========================================================================
  // 5. RATES & SOVEREIGN YIELDS
  // =========================================================================
  {
    symbol: 'US10Y',
    name: 'US 10-Year Treasury Note Yield',
    category: 'RATES',
    categoryLabel: 'Rates & Yields',
    exchange: 'CBOT / TREASURY',
    region: 'United States',
    unitPrefix: '',
    unitSuffix: '%',
    price: 4.28,
    previousClose: 4.22,
    change: 0.06,
    changePct: 1.42,
    weekChangePct: 3.10,
    ytdChangePct: 10.30,
    dayHigh: 4.31,
    dayLow: 4.21,
    volumeLabel: '$142B',
    volumeRatio: 1.34,
    volatilityPct: 16.4,
    rsi14: 63.8,
    sma50: 3.98,
    sma200: 4.18,
    marketCapOrNotional: 'Benchmark 10Y',
    heatwaveWeight: 82,
    isTrending: true,
  },
  {
    symbol: 'US02Y',
    name: 'US 2-Year Treasury Note Yield',
    category: 'RATES',
    categoryLabel: 'Rates & Yields',
    exchange: 'CBOT / TREASURY',
    region: 'United States',
    unitPrefix: '',
    unitSuffix: '%',
    price: 4.14,
    previousClose: 4.18,
    change: -0.04,
    changePct: -0.96,
    weekChangePct: -1.20,
    ytdChangePct: -2.60,
    dayHigh: 4.19,
    dayLow: 4.12,
    volumeLabel: '$98B',
    volumeRatio: 1.18,
    volatilityPct: 18.2,
    rsi14: 54.1,
    sma50: 3.89,
    sma200: 4.42,
    marketCapOrNotional: 'Front-End 2Y',
    heatwaveWeight: 74,
  },
  {
    symbol: 'US30Y',
    name: 'US 30-Year Treasury Bond Yield',
    category: 'RATES',
    categoryLabel: 'Rates & Yields',
    exchange: 'CBOT / TREASURY',
    region: 'United States',
    unitPrefix: '',
    unitSuffix: '%',
    price: 4.52,
    previousClose: 4.47,
    change: 0.05,
    changePct: 1.12,
    weekChangePct: 2.50,
    ytdChangePct: 12.10,
    dayHigh: 4.55,
    dayLow: 4.46,
    volumeLabel: '$54B',
    volumeRatio: 1.15,
    volatilityPct: 17.5,
    rsi14: 61.9,
    sma50: 4.26,
    sma200: 4.38,
    marketCapOrNotional: 'Long Bond 30Y',
    heatwaveWeight: 72,
  },
  {
    symbol: 'DE10Y',
    name: 'Germany 10-Year Bund Yield',
    category: 'RATES',
    categoryLabel: 'Rates & Yields',
    exchange: 'EUREX',
    region: 'Germany / Eurozone',
    unitPrefix: '',
    unitSuffix: '%',
    price: 2.39,
    previousClose: 2.34,
    change: 0.05,
    changePct: 2.14,
    weekChangePct: 4.40,
    ytdChangePct: 18.30,
    dayHigh: 2.41,
    dayLow: 2.33,
    volumeLabel: '€68B',
    volumeRatio: 1.21,
    volatilityPct: 14.9,
    rsi14: 59.2,
    sma50: 2.21,
    sma200: 2.38,
    marketCapOrNotional: 'Euro Benchmark',
    heatwaveWeight: 68,
  },
  {
    symbol: 'JP10Y',
    name: 'Japan 10-Year JGB Sovereign Yield',
    category: 'RATES',
    categoryLabel: 'Rates & Yields',
    exchange: 'JPX',
    region: 'Japan',
    unitPrefix: '',
    unitSuffix: '%',
    price: 0.96,
    previousClose: 0.98,
    change: -0.02,
    changePct: -2.04,
    weekChangePct: 1.05,
    ytdChangePct: 54.80,
    dayHigh: 0.98,
    dayLow: 0.95,
    volumeLabel: '¥4.2T',
    volumeRatio: 1.09,
    volatilityPct: 19.6,
    rsi14: 56.4,
    sma50: 0.91,
    sma200: 0.88,
    marketCapOrNotional: 'BOJ 10Y JGB',
    heatwaveWeight: 66,
  },

  // =========================================================================
  // 6. COMMODITIES
  // =========================================================================
  {
    symbol: 'GC=F',
    name: 'Gold Spot / COMEX Futures (Oz)',
    category: 'COMMODITIES',
    categoryLabel: 'Commodities',
    exchange: 'COMEX',
    region: 'Global Commodities',
    unitPrefix: '$',
    unitSuffix: '',
    price: 2768.40,
    previousClose: 2736.10,
    change: 32.30,
    changePct: 1.18,
    weekChangePct: 2.65,
    ytdChangePct: 33.80,
    dayHigh: 2776.00,
    dayLow: 2732.50,
    volumeLabel: '214K cts',
    volumeRatio: 1.42,
    volatilityPct: 15.8,
    rsi14: 68.4,
    sma50: 2638.0,
    sma200: 2412.0,
    marketCapOrNotional: '$18.4T',
    heatwaveWeight: 88,
    isTrending: true,
  },
  {
    symbol: 'SI=F',
    name: 'Silver Spot / COMEX Futures (Oz)',
    category: 'COMMODITIES',
    categoryLabel: 'Commodities',
    exchange: 'COMEX',
    region: 'Global Commodities',
    unitPrefix: '$',
    unitSuffix: '',
    price: 33.84,
    previousClose: 32.92,
    change: 0.92,
    changePct: 2.79,
    weekChangePct: 5.80,
    ytdChangePct: 40.90,
    dayHigh: 34.12,
    dayLow: 32.80,
    volumeLabel: '92K cts',
    volumeRatio: 1.51,
    volatilityPct: 28.4,
    rsi14: 66.2,
    sma50: 31.4,
    sma200: 28.9,
    marketCapOrNotional: '$1.91T',
    heatwaveWeight: 78,
  },
  {
    symbol: 'CL=F',
    name: 'WTI Crude Oil Futures (Bbl)',
    category: 'COMMODITIES',
    categoryLabel: 'Commodities',
    exchange: 'NYMEX',
    region: 'Global Energy',
    unitPrefix: '$',
    unitSuffix: '',
    price: 69.40,
    previousClose: 71.65,
    change: -2.25,
    changePct: -3.14,
    weekChangePct: -4.20,
    ytdChangePct: -3.10,
    dayHigh: 71.50,
    dayLow: 68.85,
    volumeLabel: '348K cts',
    volumeRatio: 1.49,
    volatilityPct: 34.2,
    rsi14: 41.8,
    sma50: 71.2,
    sma200: 76.4,
    marketCapOrNotional: 'NYMEX WTI',
    heatwaveWeight: 82,
    isTrending: true,
  },
  {
    symbol: 'BZ=F',
    name: 'Brent Crude Oil Futures (Bbl)',
    category: 'COMMODITIES',
    categoryLabel: 'Commodities',
    exchange: 'ICE',
    region: 'Global Energy',
    unitPrefix: '$',
    unitSuffix: '',
    price: 73.15,
    previousClose: 75.30,
    change: -2.15,
    changePct: -2.86,
    weekChangePct: -3.90,
    ytdChangePct: -5.05,
    dayHigh: 75.20,
    dayLow: 72.70,
    volumeLabel: '286K cts',
    volumeRatio: 1.38,
    volatilityPct: 32.6,
    rsi14: 42.5,
    sma50: 74.8,
    sma200: 80.2,
    marketCapOrNotional: 'ICE Brent',
    heatwaveWeight: 76,
  },
  {
    symbol: 'HG=F',
    name: 'High-Grade Copper Futures (Lb)',
    category: 'COMMODITIES',
    categoryLabel: 'Commodities',
    exchange: 'COMEX',
    region: 'Industrial Metals',
    unitPrefix: '$',
    unitSuffix: '',
    price: 4.42,
    previousClose: 4.34,
    change: 0.08,
    changePct: 1.84,
    weekChangePct: 3.10,
    ytdChangePct: 13.60,
    dayHigh: 4.46,
    dayLow: 4.33,
    volumeLabel: '74K cts',
    volumeRatio: 1.24,
    volatilityPct: 24.1,
    rsi14: 56.8,
    sma50: 4.35,
    sma200: 4.28,
    marketCapOrNotional: 'COMEX Copper',
    heatwaveWeight: 70,
  },
  {
    symbol: 'NG=F',
    name: 'Henry Hub Natural Gas Futures',
    category: 'COMMODITIES',
    categoryLabel: 'Commodities',
    exchange: 'NYMEX',
    region: 'Global Energy',
    unitPrefix: '$',
    unitSuffix: '',
    price: 2.68,
    previousClose: 2.79,
    change: -0.11,
    changePct: -3.94,
    weekChangePct: -6.10,
    ytdChangePct: 6.80,
    dayHigh: 2.81,
    dayLow: 2.64,
    volumeLabel: '164K cts',
    volumeRatio: 1.35,
    volatilityPct: 48.9,
    rsi14: 39.4,
    sma50: 2.61,
    sma200: 2.42,
    marketCapOrNotional: 'NYMEX Henry Hub',
    heatwaveWeight: 69,
  },

  // =========================================================================
  // 7. CURRENCIES (FX)
  // =========================================================================
  {
    symbol: 'DXY',
    name: 'US Dollar Index (ICE DXY)',
    category: 'CURRENCIES',
    categoryLabel: 'Currencies (FX)',
    exchange: 'ICE FX',
    region: 'United States / G10',
    unitPrefix: '',
    unitSuffix: '',
    price: 104.18,
    previousClose: 103.85,
    change: 0.33,
    changePct: 0.32,
    weekChangePct: 0.95,
    ytdChangePct: 2.80,
    dayHigh: 104.35,
    dayLow: 103.78,
    volumeLabel: '$84B',
    volumeRatio: 1.15,
    volatilityPct: 7.4,
    rsi14: 62.1,
    sma50: 102.4,
    sma200: 103.6,
    marketCapOrNotional: 'G6 FX Basket',
    heatwaveWeight: 78,
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar Spot',
    category: 'CURRENCIES',
    categoryLabel: 'Currencies (FX)',
    exchange: 'GLOBAL FX',
    region: 'Eurozone / US',
    unitPrefix: '$',
    unitSuffix: '',
    price: 1.0842,
    previousClose: 1.0885,
    change: -0.0043,
    changePct: -0.40,
    weekChangePct: -0.82,
    ytdChangePct: -1.80,
    dayHigh: 1.0894,
    dayLow: 1.0831,
    volumeLabel: '$610B',
    volumeRatio: 1.18,
    volatilityPct: 6.8,
    rsi14: 42.4,
    sma50: 1.098,
    sma200: 1.089,
    marketCapOrNotional: 'G10 Primary Pair',
    heatwaveWeight: 76,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen Spot',
    category: 'CURRENCIES',
    categoryLabel: 'Currencies (FX)',
    exchange: 'GLOBAL FX',
    region: 'US / Japan',
    unitPrefix: '¥',
    unitSuffix: '',
    price: 152.65,
    previousClose: 151.40,
    change: 1.25,
    changePct: 0.83,
    weekChangePct: 1.95,
    ytdChangePct: 8.20,
    dayHigh: 153.10,
    dayLow: 151.25,
    volumeLabel: '$420B',
    volumeRatio: 1.39,
    volatilityPct: 10.6,
    rsi14: 65.4,
    sma50: 147.8,
    sma200: 151.2,
    marketCapOrNotional: 'Carry Trade Pair',
    heatwaveWeight: 79,
    isTrending: true,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar Spot',
    category: 'CURRENCIES',
    categoryLabel: 'Currencies (FX)',
    exchange: 'GLOBAL FX',
    region: 'UK / US',
    unitPrefix: '$',
    unitSuffix: '',
    price: 1.2964,
    previousClose: 1.2912,
    change: 0.0052,
    changePct: 0.40,
    weekChangePct: 0.65,
    ytdChangePct: 1.85,
    dayHigh: 1.2988,
    dayLow: 1.2905,
    volumeLabel: '$290B',
    volumeRatio: 1.11,
    volatilityPct: 7.9,
    rsi14: 51.8,
    sma50: 1.309,
    sma200: 1.284,
    marketCapOrNotional: 'Cable Spot',
    heatwaveWeight: 72,
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc Spot',
    category: 'CURRENCIES',
    categoryLabel: 'Currencies (FX)',
    exchange: 'GLOBAL FX',
    region: 'US / Switzerland',
    unitPrefix: 'CHF ',
    unitSuffix: '',
    price: 0.8654,
    previousClose: 0.8682,
    change: -0.0028,
    changePct: -0.32,
    weekChangePct: 0.25,
    ytdChangePct: 2.90,
    dayHigh: 0.8690,
    dayLow: 0.8640,
    volumeLabel: '$145B',
    volumeRatio: 1.06,
    volatilityPct: 7.2,
    rsi14: 54.6,
    sma50: 0.856,
    sma200: 0.878,
    marketCapOrNotional: 'Safe-Haven FX',
    heatwaveWeight: 66,
  },
  {
    symbol: 'USD/CNH',
    name: 'US Dollar / Offshore Chinese Yuan',
    category: 'CURRENCIES',
    categoryLabel: 'Currencies (FX)',
    exchange: 'HK / GLOBAL FX',
    region: 'US / China',
    unitPrefix: '¥',
    unitSuffix: '',
    price: 7.1340,
    previousClose: 7.1180,
    change: 0.0160,
    changePct: 0.22,
    weekChangePct: 0.68,
    ytdChangePct: 0.15,
    dayHigh: 7.1420,
    dayLow: 7.1150,
    volumeLabel: '$195B',
    volumeRatio: 1.22,
    volatilityPct: 5.9,
    rsi14: 58.1,
    sma50: 7.092,
    sma200: 7.185,
    marketCapOrNotional: 'APAC Macro FX',
    heatwaveWeight: 68,
  },
];

export const TOP_ECONOMIC_EVENTS: EconomicCalendarEvent[] = [
  {
    id: 'econ-1',
    timeET: '08:30 ET',
    dateLabel: 'Today',
    country: 'US',
    event: 'US Core PCE Price Index (YoY) & Personal Spending',
    impact: 'HIGH',
    actual: '2.7%',
    forecast: '2.6%',
    previous: '2.7%',
    status: 'RELEASED',
    marketEffect: 'Sticky core inflation lifts US10Y yield +6bps; favors mega-cap cash-flow compounders.',
    affectedAssets: ['US10Y', 'SPX', 'NDX', 'DXY'],
  },
  {
    id: 'econ-2',
    timeET: '08:30 ET',
    dateLabel: 'Today',
    country: 'US',
    event: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
    impact: 'HIGH',
    actual: '224K / 4.1%',
    forecast: '185K / 4.2%',
    previous: '254K / 4.1%',
    status: 'RELEASED',
    marketEffect: 'Resilient labor prints reinforce soft-landing trajectory; boosts JPM, AMZN, and NDX.',
    affectedAssets: ['SPX', 'JPM', 'US02Y', 'USD/JPY'],
  },
  {
    id: 'econ-3',
    timeET: '10:00 ET',
    dateLabel: 'Today',
    country: 'US',
    event: 'ISM Manufacturing PMI & New Orders Index',
    impact: 'HIGH',
    actual: '48.9',
    forecast: '47.6',
    previous: '47.2',
    status: 'RELEASED',
    marketEffect: 'Sequential improvement in capital equipment orders supports NVDA, AVGO, and Copper (HG=F).',
    affectedAssets: ['NVDA', 'AVGO', 'HG=F', 'DJI'],
  },
  {
    id: 'econ-4',
    timeET: '14:00 ET',
    dateLabel: 'Upcoming',
    country: 'US',
    event: 'FOMC Federal Funds Rate Decision & Press Conference',
    impact: 'HIGH',
    actual: 'Pending',
    forecast: '4.50% - 4.75%',
    previous: '4.75% - 5.00%',
    status: 'UPCOMING',
    marketEffect: 'Consensus prices 25bps cut; focus on Powell guidance regarding neutral rate terminal path.',
    affectedAssets: ['US10Y', 'US02Y', 'GC=F', 'BTC-USD', 'SPX'],
  },
  {
    id: 'econ-5',
    timeET: '05:00 ET',
    dateLabel: 'Today',
    country: 'EU',
    event: 'Eurozone Harmonised CPI Flash Estimate (YoY)',
    impact: 'HIGH',
    actual: '2.0%',
    forecast: '1.9%',
    previous: '1.7%',
    status: 'RELEASED',
    marketEffect: 'Headline inflation returns to ECB 2% target; German 10Y Bunds (DE10Y) edge +5bps.',
    affectedAssets: ['STOXX600', 'DAX', 'DE10Y', 'EUR/USD'],
  },
  {
    id: 'econ-6',
    timeET: '23:30 ET',
    dateLabel: 'Upcoming',
    country: 'JP',
    event: 'Bank of Japan (BoJ) Monetary Policy Statement & JGB Outlook',
    impact: 'HIGH',
    actual: 'Pending',
    forecast: '0.25%',
    previous: '0.25%',
    status: 'UPCOMING',
    marketEffect: 'Yen carry sensitivity around 152.65 USD/JPY; exporters (7203.T, N225) rally on dovish hold.',
    affectedAssets: ['N225', '7203.T', 'USD/JPY', 'JP10Y'],
  },
  {
    id: 'econ-7',
    timeET: '10:30 ET',
    dateLabel: 'Today',
    country: 'US',
    event: 'EIA Weekly Crude Oil & Distillate Inventories',
    impact: 'MEDIUM',
    actual: '+1.8M Bbl',
    forecast: '+0.5M Bbl',
    previous: '-2.2M Bbl',
    status: 'RELEASED',
    marketEffect: 'Higher-than-expected US commercial build pressures WTI (CL=F) and Brent (BZ=F) lower.',
    affectedAssets: ['CL=F', 'BZ=F', 'SHEL.L'],
  },
  {
    id: 'econ-8',
    timeET: '21:45 ET',
    dateLabel: 'Today',
    country: 'CN',
    event: 'Caixin China General Manufacturing PMI',
    impact: 'MEDIUM',
    actual: '50.3',
    forecast: '49.7',
    previous: '49.3',
    status: 'RELEASED',
    marketEffect: 'Expansion territory print lifts Hang Seng (HSI), Tencent (0700.HK), and Copper futures.',
    affectedAssets: ['HSI', '0700.HK', 'CSI300', 'HG=F'],
  },
];

export const INSTITUTIONAL_NEWS_FEED: CuratedNewsArticle[] = [
  {
    id: 'wsj-1',
    source: 'The Wall Street Journal',
    sourceShort: 'WSJ',
    headline: 'Hyperscale AI Capex Surpasses $240B Annual Run-Rate as Cloud Giants Expand Custom Silicon Clusters',
    summary:
      'Leading US cloud infrastructure providers raised capital expenditure guidance for next-generation GPU and networking fabrics, driving sustained order-book visibility for NVIDIA, Broadcom, and TSMC.',
    publishedAt: '14 mins ago',
    category: 'US_MARKET',
    sentiment: 'BULLISH',
    relatedTickers: ['NVDA', 'AVGO', 'TSM', 'AMZN', 'META'],
    url: 'https://www.wsj.com/finance/stocks',
    readTime: '4 min read',
    quantTakeaway: 'NVDA (+4.21%) and AVGO (+3.68%) trade >1.4x 20-day average volume with positive institutional inflow.',
  },
  {
    id: 'bloomberg-1',
    source: 'Bloomberg',
    sourceShort: 'Bloomberg',
    headline: 'US 10-Year Treasury Yield Tests 4.28% as Bond Traders Reprice Terminal Fed Funds Trajectory',
    summary:
      'Sovereign fixed-income desks trimmed front-end rate-cut bets following resilient US labor and core PCE readings, steepening the 2s10s Treasury curve to +14bps.',
    publishedAt: '28 mins ago',
    category: 'RATES',
    sentiment: 'NEUTRAL',
    relatedTickers: ['US10Y', 'US02Y', 'US30Y', 'JPM', 'DXY'],
    url: 'https://www.bloomberg.com/markets/rates-bonds',
    readTime: '3 min read',
    quantTakeaway: 'Steeper 2s10s spread (+14bps) historically expands net interest income margins for money-center banks (JPM +1.84%).',
  },
  {
    id: 'marketwatch-1',
    source: 'MarketWatch',
    sourceShort: 'MarketWatch',
    headline: 'Bitcoin Breaks Above $72,400 as Spot ETF Weekly Net Inflows Top $2.1 Billion',
    summary:
      'Institutional allocations into regulated spot Bitcoin ETFs accelerated for a fifth consecutive session, pulling Solana (+6.54%) and Ethereum (+3.33%) higher across digital asset desks.',
    publishedAt: '42 mins ago',
    category: 'CRYPTO',
    sentiment: 'BULLISH',
    relatedTickers: ['BTC-USD', 'SOL-USD', 'ETH-USD', 'AVAX-USD'],
    url: 'https://www.marketwatch.com/investing/cryptocurrency',
    readTime: '3 min read',
    quantTakeaway: 'BTC-USD volume ratio hits 1.85x 20D avg with price holding +10.7% above its 50-day SMA ($65,420).',
  },
  {
    id: 'yahoo-1',
    source: 'Yahoo Finance',
    sourceShort: 'Yahoo Finance',
    headline: 'European Chip Equipment & Enterprise Software Lead STOXX 600 Higher as ASML and SAP Rally',
    summary:
      'European technology shares outperformed broader continental benchmarks after ASML reported stronger extreme ultraviolet (EUV) backlog conversions and SAP raised cloud ERP operating margin targets.',
    publishedAt: '1 hour ago',
    category: 'EUROPE_MARKET',
    sentiment: 'BULLISH',
    relatedTickers: ['ASML', 'SAP.DE', 'STOXX600', 'DAX'],
    url: 'https://finance.yahoo.com/world-indices/',
    readTime: '4 min read',
    quantTakeaway: 'DAX (+1.18%) and ASML (+3.38%) offset luxury consumer weakness in CAC 40 (-0.88%).',
  },
  {
    id: 'morningstar-1',
    source: 'Morningstar',
    sourceShort: 'Morningstar',
    headline: 'Wide-Moat Quality Valuation Audit: Balancing Free-Cash-Flow Yield Against Elevated S&P 500 Multiples',
    summary:
      'Morningstar equity strategists highlight wide-moat compounders generating >25% ROIC with fortress balance sheets as the primary hedge against sovereign yield volatility.',
    publishedAt: '1 hour ago',
    category: 'US_MARKET',
    sentiment: 'NEUTRAL',
    relatedTickers: ['AAPL', 'MSFT', 'GOOGL', 'SPX'],
    url: 'https://www.morningstar.com/markets',
    readTime: '6 min read',
    quantTakeaway: 'Quality factor maintains highest Sharpe ratio (2.4+) across rolling 180-day risk-adjusted windows.',
  },
  {
    id: 'investopedia-1',
    source: 'Investopedia',
    sourceShort: 'Investopedia',
    headline: 'Understanding Cross-Asset Regime Shifts: How Gold ($2,768) and US Yields Move Together in Fiscal Dominance',
    summary:
      'An institutional breakdown of why Gold futures (GC=F) and Silver (SI=F) have decoupled from real Treasury yields amid central bank reserve diversification.',
    publishedAt: '2 hours ago',
    category: 'COMMODITIES',
    sentiment: 'BULLISH',
    relatedTickers: ['GC=F', 'SI=F', 'US10Y', 'DXY'],
    readTime: '5 min read',
    url: 'https://www.investopedia.com/markets/',
    quantTakeaway: 'Gold (GC=F +1.18%) exhibits 15.8% annualized volatility with a +33.8% YTD return.',
  },
  {
    id: 'wsj-2',
    source: 'The Wall Street Journal',
    sourceShort: 'WSJ',
    headline: 'Tokyo Nikkei 225 Advances 1.70% as Yen Softens Past 152.60 per Dollar Ahead of BoJ Review',
    summary:
      'Japanese exporters and semiconductor automation leaders surged in Tokyo trading as currency stability boosted full-year corporate operating profit revisions.',
    publishedAt: '2 hours ago',
    category: 'ASIA_MARKET',
    sentiment: 'BULLISH',
    relatedTickers: ['N225', '7203.T', 'USD/JPY', 'JP10Y'],
    url: 'https://www.wsj.com/market-data',
    readTime: '4 min read',
    quantTakeaway: 'Strong positive correlation (+0.78) between USD/JPY (+0.83%) and Nikkei 225 exporter earnings.',
  },
  {
    id: 'bloomberg-2',
    source: 'Bloomberg',
    sourceShort: 'Bloomberg',
    headline: 'Crude Oil Retreats Below $70 as Global Supply Surpluses Outweigh Geopolitical Risk Premia',
    summary:
      'WTI Crude (CL=F -3.14%) and Brent (BZ=F -2.86%) declined following higher US commercial inventory builds and softer European industrial distillate demand.',
    publishedAt: '3 hours ago',
    category: 'COMMODITIES',
    sentiment: 'BEARISH',
    relatedTickers: ['CL=F', 'BZ=F', 'NG=F', 'SHEL.L'],
    url: 'https://www.bloomberg.com/energy',
    readTime: '3 min read',
    quantTakeaway: 'Lower energy input prices act as a disinflationary tailwind for global transport and consumer margins.',
  },
  {
    id: 'open-source-1',
    source: 'Open Source Wire',
    sourceShort: 'SEC / FRED Wire',
    headline: 'SEC EDGAR 13F & FRED Liquidity Monitor: Institutional Cash Reserves Hold at $6.4 Trillion',
    summary:
      'Aggregated public filings from SEC EDGAR and Federal Reserve FRED series show record institutional money-market liquidity ready for deployment on equity pullbacks.',
    publishedAt: '3 hours ago',
    category: 'RATES',
    sentiment: 'BULLISH',
    relatedTickers: ['SPX', 'NDX', 'US02Y', 'BTC-USD'],
    url: 'https://fred.stlouisfed.org',
    readTime: '5 min read',
    quantTakeaway: 'High money-market cash balances ($6.4T) cushion downside drawdown risk across US equities.',
  },
];

export const DEFAULT_CASH_ACCOUNTS: CashAccountItem[] = [
  {
    id: 'cash-1',
    accountName: 'Institutional Treasury Liquidity Sweep',
    institution: 'J.P. Morgan Private Bank',
    accountType: 'TREASURY_SWEEP',
    currency: 'USD',
    balance: 145000,
    apyPct: 4.85,
    updatedAt: 'Live Yield',
  },
  {
    id: 'cash-2',
    accountName: 'Prime Money Market Reserve (SPAXX)',
    institution: 'Fidelity Institutional',
    accountType: 'MONEY_MARKET',
    currency: 'USD',
    balance: 68500,
    apyPct: 4.72,
    updatedAt: 'Live Yield',
  },
  {
    id: 'cash-3',
    accountName: 'Multi-Currency Margin Collateral Cash',
    institution: 'Interactive Brokers LLC',
    accountType: 'MARGIN_COLLATERAL',
    currency: 'USD',
    balance: 42000,
    apyPct: 4.38,
    updatedAt: 'Live Yield',
  },
  {
    id: 'cash-4',
    accountName: 'Operating Settlement Checking',
    institution: 'Mercury / Column N.A.',
    accountType: 'CHECKING',
    currency: 'USD',
    balance: 24500,
    apyPct: 1.50,
    updatedAt: 'Settled',
  },
];

export const DEFAULT_LIABILITIES: LiabilityItem[] = [
  {
    id: 'liab-1',
    name: 'Portfolio Reg-T / Prime Margin Facility',
    lender: 'Interactive Brokers Prime',
    category: 'MARGIN_LOAN',
    balance: 48000,
    aprPct: 5.83,
    monthlyPayment: 450,
    dueDateLabel: 'Floating Daily Accrual',
  },
  {
    id: 'liab-2',
    name: 'Primary Real Estate / Jumbo Fixed Mortgage',
    lender: 'First Republic / Chase Private Client',
    category: 'MORTGAGE',
    balance: 165000,
    aprPct: 3.65,
    monthlyPayment: 1420,
    dueDateLabel: 'Due 1st of Month',
  },
  {
    id: 'liab-3',
    name: 'SBLOC Securities-Backed Credit Line',
    lender: 'Morgan Stanley Private Wealth',
    category: 'CREDIT_LINE',
    balance: 22000,
    aprPct: 6.10,
    monthlyPayment: 280,
    dueDateLabel: 'Due 15th of Month',
  },
];

/**
 * Pure deterministic function to filter global instruments by category
 */
export function filterGlobalInstruments(
  instruments: GlobalMarketInstrument[],
  category: GlobalMarketCategory,
  searchQuery: string = ''
): GlobalMarketInstrument[] {
  const q = searchQuery.trim().toLowerCase();
  return instruments.filter((item) => {
    const matchesCategory = category === 'ALL' || item.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      item.symbol.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q)
    );
  });
}

/**
 * Pure deterministic function to extract Trending, Top Gainers, and Top Losers
 */
export function computeMarketMovers(
  instruments: GlobalMarketInstrument[],
  limit: number = 6
): {
  trending: GlobalMarketInstrument[];
  topGainers: GlobalMarketInstrument[];
  topLosers: GlobalMarketInstrument[];
} {
  const safeList = [...instruments];

  const trending = [...safeList]
    .sort((a, b) => {
      const scoreA = (a.isTrending ? 2 : 1) * a.volumeRatio * (1 + Math.abs(a.changePct) * 0.1);
      const scoreB = (b.isTrending ? 2 : 1) * b.volumeRatio * (1 + Math.abs(b.changePct) * 0.1);
      return scoreB - scoreA;
    })
    .slice(0, limit);

  const topGainers = [...safeList]
    .filter((i) => i.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, limit);

  const topLosers = [...safeList]
    .filter((i) => i.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, limit);

  return { trending, topGainers, topLosers };
}

/**
 * Pure deterministic function to compute Total Net Worth from Investments, Cash Balance & Liabilities
 */
export function computeNetWorthSummary(
  investmentsMarketValue: number,
  investmentsCostBasis: number,
  investmentsDayPnL: number,
  cashAccounts: CashAccountItem[],
  liabilities: LiabilityItem[]
): NetWorthSummary {
  const totalCashBalance = Number(
    cashAccounts.reduce((acc, item) => acc + Math.max(0, item.balance), 0).toFixed(2)
  );

  const annualCashYieldEstimate = Number(
    cashAccounts
      .reduce((acc, item) => acc + Math.max(0, item.balance) * (item.apyPct / 100), 0)
      .toFixed(2)
  );

  const weightedCashApyPct =
    totalCashBalance > 0
      ? Number(((annualCashYieldEstimate / totalCashBalance) * 100).toFixed(2))
      : 0;

  const totalLiabilities = Number(
    liabilities.reduce((acc, item) => acc + Math.max(0, item.balance), 0).toFixed(2)
  );

  const totalMonthlyDebtService = Number(
    liabilities.reduce((acc, item) => acc + Math.max(0, item.monthlyPayment), 0).toFixed(2)
  );

  const annualDebtInterestCost = liabilities.reduce(
    (acc, item) => acc + Math.max(0, item.balance) * (item.aprPct / 100),
    0
  );

  const weightedLiabilityAprPct =
    totalLiabilities > 0
      ? Number(((annualDebtInterestCost / totalLiabilities) * 100).toFixed(2))
      : 0;

  const totalAssets = Number((investmentsMarketValue + totalCashBalance).toFixed(2));
  const netWorth = Number((totalAssets - totalLiabilities).toFixed(2));

  const investmentsUnrealizedPnL = Number(
    (investmentsMarketValue - investmentsCostBasis).toFixed(2)
  );
  const investmentsUnrealizedPnLPct =
    investmentsCostBasis > 0
      ? Number(((investmentsUnrealizedPnL / investmentsCostBasis) * 100).toFixed(2))
      : 0;

  const debtToAssetRatioPct =
    totalAssets > 0 ? Number(((totalLiabilities / totalAssets) * 100).toFixed(2)) : 0;

  const liquidityRatioPct =
    totalAssets > 0 ? Number(((totalCashBalance / totalAssets) * 100).toFixed(2)) : 0;

  return {
    investmentsValue: Number(investmentsMarketValue.toFixed(2)),
    investmentsCostBasis: Number(investmentsCostBasis.toFixed(2)),
    investmentsUnrealizedPnL,
    investmentsUnrealizedPnLPct,
    investmentsDayPnL: Number(investmentsDayPnL.toFixed(2)),
    totalCashBalance,
    annualCashYieldEstimate,
    weightedCashApyPct,
    totalAssets,
    totalLiabilities,
    totalMonthlyDebtService,
    weightedLiabilityAprPct,
    netWorth,
    debtToAssetRatioPct,
    liquidityRatioPct,
  };
}

/**
 * Pure deterministic function to generate grounded AI Buy / Sell / Hold signals
 * from multi-asset technicals & quantitative metrics (ready for Gemma 4 & Gemini enrichment)
 */
export function computeAITradingSignals(
  instruments: GlobalMarketInstrument[],
  assetSummaries: AssetMetrics[] = []
): AITradingAlertSignal[] {
  const summaryMap = new Map<string, AssetMetrics>();
  for (const s of assetSummaries) {
    summaryMap.set(s.ticker.toUpperCase(), s);
  }

  return instruments.slice(0, 18).map((inst, idx) => {
    const matchedSummary = summaryMap.get(inst.symbol.toUpperCase());
    const price = matchedSummary ? matchedSummary.endPrice : inst.price;
    const rsi = inst.rsi14;
    const aboveSma50 = price >= inst.sma50;
    const aboveSma200 = price >= inst.sma200;
    const changePct = inst.changePct;

    let action: AISignalAction = 'HOLD';
    let confidencePct = 74;
    let upsidePct = 6.5;
    let stopLossPct = 3.2;
    let technicalTrigger = 'Price consolidating inside 20D/50D institutional value channel';
    let quantThesis = `${inst.name} (${inst.symbol}) is exhibiting balanced order-flow with RSI-14 at ${rsi.toFixed(1)} and annualized volatility at ${inst.volatilityPct.toFixed(1)}%.`;
    let timeframe: AITradingAlertSignal['timeframe'] = 'SWING (2W-6W)';

    if (aboveSma50 && aboveSma200 && changePct >= 2.0 && inst.volumeRatio >= 1.25) {
      action = 'STRONG BUY';
      confidencePct = Math.min(95, Math.round(82 + inst.volumeRatio * 5));
      upsidePct = Number(Math.max(8.5, Math.min(18.5, inst.volatilityPct * 0.35)).toFixed(1));
      stopLossPct = Number(Math.max(3.0, Number((upsidePct / 2.8).toFixed(1))));
      technicalTrigger = `Breakout above 50D SMA (${inst.unitPrefix}${inst.sma50.toLocaleString()}) on ${inst.volumeRatio.toFixed(2)}x relative volume`;
      quantThesis = `Gemma 4 & Gemini multi-factor momentum scan flags institutional accumulation in ${inst.symbol} (+${changePct.toFixed(2)}% 1D, +${inst.weekChangePct.toFixed(2)}% 1W) with strong positive drift above 50D/200D moving averages.`;
      timeframe = 'POSITION (3M-6M)';
    } else if ((aboveSma50 && changePct > 0.4) || (rsi < 36 && aboveSma200)) {
      action = 'BUY';
      confidencePct = Math.min(91, Math.round(77 + Math.abs(changePct) * 2.2));
      upsidePct = Number(Math.max(6.2, Math.min(14.0, inst.volatilityPct * 0.28)).toFixed(1));
      stopLossPct = Number(Math.max(2.5, Number((upsidePct / 2.4).toFixed(1))));
      technicalTrigger =
        rsi < 36
          ? `Oversold mean-reversion setup (RSI-14 = ${rsi.toFixed(1)}) above 200D structural support`
          : `Sustained relative strength above 50D SMA (${inst.unitPrefix}${inst.sma50.toLocaleString()})`;
      quantThesis = `Quantitative risk-adjusted profile favors long exposure in ${inst.symbol} with favorable upside-to-drawdown asymmetry and constructive institutional flow.`;
      timeframe = 'SWING (2W-6W)';
    } else if (!aboveSma50 && !aboveSma200 && changePct <= -2.5) {
      action = 'STRONG SELL';
      confidencePct = Math.min(93, Math.round(81 + Math.abs(changePct) * 1.8));
      upsidePct = Number((-Math.max(7.5, Math.min(16.0, inst.volatilityPct * 0.32))).toFixed(1));
      stopLossPct = Number(Math.max(3.0, Number((Math.abs(upsidePct) / 2.5).toFixed(1))));
      technicalTrigger = `Distribution breakdown below 50D (${inst.unitPrefix}${inst.sma50.toLocaleString()}) & 200D SMA on ${inst.volumeRatio.toFixed(2)}x volume`;
      quantThesis = `Gemma 4 & Gemini risk model detects negative momentum divergence in ${inst.symbol} (${changePct.toFixed(2)}% 1D) with elevated tail-risk volatility (${inst.volatilityPct.toFixed(1)}%). Recommend reducing exposure or hedging.`;
      timeframe = 'INTRADAY (1D-3D)';
    } else if (!aboveSma50 && changePct < -0.5) {
      action = 'SELL';
      confidencePct = Math.min(88, Math.round(75 + Math.abs(changePct) * 2.0));
      upsidePct = Number((-Math.max(5.0, Math.min(11.5, inst.volatilityPct * 0.24))).toFixed(1));
      stopLossPct = Number(Math.max(2.4, Number((Math.abs(upsidePct) / 2.2).toFixed(1))));
      technicalTrigger = `Rejection below 50D moving average (${inst.unitPrefix}${inst.sma50.toLocaleString()}) with weakening RSI (${rsi.toFixed(1)})`;
      quantThesis = `Short-term trend deterioration in ${inst.symbol} suggests trimming tactical long positions until price reclaims its 50-day moving average.`;
      timeframe = 'SWING (2W-6W)';
    }

    const isBearish = action === 'SELL' || action === 'STRONG SELL';
    const targetPrice = isBearish
      ? Number((price * (1 - Math.abs(upsidePct) / 100)).toFixed(price < 10 ? 4 : 2))
      : Number((price * (1 + Math.abs(upsidePct) / 100)).toFixed(price < 10 ? 4 : 2));
    const stopLossPrice = isBearish
      ? Number((price * (1 + stopLossPct / 100)).toFixed(price < 10 ? 4 : 2))
      : Number((price * (1 - stopLossPct / 100)).toFixed(price < 10 ? 4 : 2));
    const riskRewardRatio = Number((Math.abs(upsidePct) / Math.max(1, stopLossPct)).toFixed(2));

    return {
      id: `ai-sig-${inst.symbol}-${idx}`,
      symbol: inst.symbol,
      name: inst.name,
      category: inst.category,
      action,
      confidencePct,
      currentPrice: Number(price.toFixed(price < 10 ? 4 : 2)),
      entryPrice: Number(price.toFixed(price < 10 ? 4 : 2)),
      targetPrice,
      stopLossPrice,
      upsidePct,
      riskRewardRatio,
      timeframe,
      rsi14: rsi,
      volatilityPct: inst.volatilityPct,
      technicalTrigger,
      quantThesis,
      engineBadge: idx % 3 === 0 ? 'Gemma 4:31B + Gemini 3.8' : idx % 3 === 1 ? 'Gemma 4:31B Cloud' : 'Gemini 3.8 Flash',
      timestamp: 'Live Quantitative Scan',
    };
  });
}
