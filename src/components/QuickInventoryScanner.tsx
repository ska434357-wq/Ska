import React, { useState, useMemo } from 'react';
import {
  Scan,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { Product } from '../data/initialProducts';
import { getProductCategory, getProductSupplier } from '../utils/pharmacyClassification';

interface QuickInventoryScannerProps {
  products: Product[];
  physicalCounts: Record<number, number>;
  onUpdateCount: (productId: number, count: number) => void;
  onClearCount: (productId: number) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const QuickInventoryScanner: React.FC<QuickInventoryScannerProps> = ({
  products,
  physicalCounts,
  onUpdateCount,
  onClearCount,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(products[0]?.id || null);
  const [manualCountInput, setManualCountInput] = useState<string>('');

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0] || null;
  }, [products, selectedProductId]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return products
      .filter(p => p.designation.toLowerCase().includes(q) || p.no.toString().includes(q))
      .slice(0, 5);
  }, [searchTerm, products]);

  const currentCount = selectedProduct && selectedProduct.id in physicalCounts
    ? physicalCounts[selectedProduct.id]
    : null;

  const currentDiff = selectedProduct && currentCount !== null
    ? currentCount - selectedProduct.quantite
    : null;

  // Add quantity
  const handleAdd = (delta: number) => {
    if (!selectedProduct) return;
    const base = currentCount !== null ? currentCount : 0;
    const nextVal = Math.max(0, base + delta);
    onUpdateCount(selectedProduct.id, nextVal);
    setManualCountInput(String(nextVal));
  };

  // Mark identical to theoretical stock (1-click compliant)
  const handleMarkConforme = () => {
    if (!selectedProduct) return;
    onUpdateCount(selectedProduct.id, selectedProduct.quantite);
    setManualCountInput(String(selectedProduct.quantite));
    onShowToast(
      'Comptage Conforme',
      `#${selectedProduct.no} ${selectedProduct.designation} marqué conforme (${selectedProduct.quantite} u.).`,
      'info'
    );
  };

  // Next product in sequence
  const handleNextProduct = () => {
    if (!selectedProduct) return;
    const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
    const nextIndex = (currentIndex + 1) % products.length;
    setSelectedProductId(products[nextIndex].id);
    const nextP = products[nextIndex];
    setManualCountInput(nextP.id in physicalCounts ? String(physicalCounts[nextP.id]) : '');
    setSearchTerm('');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#0b3b36] to-[#0f4c45] text-white rounded-2xl p-5 shadow-xl border border-teal-500/30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Saisie Rapide & Scanner de Rayon
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 uppercase">
                Mode Officine Express
              </span>
            </div>
            <p className="text-xs text-teal-100/80 mt-0.5">
              Recherchez un comprimé ou tapez son n°, ajustez au toucher (+1, +5, +10...) et passez au suivant sans souris.
            </p>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par n° ou nom de comprimé..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-white placeholder-teal-200/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white/15"
          />

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-11 z-30 bg-[#0f2e2b] border border-teal-500/40 rounded-xl shadow-2xl overflow-hidden divide-y divide-white/10">
              {searchResults.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setManualCountInput(p.id in physicalCounts ? String(physicalCounts[p.id]) : '');
                    setSearchTerm('');
                  }}
                  className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <span className="font-bold text-white truncate max-w-[200px]">
                    #{p.no} {p.designation}
                  </span>
                  <span className="text-teal-300 font-mono text-[11px] tabular-nums">
                    Théorique : {p.quantite} u.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Product Control Board */}
      {selectedProduct && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Product Info */}
          <div className="md:col-span-5 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-400/30">
                #{selectedProduct.no}
              </span>
              <span className="text-[11px] text-teal-200/70 truncate">
                {getProductCategory(selectedProduct.designation, selectedProduct.categorie)}
              </span>
            </div>
            <div className="text-base font-extrabold text-white truncate" title={selectedProduct.designation}>
              {selectedProduct.designation}
            </div>
            <div className="flex items-center gap-3 text-xs text-teal-100/90 pt-1">
              <span>
                Stock théorique : <strong className="text-white tabular-nums">{selectedProduct.quantite} u.</strong>
              </span>
              <span>•</span>
              <span>
                Prix cession : <strong>{selectedProduct.prixCession} FCFA</strong>
              </span>
            </div>
          </div>

          {/* Touch Count Buttons */}
          <div className="md:col-span-4 flex flex-wrap items-center gap-1.5">
            {[1, 5, 10, 50].map(step => (
              <button
                key={step}
                type="button"
                onClick={() => handleAdd(step)}
                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold text-teal-200 transition border border-white/15 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>{step}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={handleMarkConforme}
              className="h-9 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 active:scale-95 text-xs font-extrabold transition flex items-center gap-1 shadow-sm"
              title="Copier le stock théorique en 1 clic"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Conforme ({selectedProduct.quantite})</span>
            </button>
          </div>

          {/* Saisie Directe & Diff Status */}
          <div className="md:col-span-3 flex items-center gap-2 justify-end">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={
                    manualCountInput !== ''
                      ? manualCountInput
                      : currentCount !== null
                      ? currentCount
                      : ''
                  }
                  onChange={e => {
                    const val = e.target.value;
                    setManualCountInput(val);
                    if (val === '') {
                      onClearCount(selectedProduct.id);
                    } else {
                      onUpdateCount(selectedProduct.id, Math.max(0, parseInt(val, 10) || 0));
                    }
                  }}
                  placeholder="Compté"
                  className="w-20 h-10 px-2 text-right font-black rounded-xl bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-400 outline-none tabular-nums"
                />

                <button
                  type="button"
                  onClick={handleNextProduct}
                  className="h-10 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase flex items-center gap-1 transition shadow-sm"
                  title="Valider et passer à la référence suivante"
                >
                  <span>Suivant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Instant discrepancy status */}
              <div className="mt-1">
                {currentDiff === null ? (
                  <span className="text-[10px] text-teal-200/60">Non encore saisi</span>
                ) : currentDiff === 0 ? (
                  <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Conforme (0 écart)
                  </span>
                ) : currentDiff > 0 ? (
                  <span className="text-[10px] text-emerald-300 font-bold">
                    +{currentDiff} u. excédent (+{currentDiff * (selectedProduct.prixCession || 0)} FCFA)
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-300 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {currentDiff} u. manquant ({currentDiff * (selectedProduct.prixCession || 0)} FCFA)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
