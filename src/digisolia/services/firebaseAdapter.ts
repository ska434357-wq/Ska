/**
 * Adaptateur Firebase pour DigiSolia App Framework.
 * Réutilise STRICTEMENT l'instance Firebase déjà initialisée par l'application hôte
 * afin d'éviter tout doublon de connexion ou conflit de configuration.
 */
import {
  app,
  db,
  auth,
  googleProvider,
  handleFirestoreError,
  OperationType,
  loginWithGoogle,
  logoutUser
} from '../../firebase';

export {
  app as dafFirebaseApp,
  db as dafDb,
  auth as dafAuth,
  googleProvider as dafGoogleProvider,
  handleFirestoreError as dafHandleFirestoreError,
  OperationType as DafOperationType,
  loginWithGoogle as dafLoginWithGoogle,
  logoutUser as dafLogoutUser
};
