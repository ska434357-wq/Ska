import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Pill,
  ArrowLeftRight,
  ClipboardCheck,
  Database,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Copy,
  RotateCcw,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Info,
  X,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_MOVEMENTS, Product, StockMovement } from './data/initialProducts';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { testConnection } from './firebase';
import {
  syncInitialDataToFirestore,
  subscribeToFirestoreProducts,
  subscribeToFirestoreMovements,
  saveProductToFirestore,
  deleteProductFromFirestore,
  recordMovementInFirestore,
  applyPhysicalInventoryInFirestore
} from './services/firebaseSync';
import { FirebaseAuthButton } from './components/FirebaseAuthButton';
import { StockValueDonutChart } from './components/StockValueDonutChart';
import {
  getProductCategory,
  getProductSupplier,
  PHARMACY_CATEGORIES,
  PHARMACY_SUPPLIERS
} from './utils/pharmacyClassification';
import { PurchaseOrder } from './types/order';
import {
  loadOrdersFromLocalStorage,
  saveOrdersToLocalStorage,
  subscribeToFirestoreOrders,
  saveOrderToFirestore,
  deleteOrderFromFirestore,
  receiveOrderInFirestore
} from './services/orderSync';
import { OrdersManager } from './components/OrdersManager';
import { QuickInventoryScanner } from './components/QuickInventoryScanner';
import { OfficialInventoryReportModal } from './components/OfficialInventoryReportModal';

type TabType = 'dashboard' | 'products' | 'movements' | 'inventory' | 'orders' | 'backup';
type ProductFilterType = 'all' | 'in_stock' | 'low' | 'rupture' | 'expiring';
type MovementFilterType = 'all' | 'entree' | 'sortie' | 'ajustement';
type InventoryFilterType = 'all' | 'changed' | 'uncounted';

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const STORAGE_KEY_PRODUCTS = 'laafi_zanga_products_react_v1';
const STORAGE_KEY_MOVEMENTS = 'laafi_zanga_movements_react_v1';
const STORAGE_KEY_THEME = 'laafi_zanga_theme_react_v1';

