import { OfflineQueueItem } from '../types';

const QUEUE_STORAGE_KEY = 'daf_offline_queue_v1';
const ANTISPAM_STORAGE_KEY = 'daf_antispam_timestamps_v1';

/**
 * Computes a lightweight deterministic hash to prevent duplicate queue submissions.
 */
export function computePayloadHash(kind: string, appId: string, content: string): string {
  const normalized = `${kind}::${appId}::${content.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const chr = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

export function loadOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(items: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Impossible de sauvegarder la file hors ligne DAF:', err);
  }
}

export function enqueueOfflineItem(
  kind: OfflineQueueItem['kind'],
  appId: string,
  payload: Record<string, unknown>,
  dedupText: string
): { added: boolean; queue: OfflineQueueItem[]; reason?: string } {
  const queue = loadOfflineQueue();
  const payloadHash = computePayloadHash(kind, appId, dedupText);

  // Prevent duplicates in queue
  if (queue.some(item => item.payloadHash === payloadHash)) {
    return {
      added: false,
      queue,
      reason: 'Cette demande est déjà enregistrée dans votre file de synchronisation.'
    };
  }

  const newItem: OfflineQueueItem = {
    queueId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    kind,
    appId,
    payloadHash,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0
  };

  const next = [newItem, ...queue];
  saveOfflineQueue(next);
  return { added: true, queue: next };
}

export function removeOfflineItem(queueId: string): OfflineQueueItem[] {
  const queue = loadOfflineQueue().filter(item => item.queueId !== queueId);
  saveOfflineQueue(queue);
  return queue;
}

export function clearOfflineQueue(): void {
  saveOfflineQueue([]);
}

export function markOfflineItemError(queueId: string, errorMsg: string): OfflineQueueItem[] {
  const queue = loadOfflineQueue().map(item =>
    item.queueId === queueId
      ? { ...item, attempts: item.attempts + 1, lastError: errorMsg }
      : item
  );
  saveOfflineQueue(queue);
  return queue;
}

/**
 * Anti-spam cooldown & duplicate submission prevention (client-side protection).
 */
export function checkAntiSpamLimit(actionType: 'feedback' | 'support', messageText: string): {
  allowed: boolean;
  waitSeconds?: number;
  reason?: string;
} {
  try {
    const raw = localStorage.getItem(ANTISPAM_STORAGE_KEY);
    const data: Record<string, { lastTimestamp: number; lastHash: string }> = raw ? JSON.parse(raw) : {};
    const entry = data[actionType];
    const now = Date.now();
    const currentHash = computePayloadHash(actionType, 'global', messageText);

    if (entry) {
      const elapsedSec = Math.floor((now - entry.lastTimestamp) / 1000);
      // 45 seconds cooldown between submissions of the same module
      if (elapsedSec < 45) {
        return {
          allowed: false,
          waitSeconds: 45 - elapsedSec,
          reason: `Protection anti-spam : veuillez patienter encore ${45 - elapsedSec} secondes avant un nouvel envoi.`
        };
      }
      // Block exact duplicate within 10 minutes
      if (entry.lastHash === currentHash && elapsedSec < 600) {
        return {
          allowed: false,
          reason: 'Ce message identique vient déjà d’être transmis. Merci de patienter ou de modifier votre demande.'
        };
      }
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordAntiSpamSubmission(actionType: 'feedback' | 'support', messageText: string): void {
  try {
    const raw = localStorage.getItem(ANTISPAM_STORAGE_KEY);
    const data: Record<string, { lastTimestamp: number; lastHash: string }> = raw ? JSON.parse(raw) : {};
    data[actionType] = {
      lastTimestamp: Date.now(),
      lastHash: computePayloadHash(actionType, 'global', messageText)
    };
    localStorage.setItem(ANTISPAM_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota issues
  }
}
