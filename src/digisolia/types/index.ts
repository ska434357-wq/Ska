export type DigiSoliaAdminRole = 'super_admin' | 'app_admin' | 'support_agent' | 'stats_reader';

export type DigiSoliaProcessingStatus = 'en_attente' | 'en_cours' | 'resolu' | 'rejete';

export type DigiSoliaFeedbackCategory = 'avis' | 'suggestion' | 'bug' | 'reclamation';

export type DigiSoliaNotificationType = 'info' | 'alerte' | 'mise_a_jour' | 'maintenance';

export type DigiSoliaModuleKey =
  | 'welcome'
  | 'home'
  | 'notifications'
  | 'support'
  | 'feedback'
  | 'profile'
  | 'settings'
  | 'about'
  | 'admin';

export interface DigiSoliaAppFeature {
  title: string;
  description: string;
}

export interface DigiSoliaShortcut {
  id: string;
  label: string;
  description: string;
  target: string; // Host tab or DAF view
  type: 'host' | 'daf';
}

export interface DigiSoliaAppConfig {
  appId: string;
  appName: string;
  appShortName: string;
  appCategory: string;
  version: string;
  description: string;
  brand: {
    name: string;
    tagline: string;
    editor: string;
    country: string;
    city: string;
    logoUrl?: string; // Optional external/local image URL to replace provisional text logo
  };
  colors: {
    primary: string;
    secondary: string;
    white: string;
    background: string;
    lightGray: string;
  };
  contact: {
    whatsappRaw: string;
    whatsappDisplay: string;
    phoneRaw: string;
    phoneDisplay: string;
    email: string;
    website: string;
    address: string;
  };
  features: DigiSoliaAppFeature[];
  benefits: string[];
  hostShortcuts: DigiSoliaShortcut[];
  enabledModules: Record<DigiSoliaModuleKey, boolean>;
  capabilities: {
    supportsLocalBackup: boolean;
    supportsCloudSync: boolean;
    supportsOfflineQueue: boolean;
  };
  bootstrappedSuperAdminEmails: string[];
}

export interface DigiSoliaAppRecord {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  status: 'actif' | 'maintenance' | 'beta';
  usersCount: number;
  updatedAt: string;
}

export interface DigiSoliaUserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appId: string;
  role: 'user';
  status: 'actif' | 'suspendu';
  createdAt: string;
  lastLoginAt: string;
}

export interface DigiSoliaAdminRecord {
  uid: string;
  email: string;
  displayName: string;
  role: DigiSoliaAdminRole;
  assignedApps: string; // '*' or comma-separated appIds
  createdAt: string;
  createdBy?: string;
}

export interface DigiSoliaFeedbackItem {
  id: string;
  appId: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: DigiSoliaFeedbackCategory;
  rating?: number;
  message: string;
  status: DigiSoliaProcessingStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
  pendingOffline?: boolean;
}

export interface DigiSoliaSupportTicket {
  id: string;
  appId: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  priority: 'normale' | 'urgente';
  message: string;
  technicalInfo?: string;
  status: DigiSoliaProcessingStatus;
  response?: string;
  createdAt: string;
  updatedAt?: string;
  pendingOffline?: boolean;
}

export interface DigiSoliaNotificationItem {
  id: string;
  appId: string; // specific appId or 'all'
  title: string;
  message: string;
  type: DigiSoliaNotificationType;
  createdAt: string;
  createdBy: string;
}

export interface DigiSoliaAdminLogItem {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  target: string;
  createdAt: string;
}

export interface DigiSoliaPreferences {
  language: 'fr' | 'en';
  notificationsEnabled: boolean;
  includeTechDiagnostics: boolean;
}

export interface OfflineQueueItem {
  queueId: string;
  kind: 'feedback' | 'support' | 'profile';
  appId: string;
  payloadHash: string;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export interface RolePermissions {
  label: string;
  description: string;
  canViewOverview: boolean;
  canManageApps: boolean;
  canManageUsers: boolean;
  canRespondFeedback: boolean;
  canRespondSupport: boolean;
  canManageAdmins: boolean;
  canSendNotifications: boolean;
}

export const DIGISOLIA_ROLE_MATRIX: Record<DigiSoliaAdminRole, RolePermissions> = {
  super_admin: {
    label: 'Super administrateur',
    description: 'Contrôle total sur toutes les applications DigiSolia, les administrateurs et les règles.',
    canViewOverview: true,
    canManageApps: true,
    canManageUsers: true,
    canRespondFeedback: true,
    canRespondSupport: true,
    canManageAdmins: true,
    canSendNotifications: true
  },
  app_admin: {
    label: 'Administrateur d’application',
    description: 'Gestion opérationnelle des utilisateurs, notifications et retours sur les applications assignées.',
    canViewOverview: true,
    canManageApps: true,
    canManageUsers: true,
    canRespondFeedback: true,
    canRespondSupport: true,
    canManageAdmins: false,
    canSendNotifications: true
  },
  support_agent: {
    label: 'Agent de support',
    description: 'Traitement des demandes d’assistance, réclamations, bugs et avis clients.',
    canViewOverview: true,
    canManageApps: false,
    canManageUsers: false,
    canRespondFeedback: true,
    canRespondSupport: true,
    canManageAdmins: false,
    canSendNotifications: false
  },
  stats_reader: {
    label: 'Lecteur des statistiques',
    description: 'Consultation en lecture seule des indicateurs d’usage et de satisfaction.',
    canViewOverview: true,
    canManageApps: false,
    canManageUsers: false,
    canRespondFeedback: false,
    canRespondSupport: false,
    canManageAdmins: false,
    canSendNotifications: false
  }
};
