import React, { useState } from 'react';
import {
  User as UserIcon,
  X,
  CheckCircle2,
  Sparkles,
  LogIn,
  LogOut,
  Database,
  Plus,
  Mail,
  KeyRound,
  Upload,
  Download,
  Globe,
  Laptop,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  AIEngineSelection,
  MarketRegion,
  OpenSourceConnector,
  UserProfile,
} from '../types/market';
import { User } from '../lib/firebase';

export interface LocalAccountSession {
  uid: string;
  email: string;
  displayName: string;
  provider: 'email' | 'github' | 'google';
  createdAt: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  firebaseUser: User | null;
  localAccount?: LocalAccountSession | null;
  onGoogleSignIn: () => Promise<void>;
  onGithubSignIn: () => Promise<void>;
  onEmailAuth: (
    mode: 'signup' | 'login',
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  onSignOutAll: () => Promise<void>;
  openSources: OpenSourceConnector[];
  onToggleOpenSource: (id: string) => void;
  onAddOpenSource: (connector: OpenSourceConnector) => void;
  onDeleteOpenSource?: (id: string) => void;
  onOpenGitHubDeviceModal?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  firebaseUser,
  localAccount,
  onGoogleSignIn,
  onGithubSignIn,
  onEmailAuth,
  onSignOutAll,
  openSources,
  onToggleOpenSource,
  onAddOpenSource,
  onDeleteOpenSource,
  onOpenGitHubDeviceModal,
}) => {
  const [formState, setFormState] = useState<UserProfile>(profile);
  const [activeModalTab, setActiveModalTab] = useState<'account' | 'profile' | 'sources'>(
    firebaseUser || localAccount ? 'profile' : 'account'
  );
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [authNotice, setAuthNotice] = useState<string>('');

  // Account Creation / Login via Email, GitHub, or Google
  const [emailAuthMode, setEmailAuthMode] = useState<'signup' | 'login'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Add Custom API or Open Source from Device state
  const [quickSourceName, setQuickSourceName] = useState('');
  const [quickSourceUrl, setQuickSourceUrl] = useState('');
  const [quickSourceCategory, setQuickSourceCategory] =
    useState<OpenSourceConnector['category']>('AI_ENDPOINT');
  const [quickSourceProtocol, setQuickSourceProtocol] =
    useState<OpenSourceConnector['protocol']>('REST_JSON');
  const [quickSourceDesc, setQuickSourceDesc] = useState('');

  if (!isOpen) return null;

  const isAuthenticated = Boolean(firebaseUser || localAccount);
  const activeEmail = firebaseUser?.email || localAccount?.email || formState.email;
  const activeProviderLabel = firebaseUser
    ? firebaseUser.providerData?.[0]?.providerId === 'github.com'
      ? 'GitHub Account'
      : firebaseUser.providerData?.[0]?.providerId === 'password'
      ? 'Email Account'
      : 'Google Account'
    : localAccount
    ? `${localAccount.provider.toUpperCase()} Account`
    : 'Not Signed In';

  const showBanner = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 3200);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
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
    showBanner('Analyst profile & preferences saved across MarketMind AI & Cloud SQL.');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter a valid email address and password (minimum 6 characters).');
      return;
    }
    if (authPassword.trim().length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmittingAuth(true);
    try {
      await onEmailAuth(
        emailAuthMode,
        authEmail.trim(),
        authPassword.trim(),
        authFullName.trim() || formState.fullName
      );
      setAuthPassword('');
      setAuthNotice(
        emailAuthMode === 'signup'
          ? `Account created and signed in as ${authEmail.trim()}.`
          : `Signed in as ${authEmail.trim()}.`
      );
      setActiveModalTab('profile');
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleQuickAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSourceName.trim() || !quickSourceUrl.trim()) return;
    const rawUrl = quickSourceUrl.trim();
    const cleanUrl =
      rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
        ? rawUrl
        : `https://${rawUrl}`;

    onAddOpenSource({
      id: `custom-${Date.now()}`,
      name: quickSourceName.trim().slice(0, 80),
      category: quickSourceCategory,
      endpointUrl: cleanUrl.slice(0, 300),
      protocol: quickSourceProtocol,
      description:
        quickSourceDesc.trim().slice(0, 250) ||
        'Custom API / Open-Source feed added from user device.',
      enabled: true,
      isCustom: true,
      lastSyncStatus: 'VERIFIED',
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setQuickSourceName('');
    setQuickSourceUrl('');
    setQuickSourceDesc('');
    showBanner('Custom API / Open-Source connector added and synced.');
  };

  // Import API / Open-Source config JSON from the user's own device
  const handleImportDeviceConfigFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || '{}'));
        const list = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.openSources)
          ? parsed.openSources
          : Array.isArray(parsed.apis)
          ? parsed.apis
          : [parsed];

        let addedCount = 0;
        list.forEach((item: any, idx: number) => {
          if (item && item.name && item.endpointUrl) {
            onAddOpenSource({
              id: String(item.id || `device-api-${Date.now()}-${idx}`),
              name: String(item.name).slice(0, 80),
              category: item.category || 'AI_ENDPOINT',
              endpointUrl: String(item.endpointUrl).slice(0, 300),
              protocol: item.protocol || 'REST_JSON',
              description:
                String(item.description || 'Imported from local device JSON file').slice(0, 250),
              enabled: true,
              isCustom: true,
              lastSyncStatus: 'VERIFIED',
              lastSyncedAt: 'Device Import',
            });
            addedCount++;
          }
        });

        if (parsed.profile && typeof parsed.profile === 'object') {
          const mergedProfile = { ...formState, ...parsed.profile };
          setFormState(mergedProfile);
          onSaveProfile(mergedProfile);
        }

        if (addedCount > 0) {
          showBanner(`Imported ${addedCount} custom API / open-source feed(s) from your device!`);
        } else {
          setAuthError('JSON file did not contain valid { name, endpointUrl } API definitions.');
        }
      } catch {
        setAuthError('Could not parse JSON file from your device.');
      }
    };
    reader.readAsText(file);
  };

  // Export current APIs, Open Sources & Profile to user's own device
  const handleExportDeviceConfigFile = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      application: 'MarketMind AI — Riddle UI Institutional Terminal',
      repository: 'https://github.com/marketmind-ai/marketmind-terminal',
      profile: formState,
      openSources,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketmind-device-apis-and-sources.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="riddle-panel max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-white font-mono font-bold text-sm">
              {formState.avatarInitials || 'FI'}
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                Flores Industries Account, Custom Device APIs & Cloud Identity
                <span className="px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-[10px] font-mono text-blue-300">
                  {isAuthenticated ? `${activeProviderLabel} · ACTIVE` : 'CREATE ACCOUNT / SIGN IN'}
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Create an account or log in exclusively with your Email Address, GitHub, or Google, and connect APIs or open sources from your own device.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Account Modal"
            className="p-1.5 rounded-xl bg-[#070A12] hover:bg-red-950/60 text-white/60 hover:text-white border border-white/15 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-navigation inside Modal */}
        <div className="px-6 pt-3 bg-[#05070D] border-b border-white/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveModalTab('account')}
              className={`px-3.5 py-2 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTab === 'account'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              Account Login (Email · GitHub · Google)
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('sources')}
              className={`px-3.5 py-2 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTab === 'sources'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-red-400" />
              Device APIs & Open Sources ({openSources.filter((s) => s.enabled).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('profile')}
              className={`px-3.5 py-2 text-xs font-mono border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeModalTab === 'profile'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-white" />
              Analyst Desk Profile
            </button>
          </div>

          {isAuthenticated && (
            <div className="pb-2">
              <button
                type="button"
                onClick={async () => {
                  setAuthError('');
                  await onSignOutAll();
                }}
                className="px-3 py-1 rounded-xl bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-[11px] font-mono text-red-200 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                Sign Out ({activeEmail.split('@')[0]})
              </button>
            </div>
          )}
        </div>

        {authError && (
          <div className="mx-6 mt-3 px-3.5 py-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
            {authError}
          </div>
        )}

        {authNotice && (
          <div className="mx-6 mt-3 px-3.5 py-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{authNotice}</span>
          </div>
        )}

        {savedBanner && (
          <div className="mx-6 mt-3 px-3.5 py-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{savedBanner}</span>
          </div>
        )}

        {/* TAB 1: ACCOUNT CREATION & LOGIN (EMAIL, GITHUB, GOOGLE ONLY) */}
        {activeModalTab === 'account' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Active Account Status Banner */}
            <div className="riddle-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold text-white">
                    {isAuthenticated
                      ? `Signed In as ${activeEmail} (${activeProviderLabel})`
                      : 'Create an Account or Sign In to Sync Across Your Devices'}
                  </div>
                  <div className="text-[11px] font-mono text-white/60">
                    Supported login providers: Email Address, GitHub, or Google · Cloud SQL + Firebase Auth
                  </div>
                </div>
              </div>

              {onOpenGitHubDeviceModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGitHubDeviceModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-mono text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Keep Repo on Your Device</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Create Account / Log In with Email Address */}
              <form
                onSubmit={handleEmailSubmit}
                data-testid="email-auth-form"
                className="md:col-span-7 riddle-card p-4 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] pb-2.5">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>
                      {emailAuthMode === 'signup'
                        ? '1. Create Account with Email'
                        : '1. Log In with Email'}
                    </span>
                  </span>

                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#090C15] border border-white/[0.08] text-[11px] font-mono shrink-0">
                    <button
                      type="button"
                      onClick={() => setEmailAuthMode('signup')}
                      className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap shrink-0 ${
                        emailAuthMode === 'signup'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Create Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailAuthMode('login')}
                      className={`px-2.5 py-1 rounded-md cursor-pointer whitespace-nowrap shrink-0 ${
                        emailAuthMode === 'login'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Log In
                    </button>
                  </div>
                </div>

                {emailAuthMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Full Name / Desk Handle
                    </label>
                    <input
                      type="text"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="Alex Morgan, CFA"
                      className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="analyst@institution.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {emailAuthMode === 'signup'
                      ? 'Create Account with Email'
                      : 'Sign In with Email'}
                  </span>
                </button>
              </form>

              {/* Right Column: OAuth Providers (GitHub & Google) */}
              <div className="md:col-span-5 riddle-card p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-white block border-b border-white/[0.07] pb-2.5">
                    2. Or Sign In with GitHub or Google
                  </span>

                  {/* GitHub Login Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setAuthError('');
                      try {
                        await onGithubSignIn();
                      } catch (e: any) {
                        setAuthError(
                          e?.message ||
                            'GitHub Sign-In requires enabling the GitHub provider in Firebase Console or running locally.'
                        );
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#181F2E] hover:bg-[#222B40] border border-white/15 text-xs font-mono font-bold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-slate-200" />
                    <span>Continue with GitHub</span>
                  </button>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setAuthError('');
                      try {
                        await onGoogleSignIn();
                      } catch (e: any) {
                        setAuthError(
                          e?.message ||
                            'Google Sign-In popup was closed or blocked in preview.'
                        );
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/40 text-xs font-mono font-bold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-blue-300" />
                    <span>Continue with Google</span>
                  </button>
                </div>

                {/* Firebase Console Provider Setup Guide */}
                <div className="p-3 rounded-xl bg-[#090C15] border border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="text-slate-200 font-bold">
                    Firebase Console Provider Setup:
                  </div>
                  <p className="leading-relaxed">
                    Google Sign-In is pre-configured. To enable live Firebase Email/Password or GitHub OAuth in production, open{' '}
                    <span className="text-blue-400">
                      Firebase Console → Authentication → Sign-in method
                    </span>{' '}
                    for project <code className="text-white">cool-amplifier-pbvhw</code> and toggle on Email/Password & GitHub.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD CUSTOM API OR OPEN SOURCES FROM USER'S OWN DEVICE */}
        {activeModalTab === 'sources' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Device Import / Export Bar */}
            <div className="riddle-card p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span>Connect Custom APIs or Open Sources from Your Own Device</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Add localhost endpoints (e.g. <code>http://127.0.0.1:11434</code>), custom REST/GraphQL APIs, or import/export a JSON config file from your computer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-[#090C15] hover:bg-white/5 border border-white/[0.1] text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Import Device JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportDeviceConfigFile}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleExportDeviceConfigFile}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-mono text-blue-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save APIs to Device</span>
                </button>
              </div>
            </div>

            {/* Add Custom API / Open Source Form */}
            <form
              onSubmit={handleQuickAddSource}
              className="riddle-card p-4 space-y-3"
            >
              <div className="text-xs font-mono font-bold text-white">
                Add Custom API or Open-Source Endpoint
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <input
                  type="text"
                  required
                  value={quickSourceName}
                  onChange={(e) => setQuickSourceName(e.target.value)}
                  placeholder="API / Source Name (e.g. Local Ollama / Polygon / Custom Feed)"
                  className="sm:col-span-4 px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={quickSourceUrl}
                  onChange={(e) => setQuickSourceUrl(e.target.value)}
                  placeholder="http://127.0.0.1:11434/api/chat or https://api.example.com/v1"
                  className="sm:col-span-5 px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white"
                />
                <select
                  value={quickSourceCategory}
                  onChange={(e) =>
                    setQuickSourceCategory(e.target.value as OpenSourceConnector['category'])
                  }
                  className="sm:col-span-3 px-2.5 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white"
                >
                  <option value="AI_ENDPOINT">Custom AI / LLM API</option>
                  <option value="MARKET_DATA">Market Data API</option>
                  <option value="NEWS_WIRE">Open News Wire</option>
                  <option value="MACRO_ECON">Macro Economic API</option>
                  <option value="ON_CHAIN_ALT">On-Chain / Alt Data</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <select
                  value={quickSourceProtocol}
                  onChange={(e) =>
                    setQuickSourceProtocol(e.target.value as OpenSourceConnector['protocol'])
                  }
                  className="sm:col-span-3 px-2.5 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white"
                >
                  <option value="REST_JSON">REST JSON</option>
                  <option value="OPEN_API">OpenAPI / Local</option>
                  <option value="GRAPHQL">GraphQL</option>
                  <option value="RSS_XML">RSS / XML</option>
                </select>
                <input
                  type="text"
                  value={quickSourceDesc}
                  onChange={(e) => setQuickSourceDesc(e.target.value)}
                  placeholder="Optional description or local device port note..."
                  className="sm:col-span-6 px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs text-white"
                />
                <button
                  type="submit"
                  className="sm:col-span-3 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add API / Source</span>
                </button>
              </div>
            </form>

            {/* List of Configured APIs & Open Sources */}
            <div className="space-y-2">
              {openSources.map((src) => (
                <div
                  key={src.id}
                  className="p-3 rounded-xl bg-[#090C15] border border-white/[0.08] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex flex-wrap items-center gap-2">
                      <span>{src.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-600/20 border border-blue-500/30 text-[10px] font-mono text-blue-300">
                        {src.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300">
                        {src.protocol}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {src.description}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {src.endpointUrl}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleOpenSource(src.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border cursor-pointer ${
                        src.enabled
                          ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                          : 'bg-[#131A2A] border-white/10 text-slate-400'
                      }`}
                    >
                      {src.enabled ? 'ACTIVE' : 'DISABLED'}
                    </button>
                    {src.isCustom && onDeleteOpenSource && (
                      <button
                        type="button"
                        onClick={() => onDeleteOpenSource(src.id)}
                        title="Remove custom API source"
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYST PROFILE */}
        {activeModalTab === 'profile' && (
          <form onSubmit={handleSubmitProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-sm font-mono text-center text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.08]">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-blue-500"
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
                    className="px-2 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white"
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
                    className="px-2 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs font-mono text-white"
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
                className="w-full px-3 py-2 rounded-xl bg-[#090C15] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.liveStreamAutoStart}
                  onChange={(e) =>
                    setFormState({ ...formState, liveStreamAutoStart: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950 text-blue-600"
                />
                Auto-start Live Exchange Tick Stream on launch
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#131A2A] hover:bg-[#1A2338] text-xs font-mono text-slate-300 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Analyst Profile
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
