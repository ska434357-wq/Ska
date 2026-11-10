import React, { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { Cloud, CloudOff, LogIn, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { auth, loginWithGoogle, logoutUser } from '../firebase';
import { syncInitialDataToFirestore } from '../services/firebaseSync';
import { Product, StockMovement } from '../data/initialProducts';

interface FirebaseAuthButtonProps {
  products: Product[];
  movements: StockMovement[];
  onShowToast: (title: string, desc: string, type: 'success' | 'error' | 'info') => void;
}

export const FirebaseAuthButton: React.FC<FirebaseAuthButtonProps> = ({
  products,
  movements,
  onShowToast
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      setShowAuthModal(false);
      onShowToast('Connecté', 'Authentification Google réussie sur Firebase Cloud.', 'success');
      // Automatically seed Firestore if this is a newly provisioned database
      syncInitialDataToFirestore(products, movements).catch(err => {
        console.warn('Sync post-login check:', err);
      });
    } catch (err) {
      console.error(err);
      onShowToast('Échec de connexion', 'Vérifiez la configuration ou réessayez.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowAuthModal(false);
      onShowToast('Déconnecté', 'Session cloud fermée.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSync = async () => {
    if (!auth.currentUser) {
      onShowToast('Connexion requise', 'Veuillez vous connecter avec Google avant de synchroniser.', 'info');
      return;
    }
    setIsSyncing(true);
    try {
      const initialized = await syncInitialDataToFirestore(products, movements);
      if (initialized) {
        onShowToast('Synchronisation réussie', 'La base des 302 comprimés est synchronisée sur Firestore.', 'success');
      } else {
        onShowToast('Base à jour', 'La base Cloud est déjà synchronisée.', 'info');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Erreur Cloud', 'Impossible de synchroniser avec Firestore.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowAuthModal(true)}
        className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
          currentUser
            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500/40 text-teal-800 dark:text-teal-200'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
        title={currentUser ? `Connecté : ${currentUser.email}` : 'Connexion Cloud Firebase'}
      >
        {currentUser ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Cloud className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline max-w-[120px] truncate">
              {currentUser.displayName || currentUser.email?.split('@')[0]}
            </span>
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Cloud Firestore</span>
          </>
        )}
      </button>

      {/* Auth & Sync Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Firebase Cloud Firestore
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Persistance temps réel multi-appareils
                </p>
              </div>
            </div>

            {currentUser ? (
              <div className="space-y-4">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-500/20 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-teal-900 dark:text-teal-200">Session active</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium truncate">
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] text-teal-700 dark:text-teal-400 mt-1">
                    ID: {currentUser.uid.substring(0, 12)}...
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser le stock avec le Cloud'}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 dark:text-slate-400 font-bold text-xs transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connectez-vous avec votre compte pour synchroniser en temps réel la base des comprimés, les inventaires physiques et l'historique des mouvements.
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleLogin}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition flex items-center justify-center gap-2 shadow"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Connexion avec Google</span>
                  </button>

                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Forcer la synchronisation initiale</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
