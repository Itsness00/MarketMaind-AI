/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Mathematical Analytics & Market Hours Engine
 * Pure TypeScript mathematical implementation for financial indicators and NYSE/NASDAQ market session tracking.
 */

import type {
  MarketDataPoint,
  AssetMetrics,
  ReturnRecord,
  CorrelationMatrix,
  PriceAlert,
  AlertNotification,
  MarketSessionStatus,
  GlobalMarketExchangeStatus,
  MarketRegion,
  PortfolioHolding,
  PortfolioPositionMetrics,
  PortfolioSummaryMetrics,
} from '../types/market.ts';

/**
 * Determines real-time US Equity Market (NYSE / NASDAQ) session status in US Eastern Time (America/New_York).
 * Regular Trading Hours: Monday - Friday, 09:30 AM - 04:00 PM ET
 * Pre-Market Hours:      Monday - Friday, 04:00 AM - 09:30 AM ET
 * After-Hours Session:   Monday - Friday, 04:00 PM - 08:00 PM ET
 */
export function getMarketSessionStatus(referenceDate: Date = new Date()): MarketSessionStatus {
  // Format date parts in America/New_York timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(referenceDate);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const weekday = partMap.weekday || 'Mon';
  const hour = parseInt(partMap.hour || '12', 10) % 24;
  const minute = parseInt(partMap.minute || '0', 10);
  const second = parseInt(partMap.second || '0', 10);
  const month = partMap.month || '01';
  const day = partMap.day || '01';

  const totalMinutes = hour * 60 + minute;
  const easternTimeStr = `${hour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}:${second.toString().padStart(2, '0')} ET`;

  // Fixed major US market holidays check (MM-DD)
  const mmdd = `${month}-${day}`;
  const fixedHolidays = new Set(['01-01', '06-19', '07-04', '12-25']);
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
  const isHoliday = fixedHolidays.has(mmdd);

  if (isWeekend || isHoliday) {
    return {
      isOpen: false,
      isExtendedHours: false,
      session: 'CLOSED',
      label: 'MARKET CLOSED',
      easternTime: easternTimeStr,
      exchange: 'NYSE · NASDAQ',
      nextTransition: 'Opens Mon 09:30 ET',
    };
  }

  // Regular Market Hours: 09:30 (570 mins) to 16:00 (960 mins) ET
  if (totalMinutes >= 570 && totalMinutes < 960) {
    const minsRemaining = 960 - totalMinutes;
    const hrs = Math.floor(minsRemaining / 60);
    const mins = minsRemaining % 60;
    return {
      isOpen: true,
      isExtendedHours: false,
      session: 'REGULAR',
      label: 'MARKET OPEN — LIVE',
      easternTime: easternTimeStr,
      exchange: 'NYSE · NASDAQ',
      nextTransition: `Closes in ${hrs}h ${mins}m (16:00 ET)`,
    };
  }

  // Pre-Market Hours: 04:00 (240 mins) to 09:30 (570 mins) ET
  if (totalMinutes >= 240 && totalMinutes < 570) {
    const minsToOpen = 570 - totalMinutes;
    const hrs = Math.floor(minsToOpen / 60);
    const mins = minsToOpen % 60;
    return {
      isOpen: false,
      isExtendedHours: true,
      session: 'PRE_MARKET',
      label: 'PRE-MARKET',
      easternTime: easternTimeStr,
      exchange: 'NYSE · NASDAQ',
      nextTransition: `Regular Open in ${hrs}h ${mins}m (09:30 ET)`,
    };
  }

  // After-Hours Session: 16:00 (960 mins) to 20:00 (1200 mins) ET
  if (totalMinutes >= 960 && totalMinutes < 1200) {
    return {
      isOpen: false,
      isExtendedHours: true,
      session: 'AFTER_HOURS',
      label: 'AFTER-HOURS',
      easternTime: easternTimeStr,
      exchange: 'NYSE · NASDAQ',
      nextTransition: 'Extended Session Ends 20:00 ET',
    };
  }

  return {
    isOpen: false,
    isExtendedHours: false,
    session: 'CLOSED',
    label: 'MARKET CLOSED',
    easternTime: easternTimeStr,
    exchange: 'NYSE · NASDAQ',
    nextTransition: 'Pre-Market Opens 04:00 ET',
  };
}

