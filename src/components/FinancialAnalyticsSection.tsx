/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Section C: Financial Analytics
 * Explicit mathematical calculations, returns distribution histogram, SMAs, and ranking matrix.
 */

import React, { useMemo } from 'react';
import { AssetMetrics } from '../types/market';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Award,
  BarChart3,
  Percent,
} from 'lucide-react';

interface FinancialAnalyticsSectionProps {
  activeMetric: AssetMetrics;
  peerMetrics: AssetMetrics[];
  isHalloween: boolean;
}

export const FinancialAnalyticsSection: React.FC<FinancialAnalyticsSectionProps> = ({
  activeMetric,
  peerMetrics,
  isHalloween,
}) => {
  const allAssets = useMemo(() => {
    return [activeMetric, ...peerMetrics.filter((p) => p.ticker !== activeMetric.ticker)];
  }, [activeMetric, peerMetrics]);

  // Asset rankings sorted by different criteria
  const rankedByReturn = useMemo(() => {
    return [...allAssets].sort((a, b) => b.totalReturnPct - a.totalReturnPct);
  }, [allAssets]);

  const rankedBySharpe = useMemo(() => {
    return [...allAssets].sort((a, b) => b.sharpeRatio - a.sharpeRatio);
  }, [allAssets]);

  const rankedByVol = useMemo(() => {
    return [...allAssets].sort((a, b) => a.annualizedVolatility - b.annualizedVolatility);
  }, [allAssets]);

  // Daily Returns Distribution Histogram
  const histogramBuckets = useMemo(() => {
    const returns = activeMetric.dailyReturns.map((r) => r.returnPct);
    if (returns.length === 0) return [];

    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const bucketCount = 18;
    const step = (max - min) / bucketCount || 0.5;

    const buckets: { min: number; max: number; label: string; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const bMin = min + i * step;
      const bMax = bMin + step;
      buckets.push({
        min: bMin,
        max: bMax,
        label: `${bMin >= 0 ? '+' : ''}${bMin.toFixed(1)}%`,
        count: 0,
      });
    }

    returns.forEach((val) => {
      let placed = false;
      for (const b of buckets) {
        if (val >= b.min && val <= b.max) {
          b.count++;
          placed = true;
          break;
        }
      }
      if (!placed && buckets.length > 0) {
        buckets[buckets.length - 1].count++;
      }
    });

    return buckets;
  }, [activeMetric]);

  const maxBucketCount = Math.max(...histogramBuckets.map((b) => b.count), 1);

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity
            className={`w-5 h-5 ${
              isHalloween ? 'text-[#FF7518]' : 'text-blue-400'
            }`}
          />
          <h3 className="text-xl font-display font-bold text-white tracking-tight">
            Financial Analytics & Indicator Suite
          </h3>
        </div>
        <p className="text-xs font-mono text-white/50 mt-1">
          Deterministic mathematical metrics calculated directly from pricing series (Sample: {activeMetric.startDate} to {activeMetric.endDate})
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Return */}
        <div className="p-4 rounded-xl bg-[#161920] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-white/40 block">Total Return</span>
          <div
            className={`text-xl font-bold ${
              activeMetric.totalReturnPct >= 0 ? 'text-[#42C98B]' : 'text-[#FF5468]'
            }`}
          >
            {activeMetric.totalReturnPct >= 0 ? '+' : ''}
            {activeMetric.totalReturnPct.toFixed(2)}%
          </div>
          <span className="text-[10px] text-white/40">
            Ann: {activeMetric.annualizedReturnPct >= 0 ? '+' : ''}
            {activeMetric.annualizedReturnPct.toFixed(1)}%
          </span>
        </div>

        {/* Volatility */}
        <div className="p-4 rounded-xl bg-[#161920] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-white/40 block">Historical Vol (Ann.)</span>
          <div className="text-xl font-bold text-white">
            {activeMetric.annualizedVolatility.toFixed(2)}%
          </div>
          <span className="text-[10px] text-white/40">σ × √252</span>
        </div>

        {/* Max Drawdown */}
        <div className="p-4 rounded-xl bg-[#161920] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-white/40 block">Max Drawdown</span>
          <div className="text-xl font-bold text-[#FF5468]">
            {activeMetric.maxDrawdownPct.toFixed(2)}%
          </div>
          <span className="text-[10px] text-white/40">Peak-to-Trough</span>
        </div>

        {/* Sharpe Ratio Proxy */}
        <div className="p-4 rounded-xl bg-[#161920] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-white/40 block">Sharpe Proxy</span>
          <div className="text-xl font-bold text-white">
            {activeMetric.sharpeRatio.toFixed(2)}
          </div>
          <span className="text-[10px] text-white/40">Hurdle Rate: 4.5%</span>
        </div>

        {/* Calmar Ratio */}
        <div className="p-4 rounded-xl bg-[#161920] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-white/40 block">Calmar Ratio</span>
          <div className="text-xl font-bold text-white">
            {activeMetric.calmarRatio.toFixed(2)}
          </div>
          <span className="text-[10px] text-white/40">Ann. Return / |MDD|</span>
        </div>

        {/* 1-Day 95% VaR */}
        <div className="p-4 rounded-xl bg-[#161920] border border-white/10 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-white/40 block">95% 1-Day VaR</span>
          <div className="text-xl font-bold text-[#FF7518]">
            {activeMetric.var95Pct.toFixed(2)}%
          </div>
          <span className="text-[10px] text-white/40">Historical Percentile</span>
        </div>
      </div>

      {/* Return Distribution Histogram & Extreme Days Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Histogram */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-[#161920] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Daily Return Distribution ({activeMetric.ticker})
              </h4>
              <span className="text-xs font-mono text-white/40">
                Frequency analysis of {activeMetric.dailyReturns.length} observed sessions
              </span>
            </div>
            <div className="text-xs font-mono text-white/50">
              Mean: {(activeMetric.annualizedReturnPct / 252).toFixed(2)}% / session
            </div>
          </div>

          {/* SVG Histogram */}
          <div className="w-full h-44 flex items-end gap-1.5 pt-4 pb-2">
            {histogramBuckets.map((bucket, idx) => {
              const heightPct = (bucket.count / maxBucketCount) * 100;
              const isNegative = bucket.max <= 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-black text-[10px] font-mono text-white whitespace-nowrap z-20 pointer-events-none border border-white/10">
                    {bucket.label}: {bucket.count} days
                  </div>

                  <div
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                    className={`w-full rounded-t transition-all ${
                      isNegative
                        ? 'bg-[#FF5468]/60 group-hover:bg-[#FF5468]'
                        : 'bg-[#42C98B]/60 group-hover:bg-[#42C98B]'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-white/30 mt-1 truncate max-w-full">
                    {idx % 3 === 0 ? bucket.label : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extreme Daily Returns Box */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-[#161920] border border-white/10 space-y-4">
          <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            Extreme Observed Sessions
          </h4>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Single Best Session</span>
                <span className="text-[#42C98B] font-bold text-sm">
                  +{activeMetric.bestDay.returnPct.toFixed(2)}%
                </span>
              </div>
              <div className="text-[11px] text-white/40">
                Recorded on {activeMetric.bestDay.date}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/20 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Single Worst Session</span>
                <span className="text-[#FF5468] font-bold text-sm">
                  {activeMetric.worstDay.returnPct.toFixed(2)}%
                </span>
              </div>
              <div className="text-[11px] text-white/40">
                Recorded on {activeMetric.worstDay.date}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-[11px] text-white/60">
              <div className="flex justify-between">
                <span>Current Price vs SMA 20:</span>
                <span className="text-white font-semibold">
                  ${(activeMetric.endPrice - activeMetric.currentSMA20).toFixed(2)} (
                  {(((activeMetric.endPrice - activeMetric.currentSMA20) / activeMetric.currentSMA20) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Price vs SMA 50:</span>
                <span className="text-white font-semibold">
                  ${(activeMetric.endPrice - activeMetric.currentSMA50).toFixed(2)} (
                  {(((activeMetric.endPrice - activeMetric.currentSMA50) / activeMetric.currentSMA50) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Price vs SMA 200:</span>
                <span className="text-white font-semibold">
                  ${(activeMetric.endPrice - activeMetric.currentSMA200).toFixed(2)} (
                  {(((activeMetric.endPrice - activeMetric.currentSMA200) / activeMetric.currentSMA200) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Performance Rankings Matrix */}
      <div className="p-6 rounded-xl bg-[#161920] border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#FF7518]" />
          <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            Asset Performance Rankings Matrix
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Top Returns */}
          <div className="space-y-2">
            <span className="text-[11px] text-white/40 uppercase tracking-wider block pb-1 border-b border-white/10">
              Top Cumulative Returns
            </span>
            {rankedByReturn.map((item, idx) => (
              <div
                key={item.ticker}
                className="flex items-center justify-between p-2 rounded bg-black/30 border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[10px]">#{idx + 1}</span>
                  <span className="font-bold text-white">{item.ticker}</span>
                </div>
                <span
                  className={`font-semibold ${
                    item.totalReturnPct >= 0 ? 'text-[#42C98B]' : 'text-[#FF5468]'
                  }`}
                >
                  {item.totalReturnPct >= 0 ? '+' : ''}
                  {item.totalReturnPct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          {/* Top Sharpe */}
          <div className="space-y-2">
            <span className="text-[11px] text-white/40 uppercase tracking-wider block pb-1 border-b border-white/10">
              Top Sharpe Proxy (Efficiency)
            </span>
            {rankedBySharpe.map((item, idx) => (
              <div
                key={item.ticker}
                className="flex items-center justify-between p-2 rounded bg-black/30 border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[10px]">#{idx + 1}</span>
                  <span className="font-bold text-white">{item.ticker}</span>
                </div>
                <span className="font-semibold text-white">
                  {item.sharpeRatio.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Lowest Volatility */}
          <div className="space-y-2">
            <span className="text-[11px] text-white/40 uppercase tracking-wider block pb-1 border-b border-white/10">
              Lowest Annualized Volatility
            </span>
            {rankedByVol.map((item, idx) => (
              <div
                key={item.ticker}
                className="flex items-center justify-between p-2 rounded bg-black/30 border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[10px]">#{idx + 1}</span>
                  <span className="font-bold text-white">{item.ticker}</span>
                </div>
                <span className="font-semibold text-white">
                  {item.annualizedVolatility.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
