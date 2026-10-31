import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { OpenSourceConnector, PortfolioHolding, UserProfile } from '../types/market';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const githubAuthProvider = new GithubAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
};
export type { User };

export async function syncUserWithBackendApi(
  user: User,
  fullName?: string
): Promise<OpenSourceConnector[]> {
  try {
    const token = await user.getIdToken();
    const providerId = user.providerData?.[0]?.providerId || 'google';
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: user.email,
        fullName: fullName || user.displayName || 'Institutional Analyst',
        authProvider: providerId,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.sources)) {
      return data.sources.map((s: any) => ({
        id: String(s.sourceKey || s.id),
        name: String(s.name),
        category: (s.category || 'MARKET_DATA') as OpenSourceConnector['category'],
        endpointUrl: String(s.endpointUrl),
        protocol: (s.protocol || 'REST_JSON') as OpenSourceConnector['protocol'],
        description: String(s.description || 'Custom device API / Open-Source feed'),
        enabled: Boolean(s.enabled),
        isCustom: true,
        lastSyncStatus: 'VERIFIED',
        lastSyncedAt: 'Synced',
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveSourceToBackendApi(
  user: User,
  connector: OpenSourceConnector
): Promise<void> {
  try {
    const token = await user.getIdToken();
    await fetch('/api/user/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(connector),
    });
  } catch {
    // Non-blocking fallback
  }
}

export async function deleteSourceFromBackendApi(
  user: User,
  sourceKey: string
): Promise<void> {
  try {
    const token = await user.getIdToken();
    await fetch(`/api/user/sources/${encodeURIComponent(sourceKey)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Non-blocking fallback
  }
}

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned.length > 0 ? cleaned : 'item_1';
}

export async function syncUserProfileToFirestore(
  user: User,
  profile: UserProfile
): Promise<void> {
  if (!user || !user.uid || !user.emailVerified) return;
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  const sanitizedPayload = {
    ownerId: user.uid.slice(0, 128),
    fullName: (profile.fullName || user.displayName || 'Institutional Analyst').slice(0, 80),
    roleTitle: (profile.roleTitle || 'Senior Quantitative Analyst').slice(0, 80),
    institution: (profile.institution || 'MarketMind Global Desk').slice(0, 100),
    email: (user.email || profile.email || 'analyst@marketmind.ai').slice(0, 160),
    avatarInitials: (profile.avatarInitials || 'MM').slice(0, 4).toUpperCase(),
    baseCurrency: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'].includes(profile.baseCurrency)
      ? profile.baseCurrency
      : 'USD',
    riskMandate: [
      'CONSERVATIVE',
      'BALANCED_QUANT',
      'AGGRESSIVE_ALPHA',
      'TAIL_RISK_HEDGED',
    ].includes(profile.riskMandate)
      ? profile.riskMandate
      : 'BALANCED_QUANT',
    preferredAIEngine: ['dual-gemma-gemini', 'gemma-4-31b', 'gemini-3.8-flash'].includes(
      profile.preferredAIEngine
    )
      ? profile.preferredAIEngine
      : 'dual-gemma-gemini',
    defaultRegion: (profile.defaultRegion || 'ALL').slice(0, 40),
    liveStreamAutoStart: Boolean(profile.liveStreamAutoStart),
    bioNotes: (profile.bioNotes || '').slice(0, 500),
  };

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        ...sanitizedPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        fullName: sanitizedPayload.fullName,
        roleTitle: sanitizedPayload.roleTitle,
        institution: sanitizedPayload.institution,
        email: sanitizedPayload.email,
        avatarInitials: sanitizedPayload.avatarInitials,
        baseCurrency: sanitizedPayload.baseCurrency,
        riskMandate: sanitizedPayload.riskMandate,
        preferredAIEngine: sanitizedPayload.preferredAIEngine,
        defaultRegion: sanitizedPayload.defaultRegion,
        liveStreamAutoStart: sanitizedPayload.liveStreamAutoStart,
        bioNotes: sanitizedPayload.bioNotes,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function loadUserProfileFromFirestore(
  user: User
): Promise<Partial<UserProfile> | null> {
  if (!user || !user.uid || !user.emailVerified) return null;
  const userPath = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      fullName: data.fullName,
      roleTitle: data.roleTitle,
      institution: data.institution,
      email: data.email,
      avatarInitials: data.avatarInitials,
      baseCurrency: data.baseCurrency,
      riskMandate: data.riskMandate,
      preferredAIEngine: data.preferredAIEngine,
      defaultRegion: data.defaultRegion,
      liveStreamAutoStart: data.liveStreamAutoStart,
      bioNotes: data.bioNotes,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }
}

export async function saveConnectorToFirestore(
  user: User,
  connector: OpenSourceConnector
): Promise<void> {
  if (!user || !user.uid || !user.emailVerified) return;
  const connectorId = sanitizeId(connector.id);
  const path = `users/${user.uid}/connectors/${connectorId}`;
  const ref = doc(db, 'users', user.uid, 'connectors', connectorId);

  const sanitized = {
    ownerId: user.uid.slice(0, 128),
    name: (connector.name || 'Open Source Feed').slice(0, 80),
    category: [
      'MARKET_DATA',
      'NEWS_WIRE',
      'MACRO_ECON',
      'ON_CHAIN_ALT',
      'AI_ENDPOINT',
    ].includes(connector.category)
      ? connector.category
      : 'MARKET_DATA',
    endpointUrl: (connector.endpointUrl || 'https://finance.yahoo.com').slice(0, 300),
    protocol: ['REST_JSON', 'RSS_XML', 'GRAPHQL', 'OPEN_API'].includes(connector.protocol)
      ? connector.protocol
      : 'REST_JSON',
    description: (connector.description || 'Institutional open-source connector').slice(0, 250),
    enabled: Boolean(connector.enabled),
    lastSyncStatus: ['VERIFIED', 'OFFLINE', 'UNTESTED'].includes(
      connector.lastSyncStatus || 'UNTESTED'
    )
      ? connector.lastSyncStatus || 'UNTESTED'
      : 'UNTESTED',
  };

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        name: sanitized.name,
        category: sanitized.category,
        endpointUrl: sanitized.endpointUrl,
        protocol: sanitized.protocol,
        description: sanitized.description,
        enabled: sanitized.enabled,
        lastSyncStatus: sanitized.lastSyncStatus,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteConnectorFromFirestore(
  user: User,
  connectorId: string
): Promise<void> {
  if (!user || !user.uid || !user.emailVerified) return;
  const cleanId = sanitizeId(connectorId);
  const path = `users/${user.uid}/connectors/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'connectors', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePortfolioPositionToFirestore(
  user: User,
  holding: PortfolioHolding
): Promise<void> {
  if (!user || !user.uid || !user.emailVerified) return;
  const posId = sanitizeId(holding.ticker);
  const path = `users/${user.uid}/positions/${posId}`;
  const ref = doc(db, 'users', user.uid, 'positions', posId);

  try {
    if (holding.shares <= 0) {
      await deleteDoc(ref);
      return;
    }
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerId: user.uid.slice(0, 128),
        ticker: posId.slice(0, 16),
        shares: Math.min(1000000000, Math.max(0.0001, Number(holding.shares))),
        avgCostPerShare: Math.min(10000000, Math.max(0.01, Number(holding.avgCostPerShare))),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        shares: Math.min(1000000000, Math.max(0.0001, Number(holding.shares))),
        avgCostPerShare: Math.min(10000000, Math.max(0.01, Number(holding.avgCostPerShare))),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadPortfolioPositionsFromFirestore(
  user: User
): Promise<PortfolioHolding[]> {
  if (!user || !user.uid || !user.emailVerified) return [];
  const path = `users/${user.uid}/positions`;
  try {
    const snap = await getDocs(collection(db, 'users', user.uid, 'positions'));
    const list: PortfolioHolding[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.ownerId === user.uid && d.ticker && Number(d.shares) > 0) {
        list.push({
          ticker: String(d.ticker),
          shares: Number(d.shares),
          avgCostPerShare: Number(d.avgCostPerShare || 100),
          updatedAt: new Date().toISOString(),
        });
      }
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
