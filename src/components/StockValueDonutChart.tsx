import React, { useState, useMemo } from 'react';
import { PieChart, Layers, Building2, TrendingUp, Info } from 'lucide-react';
import { Product } from '../data/initialProducts';
import {
  PHARMACY_CATEGORIES,
  PHARMACY_SUPPLIERS,
  getProductCategory,
  getProductSupplier
} from '../utils/pharmacyClassification';

interface StockValueDonutChartProps {
  products: Product[];
  onSelectCategory?: (categoryName: string) => void;
}

type GroupingMode = 'category' | 'supplier';

interface SegmentData {
  id: string;
  name: string;
  value: number; // Valeur financière en FCFA
  units: number; // Quantité totale d'unités
  productCount: number; // Nombre de références
  color: string;
  percentage: number;
}

export const StockValueDonutChart: React.FC<StockValueDonutChartProps> = ({
  products,
  onSelectCategory
}) => {
  const [mode, setMode] = useState<GroupingMode>('category');
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  // Currency Formatter
  const formatMoney = (amount: number): string => {
    return (
      new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }).format(amount) + ' FCFA'
    );
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Compute aggregated distribution based on selected grouping mode
  const { segments, totalValue, totalUnits } = useMemo(() => {
    let totVal = 0;
    let totUnits = 0;

    const groupMap = new Map<
      string,
      { name: string; value: number; units: number; count: number; color: string }
    >();

    // Initialize with standard metadata
    if (mode === 'category') {
      PHARMACY_CATEGORIES.forEach(c => {
        groupMap.set(c.name, {
          name: c.name,
          value: 0,
          units: 0,
          count: 0,
          color: c.color
        });
      });
    } else {
      PHARMACY_SUPPLIERS.forEach(s => {
        groupMap.set(s.name, {
          name: s.name,
          value: 0,
          units: 0,
          count: 0,
          color: s.color
        });
      });
    }

    products.forEach(p => {
      const val = (p.quantite || 0) * (p.prixCession || 0);
      totVal += val;
      totUnits += p.quantite || 0;

      const groupName =
        mode === 'category'
          ? getProductCategory(p.designation, p.categorie)
          : getProductSupplier(p.designation, p.fournisseur, p.id);

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          name: groupName,
          value: 0,
          units: 0,
          count: 0,
          color: '#64748b'
        });
      }

      const entry = groupMap.get(groupName)!;
      entry.value += val;
      entry.units += p.quantite || 0;
      entry.count += 1;
    });

    // Convert map to sorted segments
    const segList: SegmentData[] = [];
    groupMap.forEach((data, id) => {
      // Include all segments that have products, or at least show relevant groups
      if (data.count > 0 || data.value > 0) {
        const pct = totVal > 0 ? (data.value / totVal) * 100 : 0;
        segList.push({
          id,
          name: data.name,
          value: data.value,
          units: data.units,
          productCount: data.count,
          color: data.color,
          percentage: pct
        });
      }
    });

    // Sort by financial value descending, then by product count
    segList.sort((a, b) => b.value - a.value || b.productCount - a.productCount);

    return {
      segments: segList,
      totalValue: totVal,
      totalUnits: totUnits
    };
  }, [products, mode]);

  // SVG Geometry Constants
  const size = 320;
  const center = size / 2;
  const outerRadius = 135;
  const innerRadius = 86;
  const padAngle = 0.02; // Small aesthetic gap between slices

  // Calculate SVG arc paths
  const arcPaths = useMemo(() => {
    let currentAngle = -Math.PI / 2; // Start from top (12 o'clock)
    const total = segments.reduce((sum, s) => sum + (s.value > 0 ? s.value : 0.001), 0);

    return segments.map((seg, idx) => {
      const segVal = seg.value > 0 ? seg.value : 0.001;
      const angleDelta = (segVal / (total || 1)) * 2 * Math.PI;
      const startAngle = currentAngle + padAngle / 2;
      const endAngle = currentAngle + angleDelta - padAngle / 2;
      currentAngle += angleDelta;

      // Mid angle for hover radial translation
      const midAngle = (startAngle + endAngle) / 2;
      const hoverOffset = activeSegmentIndex === idx ? 7 : 0;
      const offsetX = Math.cos(midAngle) * hoverOffset;
      const offsetY = Math.sin(midAngle) * hoverOffset;

      // Coordinates
      const x1 = center + outerRadius * Math.cos(startAngle) + offsetX;
      const y1 = center + outerRadius * Math.sin(startAngle) + offsetY;
      const x2 = center + outerRadius * Math.cos(endAngle) + offsetX;
      const y2 = center + outerRadius * Math.sin(endAngle) + offsetY;

      const x3 = center + innerRadius * Math.cos(endAngle) + offsetX;
      const y3 = center + innerRadius * Math.sin(endAngle) + offsetY;
      const x4 = center + innerRadius * Math.cos(startAngle) + offsetX;
      const y4 = center + innerRadius * Math.sin(startAngle) + offsetY;

      const largeArcFlag = angleDelta > Math.PI ? 1 : 0;

      const d = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      return {
        d,
        color: seg.color,
        name: seg.name,
        percentage: seg.percentage,
        value: seg.value,
        units: seg.units,
        productCount: seg.productCount,
        midAngle
      };
    });
  }, [segments, activeSegmentIndex]);

  // Focused Segment
  const focusedSegment =
    activeSegmentIndex !== null && segments[activeSegmentIndex]
      ? segments[activeSegmentIndex]
      : null;

  return (
    <div className="bg-white dark:bg-[#111c1e] rounded-2xl border border-slate-200/80 dark:border-[#21373a] p-5 sm:p-6 shadow-sm transition-all">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Répartition financière de la valeur en stock
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Survolez ou cliquez sur les segments pour inspecter le volume monétaire et la composition
          </p>
        </div>

        {/* Mode Switcher Button Group */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200/50 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => {
              setMode('category');
              setActiveSegmentIndex(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'category'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Par Catégorie Thérapeutique</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('supplier');
              setActiveSegmentIndex(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'supplier'
                ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Par Fournisseur / Laboratoire</span>
          </button>
        </div>
      </div>

      {/* Main Content: SVG Donut + Interactive Breakdown Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        {/* Left: SVG Donut Visualizer */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full transform transition-all duration-300 drop-shadow-sm"
            >
              <defs>
                <filter id="donutShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Background ring placeholder */}
              <circle
                cx={center}
                cy={center}
                r={(outerRadius + innerRadius) / 2}
                fill="none"
                stroke="currentColor"
                strokeWidth={outerRadius - innerRadius}
                className="text-slate-100 dark:text-slate-800/40"
              />

              {/* Interactive Slices */}
              {arcPaths.map((arc, idx) => {
                const isActive = activeSegmentIndex === idx;
                return (
                  <path
                    key={idx}
                    d={arc.d}
                    fill={arc.color}
                    filter={isActive ? 'url(#donutShadow)' : undefined}
                    className="cursor-pointer transition-all duration-200 hover:opacity-95"
                    style={{
                      opacity: activeSegmentIndex === null || isActive ? 1 : 0.45,
                      transformOrigin: `${center}px ${center}px`
                    }}
                    onMouseEnter={() => setActiveSegmentIndex(idx)}
                    onMouseLeave={() => setActiveSegmentIndex(null)}
                    onClick={() => onSelectCategory && onSelectCategory(arc.name)}
                  />
                );
              })}
            </svg>

            {/* Central KPI Hole Overlay */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4 transition-all duration-200"
              style={{
                width: `${innerRadius * 1.8}px`,
                height: `${innerRadius * 1.8}px`,
                margin: 'auto'
              }}
            >
              {focusedSegment ? (
                <>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[140px]">
                    {focusedSegment.name}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-tight mt-0.5">
                    {formatMoney(focusedSegment.value)}
                  </span>
                  <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
                    {focusedSegment.percentage.toFixed(1)}% du stock
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {formatNumber(focusedSegment.productCount)} réf. • {formatNumber(focusedSegment.units)} u.
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                    Valeur Totale
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#0b3b36] dark:text-teal-300 tabular-nums leading-tight mt-0.5">
                    {formatMoney(totalValue)}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums mt-0.5">
                    {formatNumber(totalUnits)} unités
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {products.length} comprimés
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Cliquez sur un segment pour filtrer le catalogue</span>
          </div>
        </div>

        {/* Right: Interactive Legend & Share Table */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>{mode === 'category' ? 'Catégorie Thérapeutique' : 'Fournisseur / Laboratoire'}</span>
            <div className="flex items-center gap-6">
              <span className="hidden sm:inline">Références</span>
              <span>Valeur (FCFA)</span>
              <span className="w-12 text-right">Part</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {segments.map((seg, idx) => {
              const isActive = activeSegmentIndex === idx;
              return (
                <div
                  key={seg.id}
                  onMouseEnter={() => setActiveSegmentIndex(idx)}
                  onMouseLeave={() => setActiveSegmentIndex(null)}
                  onClick={() => onSelectCategory && onSelectCategory(seg.name)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isActive
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500/40 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {seg.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 font-medium">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline tabular-nums">
                        {seg.productCount} réf. ({seg.units} u.)
                      </span>
                      <strong className="text-slate-900 dark:text-slate-100 font-bold tabular-nums">
                        {formatMoney(seg.value)}
                      </strong>
                      <span className="w-12 text-right text-xs font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                        {seg.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Proportional visual bar */}
                  <div className="w-full h-1.5 bg-slate-200/70 dark:bg-slate-700/70 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(seg.percentage, 1)}%`,
                        backgroundColor: seg.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Insights Strip */}
          {segments.length > 0 && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Catégorie la plus valorisée :{' '}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {segments[0]?.name}
                  </strong>{' '}
                  ({segments[0]?.percentage.toFixed(1)}% de la valeur totale)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums font-semibold">
                Moyenne : {formatMoney(totalValue / (products.length || 1))} / réf.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
