/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Demonstration Data & CSV Parser
 * All built-in demonstration data is deterministically generated synthetic data.
 * Prominently marked: SIMULATED DATA — NOT LIVE MARKET PRICES
 */

import { MarketDataPoint } from '../types/market';

export const SIMULATION_DISCLAIMER = 'SIMULATED DATA — NOT LIVE MARKET PRICES';

export interface AssetInfo {
  ticker: string;
  name: string;
  sector: string;
  basePrice: number;
  drift: number; // annual trend
  volatility: number; // annual volatility
  description: string;
}

export const DEMO_ASSETS: AssetInfo[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Semiconductors & AI',
    basePrice: 480.0,
    drift: 0.58,
    volatility: 0.44,
    description: 'High-growth semiconductor leader powering AI accelerated computing clusters.',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Cloud & Enterprise Software',
    basePrice: 375.0,
    drift: 0.22,
    volatility: 0.21,
    description: 'Diversified technology giant with enterprise cloud, productivity, and AI software.',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Consumer Electronics & Services',
    basePrice: 185.0,
    drift: 0.16,
    volatility: 0.19,
    description: 'Global consumer ecosystem with massive free cash flow generation and hardware moat.',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Digital Advertising & Cloud',
    basePrice: 135.0,
    drift: 0.26,
    volatility: 0.25,
    description: 'Dominant search platform expanding enterprise cloud infrastructure and frontier models.',
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    sector: 'Broad Market Benchmark',
    basePrice: 460.0,
    drift: 0.14,
    volatility: 0.13,
    description: 'Benchmark ETF tracking the 500 largest US publicly traded corporations.',
  },
  {
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust',
    sector: 'Tech-Heavy Index ETF',
    basePrice: 395.0,
    drift: 0.24,
    volatility: 0.18,
    description: 'Benchmark ETF tracking the top 100 non-financial companies listed on Nasdaq.',
  },
];

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function createSeededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Standard Normal Random Variable via Box-Muller transform
 */
function randomNormal(rand: () => number): number {
  let u = 0,
    v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Generates deterministic synthetic historical trading data
 * 252 trading days over the past ~1 calendar year
 */
export function generateDeterministicDemonstrationData(): Record<string, MarketDataPoint[]> {
  const result: Record<string, MarketDataPoint[]> = {};
  const totalDays = 252;
  const dt = 1 / 252;

  // Reference calendar dates (2025-10-31 to 2026-10-30)
  const endDate = new Date('2026-10-30T12:00:00Z');
  const dates: string[] = [];

  // Generate trading day date strings skipping weekends
  let cur = new Date(endDate);
  while (dates.length < totalDays) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      dates.unshift(cur.toISOString().split('T')[0]);
    }
    cur.setDate(cur.getDate() - 1);
  }

  DEMO_ASSETS.forEach((asset, assetIdx) => {
    // Unique seed per asset ensuring repeatable, deterministic values
    const rand = createSeededRandom(1048576 + assetIdx * 7919);
    const series: MarketDataPoint[] = [];

    let currentPrice = asset.basePrice;

    for (let t = 0; t < totalDays; t++) {
      const z = randomNormal(rand);

      // Geometric Brownian Motion step
      // dS = S * (mu * dt + sigma * sqrt(dt) * Z)
      const driftTerm = (asset.drift - 0.5 * Math.pow(asset.volatility, 2)) * dt;
      const diffusionTerm = asset.volatility * Math.sqrt(dt) * z;
      const factor = Math.exp(driftTerm + diffusionTerm);

      currentPrice = Math.max(1.0, currentPrice * factor);

      // Deterministic synthetic intraday OHLCV
      const intradayVol = asset.volatility * 0.015;
      const open = Number((currentPrice * (1 + (rand() - 0.5) * intradayVol)).toFixed(2));
      const close = Number(currentPrice.toFixed(2));
      const high = Number((Math.max(open, close) * (1 + rand() * intradayVol)).toFixed(2));
      const low = Number((Math.min(open, close) * (1 - rand() * intradayVol)).toFixed(2));
      const volume = Math.floor(1000000 + rand() * 8500000);

      series.push({
        date: dates[t],
        ticker: asset.ticker,
        close,
        open,
        high,
        low,
        volume,
      });
    }

    result[asset.ticker] = series;
  });

  return result;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: MarketDataPoint[];
  tickersFound: string[];
  dateRange: { start: string; end: string } | null;
}

/**
 * Validates and parses user-uploaded CSV file content
 * Strictly enforces required columns: date, ticker, close
 */
