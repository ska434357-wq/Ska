import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  LayoutGrid,
  Users,
  MessageSquare,
  LifeBuoy,
  Bell,
  UserCog,
  RefreshCw,
  Plus,
  Search,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  BarChart3,
  FileClock
} from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import {
  DigiSoliaAppRecord,
  DigiSoliaUserProfile,
  DigiSoliaFeedbackItem,
  DigiSoliaSupportTicket,
  DigiSoliaAdminRecord,
  DigiSoliaNotificationItem,
  DigiSoliaAdminLogItem,
  DigiSoliaProcessingStatus,
  DigiSoliaAdminRole,
  DigiSoliaNotificationType,
  DIGISOLIA_ROLE_MATRIX
} from '../types';
import {
  fetchAllAdminData,
  saveDigiSoliaApp,
  adminUpdateFeedbackStatus,
  adminUpdateSupportStatus,
  adminToggleUserStatus,
  adminSaveAdministrator,
  adminRemoveAdministrator,
  adminPublishNotification
} from '../services/digisoliaService';
import { StarRating } from '../components/StarRating';
import { StatusReadout, STATUS_LABELS } from '../components/StatusReadout';

type AdminTab =
  | 'overview'
  | 'apps_users'
  | 'feedback'
  | 'support'
  | 'notifications'
  | 'admins';

