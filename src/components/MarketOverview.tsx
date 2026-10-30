/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Section A: Market Overview
 * Handles dataset switching, CSV upload & validation, asset comparison table, and interactive charting.
 */

import React, { useState } from 'react';
import { MarketDataPoint, AssetMetrics } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import {
  parseAndValidateCSV,
  generateSampleCSVString,
  SIMULATION_DISCLAIMER,
  CSVValidationResult,
} from '../data/demonstrationData';
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Search,
} from 'lucide-react';

interface MarketOverviewProps {
  dataPoints: Record<string, MarketDataPoint[]>;
  assetSummaries: AssetMetrics[];
  activeTicker: string;
  setActiveTicker: (ticker: string) => void;
  isHalloween: boolean;
  onLoadCustomDataset: (newDatasets: Record<string, MarketDataPoint[]>, provenance: string) => void;
  onResetToDemo: () => void;
  currentProvenance: string;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  dataPoints,
  assetSummaries,
  activeTicker,
  setActiveTicker,
  isHalloween,
  onLoadCustomDataset,
  onResetToDemo,
  currentProvenance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'ticker' | 'totalReturnPct' | 'annualizedVolatility' | 'sharpeRatio'>('totalReturnPct');
  const [sortAsc, setSortAsc] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const activeData = dataPoints[activeTicker] || [];
  const activeMetric = assetSummaries.find((a) => a.ticker === activeTicker) || assetSummaries[0];

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    // Limit upload size (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit. Please upload a smaller CSV dataset.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result: CSVValidationResult = parseAndValidateCSV(text);

      if (!result.isValid) {
        setUploadError(result.errors.join(' '));
        return;
      }

      // Group data by ticker
      const grouped: Record<string, MarketDataPoint[]> = {};
      result.data.forEach((pt) => {
        if (!grouped[pt.ticker]) grouped[pt.ticker] = [];
        grouped[pt.ticker].push(pt);
      });

      onLoadCustomDataset(
        grouped,
        `User Upload: ${file.name} (${result.tickersFound.join(', ')})`
      );
      setUploadSuccess(
        `Successfully loaded ${result.data.length} records across ${result.tickersFound.length} tickers [${result.tickersFound.join(', ')}].`
      );
      if (result.tickersFound.length > 0) {
        setActiveTicker(result.tickersFound[0]);
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      setUploadError('Failed to read the selected file from disk.');
    };

