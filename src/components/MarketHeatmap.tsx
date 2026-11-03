/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — D3 Market Heatmap Component (Top 20 Watchlist Performance & Volatility Visualization)
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AssetMetrics } from '../types/market';
import {
  computeTopWatchlistHeatmapData,
  computeHeatmapSectorCounts,
  computeHeatmapTileOpacity,
  computeHeatmapTooltipPosition,
  WatchlistHeatmapNode,
  HeatmapSectorFilter,
  HeatmapColorMetric,
} from '../utils/analytics';
import {
  Grid,
  TrendingUp,
  TrendingDown,
  Maximize2,
  Layers,
  Filter,
  Activity,
  Palette,
} from 'lucide-react';

interface MarketHeatmapProps {
  assetSummaries: AssetMetrics[];
  activeTicker: string;
  onSelectTicker: (ticker: string) => void;
}

interface HeatmapHierarchyDatum {
  name: string;
  children?: WatchlistHeatmapNode[];
}

const SECTOR_OPTIONS: Array<{ id: HeatmapSectorFilter; label: string }> = [
  { id: 'ALL', label: 'All Sectors' },
  { id: 'Tech', label: 'Tech' },
  { id: 'Healthcare', label: 'Healthcare' },
  { id: 'Energy', label: 'Energy' },
  { id: 'Financials', label: 'Financials' },
  { id: 'Consumer', label: 'Consumer' },
  { id: 'Index & Macro', label: 'ETF / Index' },
];

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  assetSummaries,
  activeTicker,
  onSelectTicker,
}) => {
  const [sectorFilter, setSectorFilter] = useState<HeatmapSectorFilter>('ALL');
  const [colorMetric, setColorMetric] = useState<HeatmapColorMetric>('priceChange');
  const [returnMode, setReturnMode] = useState<'total' | 'day'>('total');
  const [sizingMode, setSizingMode] = useState<'magnitude' | 'equal'>('magnitude');
  const [hoveredTile, setHoveredTile] = useState<WatchlistHeatmapNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number }>({
    left: 16,
    top: 16,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 960,
    height: 420,
  });

  const handleTilePointerEvent = (
    e: React.MouseEvent<SVGGElement>,
    node: WatchlistHeatmapNode,
    fallbackX: number,
    fallbackY: number
  ) => {
    setHoveredTile(node);
    const containerEl = containerRef.current;
    if (containerEl) {
      const rect = containerEl.getBoundingClientRect();
      const relX = e.clientX ? e.clientX - rect.left : fallbackX + 24;
      const relY = e.clientY ? e.clientY - rect.top : fallbackY + 24;
      setTooltipPos(
        computeHeatmapTooltipPosition(relX, relY, dimensions.width, dimensions.height)
      );
    } else {
      setTooltipPos(
        computeHeatmapTooltipPosition(
          fallbackX + 24,
          fallbackY + 24,
          dimensions.width,
          dimensions.height
        )
      );
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 100) {
        setDimensions({
          width: Math.floor(rect.width),
          height: rect.width < 640 ? 520 : 420,
        });
      }
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  // Compute counts per sector across the watchlist
  const sectorCounts = useMemo(
    () => computeHeatmapSectorCounts(assetSummaries),
    [assetSummaries]
  );

  // Top 20 tickers from the current watchlist filtered by sector and ordered by the active coloring metric
  const heatmapNodes = useMemo(
    () =>
      computeTopWatchlistHeatmapData(assetSummaries, returnMode, 20, sizingMode, {
        sectorFilter,
        colorMetric,
      }),
    [assetSummaries, returnMode, sizingMode, sectorFilter, colorMetric]
  );

  // D3 Color Scales:
  // 1) Price Change %: Green for positive performance, Red for negative performance
  // 2) Volatility (σ%): Cool Royal Blue for Low Volatility -> Amber for Moderate -> Crimson for High Volatility
  const { positiveColorScale, negativeColorScale, volatilityColorScale } = useMemo(() => {
    const maxPos = Math.max(
      5,
      d3.max(
        heatmapNodes.filter((n) => n.priceChangePct >= 0),
        (d) => d.priceChangePct
      ) || 25
    );
    const minNeg = Math.min(
      -5,
      d3.min(
        heatmapNodes.filter((n) => n.priceChangePct < 0),
        (d) => d.priceChangePct
      ) || -25
    );

    const minVol = Math.max(8, (d3.min(heatmapNodes, (d) => d.volatilityPct) || 12) * 0.85);
    const maxVol = Math.max(40, (d3.max(heatmapNodes, (d) => d.volatilityPct) || 48) * 1.05);
    const midVol = (minVol + maxVol) / 2;

    const posScale = d3
      .scaleLinear<string>()
      .domain([0, maxPos * 0.45, maxPos])
      .range(['#065F46', '#059669', '#16A34A'])
      .clamp(true);

    const negScale = d3
      .scaleLinear<string>()
      .domain([0, Math.abs(minNeg) * 0.45, Math.abs(minNeg)])
      .range(['#7F1D1D', '#B91C1C', '#DC2626'])
      .clamp(true);

    const volScale = d3
      .scaleLinear<string>()
      .domain([minVol, midVol, maxVol])
      .range(['#1D4ED8', '#D97706', '#DC2626'])
      .clamp(true);

    return {
      positiveColorScale: posScale,
      negativeColorScale: negScale,
      volatilityColorScale: volScale,
    };
  }, [heatmapNodes]);

  const getTileFillColor = (node: WatchlistHeatmapNode): string => {
    if (colorMetric === 'volatility') {
      return volatilityColorScale(node.volatilityPct);
    }
    if (node.priceChangePct >= 0) {
      return positiveColorScale(node.priceChangePct);
    }
    return negativeColorScale(Math.abs(node.priceChangePct));
  };

  const getTileStrokeColor = (
    node: WatchlistHeatmapNode,
    isSelected: boolean,
    isHovered: boolean
  ): string => {
    if (isSelected) return '#FFFFFF';
    if (isHovered) return '#93C5FD';
    if (colorMetric === 'volatility') {
      if (node.volatilityRegime === 'LOW') return '#60A5FA';
      if (node.volatilityRegime === 'MODERATE') return '#FBBF24';
      return '#F87171';
    }
    return node.isPositive ? '#34D399' : '#F87171';
  };

  // Compute D3 Treemap layout for the Watchlist Tickers
  const treemapLeaves = useMemo(() => {
    if (heatmapNodes.length === 0) return [];

    const rootData: HeatmapHierarchyDatum = {
      name: 'WatchlistRoot',
      children: heatmapNodes,
    };

    const hierarchyRoot = d3
      .hierarchy<HeatmapHierarchyDatum | WatchlistHeatmapNode>(rootData, (d) =>
        'children' in d ? d.children : undefined
      )
      .sum((d) => ('weightValue' in d ? d.weightValue : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<HeatmapHierarchyDatum | WatchlistHeatmapNode>()
      .tile(d3.treemapSquarify.ratio(1.25))
      .size([dimensions.width, dimensions.height])
      .paddingOuter(4)
      .paddingInner(5)
      .round(true);

    const laidOutRoot = treemapLayout(hierarchyRoot);
    return laidOutRoot.leaves() as Array<
      d3.HierarchyRectangularNode<WatchlistHeatmapNode>
    >;
  }, [heatmapNodes, dimensions]);

  const positiveCount = heatmapNodes.filter((n) => n.isPositive).length;
  const negativeCount = heatmapNodes.length - positiveCount;

  const topGainer = useMemo(() => {
    if (!heatmapNodes.length) return null;
    return [...heatmapNodes].sort((a, b) => b.priceChangePct - a.priceChangePct)[0];
  }, [heatmapNodes]);

  const topLoser = useMemo(() => {
    if (!heatmapNodes.length) return null;
    return [...heatmapNodes].sort((a, b) => a.priceChangePct - b.priceChangePct)[0];
  }, [heatmapNodes]);

  const highestVolNode = useMemo(() => {
    if (!heatmapNodes.length) return null;
    return [...heatmapNodes].sort((a, b) => b.volatilityPct - a.volatilityPct)[0];
  }, [heatmapNodes]);

  const lowestVolNode = useMemo(() => {
    if (!heatmapNodes.length) return null;
    return [...heatmapNodes].sort((a, b) => a.volatilityPct - b.volatilityPct)[0];
  }, [heatmapNodes]);

  const meanVolatility = useMemo(() => {
    if (!heatmapNodes.length) return 0;
    const sum = heatmapNodes.reduce((acc, n) => acc + n.volatilityPct, 0);
    return Number((sum / heatmapNodes.length).toFixed(1));
  }, [heatmapNodes]);

  const inspectedNode = useMemo(() => {
    if (hoveredTile) return hoveredTile;
    return (
      heatmapNodes.find((n) => n.ticker === activeTicker) || heatmapNodes[0] || null
    );
  }, [hoveredTile, heatmapNodes, activeTicker]);

  return (
    <div
      className="rounded-2xl bg-[#070A12]/95 border border-white/15 p-5 sm:p-6 shadow-xl space-y-4"
      data-testid="market-heatmap-section"
      aria-label="Market Heatmap Top 20 Watchlist Performance"
    >
      {/* Header & Primary Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3.5 border-b border-white/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
                Market Heatmap — {sectorFilter === 'ALL' ? `Top ${heatmapNodes.length} Watchlist` : `${sectorFilter} Sector (${heatmapNodes.length})`} (D3 Treemap)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {positiveCount} Advancing
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500/15 text-red-300 border border-red-500/30">
                {negativeCount} Declining
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {colorMetric === 'volatility' ? `Color: Volatility (Avg ${meanVolatility}%)` : 'Color: Price Change %'}
              </span>
            </div>
            <p className="text-xs font-mono text-white/60">
              {colorMetric === 'volatility'
                ? `D3 squarified treemap colored by annualized volatility σ% (Blue = Low Vol, Amber = Moderate, Crimson = High Vol)`
                : `D3 squarified treemap of ${sectorFilter === 'ALL' ? 'watchlist' : sectorFilter} tickers colored by price change percentage (Green = Positive, Red = Negative)`}
            </p>
          </div>
        </div>

        {/* Horizon & Sizing Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Horizon Toggle: Total Return % vs 1D Session Change % */}
          <div
            className="inline-flex items-center p-1 rounded-xl bg-black border border-white/15"
            role="group"
            aria-label="Heatmap Price Change Horizon"
          >
            <button
              type="button"
              data-testid="heatmap-mode-total"
              onClick={() => setReturnMode('total')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                returnMode === 'total'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              Total Change %
            </button>
            <button
              type="button"
              data-testid="heatmap-mode-day"
              onClick={() => setReturnMode('day')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                returnMode === 'day'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              1D Change %
            </button>
          </div>

          {/* Tile Area Sizing Toggle */}
          <div
            className="inline-flex items-center p-1 rounded-xl bg-black border border-white/15"
            role="group"
            aria-label="Heatmap Tile Sizing Mode"
          >
            <button
              type="button"
              data-testid="heatmap-size-magnitude"
              onClick={() => setSizingMode('magnitude')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sizingMode === 'magnitude'
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>{colorMetric === 'volatility' ? 'Size by σ%' : 'Size by |Δ%|'}</span>
            </button>
            <button
              type="button"
              data-testid="heatmap-size-equal"
              onClick={() => setSizingMode('equal')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sizingMode === 'equal'
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Equal Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CONTROL PANEL: SECTOR FILTER & COLORING LOGIC (PRICE CHANGE VS VOL)   */}
      {/* ===================================================================== */}
      <div
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 p-3 rounded-xl bg-black/80 border border-white/15"
        data-testid="heatmap-control-panel"
        aria-label="Market Heatmap Sector Filter and Coloring Control Panel"
      >
        {/* Sector Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-white/60 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Sector:
          </span>
          {SECTOR_OPTIONS.map((sec) => {
            const count = sectorCounts[sec.id] ?? 0;
            const isActive = sectorFilter === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                data-testid={`heatmap-sector-${sec.id}`}
                aria-pressed={isActive}
                onClick={() => setSectorFilter(sec.id)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                    : 'bg-[#070A12] text-white/75 border-white/10 hover:text-white hover:border-white/25'
                }`}
              >
                <span>{sec.label}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[10px] tabular-nums ${
                    isActive ? 'bg-black/30 text-white' : 'bg-white/5 text-white/55'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Coloring Logic Toggle: Price Change % vs Annualized Volatility */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-white/60">
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            Color By:
          </span>
          <div
            className="inline-flex items-center p-1 rounded-xl bg-[#070A12] border border-white/15 font-mono text-xs"
            role="group"
            aria-label="Heatmap Coloring Logic"
          >
            <button
              type="button"
              data-testid="heatmap-color-priceChange"
              aria-pressed={colorMetric === 'priceChange'}
              onClick={() => setColorMetric('priceChange')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                colorMetric === 'priceChange'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Price Change %</span>
            </button>
            <button
              type="button"
              data-testid="heatmap-color-volatility"
              aria-pressed={colorMetric === 'volatility'}
              onClick={() => setColorMetric('volatility')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                colorMetric === 'volatility'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-white/65 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Volatility (σ%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Telemetry & Color Scale Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-black/70 px-4 py-2.5 rounded-xl border border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          {colorMetric === 'priceChange' ? (
            <>
              {topGainer && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white/60">Top Leader:</span>
                  <button
                    type="button"
                    onClick={() => onSelectTicker(topGainer.ticker)}
                    className="font-bold text-white hover:underline cursor-pointer"
                  >
                    {topGainer.ticker}
                  </button>
                  <span className="text-emerald-400 font-bold">
                    {topGainer.priceChangePct >= 0 ? '+' : ''}
                    {topGainer.priceChangePct.toFixed(2)}%
                  </span>
                </div>
              )}

              {topLoser && (
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-white/60">Top Laggard:</span>
                  <button
                    type="button"
                    onClick={() => onSelectTicker(topLoser.ticker)}
                    className="font-bold text-white hover:underline cursor-pointer"
                  >
                    {topLoser.ticker}
                  </button>
                  <span className="text-red-400 font-bold">
                    {topLoser.priceChangePct >= 0 ? '+' : ''}
                    {topLoser.priceChangePct.toFixed(2)}%
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              {highestVolNode && (
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-white/60">Highest Volatility:</span>
                  <button
                    type="button"
                    onClick={() => onSelectTicker(highestVolNode.ticker)}
                    className="font-bold text-white hover:underline cursor-pointer"
                  >
                    {highestVolNode.ticker}
                  </button>
                  <span className="text-red-400 font-bold">
                    {highestVolNode.volatilityPct.toFixed(1)}% σ
                  </span>
                </div>
              )}

              {lowestVolNode && (
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-white/60">Lowest Volatility:</span>
                  <button
                    type="button"
                    onClick={() => onSelectTicker(lowestVolNode.ticker)}
                    className="font-bold text-white hover:underline cursor-pointer"
                  >
                    {lowestVolNode.ticker}
                  </button>
                  <span className="text-blue-400 font-bold">
                    {lowestVolNode.volatilityPct.toFixed(1)}% σ
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Dynamic Color Scale Legend */}
        {colorMetric === 'priceChange' ? (
          <div className="flex items-center gap-2 text-[11px]" data-testid="legend-priceChange">
            <span className="text-red-400 font-bold">Negative (-%)</span>
            <div className="flex items-center gap-0.5">
              <span className="w-4 h-2.5 rounded-l-sm bg-[#DC2626] inline-block" />
              <span className="w-4 h-2.5 bg-[#B91C1C] inline-block" />
              <span className="w-4 h-2.5 bg-[#7F1D1D] inline-block" />
              <span className="w-4 h-2.5 bg-[#065F46] inline-block" />
              <span className="w-4 h-2.5 bg-[#059669] inline-block" />
              <span className="w-4 h-2.5 rounded-r-sm bg-[#16A34A] inline-block" />
            </div>
            <span className="text-emerald-400 font-bold">Positive (+%)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px]" data-testid="legend-volatility">
            <span className="text-blue-400 font-bold">Low Vol (&lt;22% σ)</span>
            <div className="flex items-center gap-0.5">
              <span className="w-4 h-2.5 rounded-l-sm bg-[#1D4ED8] inline-block" />
              <span className="w-4 h-2.5 bg-[#2563EB] inline-block" />
              <span className="w-4 h-2.5 bg-[#B45309] inline-block" />
              <span className="w-4 h-2.5 bg-[#D97706] inline-block" />
              <span className="w-4 h-2.5 bg-[#B91C1C] inline-block" />
              <span className="w-4 h-2.5 rounded-r-sm bg-[#DC2626] inline-block" />
            </div>
            <span className="text-red-400 font-bold">High Vol (&gt;36% σ)</span>
          </div>
        )}
      </div>

      {/* D3 SVG Treemap Canvas */}
      {heatmapNodes.length === 0 ? (
        <div className="w-full h-64 rounded-xl bg-black border border-white/15 flex flex-col items-center justify-center gap-3 text-center p-6 font-mono">
          <p className="text-sm text-white/80">
            No watchlist tickers match the <span className="text-blue-400 font-bold">{sectorFilter}</span> sector filter.
          </p>
          <button
            type="button"
            onClick={() => setSectorFilter('ALL')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
          >
            Reset to All Sectors ({assetSummaries.length})
          </button>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative w-full rounded-xl bg-black border border-white/15 overflow-hidden"
          style={{ height: `${dimensions.height}px` }}
        >
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-full block select-none"
            data-testid="d3-market-heatmap-svg"
            data-color-metric={colorMetric}
            data-sector-filter={sectorFilter}
            role="img"
            aria-label="D3 Market Heatmap of Top 20 Watchlist Tickers"
          >
            {treemapLeaves.map((leaf, idx) => {
              const node = leaf.data;
              const x = leaf.x0;
              const y = leaf.y0;
              const w = Math.max(0, leaf.x1 - leaf.x0);
              const h = Math.max(0, leaf.y1 - leaf.y0);
              const isSelected = node.ticker === activeTicker;
              const isHovered = hoveredTile?.ticker === node.ticker;
              const opacityState = computeHeatmapTileOpacity(
                node.ticker,
                hoveredTile?.ticker || null,
                activeTicker
              );
              const fillColor = getTileFillColor(node);
              const strokeColor = getTileStrokeColor(node, isSelected, isHovered);
              const clipId = `heatmap-clip-${node.ticker}-${idx}`;
              const formattedPct = `${node.priceChangePct >= 0 ? '+' : ''}${node.priceChangePct.toFixed(2)}%`;
              const formattedVol = `Vol ${node.volatilityPct.toFixed(1)}%`;

              const primaryMetricLabel =
                colorMetric === 'volatility' ? formattedVol : formattedPct;
              const secondaryMetricLabel =
                colorMetric === 'volatility'
                  ? `$${node.price.toFixed(2)} (${formattedPct})`
                  : `$${node.price.toFixed(2)} · σ ${node.volatilityPct.toFixed(0)}%`;

              const showSecondary = w >= 82 && h >= 58;
              const showSector = w >= 120 && h >= 82;

              return (
                <g
                  key={node.ticker}
                  transform={`translate(${x},${y})`}
                  className="heatmap-tile cursor-pointer transition-all duration-200 ease-out"
                  data-testid={`heatmap-tile-${node.ticker}`}
                  data-ticker={node.ticker}
                  data-sector-group={node.sectorGroup}
                  data-color-metric={colorMetric}
                  data-positive={node.isPositive ? 'true' : 'false'}
                  data-change-pct={node.priceChangePct}
                  data-volatility-pct={node.volatilityPct}
                  data-volatility-regime={node.volatilityRegime}
                  data-hovered={isHovered ? 'true' : 'false'}
                  data-fill-opacity={opacityState.fillOpacity}
                  onClick={() => onSelectTicker(node.ticker)}
                  onMouseEnter={(e) => handleTilePointerEvent(e, node, x, y)}
                  onMouseMove={(e) => handleTilePointerEvent(e, node, x, y)}
                  onMouseLeave={() => setHoveredTile(null)}
                >
                  <defs>
                    <clipPath id={clipId}>
                      <rect
                        width={Math.max(0, w - 6)}
                        height={Math.max(0, h - 6)}
                        x={3}
                        y={3}
                        rx={6}
                      />
                    </clipPath>
                  </defs>

                  {/* D3 Tile Background Rectangle with Smooth Hover Opacity Transition */}
                  <rect
                    width={w}
                    height={h}
                    rx={8}
                    fill={fillColor}
                    fillOpacity={opacityState.fillOpacity}
                    stroke={strokeColor}
                    strokeOpacity={opacityState.strokeOpacity}
                    strokeWidth={isHovered ? 2.75 : isSelected ? 2.25 : 1}
                    data-testid={`heatmap-rect-${node.ticker}`}
                    className="heatmap-rect transition-all duration-200 ease-out"
                    style={{
                      filter: isHovered
                        ? 'brightness(1.14) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.65))'
                        : 'none',
                      transition:
                        'fill-opacity 220ms cubic-bezier(0.22, 1, 0.36, 1), stroke-opacity 220ms ease-out, stroke-width 180ms ease-out, filter 220ms ease-out',
                    }}
                  />

                  {/* Smooth Inner Luminance Highlight Overlay on Hover */}
                  <rect
                    width={Math.max(0, w - 2)}
                    height={Math.max(0, h - 2)}
                    x={1}
                    y={1}
                    rx={7}
                    fill="#FFFFFF"
                    fillOpacity={opacityState.highlightOverlayOpacity}
                    pointerEvents="none"
                    style={{
                      transition: 'fill-opacity 220ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />

                  {/* Clipped Tile Typography */}
                  <g clipPath={`url(#${clipId})`} pointerEvents="none">
                    {/* Ticker Symbol */}
                    <text
                      x={10}
                      y={22}
                      fill="#FFFFFF"
                      className="font-mono font-bold text-[13px] tracking-tight"
                    >
                      {node.ticker}
                    </text>

                    {/* Primary Metric (Price Change % or Volatility %) */}
                    <text
                      x={10}
                      y={40}
                      fill="#FFFFFF"
                      className="font-mono font-extrabold text-[12px]"
                    >
                      {primaryMetricLabel}
                    </text>

                    {/* Secondary Price & Metric Line */}
                    {showSecondary && (
                      <text
                        x={10}
                        y={56}
                        fill="rgba(255, 255, 255, 0.88)"
                        className="font-mono text-[11px]"
                      >
                        {secondaryMetricLabel}
                      </text>
                    )}

                    {/* Sector Group & Company Name on Larger Tiles */}
                    {showSector && (
                      <text
                        x={10}
                        y={h - 10}
                        fill="rgba(255, 255, 255, 0.76)"
                        className="font-sans text-[10px]"
                      >
                        {node.sectorGroup} · {node.name}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Floating Exact Ticker Data Tooltip on Hover */}
          {hoveredTile && (
            <div
              role="tooltip"
              data-testid="heatmap-hover-tooltip"
              data-tooltip-ticker={hoveredTile.ticker}
              className="pointer-events-none absolute z-30 w-[276px] rounded-xl bg-[#050811]/95 backdrop-blur-md border border-white/25 p-3.5 shadow-2xl font-mono text-xs transition-opacity duration-150 ease-out"
              style={{
                left: `${tooltipPos.left}px`,
                top: `${tooltipPos.top}px`,
              }}
            >
              {/* Tooltip Header: Ticker, Sector Badge & Price */}
              <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-white/15">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-extrabold text-white ${
                        hoveredTile.isPositive ? 'bg-emerald-600' : 'bg-red-600'
                      }`}
                    >
                      {hoveredTile.ticker}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/40 text-[10px] text-blue-300 font-semibold">
                      {hoveredTile.sectorGroup}
                    </span>
                  </div>
                  <div className="text-[11px] font-sans text-white/85 font-medium truncate mt-1">
                    {hoveredTile.name}
                  </div>
                  <div className="text-[10px] text-white/50 truncate">
                    {hoveredTile.sector}
                  </div>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <div className="text-sm font-extrabold text-white">
                    ${hoveredTile.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-[11px] font-bold ${
                      hoveredTile.priceChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {hoveredTile.priceChangePct >= 0 ? '+' : ''}
                    {hoveredTile.priceChangePct.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Exact Quantitative Ticker Telemetry Grid */}
              <div className="space-y-1.5 text-[11px] tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="text-white/55">1D Session Change:</span>
                  <span
                    className={`font-bold ${
                      hoveredTile.dayChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {hoveredTile.dayChangePct >= 0 ? '+' : ''}
                    {hoveredTile.dayChangePct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Total Return (252D):</span>
                  <span
                    className={`font-bold ${
                      hoveredTile.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {hoveredTile.totalReturnPct >= 0 ? '+' : ''}
                    {hoveredTile.totalReturnPct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Annualized Volatility:</span>
                  <span
                    className={`font-bold ${
                      hoveredTile.volatilityRegime === 'HIGH'
                        ? 'text-red-400'
                        : hoveredTile.volatilityRegime === 'MODERATE'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {hoveredTile.volatilityPct.toFixed(2)}% ({hoveredTile.volatilityRegime})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Session Volume:</span>
                  <span className="text-white/90 font-semibold">
                    {(hoveredTile.volume / 1_000_000).toFixed(2)}M shs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Treemap Area Weight:</span>
                  <span className="text-blue-300 font-semibold">
                    {hoveredTile.weightValue.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inspected Tile Telemetry Footer */}
      {inspectedNode && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/80 border border-white/15 text-xs font-mono"
          data-testid="heatmap-inspected-summary"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-md font-bold text-white ${
                colorMetric === 'volatility'
                  ? inspectedNode.volatilityRegime === 'HIGH'
                    ? 'bg-red-600'
                    : inspectedNode.volatilityRegime === 'MODERATE'
                    ? 'bg-amber-600'
                    : 'bg-blue-600'
                  : inspectedNode.isPositive
                  ? 'bg-emerald-600'
                  : 'bg-red-600'
              }`}
            >
              {inspectedNode.ticker}
            </span>
            <span className="text-white font-semibold">{inspectedNode.name}</span>
            <span className="text-white/40">·</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px]">
              {inspectedNode.sectorGroup}
            </span>
            <span className="text-white/65">{inspectedNode.sector}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-white/50 mr-1.5">Last Price:</span>
              <span className="text-white font-bold">${inspectedNode.price.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-white/50 mr-1.5">1D Change:</span>
              <span
                className={`font-bold ${
                  inspectedNode.dayChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {inspectedNode.dayChangePct >= 0 ? '+' : ''}
                {inspectedNode.dayChangePct.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-white/50 mr-1.5">Total Return:</span>
              <span
                className={`font-bold ${
                  inspectedNode.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {inspectedNode.totalReturnPct >= 0 ? '+' : ''}
                {inspectedNode.totalReturnPct.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-white/50 mr-1.5">Annualized Volatility:</span>
              <span
                className={`font-bold ${
                  inspectedNode.volatilityRegime === 'HIGH'
                    ? 'text-red-400'
                    : inspectedNode.volatilityRegime === 'MODERATE'
                    ? 'text-amber-400'
                    : 'text-blue-400'
                }`}
              >
                {inspectedNode.volatilityPct.toFixed(1)}% ({inspectedNode.volatilityRegime})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