/**
 * Computes real-time market session status and local exchange clocks across major US & International Stock Exchanges:
 * North America: NYSE/NASDAQ (New York), TSX (Toronto), B3 (São Paulo)
 * Europe: LSE (London), Euronext (Paris/Amsterdam), XETRA (Frankfurt), SIX (Zurich)
 * Asia-Pacific: TSE (Tokyo), HKEX (Hong Kong), SSE (Shanghai), KRX (Seoul), NSE (Mumbai), ASX (Sydney)
 */
export function getGlobalMarketsStatus(
  referenceDate: Date = new Date()
): GlobalMarketExchangeStatus[] {
  const exchanges: Array<{
    id: string;
    exchange: string;
    name: string;
    city: string;
    country: string;
    region: MarketRegion;
    timezone: string;
    currency: string;
    openMin: number;
    closeMin: number;
    lunchStartMin?: number;
    lunchEndMin?: number;
    tradingHoursLocal: string;
  }> = [
    {
      id: 'us-nyse-nasdaq',
      exchange: 'NYSE · NASDAQ',
      name: 'New York Stock Exchange & Nasdaq',
      city: 'New York',
      country: 'United States',
      region: 'US (NYSE & NASDAQ)',
      timezone: 'America/New_York',
      currency: 'USD',
      openMin: 9 * 60 + 30,
      closeMin: 16 * 60,
      tradingHoursLocal: '09:30–16:00 ET',
    },
    {
      id: 'uk-lse',
      exchange: 'LSE',
      name: 'London Stock Exchange',
      city: 'London',
      country: 'United Kingdom',
      region: 'Europe',
      timezone: 'Europe/London',
      currency: 'GBP',
      openMin: 8 * 60,
      closeMin: 16 * 60 + 30,
      tradingHoursLocal: '08:00–16:30 GMT/BST',
    },
    {
      id: 'eu-euronext',
      exchange: 'EURONEXT',
      name: 'Euronext Paris · Amsterdam',
      city: 'Paris',
      country: 'European Union',
      region: 'Europe',
      timezone: 'Europe/Paris',
      currency: 'EUR',
      openMin: 9 * 60,
      closeMin: 17 * 60 + 30,
      tradingHoursLocal: '09:00–17:30 CET',
    },
    {
      id: 'de-xetra',
      exchange: 'XETRA',
      name: 'Deutsche Börse XETRA',
      city: 'Frankfurt',
      country: 'Germany',
      region: 'Europe',
      timezone: 'Europe/Berlin',
      currency: 'EUR',
      openMin: 9 * 60,
      closeMin: 17 * 60 + 30,
      tradingHoursLocal: '09:00–17:30 CET',
    },
    {
      id: 'ch-six',
      exchange: 'SIX',
      name: 'SIX Swiss Exchange',
      city: 'Zurich',
      country: 'Switzerland',
      region: 'Europe',
      timezone: 'Europe/Zurich',
      currency: 'CHF',
      openMin: 9 * 60,
      closeMin: 17 * 60 + 30,
      tradingHoursLocal: '09:00–17:30 CET',
    },
    {
      id: 'jp-tse',
      exchange: 'TSE',
      name: 'Tokyo Stock Exchange',
      city: 'Tokyo',
      country: 'Japan',
      region: 'Asia-Pacific',
      timezone: 'Asia/Tokyo',
      currency: 'JPY',
      openMin: 9 * 60,
      closeMin: 15 * 60 + 30,
      lunchStartMin: 11 * 60 + 30,
      lunchEndMin: 12 * 60 + 30,
      tradingHoursLocal: '09:00–15:30 JST',
    },
    {
      id: 'hk-hkex',
      exchange: 'HKEX',
      name: 'Hong Kong Stock Exchange',
      city: 'Hong Kong',
      country: 'Hong Kong',
      region: 'Asia-Pacific',
      timezone: 'Asia/Hong_Kong',
      currency: 'HKD',
      openMin: 9 * 60 + 30,
      closeMin: 16 * 60,
      lunchStartMin: 12 * 60,
      lunchEndMin: 13 * 60,
      tradingHoursLocal: '09:30–16:00 HKT',
    },
    {
      id: 'cn-sse',
      exchange: 'SSE',
      name: 'Shanghai Stock Exchange',
      city: 'Shanghai',
      country: 'China',
      region: 'Asia-Pacific',
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      openMin: 9 * 60 + 30,
      closeMin: 15 * 60,
      lunchStartMin: 11 * 60 + 30,
      lunchEndMin: 13 * 60,
      tradingHoursLocal: '09:30–15:00 CST',
    },
    {
      id: 'in-nse',
      exchange: 'NSE',
      name: 'National Stock Exchange of India',
      city: 'Mumbai',
      country: 'India',
      region: 'Asia-Pacific',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      openMin: 9 * 60 + 15,
      closeMin: 15 * 60 + 30,
      tradingHoursLocal: '09:15–15:30 IST',
    },
    {
      id: 'au-asx',
      exchange: 'ASX',
      name: 'Australian Securities Exchange',
      city: 'Sydney',
      country: 'Australia',
      region: 'Asia-Pacific',
      timezone: 'Australia/Sydney',
      currency: 'AUD',
      openMin: 10 * 60,
      closeMin: 16 * 60,
      tradingHoursLocal: '10:00–16:00 AEST',
    },
    {
      id: 'ca-tsx',
      exchange: 'TSX',
      name: 'Toronto Stock Exchange',
      city: 'Toronto',
      country: 'Canada',
      region: 'Americas & Global',
      timezone: 'America/Toronto',
      currency: 'CAD',
      openMin: 9 * 60 + 30,
      closeMin: 16 * 60,
      tradingHoursLocal: '09:30–16:00 ET',
    },
    {
      id: 'br-b3',
      exchange: 'B3',
      name: 'B3 — Brasil Bolsa Balcão',
      city: 'São Paulo',
      country: 'Brazil',
      region: 'Americas & Global',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      openMin: 10 * 60,
      closeMin: 17 * 60,
      tradingHoursLocal: '10:00–17:00 BRT',
    },
  ];

  return exchanges.map((ex) => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: ex.timezone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(referenceDate);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const weekday = map.weekday || 'Mon';
    const hour = parseInt(map.hour || '12', 10) % 24;
    const minute = parseInt(map.minute || '0', 10);
    const totalMins = hour * 60 + minute;
    const localTime = `${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;

    const isWeekend = weekday === 'Sat' || weekday === 'Sun';
    const inTradingWindow = !isWeekend && totalMins >= ex.openMin && totalMins < ex.closeMin;
    const inLunchBreak =
      inTradingWindow &&
      typeof ex.lunchStartMin === 'number' &&
      typeof ex.lunchEndMin === 'number' &&
      totalMins >= ex.lunchStartMin &&
      totalMins < ex.lunchEndMin;

    const isOpen = inTradingWindow && !inLunchBreak;
    const sessionLabel: 'OPEN' | 'CLOSED' | 'LUNCH BREAK' = isOpen
      ? 'OPEN'
      : inLunchBreak
      ? 'LUNCH BREAK'
      : 'CLOSED';

    return {
      id: ex.id,
      exchange: ex.exchange,
      name: ex.name,
      city: ex.city,
      country: ex.country,
      region: ex.region,
      timezone: ex.timezone,
      currency: ex.currency,
      isOpen,
      sessionLabel,
      localTime,
      tradingHoursLocal: ex.tradingHoursLocal,
    };
  });
}

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
  riskFreeRate: number = 0.045, // 4.5% benchmark treasury yield
  tickerSectorMap?: Record<string, string>
): AssetMetrics {
  if (!dataPoints || dataPoints.length === 0) {
    throw new Error('No data provided to compute metrics');
  }

  // Ensure chronological order
  const sorted = [...dataPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const ticker = sorted[0].ticker;
  const name = (tickerNameMap && tickerNameMap[ticker]) || `${ticker} Corp.`;
  const sector = (tickerSectorMap && tickerSectorMap[ticker]) || 'Public Equity';
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

  // Volume Metrics
  const currentVolume = sorted[sorted.length - 1].volume ?? 0;
  const recent20Volumes = sorted.slice(-20).map((p) => p.volume ?? 0);
  const averageVolume20 =
    recent20Volumes.length > 0
      ? Math.round(recent20Volumes.reduce((sum, v) => sum + v, 0) / recent20Volumes.length)
      : currentVolume;

  return {
    ticker,
    name,
    sector,
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
    currentVolume,
    averageVolume20,
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

/**
 * Evaluates all armed price and volume alerts against updated market data.
 * Monitors both price threshold crossings and sudden spikes/drops in trading volume.
 */
export function evaluatePriceAlerts(
  alerts: PriceAlert[],
  latestPricesByTicker: Record<string, number>,
  previousPricesByTicker: Record<string, number> = {},
  timestampStr: string = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  latestVolumesByTicker: Record<string, number> = {},
  previousVolumesByTicker: Record<string, number> = {}
): {
  updatedAlerts: PriceAlert[];
  newNotifications: AlertNotification[];
} {
  const newNotifications: AlertNotification[] = [];

  const updatedAlerts = alerts.map((alert) => {
    if (alert.triggered) {
      return alert;
    }

    const metricType: 'price' | 'volume' = alert.metricType === 'volume' ? 'volume' : 'price';
    const currentVal =
      metricType === 'volume'
        ? latestVolumesByTicker[alert.ticker]
        : latestPricesByTicker[alert.ticker];

    if (typeof currentVal !== 'number' || isNaN(currentVal)) {
      return alert;
    }

    const prevMap = metricType === 'volume' ? previousVolumesByTicker : previousPricesByTicker;
    const prevVal =
      typeof prevMap[alert.ticker] === 'number'
        ? prevMap[alert.ticker]
        : alert.initialPriceAtCreation;

    const crossedAbove =
      alert.condition === 'above' && currentVal >= alert.thresholdPrice;
    const crossedBelow =
      alert.condition === 'below' && currentVal <= alert.thresholdPrice;

    if (crossedAbove || crossedBelow) {
      const notif: AlertNotification = {
        id: `notif_${alert.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        alertId: alert.id,
        ticker: alert.ticker,
        metricType,
        condition: alert.condition,
        thresholdPrice: alert.thresholdPrice,
        previousPrice: prevVal,
        currentPrice: currentVal,
        timestamp: timestampStr,
        note: alert.note,
      };
      newNotifications.push(notif);

      return {
        ...alert,
        triggered: true,
        triggeredAt: timestampStr,
        triggeredPrice: currentVal,
      };
    }

    return alert;
  });

  return { updatedAlerts, newNotifications };
}

