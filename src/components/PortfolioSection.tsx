/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Portfolio & Net Worth Hub
 * Pillars: Overview, Investments, Cash Balance & Liabilities + Recharts Allocation Pie Chart
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  AssetMetrics,
  MarketSessionStatus,
  PortfolioHolding,
} from '../types/market';
import { computePortfolioMetrics } from '../utils/analytics';
import {
  DEFAULT_CASH_ACCOUNTS,
  DEFAULT_LIABILITIES,
  CashAccountItem,
  LiabilityItem,
  computeNetWorthSummary,
} from '../data/globalMarketsData';
import {
  Briefcase,
  DollarSign,
  PieChart as PieChartIcon,
  Plus,
  RotateCcw,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface PortfolioSectionProps {
  assetSummaries: AssetMetrics[];
  holdings: PortfolioHolding[];
  onUpdateHolding: (ticker: string, shares: number, avgCostPerShare: number) => void;
  onResetHoldings: () => void;
  marketStatus: MarketSessionStatus;
  onSimulateMarketTick: (
    targetTicker?: string,
    shockPct?: number,
    volumeMultiplier?: number
  ) => void;
  isAutoStreaming: boolean;
  setIsAutoStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectTickerForTerminal: (ticker: string) => void;
  onSelectOrAddStock: (ticker: string, name?: string, sector?: string) => void;
}

const SLICE_PALETTE = [
  '#2563EB',
  '#10B981',
  '#3B82F6',
  '#60A5FA',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#14B8A6',
];

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  assetSummaries,
  holdings,
  onUpdateHolding,
  onResetHoldings,
  onSelectTickerForTerminal,
  onSelectOrAddStock,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'investments' | 'cash' | 'liabilities'
  >('overview');
  const [showPiePctLabels, setShowPiePctLabels] = useState<boolean>(true);

  // Cash Balance State
  const [cashAccounts, setCashAccounts] = useState<CashAccountItem[]>(() => {
    try {
      const saved = localStorage.getItem('marketmind_cash_accounts_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_CASH_ACCOUNTS;
  });

  // Liabilities State
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(() => {
    try {
      const saved = localStorage.getItem('marketmind_liabilities_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_LIABILITIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('marketmind_cash_accounts_v1', JSON.stringify(cashAccounts));
    } catch {
      // Ignore
    }
  }, [cashAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('marketmind_liabilities_v1', JSON.stringify(liabilities));
    } catch {
      // Ignore
    }
  }, [liabilities]);

  // Investment form state
  const [invTicker, setInvTicker] = useState<string>('NVDA');
  const [invShares, setInvShares] = useState<string>('25');
  const [invAvgCost, setInvAvgCost] = useState<string>('140.00');

  // Cash form state
  const [newCashName, setNewCashName] = useState<string>('');
  const [newCashInstitution, setNewCashInstitution] = useState<string>('');
  const [newCashBalance, setNewCashBalance] = useState<string>('');
  const [newCashApy, setNewCashApy] = useState<string>('4.65');

  // Liability form state
  const [newLiabName, setNewLiabName] = useState<string>('');
  const [newLiabLender, setNewLiabLender] = useState<string>('');
  const [newLiabBalance, setNewLiabBalance] = useState<string>('');
  const [newLiabApr, setNewLiabApr] = useState<string>('5.50');
  const [newLiabMonthly, setNewLiabMonthly] = useState<string>('350');

  const portfolioSummary = useMemo(
    () => computePortfolioMetrics(holdings, assetSummaries),
    [holdings, assetSummaries]
  );

  const netWorthSummary = useMemo(
    () =>
      computeNetWorthSummary(
        portfolioSummary.totalMarketValue,
        portfolioSummary.totalCostBasis,
        portfolioSummary.totalDayPnL,
        cashAccounts,
        liabilities
      ),
    [
      portfolioSummary.totalMarketValue,
      portfolioSummary.totalCostBasis,
      portfolioSummary.totalDayPnL,
      cashAccounts,
      liabilities,
    ]
  );

  const activePositions = useMemo(
    () => portfolioSummary.positions.filter((pos) => pos.shares > 0),
    [portfolioSummary.positions]
  );

  const pieChartData = useMemo(() => {
    return activePositions.map((pos, index) => ({
      name: pos.ticker,
      fullName: pos.name,
      value: Number(pos.marketValue.toFixed(2)),
      weightPct: Number(pos.allocationWeightPct.toFixed(1)),
      color: SLICE_PALETTE[index % SLICE_PALETTE.length],
    }));
  }, [activePositions]);

  const handleSaveInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = invTicker.trim().toUpperCase();
    const s = Number(invShares);
    const c = Number(invAvgCost);
    if (!cleaned || isNaN(s) || s < 0 || isNaN(c) || c <= 0) return;
    onSelectOrAddStock(cleaned);
    onUpdateHolding(cleaned, s, c);
  };

  const handleAdjustCash = (id: string, delta: number) => {
    setCashAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? { ...acc, balance: Math.max(0, Number((acc.balance + delta).toFixed(2))) }
          : acc
      )
    );
  };

  const handleAddCashAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = Number(newCashBalance);
    const apy = Number(newCashApy);
    if (!newCashName.trim() || isNaN(bal) || bal < 0) return;
    setCashAccounts((prev) => [
      ...prev,
      {
        id: `cash-${Date.now()}`,
        accountName: newCashName.trim(),
        institution: newCashInstitution.trim() || 'Institutional Custodian',
        accountType: 'MONEY_MARKET',
        currency: 'USD',
        balance: bal,
        apyPct: isNaN(apy) ? 4.5 : apy,
        updatedAt: 'Just added',
      },
    ]);
    setNewCashName('');
    setNewCashInstitution('');
    setNewCashBalance('');
  };

  const handlePaydownLiability = (id: string, amount: number) => {
    setLiabilities((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, balance: Math.max(0, Number((item.balance - amount).toFixed(2))) }
          : item
      )
    );
  };

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = Number(newLiabBalance);
    const apr = Number(newLiabApr);
    const mo = Number(newLiabMonthly);
    if (!newLiabName.trim() || isNaN(bal) || bal <= 0) return;
    setLiabilities((prev) => [
      ...prev,
      {
        id: `liab-${Date.now()}`,
        name: newLiabName.trim(),
        lender: newLiabLender.trim() || 'Institutional Credit Desk',
        category: 'CREDIT_LINE',
        balance: bal,
        aprPct: isNaN(apr) ? 5.5 : apr,
        monthlyPayment: isNaN(mo) ? 250 : mo,
        dueDateLabel: 'Monthly Scheduled',
      },
    ]);
    setNewLiabName('');
    setNewLiabLender('');
    setNewLiabBalance('');
  };

  const handleResetAllNetWorth = () => {
    onResetHoldings();
    setCashAccounts(DEFAULT_CASH_ACCOUNTS);
    setLiabilities(DEFAULT_LIABILITIES);
  };

  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    name,
    weightPct,
  }: any) => {
    if (!showPiePctLabels || weightPct < 4) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#FFFFFF"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={700}
      >
        {`${name} ${weightPct}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. NET WORTH EXECUTIVE HEADER & PILLAR NAVIGATION                   */}
      {/* =================================================================== */}
      <div className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Briefcase className="w-4 h-4" />
              <span>PORTFOLIO & TOTAL NET WORTH LEDGER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
              Overview, Investments, Cash Balance & Liabilities
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="tablist"
              aria-label="Portfolio and Net Worth Sections"
              className="inline-flex items-center rounded-lg bg-black border border-white/15 p-1"
            >
              {[
                { id: 'overview', label: '01. Overview' },
                { id: 'investments', label: '02. Investments' },
                { id: 'cash', label: '03. Cash Balance' },
                { id: 'liabilities', label: '04. Liabilities' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSubTab === tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSubTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetAllNetWorth}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-white/80 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Ledger
            </button>
          </div>
        </div>

        {/* 4 Core Balance Sheet KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-mono tabular-nums">
          <div className="p-4 rounded-xl bg-black/80 border border-blue-500/40">
            <div className="text-xs text-blue-300 font-semibold">TOTAL NET WORTH</div>
            <div
              data-testid="total-net-worth-value"
              className="text-2xl font-bold text-white mt-1"
            >
              ${netWorthSummary.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-white/60 mt-1">
              Assets (${netWorthSummary.totalAssets.toLocaleString()}) − Liabilities ($
              {netWorthSummary.totalLiabilities.toLocaleString()})
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/80 border border-white/10">
            <div className="text-xs text-emerald-400 font-semibold">INVESTMENTS PORTFOLIO</div>
            <div className="text-2xl font-bold text-white mt-1">
              $
              {netWorthSummary.investmentsValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div
              className={`text-[11px] mt-1 ${
                netWorthSummary.investmentsUnrealizedPnL >= 0
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              Unrealized P&L:{' '}
              {netWorthSummary.investmentsUnrealizedPnL >= 0 ? '+' : ''}$
              {netWorthSummary.investmentsUnrealizedPnL.toLocaleString()} (
              {netWorthSummary.investmentsUnrealizedPnLPct >= 0 ? '+' : ''}
              {netWorthSummary.investmentsUnrealizedPnLPct.toFixed(2)}%)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/80 border border-white/10">
            <div className="text-xs text-blue-400 font-semibold">TOTAL CASH BALANCE</div>
            <div
              data-testid="total-cash-balance-value"
              className="text-2xl font-bold text-white mt-1"
            >
              $
              {netWorthSummary.totalCashBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Weighted Yield: {netWorthSummary.weightedCashApyPct.toFixed(2)}% APY (+$
              {netWorthSummary.annualCashYieldEstimate.toLocaleString()}/yr)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/80 border border-white/10">
            <div className="text-xs text-red-400 font-semibold">TOTAL LIABILITIES</div>
            <div
              data-testid="total-liabilities-value"
              className="text-2xl font-bold text-white mt-1"
            >
              $
              {netWorthSummary.totalLiabilities.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="text-[11px] text-white/65 mt-1">
              Debt-to-Asset: {netWorthSummary.debtToAssetRatioPct.toFixed(1)}% · Avg{' '}
              {netWorthSummary.weightedLiabilityAprPct.toFixed(2)}% APR
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. OVERVIEW & RECHARTS PIE CHART ALLOCATION                         */}
      {/* =================================================================== */}
      {(activeSubTab === 'overview' || activeSubTab === 'investments') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Recharts Pie Chart with Toggle Switch */}
          <div className="lg:col-span-5 rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-display font-bold text-white">
                  Asset Valuation Distribution (Recharts)
                </h3>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={showPiePctLabels}
                aria-label="Toggle percentage labels on pie slices"
                onClick={() => setShowPiePctLabels((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                  showPiePctLabels
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-black text-white/70 border-white/15'
                }`}
              >
                {showPiePctLabels ? '% Labels: ON' : '% Labels: OFF'}
              </button>
            </div>

            <div className="w-full min-h-[240px]">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={2}
                    label={showPiePctLabels ? renderPieLabel : false}
                    labelLine={showPiePctLabels}
                    isAnimationActive={false}
                  >
                    {pieChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#030508" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, _name: any, props: any) => [
                      `$${Number(val).toLocaleString()} (${props.payload.weightPct}%)`,
                      props.payload.name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#070A12',
                      borderColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {pieChartData.map((slice) => (
                <span
                  key={slice.name}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[11px] font-mono text-white/85 tabular-nums"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-bold text-white">{slice.name}</span>
                  <span className="text-white/60">{slice.weightPct}%</span>
                </span>
              ))}
            </div>

            {/* Balance Sheet Breakdown Bar */}
            <div className="p-3 rounded-lg bg-black/80 border border-white/10 space-y-2 text-xs font-mono tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-white/65">Liquidity Ratio (Cash / Total Assets):</span>
                <span className="text-blue-400 font-bold">
                  {netWorthSummary.liquidityRatioPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/65">Debt Service / Month:</span>
                <span className="text-red-400 font-bold">
                  ${netWorthSummary.totalMonthlyDebtService.toLocaleString()}/mo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/65">Net Annual Cash Carry (Yield − Interest):</span>
                <span className="text-emerald-400 font-bold">
                  ${(
                    netWorthSummary.annualCashYieldEstimate -
                    netWorthSummary.totalMonthlyDebtService * 12
                  ).toLocaleString()}
                  /yr
                </span>
              </div>
            </div>
          </div>

          {/* Investments Table & Position Editor */}
          <div className="lg:col-span-7 rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-display font-bold text-white">
                  Investments Holdings ({activePositions.length} Positions)
                </h3>
              </div>

              <form onSubmit={handleSaveInvestment} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={invTicker}
                  onChange={(e) => setInvTicker(e.target.value.toUpperCase())}
                  placeholder="Ticker"
                  aria-label="Investment Ticker"
                  className="w-20 px-2.5 py-1 rounded bg-black border border-white/15 text-xs font-mono text-white"
                />
                <input
                  type="number"
                  step="any"
                  value={invShares}
                  onChange={(e) => setInvShares(e.target.value)}
                  placeholder="Shares"
                  aria-label="Number of Shares"
                  className="w-20 px-2.5 py-1 rounded bg-black border border-white/15 text-xs font-mono text-white"
                />
                <input
                  type="number"
                  step="any"
                  value={invAvgCost}
                  onChange={(e) => setInvAvgCost(e.target.value)}
                  placeholder="Avg Cost"
                  aria-label="Average Cost Per Share"
                  className="w-24 px-2.5 py-1 rounded bg-black border border-white/15 text-xs font-mono text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save Position
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono text-white/60">
                    <th className="py-2 px-2.5">Asset</th>
                    <th className="py-2 px-2.5 text-right">Shares</th>
                    <th className="py-2 px-2.5 text-right">Avg Cost</th>
                    <th className="py-2 px-2.5 text-right">Live Price</th>
                    <th className="py-2 px-2.5 text-right">Market Value</th>
                    <th className="py-2 px-2.5 text-right">Unrealized P&L</th>
                    <th className="py-2 px-2.5 text-right">Weight</th>
                    <th className="py-2 px-2.5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-xs font-mono tabular-nums">
                  {activePositions.map((pos) => {
                    const isPos = pos.unrealizedPnL >= 0;
                    return (
                      <tr
                        key={pos.ticker}
                        onClick={() => onSelectTickerForTerminal(pos.ticker)}
                        className="hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-2.5 font-bold text-white">{pos.ticker}</td>
                        <td className="py-2.5 px-2.5 text-right text-white/85">{pos.shares}</td>
                        <td className="py-2.5 px-2.5 text-right text-white/70">
                          ${pos.avgCostPerShare.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-white font-semibold">
                          ${pos.currentPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-white font-bold">
                          ${pos.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`py-2.5 px-2.5 text-right font-semibold ${
                            isPos ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isPos ? '+' : ''}${pos.unrealizedPnL.toLocaleString()} (
                          {isPos ? '+' : ''}
                          {pos.unrealizedPnLPct.toFixed(1)}%)
                        </td>
                        <td className="py-2.5 px-2.5 text-right text-blue-400">
                          {pos.allocationWeightPct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateHolding(pos.ticker, 0, pos.avgCostPerShare);
                            }}
                            aria-label={`Remove ${pos.ticker}`}
                            className="p-1 text-white/50 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. CASH BALANCE & TREASURY LIQUIDITY ACCOUNTS                       */}
      {/* =================================================================== */}
      {(activeSubTab === 'overview' || activeSubTab === 'cash') && (
        <section
          aria-label="Cash Balance Accounts"
          className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Cash Balance & Institutional Liquidity Accounts ($
                  {netWorthSummary.totalCashBalance.toLocaleString()})
                </h3>
                <p className="text-xs text-white/60">
                  Treasury sweeps, money market reserves, and margin cash earning{' '}
                  {netWorthSummary.weightedCashApyPct.toFixed(2)}% weighted APY
                </p>
              </div>
            </div>

            <form onSubmit={handleAddCashAccount} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newCashName}
                onChange={(e) => setNewCashName(e.target.value)}
                placeholder="Account Name"
                aria-label="New Cash Account Name"
                className="w-40 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={newCashInstitution}
                onChange={(e) => setNewCashInstitution(e.target.value)}
                placeholder="Institution"
                aria-label="Cash Account Institution"
                className="w-36 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <input
                type="number"
                value={newCashBalance}
                onChange={(e) => setNewCashBalance(e.target.value)}
                placeholder="Balance ($)"
                aria-label="New Cash Account Balance"
                className="w-28 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <input
                type="number"
                step="0.01"
                value={newCashApy}
                onChange={(e) => setNewCashApy(e.target.value)}
                placeholder="APY %"
                aria-label="New Cash Account APY"
                className="w-20 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Cash Account
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 font-mono tabular-nums">
            {cashAccounts.map((acc) => {
              const annualYield = Number(((acc.balance * acc.apyPct) / 100).toFixed(0));
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl bg-black/80 border border-white/10 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-blue-400">
                      <span>{acc.institution}</span>
                      <span className="text-emerald-400 font-bold">{acc.apyPct.toFixed(2)}% APY</span>
                    </div>
                    <div className="text-sm font-sans font-bold text-white mt-1">
                      {acc.accountName}
                    </div>
                    <div className="text-xl font-bold text-white mt-2">
                      ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-white/60 mt-0.5">
                      Est. Annual Yield: +${annualYield.toLocaleString()}/yr
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleAdjustCash(acc.id, 10000)}
                      className="flex-1 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer"
                    >
                      +$10K Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustCash(acc.id, -10000)}
                      className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-white/75 text-xs font-semibold cursor-pointer"
                    >
                      -$10K Withdraw
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* 4. LIABILITIES, MARGIN LOANS & CREDIT FACILITIES                    */}
      {/* =================================================================== */}
      {(activeSubTab === 'overview' || activeSubTab === 'liabilities') && (
        <section
          aria-label="Liabilities and Credit Facilities"
          className="rounded-xl bg-[#070A12] border border-white/15 p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  Liabilities, Margin Loans & Credit Facilities ($
                  {netWorthSummary.totalLiabilities.toLocaleString()})
                </h3>
                <p className="text-xs text-white/60">
                  Manage debt obligations, margin leverage, and monthly debt service ($
                  {netWorthSummary.totalMonthlyDebtService.toLocaleString()}/mo)
                </p>
              </div>
            </div>

            <form onSubmit={handleAddLiability} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newLiabName}
                onChange={(e) => setNewLiabName(e.target.value)}
                placeholder="Liability Name"
                aria-label="New Liability Name"
                className="w-40 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <input
                type="text"
                value={newLiabLender}
                onChange={(e) => setNewLiabLender(e.target.value)}
                placeholder="Lender"
                aria-label="Liability Lender"
                className="w-36 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <input
                type="number"
                value={newLiabBalance}
                onChange={(e) => setNewLiabBalance(e.target.value)}
                placeholder="Balance ($)"
                aria-label="Liability Balance"
                className="w-28 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <input
                type="number"
                step="0.01"
                value={newLiabApr}
                onChange={(e) => setNewLiabApr(e.target.value)}
                placeholder="APR %"
                aria-label="Liability APR"
                className="w-20 px-2.5 py-1.5 rounded bg-black border border-white/15 text-xs font-mono text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Liability
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono tabular-nums">
            {liabilities.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-black/80 border border-white/10 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-white/70">{item.lender}</span>
                    <span className="text-red-400 font-bold">{item.aprPct.toFixed(2)}% APR</span>
                  </div>
                  <div className="text-sm font-sans font-bold text-white mt-1">{item.name}</div>
                  <div className="text-xl font-bold text-white mt-2">
                    ${item.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-white/60 mt-0.5">
                    Monthly Service: ${item.monthlyPayment.toLocaleString()}/mo · {item.dueDateLabel}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handlePaydownLiability(item.id, 5000)}
                    className="flex-1 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold cursor-pointer"
                  >
                    Pay Down $5K
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLiabilities((prev) => prev.filter((l) => l.id !== item.id))
                    }
                    aria-label={`Remove ${item.name}`}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-red-600/20 text-white/60 hover:text-red-300 text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
