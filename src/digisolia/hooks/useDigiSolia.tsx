import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  DigiSoliaAppConfig,
  DigiSoliaAppRecord,
  DigiSoliaUserProfile,
  DigiSoliaAdminRecord,
  DigiSoliaAdminRole,
  DigiSoliaFeedbackItem,
  DigiSoliaSupportTicket,
  DigiSoliaNotificationItem,
  DigiSoliaPreferences,
  OfflineQueueItem,
  DIGISOLIA_ROLE_MATRIX,
  RolePermissions
} from '../types';
import {
  DIGISOLIA_DEFAULT_CONFIG,
  DIGISOLIA_ECOSYSTEM_APPS
} from '../config/digisolia.config';
import { dafAuth, dafLoginWithGoogle, dafLogoutUser } from '../services/firebaseAdapter';
import {
  subscribeToDigiSoliaApps,
  syncOrFetchUserProfile,
  fetchAdminRecord,
  subscribeToUserFeedback,
  subscribeToUserSupportTickets,
  subscribeToNotifications,
  flushOfflineQueue,
  submitFeedbackToFirestore,
  submitSupportTicketToFirestore,
  updateUserProfileFields,
  seedDigiSoliaAppsIfEmpty
} from '../services/digisoliaService';
import {
  loadOfflineQueue,
  enqueueOfflineItem,
  checkAntiSpamLimit,
  recordAntiSpamSubmission
} from '../services/offlineQueueService';

const PREFS_KEY = 'daf_preferences_v1';
const WELCOME_SEEN_KEY = 'daf_welcome_seen_v1';
const READ_NOTIFS_KEY = 'daf_read_notifications_v1';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'pending' | 'error';

