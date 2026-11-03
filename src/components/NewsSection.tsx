/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Global Financial News Wire & Open-Source Intelligence Hub
 * Sources: The Wall Street Journal, MarketWatch, Yahoo Finance, Bloomberg, Morningstar, Investopedia & Free Open Sources
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  Search,
  Sparkles,
  Plus,
  Database,
  Trash2,
} from 'lucide-react';
import {
  AIEngineSelection,
  AssetMetrics,
  OpenSourceConnector,
} from '../types/market';
import {
  INSTITUTIONAL_NEWS_FEED,
  CuratedNewsArticle,
  NewsProviderName,
} from '../data/globalMarketsData';
import { queryGemmaAnalyst } from '../utils/aiEngine';

interface NewsSectionProps {
  activeTicker: string;
  activeMetric: AssetMetrics;
  peerMetrics: AssetMetrics[];
  onSelectTicker: (ticker: string) => void;
  openSources: OpenSourceConnector[];
  onAddOpenSource: (connector: OpenSourceConnector) => void;
  onToggleOpenSource: (id: string) => void;
  onDeleteOpenSource: (id: string) => void;
  onUpdateOpenSourceStatus: (
    id: string,
    status: 'VERIFIED' | 'OFFLINE' | 'UNTESTED',
    sampleFields?: string[]
  ) => void;
  selectedEngine: AIEngineSelection;
}

const NEWS_PUBLISHERS: ('ALL' | NewsProviderName)[] = [
  'ALL',
  'The Wall Street Journal',
  'MarketWatch',
  'Yahoo Finance',
  'Bloomberg',
  'Morningstar',
  'Investopedia',
  'Open Source Wire',
];

