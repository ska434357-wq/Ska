import React from 'react';
import {
  ArrowRight,
  Bell,
  LifeBuoy,
  MessageSquarePlus,
  Settings,
  User,
  Info,
  Shield,
  Sparkles,
  PhoneCall,
  Layers
} from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import { SyncStatusBadge } from '../components/SyncStatusBadge';
import { DigiSoliaLogo } from '../components/DigiSoliaLogo';

export type DafNavigationTarget =
  | 'daf_home'
  | 'daf_notifications'
  | 'daf_support'
  | 'daf_feedback'
  | 'daf_profile'
  | 'daf_settings'
  | 'daf_about'
  | 'daf_welcome'
  | 'daf_admin';

interface FrameworkHomeProps {
  onNavigateHost: (hostTarget: string) => void;
  onNavigateDaf: (dafTarget: DafNavigationTarget) => void;
}

export const FrameworkHome: React.FC<FrameworkHomeProps> = ({
  onNavigateHost,
  onNavigateDaf
}) => {
  const {
    config,
    firebaseUser,
    userProfile,
    notifications,
    unreadNotificationsCount,
    isAnyAdmin,
    adminPermissions,
    reopenWelcome
  } = useDigiSolia();

  const userDisplayName = userProfile
    ? `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email
    : firebaseUser?.displayName || firebaseUser?.email || 'Collaborateur';

  const greetingHour = new Date().getHours();
  const greetingPrefix =
    greetingHour < 12 ? 'Bonjour' : greetingHour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner (SaaS DigiSolia) */}
      <section className="rounded-2xl bg-gradient-to-br from-[#163B65] to-[#1e4d84] dark:from-[#0f2642] dark:to-[#163B65] text-white p-6 sm:p-8 shadow-sm border border-[#163B65]/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-3">
              <DigiSoliaLogo config={config} size="sm" inverted />
              <span className="text-sky-300/60">·</span>
              <span className="text-xs font-semibold text-sky-200 tabular-nums">
                {config.appShortName} v{config.version}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {greetingPrefix}, {userDisplayName}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              Bienvenue dans votre espace unifié DigiSolia. Accédez rapidement aux modules de{' '}
              <strong className="text-white">{config.appShortName}</strong>, suivez l’état de
              synchronisation ou contactez notre assistance dédiée.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateHost('dashboard')}
              className="h-10 px-4 rounded-xl bg-white text-[#163B65] hover:bg-sky-50 font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <span>Tableau de bord métier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateDaf('daf_support')}
              className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs flex items-center gap-2 transition"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Assistance rapide</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sync status + Notifications + Admin Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                État de synchronisation & Continuité
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surveillance temps réel du cache local et du cloud Firebase
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateDaf('daf_settings')}
              className="text-xs font-semibold text-[#2783C7] hover:underline flex items-center gap-1"
            >
              <span>Paramètres</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <SyncStatusBadge />
        </div>

        {/* Quick Support Box */}
        <div className="rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2783C7]">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Support DigiSolia</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Une difficulté technique ou besoin d’accompagnement ? Notre équipe basée à{' '}
              {config.brand.city} vous répond rapidement.
            </p>
          </div>

          <div className="space-y-1.5 text-xs tabular-nums">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">WhatsApp</span>
              <span className="font-bold">{config.contact.whatsappDisplay}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Téléphone</span>
              <span className="font-bold">{config.contact.phoneDisplay}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateDaf('daf_support')}
            className="w-full h-9 rounded-xl bg-[#F4F7FB] dark:bg-slate-800 hover:bg-[#E1E7EF] dark:hover:bg-slate-700 text-[#163B65] dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Ouvrir le Centre d’assistance</span>
          </button>
        </div>
      </div>

      {/* Host Application Shortcuts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Layers className="w-4 h-4 text-[#2783C7]" />
            <span>Raccourcis métier — {config.appShortName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.hostShortcuts.map(sc => (
            <button
              key={sc.id}
              type="button"
              onClick={() =>
                sc.type === 'host'
                  ? onNavigateHost(sc.target)
                  : onNavigateDaf(sc.target as DafNavigationTarget)
              }
              className="group text-left p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 hover:border-[#2783C7] dark:hover:border-sky-500 shadow-sm transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#163B65] dark:text-white group-hover:text-[#2783C7] dark:group-hover:text-sky-400 transition">
                  {sc.label}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2783C7] group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {sc.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Notifications Preview & DAF Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Notifications */}
        <section className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2783C7]" />
              <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                Notifications récentes
              </h2>
              {unreadNotificationsCount > 0 && (
                <span className="text-xs font-bold text-[#2783C7] tabular-nums">
                  · {unreadNotificationsCount} non lue(s)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onNavigateDaf('daf_notifications')}
              className="text-xs font-semibold text-[#2783C7] hover:underline"
            >
              Tout voir
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Aucune notification active pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 3).map(n => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700/60 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#163B65] dark:text-white">{n.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Framework Modules & Useful Info */}
        <section className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 p-5 space-y-3">
          <h2 className="font-bold text-sm text-[#163B65] dark:text-white border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
            Services & Administration DigiSolia
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => onNavigateDaf('daf_feedback')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F4F7FB] dark:hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-3">
                <MessageSquarePlus className="w-4 h-4 text-[#2783C7]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Donner mon avis
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Note 1–5 étoiles, suggestion ou bug
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateDaf('daf_profile')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F4F7FB] dark:hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#2783C7]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Mon profil utilisateur
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Coordonnées personnelles et session
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateDaf('daf_settings')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F4F7FB] dark:hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#2783C7]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Paramètres & Sauvegardes
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Thème clair/sombre, file hors connexion
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                reopenWelcome();
                onNavigateDaf('daf_welcome');
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F4F7FB] dark:hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#2783C7]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Page de présentation
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Revoir l’écran d’accueil DigiSolia
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateDaf('daf_about')}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F4F7FB] dark:hover:bg-slate-800 transition text-left"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-[#2783C7]" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    À propos de DigiSolia
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mission, vision, CGU et confidentialité
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isAnyAdmin && (
              <button
                type="button"
                onClick={() => onNavigateDaf('daf_admin')}
                className="flex items-center justify-between p-3 rounded-xl bg-[#163B65]/5 dark:bg-sky-950/40 border border-[#163B65]/20 dark:border-sky-800 hover:bg-[#163B65]/10 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[#163B65] dark:text-sky-400" />
                  <div>
                    <div className="text-xs font-extrabold text-[#163B65] dark:text-sky-300">
                      DIGISOLIA ADMIN
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      Rôle actif : {adminPermissions?.label}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#163B65] dark:text-sky-400" />
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