/**
 * Appends a new market session tick to datasets so market prices and trading volumes update dynamically
 */
export function appendMarketSessionTick(
  datasets: Record<string, MarketDataPoint[]>,
  targetTicker?: string,
  forcedShockPct?: number,
  forcedVolumeMultiplier?: number
): Record<string, MarketDataPoint[]> {
  const updated: Record<string, MarketDataPoint[]> = {};

  for (const ticker of Object.keys(datasets)) {
    const series = datasets[ticker];
    if (!series || series.length === 0) {
      updated[ticker] = [];
      continue;
    }

    const lastPt = series[series.length - 1];
    const lastDate = new Date(lastPt.date);
    // Advance by 1 day (skipping weekends)
    lastDate.setDate(lastDate.getDate() + 1);
    if (lastDate.getDay() === 6) lastDate.setDate(lastDate.getDate() + 2);
    if (lastDate.getDay() === 0) lastDate.setDate(lastDate.getDate() + 1);
    const nextDateStr = lastDate.toISOString().split('T')[0];

    const isTarget = !targetTicker || ticker === targetTicker;

    let pctChange: number;
    if (isTarget && typeof forcedShockPct === 'number') {
      pctChange = forcedShockPct / 100;
    } else {
      // Realistic market tick movement (-2.2% to +2.4%)
      pctChange = (Math.random() - 0.48) * 0.045;
    }

    const prevClose = lastPt.close;
    const newClose = Number(Math.max(1, prevClose * (1 + pctChange)).toFixed(2));
    const open = prevClose;
    const high = Number((Math.max(open, newClose) * (1 + Math.random() * 0.008)).toFixed(2));
    const low = Number((Math.min(open, newClose) * (1 - Math.random() * 0.008)).toFixed(2));

    // Calculate recent 20-day average volume for realistic baseline or sudden volume spike
    const recent20 = series.slice(-20);
    const avgVol =
      recent20.length > 0
        ? recent20.reduce((sum, p) => sum + (p.volume || 25000000), 0) / recent20.length
        : lastPt.volume || 25000000;

    let volume: number;
    if (isTarget && typeof forcedVolumeMultiplier === 'number') {
      volume = Math.round(avgVol * forcedVolumeMultiplier);
    } else {
      // Occasional organic volume surge (15% chance of 1.6x-2.4x spike, otherwise 0.85x-1.35x)
      const isOrganicSpike = Math.random() < 0.15;
      const mult = isOrganicSpike ? 1.6 + Math.random() * 0.8 : 0.85 + Math.random() * 0.5;
      volume = Math.round(avgVol * mult);
    }

    updated[ticker] = [
      ...series,
      {
        date: nextDateStr,
        ticker,
        open,
        high,
        low,
        close: newClose,
        volume,
      },
    ];
  }

  return updated;
}

