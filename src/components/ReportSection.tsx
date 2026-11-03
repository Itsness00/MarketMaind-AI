/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Section E: AI Financial Report Generator
 * Generates structured 9-section institutional research report via Google Gemma 4:31B.
 */

import React, { useState, useEffect } from 'react';
import { AssetMetrics } from '../types/market';
import { requestFinancialReport } from '../utils/aiEngine';
import confetti from 'canvas-confetti';
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  Printer,
  Eye,
  Code2,
  Cpu,
} from 'lucide-react';

interface ReportSectionProps {
  activeMetric: AssetMetrics;
  peerMetrics: AssetMetrics[];
  currentProvenance: string;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  activeMetric,
  peerMetrics,
  currentProvenance,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [reportContent, setReportContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial report generation on load or metric change
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);
    requestFinancialReport(activeMetric, peerMetrics, currentProvenance).then((res) => {
      if (isMounted) {
        setReportContent(res.report);
        setIsGenerating(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeMetric.ticker, currentProvenance]);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    const res = await requestFinancialReport(activeMetric, peerMetrics, currentProvenance);
    setReportContent(res.report);
    setIsGenerating(false);

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563EB', '#EF4444', '#FFFFFF'],
      });
    } catch {
      // Ignore confetti error in headless environments
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'txt') => {
    const blob = new Blob([reportContent], {
      type: format === 'md' ? 'text/markdown;charset=utf-8;' : 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `MarketMind_Report_${activeMetric.ticker}_${activeMetric.endDate}.${format}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/15">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Flores Industries AI Financial Research Report ({activeMetric.ticker})
            </h3>
          </div>
          <p className="text-xs font-mono text-white/50 mt-1">
            Standardized 9-Section Institutional Memorandum · Powered by Google Gemma 4:31B
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center p-1 bg-black/60 rounded-lg border border-white/15 mr-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Markdown</span>
            </button>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => handleDownload('md')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={() => handleDownload('txt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 border border-red-500 text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print or Save PDF"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model & Provenance Tag Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-black border border-white/15 text-xs font-mono text-white/60">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>MODEL: <strong>GOOGLE GEMMA 4:31B</strong></span>
          <span>·</span>
          <span>STATUS: <span className="uppercase text-blue-400 font-bold">CONNECTED</span></span>
        </div>
        <div>
          <span>PROVENANCE: {currentProvenance}</span>
        </div>
      </div>

      {/* Report Canvas */}
      {viewMode === 'raw' ? (
        <div className="p-6 rounded-xl bg-black border border-white/15">
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            rows={26}
            className="w-full bg-transparent font-mono text-xs text-white/90 focus:outline-none leading-relaxed resize-y"
          />
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#05070D]/95 border border-white/15 shadow-2xl backdrop-blur-md max-w-4xl mx-auto space-y-8 print:bg-white print:text-black">
          {/* Header block */}
          <div className="border-b border-white/15 pb-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-white/50">
              <span>FLORES INDUSTRIES // MARKETMIND AI INSTITUTIONAL MEMORANDUM</span>
              <span>GOOGLE GEMMA 4:31B EDITION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              RESEARCH REPORT: {activeMetric.ticker} ({activeMetric.name})
            </h1>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-white/60 pt-2">
              <span>Sample Horizon: {activeMetric.startDate} to {activeMetric.endDate}</span>
              <span>·</span>
              <span>{activeMetric.dataPointsCount} Daily Observations</span>
              <span>·</span>
              <span>Provenance: {currentProvenance}</span>
            </div>
          </div>

          {/* 9 Standardized Sections */}
          <div className="space-y-6 text-sm text-white/80 leading-relaxed font-sans">
            {reportContent
              .split('\n## ')
              .slice(1)
              .map((chunk, idx) => {
                const lines = chunk.split('\n');
                const title = lines[0];
                const body = lines.slice(1).join('\n');

                return (
                  <div key={idx} className="space-y-2 pt-2 border-t border-white/5 first:border-none first:pt-0">
                    <h2 className="text-base font-display font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {title}
                    </h2>
                    <div className="text-xs sm:text-sm text-white/70 leading-relaxed space-y-2 font-sans">
                      {body.split('\n\n').map((para, pIdx) => {
                        if (para.startsWith('- ')) {
                          return (
                            <ul key={pIdx} className="list-disc pl-5 space-y-1 font-mono text-xs text-white/80">
                              {para.split('\n').map((li, lIdx) => (
                                <li key={lIdx}>{li.replace(/^- /, '')}</li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={pIdx}>{para}</p>;
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Footer watermark */}
          <div className="pt-8 border-t border-white/10 text-xs font-mono text-white/40 flex flex-wrap justify-between items-center">
            <span>MarketMind AI — Institutional Financial Intelligence</span>
            <span>Powered by Google Gemma 4:31B · MIT License</span>
          </div>
        </div>
      )}
    </section>
  );
};
