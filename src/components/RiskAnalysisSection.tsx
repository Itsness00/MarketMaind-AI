/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Section D: Market Risk Analysis
 * Underwater drawdown chart, multi-asset correlation matrix, portfolio stress testing, and risk disclosures.
 */

import React, { useState, useMemo } from 'react';
import { AssetMetrics, MarketDataPoint, StressScenario } from '../types/market';
import { computeCorrelationMatrix } from '../utils/analytics';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  PieChart,
  Grid,
  ChevronRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface RiskAnalysisSectionProps {
  activeMetric: AssetMetrics;
  peerMetrics: AssetMetrics[];
  allDatasets: Record<string, MarketDataPoint[]>;
  isHalloween: boolean;
}

const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'rate_shock',
    name: 'Fed Rate Shock (+100 bps)',
    description: 'Sudden hawkish repricing in benchmark Treasury yields compressing long-duration multiples.',
    marketImpactPct: -8.5,
    volatilityMultiplier: 1.45,
    recoveryMonthsEstimate: 5,
  },
  {
    id: 'tech_selloff',
    name: 'Tech Multiple Compression (-18%)',
    description: 'Valuation contraction across AI and semiconductor equities due to revised capex cycles.',
    marketImpactPct: -18.0,
    volatilityMultiplier: 1.85,
    recoveryMonthsEstimate: 8,
  },
  {
    id: 'broad_correction',
    name: 'Systemic Market Correction (-12%)',
    description: 'Broad equity pullback driven by earnings revisions and credit spread widening.',
    marketImpactPct: -12.0,
    volatilityMultiplier: 1.5,
    recoveryMonthsEstimate: 6,
  },
  {
    id: 'stagflation',
    name: 'Stagflationary Energy Spike',
    description: 'Resurgent commodities push inflation expectations higher while GDP growth slows.',
    marketImpactPct: -14.5,
    volatilityMultiplier: 1.6,
    recoveryMonthsEstimate: 10,
  },
];