export const DigiSoliaAdmin: React.FC = () => {
  const {
    apps,
    firebaseUser,
    adminRole,
    adminPermissions,
    isAnyAdmin,
    login,
    isOnline
  } = useDigiSolia();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [users, setUsers] = useState<DigiSoliaUserProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<DigiSoliaFeedbackItem[]>([]);
  const [tickets, setTickets] = useState<DigiSoliaSupportTicket[]>([]);
  const [admins, setAdmins] = useState<DigiSoliaAdminRecord[]>([]);
  const [notifications, setNotifications] = useState<DigiSoliaNotificationItem[]>([]);
  const [logs, setLogs] = useState<DigiSoliaAdminLogItem[]>([]);

  // Filters
  const [appFilter, setAppFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');
  const [fbCategoryFilter, setFbCategoryFilter] = useState<string>('all');
  const [fbStatusFilter, setFbStatusFilter] = useState<string>('all');
  const [spStatusFilter, setSpStatusFilter] = useState<string>('all');

  // Inline response states
  const [editingFbId, setEditingFbId] = useState<string | null>(null);
  const [fbDraftStatus, setFbDraftStatus] = useState<DigiSoliaProcessingStatus>('en_cours');
  const [fbDraftNote, setFbDraftNote] = useState<string>('');

  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [spDraftStatus, setSpDraftStatus] = useState<DigiSoliaProcessingStatus>('en_cours');
  const [spDraftReply, setSpDraftReply] = useState<string>('');

  // New/Edit App Form
  const [newAppId, setNewAppId] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [newAppVersion, setNewAppVersion] = useState('1.0.0');
  const [newAppCategory, setNewAppCategory] = useState('Gestion');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [showAppForm, setShowAppForm] = useState(false);

  // Notification Broadcast Form
  const [notifTargetApp, setNotifTargetApp] = useState<string>('all');
  const [notifType, setNotifType] = useState<DigiSoliaNotificationType>('info');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  // Admin Management Form
  const [admUid, setAdmUid] = useState('');
  const [admEmail, setAdmEmail] = useState('');
  const [admName, setAdmName] = useState('');
  const [admRole, setAdmRole] = useState<DigiSoliaAdminRole>('support_agent');
  const [admAssignedApps, setAdmAssignedApps] = useState('*');
  const [confirmRevokeUid, setConfirmRevokeUid] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!firebaseUser || !isAnyAdmin) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const appIds = apps.map(a => a.id);
      const data = await fetchAllAdminData(appIds);
      setUsers(data.users);
      setFeedbacks(data.feedbacks);
      setTickets(data.tickets);
      setAdmins(data.admins);
      setNotifications(data.notifications);
      setLogs(data.logs);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Impossible de charger les données administrateur.'
      );
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, isAnyAdmin, apps]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Satisfaction stats
  const satisfactionStats = useMemo(() => {
    const rated = feedbacks.filter(f => typeof f.rating === 'number' && f.rating >= 1);
    const totalRated = rated.length;
    const sum = rated.reduce((acc, f) => acc + (f.rating || 0), 0);
    const avg = totalRated > 0 ? sum / totalRated : 0;

    const distribution = [5, 4, 3, 2, 1].map(star => {
      const count = rated.filter(f => f.rating === star).length;
      const pct = totalRated > 0 ? Math.round((count / totalRated) * 100) : 0;
      return { star, count, pct };
    });

    const reclamationsCount = feedbacks.filter(f => f.category === 'reclamation').length;
    const suggestionsCount = feedbacks.filter(f => f.category === 'suggestion').length;
    const pendingTicketsCount = tickets.filter(
      t => t.status === 'en_attente' || t.status === 'en_cours'
    ).length;

    return {
      totalRated,
      avg,
      distribution,
      reclamationsCount,
      suggestionsCount,
      pendingTicketsCount
    };
  }, [feedbacks, tickets]);

  // Users count per app (live registered users merged with app metadata)
  const usersPerApp = useMemo(() => {
    const map = new Map<string, number>();
    users.forEach(u => {
      map.set(u.appId, (map.get(u.appId) || 0) + 1);
    });
    return apps.map(a => ({
      app: a,
      liveUsers: map.get(a.id) || 0
    }));
  }, [apps, users]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter(u => {
      if (appFilter !== 'all' && u.appId !== appFilter) return false;
      if (q) {
        const full = `${u.firstName} ${u.lastName} ${u.email} ${u.uid}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [users, appFilter, userSearch]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(f => {
      if (appFilter !== 'all' && f.appId !== appFilter) return false;
      if (fbCategoryFilter !== 'all' && f.category !== fbCategoryFilter) return false;
      if (fbStatusFilter !== 'all' && f.status !== fbStatusFilter) return false;
      return true;
    });
  }, [feedbacks, appFilter, fbCategoryFilter, fbStatusFilter]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      if (appFilter !== 'all' && t.appId !== appFilter) return false;
      if (spStatusFilter !== 'all' && t.status !== spStatusFilter) return false;
      return true;
    });
  }, [tickets, appFilter, spStatusFilter]);

  // Guards
  if (!firebaseUser) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F4F7FB] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#163B65] dark:text-sky-400">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-extrabold text-[#163B65] dark:text-white">
          DIGISOLIA ADMIN — Authentification requise
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Veuillez vous connecter avec un compte administrateur DigiSolia vérifié pour accéder au
          panneau d’administration centralisé.
        </p>
        <button
          type="button"
          onClick={login}
          className="h-11 px-5 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] text-white font-bold text-xs transition"
        >
          Se connecter avec Google
        </button>
      </div>
    );
  }

  if (!isAnyAdmin || !adminPermissions) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 text-center space-y-3">
        <Shield className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="text-lg font-extrabold text-[#163B65] dark:text-white">
          Accès réservé aux administrateurs DigiSolia
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Le compte <strong>{firebaseUser.email}</strong> ne dispose pas d’un rôle administratif
          autorisé dans <code>/administrators</code>.
        </p>
      </div>
    );
  }

  const notify = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPermissions.canManageApps) return;
    const cleanId = newAppId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanId || !newAppName.trim()) return;

    const record: DigiSoliaAppRecord = {
      id: cleanId,
      name: newAppName.trim(),
      version: newAppVersion.trim() || '1.0.0',
      category: newAppCategory.trim() || 'Application',
      description: newAppDesc.trim(),
      status: 'actif',
      usersCount: 0,
      updatedAt: new Date().toISOString()
    };

    await saveDigiSoliaApp(record);
    setNewAppId('');
    setNewAppName('');
    setNewAppDesc('');
    setShowAppForm(false);
    notify(`Application « ${record.name} » enregistrée.`);
    loadData();
  };

  const handleSaveFeedbackUpdate = async (fb: DigiSoliaFeedbackItem) => {
    if (!adminPermissions.canRespondFeedback) return;
    await adminUpdateFeedbackStatus(fb.appId, fb.id, fbDraftStatus, fbDraftNote);
    setEditingFbId(null);
    notify('Statut du retour mis à jour.');
    loadData();
  };

  const handleSaveTicketUpdate = async (t: DigiSoliaSupportTicket) => {
    if (!adminPermissions.canRespondSupport) return;
    await adminUpdateSupportStatus(t.appId, t.id, spDraftStatus, spDraftReply);
    setEditingTicketId(null);
    notify('Ticket d’assistance mis à jour.');
    loadData();
  };

  const handleToggleUser = async (u: DigiSoliaUserProfile) => {
    if (!adminPermissions.canManageUsers) return;
    const next = u.status === 'actif' ? 'suspendu' : 'actif';
    await adminToggleUserStatus(u.uid, next);
    notify(`Utilisateur ${u.email} passé au statut « ${next} ».`);
    loadData();
  };

  const handleSendNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPermissions.canSendNotifications || !notifTitle.trim() || !notifBody.trim()) return;

    const notif: DigiSoliaNotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appId: notifTargetApp,
      title: notifTitle.trim(),
      message: notifBody.trim(),
      type: notifType,
      createdAt: new Date().toISOString(),
      createdBy: firebaseUser.email || 'Admin DigiSolia'
    };

    await adminPublishNotification(notif);
    setNotifTitle('');
    setNotifBody('');
    notify('Notification publiée en temps réel.');
    loadData();
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPermissions.canManageAdmins || !admUid.trim() || !admEmail.trim()) return;

    await adminSaveAdministrator({
      uid: admUid.trim(),
      email: admEmail.trim(),
      displayName: admName.trim() || admEmail.trim(),
      role: admRole,
      assignedApps: admAssignedApps.trim() || '*',
      createdAt: new Date().toISOString()
    });

    setAdmUid('');
    setAdmEmail('');
    setAdmName('');
    notify('Administrateur et permissions RBAC enregistrés.');
    loadData();
  };

  const handleRevokeAdmin = async (adm: DigiSoliaAdminRecord) => {
    if (!adminPermissions.canManageAdmins) return;
    await adminRemoveAdministrator(adm.uid, adm.email);
    setConfirmRevokeUid(null);
    notify(`Droits révoqués pour ${adm.email}.`);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Admin Header */}
      <header className="p-6 rounded-2xl bg-[#163B65] dark:bg-[#0f2642] text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
            <Shield className="w-4 h-4" />
            <span>Console Centrale Multi-Produits</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">DIGISOLIA ADMIN</h1>
          <p className="text-xs text-sky-100/85">
            Connecté : {firebaseUser.email} · Rôle : <strong>{adminPermissions.label}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={appFilter}
            onChange={e => setAppFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold outline-none"
          >
            <option value="all" className="text-slate-900">
              Toutes les applications ({apps.length})
            </option>
            {apps.map(a => (
              <option key={a.id} value={a.id} className="text-slate-900">
                {a.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadData}
            disabled={loading || !isOnline}
            className="h-9 px-3.5 rounded-xl bg-white text-[#163B65] hover:bg-sky-50 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </header>

      {/* Alerts */}
      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2 border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Tableau de bord & Satisfaction', icon: BarChart3 },
          { id: 'apps_users', label: 'Applications & Utilisateurs', icon: Users },
          { id: 'feedback', label: 'Avis, Suggestions & Réclamations', icon: MessageSquare },
          { id: 'support', label: 'Demandes d’assistance', icon: LifeBuoy },
          { id: 'notifications', label: 'Notifications & Audit', icon: Bell },
          { id: 'admins', label: 'Administrateurs & Rôles', icon: UserCog }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                active
                  ? 'bg-[#163B65] dark:bg-[#2783C7] text-white shadow-sm'
                  : 'bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#F4F7FB] dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* TAB 1: OVERVIEW & SATISFACTION */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Applications DigiSolia
              </div>
              <div className="text-2xl font-extrabold text-[#163B65] dark:text-white mt-1 tabular-nums">
                {apps.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                POS · Hôtel · Pharmacie · Planning
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Comptes utilisateurs cloud
              </div>
              <div className="text-2xl font-extrabold text-[#163B65] dark:text-white mt-1 tabular-nums">
                {users.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {users.filter(u => u.status === 'actif').length} actifs
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Note moyenne de satisfaction
              </div>
              <div className="text-2xl font-extrabold text-[#2783C7] dark:text-sky-400 mt-1 tabular-nums">
                {satisfactionStats.totalRated > 0
                  ? `${satisfactionStats.avg.toFixed(1)} / 5`
                  : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                Sur {satisfactionStats.totalRated} évaluation(s)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tickets & Réclamations ouverts
              </div>
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                {satisfactionStats.pendingTicketsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {satisfactionStats.reclamationsCount} réclamation(s) ·{' '}
                {satisfactionStats.suggestionsCount} suggestion(s)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Users per app breakdown */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                Répartition des utilisateurs par application
              </h2>
              <div className="space-y-3">
                {usersPerApp.map(({ app, liveUsers }) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700/60 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#163B65] dark:text-white">
                        {app.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {app.id} · v{app.version} · {app.category}
                      </div>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <div className="text-sm font-extrabold text-[#2783C7] dark:text-sky-400">
                        {liveUsers} cloud
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {app.usersCount} licences estimées
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Satisfaction Stats */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-4">
              <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                Statistiques de satisfaction (1–5 étoiles)
              </h2>
              <div className="space-y-3">
                {satisfactionStats.distribution.map(row => (
                  <div key={row.star} className="flex items-center gap-3 text-xs tabular-nums">
                    <span className="w-14 font-bold text-slate-700 dark:text-slate-300">
                      {row.star} étoile{row.star > 1 ? 's' : ''}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#F4F7FB] dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-[#2783C7] rounded-full transition-all"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-slate-500 dark:text-slate-400">
                      {row.count} ({row.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPS & USERS */}
      {activeTab === 'apps_users' && (
        <div className="space-y-6">
          {/* Applications Catalog */}
          <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-sm text-[#163B65] dark:text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#2783C7]" />
                <span>Applications de l’écosystème ({apps.length})</span>
              </h2>
              {adminPermissions.canManageApps && (
                <button
                  type="button"
                  onClick={() => setShowAppForm(!showAppForm)}
                  className="h-9 px-3.5 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter / Modifier une app</span>
                </button>
              )}
            </div>

            {showAppForm && adminPermissions.canManageApps && (
              <form
                onSubmit={handleSaveApp}
                className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder="ID unique (ex: digisolia-pos)"
                  value={newAppId}
                  onChange={e => setNewAppId(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                />
                <input
                  type="text"
                  required
                  placeholder="Nom de l’application"
                  value={newAppName}
                  onChange={e => setNewAppName(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Version (ex: 3.1.2)"
                  value={newAppVersion}
                  onChange={e => setNewAppVersion(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="text"
                  placeholder="Catégorie"
                  value={newAppCategory}
                  onChange={e => setNewAppCategory(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="text"
                  placeholder="Description courte..."
                  value={newAppDesc}
                  onChange={e => setNewAppDesc(e.target.value)}
                  className="sm:col-span-2 lg:col-span-3 h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-[#2783C7] hover:bg-sky-600 text-white font-bold text-xs"
                >
                  Enregistrer App
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {apps.map(a => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/50 border border-[#E1E7EF] dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-[#163B65] dark:text-white truncate">
                      {a.name}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                      {a.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#2783C7] dark:text-sky-400 font-semibold tabular-nums">
                    {a.id} · v{a.version}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Users Table */}
          <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                Gestion des utilisateurs ({filteredUsers.length})
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Rechercher nom, e-mail..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs responsive-table">
                <thead className="border-b border-[#E1E7EF] dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="py-2.5 pr-3">Utilisateur</th>
                    <th className="py-2.5 px-3">E-mail</th>
                    <th className="py-2.5 px-3">Application</th>
                    <th className="py-2.5 px-3">Dernière connexion</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E7EF] dark:divide-slate-800">
                  {filteredUsers.map(u => (
                    <tr key={u.uid}>
                      <td className="py-3 pr-3 font-bold text-[#163B65] dark:text-white" data-l="Utilisateur">
                        {`${u.firstName} ${u.lastName}`.trim() || 'Sans nom'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300" data-l="E-mail">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#2783C7] dark:text-sky-400" data-l="Application">
                        {u.appId}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-slate-500" data-l="Connexion">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="py-3 px-3" data-l="Statut">
                        <span
                          className={`font-bold ${
                            u.status === 'actif'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {u.status === 'actif' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right" data-l="Action">
                        {adminPermissions.canManageUsers ? (
                          <button
                            type="button"
                            onClick={() => handleToggleUser(u)}
                            className="text-xs font-bold text-[#2783C7] hover:underline"
                          >
                            {u.status === 'actif' ? 'Suspendre' : 'Réactiver'}
                          </button>
                        ) : (
                          <span className="text-slate-400">Lecture seule</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: FEEDBACK, SUGGESTIONS, RECLAMATIONS */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={fbCategoryFilter}
              onChange={e => setFbCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-[#0f1b29] text-xs font-bold"
            >
              <option value="all">Toutes catégories</option>
              <option value="avis">Avis</option>
              <option value="suggestion">Suggestions</option>
              <option value="bug">Bugs</option>
              <option value="reclamation">Réclamations</option>
            </select>

            <select
              value={fbStatusFilter}
              onChange={e => setFbStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-[#0f1b29] text-xs font-bold"
            >
              <option value="all">Tous statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours de traitement</option>
              <option value="resolu">Résolu</option>
              <option value="rejete">Rejeté</option>
            </select>

            <span className="text-xs text-slate-500 tabular-nums">
              {filteredFeedbacks.length} élément(s)
            </span>
          </div>

          <div className="space-y-3">
            {filteredFeedbacks.map(fb => (
              <div
                key={`${fb.appId}-${fb.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-extrabold text-[#163B65] dark:text-white uppercase">
                      {fb.category}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-[#2783C7] dark:text-sky-400">
                      {fb.appId}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {fb.userName} ({fb.userEmail})
                    </span>
                  </div>
                  <StatusReadout status={fb.status} />
                </div>

                {typeof fb.rating === 'number' && <StarRating value={fb.rating} readonly size="sm" />}

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {fb.message}
                </p>

                {fb.adminNote && editingFbId !== fb.id && (
                  <div className="p-3 rounded-xl bg-[#F4F7FB] dark:bg-slate-800 text-xs">
                    <strong>Note admin :</strong> {fb.adminNote}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E1E7EF] dark:border-slate-800 text-xs">
                  <span className="text-slate-400 tabular-nums">
                    {new Date(fb.createdAt).toLocaleString('fr-FR')}
                  </span>

                  {adminPermissions.canRespondFeedback && editingFbId !== fb.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFbId(fb.id);
                        setFbDraftStatus(fb.status);
                        setFbDraftNote(fb.adminNote || '');
                      }}
                      className="font-bold text-[#2783C7] hover:underline"
                    >
                      Traiter / Répondre
                    </button>
                  )}
                </div>

                {editingFbId === fb.id && (
                  <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/70 border border-[#E1E7EF] dark:border-slate-700 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        value={fbDraftStatus}
                        onChange={e =>
                          setFbDraftStatus(e.target.value as DigiSoliaProcessingStatus)
                        }
                        className="h-9 px-3 rounded-lg border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      >
                        {Object.entries(STATUS_LABELS).map(([k, lbl]) => (
                          <option key={k} value={k}>
                            {lbl}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Note de suivi pour l’utilisateur..."
                        value={fbDraftNote}
                        onChange={e => setFbDraftNote(e.target.value)}
                        className="sm:col-span-2 h-9 px-3 rounded-lg border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingFbId(null)}
                        className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveFeedbackUpdate(fb)}
                        className="h-8 px-3.5 rounded-lg bg-[#163B65] text-white text-xs font-bold"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={spStatusFilter}
              onChange={e => setSpStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-[#0f1b29] text-xs font-bold"
            >
              <option value="all">Tous statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours de traitement</option>
              <option value="resolu">Résolu</option>
              <option value="rejete">Rejeté</option>
            </select>
            <span className="text-xs text-slate-500 tabular-nums">
              {filteredTickets.length} demande(s)
            </span>
          </div>

          <div className="space-y-3">
            {filteredTickets.map(t => (
              <div
                key={`${t.appId}-${t.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-[#163B65] dark:text-white">
                      {t.subject}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.appId} · {t.userName} ({t.userEmail}) · Priorité :{' '}
                      <strong className={t.priority === 'urgente' ? 'text-rose-600' : ''}>
                        {t.priority}
                      </strong>
                    </div>
                  </div>
                  <StatusReadout status={t.status} />
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {t.message}
                </p>

                {t.technicalInfo && (
                  <div className="text-[11px] font-mono text-slate-500 bg-[#F4F7FB] dark:bg-slate-800/60 p-2 rounded-lg">
                    {t.technicalInfo}
                  </div>
                )}

                {t.response && editingTicketId !== t.id && (
                  <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 text-xs">
                    <strong>Réponse support :</strong> {t.response}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#E1E7EF] dark:border-slate-800 text-xs">
                  <span className="text-slate-400 tabular-nums">
                    {new Date(t.createdAt).toLocaleString('fr-FR')}
                  </span>

                  {adminPermissions.canRespondSupport && editingTicketId !== t.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTicketId(t.id);
                        setSpDraftStatus(t.status);
                        setSpDraftReply(t.response || '');
                      }}
                      className="font-bold text-[#2783C7] hover:underline"
                    >
                      Répondre / Changer statut
                    </button>
                  )}
                </div>

                {editingTicketId === t.id && (
                  <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/70 border border-[#E1E7EF] dark:border-slate-700 space-y-3">
                    <select
                      value={spDraftStatus}
                      onChange={e =>
                        setSpDraftStatus(e.target.value as DigiSoliaProcessingStatus)
                      }
                      className="h-9 px-3 rounded-lg border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    >
                      {Object.entries(STATUS_LABELS).map(([k, lbl]) => (
                        <option key={k} value={k}>
                          {lbl}
                        </option>
                      ))}
                    </select>
                    <textarea
                      rows={2}
                      placeholder="Réponse technique adressée à l’utilisateur..."
                      value={spDraftReply}
                      onChange={e => setSpDraftReply(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#E1E7EF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTicketId(null)}
                        className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveTicketUpdate(t)}
                        className="h-8 px-3.5 rounded-lg bg-[#163B65] text-white text-xs font-bold"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS & LOGS */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            {adminPermissions.canSendNotifications ? (
              <form
                onSubmit={handleSendNotif}
                className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-4"
              >
                <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
                  Diffuser une notification aux utilisateurs
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={notifTargetApp}
                    onChange={e => setNotifTargetApp(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="all">Toutes les applications</option>
                    {apps.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={notifType}
                    onChange={e => setNotifType(e.target.value as DigiSoliaNotificationType)}
                    className="h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="info">Information</option>
                    <option value="mise_a_jour">Mise à jour</option>
                    <option value="alerte">Alerte importante</option>
                    <option value="maintenance">Maintenance planifiée</option>
                  </select>
                </div>

                <input
                  type="text"
                  required
                  maxLength={140}
                  placeholder="Titre de la notification"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs font-bold"
                />

                <textarea
                  required
                  maxLength={600}
                  rows={3}
                  placeholder="Contenu du message affiché aux utilisateurs..."
                  value={notifBody}
                  onChange={e => setNotifBody(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs"
                />

                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] text-white font-bold text-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publier la notification</span>
                </button>
              </form>
            ) : (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 text-xs text-slate-500">
                Votre rôle ({adminPermissions.label}) ne permet pas l’envoi de notifications.
              </div>
            )}

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-[#163B65] dark:text-white">
                Historique des diffusions ({notifications.length})
              </h3>
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-[#163B65] dark:text-white">
                      <span>{n.title}</span>
                      <span className="text-[#2783C7]">{n.appId}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-3">
            <h2 className="font-bold text-sm text-[#163B65] dark:text-white flex items-center gap-2">
              <FileClock className="w-4 h-4 text-[#2783C7]" />
              <span>Journal d’audit immuable ({logs.length})</span>
            </h2>
            <div className="space-y-2 max-h-[460px] overflow-y-auto">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 text-xs space-y-0.5"
                >
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{log.action}</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {log.actorEmail} → {log.target}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ADMINS & RBAC ROLES */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Role Matrix Reference */}
          <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-4">
            <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
              Matrice des rôles & permissions DigiSolia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(DIGISOLIA_ROLE_MATRIX) as DigiSoliaAdminRole[]).map(roleKey => {
                const r = DIGISOLIA_ROLE_MATRIX[roleKey];
                return (
                  <div
                    key={roleKey}
                    className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700/60 space-y-1.5"
                  >
                    <div className="font-bold text-xs text-[#163B65] dark:text-white">
                      {r.label}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {adminPermissions.canManageAdmins && (
              <form
                onSubmit={handleSaveAdmin}
                className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-3"
              >
                <h3 className="font-bold text-sm text-[#163B65] dark:text-white">
                  Nommer ou modifier un administrateur
                </h3>
                <input
                  type="text"
                  required
                  placeholder="UID Firebase Auth de l’utilisateur"
                  value={admUid}
                  onChange={e => setAdmUid(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs font-mono"
                />
                <input
                  type="email"
                  required
                  placeholder="Adresse e-mail"
                  value={admEmail}
                  onChange={e => setAdmEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={admName}
                  onChange={e => setAdmName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs"
                />
                <select
                  value={admRole}
                  onChange={e => setAdmRole(e.target.value as DigiSoliaAdminRole)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="super_admin">Super administrateur</option>
                  <option value="app_admin">Administrateur d’application</option>
                  <option value="support_agent">Agent de support</option>
                  <option value="stats_reader">Lecteur des statistiques</option>
                </select>
                <input
                  type="text"
                  placeholder="Applications assignées (* ou digisolia-pos,digisolia-hotel)"
                  value={admAssignedApps}
                  onChange={e => setAdmAssignedApps(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-xs"
                />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] text-white font-bold text-xs"
                >
                  Enregistrer le rôle
                </button>
              </form>
            )}

            <div
              className={`${
                adminPermissions.canManageAdmins ? 'lg:col-span-7' : 'lg:col-span-12'
              } p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 space-y-3`}
            >
              <h3 className="font-bold text-sm text-[#163B65] dark:text-white">
                Administrateurs enregistrés ({admins.length})
              </h3>
              <div className="space-y-2.5">
                {admins.map(a => (
                  <div
                    key={a.uid}
                    className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#163B65] dark:text-white">
                        {a.displayName || a.email}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {a.email} · Rôle :{' '}
                        <strong className="text-[#2783C7]">
                          {DIGISOLIA_ROLE_MATRIX[a.role]?.label || a.role}
                        </strong>{' '}
                        · Apps : {a.assignedApps}
                      </div>
                    </div>

                    {adminPermissions.canManageAdmins && (
                      <div>
                        {confirmRevokeUid === a.uid ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRevokeAdmin(a)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRevokeUid(null)}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 font-semibold"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmRevokeUid(a.uid)}
                            className="text-rose-600 hover:underline font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Révoquer</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
