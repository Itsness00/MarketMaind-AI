import React, { useState } from 'react';
import {
  User as UserIcon,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  LogIn,
  LogOut,
  Cloud,
  Database,
  Plus,
} from 'lucide-react';
import {
  AIEngineSelection,
  MarketRegion,
  OpenSourceConnector,
  UserProfile,
} from '../types/market';
import { User } from '../lib/firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  firebaseUser: User | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  openSources: OpenSourceConnector[];
  onToggleOpenSource: (id: string) => void;
  onAddOpenSource: (connector: OpenSourceConnector) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  firebaseUser,
  onGoogleSignIn,
  onGoogleSignOut,
  openSources,
  onToggleOpenSource,
  onAddOpenSource,
}) => {
  const [formState, setFormState] = useState<UserProfile>(profile);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'sources'>('profile');
  const [savedBanner, setSavedBanner] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Quick Add Open Source state inside modal
  const [quickSourceName, setQuickSourceName] = useState('');
  const [quickSourceUrl, setQuickSourceUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initials =
      formState.avatarInitials.trim().slice(0, 4).toUpperCase() ||
      formState.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ||
      'MM';

    const updated: UserProfile = {
      ...formState,
      fullName: formState.fullName.trim().slice(0, 80) || 'Institutional Analyst',
      roleTitle: formState.roleTitle.trim().slice(0, 80) || 'Quantitative Portfolio Manager',
      institution: formState.institution.trim().slice(0, 100) || 'MarketMind Global Desk',
      email: formState.email.trim().slice(0, 160) || 'analyst@marketmind.ai',
      avatarInitials: initials,
      bioNotes: formState.bioNotes.slice(0, 500),
      updatedAt: new Date().toISOString(),
    };

    onSaveProfile(updated);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleQuickAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSourceName.trim() || !quickSourceUrl.trim()) return;
    const cleanUrl = quickSourceUrl.trim().startsWith('http')
      ? quickSourceUrl.trim()
      : `https://${quickSourceUrl.trim()}`;

    onAddOpenSource({
      id: `custom-${Date.now()}`,
      name: quickSourceName.trim().slice(0, 80),
      category: 'MARKET_DATA',
      endpointUrl: cleanUrl.slice(0, 300),
      protocol: 'REST_JSON',
      description: 'User-configured open-source feed via Analyst Profile.',
      enabled: true,
      isCustom: true,
      lastSyncStatus: 'VERIFIED',
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setQuickSourceName('');
    setQuickSourceUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-mono font-bold text-sm">
              {formState.avatarInitials || 'MM'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Analyst Profile & Cloud Identity
                <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                  {firebaseUser ? 'FIREBASE CLOUD SYNCED' : 'LOCAL + CLOUD READY'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure your institutional desk identity, default AI engine, and open-source data
                connectors.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-navigation inside Modal */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveModalTab('profile')}
              className={`px-3 py-2 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
                activeModalTab === 'profile'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Analyst Identity & AI Preferences
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('sources')}
              className={`px-3 py-2 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 ${
                activeModalTab === 'sources'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Open-Source Connectors ({openSources.filter((s) => s.enabled).length})
            </button>
          </div>

          {/* Firebase Google Sign-In Status Pill */}
          <div className="pb-2">
            {firebaseUser ? (
              <button
                type="button"
                onClick={async () => {
                  setAuthError('');
                  try {
                    await onGoogleSignOut();
                  } catch (e: any) {
                    setAuthError(e?.message || 'Sign-out failed');
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/50 border border-slate-700 text-[11px] font-mono text-slate-300 hover:text-rose-300 flex items-center gap-1.5"
              >
                <LogOut className="w-3 h-3" />
                Sign Out ({firebaseUser.email?.split('@')[0]})
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setAuthError('');
                  try {
                    await onGoogleSignIn();
                  } catch (e: any) {
                    setAuthError(
                      'Google Sign-In popup was closed or blocked in preview. Your profile is still saved locally.'
                    );
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-[11px] font-mono text-indigo-300 flex items-center gap-1.5"
              >
                <LogIn className="w-3 h-3" />
                Sign in with Google (Firebase Cloud Sync)
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono">
            {authError}
          </div>
        )}

        {savedBanner && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Analyst profile & preferences saved and applied across MarketMind AI.
          </div>
        )}

        {activeModalTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Full Name / Handle
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Role / Quantitative Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={formState.roleTitle}
                  onChange={(e) => setFormState({ ...formState, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Institution / Trading Desk
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formState.institution}
                  onChange={(e) => setFormState({ ...formState, institution: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Desk Email
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={160}
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Badge Initials
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formState.avatarInitials}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        avatarInitials: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-center text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Preferred AI Engine
                </label>
                <select
                  value={formState.preferredAIEngine}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      preferredAIEngine: e.target.value as AIEngineSelection,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="dual-gemma-gemini">Gemma 4 + Gemini 3.8 (Dual)</option>
                  <option value="gemma-4-31b">Google Gemma 4:31B</option>
                  <option value="gemini-3.8-flash">Google Gemini 3.8 Flash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Risk Mandate
                </label>
                <select
                  value={formState.riskMandate}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      riskMandate: e.target.value as UserProfile['riskMandate'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="BALANCED_QUANT">Balanced Quant</option>
                  <option value="CONSERVATIVE">Conservative Preservation</option>
                  <option value="AGGRESSIVE_ALPHA">Aggressive Alpha</option>
                  <option value="TAIL_RISK_HEDGED">Tail-Risk Hedged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Base Currency & Region
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={formState.baseCurrency}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        baseCurrency: e.target.value as UserProfile['baseCurrency'],
                      })
                    }
                    className="px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                  <select
                    value={formState.defaultRegion}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        defaultRegion: e.target.value as 'ALL' | MarketRegion,
                      })
                    }
                    className="px-2 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                  >
                    <option value="ALL">Global</option>
                    <option value="US (NYSE & NASDAQ)">US</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia-Pacific">APAC</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Investment Mandate & Quantitative Notes
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={formState.bioNotes}
                onChange={(e) => setFormState({ ...formState, bioNotes: e.target.value })}
                placeholder="Document your desk's factor tilt, VaR limits, or focus sectors..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.liveStreamAutoStart}
                  onChange={(e) =>
                    setFormState({ ...formState, liveStreamAutoStart: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                />
                Auto-start Live Exchange Tick Stream on launch
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Analyst Profile
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <form onSubmit={handleQuickAddSource} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={quickSourceName}
                onChange={(e) => setQuickSourceName(e.target.value)}
                placeholder="Open-Source Name (e.g. Finnhub / WorldBank)"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <input
                type="text"
                required
                value={quickSourceUrl}
                onChange={(e) => setQuickSourceUrl(e.target.value)}
                placeholder="https://api.example.org/v1/feed"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Feed
              </button>
            </form>

            <div className="space-y-2">
              {openSources.map((src) => (
                <div
                  key={src.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {src.name}
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-indigo-300">
                        {src.protocol}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{src.description}</div>
                    <div className="text-[10px] font-mono text-slate-500">{src.endpointUrl}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleOpenSource(src.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono border ${
                      src.enabled
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {src.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
