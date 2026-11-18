import React, { useState } from 'react';
import { Info, Target, Eye, MapPin, Phone, Mail, FileText, Lock } from 'lucide-react';
import { useDigiSolia } from '../hooks/useDigiSolia';
import { DigiSoliaLogo } from '../components/DigiSoliaLogo';

export const AboutModule: React.FC = () => {
  const { config } = useDigiSolia();
  const [legalTab, setLegalTab] = useState<'cgu' | 'privacy'>('cgu');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Identity Card */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E1E7EF] dark:border-slate-800 pb-5">
          <DigiSoliaLogo config={config} size="lg" showTagline />
          <div className="text-right text-xs tabular-nums">
            <div className="font-bold text-[#163B65] dark:text-white">{config.appName}</div>
            <div className="text-slate-500 dark:text-slate-400">Version {config.version}</div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-base font-extrabold text-[#163B65] dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2783C7]" />
            <span>Présentation de DigiSolia</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>{config.brand.editor}</strong> est une entreprise de solutions numériques basée au{' '}
            <strong>{config.brand.country}</strong> ({config.brand.city}). Nous concevons des
            logiciels de gestion fiables, adaptés aux réalités opérationnelles des commerces,
            officines pharmaceutiques, établissements hôteliers et institutions éducatives en Afrique
            de l’Ouest.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-[#163B65] dark:text-white">
            <Target className="w-4 h-4 text-[#2783C7]" />
            <span>Notre Mission</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Démocratiser l’accès aux outils numériques professionnels en offrant des logiciels
            rapides, intuitifs, capables de fonctionner sans coupure même en zone à connectivité
            intermittente et accompagnés d’un support de proximité.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-[#163B65] dark:text-white">
            <Eye className="w-4 h-4 text-[#2783C7]" />
            <span>Notre Vision</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Bâtir l’écosystème logiciel de référence en Afrique de l’Ouest (DigiSolia POS,
            DigiSolia Hôtel, Prof Planning et solutions sectorielles) autour d’un socle unifié,
            sécurisé et centré sur la performance des entrepreneurs.
          </p>
        </section>
      </div>

      {/* Official Coordinates */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
          Coordonnées officielles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#2783C7] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">Siège social</div>
              <div className="text-slate-500 dark:text-slate-400">{config.contact.address}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-[#2783C7] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Téléphone & WhatsApp
              </div>
              <div className="text-slate-500 dark:text-slate-400 tabular-nums">
                Tél : {config.contact.phoneDisplay}
                <br />
                WhatsApp : {config.contact.whatsappDisplay}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-[#2783C7] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">Courriel officiel</div>
              <div className="text-slate-500 dark:text-slate-400">{config.contact.email}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Use & Privacy Policy */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1b29] border border-[#E1E7EF] dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7EF] dark:border-slate-800 pb-3">
          <h2 className="font-bold text-sm text-[#163B65] dark:text-white">
            Mentions légales & Engagement de sécurité
          </h2>

          <div className="inline-flex rounded-xl p-1 bg-[#F4F7FB] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLegalTab('cgu')}
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                legalTab === 'cgu'
                  ? 'bg-white dark:bg-slate-900 text-[#163B65] dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Conditions d’utilisation</span>
            </button>
            <button
              type="button"
              onClick={() => setLegalTab('privacy')}
              className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                legalTab === 'privacy'
                  ? 'bg-white dark:bg-slate-900 text-[#163B65] dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Confidentialité</span>
            </button>
          </div>
        </div>

        {legalTab === 'cgu' ? (
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong>1. Objet :</strong> Les présentes conditions régissent l’utilisation des
              applications éditées par {config.brand.editor} intégrant le socle DigiSolia App
              Framework.
            </p>
            <p>
              <strong>2. Usage professionnel :</strong> L’utilisateur demeure seul responsable de
              l’exactitude des données métier saisies (stocks, tarifs, réservations ou écritures
              commerciales) et de la sauvegarde régulière de ses exports.
            </p>
            <p>
              <strong>3. Disponibilité :</strong> L’application garantit une continuité locale hors
              connexion ; la synchronisation cloud repose sur l’authentification valide de
              l’utilisateur.
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
            <p>
              <strong>1. Cloisonnement strict :</strong> Les données propres à chaque application (
              {config.appId}) sont isolées par identifiant applicatif dans Cloud Firestore.
            </p>
            <p>
              <strong>2. Protection des données personnelles :</strong> Votre nom, e-mail et numéro
              de téléphone servent exclusivement à l’authentification, au suivi de vos tickets
              d’assistance et à la personnalisation de votre espace.
            </p>
            <p>
              <strong>3. Contrôle d’accès :</strong> Aucune donnée sensible n’est vendue ni partagée
              à des tiers. L’accès administratif est strictement journalisé et encadré par des
              rôles RBAC.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
