import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import {
  dafDb,
  dafAuth,
  dafHandleFirestoreError,
  DafOperationType
} from './firebaseAdapter';
import {
  DigiSoliaAppRecord,
  DigiSoliaUserProfile,
  DigiSoliaAdminRecord,
  DigiSoliaFeedbackItem,
  DigiSoliaSupportTicket,
  DigiSoliaNotificationItem,
  DigiSoliaAdminLogItem,
  DigiSoliaProcessingStatus,
  DigiSoliaAdminRole
} from '../types';
import { DIGISOLIA_ECOSYSTEM_APPS } from '../config/digisolia.config';
import {
  loadOfflineQueue,
  removeOfflineItem,
  markOfflineItemError
} from './offlineQueueService';

function isOfflineError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes('offline') || msg.includes('unavailable') || msg.includes('network');
}

/**
 * Sanitizes string payloads to match firestore.rules size boundaries.
 */
function clampStr(val: unknown, maxLen: number): string {
  return String(val ?? '').trim().slice(0, maxLen);
}

/**
 * Ensures initial ecosystem apps exist when a Super Admin initializes the catalog.
 */
export async function seedDigiSoliaAppsIfEmpty(): Promise<void> {
  if (!dafAuth.currentUser) return;
  try {
    for (const appItem of DIGISOLIA_ECOSYSTEM_APPS) {
      const ref = doc(dafDb, 'apps', appItem.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          ...appItem,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    if (isOfflineError(err)) return;
    console.warn('Info initialisation apps DigiSolia:', err);
  }
}

export async function saveDigiSoliaApp(appItem: DigiSoliaAppRecord): Promise<void> {
  const path = `apps/${appItem.id}`;
  try {
    await setDoc(
      doc(dafDb, 'apps', appItem.id),
      {
        id: clampStr(appItem.id, 80),
        name: clampStr(appItem.name, 120),
        description: clampStr(appItem.description, 500),
        version: clampStr(appItem.version, 30),
        category: clampStr(appItem.category, 80),
        status: appItem.status,
        usersCount: Math.max(0, Number(appItem.usersCount) || 0),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    if (isOfflineError(err)) return;
    dafHandleFirestoreError(err, DafOperationType.WRITE, path);
  }
}

export function subscribeToDigiSoliaApps(
  onUpdate: (apps: DigiSoliaAppRecord[]) => void
) {
  return onSnapshot(
    collection(dafDb, 'apps'),
    snapshot => {
      const list: DigiSoliaAppRecord[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        list.push({
          id: String(data.id || d.id),
          name: String(data.name || d.id),
          description: String(data.description || ''),
          version: String(data.version || '1.0.0'),
          category: String(data.category || 'Application DigiSolia'),
          status: (data.status as DigiSoliaAppRecord['status']) || 'actif',
          usersCount: Number(data.usersCount) || 0,
          updatedAt: String(data.updatedAt || new Date().toISOString())
        });
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    err => {
      if (isOfflineError(err)) return;
      console.warn('Écoute /apps interrompue:', err);
    }
  );
}

/**
 * Syncs or loads unified DigiSolia User Profile in /users/{uid}.
 */
export async function syncOrFetchUserProfile(
  firebaseUser: FirebaseUser,
  appId: string
): Promise<DigiSoliaUserProfile | null> {
  const path = `users/${firebaseUser.uid}`;
  const now = new Date().toISOString();
  const displayParts = (firebaseUser.displayName || '').trim().split(' ');
  const firstName = displayParts[0] || firebaseUser.email?.split('@')[0] || 'Utilisateur';
  const lastName = displayParts.slice(1).join(' ') || '';

  try {
    const userRef = doc(dafDb, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      await updateDoc(userRef, {
        lastLoginAt: now,
        appId: clampStr(appId, 80)
      });
      return {
        uid: firebaseUser.uid,
        firstName: String(data.firstName || firstName),
        lastName: String(data.lastName || lastName),
        email: String(data.email || firebaseUser.email || ''),
        phone: String(data.phone || ''),
        appId: String(data.appId || appId),
        role: 'user',
        status: (data.status as 'actif' | 'suspendu') || 'actif',
        createdAt: String(data.createdAt || now),
        lastLoginAt: now
      };
    } else {
      const newProfile: DigiSoliaUserProfile = {
        uid: firebaseUser.uid,
        firstName: clampStr(firstName, 80),
        lastName: clampStr(lastName, 80),
        email: clampStr(firebaseUser.email || '', 160),
        phone: '',
        appId: clampStr(appId, 80),
        role: 'user',
        status: 'actif',
        createdAt: now,
        lastLoginAt: now
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    if (isOfflineError(err)) return null;
    dafHandleFirestoreError(err, DafOperationType.WRITE, path);
    return null;
  }
}

export async function updateUserProfileFields(
  uid: string,
  updates: { firstName: string; lastName: string; phone: string }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(dafDb, 'users', uid), {
      firstName: clampStr(updates.firstName, 80),
      lastName: clampStr(updates.lastName, 80),
      phone: clampStr(updates.phone, 40)
    });
  } catch (err) {
    if (isOfflineError(err)) throw err;
    dafHandleFirestoreError(err, DafOperationType.UPDATE, path);
  }
}

/**
 * Checks whether the current user has an admin document in /administrators/{uid}.
 */
export async function fetchAdminRecord(uid: string): Promise<DigiSoliaAdminRecord | null> {
  const path = `administrators/${uid}`;
  try {
    const snap = await getDoc(doc(dafDb, 'administrators', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      uid: String(d.uid || uid),
      email: String(d.email || ''),
      displayName: String(d.displayName || ''),
      role: (d.role as DigiSoliaAdminRole) || 'stats_reader',
      assignedApps: String(d.assignedApps || '*'),
      createdAt: String(d.createdAt || ''),
      createdBy: d.createdBy ? String(d.createdBy) : undefined
    };
  } catch (err) {
    if (isOfflineError(err)) return null;
    // Non-admins may not have an admin record; safely return null on permission check if not found
    return null;
  }
}

/**
 * Submits feedback (avis, suggestion, bug, reclamation) to /apps/{appId}/feedback/{id}.
 */
export async function submitFeedbackToFirestore(item: DigiSoliaFeedbackItem): Promise<void> {
  const path = `apps/${item.appId}/feedback/${item.id}`;
  try {
    const payload: Record<string, unknown> = {
      id: clampStr(item.id, 128),
      appId: clampStr(item.appId, 80),
      userId: clampStr(item.userId, 128),
      userEmail: clampStr(item.userEmail, 160),
      userName: clampStr(item.userName, 120),
      category: item.category,
      message: clampStr(item.message, 2000),
      status: 'en_attente',
      createdAt: item.createdAt
    };
    if (typeof item.rating === 'number' && item.rating >= 1 && item.rating <= 5) {
      payload.rating = item.rating;
    }
    await setDoc(doc(dafDb, 'apps', item.appId, 'feedback', item.id), payload);
  } catch (err) {
    if (isOfflineError(err)) throw err;
    dafHandleFirestoreError(err, DafOperationType.CREATE, path);
  }
}

/**
 * Submits support ticket to /apps/{appId}/support/{id}.
 */
export async function submitSupportTicketToFirestore(ticket: DigiSoliaSupportTicket): Promise<void> {
  const path = `apps/${ticket.appId}/support/${ticket.id}`;
  try {
    await setDoc(doc(dafDb, 'apps', ticket.appId, 'support', ticket.id), {
      id: clampStr(ticket.id, 128),
      appId: clampStr(ticket.appId, 80),
      userId: clampStr(ticket.userId, 128),
      userEmail: clampStr(ticket.userEmail, 160),
      userName: clampStr(ticket.userName, 120),
      subject: clampStr(ticket.subject, 160),
      priority: ticket.priority,
      message: clampStr(ticket.message, 2000),
      technicalInfo: clampStr(ticket.technicalInfo || '', 500),
      status: 'en_attente',
      createdAt: ticket.createdAt
    });
  } catch (err) {
    if (isOfflineError(err)) throw err;
    dafHandleFirestoreError(err, DafOperationType.CREATE, path);
  }
}

/**
 * Subscribes to current user's own feedback items for the current app.
 */
export function subscribeToUserFeedback(
  appId: string,
  userId: string,
  onUpdate: (items: DigiSoliaFeedbackItem[]) => void
) {
  const q = query(
    collection(dafDb, 'apps', appId, 'feedback'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    snapshot => {
      const items: DigiSoliaFeedbackItem[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        items.push({
          id: String(d.id || docSnap.id),
          appId: String(d.appId || appId),
          userId: String(d.userId || ''),
          userEmail: String(d.userEmail || ''),
          userName: String(d.userName || ''),
          category: d.category as DigiSoliaFeedbackItem['category'],
          rating: typeof d.rating === 'number' ? d.rating : undefined,
          message: String(d.message || ''),
          status: (d.status as DigiSoliaProcessingStatus) || 'en_attente',
          adminNote: d.adminNote ? String(d.adminNote) : undefined,
          createdAt: String(d.createdAt || ''),
          updatedAt: d.updatedAt ? String(d.updatedAt) : undefined
        });
      });
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onUpdate(items);
    },
    err => {
      if (isOfflineError(err)) return;
      console.warn('Erreur écoute feedback utilisateur:', err);
    }
  );
}

/**
 * Subscribes to current user's own support tickets for the current app.
 */
export function subscribeToUserSupportTickets(
  appId: string,
  userId: string,
  onUpdate: (items: DigiSoliaSupportTicket[]) => void
) {
  const q = query(
    collection(dafDb, 'apps', appId, 'support'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    snapshot => {
      const items: DigiSoliaSupportTicket[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        items.push({
          id: String(d.id || docSnap.id),
          appId: String(d.appId || appId),
          userId: String(d.userId || ''),
          userEmail: String(d.userEmail || ''),
          userName: String(d.userName || ''),
          subject: String(d.subject || ''),
          priority: (d.priority as 'normale' | 'urgente') || 'normale',
          message: String(d.message || ''),
          technicalInfo: d.technicalInfo ? String(d.technicalInfo) : undefined,
          status: (d.status as DigiSoliaProcessingStatus) || 'en_attente',
          response: d.response ? String(d.response) : undefined,
          createdAt: String(d.createdAt || ''),
          updatedAt: d.updatedAt ? String(d.updatedAt) : undefined
        });
      });
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onUpdate(items);
    },
    err => {
      if (isOfflineError(err)) return;
      console.warn('Erreur écoute tickets utilisateur:', err);
    }
  );
}

/**
 * Subscribes to global + app-specific notifications.
 */
export function subscribeToNotifications(
  appId: string,
  onUpdate: (items: DigiSoliaNotificationItem[]) => void
) {
  const q = query(collection(dafDb, 'notifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const items: DigiSoliaNotificationItem[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const targetApp = String(d.appId || 'all');
        if (targetApp === 'all' || targetApp === appId) {
          items.push({
            id: String(d.id || docSnap.id),
            appId: targetApp,
            title: String(d.title || ''),
            message: String(d.message || ''),
            type: (d.type as DigiSoliaNotificationItem['type']) || 'info',
            createdAt: String(d.createdAt || ''),
            createdBy: String(d.createdBy || 'DigiSolia')
          });
        }
      });
      onUpdate(items);
    },
    err => {
      if (isOfflineError(err)) return;
      console.warn('Erreur écoute notifications:', err);
    }
  );
}

/**
 * Flushes pending offline queue items to Firestore once connection & auth are ready.
 */
export async function flushOfflineQueue(): Promise<{ synced: number; remaining: number; errors: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cur = loadOfflineQueue();
    return { synced: 0, remaining: cur.length, errors: 0 };
  }
  if (!dafAuth.currentUser) {
    const cur = loadOfflineQueue();
    return { synced: 0, remaining: cur.length, errors: 0 };
  }

  const queue = loadOfflineQueue();
  let synced = 0;
  let errors = 0;

  for (const item of queue) {
    try {
      if (item.kind === 'feedback') {
        const fb = item.payload as unknown as DigiSoliaFeedbackItem;
        await submitFeedbackToFirestore({
          ...fb,
          userId: dafAuth.currentUser.uid,
          userEmail: dafAuth.currentUser.email || fb.userEmail || '',
          userName: dafAuth.currentUser.displayName || fb.userName || 'Utilisateur'
        });
        removeOfflineItem(item.queueId);
        synced++;
      } else if (item.kind === 'support') {
        const ticket = item.payload as unknown as DigiSoliaSupportTicket;
        await submitSupportTicketToFirestore({
          ...ticket,
          userId: dafAuth.currentUser.uid,
          userEmail: dafAuth.currentUser.email || ticket.userEmail || '',
          userName: dafAuth.currentUser.displayName || ticket.userName || 'Utilisateur'
        });
        removeOfflineItem(item.queueId);
        synced++;
      } else if (item.kind === 'profile') {
        const prof = item.payload as { firstName: string; lastName: string; phone: string };
        await updateUserProfileFields(dafAuth.currentUser.uid, prof);
        removeOfflineItem(item.queueId);
        synced++;
      }
    } catch (err) {
      errors++;
      markOfflineItemError(
        item.queueId,
        err instanceof Error ? err.message : 'Erreur de synchronisation'
      );
    }
  }

  return {
    synced,
    remaining: loadOfflineQueue().length,
    errors
  };
}

// ============================================================================
// ADMIN PANEL OPERATIONS (DIGISOLIA ADMIN)
// ============================================================================

export async function logAdminOperation(action: string, target: string): Promise<void> {
  if (!dafAuth.currentUser) return;
  const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  try {
    await setDoc(doc(dafDb, 'admin_logs', logId), {
      id: logId,
      actorUid: dafAuth.currentUser.uid,
      actorEmail: clampStr(dafAuth.currentUser.email || '', 160),
      action: clampStr(action, 120),
      target: clampStr(target, 200),
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Impossible de journaliser action admin:', err);
  }
}

export async function fetchAllAdminData(appIds: string[]): Promise<{
  users: DigiSoliaUserProfile[];
  feedbacks: DigiSoliaFeedbackItem[];
  tickets: DigiSoliaSupportTicket[];
  admins: DigiSoliaAdminRecord[];
  notifications: DigiSoliaNotificationItem[];
  logs: DigiSoliaAdminLogItem[];
}> {
  const users: DigiSoliaUserProfile[] = [];
  const feedbacks: DigiSoliaFeedbackItem[] = [];
  const tickets: DigiSoliaSupportTicket[] = [];
  const admins: DigiSoliaAdminRecord[] = [];
  const notifications: DigiSoliaNotificationItem[] = [];
  const logs: DigiSoliaAdminLogItem[] = [];

  try {
    // 1. Users
    const usersSnap = await getDocs(collection(dafDb, 'users'));
    usersSnap.forEach(d => {
      const data = d.data();
      users.push({
        uid: String(data.uid || d.id),
        firstName: String(data.firstName || ''),
        lastName: String(data.lastName || ''),
        email: String(data.email || ''),
        phone: String(data.phone || ''),
        appId: String(data.appId || ''),
        role: 'user',
        status: (data.status as 'actif' | 'suspendu') || 'actif',
        createdAt: String(data.createdAt || ''),
        lastLoginAt: String(data.lastLoginAt || '')
      });
    });

    // 2. Feedback & Support across all registered apps
    const uniqueAppIds = Array.from(new Set(appIds));
    for (const aId of uniqueAppIds) {
      const fbSnap = await getDocs(collection(dafDb, 'apps', aId, 'feedback'));
      fbSnap.forEach(docSnap => {
        const d = docSnap.data();
        feedbacks.push({
          id: String(d.id || docSnap.id),
          appId: String(d.appId || aId),
          userId: String(d.userId || ''),
          userEmail: String(d.userEmail || ''),
          userName: String(d.userName || ''),
          category: d.category as DigiSoliaFeedbackItem['category'],
          rating: typeof d.rating === 'number' ? d.rating : undefined,
          message: String(d.message || ''),
          status: (d.status as DigiSoliaProcessingStatus) || 'en_attente',
          adminNote: d.adminNote ? String(d.adminNote) : undefined,
          createdAt: String(d.createdAt || ''),
          updatedAt: d.updatedAt ? String(d.updatedAt) : undefined
        });
      });

      const spSnap = await getDocs(collection(dafDb, 'apps', aId, 'support'));
      spSnap.forEach(docSnap => {
        const d = docSnap.data();
        tickets.push({
          id: String(d.id || docSnap.id),
          appId: String(d.appId || aId),
          userId: String(d.userId || ''),
          userEmail: String(d.userEmail || ''),
          userName: String(d.userName || ''),
          subject: String(d.subject || ''),
          priority: (d.priority as 'normale' | 'urgente') || 'normale',
          message: String(d.message || ''),
          technicalInfo: d.technicalInfo ? String(d.technicalInfo) : undefined,
          status: (d.status as DigiSoliaProcessingStatus) || 'en_attente',
          response: d.response ? String(d.response) : undefined,
          createdAt: String(d.createdAt || ''),
          updatedAt: d.updatedAt ? String(d.updatedAt) : undefined
        });
      });
    }

    // 3. Admins
    const adminsSnap = await getDocs(collection(dafDb, 'administrators'));
    adminsSnap.forEach(d => {
      const data = d.data();
      admins.push({
        uid: String(data.uid || d.id),
        email: String(data.email || ''),
        displayName: String(data.displayName || ''),
        role: (data.role as DigiSoliaAdminRole) || 'stats_reader',
        assignedApps: String(data.assignedApps || '*'),
        createdAt: String(data.createdAt || ''),
        createdBy: data.createdBy ? String(data.createdBy) : undefined
      });
    });

    // 4. Notifications
    const notifSnap = await getDocs(query(collection(dafDb, 'notifications'), orderBy('createdAt', 'desc')));
    notifSnap.forEach(d => {
      const data = d.data();
      notifications.push({
        id: String(data.id || d.id),
        appId: String(data.appId || 'all'),
        title: String(data.title || ''),
        message: String(data.message || ''),
        type: (data.type as DigiSoliaNotificationItem['type']) || 'info',
        createdAt: String(data.createdAt || ''),
        createdBy: String(data.createdBy || '')
      });
    });

    // 5. Logs
    const logsSnap = await getDocs(query(collection(dafDb, 'admin_logs'), orderBy('createdAt', 'desc')));
    logsSnap.forEach(d => {
      const data = d.data();
      logs.push({
        id: String(data.id || d.id),
        actorUid: String(data.actorUid || ''),
        actorEmail: String(data.actorEmail || ''),
        action: String(data.action || ''),
        target: String(data.target || ''),
        createdAt: String(data.createdAt || '')
      });
    });
  } catch (err) {
    if (isOfflineError(err)) {
      return { users, feedbacks, tickets, admins, notifications, logs };
    }
    dafHandleFirestoreError(err, DafOperationType.LIST, 'admin');
  }

  feedbacks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  tickets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return { users, feedbacks, tickets, admins, notifications, logs };
}

export async function adminUpdateFeedbackStatus(
  appId: string,
  feedbackId: string,
  status: DigiSoliaProcessingStatus,
  adminNote: string
): Promise<void> {
  const path = `apps/${appId}/feedback/${feedbackId}`;
  try {
    await updateDoc(doc(dafDb, 'apps', appId, 'feedback', feedbackId), {
      status,
      adminNote: clampStr(adminNote, 500),
      updatedAt: new Date().toISOString()
    });
    await logAdminOperation('Mise à jour avis/retour', `${appId} · ${feedbackId} -> ${status}`);
  } catch (err) {
    dafHandleFirestoreError(err, DafOperationType.UPDATE, path);
  }
}

export async function adminUpdateSupportStatus(
  appId: string,
  ticketId: string,
  status: DigiSoliaProcessingStatus,
  response: string
): Promise<void> {
  const path = `apps/${appId}/support/${ticketId}`;
  try {
    await updateDoc(doc(dafDb, 'apps', appId, 'support', ticketId), {
      status,
      response: clampStr(response, 1000),
      updatedAt: new Date().toISOString()
    });
    await logAdminOperation('Traitement ticket support', `${appId} · ${ticketId} -> ${status}`);
  } catch (err) {
    dafHandleFirestoreError(err, DafOperationType.UPDATE, path);
  }
}

export async function adminToggleUserStatus(
  uid: string,
  newStatus: 'actif' | 'suspendu'
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(dafDb, 'users', uid), { status: newStatus });
    await logAdminOperation('Modification statut utilisateur', `${uid} -> ${newStatus}`);
  } catch (err) {
    dafHandleFirestoreError(err, DafOperationType.UPDATE, path);
  }
}

export async function adminSaveAdministrator(record: DigiSoliaAdminRecord): Promise<void> {
  const path = `administrators/${record.uid}`;
  try {
    await setDoc(doc(dafDb, 'administrators', record.uid), {
      uid: clampStr(record.uid, 128),
      email: clampStr(record.email, 160),
      displayName: clampStr(record.displayName, 120),
      role: record.role,
      assignedApps: clampStr(record.assignedApps || '*', 500),
      createdAt: record.createdAt || new Date().toISOString(),
      createdBy: dafAuth.currentUser?.uid || ''
    });
    await logAdminOperation('Gestion administrateur / rôle', `${record.email} (${record.role})`);
  } catch (err) {
    dafHandleFirestoreError(err, DafOperationType.WRITE, path);
  }
}

export async function adminRemoveAdministrator(uid: string, email: string): Promise<void> {
  const path = `administrators/${uid}`;
  try {
    await deleteDoc(doc(dafDb, 'administrators', uid));
    await logAdminOperation('Révocation administrateur', `${email} (${uid})`);
  } catch (err) {
    dafHandleFirestoreError(err, DafOperationType.DELETE, path);
  }
}

export async function adminPublishNotification(notif: DigiSoliaNotificationItem): Promise<void> {
  const path = `notifications/${notif.id}`;
  try {
    await setDoc(doc(dafDb, 'notifications', notif.id), {
      id: clampStr(notif.id, 128),
      appId: clampStr(notif.appId, 80),
      title: clampStr(notif.title, 140),
      message: clampStr(notif.message, 600),
      type: notif.type,
      createdAt: notif.createdAt,
      createdBy: clampStr(notif.createdBy, 160)
    });
    await logAdminOperation('Publication notification', `[${notif.appId}] ${notif.title}`);
  } catch (err) {
    dafHandleFirestoreError(err, DafOperationType.CREATE, path);
  }
}