export const NewsSection: React.FC<NewsSectionProps> = ({
  activeTicker,
  activeMetric,
  peerMetrics,
  onSelectTicker,
  openSources,
  onAddOpenSource,
  onToggleOpenSource,
  onDeleteOpenSource,
  selectedEngine,
}) => {
  const [articles, setArticles] = useState<CuratedNewsArticle[]>(INSTITUTIONAL_NEWS_FEED);
  const [selectedPublisher, setSelectedPublisher] = useState<'ALL' | NewsProviderName>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'NEUTRAL'>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    INSTITUTIONAL_NEWS_FEED[0]?.id || ''
  );
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>('');
  const [isAnalyzingNews, setIsAnalyzingNews] = useState<boolean>(false);

  // Add custom open-source feed state
  const [newSourceName, setNewSourceName] = useState<string>('');
  const [newSourceUrl, setNewSourceUrl] = useState<string>('');

  const fetchLiveOpenFeeds = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/live-news?ticker=${encodeURIComponent(activeTicker)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const mappedLive: CuratedNewsArticle[] = data.items.slice(0, 6).map((item: any, idx: number) => {
            const rawSource = String(item.source || '');
            let mappedSource: NewsProviderName = 'Yahoo Finance';
            if (rawSource.toLowerCase().includes('wall street') || rawSource.toLowerCase().includes('wsj')) {
              mappedSource = 'The Wall Street Journal';
            } else if (rawSource.toLowerCase().includes('marketwatch')) {
              mappedSource = 'MarketWatch';
            } else if (rawSource.toLowerCase().includes('bloomberg')) {
              mappedSource = 'Bloomberg';
            } else if (rawSource.toLowerCase().includes('morningstar')) {
              mappedSource = 'Morningstar';
            } else if (rawSource.toLowerCase().includes('investopedia')) {
              mappedSource = 'Investopedia';
            } else if (rawSource.toLowerCase().includes('sec') || rawSource.toLowerCase().includes('fred')) {
              mappedSource = 'Open Source Wire';
            }

            return {
              id: `live-rss-${idx}-${Date.now()}`,
              source: mappedSource,
              sourceShort: mappedSource,
              headline: item.headline || `${activeTicker} Institutional Market Dispatch`,
              summary: item.summary || `Live open-source market wire dispatch covering ${activeTicker}.`,
              publishedAt: item.publishedAt || 'Live Feed',
              category: 'US_MARKET',
              sentiment: item.sentiment || 'NEUTRAL',
              relatedTickers: Array.isArray(item.relatedTickers) && item.relatedTickers.length > 0
                ? item.relatedTickers
                : [activeTicker],
              url: item.url || 'https://finance.yahoo.com',
              readTime: '3 min read',
              quantTakeaway: item.aiTakeaway || `Real-time open-source feed telemetry for ${activeTicker}.`,
            };
          });

          // Combine curated multi-publisher baseline with live fetched items so every publisher tab has rich articles
          const seenHeadlines = new Set(INSTITUTIONAL_NEWS_FEED.map((a) => a.headline));
          const uniqueLive = mappedLive.filter((a) => !seenHeadlines.has(a.headline));
          setArticles([...uniqueLive, ...INSTITUTIONAL_NEWS_FEED]);
        }
      }
    } catch {
      // Keep baseline articles on network offline
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTicker]);

  useEffect(() => {
    fetchLiveOpenFeeds();
  }, [fetchLiveOpenFeeds]);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((art) => {
      if (selectedPublisher !== 'ALL' && art.source !== selectedPublisher) return false;
      if (sentimentFilter !== 'ALL' && art.sentiment !== sentimentFilter) return false;
      if (!q) return true;
      return (
        art.headline.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.source.toLowerCase().includes(q) ||
        art.relatedTickers.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [articles, selectedPublisher, sentimentFilter, searchQuery]);

  const activeArticle = useMemo(
    () =>
      filteredArticles.find((a) => a.id === selectedArticleId) ||
      filteredArticles[0] ||
      articles[0],
    [filteredArticles, selectedArticleId, articles]
  );

  const handleAnalyzeArticleWithAI = async (article: CuratedNewsArticle) => {
    if (!activeMetric) return;
    setIsAnalyzingNews(true);
    setAiAnalysisResult('');
    try {
      const prompt = `Analyze this financial news dispatch from ${article.source}: "${article.headline}" (${article.summary}). Impacted tickers: ${article.relatedTickers.join(', ')}. Explain the institutional impact on ${activeMetric.ticker} (current price $${activeMetric.endPrice.toFixed(2)}, volatility ${activeMetric.annualizedVolatility.toFixed(1)}%) and whether it supports a bullish or bearish bias.`;
      const res = await queryGemmaAnalyst(prompt, activeMetric, peerMetrics, [], selectedEngine);
      setAiAnalysisResult(res.response);
    } catch (err: any) {
      setAiAnalysisResult(`AI synthesis notice: ${err.message || 'Unable to reach AI engine.'}`);
    } finally {
      setIsAnalyzingNews(false);
    }
  };

  const handleAddConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    onAddOpenSource({
      id: `custom-src-${Date.now()}`,
      name: newSourceName.trim(),
      category: 'NEWS_WIRE',
      endpointUrl: newSourceUrl.trim(),
      protocol: 'REST_JSON',
      description: 'Custom user-configured open-source financial news or data feed.',
      enabled: true,
      isCustom: true,
      lastSyncStatus: 'VERIFIED',
      lastSyncedAt: 'Just added',
    });
    setNewSourceName('');
    setNewSourceUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Publisher Filter Bar */}
      <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Newspaper className="w-4 h-4" />
              <span>GLOBAL FINANCIAL NEWS WIRE & OPEN-SOURCE FEEDS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              The Wall Street Journal, MarketWatch, Yahoo Finance, Bloomberg, Morningstar & Investopedia
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56 sm:w-64">
              <Search className="w-3.5 h-3.5 text-white/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines or tickers..."
                aria-label="Search financial news"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs text-white placeholder-white/45 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={fetchLiveOpenFeeds}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Wire
            </button>
          </div>
        </div>

        {/* Publisher Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="News Publishers"
            className="flex flex-wrap items-center gap-1.5"
          >
            {NEWS_PUBLISHERS.map((pub) => {
              const isSelected = selectedPublisher === pub;
              const count =
                pub === 'ALL'
                  ? articles.length
                  : articles.filter((a) => a.source === pub).length;
              return (
                <button
                  key={pub}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedPublisher(pub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-black/80 text-white/75 border-white/10 hover:text-white hover:border-white/25'
                  }`}
                >
                  {pub === 'ALL' ? 'All Publishers' : pub} ({count})
                </button>
              );
            })}
          </div>

          {/* Sentiment Filter */}
          <div className="inline-flex items-center rounded-lg bg-black border border-white/15 p-0.5">
            {(['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'] as const).map((sent) => (
              <button
                key={sent}
                type="button"
                onClick={() => setSentimentFilter(sent)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  sentimentFilter === sent
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {sent}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column News Feed + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: News Feed List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredArticles.map((art) => {
            const isSelected = activeArticle?.id === art.id;
            return (
              <article
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className={`rounded-xl p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/25 border-blue-400'
                    : 'bg-[#070A12] border-white/15 hover:border-white/30'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/60">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">{art.source}</span>
                    <span>·</span>
                    <span>{art.publishedAt}</span>
                    <span>·</span>
                    <span>{art.readTime}</span>
                  </div>
                  <span
                    className={`font-bold ${
                      art.sentiment === 'BULLISH'
                        ? 'text-emerald-400'
                        : art.sentiment === 'BEARISH'
                        ? 'text-red-400'
                        : 'text-white/70'
                    }`}
                  >
                    {art.sentiment}
                  </span>
                </div>

                <h3 className="text-base font-display font-bold text-white mt-1.5 leading-snug">
                  {art.headline}
                </h3>

                <p className="text-xs text-white/75 mt-1.5 leading-relaxed">{art.summary}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono text-white/50">Tickers:</span>
                    {art.relatedTickers.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicker(t);
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-blue-600 text-white text-[11px] font-mono font-semibold transition-colors cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-mono text-blue-400 hover:text-blue-300"
                  >
                    Source Wire <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Right Column: Article Deep-Dive & Open-Source Feed Connectors */}
        <div className="lg:col-span-5 space-y-4">
          {activeArticle && (
            <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
              <div className="pb-3 border-b border-white/10">
                <div className="text-xs font-mono text-blue-400 font-bold">
                  {activeArticle.source} · INTELLIGENCE BRIEF
                </div>
                <h3 className="text-base font-display font-bold text-white mt-1 leading-snug">
                  {activeArticle.headline}
                </h3>
              </div>

              <div className="p-3 rounded-lg bg-black/80 border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  QUANTITATIVE TAKEAWAY
                </div>
                <p className="text-xs text-white/85 leading-relaxed">
                  {activeArticle.quantTakeaway}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAnalyzeArticleWithAI(activeArticle)}
                disabled={isAnalyzingNews}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzingNews
                  ? 'Synthesizing with Gemma 4 & Gemini...'
                  : 'Run Gemma 4 & Gemini Impact Synthesis'}
              </button>

              {aiAnalysisResult && (
                <div className="p-3.5 rounded-lg bg-black border border-blue-500/40 text-xs text-white/90 leading-relaxed whitespace-pre-wrap font-sans max-h-72 overflow-y-auto">
                  {aiAnalysisResult}
                </div>
              )}
            </div>
          )}

          {/* Open-Source Data & News Connectors */}
          <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Database className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-display font-bold text-white">
                Free Open-Source Data & News Connectors ({openSources.length})
              </h3>
            </div>

            <div className="divide-y divide-white/10 max-h-60 overflow-y-auto">
              {openSources.map((src) => (
                <div key={src.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold text-white truncate">
                      {src.name}
                    </div>
                    <div className="text-[11px] text-white/60 truncate">{src.description}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleOpenSource(src.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold cursor-pointer ${
                        src.enabled
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 text-white/50 border border-white/10'
                      }`}
                    >
                      {src.enabled ? 'ACTIVE' : 'OFF'}
                    </button>
                    {src.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteOpenSource(src.id)}
                        aria-label={`Delete ${src.name}`}
                        className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddConnector} className="pt-2 border-t border-white/10 space-y-2">
              <div className="text-xs font-mono text-white/70">Add Custom Free RSS / JSON Feed</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="Source Name (e.g. Reuters RSS)"
                  className="px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs text-white font-mono"
                />
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs text-white font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-white/10 hover:bg-blue-600 text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Connect Open Feed
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
