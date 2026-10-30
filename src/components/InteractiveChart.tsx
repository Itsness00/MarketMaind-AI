/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Interactive Financial Chart
 * High-precision SVG chart with Candlestick/Line view, SMA overlays, volume bars, and crosshair tooltip.
 */

import React, { useState, useMemo, useRef } from 'react';
import { MarketDataPoint } from '../types/market';
import { calculateSMA } from '../utils/analytics';

interface InteractiveChartProps {
  data: MarketDataPoint[];
  ticker: string;
  isHalloween: boolean;
}

type ChartMode = 'candlestick' | 'line';
type Timeframe = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ data, ticker, isHalloween }) => {
  const [mode, setMode] = useState<ChartMode>('candlestick');
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter data by timeframe
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const count = data.length;
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
  }, [data, timeframe]);

  // Compute SMAs across the entire series to avoid edge drop-off, then slice
  const { sma20Slice, sma50Slice } = useMemo(() => {
    if (!data || data.length === 0) return { sma20Slice: [], sma50Slice: [] };
    const allPrices = data.map((d) => d.close);
    const allSma20 = calculateSMA(allPrices, 20);
    const allSma50 = calculateSMA(allPrices, 50);

    const offset = data.length - filteredData.length;
    return {
      sma20Slice: allSma20.slice(offset),
      sma50Slice: allSma50.slice(offset),
    };
  }, [data, filteredData]);

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

    // 4% headroom
    const buffer = (max - min) * 0.04 || 5;
    return {
      minPrice: Math.max(0, min - buffer),
      maxPrice: max + buffer,
      maxVolume: maxVol || 1,
    };
  }, [filteredData]);

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

  // Theme colors
  const primaryAccent = isHalloween ? '#FF7518' : '#3B82F6';
  const greenUp = isHalloween ? '#42C98B' : '#10B981';
  const redDown = isHalloween ? '#FF5468' : '#EF4444';
  const purpleOverlay = isHalloween ? '#9B5DE5' : '#8B5CF6';

  return (
    <div className="w-full bg-[#161920]/80 dark:bg-[#161920]/80 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-md">
      {/* Chart Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-white/50 font-mono">Timeframe</span>
          <div className="flex items-center p-1 bg-black/40 rounded-lg border border-white/5">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all whitespace-nowrap ${
                  timeframe === tf
                    ? isHalloween
                      ? 'bg-[#FF7518] text-black font-bold shadow-md'
                      : 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switch: Candle vs Line */}
          <div className="flex items-center p-1 bg-black/40 rounded-lg border border-white/5">
            <button
              onClick={() => setMode('candlestick')}
              className={`px-3 py-1 text-xs font-mono rounded transition-all whitespace-nowrap ${
                mode === 'candlestick'
                  ? isHalloween
                    ? 'bg-[#FF7518] text-black font-semibold'
                    : 'bg-blue-600 text-white font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Candlestick
            </button>
            <button
              onClick={() => setMode('line')}
              className={`px-3 py-1 text-xs font-mono rounded transition-all whitespace-nowrap ${
                mode === 'line'
                  ? isHalloween
                    ? 'bg-[#FF7518] text-black font-semibold'
                    : 'bg-blue-600 text-white font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Line
            </button>
          </div>

          {/* Overlays */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                showSMA20
                  ? isHalloween
                    ? 'border-[#FF7518] text-[#FF7518] bg-[#FF7518]/10'
                    : 'border-blue-400 text-blue-400 bg-blue-500/10'
                  : 'border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              <span className="w-2 h-0.5 bg-current inline-block" />
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                showSMA50
                  ? isHalloween
                    ? 'border-[#9B5DE5] text-[#9B5DE5] bg-[#9B5DE5]/10'
                    : 'border-purple-400 text-purple-400 bg-purple-500/10'
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
              <span className="text-[#42C98B]">${activePoint.high.toFixed(2)}</span>
            </div>
          )}
          {activePoint.low !== undefined && (
            <div>
              <span className="text-white/40">LOW: </span>
              <span className="text-[#FF5468]">${activePoint.low.toFixed(2)}</span>
            </div>
          )}
          {showSMA20 && activeSma20 !== null && (
            <div className="text-[#FF7518]">
              <span className="opacity-70">SMA20: </span>
              <span>${activeSma20.toFixed(2)}</span>
            </div>
          )}
          {showSMA50 && activeSma50 !== null && (
            <div className="text-[#9B5DE5]">
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
            const isUp = (d.close >= (d.open ?? d.close));
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
              {/* Area gradient under line */}
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
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                    opacity="0.8"
                  />
                  {/* Body */}
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
              stroke={isHalloween ? '#FF7518' : '#60A5FA'}
              strokeWidth="1.8"
              opacity="0.85"
            />
          )}

          {/* SMA 50 Overlay */}
          {showSMA50 && sma50Path && (
            <path
              d={sma50Path}
              fill="none"
              stroke={isHalloween ? '#9B5DE5' : '#A78BFA'}
              strokeWidth="1.8"
              opacity="0.85"
            />
          )}

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
                stroke="#090B0F"
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
        <span>ASSET: {ticker}</span>
        <span>HOVER OR DRAG OVER CHART FOR PRECISE OHLCV INSPECTION</span>
      </div>
    </div>
  );
};
