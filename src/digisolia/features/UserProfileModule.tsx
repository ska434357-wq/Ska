import React, { useState, useEffect } from 'react';
import {
  User,
  LogIn,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';

export const UserProfileModule: React.FC = () => {
  const {
    firebaseUser,
    userProfile,
    adminPermissions,
    login,
    logout,
    saveUserProfile,
    config
  } = useDigiSolia();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName);
      setLastName(userProfile.lastName);
      setPhone(userProfile.phone);
    } else if (firebaseUser?.displayName) {
      const parts = firebaseUser.displayName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' '));
    }
  }, [userProfile, firebaseUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (!firstName.trim()) {
      setNotice({ type: 'err', text: 'Le prénom est obligatoire.' });
      return;
    }
    setSaving(true);
    const res = await saveUserProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim()
    });
    setSaving(false);

    if (!res.ok) {
      setNotice({ type: 'err', text: res.error || 'Échec de l’enregistrement.' });
      return;
    }

    setNotice({
      type: 'ok',
      text: res.offline
        ? 'Profil mis à jour localement (sera synchronisé dès retour d’Internet).'
        : 'Informations personnelles enregistrées avec succès.'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#163B65] dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#2783C7]" />
          <span>Profil Utilisateur</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gestion de votre compte et de votre session active sur {config.appShortName}
        </p>
      </div>

      {!firebaseUser ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F7FB] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#163B65] dark:text-sky-400">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="font-bold text-base text-[#163B65] dark:text-white">
              Session locale non connectée au Cloud
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Connectez-vous avec Google pour retrouver votre profil sur tous vos appareils,
              synchroniser vos préférences et suivre vos tickets d’assistance.
            </p>
          </div>
          <button
            type="button"
            onClick={login}
            className="h-11 px-6 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] dark:hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter avec Google</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Session Overview Card */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Profil'}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#E1E7EF] dark:border-slate-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#163B65] text-white font-extrabold text-lg flex items-center justify-center">
                  {(firstName[0] || firebaseUser.email?.[0] || 'U').toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="font-bold text-sm text-[#163B65] dark:text-white truncate">
                  {`${firstName} ${lastName}`.trim() || firebaseUser.displayName || 'Utilisateur'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {firebaseUser.email}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#E1E7EF] dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Création du compte
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR')
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Statut / Rôle
                </span>
                <span className="font-bold text-[#2783C7] dark:text-sky-400">
                  {adminPermissions ? adminPermissions.label : 'Utilisateur'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full h-10 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>

          {/* Personal Info Edit Form */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4"
          >
            <h2 className="font-bold text-base text-[#163B65] dark:text-white border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
              Informations personnelles
            </h2>

            {notice && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                  notice.type === 'ok'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {notice.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{notice.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#2783C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#2783C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  disabled
                  value={firebaseUser.email || ''}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Téléphone (facultatif)
                </label>
                <input
                  type="tel"
                  maxLength={40}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ex: +226 70 00 00 00"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#2783C7] tabular-nums"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-5 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] dark:hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer mon profil'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