export const RiskAnalysisSection: React.FC<RiskAnalysisSectionProps> = ({
  activeMetric,
  peerMetrics,
  allDatasets,
  isHalloween,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<StressScenario>(STRESS_SCENARIOS[0]);

  // Compute correlation matrix
  const correlation = useMemo(() => {
    return computeCorrelationMatrix(allDatasets);
  }, [allDatasets]);

  // Compute continuous drawdown series (Underwater chart)
  const drawdownSeries = useMemo(() => {
    const raw = allDatasets[activeMetric.ticker] || [];
    const sorted = [...raw].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let peak = -Infinity;
    return sorted.map((p) => {
      if (p.close > peak) peak = p.close;
      const dd = ((p.close - peak) / peak) * 100;
      return { date: p.date, drawdown: dd };
    });
  }, [allDatasets, activeMetric.ticker]);

  // Underwater SVG chart dimensions
  const chartW = 750;
  const chartH = 220;
  const pad = { top: 20, right: 30, bottom: 35, left: 45 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;

  const minDrawdown = Math.min(-20, activeMetric.maxDrawdownPct * 1.1);

  const getX = (idx: number) => {
    if (drawdownSeries.length <= 1) return pad.left;
    return pad.left + (idx / (drawdownSeries.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    // 0 is at top (pad.top), minDrawdown is at bottom (pad.top + plotH)
    return pad.top + (val / minDrawdown) * plotH;
  };

  const underwaterPath = useMemo(() => {
    if (drawdownSeries.length === 0) return '';
    const points = drawdownSeries
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.drawdown).toFixed(1)}`)
      .join(' ');
    // Close path to top (0% line)
    return `${points} L ${getX(drawdownSeries.length - 1)} ${pad.top} L ${pad.left} ${pad.top} Z`;
  }, [drawdownSeries, minDrawdown]);

  // Estimated asset stress impact based on historical beta/volatility
  const estimatedStressImpact = useMemo(() => {
    const volRatio = activeMetric.annualizedVolatility / 18.0; // Benchmark vol ~18%
    const estimatedLoss = selectedScenario.marketImpactPct * Math.max(0.7, volRatio);
    return Math.max(-65, Math.min(0, estimatedLoss));
  }, [activeMetric, selectedScenario]);

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert
            className={`w-5 h-5 ${
              isHalloween ? 'text-[#FF5468]' : 'text-red-400'
            }`}
          />
          <h3 className="text-xl font-display font-bold text-white tracking-tight">
            Market Risk Analysis & Stress Testing
          </h3>
        </div>
        <p className="text-xs font-mono text-white/50 mt-1">
          Historical drawdown depth, cross-asset correlation, and macroeconomic scenario stress testing
        </p>
      </div>

      {/* Underwater Drawdown Chart */}
      <div className="p-6 rounded-xl bg-[#161920] border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Underwater Drawdown Profile ({activeMetric.ticker})
            </h4>
            <span className="text-xs font-mono text-white/40">
              Depth of capital retraction from historical rolling highs (Max: {activeMetric.maxDrawdownPct.toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-white/40">Peak: </span>
              <span className="text-white font-medium">{activeMetric.maxDrawdownPeakDate}</span>
            </div>
            <div>
              <span className="text-white/40">Trough: </span>
              <span className="text-[#FF5468] font-bold">{activeMetric.maxDrawdownTroughDate}</span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden select-none">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="underwaterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5468" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#FF5468" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* Zero Line (Peak) */}
            <line
              x1={pad.left}
              y1={pad.top}
              x2={chartW - pad.right}
              y2={pad.top}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />
            <text
              x={pad.left - 8}
              y={pad.top + 3}
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              0%
            </text>

            {/* Intermediate Grid Lines */}
            {[-10, -20, -30].map((pct) => {
              if (pct < minDrawdown) return null;
              const y = getY(pct);
              return (
                <g key={pct}>
                  <line
                    x1={pad.left}
                    y1={y}
                    x2={chartW - pad.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 3}
                    fill="rgba(255,255,255,0.3)"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    textAnchor="end"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Shaded Area */}
            {underwaterPath && <path d={underwaterPath} fill="url(#underwaterGrad)" />}

            {/* Outline Path */}
            {drawdownSeries.length > 0 && (
              <path
                d={drawdownSeries
                  .map(
                    (d, i) =>
                      `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.drawdown).toFixed(1)}`
                  )
                  .join(' ')}
                fill="none"
                stroke="#FF5468"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}

            {/* Date Labels */}
            {drawdownSeries.length > 0 && (
              <>
                <text
                  x={pad.left}
                  y={chartH - 8}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {drawdownSeries[0]?.date}
                </text>
                <text
                  x={chartW - pad.right}
                  y={chartH - 8}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  {drawdownSeries[drawdownSeries.length - 1]?.date}
                </text>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Macro Stress Testing & Correlation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Stress Testing Module */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#161920] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FF7518]" />
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Macroeconomic Stress Testing Engine
            </h4>
          </div>

          <div className="space-y-2">
            {STRESS_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenario.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className={`w-full p-3 rounded-lg border text-left transition-all font-mono text-xs ${
                    isSelected
                      ? isHalloween
                        ? 'bg-[#FF7518]/20 border-[#FF7518] text-white'
                        : 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-black/30 border-white/5 text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold">
                    <span>{sc.name}</span>
                    <span className="text-[#FF5468]">{sc.marketImpactPct}%</span>
                  </div>
                  <div className="text-[11px] text-white/50 mt-1 leading-normal font-sans">
                    {sc.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stress Result Box */}
          <div className="p-4 rounded-lg bg-black/50 border border-white/10 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Estimated Asset Downside ({activeMetric.ticker}):</span>
              <span className="text-lg font-bold text-[#FF5468]">
                {estimatedStressImpact.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-white/40 text-[11px]">
              <span>Projected Volatility Spike:</span>
              <span className="text-white">
                {(activeMetric.annualizedVolatility * selectedScenario.volatilityMultiplier).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-white/40 text-[11px]">
              <span>Est. Historical Recovery Horizon:</span>
              <span className="text-white">~{selectedScenario.recoveryMonthsEstimate} Months</span>
            </div>
          </div>
        </div>

        {/* Cross-Asset Correlation Heatmap */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-[#161920] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#9B5DE5]" />
            <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Pairwise Return Correlation Heatmap
            </h4>
          </div>

          <p className="text-xs text-white/50">
            Pearson correlation coefficient (r) calculated from concurrent daily logarithmic returns.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left text-white/40"></th>
                  {correlation.tickers.map((t) => (
                    <th key={t} className="p-2 text-white/80 font-bold">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation.tickers.map((rowTicker, i) => (
                  <tr key={rowTicker}>
                    <td className="p-2 text-left font-bold text-white/80">{rowTicker}</td>
                    {correlation.matrix[i]?.map((coeff, j) => {
                      const isDiagonal = i === j;
                      // Color scale: high positive (>0.7) -> purple/orange, low (<0.3) -> muted
                      const intensity = Math.abs(coeff);
                      const bgStyle = isDiagonal
                        ? 'bg-white/10 text-white font-bold'
                        : coeff > 0.6
                        ? 'bg-[#FF7518]/25 text-[#FF7518] font-semibold'
                        : coeff > 0.3
                        ? 'bg-[#9B5DE5]/20 text-[#9B5DE5]'
                        : 'bg-black/30 text-white/50';

                      return (
                        <td key={j} className={`p-2 rounded m-0.5 ${bgStyle}`}>
                          {coeff.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 pt-2 border-t border-white/5">
            <span>1.0 = Perfect Positive Sync</span>
            <span>0.0 = Uncorrelated</span>
            <span>-1.0 = Inverse Hedge</span>
          </div>
        </div>
      </div>

      {/* Mandatory Risk & Data Limitations Callout */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#FF7518] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-white/70 leading-relaxed font-sans">
          <strong className="text-white block font-mono">
            MANDATORY RESEARCH LIMITATIONS & REGULATORY DISCLOSURE
          </strong>
          <p>
            Historical price observations and derived indicators (including Volatility, Maximum
            Drawdown, and Value-at-Risk) do not guarantee future investment returns. Stress testing
            scenarios are deterministic mathematical approximations and do not encompass secondary
            liquidity freezes, trading halts, or counterparty default contagion.
          </p>
        </div>
      </div>
    </section>
  );
};
