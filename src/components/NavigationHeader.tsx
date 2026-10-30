/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Top Bar Component
 * Conforms to Top Bar Contract: 3 zones, single-line typography, zero dead clicks.
 */

import React from 'react';
import { OllamaConfig } from '../types/market';
import { Settings, Moon, Sun, Sparkles, Terminal } from 'lucide-react';

interface NavigationHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isHalloween: boolean;
  setIsHalloween: (val: boolean) => void;
  ollamaConfig: OllamaConfig;
  onOpenSettings: () => void;
  onOpenHacktoberfest: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  setActiveTab,
  isHalloween,
  setIsHalloween,
  ollamaConfig,
  onOpenSettings,
  onOpenHacktoberfest,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'analyst', label: 'AI Analyst' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'risk', label: 'Risk Model' },
    { id: 'report', label: 'AI Report' },
    { id: 'hacktoberfest', label: 'Code & Docs' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090B0F]/90 backdrop-blur-md px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm tracking-tighter transition-all ${
                isHalloween
                  ? 'bg-gradient-to-br from-[#FF7518] to-[#9B5DE5] text-black shadow-[0_0_15px_rgba(255,117,24,0.4)]'
                  : 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
              }`}
            >
              M
            </div>
            <div>
              <span className="text-base font-display font-bold tracking-tight text-white whitespace-nowrap block leading-tight">
                MARKETMIND AI
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-white/40 block leading-none mt-0.5">
                {isHalloween ? 'Midnight Market Edition' : 'Standard Terminal'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium text-white/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'hacktoberfest') {
                    onOpenHacktoberfest();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`py-1 transition-all whitespace-nowrap shrink-0 hover:text-white ${
                  isActive
                    ? isHalloween
                      ? 'text-[#FF7518] border-b-2 border-[#FF7518]'
                      : 'text-blue-400 border-b-2 border-blue-400'
                    : 'border-b-2 border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* AI Engine Status Indicator */}
          <button
            onClick={onOpenSettings}
            title={`Ollama Engine: ${ollamaConfig.isConnected ? 'Connected' : 'Disconnected (Localhost Windows 11)'}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-xs font-mono transition-all text-left"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                ollamaConfig.isConnected
                  ? 'bg-[#42C98B] shadow-[0_0_8px_#42C98B]'
                  : 'bg-[#FF5468]'
              }`}
            />
            <span className="hidden sm:inline text-white/90 font-medium whitespace-nowrap">
              GEMMA 4:31B CLOUD
            </span>
            <span className={`text-[10px] font-bold ${
              ollamaConfig.isConnected ? 'text-[#42C98B]' : 'text-[#FF5468]'
            }`}>
              {ollamaConfig.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
            <Settings className="w-3.5 h-3.5 text-white/40 ml-0.5" />
          </button>

          {/* Theme Switcher Toggle (Halloween vs Standard Terminal) */}
          <button
            onClick={() => setIsHalloween(!isHalloween)}
            title={isHalloween ? 'Switch to Standard Financial Terminal' : 'Switch to Midnight Market Halloween Edition'}
            className={`p-2 rounded-lg border transition-all ${
              isHalloween
                ? 'bg-[#FF7518]/15 border-[#FF7518]/40 text-[#FF7518] hover:bg-[#FF7518]/25'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isHalloween ? <Sparkles className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
          </button>

          {/* Codebase / Hacktoberfest Modal Trigger */}
          <button
            onClick={onOpenHacktoberfest}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md whitespace-nowrap ${
              isHalloween
                ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D]'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            Hacktoberfest 2026
          </button>
        </div>
      </div>
    </header>
  );
};