export function parseAndValidateCSV(csvText: string): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: MarketDataPoint[] = [];
  const tickersFoundSet = new Set<string>();

  if (!csvText || csvText.trim().length === 0) {
    return {
      isValid: false,
      errors: ['The submitted CSV file is completely empty.'],
      warnings: [],
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  // Max size check: approx 50,000 lines max
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      isValid: false,
      errors: ['CSV must contain at least a header row and one valid data record.'],
      warnings: [],
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));

  const dateIdx = headers.indexOf('date');
  const tickerIdx = headers.indexOf('ticker');
  const closeIdx = headers.indexOf('close');
  const openIdx = headers.indexOf('open');
  const highIdx = headers.indexOf('high');
  const lowIdx = headers.indexOf('low');
  const volIdx = headers.indexOf('volume');

  const missingColumns: string[] = [];
  if (dateIdx === -1) missingColumns.push('date');
  if (tickerIdx === -1) missingColumns.push('ticker');
  if (closeIdx === -1) missingColumns.push('close');

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      errors: [
        `Missing mandatory CSV column(s): [${missingColumns.join(', ')}]. Header row received: "${lines[0]}". Required columns: "date", "ticker", "close".`,
      ],
      warnings: [],
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  // Duplicate key tracker: ticker + date
  const seenDateTicker = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cells = rawLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

    if (cells.length < headers.length && cells.length < 3) {
      warnings.push(`Row ${i + 1} skipped: Insufficient columns (${cells.length} found).`);
      continue;
    }

    const rawDate = cells[dateIdx];
    const rawTicker = cells[tickerIdx]?.toUpperCase();
    const rawClose = cells[closeIdx];

    // Validate date
    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${i + 1}: Invalid date format "${rawDate}". Use YYYY-MM-DD.`);
      if (errors.length >= 10) break;
      continue;
    }

    // Standardize ISO date format YYYY-MM-DD
    const isoDate = parsedDate.toISOString().split('T')[0];

    // Validate ticker
    if (!rawTicker || rawTicker.length === 0 || rawTicker.length > 12) {
      errors.push(`Row ${i + 1}: Invalid ticker symbol "${rawTicker}". Must be 1–12 characters.`);
      if (errors.length >= 10) break;
      continue;
    }

    // Validate close price
    const closeVal = parseFloat(rawClose);
    if (isNaN(closeVal) || closeVal <= 0) {
      errors.push(`Row ${i + 1}: Price close value must be a positive number. Received "${rawClose}".`);
      if (errors.length >= 10) break;
      continue;
    }

    // Check duplicate
    const uniqueKey = `${rawTicker}_${isoDate}`;
    if (seenDateTicker.has(uniqueKey)) {
      warnings.push(`Row ${i + 1}: Duplicate entry for ticker "${rawTicker}" on date "${isoDate}" was ignored.`);
      continue;
    }
    seenDateTicker.add(uniqueKey);

    tickersFoundSet.add(rawTicker);

    const point: MarketDataPoint = {
      date: isoDate,
      ticker: rawTicker,
      close: Number(closeVal.toFixed(2)),
    };

    if (openIdx !== -1 && cells[openIdx]) {
      const op = parseFloat(cells[openIdx]);
      if (!isNaN(op)) point.open = Number(op.toFixed(2));
    }
    if (highIdx !== -1 && cells[highIdx]) {
      const hi = parseFloat(cells[highIdx]);
      if (!isNaN(hi)) point.high = Number(hi.toFixed(2));
    }
    if (lowIdx !== -1 && cells[lowIdx]) {
      const lo = parseFloat(cells[lowIdx]);
      if (!isNaN(lo)) point.low = Number(lo.toFixed(2));
    }
    if (volIdx !== -1 && cells[volIdx]) {
      const vo = parseInt(cells[volIdx], 10);
      if (!isNaN(vo)) point.volume = vo;
    }

    data.push(point);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  if (data.length === 0) {
    return {
      isValid: false,
      errors: ['No valid rows could be processed from the CSV file.'],
      warnings,
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  // Sort chronological
  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const tickersFound = Array.from(tickersFoundSet);

  return {
    isValid: true,
    errors: [],
    warnings,
    data,
    tickersFound,
    dateRange: {
      start: data[0].date,
      end: data[data.length - 1].date,
    },
  };
}

/**
 * Generates sample CSV text ready for export / download
 */
export function generateSampleCSVString(): string {
  const demoData = generateDeterministicDemonstrationData();
  let csv = 'date,ticker,close,open,high,low,volume\n';

  // Export 60 days of NVDA and SPY as clear sample
  const tickers = ['NVDA', 'SPY'];
  tickers.forEach((t) => {
    const list = demoData[t]?.slice(-60) || [];
    list.forEach((p) => {
      csv += `${p.date},${p.ticker},${p.close},${p.open ?? p.close},${p.high ?? p.close},${p.low ?? p.close},${p.volume ?? 1000000}\n`;
    });
  });

  return csv;
}
