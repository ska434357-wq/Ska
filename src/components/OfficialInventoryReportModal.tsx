import React from 'react';
import { Printer, Copy, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';
import { Product } from '../data/initialProducts';

interface OfficialInventoryReportModalProps {
  products: Product[];
  physicalCounts: Record<number, number>;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const OfficialInventoryReportModal: React.FC<OfficialInventoryReportModalProps> = ({
  products,
  physicalCounts,
  isOpen,
  onClose,
  onShowToast
}) => {
  if (!isOpen) return null;

  const formatMoney = (val: number) => {
    return (
      new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        maximumFractionDigits: 0
      }).format(Math.round(val)) + ' FCFA'
    );
  };

  const currentDateFormatted = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date());

  // Statistics
  const totalReferences = products.length;
  const countedCount = Object.keys(physicalCounts).length;
  const completionRate = totalReferences > 0 ? (countedCount / totalReferences) * 100 : 0;

  let theoreticalValTotal = 0;
  let physicalValTotal = 0;
  let diffCount = 0;
  let exactCount = 0;
  let surplusCount = 0;
  let deficitCount = 0;
  let netVarianceUnits = 0;
  let netVarianceAmount = 0;

  const differencesList: Array<{
    product: Product;
    theorique: number;
    physique: number;
    diff: number;
    impact: number;
  }> = [];

  products.forEach(p => {
    const valTheorique = (p.quantite || 0) * (p.prixCession || 0);
    theoreticalValTotal += valTheorique;

    if (p.id in physicalCounts) {
      const counted = physicalCounts[p.id];
      const valPhysique = counted * (p.prixCession || 0);
      physicalValTotal += valPhysique;

      const diff = counted - p.quantite;
      const impact = diff * (p.prixCession || 0);

      if (diff !== 0) {
        diffCount++;
        netVarianceUnits += diff;
        netVarianceAmount += impact;
        if (diff > 0) surplusCount++;
        else deficitCount++;

        differencesList.push({
          product: p,
          theorique: p.quantite,
          physique: counted,
          diff,
          impact
        });
      } else {
        exactCount++;
      }
    } else {
      // Uncounted remains theoretical
      physicalValTotal += valTheorique;
    }
  });

  const accuracyRate = countedCount > 0 ? (exactCount / countedCount) * 100 : 100;

  // Copy text report
  const handleCopyReport = () => {
    const lines = [
      `=======================================================`,
      `PHARMACIE LAAFI ZANGA - PROCÈS-VERBAL D'INVENTAIRE OFFICIEL`,
      `Date et Heure : ${currentDateFormatted}`,
      `Réf. audit : PV-INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      `=======================================================`,
      `RÉSUMÉ CONTRÔLE :`,
      `- Références inventoriées : ${countedCount} / ${totalReferences} (${completionRate.toFixed(1)}%)`,
      `- Références conformes : ${exactCount} (${accuracyRate.toFixed(1)}%)`,
      `- Références avec écart : ${diffCount} (${surplusCount} excédents, ${deficitCount} déficits)`,
      `- Valeur théorique comptable : ${formatMoney(theoreticalValTotal)}`,
      `- Valeur physique constatée : ${formatMoney(physicalValTotal)}`,
      `- Écart financier net : ${netVarianceAmount >= 0 ? '+' : ''}${formatMoney(netVarianceAmount)}`,
      `=======================================================`,
      `DÉTAIL DES ÉCARTS CONSTATÉS :`,
      `N°\tDÉSIGNATION\tTHÉORIQUE\tPHYSIQUE\tÉCART\tIMPACT (FCFA)`
    ];

    differencesList.forEach(it => {
      lines.push(
        `#${it.product.no}\t${it.product.designation}\t${it.theorique} u.\t${it.physique} u.\t${it.diff > 0 ? '+' : ''}${it.diff}\t${formatMoney(it.impact)}`
      );
    });

    lines.push(`=======================================================`);
    lines.push(`Pharmacien Titulaire : ____________________`);
    lines.push(`Contrôleur d'inventaire : ____________________`);

    navigator.clipboard.writeText(lines.join('\n'));
    onShowToast('PV Copié', 'Le procès-verbal complet a été copié dans le presse-papier.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200 dark:border-[#21373a] shadow-2xl max-h-[94vh] flex flex-col">
        {/* Modal Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
              <FileText className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Procès-Verbal Officiel de Rapprochement d'Inventaire
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier le PV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="h-9 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le PV</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable PV Sheet */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-black uppercase tracking-wider text-teal-800 dark:text-teal-400">
                Pharmacie Laafi Zanga
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                Officine Pharmaceutique • Gestion du Stock Comprimés
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Burkina Faso • Devise : Franc CFA (FCFA)</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Procès-Verbal d'Inventaire Physique
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{currentDateFormatted}</div>
              <div className="text-[10px] text-teal-600 font-mono mt-0.5 font-bold">
                PV-INV-{new Date().getFullYear()}-{Date.now().toString().slice(-4)}
              </div>
            </div>
          </div>

          {/* Key Audit Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Taux Réalisation</div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                {completionRate.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {countedCount} / {totalReferences} réf. saisies
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Exactitude Rayon</div>
              <div className="text-xl font-black text-emerald-600 mt-1 tabular-nums">
                {accuracyRate.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{exactCount} réf. 100% conformes</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Valeur Constatée</div>
              <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                {formatMoney(physicalValTotal)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Théorique : {formatMoney(theoreticalValTotal)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Écart Net Officine</div>
              <div
                className={`text-lg font-black mt-1 tabular-nums ${
                  netVarianceAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {netVarianceAmount >= 0 ? '+' : ''}
                {formatMoney(netVarianceAmount)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {netVarianceUnits >= 0 ? `+${netVarianceUnits}` : netVarianceUnits} unités nettes
              </div>
            </div>
          </div>

          {/* Discrepancies Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Tableau des Écarts Constatés ({differencesList.length} anomalies) :</span>
              <span className="text-slate-500 text-[11px]">
                {surplusCount} excédents • {deficitCount} déficits
              </span>
            </div>

            {differencesList.length === 0 ? (
              <div className="p-8 text-center border border-slate-200 dark:border-slate-700 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tous les comprimés contrôlés sont parfaitement conformes au stock théorique.</span>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-2.5 w-14">N°</th>
                      <th className="p-2.5">Désignation</th>
                      <th className="p-2.5 text-right">Théorique</th>
                      <th className="p-2.5 text-right">Compté</th>
                      <th className="p-2.5 text-right">Écart Unités</th>
                      <th className="p-2.5 text-right">Impact Financier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {differencesList.map(it => (
                      <tr key={it.product.id}>
                        <td className="p-2.5 text-slate-400 font-mono">#{it.product.no}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">
                          {it.product.designation}
                        </td>
                        <td className="p-2.5 text-right tabular-nums text-slate-500">
                          {it.theorique} u.
                        </td>
                        <td className="p-2.5 text-right tabular-nums font-bold">{it.physique} u.</td>
                        <td
                          className={`p-2.5 text-right tabular-nums font-bold ${
                            it.diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {it.diff > 0 ? `+${it.diff}` : it.diff}
                        </td>
                        <td
                          className={`p-2.5 text-right tabular-nums font-extrabold ${
                            it.impact >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {it.impact >= 0 ? '+' : ''}
                          {formatMoney(it.impact)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Formal Certification Statement & Signatures */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">
              Attestation de Contrôle & Conformité Pharmaceutique :
            </div>
            <p>
              Je soussigné, Pharmacien Responsable de la Pharmacie Laafi Zanga, certifie avoir procédé au comptage
              physique effectif des comprimés mentionnés ci-dessus aux dates et heures indiquées, et valide
              l'application des écritures d'ajustement comptable de stock.
            </p>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-12 text-xs">
            <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">L'Équipe de Comptage Rayon</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Signature(s) des préparateurs</div>
              <div className="h-16"></div>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-700 pt-2 text-right">
              <div className="font-bold text-slate-800 dark:text-slate-200">Le Pharmacien Titulaire</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Visa d'approbation & Cachet officiel</div>
              <div className="h-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
