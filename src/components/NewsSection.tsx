import React, { useEffect, useState, useCallback } from 'react';
import {
  Newspaper,
  Globe,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Plus,
  CheckCircle2,
  Database,
  Radio,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Filter,
  Cpu,
} from 'lucide-react';
import {
  AIEngineSelection,
  AssetMetrics,
  MarketNewsItem,
  OpenSourceConnector,
} from '../types/market';
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

export const NewsSection: React.FC<NewsSectionProps> = ({
  activeTicker,
  activeMetric,
  peerMetrics,
  onSelectTicker,
  openSources,
  onAddOpenSource,
  onToggleOpenSource,
  onDeleteOpenSource,
  onUpdateOpenSourceStatus,
  selectedEngine,
}) => {
  const [newsItems, setNewsItems] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // AI News Deep-Dive state
  const [analyzingNewsId, setAnalyzingNewsId] = useState<string | null>(null);
  const [aiInsightsByNewsId, setAiInsightsByNewsId] = useState<Record<string, string>>({});

  // Custom Open-Source Connector form state
  const [showAddSourceForm, setShowAddSourceForm] = useState<boolean>(false);
  const [newSourceName, setNewSourceName] = useState<string>('');
  const [newSourceUrl, setNewSourceUrl] = useState<string>('');
  const [newSourceCategory, setNewSourceCategory] =
    useState<OpenSourceConnector['category']>('NEWS_WIRE');
  const [newSourceProtocol, setNewSourceProtocol] =
    useState<OpenSourceConnector['protocol']>('REST_JSON');
  const [newSourceDesc, setNewSourceDesc] = useState<string>('');
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);
  const [sourceFeedback, setSourceFeedback] = useState<string>('');

  const fetchLiveNews = useCallback(async (symbol: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/news?symbol=${encodeURIComponent(symbol)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setNewsItems(data.items);
          setLastUpdated(
            new Date(data.updatedAt || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      }
    } catch {
      // Keep existing items on transient failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveNews(activeTicker);
  }, [activeTicker, fetchLiveNews]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveNews(activeTicker);
    }, 25000);
    return () => clearInterval(interval);
  }, [autoRefresh, activeTicker, fetchLiveNews]);

  const handleAnalyzeNewsWithAI = async (item: MarketNewsItem) => {
    setAnalyzingNewsId(item.id);
    try {
      const prompt = `Analyze the institutional market impact of this live news headline on ${activeMetric.ticker} ($${activeMetric.endPrice.toFixed(2)}, Volatility ${activeMetric.annualizedVolatility.toFixed(1)}%): "${item.headline}" (${item.source}). Summarize the bullish/bearish implication and key price levels in 3 concise bullet points.`;
      const result = await queryGemmaAnalyst(
        prompt,
        activeMetric,
        peerMetrics,
        [],
        selectedEngine
      );
      setAiInsightsByNewsId((prev) => ({
        ...prev,
        [item.id]: result.text,
      }));
    } catch {
      setAiInsightsByNewsId((prev) => ({
        ...prev,
        [item.id]: item.aiTakeaway,
      }));
    } finally {
      setAnalyzingNewsId(null);
    }
  };

  const handleTestConnector = async (connector: OpenSourceConnector) => {
    setTestingSourceId(connector.id);
    setSourceFeedback('');
    try {
      const res = await fetch('/api/sources/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: connector.name,
          endpointUrl: connector.endpointUrl,
          protocol: connector.protocol,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateOpenSourceStatus(connector.id, 'VERIFIED', data.sampleFields);
        setSourceFeedback(data.message || `Verified ${connector.name}`);
      } else {
        onUpdateOpenSourceStatus(connector.id, 'OFFLINE');
        setSourceFeedback(data.error || `Could not verify ${connector.name}`);
      }
    } catch {
      onUpdateOpenSourceStatus(connector.id, 'OFFLINE');
      setSourceFeedback(`Connection check failed for ${connector.name}`);
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleCreateCustomSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;

    const cleanUrl = newSourceUrl.trim().startsWith('http')
      ? newSourceUrl.trim()
      : `https://${newSourceUrl.trim()}`;

    const created: OpenSourceConnector = {
      id: `custom-${Date.now()}`,
      name: newSourceName.trim().slice(0, 80),
      category: newSourceCategory,
      endpointUrl: cleanUrl.slice(0, 300),
      protocol: newSourceProtocol,
      description:
        newSourceDesc.trim().slice(0, 250) ||
        `Custom ${newSourceProtocol} open-source feed integrated into MarketMind AI.`,
      enabled: true,
      isCustom: true,
      lastSyncStatus: 'VERIFIED',
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sampleFields: ['symbol', 'headline', 'timestamp', 'sentiment'],
    };

    onAddOpenSource(created);
    setNewSourceName('');
    setNewSourceUrl('');
    setNewSourceDesc('');
    setShowAddSourceForm(false);
    setSourceFeedback(`Added custom open-source connector: ${created.name}`);
  };

  const filteredNews = newsItems.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (sentimentFilter !== 'ALL' && item.sentiment !== sentimentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.headline.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.relatedTickers.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeSourcesCount = openSources.filter((s) => s.enabled).length;

  return (
    <section id="news" className="py-6 border-t border-slate-800/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[11px] font-mono uppercase tracking-widest mb-2">
              <Newspaper className="w-3.5 h-3.5 text-sky-400" />
              LIVE FINANCIAL NEWS WIRE & OPEN-SOURCE DATA HUB
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Global Market Intelligence & Open-Source Feeds ({activeTicker})
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Real-time institutional headlines, AI sentiment scoring via{' '}
              <span className="text-indigo-300 font-semibold">
                Google Gemma 4:31B & Gemini 3.8 Flash
              </span>
              , and custom open-source data connectors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAutoRefresh((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-2 transition-all ${
                autoRefresh
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              LIVE WIRE: {autoRefresh ? 'STREAMING' : 'PAUSED'}
            </button>

            <button
              type="button"
              onClick={() => fetchLiveNews(activeTicker)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              Refresh Wire
            </button>

            <button
              type="button"
              onClick={() => setShowAddSourceForm((v) => !v)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Open-Source Feed
            </button>
          </div>
        </div>

        {/* Main 12-Column Fit-to-Ratio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Columns: Live Institutional News Stream */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    'ALL',
                    'EARNINGS',
                    'AI & SEMIS',
                    'MACRO',
                    'GLOBAL MARKETS',
                    'OPEN SOURCE FEED',
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter headlines..."
                    className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  aria-label="Filter by sentiment"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Sentiment</option>
                  <option value="BULLISH">Bullish Only</option>
                  <option value="BEARISH">Bearish Only</option>
                  <option value="NEUTRAL">Neutral Only</option>
                </select>
              </div>
            </div>

            {/* News Dispatches List */}
            <div className="space-y-3">
              {filteredNews.map((item) => {
                const isBull = item.sentiment === 'BULLISH';
                const isBear = item.sentiment === 'BEARISH';
                const customInsight = aiInsightsByNewsId[item.id];

                return (
                  <article
                    key={item.id}
                    className="bg-slate-900/85 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                            isBull
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : isBear
                              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                              : 'bg-amber-950/50 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          {isBull ? '▲ BULLISH' : isBear ? '▼ BEARISH' : '◆ NEUTRAL'} · IMPACT{' '}
                          {item.impactScore}/100
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-300">
                          {item.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.source}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(item.publishedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-white leading-snug mb-1.5">
                      {item.headline}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.summary}</p>

                    {/* Gemma 4 + Gemini 3.8 Flash Takeaway Box */}
                    <div className="bg-slate-950/85 border border-indigo-500/20 rounded-lg p-2.5 mb-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-indigo-400 mb-1">
                        <Sparkles className="w-3 h-3" />
                        {customInsight
                          ? 'Deep-Dive AI Synthesis (Gemma 4:31B + Gemini 3.8 Flash)'
                          : 'Instant AI Signal Takeaway'}
                      </div>
                      <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                        {customInsight || item.aiTakeaway}
                      </p>
                    </div>

                    {/* Related Tickers & Action Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/70">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Tickers:
                        </span>
                        {Array.from(new Set(item.relatedTickers)).map((sym) => (
                          <button
                            key={`${item.id}-${sym}`}
                            type="button"
                            onClick={() => onSelectTicker(sym)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                              sym === activeTicker
                                ? 'bg-indigo-600/30 border-indigo-500 text-white font-semibold'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAnalyzeNewsWithAI(item)}
                          disabled={analyzingNewsId === item.id}
                          className="px-2.5 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-[11px] font-mono flex items-center gap-1.5 transition-all"
                        >
                          <Cpu className="w-3 h-3" />
                          {analyzingNewsId === item.id
                            ? 'Synthesizing...'
                            : 'Analyze Impact with Gemma & Gemini'}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-mono flex items-center gap-1"
                        >
                          Source <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right 4 Columns: Open-Source Data & News Connectors Hub */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Open-Source Connectors ({activeSourcesCount}/{openSources.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSourceForm((v) => !v)}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddSourceForm ? 'Close' : 'Add Custom'}
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Connect external open-source market data, regulatory filings, macro series, and
                custom RSS/REST endpoints into your terminal workflow.
              </p>

              {sourceFeedback && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                  <span>{sourceFeedback}</span>
                  <button
                    type="button"
                    onClick={() => setSourceFeedback('')}
                    className="text-emerald-400 hover:text-white ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Add Custom Open-Source Feed Form */}
              {showAddSourceForm && (
                <form
                  onSubmit={handleCreateCustomSource}
                  className="mb-4 p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2.5"
                >
                  <div className="text-xs font-mono font-semibold text-indigo-300 uppercase">
                    Register New Open-Source Feed
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Connector Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      placeholder="e.g., AlphaVantage / Custom RSS Wire"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Endpoint URL (REST JSON / RSS / Open API)
                    </label>
                    <input
                      type="text"
                      required
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      placeholder="https://api.coingecko.com/api/v3/ping"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={newSourceCategory}
                        onChange={(e) =>
                          setNewSourceCategory(
                            e.target.value as OpenSourceConnector['category']
                          )
                        }
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      >
                        <option value="NEWS_WIRE">News Wire</option>
                        <option value="MARKET_DATA">Market Data</option>
                        <option value="MACRO_ECON">Macro Econ</option>
                        <option value="ON_CHAIN_ALT">Crypto / Alt Data</option>
                        <option value="AI_ENDPOINT">Open AI Model</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Protocol
                      </label>
                      <select
                        value={newSourceProtocol}
                        onChange={(e) =>
                          setNewSourceProtocol(
                            e.target.value as OpenSourceConnector['protocol']
                          )
                        }
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      >
                        <option value="REST_JSON">REST JSON</option>
                        <option value="RSS_XML">RSS / XML</option>
                        <option value="OPEN_API">OpenAPI v3</option>
                        <option value="GRAPHQL">GraphQL</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newSourceDesc}
                      onChange={(e) => setNewSourceDesc(e.target.value)}
                      placeholder="Brief description of fields or coverage..."
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddSourceForm(false)}
                      className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Save & Connect Feed
                    </button>
                  </div>
                </form>
              )}

              {/* Open-Source Connectors List */}
              <div className="space-y-2.5">
                {openSources.map((src) => (
                  <div
                    key={src.id}
                    className={`p-3 rounded-xl border transition-all ${
                      src.enabled
                        ? 'bg-slate-950/90 border-slate-800'
                        : 'bg-slate-950/40 border-slate-900 opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              src.enabled ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <h4 className="text-xs font-bold text-white">{src.name}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-400">
                            {src.protocol}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {src.description}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[230px] mt-1">
                          {src.endpointUrl}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleOpenSource(src.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            src.enabled
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {src.enabled ? 'ON' : 'OFF'}
                        </button>
                        {src.isCustom && (
                          <button
                            type="button"
                            onClick={() => onDeleteOpenSource(src.id)}
                            title="Remove custom connector"
                            className="p-1 rounded bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {src.lastSyncStatus || 'VERIFIED'}
                        {src.lastSyncedAt ? ` · ${src.lastSyncedAt}` : ''}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTestConnector(src)}
                        disabled={testingSourceId === src.id}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-sky-300 flex items-center gap-1"
                      >
                        <Radio className="w-2.5 h-2.5" />
                        {testingSourceId === src.id ? 'Testing...' : 'Test Ping'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Sentiment Distribution Summary */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Wire Sentiment Balance ({activeTicker})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Updated {lastUpdated || 'Live'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                  <div className="text-[10px] font-mono text-emerald-400">BULLISH</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {newsItems.filter((n) => n.sentiment === 'BULLISH').length}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20">
                  <div className="text-[10px] font-mono text-amber-400">NEUTRAL</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {newsItems.filter((n) => n.sentiment === 'NEUTRAL').length}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20">
                  <div className="text-[10px] font-mono text-rose-400">BEARISH</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {newsItems.filter((n) => n.sentiment === 'BEARISH').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
