/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Ollama Engine Settings Modal
 * Configures Gemma 4:31B Cloud runtime and tests Node.js backend connectivity.
 */

import React, { useState } from 'react';
import { OllamaConfig } from '../types/market';
import { testOllamaConnection } from '../utils/aiEngine';
import { X, CheckCircle2, AlertCircle, RefreshCw, Terminal, Cpu, Info, Cloud } from 'lucide-react';

interface OllamaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OllamaConfig;
  onSaveConfig: (newConfig: OllamaConfig) => void;
  isHalloween: boolean;
}

export const OllamaSettingsModal: React.FC<OllamaSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  isHalloween,
}) => {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || 'http://127.0.0.1:11434');
  const [model, setModel] = useState(config.model || 'gemma4:31b-cloud');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    modelsFound: string[];
    isCloudSandbox?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testOllamaConnection();
      setTestResult(res);
      if (res.connected) {
        onSaveConfig({
          ...config,
          baseUrl,
          model,
          isConnected: true,
          modelAvailable: res.modelAvailable,
          modelsFound: res.modelsFound,
          lastChecked: new Date().toLocaleTimeString(),
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      baseUrl,
      model,
      isConnected: testResult?.connected ?? config.isConnected,
      lastChecked: new Date().toLocaleTimeString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#161920] border border-white/15 p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FF7518]" />
            <h3 className="text-base font-display font-bold text-white tracking-tight">
              Ollama & Google Gemma 4:31B Cloud Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-white/60 block mb-1.5 uppercase tracking-wider text-[11px]">
              Ollama API Endpoint URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://127.0.0.1:11434"
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
            <span className="text-[10px] text-white/40 mt-1 block">
              Default: <strong>http://127.0.0.1:11434</strong> (Communicated via Node.js backend).
            </span>
          </div>

          <div>
            <label className="text-white/60 block mb-1.5 uppercase tracking-wider text-[11px]">
              AI Model Identifier
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemma4:31b-cloud"
              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
            <span className="text-[10px] text-white/40 mt-1 block">
              Model: <strong>gemma4:31b-cloud</strong> (Google Gemma 4:31B Cloud via Ollama authenticated session)
            </span>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                testResult.connected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              {testResult.connected ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              )}
              <div className="space-y-1 text-[11px] leading-relaxed">
                <div>{testResult.message}</div>
                {testResult.modelsFound && testResult.modelsFound.length > 0 && (
                  <div className="text-white/60">
                    Installed models on host: {testResult.modelsFound.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cloud Model Architecture Explainer */}
          <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-2 text-[11px] text-white/70 font-sans leading-relaxed">
            <div className="flex items-center gap-1.5 text-white/90 font-mono font-bold">
              <Cloud className="w-3.5 h-3.5 text-[#9B5DE5]" />
              <span>Gemma 4:31B Cloud Architecture:</span>
            </div>
            <p>
              Gemma 4:31B Cloud runs on Ollama's cloud infrastructure. Your local Ollama application provides
              access through your authenticated session on Windows 11.
            </p>
            <p className="text-white/50">
              In Google AI Studio cloud preview, remote servers cannot ping your laptop's localhost. Non-AI
              analytics remain 100% active. After export to Windows 11, the app connects directly to Ollama.
            </p>
          </div>

          {/* Windows 11 Ollama Terminal Command */}
          <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-1 font-mono text-[11px]">
            <div className="text-white/50 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#42C98B]" />
              <span>Run authenticated Gemma 4:31B Cloud in Windows Terminal:</span>
            </div>
            <code className="text-[#FF7518] block select-all">ollama run gemma4:31b-cloud</code>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Checking /api/health...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                isHalloween
                  ? 'bg-[#FF7518] text-black hover:bg-[#FF8A3D]'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
