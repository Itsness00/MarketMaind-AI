/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Main Application Entry Point
 * Midnight Market Edition — Hacktoberfest 2026
 * Powered by Google Gemma 4 and Ollama
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  generateDeterministicDemonstrationData,
  DEMO_ASSETS,
  SIMULATION_DISCLAIMER,
} from './data/demonstrationData';
import { computeAssetMetrics } from './utils/analytics';
import { testOllamaConnection, DEFAULT_OLLAMA_CONFIG } from './utils/aiEngine';
import { MarketDataPoint, AssetMetrics, OllamaConfig } from './types/market';
import { NavigationHeader } from './components/NavigationHeader';
import { HeroSection } from './components/HeroSection';
import { MarketOverview } from './components/MarketOverview';
import { AIAnalystSection } from './components/AIAnalystSection';
import { FinancialAnalyticsSection } from './components/FinancialAnalyticsSection';
import { RiskAnalysisSection } from './components/RiskAnalysisSection';
import { ReportSection } from './components/ReportSection';
import { HalloweenAmbience } from './components/HalloweenAmbience';
import { OllamaSettingsModal } from './components/OllamaSettingsModal';
import { HacktoberfestModal } from './components/HacktoberfestModal';
import {
  BarChart2,
  Bot,
  Activity,
  ShieldAlert,
  FileText,
  Github,
  Terminal,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [isHalloween, setIsHalloween] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeTicker, setActiveTicker] = useState<string>('NVDA');

  // Datasets state
  const [dataPoints, setDataPoints] = useState<Record<string, MarketDataPoint[]>>(() =>
    generateDeterministicDemonstrationData()
  );
  const [currentProvenance, setCurrentProvenance] = useState<string>(
    'Deterministic Synthetic Benchmark (252 Trading Sessions)'
  );

  // Ollama Config State
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>(DEFAULT_OLLAMA_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHacktoberfestOpen, setIsHacktoberfestOpen] = useState(false);

  // Name map
  const tickerNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    DEMO_ASSETS.forEach((a) => {
      map[a.ticker] = a.name;
    });
    return map;
  }, []);

  // Compute metrics for all available tickers
  const assetSummaries = useMemo<AssetMetrics[]>(() => {
    const tickers = Object.keys(dataPoints);
    return tickers
      .map((t) => {
        try {
          return computeAssetMetrics(dataPoints[t], tickerNameMap);
        } catch {
          return null;
        }
      })
      .filter((m): m is AssetMetrics => m !== null);
  }, [dataPoints, tickerNameMap]);

  // Active Metric & Peers
  const activeMetric = useMemo(() => {
    return assetSummaries.find((a) => a.ticker === activeTicker) || assetSummaries[0];
  }, [assetSummaries, activeTicker]);

  const peerMetrics = useMemo(() => {
    return assetSummaries.filter((a) => a.ticker !== activeTicker);
  }, [assetSummaries, activeTicker]);

  // Probe Ollama connection on mount
  useEffect(() => {
    let isMounted = true;
    testOllamaConnection().then((res) => {
      if (isMounted) {
        setOllamaConfig((prev) => ({
          ...prev,
          isConnected: res.connected,
          model: res.model || 'gemma4:31b-cloud',
          provider: res.provider || 'Ollama',
          isCloudSandbox: res.isCloudSandbox,
          modelAvailable: res.modelAvailable,
          modelsFound: res.modelsFound,
          message: res.message,
          lastChecked: new Date().toLocaleTimeString(),
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle custom dataset load
  const handleLoadCustomDataset = (
    newDatasets: Record<string, MarketDataPoint[]>,
    provenance: string
  ) => {
    setDataPoints(newDatasets);
    setCurrentProvenance(provenance);
    const firstTicker = Object.keys(newDatasets)[0];
    if (firstTicker) {
      setActiveTicker(firstTicker);
    }
  };

  // Reset to default demo data
  const handleResetToDemo = () => {
    const defaultData = generateDeterministicDemonstrationData();
    setDataPoints(defaultData);
    setCurrentProvenance('Deterministic Synthetic Benchmark (252 Trading Sessions)');
    setActiveTicker('NVDA');
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col transition-colors selection:bg-[#FF7518]/30 selection:text-[#FF7518] ${
        isHalloween ? 'bg-[#090B0F] text-[#F4F1EA]' : 'bg-[#0B0F19] text-[#F1F5F9]'
      }`}
    >
      {/* Ambient Seasonal Halloween Effects */}
      <HalloweenAmbience isHalloween={isHalloween} />

      {/* Top Bar Navigation */}
      <NavigationHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isHalloween={isHalloween}
        setIsHalloween={setIsHalloween}
        ollamaConfig={ollamaConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHacktoberfest={() => setIsHacktoberfestOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection
        onLaunchAnalysis={() => setActiveTab('overview')}
        onExploreAI={() => setActiveTab('analyst')}
        ollamaConfig={ollamaConfig}
        isHalloween={isHalloween}
        assetSummaries={assetSummaries}
        activeTicker={activeTicker}
        onSelectTicker={(t) => {
          setActiveTicker(t);
          setActiveTab('overview');
        }}
      />

      {/* Main Content Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 relative z-10 space-y-10">
        {/* Navigation Tabs Bar for Dashboard Sections */}
        <div className="flex items-center gap-2 p-1.5 bg-[#161920]/80 rounded-xl border border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: 'Section A: Market Overview', icon: BarChart2 },
            { id: 'analyst', label: 'Section B: AI Market Analyst', icon: Bot },
            { id: 'analytics', label: 'Section C: Financial Analytics', icon: Activity },
            { id: 'risk', label: 'Section D: Market Risk Analysis', icon: ShieldAlert },
            { id: 'report', label: 'Section E: AI Financial Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? isHalloween
                      ? 'bg-[#FF7518] text-black font-bold shadow-md'
                      : 'bg-blue-600 text-white font-bold shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section View Routing */}
        {activeTab === 'overview' && (
          <MarketOverview
            dataPoints={dataPoints}
            assetSummaries={assetSummaries}
            activeTicker={activeTicker}
            setActiveTicker={setActiveTicker}
            isHalloween={isHalloween}
            onLoadCustomDataset={handleLoadCustomDataset}
            onResetToDemo={handleResetToDemo}
            currentProvenance={currentProvenance}
          />
        )}

        {activeTab === 'analyst' && activeMetric && (
          <AIAnalystSection
            activeMetric={activeMetric}
            peerMetrics={peerMetrics}
            ollamaConfig={ollamaConfig}
            isHalloween={isHalloween}
            onNavigateToReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'analytics' && activeMetric && (
          <FinancialAnalyticsSection
            activeMetric={activeMetric}
            peerMetrics={peerMetrics}
            isHalloween={isHalloween}
          />
        )}

        {activeTab === 'risk' && activeMetric && (
          <RiskAnalysisSection
            activeMetric={activeMetric}
            peerMetrics={peerMetrics}
            allDatasets={dataPoints}
            isHalloween={isHalloween}
          />
        )}

        {activeTab === 'report' && activeMetric && (
          <ReportSection
            activeMetric={activeMetric}
            peerMetrics={peerMetrics}
            currentProvenance={currentProvenance}
            isHalloween={isHalloween}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#090B0F]/90 px-6 py-8 mt-16 relative z-10 text-xs font-mono text-white/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-sm">MARKETMIND AI</span>
              <span>·</span>
              <span>Midnight Market Edition</span>
            </div>
            <p className="text-[11px] text-white/40">
              Read the Signal. Question the Noise. Built for Hacktoberfest 2026.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsHacktoberfestOpen(true)}
              className="hover:text-white transition-colors"
            >
              Architecture & Python Code
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Ollama Configuration
            </button>
            <span className="text-white/30">MIT License</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <OllamaSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={ollamaConfig}
        onSaveConfig={setOllamaConfig}
        isHalloween={isHalloween}
      />

      {/* Hacktoberfest Showcase Modal */}
      <HacktoberfestModal
        isOpen={isHacktoberfestOpen}
        onClose={() => setIsHacktoberfestOpen(false)}
        isHalloween={isHalloween}
      />
    </div>
  );
}
