/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Hero Section
 * Inspired by Japanese minimalism & editorial presentation of havu.cc.
 */

import React from 'react';
import { OllamaConfig, AssetMetrics } from '../types/market';
import { ArrowRight, Bot, ShieldAlert, Cpu, Sparkles, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onLaunchAnalysis: () => void;
  onExploreAI: () => void;
  ollamaConfig: OllamaConfig;
  isHalloween: boolean;
  assetSummaries: AssetMetrics[];
  activeTicker: string;
  onSelectTicker: (ticker: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchAnalysis,
  onExploreAI,
  ollamaConfig,
  isHalloween,
  assetSummaries,
  activeTicker,
  onSelectTicker,
}) => {
  return (
    <section className="relative z-10 w-full pt-12 pb-16 px-6 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Seasonal Dashboard Banner */}
        {isHalloween && (
          <div className="mb-8 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FF7518]/10 border border-[#FF7518]/30 text-xs font-mono text-[#FF7518]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold tracking-wider uppercase">Hacktoberfest 2026 Special</span>
            <span className="text-white/40">·</span>
            <span className="text-white/80">Midnight Market Edition</span>
            <span className="text-white/40">·</span>
            <span className="text-white/60">Gemma 4 + Ollama Open-Source AI</span>
          </div>
        )}

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-6">
            {/* Tagline / Subtitle */}
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.25em] font-mono text-white/50 block">
                {isHalloween ? 'MIDNIGHT MARKET EDITION' : 'OPEN FINANCIAL INTELLIGENCE'}
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.05] text-balance">
                THE MARKETS <br className="hidden sm:inline" />
                NEVER SLEEP.
              </h1>
            </div>

            {/* Secondary Headline */}
            <h2 className={`text-xl sm:text-2xl font-mono tracking-tight font-medium ${
              isHalloween ? 'text-[#FF7518]' : 'text-blue-400'
            }`}>
              "READ THE SIGNAL. QUESTION THE NOISE."
            </h2>

            {/* Editorial Description */}
            <p className="text-base sm:text-lg text-white/70 max-w-2xl leading-relaxed font-sans">
              An open-source financial intelligence platform powered by Google Gemma and Ollama. Analyze
              market data, understand financial risks, and explore economic trends through AI.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchAnalysis}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-lg cursor-pointer ${
                  isHalloween
                    ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D] shadow-[#FF7518]/20'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                <span>Launch Market Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreAI}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#9B5DE5]" />
                <span>Explore AI Intelligence</span>
              </button>
            </div>

            {/* Model Connection Indicator */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg bg-black/40 border border-white/10">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-white/60">AI MODEL:</span>
                  <span className="text-white font-semibold">GEMMA 4:31B CLOUD</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">PROVIDER:</span>
                  <span className="text-white font-semibold">OLLAMA</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ollamaConfig.isConnected
                        ? 'bg-[#42C98B] shadow-[0_0_8px_#42C98B]'
                        : 'bg-[#FF5468]'
                    }`}
                  />
                  <span className="text-white/60">CONNECTION STATUS:</span>
                  <span
                    className={`font-semibold ${
                      ollamaConfig.isConnected ? 'text-[#42C98B]' : 'text-[#FF5468]'
                    }`}
                  >
                    {ollamaConfig.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Hero Card / Live Ticker Strip */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-[#161920]/90 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest font-mono text-white/40">
                  Active Asset Benchmark
                </span>
                <span className="text-[11px] font-mono text-[#42C98B] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  252 SESSIONS
                </span>
              </div>

              {/* Ticker Selector in Hero Card */}
              <div className="grid grid-cols-3 gap-2 my-4">
                {assetSummaries.slice(0, 6).map((asset) => {
                  const isSelected = asset.ticker === activeTicker;
                  const isUp = asset.totalReturnPct >= 0;
                  return (
                    <button
                      key={asset.ticker}
                      onClick={() => onSelectTicker(asset.ticker)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? isHalloween
                            ? 'bg-[#FF7518]/20 border-[#FF7518] text-white'
                            : 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold">{asset.ticker}</div>
                      <div
                        className={`text-[11px] font-mono font-semibold mt-0.5 ${
                          isUp ? 'text-[#42C98B]' : 'text-[#FF5468]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {asset.totalReturnPct.toFixed(1)}%
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-xs font-mono text-white/50 leading-relaxed border-t border-white/10">
                Select any ticker to populate the mathematical indicators, risk models, and Gemma 4
                briefing stream.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
