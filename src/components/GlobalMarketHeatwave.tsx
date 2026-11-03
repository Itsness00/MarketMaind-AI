/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — D3.js All-Markets Global Heatwave Visualization
 * Visualizes performance across US Market, Europe, Asia, Crypto, Rates, Commodities & Currencies
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  GlobalMarketCategory,
  GlobalMarketInstrument,
  GLOBAL_MARKET_CATEGORIES,
} from '../data/globalMarketsData';
import { Flame, TrendingUp, TrendingDown, Layers, Maximize2 } from 'lucide-react';

interface GlobalMarketHeatwaveProps {
  instruments: GlobalMarketInstrument[];
  selectedCategory: GlobalMarketCategory;
  onSelectCategory: (cat: GlobalMarketCategory) => void;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

interface HeatwaveLeafNode {
  symbol: string;
  name: string;
  category: string;
  categoryLabel: string;
  unitPrefix: string;
  unitSuffix: string;
  price: number;
  changePct: number;
  volumeLabel: string;
  volatilityPct: number;
  rsi14: number;
  value: number;
  isPositive: boolean;
}

interface HierarchyDatum {
  name: string;
  children?: HeatwaveLeafNode[];
}

export const GlobalMarketHeatwave: React.FC<GlobalMarketHeatwaveProps> = ({
  instruments,
  selectedCategory,
  onSelectCategory,
  selectedSymbol,
  onSelectSymbol,
}) => {
  const [returnHorizon, setReturnHorizon] = useState<'1D' | '1W' | 'YTD'>('1D');
  const [sizingMode, setSizingMode] = useState<'weight' | 'magnitude' | 'equal'>('weight');
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1120,
    height: 440,
  });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.max(320, Math.floor(rect.width));
        const h = w < 640 ? 480 : 430;
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const filteredNodes: HeatwaveLeafNode[] = useMemo(() => {
    const base =
      selectedCategory === 'ALL'
        ? instruments
        : instruments.filter((i) => i.category === selectedCategory);

    return base.map((inst) => {
      const pct =
        returnHorizon === '1W'
          ? inst.weekChangePct
          : returnHorizon === 'YTD'
          ? inst.ytdChangePct
          : inst.changePct;

      const weight =
        sizingMode === 'equal'
          ? 100
          : sizingMode === 'magnitude'
          ? Math.max(20, Math.min(200, 25 + Math.abs(pct) * 14))
          : Math.max(30, inst.heatwaveWeight);

      return {
        symbol: inst.symbol,
        name: inst.name,
        category: inst.category,
        categoryLabel: inst.categoryLabel,
        unitPrefix: inst.unitPrefix,
        unitSuffix: inst.unitSuffix,
        price: inst.price,
        changePct: Number(pct.toFixed(2)),
        volumeLabel: inst.volumeLabel,
        volatilityPct: inst.volatilityPct,
        rsi14: inst.rsi14,
        value: weight,
        isPositive: pct >= 0,
      };
    });
  }, [instruments, selectedCategory, returnHorizon, sizingMode]);

  const treemapLeaves = useMemo(() => {
    if (filteredNodes.length === 0) return [];
    const data: HierarchyDatum = {
      name: 'GlobalMarketsHeatwave',
      children: filteredNodes,
    };

    const root = d3
      .hierarchy<HierarchyDatum | HeatwaveLeafNode>(data)
      .sum((d) => ('value' in d ? d.value : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const layout = d3
      .treemap<HierarchyDatum | HeatwaveLeafNode>()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(4)
      .paddingInner(4)
      .round(true)
      .tile(d3.treemapSquarify.ratio(1.18));

    layout(root);
    return root.leaves() as d3.HierarchyRectangularNode<HeatwaveLeafNode>[];
  }, [filteredNodes, dimensions]);

  const maxAbsChange = useMemo(() => {
    if (filteredNodes.length === 0) return 5;
    return Math.max(2.5, ...filteredNodes.map((n) => Math.abs(n.changePct)));
  }, [filteredNodes]);

  const getHeatwaveFill = (pct: number, isSelected: boolean, isHovered: boolean) => {
    const ratio = Math.min(1, Math.abs(pct) / maxAbsChange);
    if (pct >= 0) {
      const scale = d3
        .scaleLinear<string>()
        .domain([0, 0.35, 1])
        .range(['#064E3B', '#059669', '#10B981'])
        .clamp(true);
      const base = scale(ratio);
      if (isSelected || isHovered) {
        return d3.color(base)?.brighter(0.32)?.formatHex() || base;
      }
      return base;
    } else {
      const scale = d3
        .scaleLinear<string>()
        .domain([0, 0.35, 1])
        .range(['#450A0A', '#B91C1C', '#EF4444'])
        .clamp(true);
      const base = scale(ratio);
      if (isSelected || isHovered) {
        return d3.color(base)?.brighter(0.32)?.formatHex() || base;
      }
      return base;
    }
  };

  const advancingCount = filteredNodes.filter((n) => n.changePct >= 0).length;
  const decliningCount = filteredNodes.filter((n) => n.changePct < 0).length;

  const activeInspectionNode = useMemo(() => {
    if (hoveredSymbol) {
      const found = filteredNodes.find((n) => n.symbol === hoveredSymbol);
      if (found) return found;
    }
    return (
      filteredNodes.find((n) => n.symbol === selectedSymbol) ||
      filteredNodes[0] ||
      null
    );
  }, [filteredNodes, hoveredSymbol, selectedSymbol]);

  return (
    <section
      aria-label="Global Markets Heatwave Visualization"
      data-testid="d3-global-heatwave"
      className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4"
    >
      {/* Header & Horizon Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Flame className="w-5 h-5 text-blue-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
              Global Multi-Asset Market Heatwave (D3.js Engine)
            </h3>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              · {advancingCount} Advancing
            </span>
            <span className="text-xs font-mono text-red-400 tabular-nums">
              · {decliningCount} Declining
            </span>
          </div>
          <p className="text-xs text-white/65 mt-0.5">
            Real-time cross-asset performance across US, Europe, Asia, Crypto, Sovereign Rates, Commodities & FX (Green = Positive, Red = Negative)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon selector */}
          <div
            role="group"
            aria-label="Heatwave Return Horizon"
            className="inline-flex items-center rounded-lg bg-black border border-white/15 p-0.5"
          >
            {(['1D', '1W', 'YTD'] as const).map((horizon) => (
              <button
                key={horizon}
                type="button"
                onClick={() => setReturnHorizon(horizon)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  returnHorizon === horizon
                    ? 'bg-blue-600 text-white'
                    : 'text-white/65 hover:text-white'
                }`}
              >
                {horizon} %
              </button>
            ))}
          </div>

          {/* Sizing selector */}
          <div
            role="group"
            aria-label="Heatwave Sizing Mode"
            className="inline-flex items-center rounded-lg bg-black border border-white/15 p-0.5"
          >
            <button
              type="button"
              onClick={() => setSizingMode('weight')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                sizingMode === 'weight'
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              Market Weight
            </button>
            <button
              type="button"
              onClick={() => setSizingMode('magnitude')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                sizingMode === 'magnitude'
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              |Δ%| Size
            </button>
            <button
              type="button"
              onClick={() => setSizingMode('equal')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sizingMode === 'equal'
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              Equal Grid
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Bar inside Heatwave */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {GLOBAL_MARKET_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-black/80 text-white/70 border-white/10 hover:text-white hover:border-white/25'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* D3 SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-xl bg-[#030508] border border-white/15 relative"
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          role="img"
          aria-label="D3 Multi-Asset Global Market Heatwave"
          className="block w-full h-auto select-none"
        >
          {treemapLeaves.map((leaf) => {
            const d = leaf.data;
            const w = Math.max(0, leaf.x1 - leaf.x0);
            const h = Math.max(0, leaf.y1 - leaf.y0);
            const isSelected = d.symbol === selectedSymbol;
            const isHovered = d.symbol === hoveredSymbol;
            const fill = getHeatwaveFill(d.changePct, isSelected, isHovered);

            const showSymbol = w >= 38 && h >= 24;
            const showPct = w >= 48 && h >= 40;
            const showPrice = w >= 76 && h >= 58;
            const showCat = w >= 105 && h >= 76;

            return (
              <g
                key={d.symbol}
                transform={`translate(${leaf.x0},${leaf.y0})`}
                onClick={() => onSelectSymbol(d.symbol)}
                onMouseEnter={() => setHoveredSymbol(d.symbol)}
                onMouseLeave={() => setHoveredSymbol(null)}
                className="cursor-pointer"
                data-testid={`heatwave-tile-${d.symbol}`}
              >
                <rect
                  width={w}
                  height={h}
                  rx={6}
                  ry={6}
                  fill={fill}
                  stroke={
                    isSelected
                      ? '#FFFFFF'
                      : isHovered
                      ? '#93C5FD'
                      : d.isPositive
                      ? '#10B981'
                      : '#EF4444'
                  }
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                  strokeOpacity={isSelected || isHovered ? 1 : 0.45}
                />
                {showSymbol && (
                  <foreignObject width={w} height={h} className="pointer-events-none">
                    <div className="w-full h-full p-2 flex flex-col justify-between overflow-hidden">
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-bold text-white text-xs sm:text-sm tracking-tight truncate drop-shadow">
                            {d.symbol}
                          </span>
                          {isSelected && w >= 72 && (
                            <span className="text-[9px] font-mono uppercase text-white/90">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        {showPct && (
                          <div className="font-mono font-bold text-white text-[11px] sm:text-xs tabular-nums leading-tight mt-0.5 drop-shadow">
                            {d.changePct >= 0 ? '+' : ''}
                            {d.changePct.toFixed(2)}%
                          </div>
                        )}
                        {showPrice && (
                          <div className="font-mono text-[10px] text-white/90 tabular-nums mt-0.5 truncate">
                            {d.unitPrefix}
                            {d.price.toLocaleString(undefined, {
                              minimumFractionDigits: d.price < 10 ? 2 : 2,
                              maximumFractionDigits: d.price < 10 ? 4 : 2,
                            })}
                            {d.unitSuffix}
                          </div>
                        )}
                      </div>
                      {showCat && (
                        <div className="text-[10px] font-sans text-white/80 truncate">
                          {d.categoryLabel} · {d.name}
                        </div>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Telemetry Bar */}
      {activeInspectionNode && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-black/90 border border-white/10 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white">{activeInspectionNode.symbol}</span>
            <span className="text-white/75">{activeInspectionNode.name}</span>
            <span className="text-white/35">·</span>
            <span className="text-blue-400">{activeInspectionNode.categoryLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 tabular-nums">
            <span className="text-white/70">
              Price:{' '}
              <strong className="text-white">
                {activeInspectionNode.unitPrefix}
                {activeInspectionNode.price.toLocaleString()}
                {activeInspectionNode.unitSuffix}
              </strong>
            </span>
            <span className="text-white/70">
              {returnHorizon} Change:{' '}
              <strong
                className={
                  activeInspectionNode.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                }
              >
                {activeInspectionNode.changePct >= 0 ? '+' : ''}
                {activeInspectionNode.changePct.toFixed(2)}%
              </strong>
            </span>
            <span className="text-white/70">
              Volume: <strong className="text-white">{activeInspectionNode.volumeLabel}</strong>
            </span>
            <span className="text-white/70">
              RSI-14: <strong className="text-white">{activeInspectionNode.rsi14.toFixed(1)}</strong>
            </span>
            <span className="text-white/70">
              Volatility:{' '}
              <strong className="text-white">
                {activeInspectionNode.volatilityPct.toFixed(1)}%
              </strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
