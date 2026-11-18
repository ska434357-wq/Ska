import React from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, Sparkles, Wrench } from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import { DigiSoliaNotificationType } from '../types';

const NOTIF_META: Record<
  DigiSoliaNotificationType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  info: {
    label: 'Information',
    icon: Info,
    color: 'text-[#2783C7] dark:text-sky-400'
  },
  alerte: {
    label: 'Alerte',
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400'
  },
  mise_a_jour: {
    label: 'Mise à jour',
    icon: Sparkles,
    color: 'text-emerald-600 dark:text-emerald-400'
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    color: 'text-rose-600 dark:text-rose-400'
  }
};

export const NotificationsModule: React.FC = () => {
  const {
    notifications,
    readNotificationIds,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    preferences
  } = useDigiSolia();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#163B65] dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#2783C7]" />
            <span>Centre de notifications</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Annonces officielles DigiSolia et alertes applicatives
            {!preferences.notificationsEnabled && ' · Alertes visuelles désactivées dans Paramètres'}
          </p>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="h-9 px-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-[#0f1b29] hover:bg-[#F4F7FB] dark:hover:bg-slate-800 text-xs font-semibold text-[#163B65] dark:text-sky-300 flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tout marquer comme lu ({unreadNotificationsCount})</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 p-10 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Aucune notification reçue
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Les communiqués publiés depuis DigiSolia Admin apparaîtront ici automatiquement.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const isRead = readNotificationIds.includes(notif.id);
            const meta = NOTIF_META[notif.type] || NOTIF_META.info;
            const Icon = meta.icon;

            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition ${
                  isRead
                    ? 'bg-white dark:bg-[#0f1b29] border-[#E1E7EF] dark:border-slate-800 opacity-85'
                    : 'bg-white dark:bg-[#112031] border-[#2783C7]/40 dark:border-sky-500/40 shadow-sm'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2 rounded-xl bg-[#F4F7FB] dark:bg-slate-800 shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span className={meta.color}>{meta.label}</span>
                        <span>·</span>
                        <span>{notif.appId === 'all' ? 'Toutes les applications' : notif.appId}</span>
                        <span>·</span>
                        <span className="tabular-nums">
                          {new Date(notif.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                        {notif.title}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-xs font-bold text-[#2783C7] dark:text-sky-400 hover:underline shrink-0"
                    >
                      Marquer lu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
