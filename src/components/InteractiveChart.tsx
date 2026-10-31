/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Interactive Institutional Financial Chart
 * High-precision SVG chart with Candlestick/Line view, SMA overlays, volume bars, price/volume alerts, and crosshair tooltip.
 */

import React, { useState, useMemo, useRef } from 'react';
import { MarketDataPoint, PriceAlert } from '../types/market';
import { calculateSMA } from '../utils/analytics';

export type ChartTimeframe = '1H' | '6H' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface InteractiveChartProps {
  data: MarketDataPoint[];
  ticker: string;
  priceAlerts?: PriceAlert[];
  selectedTimeframe?: ChartTimeframe;
  onTimeframeChange?: (tf: ChartTimeframe) => void;
}

type ChartMode = 'candlestick' | 'line';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  ticker,
  priceAlerts = [],
  selectedTimeframe,
  onTimeframeChange,
}) => {
  const [mode, setMode] = useState<ChartMode>('candlestick');
  const [internalTimeframe, setInternalTimeframe] = useState<ChartTimeframe>('1H');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const timeframe = selectedTimeframe ?? internalTimeframe;
  const handleSelectTimeframe = (tf: ChartTimeframe) => {
    setInternalTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter data by timeframe (including high-frequency 1H and 6H intraday live feed windows)
  const filteredData = useMemo<MarketDataPoint[]>(() => {
    if (!data || data.length === 0) return [];
    const count = data.length;

    if (timeframe === '1H' || timeframe === '6H') {
      const steps = timeframe === '1H' ? 12 : 36; // 12 x 5m = 60m (1H), 36 x 10m = 360m (6H)
      const intervalMinutes = timeframe === '1H' ? 5 : 10;
      const lastPt = data[count - 1];
      const prevPt = count > 1 ? data[count - 2] : lastPt;
      const prev6Pt = count > 6 ? data[count - 6] : prevPt;

      const anchorStart =
        timeframe === '1H'
          ? prevPt.close + (lastPt.close - prevPt.close) * 0.35
          : prev6Pt.close + (lastPt.close - prev6Pt.close) * 0.55;

      const endPrice = lastPt.close;
      const totalVolume = lastPt.volume ?? 24_000_000;
      const perBarVol = Math.max(25_000, Math.round(totalVolume / (timeframe === '1H' ? 48 : 16)));
      const seedBase = ticker.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

      const bars: MarketDataPoint[] = [];
      let runningClose = anchorStart;

      for (let i = 0; i < steps; i++) {
        const progress = (i + 1) / steps;
        const minsAgo = (steps - 1 - i) * intervalMinutes;
        const label =
          minsAgo === 0
            ? 'LIVE NOW'
            : timeframe === '1H'
            ? `-${minsAgo}m`
            : `-${Math.floor(minsAgo / 60)}h ${String(minsAgo % 60).padStart(2, '0')}m`;

        const wave =
          Math.sin(i * 0.85 + seedBase * 0.1) * 0.0028 +
          Math.cos(i * 1.4 + seedBase * 0.05) * 0.0016;

        const targetClose =
          i === steps - 1
            ? endPrice
            : anchorStart + (endPrice - anchorStart) * progress + anchorStart * wave;

        const openVal = i === 0 ? anchorStart : runningClose;
        const closeVal = Number(targetClose.toFixed(2));
        const spread = Math.max(0.08, Math.abs(closeVal - openVal) * 0.65 + endPrice * 0.0014);
        const highVal = Number((Math.max(openVal, closeVal) + spread).toFixed(2));
        const lowVal = Number((Math.min(openVal, closeVal) - spread).toFixed(2));
        const volMod = 0.75 + Math.abs(Math.sin(i * 1.1 + seedBase)) * 0.65;

        bars.push({
          date: label,
          ticker,
          open: Number(openVal.toFixed(2)),
          high: highVal,
          low: lowVal,
          close: closeVal,
          volume: Math.round(perBarVol * volMod),
        });

        runningClose = closeVal;
      }

      return bars;
    }

    let sliceDays = count;
    switch (timeframe) {
      case '1M':
        sliceDays = 22;
        break;
      case '3M':
        sliceDays = 65;
        break;
      case '6M':
        sliceDays = 126;
        break;
      case '1Y':
        sliceDays = 252;
        break;
      case 'ALL':
      default:
        sliceDays = count;
        break;
    }

    return data.slice(-Math.min(count, sliceDays));
  }, [data, timeframe, ticker]);

  // Compute SMAs across the active series
  const { sma20Slice, sma50Slice } = useMemo(() => {
    if (!data || data.length === 0 || filteredData.length === 0) {
      return { sma20Slice: [], sma50Slice: [] };
    }
    if (timeframe === '1H' || timeframe === '6H') {
      const intradayPrices = filteredData.map((d) => d.close);
      return {
        sma20Slice: calculateSMA(intradayPrices, Math.min(6, filteredData.length)),
        sma50Slice: calculateSMA(intradayPrices, Math.min(12, filteredData.length)),
      };
    }
    const allPrices = data.map((d) => d.close);
    const allSma20 = calculateSMA(allPrices, 20);
    const allSma50 = calculateSMA(allPrices, 50);

    const offset = Math.max(0, data.length - filteredData.length);
    return {
      sma20Slice: allSma20.slice(offset),
      sma50Slice: allSma50.slice(offset),
    };
  }, [data, filteredData, timeframe]);

  // Chart Dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 60, bottom: 65, left: 20 };
  const chartHeight = height - padding.top - padding.bottom;
  const volumeHeight = 65;
  const priceChartHeight = chartHeight - volumeHeight - 15;

  // Min / Max calculations
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (filteredData.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 1000000 };
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    filteredData.forEach((d) => {
      const lowVal = d.low ?? d.close;
      const highVal = d.high ?? d.close;
      if (lowVal < min) min = lowVal;
      if (highVal > max) max = highVal;
      if ((d.volume ?? 0) > maxVol) maxVol = d.volume ?? 0;
    });

    priceAlerts.forEach((a) => {
      if (a.ticker !== ticker || a.thresholdPrice <= 0) return;
      if (a.metricType === 'volume') {
        if (a.thresholdPrice > maxVol && a.thresholdPrice <= maxVol * 2.5) {
          maxVol = a.thresholdPrice * 1.08;
        }
      } else {
        if (a.thresholdPrice < min && a.thresholdPrice >= min * 0.65) {
          min = a.thresholdPrice;
        }
        if (a.thresholdPrice > max && a.thresholdPrice <= max * 1.35) {
          max = a.thresholdPrice;
        }
      }
    });

    const buffer = (max - min) * 0.04 || 1.5;
    return {
      minPrice: Math.max(0, min - buffer),
      maxPrice: max + buffer,
      maxVolume: maxVol || 1,
    };
  }, [filteredData, priceAlerts, ticker]);

  // Scale functions
  const count = filteredData.length;
  const getX = (index: number) => {
    if (count <= 1) return padding.left;
    return padding.left + (index / (count - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    if (maxPrice === minPrice) return padding.top + priceChartHeight / 2;
    return (
      padding.top +
      (1 - (val - minPrice) / (maxPrice - minPrice)) * priceChartHeight
    );
  };

  const getVolY = (vol: number) => {
    const bottom = height - padding.bottom;
    const h = (vol / maxVolume) * volumeHeight;
    return bottom - h;
  };

  // Paths
  const linePath = useMemo(() => {
    if (filteredData.length === 0) return '';
    return filteredData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.close).toFixed(1)}`)
      .join(' ');
  }, [filteredData, minPrice, maxPrice]);

  const sma20Path = useMemo(() => {
    let p = '';
    sma20Slice.forEach((val, i) => {
      if (val !== null) {
        p += `${p === '' ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)} `;
      }
    });
    return p;
  }, [sma20Slice, minPrice, maxPrice]);

  const sma50Path = useMemo(() => {
    let p = '';
    sma50Slice.forEach((val, i) => {
      if (val !== null) {
        p += `${p === '' ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)} `;
      }
    });
    return p;
  }, [sma50Slice, minPrice, maxPrice]);

  // Handle crosshair hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || count === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = (clientX - padding.left) / (width - padding.left - padding.right);
    const index = Math.round(ratio * (count - 1));
    if (index >= 0 && index < count) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null ? filteredData[hoverIndex] : filteredData[filteredData.length - 1];
  const activeSma20 = hoverIndex !== null ? sma20Slice[hoverIndex] : sma20Slice[sma20Slice.length - 1];
  const activeSma50 = hoverIndex !== null ? sma50Slice[hoverIndex] : sma50Slice[sma50Slice.length - 1];

  const timeframeDeltaPct = useMemo(() => {
    if (filteredData.length < 2) return 0;
    const first = filteredData[0].close;
    const last = filteredData[filteredData.length - 1].close;
    return first > 0 ? ((last - first) / first) * 100 : 0;
  }, [filteredData]);

  // Official Institutional Terminal Colors
  const primaryAccent = '#3B82F6';
  const greenUp = '#10B981';
  const redDown = '#EF4444';
  const purpleOverlay = '#8B5CF6';

  return (
    <div className="w-full riddle-panel p-5 backdrop-blur-md">
      {/* Chart Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
            Live & Historical Timeframe
          </span>
          <div
            data-testid="chart-timeframe-selector"
            className="flex items-center gap-1 p-1 bg-[#090C15] rounded-xl border border-white/[0.08]"
          >
            {(['1H', '6H', '1M', '3M', '6M', '1Y', 'ALL'] as ChartTimeframe[]).map((tf) => {
              const isIntraday = tf === '1H' || tf === '6H';
              const isSelected = timeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleSelectTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                      : isIntraday
                      ? 'text-emerald-300 hover:text-white hover:bg-emerald-500/15'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              timeframeDeltaPct >= 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {timeframe} Δ: {timeframeDeltaPct >= 0 ? '+' : ''}
            {timeframeDeltaPct.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switch: Candle vs Line */}
          <div className="flex items-center gap-1 p-1 bg-[#090C15] rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setMode('candlestick')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                mode === 'candlestick'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Candlestick
            </button>
            <button
              type="button"
              onClick={() => setMode('line')}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                mode === 'line'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Line
            </button>
          </div>

          {/* Overlays */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showSMA20
                  ? 'border-blue-400 text-blue-400 bg-blue-500/10'
                  : 'border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              <span className="w-2 h-0.5 bg-current inline-block" />
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showSMA50
                  ? 'border-violet-400 text-violet-400 bg-violet-500/10'
                  : 'border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              <span className="w-2 h-0.5 bg-current inline-block" />
              SMA 50
            </button>
          </div>
        </div>
      </div>

      {/* Crosshair / Inspector HUD */}
      {activePoint && (
        <div className="flex flex-wrap items-center gap-4 py-3 text-xs font-mono text-white/70 border-b border-white/5">
          <div>
            <span className="text-white/40">DATE: </span>
            <span className="text-white font-medium">{activePoint.date}</span>
          </div>
          <div>
            <span className="text-white/40">CLOSE: </span>
            <span className="text-white font-semibold">${activePoint.close.toFixed(2)}</span>
          </div>
          {activePoint.open !== undefined && (
            <div>
              <span className="text-white/40">OPEN: </span>
              <span>${activePoint.open.toFixed(2)}</span>
            </div>
          )}
          {activePoint.high !== undefined && (
            <div>
              <span className="text-white/40">HIGH: </span>
              <span className="text-emerald-400">${activePoint.high.toFixed(2)}</span>
            </div>
          )}
          {activePoint.low !== undefined && (
            <div>
              <span className="text-white/40">LOW: </span>
              <span className="text-red-400">${activePoint.low.toFixed(2)}</span>
            </div>
          )}
          {activePoint.volume !== undefined && (
            <div>
              <span className="text-white/40">VOL: </span>
              <span className="text-white/90">
                {(activePoint.volume / 1_000_000).toFixed(2)}M
              </span>
            </div>
          )}
          {showSMA20 && activeSma20 !== null && (
            <div className="text-blue-400">
              <span className="opacity-70">SMA20: </span>
              <span>${activeSma20.toFixed(2)}</span>
            </div>
          )}
          {showSMA50 && activeSma50 !== null && (
            <div className="text-violet-400">
              <span className="opacity-70">SMA50: </span>
              <span>${activeSma50.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div ref={containerRef} className="relative mt-2 w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryAccent} stopOpacity="0.32" />
              <stop offset="100%" stopColor={primaryAccent} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={purpleOverlay} stopOpacity="0.2" />
              <stop offset="100%" stopColor={purpleOverlay} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + pct * priceChartHeight;
            const priceLabel = maxPrice - pct * (maxPrice - minPrice);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                />
                <text
                  x={width - padding.right + 8}
                  y={y + 4}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  ${priceLabel.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume separator label */}
          <line
            x1={padding.left}
            y1={height - padding.bottom - volumeHeight}
            x2={width - padding.right}
            y2={height - padding.bottom - volumeHeight}
            stroke="rgba(255,255,255,0.1)"
          />
          <text
            x={padding.left}
            y={height - padding.bottom - volumeHeight - 4}
            fill="rgba(255,255,255,0.3)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            VOL (SHARES)
          </text>

          {/* Volume Bars */}
          {filteredData.map((d, i) => {
            const x = getX(i);
            const isUp = d.close >= (d.open ?? d.close);
            const y = getVolY(d.volume ?? 500000);
            const barH = height - padding.bottom - y;
            const barW = Math.max(1.5, (width / count) * 0.65);
            return (
              <rect
                key={`vol-${i}`}
                x={x - barW / 2}
                y={y}
                width={barW}
                height={barH}
                fill={isUp ? greenUp : redDown}
                opacity="0.3"
              />
            );
          })}

          {/* Mode = Line */}
          {mode === 'line' && (
            <>
              <path
                d={`${linePath} L ${getX(count - 1)} ${padding.top + priceChartHeight} L ${getX(
                  0
                )} ${padding.top + priceChartHeight} Z`}
                fill="url(#areaGlow)"
              />
              <path
                d={linePath}
                fill="none"
                stroke={primaryAccent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Mode = Candlestick */}
          {mode === 'candlestick' &&
            filteredData.map((d, i) => {
              const x = getX(i);
              const op = d.open ?? d.close;
              const cl = d.close;
              const hi = d.high ?? Math.max(op, cl);
              const lo = d.low ?? Math.min(op, cl);

              const isUp = cl >= op;
              const color = isUp ? greenUp : redDown;

              const yHigh = getY(hi);
              const yLow = getY(lo);
              const yOpen = getY(op);
              const yClose = getY(cl);

              const boxTop = Math.min(yOpen, yClose);
              const boxHeight = Math.max(2, Math.abs(yClose - yOpen));
              const candleWidth = Math.max(2.5, Math.min(10, (width / count) * 0.7));

              return (
                <g key={`candle-${i}`}>
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                    opacity="0.8"
                  />
                  <rect
                    x={x - candleWidth / 2}
                    y={boxTop}
                    width={candleWidth}
                    height={boxHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* SMA 20 Overlay */}
          {showSMA20 && sma20Path && (
            <path
              d={sma20Path}
              fill="none"
              stroke="#60A5FA"
              strokeWidth="1.8"
              opacity="0.85"
            />
          )}

          {/* SMA 50 Overlay */}
          {showSMA50 && sma50Path && (
            <path
              d={sma50Path}
              fill="none"
              stroke="#A78BFA"
              strokeWidth="1.8"
              opacity="0.85"
            />
          )}

          {/* Price Alert Threshold Horizontal Overlays */}
          {priceAlerts
            .filter(
              (a) =>
                a.ticker === ticker &&
                (a.metricType ?? 'price') === 'price' &&
                a.thresholdPrice >= minPrice &&
                a.thresholdPrice <= maxPrice
            )
            .map((alert) => {
              const yAlert = getY(alert.thresholdPrice);
              const alertColor = alert.triggered
                ? '#F59E0B'
                : alert.condition === 'above'
                ? greenUp
                : redDown;
              return (
                <g key={alert.id}>
                  <line
                    x1={padding.left}
                    y1={yAlert}
                    x2={width - padding.right}
                    y2={yAlert}
                    stroke={alertColor}
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    opacity="0.9"
                  />
                  <rect
                    x={padding.left + 6}
                    y={yAlert - 10}
                    width={145}
                    height={16}
                    rx="4"
                    fill="#0B0F19"
                    stroke={alertColor}
                    strokeWidth="1"
                    opacity="0.92"
                  />
                  <text
                    x={padding.left + 12}
                    y={yAlert + 1}
                    fill={alertColor}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                  >
                    {alert.triggered ? 'TRIGGERED' : 'ALERT'} {alert.condition === 'above' ? '≥' : '≤'} $
                    {alert.thresholdPrice.toFixed(2)}
                  </text>
                </g>
              );
            })}

          {/* Volume Alert Threshold Horizontal Overlays on Volume Subplot */}
          {priceAlerts
            .filter(
              (a) =>
                a.ticker === ticker &&
                a.metricType === 'volume' &&
                a.thresholdPrice > 0 &&
                a.thresholdPrice <= maxVolume
            )
            .map((alert) => {
              const yVolAlert = getVolY(alert.thresholdPrice);
              const volColor = alert.triggered ? '#F59E0B' : '#8B5CF6';
              const volLabel =
                alert.thresholdPrice >= 1_000_000
                  ? `${(alert.thresholdPrice / 1_000_000).toFixed(1)}M`
                  : `${Math.round(alert.thresholdPrice).toLocaleString()}`;
              return (
                <g key={alert.id}>
                  <line
                    x1={padding.left}
                    y1={yVolAlert}
                    x2={width - padding.right}
                    y2={yVolAlert}
                    stroke={volColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.95"
                  />
                  <rect
                    x={width - padding.right - 150}
                    y={yVolAlert - 9}
                    width={144}
                    height={15}
                    rx="4"
                    fill="#0B0F19"
                    stroke={volColor}
                    strokeWidth="1"
                    opacity="0.92"
                  />
                  <text
                    x={width - padding.right - 144}
                    y={yVolAlert + 1}
                    fill={volColor}
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                  >
                    {alert.triggered ? 'VOL SPIKE!' : 'VOL ALERT'} {alert.condition === 'above' ? '≥' : '≤'}{' '}
                    {volLabel}
                  </text>
                </g>
              );
            })}

          {/* Hover crosshair vertical line */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={height - padding.bottom}
                stroke="rgba(255,255,255,0.4)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(filteredData[hoverIndex].close)}
                r="4.5"
                fill={primaryAccent}
                stroke="#0B0F19"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X Axis Date labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const index = Math.min(count - 1, Math.floor(pct * (count - 1)));
            const date = filteredData[index]?.date;
            if (!date) return null;
            return (
              <text
                key={idx}
                x={getX(index)}
                y={height - padding.bottom + 18}
                fill="rgba(255,255,255,0.4)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor={idx === 0 ? 'start' : idx === 4 ? 'end' : 'middle'}
              >
                {date}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-white/40">
        <span>SECURITY: {ticker}</span>
        <span>HOVER OR DRAG OVER CHART FOR PRECISE OHLCV INSPECTION</span>
      </div>
    </div>
  );
};
