import React from 'react';
import { CheckCircle2, RefreshCw, WifiOff, Clock, AlertCircle } from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';

interface SyncStatusBadgeProps {
  compact?: boolean;
  onAction?: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  compact = false,
  onAction
}) => {
  const { syncState, offlineQueue, syncNow, isOnline, firebaseUser } = useDigiSolia();

  const handleSync = async () => {
    await syncNow();
    if (onAction) onAction();
  };

  const pendingCount = offlineQueue.length;

  const statusMeta = {
    synced: {
      icon: CheckCircle2,
      label: 'Synchronisé',
      detail: 'Données cloud et cache local à jour',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800/60',
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-950/30'
    },
    syncing: {
      icon: RefreshCw,
      label: 'Synchronisation...',
      detail: 'Envoi vers les serveurs DigiSolia',
      textColor: 'text-[#2783C7] dark:text-sky-400',
      borderColor: 'border-sky-200 dark:border-sky-800/60',
      bgColor: 'bg-sky-50/80 dark:bg-sky-950/30'
    },
    offline: {
      icon: WifiOff,
      label: 'Hors connexion',
      detail:
        pendingCount > 0
          ? `${pendingCount} élément(s) en file locale`
          : 'Mode local actif sans perte de données',
      textColor: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800/60',
      bgColor: 'bg-amber-50/80 dark:bg-amber-950/30'
    },
    pending: {
      icon: Clock,
      label: `${pendingCount} en attente`,
      detail: firebaseUser
        ? 'Prêt pour synchronisation immédiate'
        : 'Connectez-vous pour synchroniser vers le cloud',
      textColor: 'text-[#163B65] dark:text-sky-300',
      borderColor: 'border-[#E1E7EF] dark:border-slate-700',
      bgColor: 'bg-[#F4F7FB] dark:bg-slate-800/60'
    },
    error: {
      icon: AlertCircle,
      label: 'Synchronisation partielle',
      detail: `${pendingCount} élément(s) à réessayer`,
      textColor: 'text-rose-700 dark:text-rose-400',
      borderColor: 'border-rose-200 dark:border-rose-800/60',
      bgColor: 'bg-rose-50/80 dark:bg-rose-950/30'
    }
  }[syncState];

  const Icon = statusMeta.icon;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold tabular-nums ${statusMeta.bgColor} ${statusMeta.borderColor} ${statusMeta.textColor}`}
        title={statusMeta.detail}
      >
        <Icon className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
        <span>{statusMeta.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border ${statusMeta.bgColor} ${statusMeta.borderColor}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-700 ${statusMeta.textColor}`}>
          <Icon className={`w-4 h-4 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-bold tabular-nums ${statusMeta.textColor}`}>
            {statusMeta.label}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
            {statusMeta.detail}
          </div>
        </div>
      </div>

      {isOnline && firebaseUser && pendingCount > 0 && (
        <button
          type="button"
          onClick={handleSync}
          disabled={syncState === 'syncing'}
          className="h-9 px-3.5 rounded-lg bg-[#163B65] hover:bg-[#1e4e85] dark:bg-[#2783C7] dark:hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
          Synchroniser
        </button>
      )}
    </div>
  );
};