export default function App() {
  // Main Data States with localStorage & safe memory fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('localStorage non disponible', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('localStorage non disponible', e);
    }
    return INITIAL_MOVEMENTS;
  });

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved) return saved === 'dark';
    } catch (e) {}
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Products Tab State
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState<ProductFilterType>('all');
  const [sortColumn, setSortColumn] = useState<keyof Product | 'valeurStock'>('no');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Delete Confirm Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Movement Form State with Autocomplete
  const [mvtType, setMvtType] = useState<'entree' | 'sortie'>('entree');
  const [mvtProductId, setMvtProductId] = useState<number | ''>('');
  const [mvtSearchQuery, setMvtSearchQuery] = useState<string>('');
  const [isMvtDropdownOpen, setIsMvtDropdownOpen] = useState<boolean>(false);
  const [mvtQuantity, setMvtQuantity] = useState<string>('');
  const [mvtNote, setMvtNote] = useState<string>('');
  const [movementFilter, setMovementFilter] = useState<MovementFilterType>('all');
  const mvtSearchRef = useRef<HTMLDivElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  // Physical Inventory State: Map of productId -> counted number
  const [physicalCounts, setPhysicalCounts] = useState<Record<number, number>>({});
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilterType>('all');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [isInventoryConfirmModalOpen, setIsInventoryConfirmModalOpen] = useState(false);
  const [isOfficialPVModalOpen, setIsOfficialPVModalOpen] = useState(false);

  // Orders State (Commandes Fournisseurs)
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => loadOrdersFromLocalStorage());

  // Factory Reset Modal State
  const [isResetFactoryModalOpen, setIsResetFactoryModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Backup & Excel text areas
  const [jsonRestoreInput, setJsonRestoreInput] = useState('');
  const [excelPreview, setExcelPreview] = useState('');

  // Clock
  const [currentClock, setCurrentClock] = useState('');

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Erreur écriture products localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.warn('Erreur écriture movements localStorage', e);
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
    } catch (e) {}
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentClock(
        new Intl.DateTimeFormat('fr-FR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close predictive search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mvtSearchRef.current && !mvtSearchRef.current.contains(event.target as Node)) {
        setIsMvtDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Firebase Firestore initial connection & real-time sync
  useEffect(() => {
    testConnection();

    // Live subscription to Firestore products
    const unsubProducts = subscribeToFirestoreProducts(cloudProducts => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
      }
    });

    // Live subscription to Firestore stock movements
    const unsubMovements = subscribeToFirestoreMovements(cloudMovements => {
      if (cloudMovements && cloudMovements.length > 0) {
        setMovements(cloudMovements);
      }
    });

    // Live subscription to Firestore purchase orders
    const unsubOrders = subscribeToFirestoreOrders(cloudOrders => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
    });

    return () => {
      unsubProducts();
      unsubMovements();
      unsubOrders();
    };
  }, []);

  // Save orders to localStorage on changes
  useEffect(() => {
    saveOrdersToLocalStorage(orders);
  }, [orders]);

  // Order Handlers
  const handleSaveOrder = (order: PurchaseOrder) => {
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === order.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = order;
        return next;
      }
      return [order, ...prev];
    });
    saveOrderToFirestore(order).catch(e => console.warn('Erreur Firestore sauvegarde commande:', e));
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    deleteOrderFromFirestore(orderId).catch(e => console.warn('Erreur Firestore suppression commande:', e));
  };

  const handleReceiveOrder = async (order: PurchaseOrder) => {
    const prodMap = new Map(products.map(p => [p.id, p]));
    const { updatedProducts, newMovements } = await receiveOrderInFirestore(order, prodMap);

    // Update local products state
    setProducts(prev => {
      const updatedMap = new Map(updatedProducts.map(p => [p.id, p]));
      return prev.map(p => updatedMap.get(p.id) || p);
    });

    // Update local movements
    setMovements(prev => [...newMovements, ...prev]);

    // Update order status in local state
    setOrders(prev =>
      prev.map(o =>
        o.id === order.id ? { ...o, status: 'receptionnee', receivedAt: new Date().toISOString() } : o
      )
    );

    showToast(
      'Commande Réceptionnée en Stock !',
      `Les ${order.items.length} références du bon ${order.orderNumber} ont été créditées en stock.`,
      'success'
    );
  };

  // Toast dispatch
  const showToast = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Formatters
  const formatMoney = (amount: number | null | undefined): string => {
    if (amount == null || isNaN(amount)) return '0 FCFA';
    return (
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }).format(amount) + ' FCFA'
    );
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num == null || isNaN(num)) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Expiration calculation (< 90 days)
  const getExpiryStatus = (dateStr: string | null | undefined) => {
    if (!dateStr) return { status: 'none', days: null, label: 'Non renseignée' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { status: 'none', days: null, label: 'Invalide' };
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', days: diffDays, label: `Périmé (${Math.abs(diffDays)}j)` };
    } else if (diffDays <= 90) {
      return { status: 'near', days: diffDays, label: `${diffDays} jours restants` };
    }
    return { status: 'ok', days: diffDays, label: `${diffDays} jours` };
  };

  // Dashboard Aggregates
  const dashboardStats = useMemo(() => {
    let totalValue = 0;
    let totalUnits = 0;
    let ruptures = 0;
    let lowStock = 0;
    let expiringSoon = 0;
    let normalStock = 0;

    products.forEach(p => {
      const val = (p.quantite || 0) * (p.prixCession || 0);
      totalValue += val;
      totalUnits += p.quantite || 0;

      if (p.quantite === 0) {
        ruptures++;
      } else if (p.quantite <= (p.seuilAlerte || 10)) {
        lowStock++;
      } else {
        normalStock++;
      }

      const exp = getExpiryStatus(p.datePeremption);
      if (exp.status === 'near' || exp.status === 'expired') {
        expiringSoon++;
      }
    });

    const totalCount = products.length;
    const normalPct = totalCount ? (normalStock / totalCount) * 100 : 0;
    const lowPct = totalCount ? (lowStock / totalCount) * 100 : 0;
    const rupturePct = totalCount ? (ruptures / totalCount) * 100 : 0;

    // Top 5 most valued products
    const topValued = [...products]
      .map(p => ({
        ...p,
        valeur: (p.quantite || 0) * (p.prixCession || 0)
      }))
      .sort((a, b) => b.valeur - a.valeur)
      .slice(0, 5);

    // Reorder list: items with stock <= alert threshold, prioritized
    const reorderList = products
      .filter(p => p.quantite <= (p.seuilAlerte || 10))
      .sort((a, b) => a.quantite - b.quantite)
      .slice(0, 6);

    return {
      totalValue,
      totalUnits,
      totalCount,
      ruptures,
      lowStock,
      expiringSoon,
      normalStock,
      normalPct,
      lowPct,
      rupturePct,
      topValued,
      reorderList
    };
  }, [products]);

  // Filtered & Sorted Products for Products Tab
  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return products.filter(p => {
      if (q) {
        const matchNo = String(p.no).includes(q);
        const matchName = (p.designation || '').toLowerCase().includes(q);
        const matchCat = getProductCategory(p.designation, p.categorie).toLowerCase().includes(q);
        const matchSupplier = getProductSupplier(p.designation, p.fournisseur, p.id).toLowerCase().includes(q);
        if (!matchNo && !matchName && !matchCat && !matchSupplier) return false;
      }

      if (productFilter === 'in_stock') {
        return p.quantite > (p.seuilAlerte || 10);
      } else if (productFilter === 'low') {
        return p.quantite > 0 && p.quantite <= (p.seuilAlerte || 10);
      } else if (productFilter === 'rupture') {
        return p.quantite === 0;
      } else if (productFilter === 'expiring') {
        const exp = getExpiryStatus(p.datePeremption);
        return exp.status === 'near' || exp.status === 'expired';
      }
      return true;
    });
  }, [products, productSearch, productFilter]);

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];
    items.sort((a, b) => {
      let valA: any = a[sortColumn as keyof Product];
      let valB: any = b[sortColumn as keyof Product];

      if (sortColumn === 'valeurStock') {
        valA = (a.quantite || 0) * (a.prixCession || 0);
        valB = (b.quantite || 0) * (b.prixCession || 0);
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return items;
  }, [filteredProducts, sortColumn, sortAsc]);

  // Paginated Products (50 per page)
  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedProducts.slice(start, start + PAGE_SIZE);
  }, [sortedProducts, currentPage]);

  const handleSort = (col: keyof Product | 'valeurStock') => {
    if (sortColumn === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(col);
      setSortAsc(true);
    }
  };

  // Movement Form Logic & Strict Rule Validation
  const selectedMovementProduct = useMemo(() => {
    if (mvtProductId === '') return null;
    return products.find(p => p.id === Number(mvtProductId)) || null;
  }, [products, mvtProductId]);

  // Autocomplete Predictive Search Filtering
  const filteredMvtProducts = useMemo(() => {
    const rawQuery = mvtSearchQuery.trim().toLowerCase();
    if (!rawQuery) {
      // Default: top 40 products sorted by designation
      return [...products].sort((a, b) => a.designation.localeCompare(b.designation)).slice(0, 40);
    }
    const cleanNumQuery = rawQuery.replace(/^#/, '').trim();
    return products
      .filter(p => {
        const matchesNo = cleanNumQuery !== '' && p.no.toString().includes(cleanNumQuery);
        const matchesName = p.designation.toLowerCase().includes(rawQuery);
        return matchesNo || matchesName;
      })
      .sort((a, b) => {
        // Prioritize exact number match, then starting with query
        const aNo = a.no.toString();
        const bNo = b.no.toString();
        if (cleanNumQuery && aNo === cleanNumQuery) return -1;
        if (cleanNumQuery && bNo === cleanNumQuery) return 1;
        const aStarts = a.designation.toLowerCase().startsWith(rawQuery);
        const bStarts = b.designation.toLowerCase().startsWith(rawQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.designation.localeCompare(b.designation);
      })
      .slice(0, 35);
  }, [products, mvtSearchQuery]);

  const handleSelectMovementProduct = (product: Product) => {
    setMvtProductId(product.id);
    setMvtSearchQuery(`#${product.no} ${product.designation}`);
    setIsMvtDropdownOpen(false);
    setTimeout(() => {
      qtyInputRef.current?.focus();
    }, 60);
  };

  const handleClearMovementProduct = () => {
    setMvtProductId('');
    setMvtSearchQuery('');
    setIsMvtDropdownOpen(true);
  };

  const parsedMvtQty = parseInt(mvtQuantity, 10) || 0;
  const isSortieExceeding =
    mvtType === 'sortie' && selectedMovementProduct != null && parsedMvtQty > selectedMovementProduct.quantite;

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovementProduct) {
      showToast('Erreur', 'Veuillez sélectionner un produit comprimé.', 'error');
      return;
    }

    if (parsedMvtQty <= 0) {
      showToast('Erreur', 'La quantité doit être un nombre entier positif supérieur à zéro.', 'error');
      return;
    }

    // STRICT BUSINESS RULE: Interdire une sortie supérieure au stock !
    if (mvtType === 'sortie' && parsedMvtQty > selectedMovementProduct.quantite) {
      showToast(
        'Action interdite',
        `Stock insuffisant : vous tentez de sortir ${parsedMvtQty} unités alors que le stock disponible est de ${selectedMovementProduct.quantite} unités.`,
        'error'
      );
      return;
    }

    const newStock =
      mvtType === 'entree'
        ? selectedMovementProduct.quantite + parsedMvtQty
        : selectedMovementProduct.quantite - parsedMvtQty;

    // Update Product Stock
    setProducts(prev =>
      prev.map(p => (p.id === selectedMovementProduct.id ? { ...p, quantite: newStock } : p))
    );

    // Record movement
    const newMovement: StockMovement = {
      id: 'mvt-' + Date.now(),
      date: new Date().toISOString(),
      type: mvtType,
      productId: selectedMovementProduct.id,
      productName: selectedMovementProduct.designation,
      quantite: mvtType === 'entree' ? parsedMvtQty : -parsedMvtQty,
      stockApres: newStock,
      note: mvtNote.trim() || (mvtType === 'entree' ? 'Entrée de stock' : 'Sortie de stock')
    };

    setMovements(prev => [newMovement, ...prev]);

    // Persist to Firebase Firestore
    recordMovementInFirestore(newMovement, newStock).catch(err => {
      console.warn('Erreur synchronisation Firestore mouvement:', err);
    });

    showToast(
      'Mouvement enregistré',
      `${mvtType === 'entree' ? 'Entrée de +' : 'Sortie de -'}${parsedMvtQty} u. sur ${selectedMovementProduct.designation}`,
      'success'
    );

    // Reset fields
    setMvtQuantity('');
    setMvtNote('');
  };

  // Quick stock entry jump from Dashboard or Product list
  const quickStockEntry = (productId: number) => {
    setActiveTab('movements');
    setMvtProductId(productId);
    const targetProduct = products.find(p => p.id === productId);
    if (targetProduct) {
      setMvtSearchQuery(`#${targetProduct.no} ${targetProduct.designation}`);
    }
    setIsMvtDropdownOpen(false);
    setMvtType('entree');
    setMvtQuantity('');
    setMvtNote('Approvisionnement prioritaire');
    setTimeout(() => {
      qtyInputRef.current?.focus();
    }, 120);
  };

  // Product Form Save
  const handleProductSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.designation?.trim()) {
      showToast('Erreur', 'La désignation du produit est obligatoire.', 'error');
      return;
    }

    const no = Number(editingProduct.no) || 1;
    const designation = editingProduct.designation.trim();
    const quantite = Math.max(0, Number(editingProduct.quantite) || 0);
    const prixCession = Math.max(0, Number(editingProduct.prixCession) || 0);
    const prixVente = Math.max(0, Number(editingProduct.prixVente) || Math.round(prixCession * 1.35));
    const seuilAlerte = Math.max(1, Number(editingProduct.seuilAlerte) || 10);
    const datePeremption = editingProduct.datePeremption || '';
    const categorie = editingProduct.categorie?.trim() || getProductCategory(designation);
    const fournisseur = editingProduct.fournisseur?.trim() || getProductSupplier(designation, undefined, editingProduct.id);

    if (editingProduct.id) {
      // Edit
      const existing = products.find(p => p.id === editingProduct.id);
      if (existing && existing.quantite !== quantite) {
        // Record adjustment movement
        const diff = quantite - existing.quantite;
        const newMvt: StockMovement = {
          id: 'mvt-' + Date.now(),
          date: new Date().toISOString(),
          type: 'ajustement',
          productId: existing.id,
          productName: designation,
          quantite: diff,
          stockApres: quantite,
          note: 'Modification directe de la fiche produit'
        };
        setMovements(prev => [newMvt, ...prev]);
      }

      const updatedProduct: Product = {
        id: editingProduct.id,
        no,
        designation,
        quantite,
        prixCession,
        prixVente,
        seuilAlerte,
        datePeremption,
        categorie,
        fournisseur
      };

      setProducts(prev =>
        prev.map(p => (p.id === editingProduct.id ? updatedProduct : p))
      );

      // Persist edited product to Firestore
      saveProductToFirestore(updatedProduct).catch(e => console.warn('Erreur Firestore edit produit:', e));

      showToast('Fiche mise à jour', `Le produit « ${designation} » a été modifié.`, 'success');
    } else {
      // Create New
      const newId = Date.now();
      const newProd: Product = {
        id: newId,
        no,
        designation,
        quantite,
        prixCession,
        prixVente,
        seuilAlerte,
        datePeremption,
        categorie,
        fournisseur
      };
      setProducts(prev => [...prev, newProd]);

      // Persist new product to Firestore
      saveProductToFirestore(newProd).catch(e => console.warn('Erreur Firestore nouveau produit:', e));

      if (quantite > 0) {
        const newMvt: StockMovement = {
          id: 'mvt-' + Date.now(),
          date: new Date().toISOString(),
          type: 'entree',
          productId: newId,
          productName: designation,
          quantite,
          stockApres: quantite,
          note: 'Création du produit avec stock initial'
        };
        setMovements(prev => [newMvt, ...prev]);
        recordMovementInFirestore(newMvt, quantite).catch(e => console.warn('Erreur Firestore mvt:', e));
      }

      showToast('Nouveau comprimé', `« ${designation} » a été ajouté au catalogue.`, 'success');
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Product Delete Action
  const executeDeleteProduct = () => {
    if (!productToDelete) return;
    setProducts(prev => prev.filter(p => p.id !== productToDelete.id));

    // Delete in Firestore
    deleteProductFromFirestore(productToDelete.id).catch(e => console.warn('Erreur Firestore delete:', e));

    showToast('Produit supprimé', `« ${productToDelete.designation} » a été retiré.`, 'info');
    setProductToDelete(null);
  };

  // Physical Inventory Live Difference Calculation
  const inventoryStats = useMemo(() => {
    let countedCount = 0;
    let diffCount = 0;
    let totalDiffUnits = 0;
    let totalDiffVal = 0;

    const diffItems: {
      product: Product;
      theorique: number;
      compté: number;
      diff: number;
      impact: number;
    }[] = [];

    products.forEach(p => {
      if (p.id in physicalCounts) {
        countedCount++;
        const counted = physicalCounts[p.id];
        const diff = counted - p.quantite;
        if (diff !== 0) {
          diffCount++;
          totalDiffUnits += diff;
          const impact = diff * (p.prixCession || 0);
          totalDiffVal += impact;
          diffItems.push({
            product: p,
            theorique: p.quantite,
            compté: counted,
            diff,
            impact
          });
        }
      }
    });

    return {
      countedCount,
      diffCount,
      totalDiffUnits,
      totalDiffVal,
      diffItems
    };
  }, [products, physicalCounts]);

  const filteredInventoryProducts = useMemo(() => {
    const q = inventorySearch.toLowerCase().trim();
    return products.filter(p => {
      if (q) {
        const matchNo = String(p.no).includes(q);
        const matchName = (p.designation || '').toLowerCase().includes(q);
        if (!matchNo && !matchName) return false;
      }

      if (inventoryCategoryFilter !== 'all') {
        const cat = getProductCategory(p.designation, p.categorie);
        if (cat !== inventoryCategoryFilter) return false;
      }

      const isCounted = p.id in physicalCounts;
      const diff = isCounted ? physicalCounts[p.id] - p.quantite : 0;

      if (inventoryFilter === 'changed') {
        return isCounted && diff !== 0;
      } else if (inventoryFilter === 'uncounted') {
        return !isCounted;
      }
      return true;
    });
  }, [products, inventorySearch, inventoryFilter, inventoryCategoryFilter, physicalCounts]);

  // 1-Click Inventory Adjustment Validation
  const executeInventoryAdjustment = () => {
    if (inventoryStats.diffItems.length === 0) {
      showToast('Aucun écart', 'Aucun comptage avec écart à ajuster.', 'warning');
      setIsInventoryConfirmModalOpen(false);
      return;
    }

    const nowIso = new Date().toISOString();
    const newMovements: StockMovement[] = [];

    setProducts(prev =>
      prev.map(p => {
        if (p.id in physicalCounts) {
          const counted = physicalCounts[p.id];
          const diff = counted - p.quantite;
          if (diff !== 0) {
            newMovements.push({
              id: 'mvt-' + Date.now() + '-' + p.id,
              date: nowIso,
              type: 'ajustement',
              productId: p.id,
              productName: p.designation,
              quantite: diff,
              stockApres: counted,
              note: 'Rapprochement inventaire physique'
            });
            return { ...p, quantite: counted };
          }
        }
        return p;
      })
    );

    setMovements(prev => [...newMovements, ...prev]);

    // Batch persist adjustments to Firestore
    const firestoreAdjustments = newMovements.map(m => {
      const prod = products.find(p => p.id === m.productId);
      return {
        product: prod ? { ...prod, quantite: m.stockApres } : ({ id: m.productId } as Product),
        newStock: m.stockApres,
        movement: m
      };
    });
    applyPhysicalInventoryInFirestore(firestoreAdjustments).catch(err => {
      console.warn('Erreur synchro cloud inventaire:', err);
    });

    setPhysicalCounts({});
    setIsInventoryConfirmModalOpen(false);

    showToast(
      'Inventaire validé !',
      `${inventoryStats.diffItems.length} comprimés mis à jour et consignés dans l'historique.`,
      'success'
    );
  };

  // Excel TSV Generator
  const generateExcelTSV = (mode: 'all' | 'reorder' | 'movements') => {
    const rows: string[] = [];
    if (mode === 'movements') {
      rows.push(['Date et Heure', 'Type de Mouvement', 'Produit', 'Quantité', 'Stock Après', 'Note/Motif'].join('\t'));
      movements.forEach(m => {
        rows.push([
          formatDateTime(m.date),
          m.type.toUpperCase(),
          m.productName,
          m.quantite.toString(),
          m.stockApres.toString(),
          m.note || ''
        ].join('\t'));
      });
    } else {
      let targetList = products;
      if (mode === 'reorder') {
        targetList = products.filter(p => p.quantite <= (p.seuilAlerte || 10));
      }
      rows.push([
        'N°',
        'Désignation du Comprimé',
        'Stock Physique',
        'Seuil Alerte',
        'Prix Cession (FCFA)',
        'Prix Vente (FCFA)',
        'Valeur du Stock (FCFA)',
        'Date de Péremption',
        'Statut Disponibilité'
      ].join('\t'));

      targetList.forEach(p => {
        const valStock = (p.quantite || 0) * (p.prixCession || 0);
        let stat = 'En stock';
        if (p.quantite === 0) stat = 'Rupture';
        else if (p.quantite <= (p.seuilAlerte || 10)) stat = 'Stock bas';

        rows.push([
          p.no.toString(),
          p.designation,
          p.quantite.toString(),
          (p.seuilAlerte || 10).toString(),
          p.prixCession.toString(),
          p.prixVente.toString(),
          valStock.toString(),
          p.datePeremption || '',
          stat
        ].join('\t'));
      });
    }
    return rows.join('\n');
  };

  const copyExcelData = (mode: 'all' | 'reorder' | 'movements') => {
    const tsv = generateExcelTSV(mode);
    setExcelPreview(tsv);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).then(() => {
        showToast('Copié pour Excel !', 'Données tabulaires copiées dans le presse-papier. Ouvrez Excel et collez (Ctrl+V).', 'success');
      }).catch(() => {
        showToast('Presse-papier', 'Données prêtes dans le cadre ci-dessous.', 'info');
      });
    } else {
      showToast('Presse-papier', 'Données prêtes dans le cadre ci-dessous.', 'info');
    }
  };

  // JSON Backup & Restore
  const jsonBackupString = useMemo(() => {
    return JSON.stringify(
      {
        pharmacie: 'Pharmacie Laafi Zanga',
        exportDate: new Date().toISOString(),
        productsCount: products.length,
        products,
        movements
      },
      null,
      2
    );
  }, [products, movements]);

  const copyJsonBackup = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonBackupString).then(() => {
        showToast('Sauvegarde copiée', 'Le texte JSON complet a été copié dans votre presse-papier.', 'success');
      });
    }
  };

  const handleJsonRestore = () => {
    if (!jsonRestoreInput.trim()) {
      showToast('Erreur', 'Veuillez coller un texte JSON valide.', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(jsonRestoreInput.trim());
      if (!parsed || !Array.isArray(parsed.products) || parsed.products.length === 0) {
        showToast('JSON invalide', 'Le JSON ne contient pas de liste de produits valide.', 'error');
        return;
      }

      setProducts(parsed.products);
      if (Array.isArray(parsed.movements)) {
        setMovements(parsed.movements);
      }
      setJsonRestoreInput('');
      showToast('Restauration réussie', `${parsed.products.length} comprimés restaurés avec succès.`, 'success');
    } catch (err: any) {
      showToast('Erreur syntaxe JSON', err?.message || 'Format JSON incorrect', 'error');
    }
  };

  // Factory reset back to 302 initial items
  const executeFactoryReset = () => {
    setProducts(INITIAL_PRODUCTS);
    setMovements(INITIAL_MOVEMENTS);
    setPhysicalCounts({});
    setIsResetFactoryModalOpen(false);
    showToast('Réinitialisation terminée', 'Base rétablie aux 302 comprimés originaux de la fiche.', 'info');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a1012] text-slate-900 dark:text-slate-100 font-sans">
      {/* SIDEBAR NAVIGATION (Desktop: 236px, Tablet 821-1100px: 68px, Mobile: hidden) */}
      <aside className="fixed top-0 left-0 bottom-0 z-40 hidden md:flex md:w-[68px] lg:w-[236px] flex-col bg-[#0b3b36] text-[#e6f4f1] border-r border-[#134e48] transition-all duration-200">
        {/* Brand */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 lg:justify-start justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/40 shrink-0 font-extrabold text-lg">
            LZ
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h1 className="font-extrabold text-sm text-white tracking-tight truncate leading-tight">
              Pharmacie Laafi Zanga
            </h1>
            <p className="text-[11px] font-semibold text-[#99cfc5] uppercase tracking-wider">
              Inventaire Comprimés
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all lg:justify-start justify-center ${
              activeTab === 'dashboard'
                ? 'bg-[#115e59] text-white shadow-sm ring-1 ring-teal-400/30'
                : 'text-[#99cfc5] hover:bg-[#134e48] hover:text-white'
            }`}
            title="Tableau de bord"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Tableau de bord</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all lg:justify-start justify-center relative ${
              activeTab === 'products'
                ? 'bg-[#115e59] text-white shadow-sm ring-1 ring-teal-400/30'
                : 'text-[#99cfc5] hover:bg-[#134e48] hover:text-white'
            }`}
            title="Catalogue Produits"
          >
            <Pill className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline flex-1 text-left">Produits</span>
            {dashboardStats.ruptures > 0 && (
              <span className="hidden lg:inline bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {dashboardStats.ruptures}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all lg:justify-start justify-center ${
              activeTab === 'movements'
                ? 'bg-[#115e59] text-white shadow-sm ring-1 ring-teal-400/30'
                : 'text-[#99cfc5] hover:bg-[#134e48] hover:text-white'
            }`}
            title="Mouvements"
          >
            <ArrowLeftRight className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Mouvements</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all lg:justify-start justify-center ${
              activeTab === 'inventory'
                ? 'bg-[#115e59] text-white shadow-sm ring-1 ring-teal-400/30'
                : 'text-[#99cfc5] hover:bg-[#134e48] hover:text-white'
            }`}
            title="Inventaire physique"
          >
            <ClipboardCheck className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Inventaire physique</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all lg:justify-start justify-center relative ${
              activeTab === 'orders'
                ? 'bg-[#115e59] text-white shadow-sm ring-1 ring-teal-400/30'
                : 'text-[#99cfc5] hover:bg-[#134e48] hover:text-white'
            }`}
            title="Commandes Fournisseurs"
          >
            <ShoppingCart className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline flex-1 text-left">Commandes</span>
            {orders.filter(o => o.status === 'envoyee' || o.status === 'brouillon').length > 0 && (
              <span className="hidden lg:inline bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'envoyee' || o.status === 'brouillon').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all lg:justify-start justify-center ${
              activeTab === 'backup'
                ? 'bg-[#115e59] text-white shadow-sm ring-1 ring-teal-400/30'
                : 'text-[#99cfc5] hover:bg-[#134e48] hover:text-white'
            }`}
            title="Sauvegarde & Export"
          >
            <Database className="w-5 h-5 shrink-0" />
            <span className="hidden lg:inline">Sauvegarde & Export</span>
          </button>
        </nav>

        {/* PWA Install Promotion in Sidebar */}
        <div className="hidden lg:block">
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 hidden lg:flex flex-col gap-2 text-xs text-[#99cfc5]">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg text-teal-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Devise : Franc CFA (FCFA)
          </div>
          <div>Total comprimés : 302 réf.</div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-[68px] lg:ml-[236px] flex flex-col min-w-0 pb-20 md:pb-6">
        {/* PWA Install Top Banner */}
        <PWAInstallButton variant="banner" />

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#111c1e]/90 backdrop-blur border-b border-slate-200 dark:border-[#21373a] px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex md:hidden items-center justify-center text-white font-bold text-xs">
              LZ
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">
                <span>Pharmacie Laafi Zanga</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Gestion Officine</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-none mt-0.5">
                {activeTab === 'dashboard' && 'Tableau de bord & Répartition'}
                {activeTab === 'products' && 'Catalogue des Comprimés'}
                {activeTab === 'movements' && 'Entrées & Sorties de Stock'}
                {activeTab === 'inventory' && 'Inventaire Physique & Rapprochement'}
                {activeTab === 'orders' && 'Commandes Fournisseurs & Approvisionnement'}
                {activeTab === 'backup' && 'Sauvegarde & Exportation'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Cloud Firestore & Google Auth Status */}
            <FirebaseAuthButton products={products} movements={movements} onShowToast={showToast} />

            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="button" />

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg font-medium">
              <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{currentClock}</span>
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Basculer thème clair/sombre"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* TAB 1: TABLEAU DE BORD */}
        {activeTab === 'dashboard' && (
          <main className="p-4 md:p-8 space-y-6">
            {/* Notification / Help Banner if many products have 0 qty */}
            {dashboardStats.ruptures / (dashboardStats.totalCount || 1) >= 0.5 && (
              <div className="bg-gradient-to-r from-[#0b3b36] to-[#115e59] text-white rounded-2xl p-5 shadow-lg shadow-[#0b3b36]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 shrink-0">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Fiche d'inventaire comprimés importée</h3>
                    <p className="text-xs sm:text-sm text-teal-100 mt-0.5">
                      {dashboardStats.ruptures} comprimés sur {dashboardStats.totalCount} ont un stock initial à 0.
                      Utilisez l'onglet « Inventaire physique » pour renseigner vos comptages d'étagère ou enregistrez des
                      entrées de stock.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 transition"
                >
                  Lancer le comptage
                </button>
              </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Featured Card in Dark Green #0b3b36 */}
              <div className="bg-gradient-to-br from-[#0b3b36] to-[#072421] text-white p-5 rounded-2xl border border-teal-900/60 shadow-xl shadow-[#0b3b36]/30 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider">
                    Valeur du stock
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-white tabular-nums">
                    {formatMoney(dashboardStats.totalValue)}
                  </div>
                  <div className="text-xs text-teal-300 font-medium mt-1">
                    {formatNumber(dashboardStats.totalUnits)} unités physiques en rayon
                  </div>
                </div>
              </div>

              {/* Total References */}
              <div className="bg-white dark:bg-[#111c1e] p-5 rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Références
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatNumber(dashboardStats.totalCount)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Comprimés répertoriés
                  </div>
                </div>
              </div>

              {/* Ruptures */}
              <div
                onClick={() => {
                  setActiveTab('products');
                  setProductFilter('rupture');
                }}
                className="bg-white dark:bg-[#111c1e] p-5 rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-400 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Ruptures
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatNumber(dashboardStats.ruptures)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Stock à zéro (0 u.)</div>
                </div>
              </div>

              {/* Low Stock */}
              <div
                onClick={() => {
                  setActiveTab('products');
                  setProductFilter('low');
                }}
                className="bg-white dark:bg-[#111c1e] p-5 rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-400 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Stocks bas
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatNumber(dashboardStats.lowStock)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sous le seuil d'alerte</div>
                </div>
              </div>

              {/* Expiring Soon */}
              <div
                onClick={() => {
                  setActiveTab('products');
                  setProductFilter('expiring');
                }}
                className="bg-white dark:bg-[#111c1e] p-5 rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm flex flex-col justify-between cursor-pointer hover:border-sky-400 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Péremptions &lt; 90j
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
                    {formatNumber(dashboardStats.expiringSoon)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vigilance rotation lot</div>
                </div>
              </div>
            </div>

            {/* Interactive SVG Circular Stock Value Distribution Chart */}
            <StockValueDonutChart
              products={products}
              onSelectCategory={(targetName) => {
                setActiveTab('products');
                setProductSearch(targetName);
                showToast(
                  'Filtre appliqué',
                  `Affichage des comprimés associés à « ${targetName} ».`,
                  'info'
                );
              }}
            />

            {/* CSS Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Stock Distribution Stacked Bar */}
              <div className="bg-white dark:bg-[#111c1e] p-6 rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Répartition des stocks comprimés
                  </h3>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2.5 py-1 rounded-full">
                    {((dashboardStats.normalStock / (dashboardStats.totalCount || 1)) * 100).toFixed(0)}% optimal
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Visualisation proportionnelle de l'état des 302 références :
                </p>

                {/* Progress bar */}
                <div className="h-6 w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${dashboardStats.normalPct}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`En stock : ${dashboardStats.normalStock}`}
                  />
                  <div
                    style={{ width: `${dashboardStats.lowPct}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                    title={`Stock bas : ${dashboardStats.lowStock}`}
                  />
                  <div
                    style={{ width: `${dashboardStats.rupturePct}%` }}
                    className="bg-rose-500 h-full transition-all duration-500"
                    title={`Rupture : ${dashboardStats.ruptures}`}
                  />
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Normal : {dashboardStats.normalStock} ({dashboardStats.normalPct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-400 shrink-0"></span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Bas : {dashboardStats.lowStock} ({dashboardStats.lowPct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-rose-500 shrink-0"></span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Rupture : {dashboardStats.ruptures} ({dashboardStats.rupturePct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Top 5 Most Valued Products */}
              <div className="bg-white dark:bg-[#111c1e] p-6 rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Produits les plus valorisés en stock
                  </h3>
                  <span className="text-xs text-slate-400">Top 5</span>
                </div>

                <div className="space-y-3">
                  {dashboardStats.topValued.map(p => {
                    const maxVal = dashboardStats.topValued[0]?.valeur || 1;
                    const pct = maxVal > 0 ? ((p.valeur / maxVal) * 100).toFixed(0) : 0;
                    return (
                      <div key={p.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                            #{p.no} {p.designation} ({formatNumber(p.quantite)} u.)
                          </span>
                          <span className="text-teal-600 dark:text-teal-400 font-bold tabular-nums">
                            {formatMoney(p.valeur)}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tables Grid: À Réapprovisionner & Derniers Mouvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* À Réapprovisionner */}
              <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    À réapprovisionner en priorité
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setProductFilter('rupture');
                    }}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs responsive-table">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-semibold">
                      <tr>
                        <th className="p-3">N°</th>
                        <th className="p-3">Désignation</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Seuil</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {dashboardStats.reorderList.map(p => (
                        <tr
                          key={p.id}
                          className={p.quantite === 0 ? 'border-l-4 border-rose-500' : 'border-l-4 border-amber-400'}
                        >
                          <td className="p-3 text-slate-400" data-l="N°">
                            #{p.no}
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-100" data-l="Désignation">
                            {p.designation}
                          </td>
                          <td className="p-3" data-l="Stock">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold ${
                                p.quantite === 0
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              }`}
                            >
                              {p.quantite} u.
                            </span>
                          </td>
                          <td className="p-3 text-slate-500" data-l="Seuil">
                            {p.seuilAlerte} u.
                          </td>
                          <td className="p-3 text-right" data-l="Action">
                            <button
                              onClick={() => quickStockEntry(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition"
                            >
                              + Appro
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Derniers Mouvements */}
              <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-teal-600" />
                    Derniers mouvements enregistrés
                  </h3>
                  <button
                    onClick={() => setActiveTab('movements')}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                  >
                    Historique complet
                  </button>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs responsive-table">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-100 dark:border-slate-800 font-semibold">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Produit</th>
                        <th className="p-3 text-right">Quantité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {movements.slice(0, 6).map(m => (
                        <tr key={m.id}>
                          <td className="p-3 text-slate-500" data-l="Date">
                            {formatDateTime(m.date)}
                          </td>
                          <td className="p-3" data-l="Type">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                                m.type === 'entree'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : m.type === 'sortie'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                  : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                              }`}
                            >
                              {m.type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-100" data-l="Produit">
                            {m.productName}
                          </td>
                          <td className="p-3 text-right tabular-nums font-bold" data-l="Quantité">
                            {m.type === 'entree' ? `+${m.quantite}` : m.quantite}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* TAB 2: PRODUITS (CATALOGUE & GESTION) */}
        {activeTab === 'products' && (
          <main className="p-4 md:p-8 space-y-4">
            <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm p-5 space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  {/* Search input with preserved focus */}
                  <div className="relative min-w-[240px] max-w-sm flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => {
                        setProductSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Rechercher par n°, désignation..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                    <button
                      onClick={() => {
                        setProductFilter('all');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        productFilter === 'all'
                          ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Tous ({products.length})
                    </button>
                    <button
                      onClick={() => {
                        setProductFilter('in_stock');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        productFilter === 'in_stock'
                          ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      En stock
                    </button>
                    <button
                      onClick={() => {
                        setProductFilter('low');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        productFilter === 'low'
                          ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Stock bas ({dashboardStats.lowStock})
                    </button>
                    <button
                      onClick={() => {
                        setProductFilter('rupture');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        productFilter === 'rupture'
                          ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Ruptures ({dashboardStats.ruptures})
                    </button>
                    <button
                      onClick={() => {
                        setProductFilter('expiring');
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        productFilter === 'expiring'
                          ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Péremption &lt; 90j
                    </button>
                  </div>
                </div>

                {/* Add product button */}
                <button
                  onClick={() => {
                    const maxNo = products.reduce((m, p) => (p.no > m ? p.no : m), 0);
                    setEditingProduct({
                      no: maxNo + 1,
                      designation: '',
                      quantite: 0,
                      prixCession: 0,
                      prixVente: 0,
                      seuilAlerte: 10,
                      datePeremption: ''
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="h-10 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-teal-900/20 shrink-0 transition"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau produit
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-[#21373a] rounded-xl">
                <table className="w-full text-left text-xs responsive-table">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#21373a] font-bold select-none">
                    <tr>
                      <th onClick={() => handleSort('no')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        N° {sortColumn === 'no' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('designation')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        Désignation {sortColumn === 'designation' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('quantite')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        Stock {sortColumn === 'quantite' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('seuilAlerte')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        Seuil {sortColumn === 'seuilAlerte' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('prixCession')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        Prix Cession {sortColumn === 'prixCession' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('prixVente')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        Prix Vente {sortColumn === 'prixVente' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('valeurStock')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        Valeur Stock {sortColumn === 'valeurStock' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('datePeremption')} className="p-3.5 cursor-pointer hover:bg-slate-100">
                        Péremption {sortColumn === 'datePeremption' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400">
                          Aucun comprimé trouvé pour cette recherche.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map(p => {
                        const valStock = (p.quantite || 0) * (p.prixCession || 0);
                        const isRupture = p.quantite === 0;
                        const isLow = p.quantite > 0 && p.quantite <= (p.seuilAlerte || 10);
                        const exp = getExpiryStatus(p.datePeremption);

                        let borderClass = 'border-l-4 border-transparent';
                        let statusBadge = (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                            En stock
                          </span>
                        );

                        if (isRupture) {
                          borderClass = 'border-l-4 border-rose-500';
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
                              Rupture
                            </span>
                          );
                        } else if (isLow) {
                          borderClass = 'border-l-4 border-amber-400';
                          statusBadge = (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                              Stock bas
                            </span>
                          );
                        }

                        return (
                          <tr key={p.id} className={`${borderClass} hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition`}>
                            <td className="p-3.5 text-slate-400 font-bold" data-l="N°">
                              #{p.no}
                            </td>
                            <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100" data-l="Désignation">
                              <div>{p.designation}</div>
                              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-semibold text-[10px]">
                                  {getProductCategory(p.designation, p.categorie)}
                                </span>
                                <span>•</span>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                                  {getProductSupplier(p.designation, p.fournisseur, p.no)}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 font-extrabold text-sm tabular-nums" data-l="Stock">
                              {formatNumber(p.quantite)} u.
                            </td>
                            <td className="p-3.5 text-slate-500 tabular-nums" data-l="Seuil">
                              {p.seuilAlerte || 10}
                            </td>
                            <td className="p-3.5 tabular-nums text-slate-700 dark:text-slate-300" data-l="Prix Cession">
                              {formatMoney(p.prixCession)}
                            </td>
                            <td className="p-3.5 tabular-nums text-slate-700 dark:text-slate-300" data-l="Prix Vente">
                              {formatMoney(p.prixVente)}
                            </td>
                            <td className="p-3.5 tabular-nums font-bold text-teal-700 dark:text-teal-400" data-l="Valeur Stock">
                              {formatMoney(valStock)}
                            </td>
                            <td className="p-3.5" data-l="Péremption">
                              {exp.status === 'expired' ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                                  {formatDate(p.datePeremption)} (Périmé)
                                </span>
                              ) : exp.status === 'near' ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                                  {formatDate(p.datePeremption)} (&lt;90j)
                                </span>
                              ) : (
                                <span className="text-slate-500">{formatDate(p.datePeremption)}</span>
                              )}
                            </td>
                            <td className="p-3.5" data-l="Statut">
                              {statusBadge}
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap space-x-1" data-l="Actions">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition"
                                title="Modifier la fiche"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => quickStockEntry(p.id)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-teal-600 transition"
                                title="Ajouter un mouvement"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 text-rose-600 transition"
                                title="Supprimer le produit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500 font-semibold">
                <div>
                  Affichage de {sortedProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} à{' '}
                  {Math.min(currentPage * PAGE_SIZE, sortedProducts.length)} sur {sortedProducts.length} comprimés
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>

                  <span className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 rounded-lg font-bold">
                    Page {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* TAB 3: MOUVEMENTS DE STOCK */}
        {activeTab === 'movements' && (
          <main className="p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulaire Enregistrer Mouvement */}
              <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm p-6 lg:col-span-1 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-teal-600" />
                    Enregistrer un mouvement
                  </h3>
                </div>

                <form onSubmit={handleMovementSubmit} className="space-y-4">
                  {/* Type Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Type de mouvement
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMvtType('entree')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          mvtType === 'entree'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                        + Entrée stock
                      </button>

                      <button
                        type="button"
                        onClick={() => setMvtType('sortie')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          mvtType === 'sortie'
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4 text-rose-600" />
                        - Sortie stock
                      </button>
                    </div>
                  </div>

                  {/* Product Selection with Predictive Autocomplete */}
                  <div className="relative" ref={mvtSearchRef}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        Produit comprimé <span className="text-[11px] font-normal text-slate-500">(Recherche prédictive n° ou nom)</span>
                      </label>
                      {selectedMovementProduct && (
                        <button
                          type="button"
                          onClick={handleClearMovementProduct}
                          className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline flex items-center gap-1"
                          title="Changer de produit"
                        >
                          <X className="w-3 h-3" />
                          Changer
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={mvtSearchQuery}
                        onChange={e => {
                          setMvtSearchQuery(e.target.value);
                          setIsMvtDropdownOpen(true);
                          if (mvtProductId !== '') {
                            setMvtProductId('');
                          }
                        }}
                        onFocus={() => setIsMvtDropdownOpen(true)}
                        onKeyDown={e => {
                          if (e.key === 'Escape') {
                            setIsMvtDropdownOpen(false);
                          }
                        }}
                        placeholder="Tapez un n° (ex: 76) ou une désignation (ex: Cipro, Doli)..."
                        className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition"
                        autoComplete="off"
                      />
                      {mvtSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearMovementProduct}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          title="Effacer la recherche"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Predictive Dropdown */}
                    {isMvtDropdownOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-100 dark:divide-slate-800">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex justify-between items-center">
                          <span>
                            {filteredMvtProducts.length} résultat{filteredMvtProducts.length > 1 ? 's' : ''} trouvé{filteredMvtProducts.length > 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] text-slate-400">Filtrage instantané par n° ou nom</span>
                        </div>

                        {filteredMvtProducts.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                            Aucun produit comprimé trouvé pour « {mvtSearchQuery} ».
                          </div>
                        ) : (
                          filteredMvtProducts.map(p => {
                            const isSelected = p.id === mvtProductId;
                            const isRupture = p.quantite === 0;
                            const isLow = p.quantite > 0 && p.quantite <= p.seuilAlerte;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectMovementProduct(p)}
                                className={`w-full text-left p-2.5 transition flex items-center justify-between gap-2.5 hover:bg-teal-50/80 dark:hover:bg-teal-950/40 ${
                                  isSelected ? 'bg-teal-50 dark:bg-teal-950/60 font-semibold' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                                    #{p.no}
                                  </span>
                                  <div className="truncate">
                                    <div className="text-xs text-slate-900 dark:text-slate-100 font-medium truncate">
                                      {p.designation}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                      Cession : {formatMoney(p.prixCession)} • Seuil d'alerte : {p.seuilAlerte} u.
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isRupture
                                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                        : isLow
                                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                    }`}
                                  >
                                    {isRupture ? '0 u. (Rupture)' : `${p.quantite} u.`}
                                  </span>
                                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Live Stock Preview */}
                  {selectedMovementProduct && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Stock disponible en rayon :</span>
                        <strong className="text-slate-900 dark:text-slate-100">
                          {selectedMovementProduct.quantite} unités
                        </strong>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Stock projeté après mouvement :</span>
                        <span
                          className={
                            mvtType === 'sortie' && selectedMovementProduct.quantite - parsedMvtQty < 0
                              ? 'text-rose-600'
                              : 'text-teal-600 dark:text-teal-400'
                          }
                        >
                          {mvtType === 'entree'
                            ? selectedMovementProduct.quantite + parsedMvtQty
                            : selectedMovementProduct.quantite - parsedMvtQty}{' '}
                          unités
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hard Business Rule Alert Warning */}
                  {isSortieExceeding && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>
                        Action impossible : La quantité de sortie ({parsedMvtQty} u.) dépasse le stock disponible (
                        {selectedMovementProduct?.quantite} u.) !
                      </span>
                    </div>
                  )}

                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Quantité
                    </label>
                    <input
                      ref={qtyInputRef}
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={mvtQuantity}
                      onChange={e => setMvtQuantity(e.target.value)}
                      placeholder="Ex: 25"
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  {/* Note / Motif with quick tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Note / Motif du mouvement
                    </label>
                    <input
                      type="text"
                      value={mvtNote}
                      onChange={e => setMvtNote(e.target.value)}
                      placeholder="Ex: Réception grossiste, Vente ordonnance..."
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        'Livraison grossiste',
                        'Dispensation ordonnance',
                        'Vente au comptoir',
                        'Périmé / Destruction',
                        'Casse / Avarie'
                      ].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setMvtNote(tag)}
                          className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-md font-medium transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit button with rule-disable */}
                  <button
                    type="submit"
                    disabled={isSortieExceeding}
                    className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-teal-900/20"
                  >
                    Valider le mouvement
                  </button>
                </form>
              </div>

              {/* Historique des Mouvements */}
              <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm p-6 lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    Historique daté des mouvements
                  </h3>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    {(['all', 'entree', 'sortie', 'ajustement'] as MovementFilterType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setMovementFilter(t)}
                        className={`px-3 py-1 rounded-lg transition capitalize ${
                          movementFilter === t
                            ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {t === 'all' ? 'Tous' : t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-[#21373a] rounded-xl max-h-[520px]">
                  <table className="w-full text-left text-xs responsive-table">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 sticky top-0 font-bold border-b border-slate-200 dark:border-[#21373a]">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Produit</th>
                        <th className="p-3 text-right">Variation</th>
                        <th className="p-3 text-right">Stock Après</th>
                        <th className="p-3">Note / Motif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {movements
                        .filter(m => movementFilter === 'all' || m.type === movementFilter)
                        .map(m => (
                          <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="p-3 text-slate-500 whitespace-nowrap" data-l="Date">
                              {formatDateTime(m.date)}
                            </td>
                            <td className="p-3" data-l="Type">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                                  m.type === 'entree'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : m.type === 'sortie'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                }`}
                              >
                                {m.type}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-100" data-l="Produit">
                              {m.productName}
                            </td>
                            <td
                              className={`p-3 text-right font-extrabold tabular-nums ${
                                m.quantite > 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                              data-l="Variation"
                            >
                              {m.quantite > 0 ? `+${m.quantite}` : m.quantite}
                            </td>
                            <td className="p-3 text-right text-slate-700 dark:text-slate-300 tabular-nums font-bold" data-l="Stock Après">
                              {m.stockApres} u.
                            </td>
                            <td className="p-3 text-slate-500 max-w-[180px] truncate" data-l="Note" title={m.note}>
                              {m.note || '—'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* TAB 4: INVENTAIRE PHYSIQUE */}
        {activeTab === 'inventory' && (
          <main className="p-4 md:p-8 space-y-6">
            {/* Express Scanner & Touch Counting Bar */}
            <QuickInventoryScanner
              products={products}
              physicalCounts={physicalCounts}
              onUpdateCount={(pid, count) => setPhysicalCounts(prev => ({ ...prev, [pid]: count }))}
              onClearCount={pid =>
                setPhysicalCounts(prev => {
                  const next = { ...prev };
                  delete next[pid];
                  return next;
                })
              }
              onShowToast={showToast}
            />

            <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm p-6 space-y-6">
              {/* Header explanation & action buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-teal-600" />
                    Saisie d'Inventaire Physique & Rapprochement
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Saisissez directement les quantités physiques comptées en rayon. L'écart est calculé en direct.
                    Validez en un clic pour ajuster les stocks officiels et enregistrer les écarts dans l'historique.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsOfficialPVModalOpen(true)}
                    className="h-10 px-3.5 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
                    title="Générer et imprimer le procès-verbal d'inventaire officiel"
                  >
                    <FileText className="w-4 h-4" />
                    <span>PV Officiel</span>
                  </button>

                  <button
                    onClick={() => {
                      setPhysicalCounts({});
                      showToast('Saisie réinitialisée', 'Comptages temporaires effacés.', 'info');
                    }}
                    className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                  >
                    Effacer la saisie
                  </button>

                  <button
                    onClick={() => setIsInventoryConfirmModalOpen(true)}
                    className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-teal-900/20 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider et ajuster</span>
                  </button>
                </div>
              </div>

              {/* Inventory summary metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 font-semibold">Comptages saisis</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                    {inventoryStats.countedCount} / {products.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 font-semibold">Produits avec écart</span>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                    {inventoryStats.diffCount}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 font-semibold">Écart net en unités</span>
                  <div
                    className={`text-xl font-extrabold mt-1 tabular-nums ${
                      inventoryStats.totalDiffUnits >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {inventoryStats.totalDiffUnits >= 0
                      ? `+${inventoryStats.totalDiffUnits}`
                      : inventoryStats.totalDiffUnits}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 font-semibold">Impact financier estimé</span>
                  <div
                    className={`text-xl font-extrabold mt-1 tabular-nums ${
                      inventoryStats.totalDiffVal >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {inventoryStats.totalDiffVal >= 0 ? `+` : ''}
                    {formatMoney(inventoryStats.totalDiffVal)}
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    placeholder="Filtrer un comprimé..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={inventoryCategoryFilter}
                    onChange={e => setInventoryCategoryFilter(e.target.value)}
                    className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="all">Tous les rayons / classes</option>
                    {PHARMACY_CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>
                        Rayon : {c.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setInventoryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        inventoryFilter === 'all'
                          ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tous ({products.length})
                    </button>
                    <button
                      onClick={() => setInventoryFilter('changed')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        inventoryFilter === 'changed'
                          ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Avec écart ({inventoryStats.diffCount})
                    </button>
                    <button
                      onClick={() => setInventoryFilter('uncounted')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        inventoryFilter === 'uncounted'
                          ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Non saisis
                    </button>
                  </div>
                </div>
              </div>

              {/* Counting Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-[#21373a] rounded-xl max-h-[600px]">
                <table className="w-full text-left text-xs responsive-table">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 sticky top-0 font-bold border-b border-slate-200 dark:border-[#21373a]">
                    <tr>
                      <th className="p-3 w-16">N°</th>
                      <th className="p-3">Désignation</th>
                      <th className="p-3 text-right">Stock Théorique</th>
                      <th className="p-3 text-right w-48">Quantité Comptée</th>
                      <th className="p-3 text-right">Écart en Direct</th>
                      <th className="p-3 text-right">Impact Valeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredInventoryProducts.map(p => {
                      const hasCount = p.id in physicalCounts;
                      const countedVal = hasCount ? physicalCounts[p.id] : '';
                      const diff = hasCount ? physicalCounts[p.id] - p.quantite : null;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-3 text-slate-400 font-bold" data-l="N°">
                            #{p.no}
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-100" data-l="Désignation">
                            <div>{p.designation}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                              {getProductCategory(p.designation, p.categorie)}
                            </div>
                          </td>
                          <td className="p-3 text-right tabular-nums font-bold text-slate-600 dark:text-slate-300" data-l="Stock Théorique">
                            {p.quantite} u.
                          </td>
                          <td className="p-3 text-right" data-l="Quantité Comptée">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = hasCount ? physicalCounts[p.id] : 0;
                                  setPhysicalCounts(prev => ({ ...prev, [p.id]: Math.max(0, cur - 1) }));
                                }}
                                className="w-6 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center transition"
                                title="-1 unité"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="—"
                                value={countedVal}
                                onChange={e => {
                                  const val = e.target.value;
                                  setPhysicalCounts(prev => {
                                    if (val === '') {
                                      const next = { ...prev };
                                      delete next[p.id];
                                      return next;
                                    }
                                    return { ...prev, [p.id]: Math.max(0, parseInt(val, 10) || 0) };
                                  });
                                }}
                                className="w-16 h-8 px-1 text-right font-extrabold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none text-xs tabular-nums"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = hasCount ? physicalCounts[p.id] : 0;
                                  setPhysicalCounts(prev => ({ ...prev, [p.id]: cur + 1 }));
                                }}
                                className="w-6 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center transition"
                                title="+1 unité"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhysicalCounts(prev => ({ ...prev, [p.id]: p.quantite }));
                                  showToast('Conforme', `#${p.no} ${p.designation} marqué conforme (${p.quantite} u.).`, 'info');
                                }}
                                className="h-8 px-2 rounded bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-black text-[10px] transition"
                                title="Marquer conforme au stock théorique"
                              >
                                ✓
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right" data-l="Écart">
                            {diff === null ? (
                              <span className="text-slate-400">Non saisi</span>
                            ) : diff === 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                                0 (Conforme)
                              </span>
                            ) : diff > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                +{diff} (Excédent)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                                {diff} (Déficit)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right tabular-nums font-bold" data-l="Impact Valeur">
                            {diff === null ? (
                              <span className="text-slate-400">—</span>
                            ) : diff === 0 ? (
                              <span className="text-slate-500">0 FCFA</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600">+{formatMoney(diff * p.prixCession)}</span>
                            ) : (
                              <span className="text-rose-600">{formatMoney(diff * p.prixCession)}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* TAB 5: GESTION DES COMMANDES & APPROVISIONNEMENT */}
        {activeTab === 'orders' && (
          <main className="p-4 md:p-8 space-y-6">
            <OrdersManager
              products={products}
              orders={orders}
              onSaveOrder={handleSaveOrder}
              onDeleteOrder={handleDeleteOrder}
              onReceiveOrder={handleReceiveOrder}
              onShowToast={showToast}
            />
          </main>
        )}

        {/* TAB 6: SAUVEGARDE & EXPORT */}
        {activeTab === 'backup' && (
          <main className="p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exportation pour Excel (TSV) */}
              <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm p-6 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    Exportation pour Excel / Tableur (Collable)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Format tabulaire (TSV) structuré avec en-têtes françaises. Cliquez sur un bouton pour copier
                    directement dans votre presse-papier et collez dans Microsoft Excel ou Google Sheets.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyExcelData('all')}
                    className="h-10 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <Copy className="w-4 h-4" />
                    Copier tout le stock pour Excel
                  </button>
                  <button
                    onClick={() => copyExcelData('reorder')}
                    className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                  >
                    Copier ruptures & stocks bas
                  </button>
                  <button
                    onClick={() => copyExcelData('movements')}
                    className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
                  >
                    Copier l'historique mouvements
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Aperçu du texte tabulaire (TSV) :
                  </label>
                  <textarea
                    value={excelPreview}
                    readOnly
                    placeholder="Cliquez sur un des boutons ci-dessus pour générer le texte..."
                    className="w-full h-44 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono outline-none"
                  />
                </div>
              </div>

              {/* Sauvegarde & Restauration JSON */}
              <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-sm p-6 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Database className="w-5 h-5 text-teal-600" />
                    Sauvegarde & Restauration JSON
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sauvegarde complète de votre stock et historique par copier-coller (sans téléchargement de fichier
                    automatique).
                  </p>
                </div>

                {/* Copy Current JSON */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Sauvegarde actuelle ({products.length} produits) :
                    </span>
                    <button
                      onClick={copyJsonBackup}
                      className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copier le JSON
                    </button>
                  </div>
                  <textarea
                    value={jsonBackupString}
                    readOnly
                    className="w-full h-28 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono outline-none"
                  />
                </div>

                {/* Restore Pasted JSON */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Restaurer une sauvegarde collée :
                  </label>
                  <textarea
                    value={jsonRestoreInput}
                    onChange={e => setJsonRestoreInput(e.target.value)}
                    placeholder="Collez ici votre texte JSON de sauvegarde..."
                    className="w-full h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleJsonRestore}
                      className="h-9 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs transition"
                    >
                      Valider et restaurer
                    </button>

                    <button
                      onClick={() => setIsResetFactoryModalOpen(true)}
                      className="h-9 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Réinitialiser fiche originale
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (< 820px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b3b36] border-t border-white/10 px-2 py-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-teal-300' : 'text-[#99cfc5]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Accueil</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold relative ${
            activeTab === 'products' ? 'text-teal-300' : 'text-[#99cfc5]'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span>Produits</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'movements' ? 'text-teal-300' : 'text-[#99cfc5]'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span>Mouvements</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'inventory' ? 'text-teal-300' : 'text-[#99cfc5]'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>Inventaire</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold relative ${
            activeTab === 'orders' ? 'text-teal-300' : 'text-[#99cfc5]'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Commandes</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'backup' ? 'text-teal-300' : 'text-[#99cfc5]'
          }`}
        >
          <Database className="w-5 h-5" />
          <span>Export</span>
        </button>
      </nav>

      {/* MODAL 1: FICHE PRODUIT */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white dark:bg-[#111c1e] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingProduct.id
                  ? `Fiche Produit #${editingProduct.no} — ${editingProduct.designation}`
                  : 'Nouveau Comprimé (Ajout Catalogue)'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    N° d'inventaire
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.no ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, no: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Stock physique actuel
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.quantite ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, quantite: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Désignation du comprimé
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Paracétamol 500mg cp"
                  value={editingProduct.designation ?? ''}
                  onChange={e => setEditingProduct({ ...editingProduct, designation: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                />
              </div>

              {/* Catégorie & Fournisseur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Classe thérapeutique
                  </label>
                  <select
                    value={editingProduct.categorie || getProductCategory(editingProduct.designation || '')}
                    onChange={e => setEditingProduct({ ...editingProduct, categorie: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {PHARMACY_CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Laboratoire / Fournisseur
                  </label>
                  <select
                    value={editingProduct.fournisseur || getProductSupplier(editingProduct.designation || '', editingProduct.fournisseur, editingProduct.no)}
                    onChange={e => setEditingProduct({ ...editingProduct, fournisseur: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {PHARMACY_SUPPLIERS.map(sup => (
                      <option key={sup.name} value={sup.name}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Prix de cession (FCFA)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editingProduct.prixCession ?? ''}
                    onChange={e => {
                      const pc = parseFloat(e.target.value) || 0;
                      setEditingProduct({
                        ...editingProduct,
                        prixCession: pc,
                        prixVente: editingProduct.prixVente || Math.round(pc * 1.35)
                      });
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Prix de vente (FCFA)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editingProduct.prixVente ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, prixVente: parseFloat(e.target.value) || 0 })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Seuil d'alerte (stock bas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingProduct.seuilAlerte ?? 10}
                    onChange={e => setEditingProduct({ ...editingProduct, seuilAlerte: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Date de péremption
                  </label>
                  <input
                    type="date"
                    value={editingProduct.datePeremption ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, datePeremption: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMATION SUPPRESSION */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Confirmer la suppression</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Êtes-vous sûr de vouloir supprimer définitivement ce produit du catalogue de la pharmacie ?
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                #{productToDelete.no} {productToDelete.designation}
              </div>
              <div className="text-slate-500 mt-0.5">
                Stock actuel : {productToDelete.quantite} u. • {formatMoney(productToDelete.prixCession)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={executeDeleteProduct}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMATION INVENTAIRE */}
      {isInventoryConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-teal-600" />
              Validation de l'inventaire physique
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cette action va mettre à jour immédiatement les stocks physiques réels de la pharmacie et consigner chaque
              écart dans l'historique d'audit des mouvements.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500 font-semibold">Produits à ajuster :</span>
                <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                  {inventoryStats.diffItems.length} comprimés
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500 font-semibold">Impact valeur net :</span>
                <div
                  className={`text-base font-extrabold mt-0.5 ${
                    inventoryStats.totalDiffVal >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {inventoryStats.totalDiffVal >= 0 ? '+' : ''}
                  {formatMoney(inventoryStats.totalDiffVal)}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Produit</th>
                    <th className="p-2.5 text-right">Théorique</th>
                    <th className="p-2.5 text-right">Compté</th>
                    <th className="p-2.5 text-right">Écart</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventoryStats.diffItems.map(item => (
                    <tr key={item.product.id}>
                      <td className="p-2.5 font-bold truncate max-w-[200px]">{item.product.designation}</td>
                      <td className="p-2.5 text-right text-slate-500">{item.theorique} u.</td>
                      <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100">{item.compté} u.</td>
                      <td
                        className={`p-2.5 text-right font-extrabold ${
                          item.diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.diff > 0 ? `+${item.diff}` : item.diff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsInventoryConfirmModalOpen(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={executeInventoryAdjustment}
                className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
              >
                Confirmer l'ajustement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMATION RÉINITIALISATION D'USINE */}
      {isResetFactoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-rose-600 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Réinitialisation fiche d'origine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Attention : cette action va réinitialiser la base de données aux 302 comprimés originaux de la Pharmacie
              Laafi Zanga et réinitialiser l'historique des mouvements.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetFactoryModalOpen(false)}
                className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={executeFactoryReset}
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Réinitialiser tout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PROCÈS-VERBAL OFFICIEL D'INVENTAIRE */}
      <OfficialInventoryReportModal
        products={products}
        physicalCounts={physicalCounts}
        isOpen={isOfficialPVModalOpen}
        onClose={() => setIsOfficialPVModalOpen(false)}
        onShowToast={showToast}
      />

      {/* TOAST NOTIFICATION CONTAINER (Fixed bottom-right) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-32px)] pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl bg-white dark:bg-[#111c1e] border shadow-xl flex items-start gap-3 text-xs animate-in slide-in-from-right-4 transition-all ${
              toast.type === 'success'
                ? 'border-emerald-500/40 text-slate-900 dark:text-slate-100'
                : toast.type === 'error'
                ? 'border-rose-500/40 text-slate-900 dark:text-slate-100'
                : toast.type === 'warning'
                ? 'border-amber-500/40 text-slate-900 dark:text-slate-100'
                : 'border-sky-500/40 text-slate-900 dark:text-slate-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 dark:text-slate-100">{toast.title}</div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{toast.description}</div>
            </div>

            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 p-1">
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