interface DigiSoliaContextValue {
  config: DigiSoliaAppConfig;
  apps: DigiSoliaAppRecord[];
  firebaseUser: FirebaseUser | null;
  userProfile: DigiSoliaUserProfile | null;
  adminRole: DigiSoliaAdminRole | null;
  adminPermissions: RolePermissions | null;
  isAnyAdmin: boolean;
  isOnline: boolean;
  syncState: SyncState;
  offlineQueue: OfflineQueueItem[];
  syncNow: () => Promise<{ synced: number; remaining: number; errors: number }>;
  userFeedbacks: DigiSoliaFeedbackItem[];
  userTickets: DigiSoliaSupportTicket[];
  notifications: DigiSoliaNotificationItem[];
  readNotificationIds: string[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  preferences: DigiSoliaPreferences;
  updatePreferences: (patch: Partial<DigiSoliaPreferences>) => void;
  hasSeenWelcome: boolean;
  completeWelcome: () => void;
  reopenWelcome: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  submitFeedback: (input: {
    category: DigiSoliaFeedbackItem['category'];
    rating?: number;
    message: string;
  }) => Promise<{ ok: boolean; offline?: boolean; error?: string }>;
  submitSupport: (input: {
    subject: string;
    priority: 'normale' | 'urgente';
    message: string;
  }) => Promise<{ ok: boolean; offline?: boolean; error?: string }>;
  saveUserProfile: (updates: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<{ ok: boolean; offline?: boolean; error?: string }>;
}

const DigiSoliaContext = createContext<DigiSoliaContextValue | null>(null);

interface DigiSoliaProviderProps {
  config?: DigiSoliaAppConfig;
  children: React.ReactNode;
}

export const DigiSoliaProvider: React.FC<DigiSoliaProviderProps> = ({
  config = DIGISOLIA_DEFAULT_CONFIG,
  children
}) => {
  const [apps, setApps] = useState<DigiSoliaAppRecord[]>(DIGISOLIA_ECOSYSTEM_APPS);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<DigiSoliaUserProfile | null>(null);
  const [adminRecord, setAdminRecord] = useState<DigiSoliaAdminRecord | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => loadOfflineQueue());

  const [userFeedbacks, setUserFeedbacks] = useState<DigiSoliaFeedbackItem[]>([]);
  const [userTickets, setUserTickets] = useState<DigiSoliaSupportTicket[]>([]);
  const [notifications, setNotifications] = useState<DigiSoliaNotificationItem[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(READ_NOTIFS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [preferences, setPreferences] = useState<DigiSoliaPreferences>(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
    return {
      language: 'fr',
      notificationsEnabled: true,
      includeTechDiagnostics: true
    };
  });

  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(() => {
    try {
      return localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Track online/offline state
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Auth state & admin role resolution
  useEffect(() => {
    const unsub = onAuthStateChanged(dafAuth, async user => {
      setFirebaseUser(user);
      if (user) {
        try {
          const prof = await syncOrFetchUserProfile(user, config.appId);
          setUserProfile(prof);
          const adm = await fetchAdminRecord(user.uid);
          setAdminRecord(adm);

          // Seed ecosystem apps if super admin
          const isBootstrapped =
            Boolean(user.emailVerified) &&
            Boolean(user.email) &&
            config.bootstrappedSuperAdminEmails.includes(user.email!);
          if (isBootstrapped || adm?.role === 'super_admin') {
            seedDigiSoliaAppsIfEmpty().catch(() => {});
          }
        } catch (err) {
          console.warn('Chargement profil DigiSolia différé (mode local/hors ligne):', err);
        }
      } else {
        setUserProfile(null);
        setAdminRecord(null);
        setUserFeedbacks([]);
        setUserTickets([]);
      }
    });
    return () => unsub();
  }, [config.appId, config.bootstrappedSuperAdminEmails]);

  // Subscribe to public apps & notifications
  useEffect(() => {
    const unsubApps = subscribeToDigiSoliaApps(cloudApps => setApps(cloudApps));
    const unsubNotifs = subscribeToNotifications(config.appId, list => setNotifications(list));
    return () => {
      unsubApps();
      unsubNotifs();
    };
  }, [config.appId]);

  // Subscribe to current user's own feedback & support tickets
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubFb = subscribeToUserFeedback(config.appId, firebaseUser.uid, setUserFeedbacks);
    const unsubSp = subscribeToUserSupportTickets(config.appId, firebaseUser.uid, setUserTickets);
    return () => {
      unsubFb();
      unsubSp();
    };
  }, [firebaseUser, config.appId]);

  // Auto-flush offline queue when connection returns & user is authenticated
  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(false);
    try {
      const res = await flushOfflineQueue();
      setOfflineQueue(loadOfflineQueue());
      if (res.errors > 0) setSyncError(true);
      return res;
    } catch {
      setSyncError(true);
      return { synced: 0, remaining: loadOfflineQueue().length, errors: 1 };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isOnline && firebaseUser && offlineQueue.length > 0) {
      syncNow().catch(() => {});
    }
  }, [isOnline, firebaseUser, offlineQueue.length, syncNow]);

  // Role computation
  const isBootstrappedSuperAdmin =
    Boolean(firebaseUser?.emailVerified) &&
    Boolean(firebaseUser?.email) &&
    config.bootstrappedSuperAdminEmails.includes(firebaseUser!.email!);

  const adminRole: DigiSoliaAdminRole | null = isBootstrappedSuperAdmin
    ? 'super_admin'
    : adminRecord?.role || null;

  const adminPermissions = adminRole ? DIGISOLIA_ROLE_MATRIX[adminRole] : null;
  const isAnyAdmin = adminRole !== null;

  const syncState: SyncState = !isOnline
    ? 'offline'
    : isSyncing
    ? 'syncing'
    : syncError
    ? 'error'
    : offlineQueue.length > 0
    ? 'pending'
    : 'synced';

  const updatePreferences = (patch: Partial<DigiSoliaPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const completeWelcome = () => {
    setHasSeenWelcome(true);
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const reopenWelcome = () => {
    setHasSeenWelcome(false);
  };

  const markNotificationRead = (id: string) => {
    setReadNotificationIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(allIds));
    } catch {
      // ignore
    }
  };

  const unreadNotificationsCount = notifications.filter(
    n => !readNotificationIds.includes(n.id)
  ).length;

  const login = async () => {
    await dafLoginWithGoogle();
  };

  const logout = async () => {
    await dafLogoutUser();
  };

  // Merge pending offline feedback & support items with synced items for immediate UI visibility
  const pendingOfflineFeedbacks: DigiSoliaFeedbackItem[] = offlineQueue
    .filter(q => q.kind === 'feedback' && q.appId === config.appId)
    .map(q => ({
      ...(q.payload as unknown as DigiSoliaFeedbackItem),
      pendingOffline: true
    }));

  const pendingOfflineTickets: DigiSoliaSupportTicket[] = offlineQueue
    .filter(q => q.kind === 'support' && q.appId === config.appId)
    .map(q => ({
      ...(q.payload as unknown as DigiSoliaSupportTicket),
      pendingOffline: true
    }));

  const submitFeedback = async (input: {
    category: DigiSoliaFeedbackItem['category'];
    rating?: number;
    message: string;
  }) => {
    const trimmed = input.message.trim();
    if (trimmed.length < 5 || trimmed.length > 2000) {
      return {
        ok: false,
        error: 'Votre message doit contenir entre 5 et 2 000 caractères.'
      };
    }

    const spamCheck = checkAntiSpamLimit('feedback', trimmed);
    if (!spamCheck.allowed) {
      return { ok: false, error: spamCheck.reason };
    }

    const item: DigiSoliaFeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appId: config.appId,
      userId: firebaseUser?.uid || 'local_pending',
      userEmail: firebaseUser?.email || 'utilisateur@local',
      userName:
        userProfile
          ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
          : firebaseUser?.displayName || 'Utilisateur local',
      category: input.category,
      rating: input.rating,
      message: trimmed,
      status: 'en_attente',
      createdAt: new Date().toISOString()
    };

    if (!isOnline || !firebaseUser) {
      const queued = enqueueOfflineItem(
        'feedback',
        config.appId,
        item as unknown as Record<string, unknown>,
        `${input.category}:${trimmed}`
      );
      if (!queued.added) {
        return { ok: false, error: queued.reason };
      }
      setOfflineQueue(queued.queue);
      recordAntiSpamSubmission('feedback', trimmed);
      return { ok: true, offline: true };
    }

    try {
      await submitFeedbackToFirestore(item);
      recordAntiSpamSubmission('feedback', trimmed);
      return { ok: true, offline: false };
    } catch {
      const queued = enqueueOfflineItem(
        'feedback',
        config.appId,
        item as unknown as Record<string, unknown>,
        `${input.category}:${trimmed}`
      );
      setOfflineQueue(queued.queue);
      recordAntiSpamSubmission('feedback', trimmed);
      return { ok: true, offline: true };
    }
  };

