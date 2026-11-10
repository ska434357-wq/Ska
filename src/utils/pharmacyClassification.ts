export interface CategoryMeta {
  id: string;
  name: string;
  color: string;
  darkColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export interface SupplierMeta {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const PHARMACY_CATEGORIES: CategoryMeta[] = [
  {
    id: 'anti_infectieux',
    name: 'Antibiotiques & Anti-infectieux',
    color: '#0d9488', // Teal
    darkColor: '#14b8a6',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
    badgeText: 'text-teal-700 dark:text-teal-300',
    description: 'Comprimés antibactériens, antiparasitaires et antifongiques'
  },
  {
    id: 'antalgiques',
    name: 'Antalgiques & Anti-inflammatoires',
    color: '#3b82f6', // Blue
    darkColor: '#60a5fa',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    description: 'Paracétamol, AINS, antalgiques centraux et périphériques'
  },
  {
    id: 'antipaludiques',
    name: 'Antipaludiques (CTA / Quinine)',
    color: '#f59e0b', // Amber
    darkColor: '#fbbf24',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    description: 'Combinaisons thérapeutiques à base d’artémisinine et dérivés'
  },
  {
    id: 'gastro',
    name: 'Gastro-entérologie',
    color: '#10b981', // Emerald
    darkColor: '#34d399',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    description: 'IPP, antispasmodiques, antiacides et régulateurs du transit'
  },
  {
    id: 'cardio_metabolisme',
    name: 'Cardiologie & Métabolisme',
    color: '#8b5cf6', // Purple
    darkColor: '#a78bfa',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    description: 'Antihypertenseurs, antidiabétiques oraux et diurétiques'
  },
  {
    id: 'vitamines_mineraux',
    name: 'Vitamines & Minéraux',
    color: '#ec4899', // Pink
    darkColor: '#f472b6',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/60',
    badgeText: 'text-pink-700 dark:text-pink-300',
    description: 'Complexes multivitaminés, fer, acide folique et oligo-éléments'
  },
  {
    id: 'systeme_nerveux',
    name: 'Système Nerveux & Psychotropes',
    color: '#6366f1', // Indigo
    darkColor: '#818cf8',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    description: 'Anxiolytiques, antiépileptiques et sédatifs comprimés'
  },
  {
    id: 'autres_comprimes',
    name: 'Autres Spécialités Comprimés',
    color: '#64748b', // Slate
    darkColor: '#94a3b8',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    description: 'Formes orales sèches diverses et galéniques spécifiques'
  }
];

export const PHARMACY_SUPPLIERS: SupplierMeta[] = [
  {
    id: 'cameg',
    name: 'Centrale d’Achat CAMEG',
    color: '#0f766e', // Teal dark
    badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
    badgeText: 'text-teal-800 dark:text-teal-200',
    description: 'Approvisionnement générique national prioritaire'
  },
  {
    id: 'sanofi',
    name: 'Laboratoires Sanofi',
    color: '#2563eb', // Royal Blue
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-200',
    description: 'Spécialités de référence princeps et OTC'
  },
  {
    id: 'denk_pharma',
    name: 'Denk Pharma (Allemagne)',
    color: '#d97706', // Amber dark
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-200',
    description: 'Génériques certifiés normes européennes'
  },
  {
    id: 'cipla_generics',
    name: 'Cipla / Laboratoires Génériques',
    color: '#7c3aed', // Violet
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-200',
    description: 'Spécialités essentielles et infectiologie'
  },
  {
    id: 'shalina_medis',
    name: 'Laboratoires Shalina / Medis',
    color: '#db2777', // Fuchsia
    badgeBg: 'bg-pink-50 dark:bg-pink-950/60',
    badgeText: 'text-pink-800 dark:text-pink-200',
    description: 'Formes orales comprimés et gammes OTC'
  },
  {
    id: 'ubipharm',
    name: 'Grossiste Répartiteur UBIPHARM',
    color: '#475569', // Slate
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    description: 'Distribution pharmaceutique locale'
  }
];

/**
 * Automatically classifies a pharmaceutical tablet into its therapeutic class
 * based on its clinical designation/molecule.
 */
export function getProductCategory(designation: string, explicitCategory?: string): string {
  if (explicitCategory && explicitCategory.trim()) {
    return explicitCategory;
  }

  const d = designation.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Anti-infectieux & Antibiotiques
  if (
    d.includes('amox') ||
    d.includes('ampicil') ||
    d.includes('cipro') ||
    d.includes('azithr') ||
    d.includes('cotrim') ||
    d.includes('doxy') ||
    d.includes('erythr') ||
    d.includes('cefix') ||
    d.includes('metronid') ||
    d.includes('bactrim') ||
    d.includes('cloxacilline') ||
    d.includes('peni') ||
    d.includes('tetra') ||
    d.includes('augmentin') ||
    d.includes('clarithro') ||
    d.includes('levoflox') ||
    d.includes('norflox') ||
    d.includes('abz') ||
    d.includes('albendazole') ||
    d.includes('mebendazole') ||
    d.includes('fluconazole') ||
    d.includes('ketoconazole') ||
    d.includes('tinidazole') ||
    d.includes('secnidazole')
  ) {
    return 'Antibiotiques & Anti-infectieux';
  }

  // 2. Antalgiques & Anti-inflammatoires
  if (
    d.includes('para') ||
    d.includes('doli') ||
    d.includes('efferal') ||
    d.includes('ibu') ||
    d.includes('diclo') ||
    d.includes('aspi') ||
    d.includes('trama') ||
    d.includes('indo') ||
    d.includes('keto') ||
    d.includes('melo') ||
    d.includes('pirox') ||
    d.includes('celecox') ||
    d.includes('aceland') ||
    d.includes('panadol') ||
    d.includes('algil') ||
    d.includes('antadys') ||
    d.includes('voltar') ||
    d.includes('apranax') ||
    d.includes('predni')
  ) {
    return 'Antalgiques & Anti-inflammatoires';
  }

  // 3. Antipaludiques
  if (
    d.includes('arte') ||
    d.includes('lume') ||
    d.includes('coart') ||
    d.includes('quini') ||
    d.includes('chloro') ||
    d.includes('malox') ||
    d.includes('fansidar') ||
    d.includes('palud') ||
    d.includes('duocotecxin') ||
    d.includes('arinate') ||
    d.includes('palufen') ||
    d.includes('as-aq')
  ) {
    return 'Antipaludiques (CTA / Quinine)';
  }

  // 4. Gastro-entérologie
  if (
    d.includes('omep') ||
    d.includes('cimet') ||
    d.includes('rani') ||
    d.includes('metoclo') ||
    d.includes('lopera') ||
    d.includes('spasf') ||
    d.includes('antiacid') ||
    d.includes('domperi') ||
    d.includes('charbon') ||
    d.includes('gaviscon') ||
    d.includes('pantoprazole') ||
    d.includes('esomeprazole') ||
    d.includes('smecta') ||
    d.includes('maalox') ||
    d.includes('bisacodyl') ||
    d.includes('dulcolax')
  ) {
    return 'Gastro-entérologie';
  }

  // 5. Cardiologie & Métabolisme
  if (
    d.includes('amlo') ||
    d.includes('capto') ||
    d.includes('enala') ||
    d.includes('atelo') ||
    d.includes('metfor') ||
    d.includes('gliben') ||
    d.includes('furo') ||
    d.includes('hydrochlor') ||
    d.includes('losar') ||
    d.includes('nifedi') ||
    d.includes('lisino') ||
    d.includes('atenolol') ||
    d.includes('indapamide') ||
    d.includes('gliclazide') ||
    d.includes('glimepiride') ||
    d.includes('aldactone') ||
    d.includes('bisoprolol')
  ) {
    return 'Cardiologie & Métabolisme';
  }

  // 6. Vitamines & Minéraux
  if (
    d.includes('vitam') ||
    d.includes('fer') ||
    d.includes('folic') ||
    d.includes('calcium') ||
    d.includes('zinc') ||
    d.includes('magnes') ||
    d.includes('b-comp') ||
    d.includes('ascorb') ||
    d.includes('multivit') ||
    d.includes('tot-hema') ||
    d.includes('nutri') ||
    d.includes('calcichew')
  ) {
    return 'Vitamines & Minéraux';
  }

  // 7. Système Nerveux & Psychotropes
  if (
    d.includes('diaze') ||
    d.includes('clona') ||
    d.includes('halop') ||
    d.includes('chlorpro') ||
    d.includes('amitrip') ||
    d.includes('carba') ||
    d.includes('pheno') ||
    d.includes('sedatif') ||
    d.includes('temesta') ||
    d.includes('lexomil') ||
    d.includes('valium')
  ) {
    return 'Système Nerveux & Psychotropes';
  }

  return 'Autres Spécialités Comprimés';
}

/**
 * Automatically attributes a certified pharmaceutical supplier or purchasing central
 * to ensure consistent supplier distribution metrics.
 */
export function getProductSupplier(designation: string, explicitSupplier?: string, id?: number): string {
  if (explicitSupplier && explicitSupplier.trim()) {
    return explicitSupplier;
  }

  const d = designation.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (d.includes('doli') || d.includes('efferal') || d.includes('sanofi') || d.includes('flagyl') || d.includes('plavix') || d.includes('aspro')) {
    return 'Laboratoires Sanofi';
  }

  if (d.includes('denk') || d.includes('omeprazol') || d.includes('metformin') || d.includes('amlodipin') || d.includes('ibuprofen denk')) {
    return 'Denk Pharma (Allemagne)';
  }

  if (d.includes('cipro') || d.includes('cipla') || d.includes('azithromycin') || d.includes('cefixime') || d.includes('metronidazole')) {
    return 'Cipla / Laboratoires Génériques';
  }

  if (d.includes('vitam') || d.includes('shalina') || d.includes('medis') || d.includes('polygel') || d.includes('shalgyl')) {
    return 'Laboratoires Shalina / Medis';
  }

  // Distribute based on item ID hash to create an authentic multi-supplier distribution
  const numId = id || designation.length;
  const mod = numId % 5;
  if (mod === 0 || mod === 1) return 'Centrale d’Achat CAMEG';
  if (mod === 2) return 'Grossiste Répartiteur UBIPHARM';
  if (mod === 3) return 'Denk Pharma (Allemagne)';
  return 'Cipla / Laboratoires Génériques';
}
