import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  Send,
  Trash2,
  Printer,
  Sparkles,
  AlertTriangle,
  Building2,
  Calendar,
  Search,
  Package,
  X,
  Copy,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { PurchaseOrder, OrderItem, OrderStatus } from '../types/order';
import { Product } from '../data/initialProducts';
import { PHARMACY_SUPPLIERS, getProductSupplier } from '../utils/pharmacyClassification';

interface OrdersManagerProps {
  products: Product[];
  orders: PurchaseOrder[];
  onSaveOrder: (order: PurchaseOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onReceiveOrder: (order: PurchaseOrder) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  products,
  orders,
  onSaveOrder,
  onDeleteOrder,
  onReceiveOrder,
  onShowToast
}) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'tous'>('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<PurchaseOrder | null>(null);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState<PurchaseOrder | null>(null);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);

  // Form state for creating/editing order
  const [orderSupplier, setOrderSupplier] = useState<string>(PHARMACY_SUPPLIERS[0].name);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [itemQtyToAdd, setItemQtyToAdd] = useState<number>(10);

  // Auto-generation config
  const [autoGenSupplier, setAutoGenSupplier] = useState<string>('all');
  const [autoGenTargetMultiplier, setAutoGenTargetMultiplier] = useState<number>(2); // 2x seuil alerte

  const formatMoney = (val: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        maximumFractionDigits: 0
      }).format(Math.round(val)) + ' FCFA'
    );
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return iso;
    }
  };

  // Products needing replenishment
  const reorderCandidates = useMemo(() => {
    return products.filter(p => p.quantite <= (p.seuilAlerte || 10));
  }, [products]);

  // Overall stats
  const stats = useMemo(() => {
    const total = orders.length;
    const brouillons = orders.filter(o => o.status === 'brouillon').length;
    const envoyees = orders.filter(o => o.status === 'envoyee').length;
    const receptionnees = orders.filter(o => o.status === 'receptionnee').length;
    const totalEngage = orders
      .filter(o => o.status === 'envoyee' || o.status === 'brouillon')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total, brouillons, envoyees, receptionnees, totalEngage };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = filterStatus === 'tous' || o.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.supplier.toLowerCase().includes(q) ||
        o.items.some(it => it.designation.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  // Candidate products for manual item addition
  const itemSearchSuggestions = useMemo(() => {
    if (!itemSearch.trim()) return [];
    const q = itemSearch.toLowerCase().trim();
    return products
      .filter(p => p.designation.toLowerCase().includes(q) || p.no.toString().includes(q))
      .slice(0, 6);
  }, [itemSearch, products]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    const nextNum = `BC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    setOrderSupplier(PHARMACY_SUPPLIERS[0].name);
    setOrderNotes('');
    setOrderItems([]);
    setItemSearch('');
    setSelectedProductToAdd(null);
    setItemQtyToAdd(10);
    setIsCreateModalOpen(true);
  };

  // Add line to order draft
  const handleAddItemToDraft = () => {
    if (!selectedProductToAdd || itemQtyToAdd <= 0) return;

    // Check if already in draft
    const existingIndex = orderItems.findIndex(it => it.productId === selectedProductToAdd.id);
    if (existingIndex >= 0) {
      const updated = [...orderItems];
      const newQty = updated[existingIndex].quantiteCommandee + itemQtyToAdd;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantiteCommandee: newQty,
        totalLigne: newQty * updated[existingIndex].prixUnitaire
      };
      setOrderItems(updated);
    } else {
      const prix = selectedProductToAdd.prixCession || 0;
      const newItem: OrderItem = {
        productId: selectedProductToAdd.id,
        productNo: selectedProductToAdd.no,
        designation: selectedProductToAdd.designation,
        quantiteCommandee: itemQtyToAdd,
        prixUnitaire: prix,
        totalLigne: itemQtyToAdd * prix,
        stockActuel: selectedProductToAdd.quantite,
        seuilAlerte: selectedProductToAdd.seuilAlerte
      };
      setOrderItems([...orderItems, newItem]);
    }

    setItemSearch('');
    setSelectedProductToAdd(null);
    setItemQtyToAdd(10);
  };

  // Remove line
  const handleRemoveItemFromDraft = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Save draft order
  const handleSaveDraft = (status: OrderStatus = 'brouillon') => {
    if (orderItems.length === 0) {
      onShowToast('Bon de commande vide', 'Veuillez ajouter au moins un comprimé à commander.', 'error');
      return;
    }

    const totalAmount = orderItems.reduce((sum, it) => sum + it.totalLigne, 0);
    const orderNum = `BC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: PurchaseOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderNumber: orderNum,
      supplier: orderSupplier,
      createdAt: new Date().toISOString(),
      status,
      items: orderItems,
      totalAmount,
      notes: orderNotes.trim()
    };

    onSaveOrder(newOrder);
    setIsCreateModalOpen(false);
    onShowToast(
      'Bon de commande créé',
      `Le bon ${orderNum} auprès de ${orderSupplier} a été enregistré (${formatMoney(totalAmount)}).`,
      'success'
    );
  };

  // Automated Replenishment Order Generator
  const handleGenerateReplenishmentOrder = () => {
    let candidates = reorderCandidates;
    if (autoGenSupplier !== 'all') {
      candidates = candidates.filter(
        p => getProductSupplier(p.designation, p.fournisseur, p.no) === autoGenSupplier
      );
    }

    if (candidates.length === 0) {
      onShowToast(
        'Aucun comprimé éligible',
        `Aucun produit sous seuil d'alerte trouvé pour le filtre sélectionné.`,
        'info'
      );
      return;
    }

    const supplierName =
      autoGenSupplier === 'all' ? 'Centrale d’Achat CAMEG (Groupé)' : autoGenSupplier;

    const items: OrderItem[] = candidates.map(p => {
      const seuil = p.seuilAlerte || 10;
      const cible = seuil * autoGenTargetMultiplier;
      const qte = Math.max(10, cible - p.quantite);
      const prix = p.prixCession || 0;
      return {
        productId: p.id,
        productNo: p.no,
        designation: p.designation,
        quantiteCommandee: qte,
        prixUnitaire: prix,
        totalLigne: qte * prix,
        stockActuel: p.quantite,
        seuilAlerte: seuil
      };
    });

    const totalAmount = items.reduce((sum, it) => sum + it.totalLigne, 0);
    const orderNum = `BC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: PurchaseOrder = {
      id: `ord_auto_${Date.now()}`,
      orderNumber: orderNum,
      supplier: supplierName,
      createdAt: new Date().toISOString(),
      status: 'brouillon',
      items,
      totalAmount,
      notes: `Génération automatique réapprovisionnement pour ${items.length} références en rupture / stock bas.`
    };

    onSaveOrder(newOrder);
    setIsAutoGenerateModalOpen(false);
    onShowToast(
      'Commande générée automatiquement',
      `Bon de commande ${orderNum} créé avec ${items.length} références (${formatMoney(totalAmount)}).`,
      'success'
    );
  };

  // Printable view copy
  const handleCopyOrderText = (order: PurchaseOrder) => {
    const textLines = [
      `PHARMACIE LAAFI ZANGA - BON DE COMMANDE FOURNISSEUR`,
      `N° Commande : ${order.orderNumber}`,
      `Date : ${formatDate(order.createdAt)}`,
      `Fournisseur : ${order.supplier}`,
      `Statut : ${order.status.toUpperCase()}`,
      `-------------------------------------------------------`,
      `RÉF\tDÉSIGNATION\tQTÉ\tP.U. (FCFA)\tTOTAL (FCFA)`
    ];

    order.items.forEach(it => {
      textLines.push(
        `#${it.productNo}\t${it.designation}\t${it.quantiteCommandee} u.\t${it.prixUnitaire}\t${it.totalLigne}`
      );
    });

    textLines.push(`-------------------------------------------------------`);
    textLines.push(`MONTANT TOTAL ESTIMÉ : ${formatMoney(order.totalAmount)}`);
    if (order.notes) {
      textLines.push(`Instructions : ${order.notes}`);
    }

    navigator.clipboard.writeText(textLines.join('\n'));
    onShowToast('Copié dans le presse-papier', 'Le bon de commande est prêt à être collé ou envoyé.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c1e] p-6 rounded-2xl border border-slate-200/90 dark:border-[#21373a] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Gestion des Commandes & Approvisionnements
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Créez des bons de commande auprès des grossistes (CAMEG, Sanofi, Denk Pharma), lancez le
            réapprovisionnement automatique des ruptures et réceptionnez les colis en stock en un clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAutoGenerateModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-teal-900/20 transition"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Réapprovisionnement Auto ({reorderCandidates.length})</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Bon de Commande</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c1e] border border-slate-200/80 dark:border-[#21373a] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Commandes</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Toutes sessions confondues</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c1e] border border-slate-200/80 dark:border-[#21373a] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <span>En attente / Envoyées</span>
            <Send className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {stats.envoyees + stats.brouillons}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.envoyees} en cours chez le grossiste</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c1e] border border-slate-200/80 dark:border-[#21373a] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <span>Réceptionnées en stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.receptionnees}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Créditées sur l'inventaire</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111c1e] border border-slate-200/80 dark:border-[#21373a] shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
            <span>Budget Engagé</span>
            <Building2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400 tabular-nums">
            {formatMoney(stats.totalEngage)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Bons en cours d'approvisionnement</div>
        </div>
      </div>

      {/* Orders Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#111c1e] p-4 rounded-2xl border border-slate-200/80 dark:border-[#21373a] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          {(
            [
              { id: 'tous', label: `Toutes (${orders.length})` },
              { id: 'brouillon', label: `Brouillons (${stats.brouillons})` },
              { id: 'envoyee', label: `Envoyées (${stats.envoyees})` },
              { id: 'receptionnee', label: `Réceptionnées (${stats.receptionnees})` }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher BC, fournisseur, produit..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200/80 dark:border-[#21373a] shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Aucun bon de commande trouvé
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Utilisez le bouton « Réapprovisionnement Auto » pour commander en un clic les produits en rupture,
              ou créez un bon manuellement.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs responsive-table">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-[#21373a]">
                <tr>
                  <th className="p-3.5">N° Bon</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Fournisseur</th>
                  <th className="p-3.5 text-center">Lignes</th>
                  <th className="p-3.5 text-right">Montant Total</th>
                  <th className="p-3.5 text-center">Statut</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredOrders.map(order => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-[10px] uppercase">
                      Brouillon
                    </span>
                  );
                  if (order.status === 'envoyee') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-bold text-[10px] uppercase">
                        Envoyée grossiste
                      </span>
                    );
                  } else if (order.status === 'receptionnee') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px] uppercase">
                        Réceptionnée
                      </span>
                    );
                  } else if (order.status === 'annulee') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-[10px] uppercase">
                        Annulée
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100" data-l="N° Bon">
                        <div className="flex items-center gap-1.5">
                          <span className="text-teal-600 dark:text-teal-400 font-mono font-extrabold">
                            {order.orderNumber}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500" data-l="Date">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200" data-l="Fournisseur">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{order.supplier}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center tabular-nums" data-l="Lignes">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">
                          {order.items.length} réf.
                        </span>
                      </td>
                      <td
                        className="p-3.5 text-right font-extrabold text-teal-700 dark:text-teal-400 tabular-nums"
                        data-l="Montant Total"
                      >
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="p-3.5 text-center" data-l="Statut">
                        {statusBadge}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1" data-l="Actions">
                        {/* 1-Click Receive Button if not already received */}
                        {order.status !== 'receptionnee' && order.status !== 'annulee' && (
                          <button
                            onClick={() => setIsReceivingModalOpen(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition shadow-sm"
                            title="Réceptionner la commande et incrémenter le stock"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Réceptionner</span>
                          </button>
                        )}

                        {/* View & Print Purchase Order */}
                        <button
                          onClick={() => setSelectedOrderForView(order)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                          title="Voir le bon de commande détaillé"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer le bon de commande ${order.orderNumber} ?`)) {
                              onDeleteOrder(order.id);
                              onShowToast('Bon supprimé', `Le bon ${order.orderNumber} a été effacé.`, 'info');
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 text-rose-600 transition"
                          title="Supprimer la commande"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE MANUAL ORDER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-white dark:bg-[#111c1e] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-teal-600" />
                  Nouveau Bon de Commande Fournisseur
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Préparez votre commande de réapprovisionnement pour la pharmacie
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Supplier Selection & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Fournisseur / Laboratoire
                  </label>
                  <select
                    value={orderSupplier}
                    onChange={e => setOrderSupplier(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {PHARMACY_SUPPLIERS.map(sup => (
                      <option key={sup.name} value={sup.name}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Notes / Instructions au grossiste
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="Ex: Livraison urgente matinée, bon de livraison exigé..."
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Add Line Form with autocomplete */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ajouter un comprimé au bon de commande :
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-8 relative">
                    <input
                      type="text"
                      value={selectedProductToAdd ? selectedProductToAdd.designation : itemSearch}
                      onChange={e => {
                        setItemSearch(e.target.value);
                        setSelectedProductToAdd(null);
                      }}
                      placeholder="Tapez le n° ou la désignation du comprimé..."
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                    />

                    {/* Autocomplete suggestions */}
                    {!selectedProductToAdd && itemSearchSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-12 z-20 bg-white dark:bg-[#111c1e] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {itemSearchSuggestions.map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProductToAdd(p);
                              setItemSearch('');
                            }}
                            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              #{p.no} {p.designation}
                            </span>
                            <span className="text-teal-600 font-bold tabular-nums">
                              {formatMoney(p.prixCession)} (stock: {p.quantite})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={itemQtyToAdd}
                      onChange={e => setItemQtyToAdd(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      placeholder="Qté"
                      className="w-full h-11 px-3 text-center font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItemToDraft}
                      disabled={!selectedProductToAdd}
                      className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs uppercase transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List in Draft */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Lignes de commande ({orderItems.length})</span>
                  <span className="text-teal-600 dark:text-teal-400 font-extrabold tabular-nums">
                    Total : {formatMoney(orderItems.reduce((s, it) => s + it.totalLigne, 0))}
                  </span>
                </div>

                {orderItems.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                    Aucun article ajouté. Utilisez le champ ci-dessus pour composer votre commande.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">Article</th>
                          <th className="p-2.5 text-center">Qté</th>
                          <th className="p-2.5 text-right">P.U.</th>
                          <th className="p-2.5 text-right">Total</th>
                          <th className="p-2.5 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {orderItems.map((it, idx) => (
                          <tr key={it.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                #{it.productNo} {it.designation}
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-bold">{it.quantiteCommandee} u.</td>
                            <td className="p-2.5 text-right text-slate-500 tabular-nums">
                              {formatMoney(it.prixUnitaire)}
                            </td>
                            <td className="p-2.5 text-right font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
                              {formatMoney(it.totalLigne)}
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromDraft(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleSaveDraft('brouillon')}
                className="h-10 px-4 rounded-xl border border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 font-bold text-xs uppercase tracking-wider"
              >
                Enregistrer Brouillon
              </button>
              <button
                type="button"
                onClick={() => handleSaveDraft('envoyee')}
                className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-900/20"
              >
                Enregistrer & Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AUTO-GENERATION MODAL */}
      {isAutoGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Générateur Automatique de Réapprovisionnement
                </h3>
                <p className="text-xs text-slate-500">
                  Calcul intelligent des besoins selon les ruptures et seuils d'alerte
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>État des stocks à réapprovisionner :</span>
              </div>
              <div>
                • <strong>{reorderCandidates.length}</strong> comprimés actuellement en rupture ou sous leur seuil
                d'alerte.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Fournisseur / Grossiste cible :
                </label>
                <select
                  value={autoGenSupplier}
                  onChange={e => setAutoGenSupplier(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="all">Tous les fournisseurs (Commande globale groupée)</option>
                  {PHARMACY_SUPPLIERS.map(sup => (
                    <option key={sup.name} value={sup.name}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Objectif de stock :
                </label>
                <select
                  value={autoGenTargetMultiplier}
                  onChange={e => setAutoGenTargetMultiplier(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value={1}>Atteindre le seuil d'alerte (Stock minimum)</option>
                  <option value={2}>Atteindre 2x le seuil d'alerte (Recommandé officine)</option>
                  <option value={3}>Atteindre 3x le seuil d'alerte (Sécurité renforcée)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAutoGenerateModalOpen(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerateReplenishmentOrder}
                className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-900/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Générer le Bon de Commande</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ONE-CLICK ORDER RECEIPT CONFIRMATION */}
      {isReceivingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Réception en Stock de la Commande
                </h3>
                <p className="text-xs text-slate-500">
                  Bon n° {isReceivingModalOpen.orderNumber} • {isReceivingModalOpen.supplier}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Confirmez-vous la livraison physique de ce colis à la pharmacie ? Cette action va :
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1 font-medium">
              <div>
                1. Incrémenter automatiquement le stock de{' '}
                <strong>{isReceivingModalOpen.items.length} références</strong>.
              </div>
              <div>
                2. Ajouter un mouvement d'audit « Entrée / Réception commande » dans le journal.
              </div>
              <div>
                3. Marquer le bon <strong>{isReceivingModalOpen.orderNumber}</strong> comme Réceptionné.
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-lg p-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              {isReceivingModalOpen.items.map(it => (
                <div key={it.productId} className="py-1 flex justify-between">
                  <span className="truncate max-w-[240px]">
                    #{it.productNo} {it.designation}
                  </span>
                  <span className="font-bold text-emerald-600">+{it.quantiteCommandee} u.</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsReceivingModalOpen(null)}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onReceiveOrder(isReceivingModalOpen);
                  setIsReceivingModalOpen(null);
                }}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-900/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider l'Entrée en Stock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAILED PURCHASE ORDER VIEW & PRINT SHEET */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
          <div className="w-full max-w-3xl bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl max-h-[92vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Bon de Commande Officiel : {selectedOrderForView.orderNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyOrderText(selectedOrderForView)}
                  className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier texte</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="h-9 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForView(null)}
                  className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Print Sheet Content */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
              {/* Header Pharmacy & Grossiste */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 dark:border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-teal-800 dark:text-teal-400">
                    Pharmacie Laafi Zanga
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                    Service Approvisionnement & Gestion du Stock de Comprimés
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Burkina Faso • Devise : Franc CFA (FCFA)</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">
                    {selectedOrderForView.orderNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Émis le : {formatDate(selectedOrderForView.createdAt)}
                  </div>
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1 uppercase">
                    Statut : {selectedOrderForView.status}
                  </div>
                </div>
              </div>

              {/* Recipient / Supplier Card */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Fournisseur / Grossiste :</span>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedOrderForView.supplier}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Lieu de livraison :</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    Comptoir Central Pharmacie Laafi Zanga
                  </div>
                  {selectedOrderForView.notes && (
                    <div className="text-[11px] text-slate-500 mt-1 italic">
                      Note : « {selectedOrderForView.notes} »
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3 w-14">N°</th>
                      <th className="p-3">Désignation Comprimé</th>
                      <th className="p-3 text-center">Quantité</th>
                      <th className="p-3 text-right">Prix Unitaire</th>
                      <th className="p-3 text-right">Montant Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {selectedOrderForView.items.map(it => (
                      <tr key={it.productId}>
                        <td className="p-3 text-slate-400 font-mono">#{it.productNo}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                          {it.designation}
                        </td>
                        <td className="p-3 text-center font-extrabold">{it.quantiteCommandee} u.</td>
                        <td className="p-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {formatMoney(it.prixUnitaire)}
                        </td>
                        <td className="p-3 text-right font-extrabold text-teal-700 dark:text-teal-400 tabular-nums">
                          {formatMoney(it.totalLigne)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-black border-t-2 border-slate-300 dark:border-slate-700">
                    <tr>
                      <td colSpan={4} className="p-3 text-right uppercase text-xs">
                        Montant Total Estimé de la Commande :
                      </td>
                      <td className="p-3 text-right text-base text-teal-700 dark:text-teal-400 tabular-nums">
                        {formatMoney(selectedOrderForView.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures Area */}
              <div className="pt-6 grid grid-cols-2 gap-12 text-xs">
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Pour la Pharmacie Laafi Zanga</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Le Pharmacien Responsable (Visa & Cachet)</div>
                  <div className="h-16"></div>
                </div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-right">
                  <div className="font-bold text-slate-700 dark:text-slate-300">Pour le Fournisseur</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Accusé de réception & Date de livraison</div>
                  <div className="h-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