  const submitSupport = async (input: {
    subject: string;
    priority: 'normale' | 'urgente';
    message: string;
  }) => {
    const subj = input.subject.trim();
    const msg = input.message.trim();
    if (subj.length < 3 || subj.length > 160) {
      return { ok: false, error: 'L’objet doit contenir entre 3 et 160 caractères.' };
    }
    if (msg.length < 5 || msg.length > 2000) {
      return { ok: false, error: 'La description doit contenir entre 5 et 2 000 caractères.' };
    }

    const spamCheck = checkAntiSpamLimit('support', `${subj}::${msg}`);
    if (!spamCheck.allowed) {
      return { ok: false, error: spamCheck.reason };
    }

    const techInfo = preferences.includeTechDiagnostics
      ? `App: ${config.appId} v${config.version} | En ligne: ${isOnline ? 'Oui' : 'Non'} | Nav: ${
          typeof navigator !== 'undefined' ? navigator.platform : 'Web'
        }`
      : 'Diagnostics masqués par préférence utilisateur';

    const ticket: DigiSoliaSupportTicket = {
      id: `sup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appId: config.appId,
      userId: firebaseUser?.uid || 'local_pending',
      userEmail: firebaseUser?.email || 'utilisateur@local',
      userName:
        userProfile
          ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
          : firebaseUser?.displayName || 'Utilisateur local',
      subject: subj,
      priority: input.priority,
      message: msg,
      technicalInfo: techInfo,
      status: 'en_attente',
      createdAt: new Date().toISOString()
    };

    if (!isOnline || !firebaseUser) {
      const queued = enqueueOfflineItem(
        'support',
        config.appId,
        ticket as unknown as Record<string, unknown>,
        `${subj}:${msg}`
      );
      if (!queued.added) {
        return { ok: false, error: queued.reason };
      }
      setOfflineQueue(queued.queue);
      recordAntiSpamSubmission('support', `${subj}::${msg}`);
      return { ok: true, offline: true };
    }

    try {
      await submitSupportTicketToFirestore(ticket);
      recordAntiSpamSubmission('support', `${subj}::${msg}`);
      return { ok: true, offline: false };
    } catch {
      const queued = enqueueOfflineItem(
        'support',
        config.appId,
        ticket as unknown as Record<string, unknown>,
        `${subj}:${msg}`
      );
      setOfflineQueue(queued.queue);
      recordAntiSpamSubmission('support', `${subj}::${msg}`);
      return { ok: true, offline: true };
    }
  };

  const saveUserProfile = async (updates: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    if (!firebaseUser) {
      return { ok: false, error: 'Veuillez vous connecter pour enregistrer votre profil cloud.' };
    }

    if (!isOnline) {
      const queued = enqueueOfflineItem(
        'profile',
        config.appId,
        updates,
        JSON.stringify(updates)
      );
      setOfflineQueue(queued.queue);
      setUserProfile(prev => (prev ? { ...prev, ...updates } : prev));
      return { ok: true, offline: true };
    }

    try {
      await updateUserProfileFields(firebaseUser.uid, updates);
      setUserProfile(prev => (prev ? { ...prev, ...updates } : prev));
      return { ok: true, offline: false };
    } catch {
      const queued = enqueueOfflineItem(
        'profile',
        config.appId,
        updates,
        JSON.stringify(updates)
      );
      setOfflineQueue(queued.queue);
      return { ok: true, offline: true };
    }
  };

  return (
    <DigiSoliaContext.Provider
      value={{
        config,
        apps,
        firebaseUser,
        userProfile,
        adminRole,
        adminPermissions,
        isAnyAdmin,
        isOnline,
        syncState,
        offlineQueue,
        syncNow,
        userFeedbacks: [...pendingOfflineFeedbacks, ...userFeedbacks],
        userTickets: [...pendingOfflineTickets, ...userTickets],
        notifications,
        readNotificationIds,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        preferences,
        updatePreferences,
        hasSeenWelcome,
        completeWelcome,
        reopenWelcome,
        login,
        logout,
        submitFeedback,
        submitSupport,
        saveUserProfile
      }}
    >
      {children}
    </DigiSoliaContext.Provider>
  );
};

export function useDigiSolia(): DigiSoliaContextValue {
  const ctx = useContext(DigiSoliaContext);
  if (!ctx) {
    throw new Error('useDigiSolia doit être utilisé à l’intérieur de DigiSoliaProvider.');
  }
  return ctx;
}
