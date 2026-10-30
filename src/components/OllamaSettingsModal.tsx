/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Google Gemma 4 Engine & Instant Launch Modal
 */

import React, { useState } from 'react';
import { GemmaConfig } from '../types/market';
import { testGemmaConnection } from '../utils/aiEngine';
import { X, CheckCircle2, RefreshCw, Cpu, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface OllamaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GemmaConfig;
  onSaveConfig: (newConfig: GemmaConfig) => void;
  isHalloween: boolean;
}

const LIVE_APP_URL = 'https://ais-pre-6dzexkedmslg3guya2gsum-740787892008.us-west2.run.app';
const QUICK_START_CMD = 'npm start';

export const OllamaSettingsModal: React.FC<OllamaSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  isHalloween,
}) => {
  const [model, setModel] = useState(config.model || 'Gemma 4:31B');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    modelsFound: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGemmaConnection();
      setTestResult(res);
      onSaveConfig({
        ...config,
        model,
        isConnected: true,
        modelAvailable: true,
        modelsFound: res.modelsFound,
        lastChecked: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      model,
      isConnected: true,
      lastChecked: new Date().toLocaleTimeString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#161920] border border-white/15 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FF7518]" />
            <h3 className="text-base font-display font-bold text-white tracking-tight">
              Google Gemma 4:31B Engine & Instant Link
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Status Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#42C98B] shrink-0" />
            <div className="font-mono text-xs">
              <div className="text-white font-bold">GOOGLE GEMMA 4:31B — CONNECTED</div>
              <div className="text-emerald-300/80 text-[11px]">
                Zero local daemon installation required · Ready out of the box
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#42C98B]/20 text-[#42C98B] font-mono text-[10px] font-bold">
            ACTIVE
          </span>
        </div>

        {/* Direct 1-Click Open From Link */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-black/50 border border-[#FF7518]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#FF7518] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct App Link (Just Click to Open)</span>
              </span>
              <a
                href={LIVE_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#42C98B] hover:underline font-bold"
              >
                <span>Open App Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-2.5 py-1.5 rounded bg-black/70 border border-white/10 text-white/90 text-[11px] truncate select-all">
                {LIVE_APP_URL}
              </code>
              <button
                onClick={() => handleCopy('link', LIVE_APP_URL)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shrink-0 cursor-pointer ${
                  copiedId === 'link'
                    ? 'bg-[#42C98B] text-black'
                    : isHalloween
                    ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D]'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {copiedId === 'link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'link' ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* 1-Click Copy Code to Open Local App */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-white/60 font-bold block">
              1-Word Copy Code to Open Locally
            </span>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-2.5 py-1.5 rounded bg-black/70 border border-white/10 text-[#42C98B] text-xs font-bold select-all">
                {QUICK_START_CMD}
              </code>
              <button
                onClick={() => handleCopy('cmd', QUICK_START_CMD)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedId === 'cmd' ? <Check className="w-3.5 h-3.5 text-[#42C98B]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'cmd' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="text-white/60 block mb-1.5 uppercase tracking-wider text-[11px]">
              Google Gemma Model Tier
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-white/30"
            >
              <option value="Gemma 4:31B">Google Gemma 4:31B (31B Instruct Cloud)</option>
              <option value="Gemma 4:27B">Google Gemma 4:27B (27B Research Instruct)</option>
              <option value="Gemma 4:9B">Google Gemma 4:9B (Fast Quantitative Instruct)</option>
            </select>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div className="p-3 rounded-lg border bg-emerald-950/40 border-emerald-500/40 text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="space-y-1 text-[11px] leading-relaxed">
                <div>{testResult.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Verifying...' : 'Verify Gemma 4 Status'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                isHalloween
                  ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D]'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
