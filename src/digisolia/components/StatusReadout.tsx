import React from 'react';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { DigiSoliaProcessingStatus } from '../types';

export const STATUS_LABELS: Record<DigiSoliaProcessingStatus, string> = {
  en_attente: 'En attente',
  en_cours: 'En cours de traitement',
  resolu: 'Résolu',
  rejete: 'Rejeté'
};

interface StatusReadoutProps {
  status: DigiSoliaProcessingStatus;
  pendingOffline?: boolean;
}

export const StatusReadout: React.FC<StatusReadoutProps> = ({
  status,
  pendingOffline = false
}) => {
  if (pendingOffline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>En file locale (hors ligne)</span>
      </span>
    );
  }

  const config = {
    en_attente: {
      icon: Clock,
      cls: 'text-amber-700 dark:text-amber-400'
    },
    en_cours: {
      icon: Loader2,
      cls: 'text-[#2783C7] dark:text-sky-400'
    },
    resolu: {
      icon: CheckCircle2,
      cls: 'text-emerald-700 dark:text-emerald-400'
    },
    rejete: {
      icon: XCircle,
      cls: 'text-rose-700 dark:text-rose-400'
    }
  }[status];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${config.cls}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};
