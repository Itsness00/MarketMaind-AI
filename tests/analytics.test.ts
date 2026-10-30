/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — TypeScript Unit Tests for Analytics Engine
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSMA, computeAssetMetrics, computeCorrelationMatrix } from '../src/utils/analytics.ts';
import { MarketDataPoint } from '../src/types/market.ts';

describe('Financial Analytics Calculations', () => {
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
});
