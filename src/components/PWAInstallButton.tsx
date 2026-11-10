import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // If already running in standalone PWA mode
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="mx-3 my-2 px-3 py-2 rounded-xl bg-teal-900/30 border border-teal-500/20 text-teal-300 text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">Application PWA installée</span>
        </div>
      );
    }
    return null;
  }

  // Dismissed banner
  if (variant === 'banner' && isBannerDismissed) {
    return null;
  }

  // Action handler
  const handleTrigger = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions modal if browser doesn't expose beforeinstallprompt yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Variant: Top Banner */}
      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-[#0b3b36] to-[#0f4d47] text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs border-b border-teal-700/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-teal-300" />
            </div>
            <div className="truncate">
              <span className="font-bold text-white">Installer Pharmacie Laafi Zanga :</span>{' '}
              <span className="text-teal-100 hidden sm:inline">
                Accès direct depuis votre écran d'accueil, utilisation 100% hors-ligne.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTrigger}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 rounded-md text-teal-200/70 hover:text-white hover:bg-teal-800/50 transition"
              title="Fermer le bandeau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Variant: Header / Action Button */}
      {variant === 'button' && (
        <button
          onClick={handleTrigger}
          className="h-9 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Installer sur votre appareil (ordinateur, tablette ou mobile)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Installer l'application</span>
          <span className="sm:hidden">Installer</span>
        </button>
      )}

      {/* Variant: Sidebar widget */}
      {variant === 'sidebar' && (
        <div className="p-3 mx-3 my-2 rounded-xl bg-gradient-to-br from-[#062421] to-[#0b3b36] border border-teal-500/30 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <Smartphone className="w-4 h-4 text-teal-300" />
            <span className="text-xs font-bold text-white">Mode PWA Hors-ligne</span>
          </div>
          <p className="text-[11px] text-teal-100/80 mb-2.5 leading-snug">
            Installez l'outil sur votre bureau ou mobile pour gérer le stock même sans connexion internet.
          </p>
          <button
            onClick={handleTrigger}
            className="w-full py-2 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installer l'App</span>
          </button>
        </div>
      )}

      {/* iOS Safari / Manual Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 border border-teal-500/30 flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Installation de Pharmacie Laafi Zanga
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ajoutez l'application sur votre écran d'accueil pour une expérience plein écran fluide et un fonctionnement autonome hors-ligne.
            </p>

            <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    {isIOS ? 'Ouvrez le menu Partager' : 'Menu du navigateur'}
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {isIOS ? (
                      <span className="inline-flex items-center gap-1">
                        Appuyez sur l'icône <Share2 className="w-3.5 h-3.5 inline text-teal-600" /> en bas de Safari.
                      </span>
                    ) : (
                      'Cliquez sur les 3 points ou l\'icône d\'installation dans la barre d\'adresse.'
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    Ajouter à l'écran d'accueil
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] inline-flex items-center gap-1">
                    Sélectionnez <PlusSquare className="w-3.5 h-3.5 inline text-teal-600" /> « Sur l'écran d'accueil » ou « Installer ».
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 block">
                    Confirmation & Lancement
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Validez : l'icône Pharmacie Laafi Zanga apparaît comme une véritable application native.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition shadow-sm"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