    reader.readAsText(file);
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const sample = generateSampleCSVString();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketmind_sample_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort table
  const filteredSummaries = assetSummaries
    .filter(
      (a) =>
        a.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  return (
    <section className="space-y-8">
      {/* Disclaimer Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-[#FF7518]/20 border border-[#FF7518]/40 text-[#FF7518] font-bold tracking-wider">
            {SIMULATION_DISCLAIMER}
          </span>
          <span className="text-white/60 hidden md:inline">
            Provenance: {currentProvenance}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV</span>
          </button>
          <button
            onClick={onResetToDemo}
            title="Reset to deterministic simulated dataset"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CSV Upload Dropzone Drawer */}
      {isUploading && (
        <div className="p-6 rounded-xl bg-[#161920] border border-white/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Upload Custom Financial CSV
            </h4>
            <span className="text-xs font-mono text-white/50">
              Required columns: <strong className="text-white">date, ticker, close</strong>
            </span>
          </div>

          <p className="text-xs text-white/70">
            Upload historical market prices to test Gemma's real-time dataset analysis. File is
            processed entirely client-side. Dates must be standard YYYY-MM-DD formats.
          </p>

          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 hover:border-[#FF7518]/60 rounded-xl cursor-pointer bg-black/20 hover:bg-black/40 transition-colors">
            <Upload className="w-8 h-8 text-[#FF7518] mb-2" />
            <span className="text-xs font-mono text-white font-medium">
              Click to select a CSV file or drag and drop here
            </span>
            <span className="text-[11px] font-mono text-white/40 mt-1">
              Supports .csv up to 10MB
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Price Chart & Active Metric Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                  {activeMetric?.ticker}
                </h3>
                <span className="text-xs font-mono text-white/60">
                  {activeMetric?.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-white/50 mt-1">
                <span>{activeMetric?.startDate} to {activeMetric?.endDate}</span>
                <span>·</span>
                <span>{activeMetric?.dataPointsCount} observations</span>
              </div>
            </div>

            {/* Quick Price KPI */}
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-white tracking-tight">
                ${activeMetric?.endPrice.toFixed(2)}
              </div>
              <div
                className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${
                  (activeMetric?.totalReturnPct ?? 0) >= 0 ? 'text-[#42C98B]' : 'text-[#FF5468]'
                }`}
              >
                {(activeMetric?.totalReturnPct ?? 0) >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {(activeMetric?.totalReturnPct ?? 0) >= 0 ? '+' : ''}
                  {activeMetric?.totalReturnPct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <InteractiveChart
            data={activeData}
            ticker={activeTicker}
            isHalloween={isHalloween}
          />
        </div>

        {/* Right Sidebar: Active Ticker Stat Cards */}
        <div className="lg:col-span-1 space-y-3">
          <div className="p-4 rounded-xl bg-[#161920] border border-white/10 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block">
              Performance Snapshot
            </span>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Start Price</span>
                <span className="text-white font-medium">${activeMetric?.startPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Total Return</span>
                <span
                  className={`font-bold ${
                    (activeMetric?.totalReturnPct ?? 0) >= 0 ? 'text-[#42C98B]' : 'text-[#FF5468]'
                  }`}
                >
                  {(activeMetric?.totalReturnPct ?? 0) >= 0 ? '+' : ''}
                  {activeMetric?.totalReturnPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Annual Volatility</span>
                <span className="text-white font-medium">
                  {activeMetric?.annualizedVolatility.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Max Drawdown</span>
                <span className="text-[#FF5468] font-bold">
                  {activeMetric?.maxDrawdownPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Sharpe Proxy (4.5%)</span>
                <span className="text-white font-medium">
                  {activeMetric?.sharpeRatio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">Calmar Ratio</span>
                <span className="text-white font-medium">
                  {activeMetric?.calmarRatio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-white/60">1-Day 95% VaR</span>
                <span className="text-white font-medium">
                  {activeMetric?.var95Pct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-white/60">SMA 50 / 200</span>
                <span className="text-white font-medium">
                  ${activeMetric?.currentSMA50.toFixed(1)} / ${activeMetric?.currentSMA200.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Best/Worst Session Callout */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-white/40">Best Day</span>
              <span className="text-[#42C98B] font-bold">
                +{activeMetric?.bestDay.returnPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[10px] text-white/40 text-right">
              {activeMetric?.bestDay.date}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-white/40">Worst Day</span>
              <span className="text-[#FF5468] font-bold">
                {activeMetric?.worstDay.returnPct.toFixed(2)}%
              </span>
            </div>
            <div className="text-[10px] text-white/40 text-right">
              {activeMetric?.worstDay.date}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Performance Comparison Table */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-bold text-white tracking-tight">
              Asset Performance Comparison
            </h3>
            <span className="text-xs font-mono text-white/50">
              Comparative metrics across active portfolio instruments
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search ticker or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#161920]/90">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/40 border-b border-white/10 text-white/60">
              <tr>
                <th
                  onClick={() => {
                    setSortField('ticker');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  Ticker
                </th>
                <th className="py-3 px-4">Entity</th>
                <th
                  onClick={() => {
                    setSortField('totalReturnPct');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  Total Return
                </th>
                <th
                  onClick={() => {
                    setSortField('annualizedVolatility');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  Volatility (Ann.)
                </th>
                <th className="py-3 px-4 text-right">Max Drawdown</th>
                <th
                  onClick={() => {
                    setSortField('sharpeRatio');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  Sharpe Proxy
                </th>
                <th className="py-3 px-4 text-right">Last Price</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filteredSummaries.map((summary) => {
                const isSelected = summary.ticker === activeTicker;
                const isUp = summary.totalReturnPct >= 0;
                return (
                  <tr
                    key={summary.ticker}
                    onClick={() => setActiveTicker(summary.ticker)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? isHalloween
                          ? 'bg-[#FF7518]/15 text-white'
                          : 'bg-blue-600/15 text-white'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white">{summary.ticker}</td>
                    <td className="py-3 px-4 text-white/70">{summary.name}</td>
                    <td
                      className={`py-3 px-4 text-right font-semibold ${
                        isUp ? 'text-[#42C98B]' : 'text-[#FF5468]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {summary.totalReturnPct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right">{summary.annualizedVolatility.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right text-[#FF5468]">
                      {summary.maxDrawdownPct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right">{summary.sharpeRatio.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-medium text-white">
                      ${summary.endPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTicker(summary.ticker);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                          isSelected
                            ? isHalloween
                              ? 'bg-[#FF7518] text-black'
                              : 'bg-blue-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Analyze'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
