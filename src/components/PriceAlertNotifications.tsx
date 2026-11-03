/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Visual On-Screen Price & Volume Alert Notification Banner & Toast Stack
 */

import React from 'react';
import { AlertNotification } from '../types/market';
import { BellRing, TrendingUp, TrendingDown, BarChart2, X, ArrowRight, CheckCheck } from 'lucide-react';

interface PriceAlertNotificationsProps {
  notifications: AlertNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onSelectTicker: (ticker: string) => void;
}

export function formatAlertMetricValue(val: number, metricType: 'price' | 'volume' = 'price'): string {
  if (metricType === 'volume') {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M shares`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K shares`;
    return `${Math.round(val).toLocaleString()} shares`;
  }
  return `$${val.toFixed(2)}`;
}

export const PriceAlertNotifications: React.FC<PriceAlertNotificationsProps> = ({
  notifications,
  onDismiss,
  onDismissAll,
  onSelectTicker,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      data-testid="bottom-alert-stack"
      className="fixed bottom-5 right-4 sm:right-6 z-50 w-full max-w-md flex flex-col gap-3 pointer-events-none"
    >
      {/* Batch Header when multiple notifications are visible */}
      {notifications.length > 1 && (
        <div className="pointer-events-auto flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0E1320]/95 border border-white/15 shadow-2xl backdrop-blur-xl text-[11px] font-mono animate-pop-bottom">
          <span className="text-white font-bold flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
            <span>{notifications.length} MARKET ALERTS POPPED (BOTTOM FEED)</span>
          </span>
          <button
            onClick={onDismissAll}
            className="flex items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Dismiss All</span>
          </button>
        </div>
      )}

      {notifications.map((notif) => {
        const isVolume = notif.metricType === 'volume';
        const isAbove = notif.condition === 'above';
        const deltaPct =
          notif.thresholdPrice > 0
            ? ((notif.currentPrice - notif.thresholdPrice) / notif.thresholdPrice) * 100
            : 0;

        return (
          <div
            key={notif.id}
            role="alert"
            className={`pointer-events-auto rounded-2xl p-4 border shadow-2xl backdrop-blur-xl transition-all animate-pop-bottom ${
              isVolume
                ? 'bg-[#05070D]/95 border-white/60 shadow-[0_12px_35px_rgba(37,99,235,0.35)]'
                : isAbove
                ? 'bg-[#050A14]/95 border-blue-500/70 shadow-[0_12px_35px_rgba(37,99,235,0.32)]'
                : 'bg-[#120608]/95 border-red-500/70 shadow-[0_12px_35px_rgba(220,38,38,0.32)]'
            }`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/15">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isVolume
                      ? 'bg-white text-black border border-blue-500'
                      : isAbove
                      ? 'bg-blue-600/25 text-blue-400 border border-blue-500/50'
                      : 'bg-red-600/25 text-red-400 border border-red-500/50'
                  }`}
                >
                  {isVolume ? (
                    <BarChart2 className="w-4 h-4" />
                  ) : isAbove ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        isVolume
                          ? 'bg-white text-black'
                          : isAbove
                          ? 'bg-blue-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {isVolume ? 'VOLUME SPIKE ALERT' : 'PRICE ALERT TRIGGERED'}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      {notif.timestamp}
                    </span>
                  </div>
                  <h4 className="text-sm font-display font-extrabold text-white mt-0.5">
                    {notif.ticker} {isVolume ? 'Volume' : 'Price'} Crossed{' '}
                    {isAbove ? 'Above' : 'Below'}{' '}
                    {formatAlertMetricValue(notif.thresholdPrice, notif.metricType)}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => onDismiss(notif.id)}
                title="Dismiss alert"
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Crossing Details */}
            <div className="py-2.5 grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 rounded-lg bg-black/60 border border-white/10">
                <span className="text-[10px] text-white/50 block uppercase">
                  {isVolume ? 'Volume Threshold' : 'Target Threshold'}
                </span>
                <span className="text-white font-bold">
                  {isAbove ? '≥' : '≤'}{' '}
                  {formatAlertMetricValue(notif.thresholdPrice, notif.metricType)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/60 border border-white/10">
                <span className="text-[10px] text-white/50 block uppercase">
                  {isVolume ? 'Observed Volume' : 'Updated Market Price'}
                </span>
                <span
                  className={`font-bold ${
                    isVolume
                      ? 'text-white'
                      : isAbove
                      ? 'text-blue-400'
                      : 'text-red-400'
                  }`}
                >
                  {formatAlertMetricValue(notif.currentPrice, notif.metricType)}{' '}
                  <span className="text-[10px] opacity-80">
                    ({deltaPct >= 0 ? '+' : ''}
                    {deltaPct.toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>

            {notif.note && (
              <div className="text-[11px] font-mono text-white/75 bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5 mb-2.5">
                Note: "{notif.note}"
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-1 text-xs font-mono">
              <button
                onClick={() => {
                  onSelectTicker(notif.ticker);
                  onDismiss(notif.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
              >
                <span>Inspect {notif.ticker} Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDismiss(notif.id)}
                className="px-2.5 py-1.5 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
