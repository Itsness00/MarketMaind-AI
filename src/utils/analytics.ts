/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Mathematical Analytics Engine
 * Pure Python/TypeScript mathematical implementation for financial indicators.
 * Critical calculations are evaluated deterministically and never hallucinated.
 */

import { MarketDataPoint, AssetMetrics, ReturnRecord, CorrelationMatrix } from '../types/market';

/**
 * Calculates Simple Moving Average for a given period
 */
export function calculateSMA(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, val) => acc + val, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Calculates standard deviation
 */
function standardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates percentile using linear interpolation
 */
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Computes complete financial metrics for a single asset's historical series
 */
export function computeAssetMetrics(
  dataPoints: MarketDataPoint[],
  tickerNameMap?: Record<string, string>,
  riskFreeRate: number = 0.045 // 4.5% benchmark treasury yield
): AssetMetrics {
  if (!dataPoints || dataPoints.length === 0) {
    throw new Error('No data provided to compute metrics');
  }

  // Ensure chronological order
  const sorted = [...dataPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const ticker = sorted[0].ticker;
  const name = (tickerNameMap && tickerNameMap[ticker]) || `${ticker} Equity`;
  const startDate = sorted[0].date;
  const endDate = sorted[sorted.length - 1].date;
  const startPrice = sorted[0].close;
  const endPrice = sorted[sorted.length - 1].close;

  // Calculate daily returns
  const dailyReturns: ReturnRecord[] = [];
  const rawReturns: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prevClose = sorted[i - 1].close;
    const currClose = sorted[i].close;
    const retPct = ((currClose - prevClose) / prevClose) * 100;
    dailyReturns.push({
      date: sorted[i].date,
      returnPct: retPct,
      price: currClose,
    });
    rawReturns.push(retPct / 100);
  }

  // Total Return (%)
  const totalReturnPct = ((endPrice - startPrice) / startPrice) * 100;

  // Annualized Return (%) (assuming 252 trading days/year)
  const tradingDays = Math.max(1, sorted.length - 1);
  const annualizedReturnPct =
    tradingDays > 0 ? (Math.pow(endPrice / startPrice, 252 / tradingDays) - 1) * 100 : totalReturnPct;

  // Historical Volatility (Annualized: std dev * sqrt(252))
  const dailyStdDev = standardDeviation(rawReturns);
  const annualizedVolatility = dailyStdDev * Math.sqrt(252) * 100;

  // Maximum Drawdown (Peak to Trough)
  let peak = sorted[0].close;
  let peakDate = sorted[0].date;
  let maxDrawdownPct = 0;
  let mddPeakDate = sorted[0].date;
  let mddTroughDate = sorted[0].date;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i].close;
    if (current > peak) {
      peak = current;
      peakDate = sorted[i].date;
    }
    const drawdown = ((current - peak) / peak) * 100;
    if (drawdown < maxDrawdownPct) {
      maxDrawdownPct = drawdown;
      mddPeakDate = peakDate;
      mddTroughDate = sorted[i].date;
    }
  }

  // Best & Worst Observed Days
  let bestDay = { date: startDate, returnPct: 0 };
  let worstDay = { date: startDate, returnPct: 0 };

  if (dailyReturns.length > 0) {
    let maxRet = dailyReturns[0].returnPct;
    let minRet = dailyReturns[0].returnPct;
    bestDay = { date: dailyReturns[0].date, returnPct: maxRet };
    worstDay = { date: dailyReturns[0].date, returnPct: minRet };

    for (const r of dailyReturns) {
      if (r.returnPct > maxRet) {
        maxRet = r.returnPct;
        bestDay = { date: r.date, returnPct: r.returnPct };
      }
      if (r.returnPct < minRet) {
        minRet = r.returnPct;
        worstDay = { date: r.date, returnPct: r.returnPct };
      }
    }
  }

  // 95% Historical Value-at-Risk (1-day)
  // Represents expected loss threshold at 95% confidence
  const var95Pct = Math.abs(calculatePercentile(rawReturns, 5) * 100);

  // Sharpe Ratio Proxy = (Annualized Return - Risk Free Rate) / Annualized Volatility
  const excessReturn = annualizedReturnPct / 100 - riskFreeRate;
  const volFraction = annualizedVolatility / 100;
  const sharpeRatio = volFraction > 0 ? excessReturn / volFraction : 0;

  // Calmar Ratio = Annualized Return / |Max Drawdown|
  const absMddFraction = Math.abs(maxDrawdownPct) / 100;
  const calmarRatio = absMddFraction > 0 ? (annualizedReturnPct / 100) / absMddFraction : 0;

  // Current Moving Averages
  const prices = sorted.map((p) => p.close);
  const sma20Series = calculateSMA(prices, 20);
  const sma50Series = calculateSMA(prices, 50);
  const sma200Series = calculateSMA(prices, 200);

  const currentSMA20 = sma20Series[sma20Series.length - 1] ?? endPrice;
  const currentSMA50 = sma50Series[sma50Series.length - 1] ?? endPrice;
  const currentSMA200 = sma200Series[sma200Series.length - 1] ?? endPrice;

  return {
    ticker,
    name,
    dataPointsCount: sorted.length,
    startDate,
    endDate,
    startPrice,
    endPrice,
    totalReturnPct,
    annualizedReturnPct,
    annualizedVolatility,
    maxDrawdownPct,
    maxDrawdownPeakDate: mddPeakDate,
    maxDrawdownTroughDate: mddTroughDate,
    bestDay,
    worstDay,
    var95Pct,
    sharpeRatio,
    calmarRatio,
    currentSMA20,
    currentSMA50,
    currentSMA200,
    dailyReturns,
  };
}

/**
 * Computes Correlation Matrix across multiple ticker series
 */
export function computeCorrelationMatrix(
  datasetsByTicker: Record<string, MarketDataPoint[]>
): CorrelationMatrix {
  const tickers = Object.keys(datasetsByTicker);
  if (tickers.length === 0) {
    return { tickers: [], matrix: [] };
  }

  // Align dates
  const returnsByTicker: Record<string, Record<string, number>> = {};
  for (const ticker of tickers) {
    returnsByTicker[ticker] = {};
    const points = [...datasetsByTicker[ticker]].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1].close;
      const curr = points[i].close;
      returnsByTicker[ticker][points[i].date] = (curr - prev) / prev;
    }
  }

  // Find intersection of common dates
  const allDates = Object.keys(returnsByTicker[tickers[0]] || {});
  const commonDates = allDates.filter((date) =>
    tickers.every((t) => returnsByTicker[t][date] !== undefined)
  );

  const matrix: number[][] = [];
  for (let i = 0; i < tickers.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < tickers.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        const x = commonDates.map((d) => returnsByTicker[tickers[i]][d]);
        const y = commonDates.map((d) => returnsByTicker[tickers[j]][d]);
        matrix[i][j] = computePearsonCorrelation(x, y);
      }
    }
  }

  return { tickers, matrix };
}

function computePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return Math.max(-1, Math.min(1, num / den));
}
