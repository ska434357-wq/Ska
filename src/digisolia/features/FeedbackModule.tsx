import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Lightbulb,
  Bug,
  Star
} from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import { DigiSoliaFeedbackCategory } from '../types';
import { StarRating } from '../components/StarRating';
import { StatusReadout } from '../components/StatusReadout';

const CATEGORY_OPTIONS: {
  id: DigiSoliaFeedbackCategory;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'avis',
    label: 'Avis général',
    desc: 'Évaluation de votre expérience',
    icon: Star
  },
  {
    id: 'suggestion',
    label: 'Suggestion',
    desc: 'Idée d’amélioration fonctionnelle',
    icon: Lightbulb
  },
  {
    id: 'bug',
    label: 'Signaler un bug',
    desc: 'Anomalie ou comportement inattendu',
    icon: Bug
  },
  {
    id: 'reclamation',
    label: 'Réclamation',
    desc: 'Insatisfaction nécessitant un suivi',
    icon: ShieldAlert
  }
];

export const FeedbackModule: React.FC = () => {
  const { config, submitFeedback, userFeedbacks, isOnline } = useDigiSolia();

  const [category, setCategory] = useState<DigiSoliaFeedbackCategory>('avis');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);
    setSubmitting(true);

    const res = await submitFeedback({
      category,
      rating: category === 'avis' || category === 'suggestion' ? rating : undefined,
      message
    });

    setSubmitting(false);

    if (!res.ok) {
      setStatusNotice({ type: 'err', text: res.error || 'Envoi impossible.' });
      return;
    }

    setMessage('');
    setStatusNotice({
      type: 'ok',
      text: res.offline
        ? 'Merci ! Enregistré localement hors connexion : synchronisation automatique prévue.'
        : 'Merci ! Votre retour a été enregistré dans Firebase pour traitement par DigiSolia.'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-[#163B65] dark:text-white flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-[#2783C7]" />
          <span>Avis, Suggestions & Réclamations</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Partagez votre retour sur {config.appShortName}. Chaque demande est suivie par l’équipe
          DigiSolia (protection anti-spam active).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-5"
        >
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
              Type de retour *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = category === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      active
                        ? 'border-[#163B65] dark:border-sky-400 bg-[#F4F7FB] dark:bg-sky-950/40'
                        : 'border-[#E1E7EF] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${
                          active ? 'text-[#2783C7] dark:text-sky-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-xs font-bold text-[#163B65] dark:text-white">
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating 1 to 5 */}
          <div className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#163B65] dark:text-white">
                Note de satisfaction (1 à 5 étoiles)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Évaluez la qualité globale de {config.appShortName}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} size="lg" />
              <span className="text-sm font-extrabold text-[#163B65] dark:text-sky-300 tabular-nums">
                {rating}/5
              </span>
            </div>
          </div>

          {statusNotice && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusNotice.type === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusNotice.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusNotice.text}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Votre message détaillé *
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
              placeholder="Saisissez votre commentaire, suggestion, bug constaté ou réclamation..."
              className="w-full p-3.5 rounded-xl border border-[#E1E7EF] dark:border-slate-700 bg-[#F4F7FB] dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#2783C7]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isOnline
                ? 'Application identifiée : ' + config.appId
                : 'Mode hors ligne : envoi différé sécurisé'}
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-5 rounded-xl bg-[#163B65] hover:bg-[#1e4c82] dark:bg-[#2783C7] dark:hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Publication...' : 'Envoyer mon retour'}</span>
            </button>
          </div>
        </form>

        {/* History */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-[#163B65] dark:text-white border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
            Historique de mes retours ({userFeedbacks.length})
          </h2>

          {userFeedbacks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Aucun avis ou suggestion transmis pour le moment.
            </div>
          ) : (
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {userFeedbacks.map(fb => {
                const catLabel =
                  CATEGORY_OPTIONS.find(c => c.id === fb.category)?.label || fb.category;
                return (
                  <div
                    key={fb.id}
                    className="p-4 rounded-xl bg-[#F4F7FB] dark:bg-slate-800/60 border border-[#E1E7EF] dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#163B65] dark:text-white">
                        {catLabel}
                      </span>
                      <StatusReadout status={fb.status} pendingOffline={fb.pendingOffline} />
                    </div>

                    {typeof fb.rating === 'number' && (
                      <div className="flex items-center gap-2">
                        <StarRating value={fb.rating} readonly size="sm" />
                        <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                          {fb.rating}/5
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {fb.message}
                    </p>

                    <div className="text-[11px] text-slate-400 tabular-nums">
                      {new Date(fb.createdAt).toLocaleString('fr-FR')}
                    </div>

                    {fb.adminNote && (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-700 text-xs">
                        <span className="font-bold text-[#2783C7] dark:text-sky-400">
                          Suivi DigiSolia :{' '}
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">{fb.adminNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
