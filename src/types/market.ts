/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Types & Schemas
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
  dailyReturns: ReturnRecord[];
}

export interface CorrelationMatrix {
  tickers: string[];
  matrix: number[][];
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  provider: string;
  isConnected: boolean;
  isChecking: boolean;
  isCloudSandbox?: boolean;
  modelAvailable?: boolean;
  modelsFound?: string[];
  lastChecked?: string;
  message?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mathematicalContext?: Record<string, string | number>;
  source?: 'ollama-gemma4-cloud' | 'simulated-preview' | 'error';
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
