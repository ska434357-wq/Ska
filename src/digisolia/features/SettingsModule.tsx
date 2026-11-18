import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Bell,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import { SyncStatusBadge } from '../components/SyncStatusBadge';
import { clearOfflineQueue } from '../services/offlineQueueService';

interface SettingsModuleProps {
  isDark: boolean;
  onToggleTheme: (nextDark: boolean) => void;
  onOpenHostBackup?: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  isDark,
  onToggleTheme,
  onOpenHostBackup
}) => {
  const {
    config,
    preferences,
    updatePreferences,
    offlineQueue,
    syncNow,
    isOnline,
    firebaseUser
  } = useDigiSolia();

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [confirmClearQueue, setConfirmClearQueue] = useState(false);

  const handleManualSync = async () => {
    setSyncMessage(null);
    const res = await syncNow();
    if (res.synced > 0) {
      setSyncMessage(`${res.synced} élément(s) synchronisé(s) avec succès.`);
    } else if (res.remaining > 0) {
      setSyncMessage(
        firebaseUser
          ? `${res.remaining} élément(s) encore en attente (vérifiez la connexion).`
          : 'Connectez-vous au compte Google pour synchroniser la file locale.'
      );
    } else {
      setSyncMessage('Aucune donnée en attente de synchronisation.');
    }
  };

  const handlePurgeQueue = () => {
    clearOfflineQueue();
    setConfirmClearQueue(false);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#163B65] dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#2783C7]" />
          <span>Paramètres & Préférences</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Personnalisation de l’interface, notifications, synchronisation et sauvegardes
        </p>
      </div>

      {/* Appearance & Language */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-5">
        <h2 className="font-bold text-sm text-[#163B65] dark:text-white border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
          Apparence & Langue
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Mode d’affichage
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Basculer entre le thème clair DigiSolia et le mode sombre
            </div>
          </div>

          <div className="inline-flex rounded-xl p-1 bg-[#F4F7FB] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700">
            <button
              type="button"
              onClick={() => onToggleTheme(false)}
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                !isDark
                  ? 'bg-white text-[#163B65] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Clair</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleTheme(true)}
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isDark
                  ? 'bg-[#2783C7] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Sombre</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E1E7EF] dark:border-slate-800">
          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-[#2783C7] mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Langue de l’interface
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Langue principale du socle DigiSolia
              </div>
            </div>
          </div>

          <select
            value={preferences.language}
            onChange={e => updatePreferences({ language: e.target.value as 'fr' | 'en' })}
            className="h-9 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs font-bold outline-none"
          >
            <option value="fr">Français (Officiel DigiSolia)</option>
            <option value="en" disabled>
              English (Bientôt disponible)
            </option>
          </select>
        </div>
      </section>

      {/* Notifications & Diagnostics */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-[#163B65] dark:text-white border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
          Notifications & Confidentialité technique
        </h2>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div className="flex items-start gap-2.5">
            <Bell className="w-4 h-4 text-[#2783C7] mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Alertes & notifications DigiSolia
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Afficher les compteurs d’annonces et mises à jour applicatives
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.notificationsEnabled}
            onChange={e => updatePreferences({ notificationsEnabled: e.target.checked })}
            className="w-4 h-4 accent-[#163B65]"
          />
        </label>

        <label className="flex items-center justify-between gap-4 pt-3 border-t border-[#E1E7EF] dark:border-slate-800 cursor-pointer">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Joindre les diagnostics techniques aux tickets
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Inclut uniquement l’identifiant d’application et la version lors des signalements
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.includeTechDiagnostics}
            onChange={e => updatePreferences({ includeTechDiagnostics: e.target.checked })}
            className="w-4 h-4 accent-[#163B65]"
          />
        </label>
      </section>

      {/* Synchronization & Offline Queue */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
            État de synchronisation & File hors connexion
          </h2>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={!isOnline}
            className="h-8 px-3 rounded-lg bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Forcer la synchro</span>
          </button>
        </div>

        <SyncStatusBadge />

        {syncMessage && (
          <div className="p-3 rounded-xl bg-[#F4F7FB] dark:bg-slate-800 text-xs text-[#163B65] dark:text-sky-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300 tabular-nums">
              Éléments en attente locale : {offlineQueue.length}
            </span>
            {offlineQueue.length > 0 && !confirmClearQueue && (
              <button
                type="button"
                onClick={() => setConfirmClearQueue(true)}
                className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider la file locale</span>
              </button>
            )}
          </div>

          {confirmClearQueue && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-rose-800 dark:text-rose-300 font-semibold">
                Confirmer la suppression des {offlineQueue.length} éléments non envoyés ?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearQueue(false)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handlePurgeQueue}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Backups & Version Info */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-[#163B65] dark:text-white border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
          Sauvegardes & Informations de version
        </h2>

        {config.capabilities.supportsLocalBackup && onOpenHostBackup && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Database className="w-4 h-4 text-[#2783C7] mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Sauvegarde métier ({config.appShortName})
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Export Excel TSV, sauvegarde JSON et restauration locale complète
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenHostBackup}
              className="h-9 px-4 rounded-xl border border-[#E1E7EF] dark:border-slate-700 hover:bg-[#F4F7FB] dark:hover:bg-slate-800 text-xs font-bold text-[#163B65] dark:text-sky-300 transition"
            >
              Ouvrir Sauvegarde & Export
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs tabular-nums">
          <div className="p-3 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60">
            <div className="text-slate-500 dark:text-slate-400">Identifiant App</div>
            <div className="font-bold text-[#163B65] dark:text-white mt-0.5">{config.appId}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60">
            <div className="text-slate-500 dark:text-slate-400">Version active</div>
            <div className="font-bold text-[#163B65] dark:text-white mt-0.5">{config.version}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60">
            <div className="text-slate-500 dark:text-slate-400">Éditeur</div>
            <div className="font-bold text-[#163B65] dark:text-white mt-0.5">
              {config.brand.editor}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
