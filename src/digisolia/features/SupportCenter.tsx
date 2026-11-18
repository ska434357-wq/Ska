import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageCircle,
  Phone,
  Mail,
  Send,
  BookOpen,
  HelpCircle,
  ChevronDown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import { StatusReadout } from '../components/StatusReadout';

const FAQ_ITEMS = [
  {
    q: 'Que se passe-t-il si ma connexion Internet coupe pendant la saisie ?',
    a: 'Toutes vos données métier ainsi que vos demandes d’assistance et avis sont enregistrés localement dans votre appareil. Dès le retour de la connexion, la file de synchronisation DigiSolia les transmet automatiquement vers le cloud sans doublon.'
  },
  {
    q: 'Comment contacter un technicien DigiSolia en urgence ?',
    a: 'Utilisez directement les boutons WhatsApp ou Appel téléphonique affichés en haut de cette page, ou soumettez un ticket en sélectionnant le niveau de priorité « Urgente ».'
  },
  {
    q: 'Comment installer l’application sur téléphone Android ou ordinateur ?',
    a: 'L’application intègre le support PWA : utilisez le bouton « Installer l’app » dans l’en-tête ou le menu « Ajouter à l’écran d’accueil » de Google Chrome / Edge.'
  },
  {
    q: 'Mes données d’une application DigiSolia peuvent-elles se mélanger avec un autre logiciel ?',
    a: 'Non. Chaque produit DigiSolia possède un identifiant unique et des collections isolées côté base de données et règles de sécurité Firebase.'
  }
];

const GUIDE_STEPS = [
  {
    title: '1. Travailler sereinement au quotidien',
    detail:
      'Naviguez depuis le menu principal vers vos modules métier (tableau de bord, catalogue, opérations) sans interruption même hors ligne.'
  },
  {
    title: '2. Vérifier votre état de synchronisation',
    detail:
      'Consultez l’indicateur de connexion dans « Accueil DigiSolia » ou « Paramètres ». Connectez-vous avec votre compte Google pour activer la sauvegarde cloud.'
  },
  {
    title: '3. Signaler un incident technique',
    detail:
      'Remplissez le formulaire ci-dessous : les informations de version et d’environnement peuvent être jointes automatiquement pour accélérer le diagnostic.'
  }
];

export const SupportCenter: React.FC = () => {
  const { config, submitSupport, userTickets, isOnline } = useDigiSolia();

  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'normale' | 'urgente'>('normale');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setSubmitting(true);
    const res = await submitSupport({ subject, priority, message });
    setSubmitting(false);

    if (!res.ok) {
      setFeedbackMsg({ type: 'err', text: res.error || 'Erreur de validation.' });
      return;
    }

    setSubject('');
    setMessage('');
    setPriority('normale');
    setFeedbackMsg({
      type: 'ok',
      text: res.offline
        ? 'Demande enregistrée localement (hors ligne). Elle sera transmise automatiquement au retour d’Internet.'
        : 'Votre demande d’assistance a bien été transmise à l’équipe DigiSolia.'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#163B65] dark:text-white flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-[#2783C7]" />
          <span>Centre d’assistance DigiSolia</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Support technique direct, guide d’utilisation et suivi de vos tickets — {config.appShortName}
        </p>
      </div>

      {/* Direct Contact Cards (Configurable from central config) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href={`https://wa.me/${config.contact.whatsappRaw}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 hover:border-emerald-500 transition flex items-start gap-3.5 shadow-sm"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Contact WhatsApp
            </div>
            <div className="text-sm font-extrabold text-[#163B65] dark:text-white tabular-nums mt-0.5">
              {config.contact.whatsappDisplay}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Démarrer une discussion →
            </div>
          </div>
        </a>

        <a
          href={`tel:${config.contact.phoneRaw}`}
          className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 hover:border-[#2783C7] transition flex items-start gap-3.5 shadow-sm"
        >
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#2783C7] dark:text-sky-400 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Appel téléphonique
            </div>
            <div className="text-sm font-extrabold text-[#163B65] dark:text-white tabular-nums mt-0.5">
              {config.contact.phoneDisplay}
            </div>
            <div className="text-[11px] text-[#2783C7] dark:text-sky-400 font-semibold mt-1">
              Appeler l’assistance →
            </div>
          </div>
        </a>

        <a
          href={`mailto:${config.contact.email}?subject=${encodeURIComponent(
            `[Support ${config.appShortName}] Demande d'assistance`
          )}`}
          className="p-5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 hover:border-[#163B65] transition flex items-start gap-3.5 shadow-sm"
        >
          <div className="p-2.5 rounded-xl bg-[#F4F7FB] dark:bg-slate-800 text-[#163B65] dark:text-sky-300 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Adresse e-mail
            </div>
            <div className="text-sm font-extrabold text-[#163B65] dark:text-white truncate mt-0.5">
              {config.contact.email}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Envoyer un courriel →
            </div>
          </div>
        </a>
      </div>

      {/* Main Grid: Ticket Form & User Guide + FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form & My Tickets */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
              <h2 className="font-bold text-base text-[#163B65] dark:text-white">
                Demande d’assistance / Signalement technique
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isOnline
                  ? 'Envoi sécurisé vers l’équipe support DigiSolia.'
                  : 'Vous êtes hors ligne : votre ticket sera mis en file locale.'}
              </p>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  feedbackMsg.type === 'ok'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {feedbackMsg.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Objet de la demande *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={160}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Ex: Difficulté de synchronisation ou question"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#2783C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Priorité
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as 'normale' | 'urgente')}
                  className="w-full h-11 px-3 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#2783C7]"
                >
                  <option value="normale">Normale</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Description de la difficulté technique *
                </label>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {message.length}/2000
                </span>
              </div>
              <textarea
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez précisément l’étape où le problème survient ou votre besoin d’assistance..."
                className="w-full p-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#2783C7]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] dark:hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Envoi en cours...' : 'Envoyer la demande'}</span>
              </button>
            </div>
          </form>

          {/* User Tickets History */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#163B65] dark:text-white">
              Mes demandes d’assistance ({userTickets.length})
            </h3>

            {userTickets.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                Vous n’avez pas encore soumis de ticket d’assistance sur {config.appShortName}.
              </p>
            ) : (
              <div className="space-y-3">
                {userTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-xs text-[#163B65] dark:text-white">
                        {ticket.subject}
                      </span>
                      <StatusReadout
                        status={ticket.status}
                        pendingOffline={ticket.pendingOffline}
                      />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ticket.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>Priorité : {ticket.priority === 'urgente' ? 'Urgente' : 'Normale'}</span>
                      <span>·</span>
                      <span>{new Date(ticket.createdAt).toLocaleString('fr-FR')}</span>
                    </div>
                    {ticket.response && (
                      <div className="mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-700 text-xs">
                        <span className="font-bold text-[#2783C7] dark:text-sky-400">
                          Réponse support :{' '}
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">
                          {ticket.response}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Guide & FAQ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Guide d'utilisation */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-[#163B65] dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2783C7]" />
              <span>Guide d’utilisation rapide</span>
            </h2>
            <div className="space-y-3">
              {GUIDE_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700/50 space-y-1"
                >
                  <div className="font-bold text-xs text-[#163B65] dark:text-sky-300">
                    {step.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-[#163B65] dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#2783C7]" />
              <span>Questions fréquentes (FAQ)</span>
            </h2>

            <div className="divide-y divide-[#E1E7EF] dark:divide-slate-800">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-2 text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#2783C7]"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-[#2783C7]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
