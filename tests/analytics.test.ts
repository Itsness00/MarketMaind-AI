/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — TypeScript Unit Tests for Analytics, Market Hours & Universal Stock Engine
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateSMA,
  computeAssetMetrics,
  computeCorrelationMatrix,
  evaluatePriceAlerts,
  appendMarketSessionTick,
  getMarketSessionStatus,
  getGlobalMarketsStatus,
  computePortfolioMetrics,
} from '../src/utils/analytics.ts';
import {
  searchMarketStocks,
  generateSeriesForAnyTicker,
  getOrCreateStockInfo,
} from '../src/data/demonstrationData.ts';
import { MarketDataPoint, PriceAlert } from '../src/types/market.ts';

describe('Financial Analytics, Live Market Hours & Universal Stock Coverage', () => {
  it('calculates simple moving average correctly', () => {
    const prices = [10, 20, 30, 40, 50];
    const sma3 = calculateSMA(prices, 3);
    assert.strictEqual(sma3[0], null);
    assert.strictEqual(sma3[1], null);
    assert.strictEqual(sma3[2], 20); // (10+20+30)/3
    assert.strictEqual(sma3[3], 30); // (20+30+40)/3
    assert.strictEqual(sma3[4], 40); // (30+40+50)/3
  });

  it('computes asset metrics, returns, and max drawdown deterministically', () => {
    const sampleData: MarketDataPoint[] = [
      { date: '2026-01-01', ticker: 'TEST', close: 100 },
      { date: '2026-01-02', ticker: 'TEST', close: 120 },
      { date: '2026-01-03', ticker: 'TEST', close: 90 }, // Peak was 120, down to 90 -> -25% DD
      { date: '2026-01-04', ticker: 'TEST', close: 110 },
    ];

    const metrics = computeAssetMetrics(sampleData);
    assert.strictEqual(metrics.ticker, 'TEST');
    assert.strictEqual(metrics.startPrice, 100);
    assert.strictEqual(metrics.endPrice, 110);
    assert.strictEqual(metrics.totalReturnPct, 10); // (110-100)/100 * 100
    assert.strictEqual(metrics.maxDrawdownPct, -25); // (90 - 120)/120 * 100
    assert.ok(Math.abs(metrics.bestDay.returnPct - 22.222) < 0.01); // (110 - 90) / 90 * 100 = 22.22%
    assert.strictEqual(metrics.worstDay.returnPct, -25); // (90-120)/120 * 100
    assert.ok(metrics.annualizedVolatility > 0);
  });

  it('computes correlation matrix between two assets', () => {
    const assetA: MarketDataPoint[] = [
      { date: '2026-01-01', ticker: 'A', close: 100 },
      { date: '2026-01-02', ticker: 'A', close: 110 },
      { date: '2026-01-03', ticker: 'A', close: 120 },
    ];
    const assetB: MarketDataPoint[] = [
      { date: '2026-01-01', ticker: 'B', close: 50 },
      { date: '2026-01-02', ticker: 'B', close: 55 },
      { date: '2026-01-03', ticker: 'B', close: 60 },
    ];

    const matrix = computeCorrelationMatrix({ A: assetA, B: assetB });
    assert.strictEqual(matrix.tickers.length, 2);
    assert.strictEqual(matrix.matrix[0][0], 1.0);
    assert.strictEqual(matrix.matrix[1][1], 1.0);
    assert.ok(Math.abs(matrix.matrix[0][1] - 1.0) < 0.0001); // Perfect correlation
  });

  it('evaluates price alerts and triggers visual notifications when threshold is crossed', () => {
    const alerts: PriceAlert[] = [
      {
        id: 'a1',
        ticker: 'NVDA',
        condition: 'above',
        thresholdPrice: 510,
        initialPriceAtCreation: 500,
        createdAt: '10:00:00',
        triggered: false,
      },
      {
        id: 'a2',
        ticker: 'AAPL',
        condition: 'below',
        thresholdPrice: 180,
        initialPriceAtCreation: 190,
        createdAt: '10:00:00',
        triggered: false,
      },
    ];

    // Step 1: Prices do not cross thresholds yet
    const res1 = evaluatePriceAlerts(alerts, { NVDA: 505, AAPL: 185 }, { NVDA: 500, AAPL: 190 });
    assert.strictEqual(res1.newNotifications.length, 0);
    assert.strictEqual(res1.updatedAlerts[0].triggered, false);

    // Step 2: NVDA crosses above 510 and AAPL crosses below 180
    const res2 = evaluatePriceAlerts(alerts, { NVDA: 515, AAPL: 178 }, { NVDA: 505, AAPL: 185 });
    assert.strictEqual(res2.newNotifications.length, 2);
    assert.strictEqual(res2.updatedAlerts[0].triggered, true);
    assert.strictEqual(res2.updatedAlerts[0].triggeredPrice, 515);
    assert.strictEqual(res2.updatedAlerts[1].triggered, true);
    assert.strictEqual(res2.updatedAlerts[1].triggeredPrice, 178);

    // Step 3: Appending market session tick updates dataset length and price
    const nextDataset = appendMarketSessionTick(
      { NVDA: [{ date: '2026-10-30', ticker: 'NVDA', close: 500, volume: 20000000 }] },
      'NVDA',
      3.0,
      2.5
    );
    assert.strictEqual(nextDataset.NVDA.length, 2);
    assert.strictEqual(nextDataset.NVDA[1].close, 515);
    assert.strictEqual(nextDataset.NVDA[1].volume, 50000000);
  });

  it('evaluates volume-based alerts and triggers notifications on sudden trading volume spikes', () => {
    const volumeAlerts: PriceAlert[] = [
      {
        id: 'vol_1',
        ticker: 'NVDA',
        metricType: 'volume',
        condition: 'above',
        thresholdPrice: 40000000, // 40M shares spike threshold
        initialPriceAtCreation: 25000000,
        createdAt: '10:30:00',
        triggered: false,
        note: 'Sudden institutional volume spike',
      },
    ];

    const check1 = evaluatePriceAlerts(
      volumeAlerts,
      { NVDA: 505 },
      { NVDA: 500 },
      '10:31:00',
      { NVDA: 28000000 },
      { NVDA: 25000000 }
    );
    assert.strictEqual(check1.newNotifications.length, 0);
    assert.strictEqual(check1.updatedAlerts[0].triggered, false);

    const check2 = evaluatePriceAlerts(
      volumeAlerts,
      { NVDA: 512 },
      { NVDA: 505 },
      '10:32:00',
      { NVDA: 48000000 },
      { NVDA: 28000000 }
    );
    assert.strictEqual(check2.newNotifications.length, 1);
    assert.strictEqual(check2.newNotifications[0].metricType, 'volume');
    assert.strictEqual(check2.newNotifications[0].currentPrice, 48000000);
    assert.strictEqual(check2.updatedAlerts[0].triggered, true);
    assert.strictEqual(check2.updatedAlerts[0].triggeredPrice, 48000000);
  });

  it('detects NYSE / NASDAQ live market open, pre-market, after-hours, and weekend closed sessions', () => {
    // Wednesday Oct 28, 2026 at 14:30 UTC = 10:30 AM EDT (Regular Market Open)
    const openTime = new Date('2026-10-28T14:30:00Z');
    const openStatus = getMarketSessionStatus(openTime);
    assert.strictEqual(openStatus.isOpen, true);
    assert.strictEqual(openStatus.session, 'REGULAR');

    // Wednesday Oct 28, 2026 at 12:00 UTC = 08:00 AM EDT (Pre-Market)
    const preMarketTime = new Date('2026-10-28T12:00:00Z');
    const preStatus = getMarketSessionStatus(preMarketTime);
    assert.strictEqual(preStatus.isOpen, false);
    assert.strictEqual(preStatus.session, 'PRE_MARKET');

    // Saturday Oct 31, 2026 at 15:00 UTC (Weekend Closed)
    const weekendTime = new Date('2026-10-31T15:00:00Z');
    const closedStatus = getMarketSessionStatus(weekendTime);
    assert.strictEqual(closedStatus.isOpen, false);
    assert.strictEqual(closedStatus.session, 'CLOSED');
  });

  it('supports searching and generating 252-day historical series for any US or International stock', () => {
    // Preset directory stock (e.g. AMD)
    const amdResults = searchMarketStocks('AMD');
    assert.ok(amdResults.some((s) => s.ticker === 'AMD'));

    // International stocks across TSE Tokyo, LSE London, XETRA Frankfurt, HKEX Hong Kong
    const toyotaResults = searchMarketStocks('7203.T');
    assert.ok(toyotaResults.some((s) => s.ticker === '7203.T' && s.exchange === 'TSE'));

    const londonCustom = getOrCreateStockInfo('BARC.L');
    assert.strictEqual(londonCustom.exchange, 'LSE');
    assert.strictEqual(londonCustom.region, 'Europe');
    assert.strictEqual(londonCustom.currency, 'GBP');

    // Global exchanges status clock check (12 major world exchanges)
    const globalStatuses = getGlobalMarketsStatus(new Date('2026-10-28T10:00:00Z'));
    assert.strictEqual(globalStatuses.length, 12);
    const lse = globalStatuses.find((g) => g.exchange === 'LSE');
    assert.ok(lse && lse.isOpen === true);

    const series = generateSeriesForAnyTicker('7203.T');
    assert.strictEqual(series.length, 252);
    assert.strictEqual(series[0].ticker, '7203.T');
    assert.ok(series[251].close > 0);
  });

  it('computes real-time portfolio holdings, market value, cost basis, and unrealized gains/losses', () => {
    const nvdaMetric = computeAssetMetrics([
      { date: '2026-01-01', ticker: 'NVDA', close: 100 },
      { date: '2026-01-02', ticker: 'NVDA', close: 150 },
    ]);
    const aaplMetric = computeAssetMetrics([
      { date: '2026-01-01', ticker: 'AAPL', close: 200 },
      { date: '2026-01-02', ticker: 'AAPL', close: 180 },
    ]);

    const summary = computePortfolioMetrics(
      [
        { ticker: 'NVDA', shares: 10, avgCostPerShare: 100 }, // Cost: $1,000, Value: $1,500 -> +$500 (+50%)
        { ticker: 'AAPL', shares: 5, avgCostPerShare: 200 },  // Cost: $1,000, Value: $900  -> -$100 (-10%)
      ],
      [nvdaMetric, aaplMetric]
    );

    assert.strictEqual(summary.totalCostBasis, 2000);
    assert.strictEqual(summary.totalMarketValue, 2400);
    assert.strictEqual(summary.totalUnrealizedPnL, 400);
    assert.strictEqual(summary.totalUnrealizedPnLPct, 20);
    assert.strictEqual(summary.activePositionsCount, 2);
    assert.strictEqual(summary.totalSharesCount, 15);
    assert.strictEqual(summary.positions[0].unrealizedPnL, 500);
    assert.strictEqual(summary.positions[0].allocationWeightPct, 62.5);
    assert.strictEqual(summary.positions[1].unrealizedPnL, -100);
    assert.strictEqual(summary.positions[1].allocationWeightPct, 37.5);
  });
});


