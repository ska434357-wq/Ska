# Guide d’Intégration — DIGISOLIA APP FRAMEWORK (DAF)

Ce guide explique comment intégrer le socle **DIGISOLIA APP FRAMEWORK (DAF)** dans une nouvelle application ou une application React/Firebase existante (**DigiSolia POS**, **DigiSolia Hôtel**, **Prof Planning**, etc.) **sans casser les fonctionnalités métier, ni les données locales, ni la configuration Firebase existante**.

---

## 1. Architecture modulaire du framework

```text
src/
└── digisolia/
    ├── config/
    │   └── digisolia.config.ts       # Configuration centrale (App ID, couleurs, contacts, raccourcis)
    ├── types/
    │   └── index.ts                  # Types TypeScript & matrice RBAC
    ├── services/
    │   ├── firebaseAdapter.ts        # Réutilise l'instance Firebase de l'app hôte (aucun doublon)
    │   ├── offlineQueueService.ts    # File d'attente locale + anti-spam + anti-doublon
    │   └── digisoliaService.ts       # API Firestore (/apps, /users, /feedback, /support, /notifications, /administrators)
    ├── hooks/
    │   └── useDigiSolia.tsx          # DigiSoliaProvider & hook useDigiSolia()
    ├── components/
    │   ├── DigiSoliaLogo.tsx         # Logo textuel/SVG provisoire remplaçable via logoUrl
    │   ├── SyncStatusBadge.tsx       # Indicateur connecté / hors ligne / en attente
    │   ├── StarRating.tsx            # Notation 1 à 5 étoiles
    │   └── StatusReadout.tsx         # Lecture des statuts de traitement
    ├── features/
    │   ├── WelcomePage.tsx           # Module A : Page de présentation (1re visite + menu)
    │   ├── FrameworkHome.tsx         # Module B : Tableau de bord DAF (complète l'app hôte)
    │   ├── NotificationsModule.tsx   # Centre de notifications
    │   ├── SupportCenter.tsx         # Module C : WhatsApp, tél, e-mail, tickets, guide, FAQ
    │   ├── FeedbackModule.tsx        # Module D : Avis 1–5 étoiles, suggestions, bugs, réclamations
    │   ├── UserProfileModule.tsx     # Module E : Profil & session
    │   ├── SettingsModule.tsx        # Module F : Préférences, thème clair/sombre, sauvegardes
    │   └── AboutModule.tsx           # Module G : Présentation, mission, vision, CGU, confidentialité
    ├── admin/
    │   └── DigiSoliaAdmin.tsx        # Panneau centralisé multi-produits DIGISOLIA ADMIN
    └── docs/
        └── INTEGRATION_GUIDE.md
```

---

## 2. Procédure d’intégration dans une application existante

### Étape 1 — Copier le dossier `src/digisolia/`
Copiez `src/digisolia/` dans votre projet React cible. Aucun autre fichier existant ne doit être supprimé.

### Étape 2 — Connecter `firebaseAdapter.ts` à votre Firebase existant
Dans `src/digisolia/services/firebaseAdapter.ts`, pointez simplement vers les exports existants (`app`, `db`, `auth`, `googleProvider`) de votre application hôte. **Ne créez jamais un second `initializeApp()`**.

### Étape 3 — Configurer le produit dans `digisolia.config.ts`
Exemple pour **DigiSolia POS** ou **DigiSolia Hôtel** :

```ts
export const DIGISOLIA_POS_CONFIG: DigiSoliaAppConfig = {
  ...DIGISOLIA_DEFAULT_CONFIG,
  appId: 'digisolia-pos',
  appName: 'DigiSolia POS — Caisse & Gestion Commerciale',
  appShortName: 'DigiSolia POS',
  version: '3.1.2 · DAF v1.0',
  hostShortcuts: [
    { id: 'caisse', label: 'Ouvrir la caisse', description: 'Ventes & tickets', target: 'pos', type: 'host' },
    { id: 'stock', label: 'Stock boutique', description: 'Articles & inventaire', target: 'stock', type: 'host' }
  ]
};
```

### Étape 4 — Envelopper l’application avec `DigiSoliaProvider`
```tsx
<DigiSoliaProvider config={DIGISOLIA_POS_CONFIG}>
  <AppContent />
</DigiSoliaProvider>
```

### Étape 5 — Ajouter la section « Écosystème DigiSolia » dans la navigation
Conservez intactes toutes vos routes/onglets métier et ajoutez simplement le lien vers `FrameworkHome`, `NotificationsModule`, `SupportCenter`, `FeedbackModule`, `UserProfileModule`, `SettingsModule`, `AboutModule` et `DigiSoliaAdmin` (visible pour les administrateurs).

---

## 3. Sécurité Firestore & Cloisonnement Multi-Applications

- Chaque produit utilise un `appId` unique (`pharmacie-laafi-zanga`, `digisolia-pos`, `digisolia-hotel`, `prof-planning`).
- Les retours utilisateurs et tickets de support sont stockés dans les sous-collections dédiées `apps/{appId}/feedback` et `apps/{appId}/support`.
- Les règles `firestore.rules` interdisent aux utilisateurs standards de modifier le `status` de traitement ou de créer/modifier `/administrators` ou `/notifications`.
- Toutes les opérations administratives sensibles sont vérifiées côté Firebase via la collection `/administrators/{uid}` et consignées dans `/admin_logs`.

---

## 4. Fonctionnement hors connexion

- Les formulaires d’avis et de support s’appuient sur `offlineQueueService.ts` (`localStorage`) sans jamais toucher ni écraser les clés `localStorage`/`IndexedDB` de l’application hôte.
- Une déduplication par empreinte (`payloadHash`) et une limitation anti-spam (45 secondes entre soumissions identiques/successives) protègent le backend.
- Dès le retour d’Internet et d’une session authentifiée, `flushOfflineQueue()` synchronise automatiquement la file d’attente.
