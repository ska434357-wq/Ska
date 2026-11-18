import { DigiSoliaAppConfig, DigiSoliaAppRecord } from '../types';

/**
 * CONFIGURATION CENTRALE DIGISOLIA APP FRAMEWORK (DAF)
 * -----------------------------------------------------------------------------
 * Modifiez ce fichier pour adapter le framework à n'importe quelle application
 * de l'écosystème DigiSolia (DigiSolia POS, DigiSolia Hôtel, Prof Planning, etc.)
 * sans modifier le code des modules communs.
 */
export const DIGISOLIA_ECOSYSTEM_APPS: DigiSoliaAppRecord[] = [
  {
    id: 'pharmacie-laafi-zanga',
    name: 'Pharmacie Laafi Zanga',
    description: 'Gestion d’inventaire pharmaceutique, mouvements de stock, scanner code-barres et bons de commande en FCFA.',
    version: '2.4.0',
    category: 'Santé & Officine',
    status: 'actif',
    usersCount: 14,
    updatedAt: '2026-11-18T00:00:00.000Z'
  },
  {
    id: 'digisolia-pos',
    name: 'DigiSolia POS',
    description: 'Solution complète de caisse enregistreuse, facturation, encaissement et gestion commerciale multi-boutiques.',
    version: '3.1.2',
    category: 'Commerce & Retail',
    status: 'actif',
    usersCount: 128,
    updatedAt: '2026-11-15T00:00:00.000Z'
  },
  {
    id: 'digisolia-hotel',
    name: 'DigiSolia Hôtel',
    description: 'Logiciel de gestion des hôtels, auberges, réservations de chambres, check-in/out et facturation séjours.',
    version: '2.0.5',
    category: 'Hôtellerie & Tourisme',
    status: 'actif',
    usersCount: 46,
    updatedAt: '2026-11-12T00:00:00.000Z'
  },
  {
    id: 'prof-planning',
    name: 'Prof Planning',
    description: 'Planification académique, emplois du temps enseignants et suivi des heures de cours.',
    version: '1.8.0',
    category: 'Éducation',
    status: 'beta',
    usersCount: 32,
    updatedAt: '2026-11-10T00:00:00.000Z'
  }
];

export const DIGISOLIA_DEFAULT_CONFIG: DigiSoliaAppConfig = {
  appId: 'pharmacie-laafi-zanga',
  appName: 'Pharmacie Laafi Zanga — Officine',
  appShortName: 'Laafi Zanga',
  appCategory: 'Santé & Gestion d’Officine',
  version: '2.4.0 · DAF v1.0',
  description:
    'Plateforme professionnelle de gestion d’inventaire pharmaceutique, de suivi des mouvements de stock, de réapprovisionnement fournisseurs et de pilotage financier propulsée par le socle DigiSolia App Framework.',
  brand: {
    name: 'DIGISOLIA',
    tagline: 'La technologie au service de vos activités.',
    editor: 'DigiSolia SARL',
    country: 'Burkina Faso',
    city: 'Ouagadougou',
    logoUrl: undefined
  },
  colors: {
    primary: '#163B65',
    secondary: '#2783C7',
    white: '#FFFFFF',
    background: '#F4F7FB',
    lightGray: '#E1E7EF'
  },
  contact: {
    whatsappRaw: '22676127800',
    whatsappDisplay: '00226761278',
    phoneRaw: '+226704783222',
    phoneDisplay: '0026704783222',
    email: 'support@digisolia.bf',
    website: 'https://digisolia.bf',
    address: 'Ouagadougou, Burkina Faso'
  },
  features: [
    {
      title: 'Pilotage & Valorisation FCFA',
      description: 'Suivi en temps réel de la valeur financière du stock, des ruptures et des péremptions sous 90 jours.'
    },
    {
      title: 'Inventaire Express & Scanner',
      description: 'Comptage rapide au clavier, par douchette USB/Bluetooth ou via caméra mobile avec Procès-Verbal officiel.'
    },
    {
      title: 'Commandes & Réapprovisionnement',
      description: 'Génération automatique des bons fournisseurs (CAMEG, Sanofi, Denk Pharma) et réception en 1 clic.'
    },
    {
      title: 'Continuité Hors Connexion & Cloud',
      description: 'Travail garanti sans coupure grâce au cache local, à la file d’attente de synchronisation et à Firebase.'
    }
  ],
  benefits: [
    'Réduction drastique des ruptures de médicaments essentiels et des pertes par péremption.',
    'Support technique direct DigiSolia intégré (WhatsApp, téléphone, tickets d’assistance).',
    'Sauvegardes sécurisées et synchronisation multi-appareils compatible ordinateurs, tablettes et Android.',
    'Architecture unifiée prête pour l’écosystème DigiSolia POS, DigiSolia Hôtel et vos futurs outils.'
  ],
  hostShortcuts: [
    {
      id: 'shortcut-dashboard',
      label: 'Tableau de bord métier',
      description: 'Indicateurs de stock, ruptures et répartition financière FCFA',
      target: 'dashboard',
      type: 'host'
    },
    {
      id: 'shortcut-products',
      label: 'Catalogue des comprimés',
      description: 'Rechercher, filtrer et mettre à jour les fiches produits',
      target: 'products',
      type: 'host'
    },
    {
      id: 'shortcut-inventory',
      label: 'Inventaire & Scanner',
      description: 'Lancer un comptage de rayon ou générer un PV officiel',
      target: 'inventory',
      type: 'host'
    },
    {
      id: 'shortcut-orders',
      label: 'Commandes fournisseurs',
      description: 'Préparer ou réceptionner vos bons d’approvisionnement',
      target: 'orders',
      type: 'host'
    }
  ],
  enabledModules: {
    welcome: true,
    home: true,
    notifications: true,
    support: true,
    feedback: true,
    profile: true,
    settings: true,
    about: true,
    admin: true
  },
  capabilities: {
    supportsLocalBackup: true,
    supportsCloudSync: true,
    supportsOfflineQueue: true
  },
  bootstrappedSuperAdminEmails: ['ska434357@gmail.com']
};