/**
 * Computes real-time portfolio valuation, cost basis, unrealized gains/losses ($ and %),
 * session P&L, and allocation weights across all watchlist stocks and user share holdings.
 */
export function computePortfolioMetrics(
  holdings: PortfolioHolding[],
  assetSummaries: AssetMetrics[]
): PortfolioSummaryMetrics {
  const holdingsByTicker: Record<string, PortfolioHolding> = {};
  for (const h of holdings) {
    const cleanTicker = h.ticker.trim().toUpperCase();
    if (!cleanTicker) continue;
    holdingsByTicker[cleanTicker] = {
      ticker: cleanTicker,
      shares: Math.max(0, Number(h.shares) || 0),
      avgCostPerShare: Math.max(0, Number(h.avgCostPerShare) || 0),
      updatedAt: h.updatedAt,
    };
  }

  // Ensure every watchlist asset is represented (even if 0 shares owned) plus any holding not in assetSummaries
  const rawPositions: Omit<PortfolioPositionMetrics, 'allocationWeightPct'>[] = [];

  for (const asset of assetSummaries) {
    const holding = holdingsByTicker[asset.ticker];
    const shares = holding ? holding.shares : 0;
    // Default average cost to startPrice (1Y entry basis) when not explicitly set so users have a realistic reference cost basis
    const avgCostPerShare =
      holding && holding.avgCostPerShare > 0
        ? holding.avgCostPerShare
        : Number(asset.startPrice.toFixed(2));

    const currentPrice = asset.endPrice;
    const lastDailyReturn =
      asset.dailyReturns.length > 0
        ? asset.dailyReturns[asset.dailyReturns.length - 1].returnPct
        : 0;
    const previousClose =
      lastDailyReturn !== -100
        ? currentPrice / (1 + lastDailyReturn / 100)
        : currentPrice;

    const costBasisTotal = Number((shares * avgCostPerShare).toFixed(2));
    const marketValue = Number((shares * currentPrice).toFixed(2));
    const unrealizedPnL = Number((marketValue - costBasisTotal).toFixed(2));
    const unrealizedPnLPct =
      costBasisTotal > 0
        ? Number(((unrealizedPnL / costBasisTotal) * 100).toFixed(2))
        : 0;
    const dayPnL = Number((shares * (currentPrice - previousClose)).toFixed(2));

    rawPositions.push({
      ticker: asset.ticker,
      name: asset.name,
      sector: asset.sector || 'Public Equity',
      shares,
      avgCostPerShare,
      currentPrice,
      previousClose: Number(previousClose.toFixed(2)),
      dayReturnPct: Number(lastDailyReturn.toFixed(2)),
      costBasisTotal,
      marketValue,
      unrealizedPnL,
      unrealizedPnLPct,
      dayPnL,
    });
  }

  const totalMarketValue = Number(
    rawPositions.reduce((sum, p) => sum + p.marketValue, 0).toFixed(2)
  );
  const totalCostBasis = Number(
    rawPositions.reduce((sum, p) => sum + p.costBasisTotal, 0).toFixed(2)
  );
  const totalUnrealizedPnL = Number((totalMarketValue - totalCostBasis).toFixed(2));
  const totalUnrealizedPnLPct =
    totalCostBasis > 0
      ? Number(((totalUnrealizedPnL / totalCostBasis) * 100).toFixed(2))
      : 0;
  const totalDayPnL = Number(
    rawPositions.reduce((sum, p) => sum + p.dayPnL, 0).toFixed(2)
  );
  const previousTotalMarketValue = totalMarketValue - totalDayPnL;
  const totalDayPnLPct =
    previousTotalMarketValue > 0
      ? Number(((totalDayPnL / previousTotalMarketValue) * 100).toFixed(2))
      : 0;

  const activePositionsCount = rawPositions.filter((p) => p.shares > 0).length;
  const totalSharesCount = Number(
    rawPositions.reduce((sum, p) => sum + p.shares, 0).toFixed(4)
  );

  const positions: PortfolioPositionMetrics[] = rawPositions.map((p) => ({
    ...p,
    allocationWeightPct:
      totalMarketValue > 0
        ? Number(((p.marketValue / totalMarketValue) * 100).toFixed(2))
        : 0,
  }));

  return {
    totalMarketValue,
    totalCostBasis,
    totalUnrealizedPnL,
    totalUnrealizedPnLPct,
    totalDayPnL,
    totalDayPnLPct,
    activePositionsCount,
    totalSharesCount,
    positions,
  };
}

