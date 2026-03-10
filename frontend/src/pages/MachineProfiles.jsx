/**
 * Machine Profiles — List Page
 * Displays all 78 machines with their profile completion and assessment score
 * Bilingual: Arabic / English
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProfiles, getProfileCompleteness } from '../services/machineProfileService';
import {
  Search, Filter, ChevronRight, ChevronLeft,
  AlertTriangle, CheckCircle, Clock, XCircle,
  Factory, Wrench, DollarSign, Shield, Star,
  Monitor, BarChart2, RefreshCw, TrendingUp,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CLASS_CONFIG = {
  A: { label: { en: 'Critical',   ar: 'حرجة'    }, color: '#EF4444', bg: 'rgba(239,68,68,0.15)'   },
  B: { label: { en: 'Important',  ar: 'مهمة'    }, color: '#F97316', bg: 'rgba(249,115,22,0.15)'  },
  C: { label: { en: 'Standard',   ar: 'عادية'   }, color: '#EAB308', bg: 'rgba(234,179,8,0.15)'   },
  D: { label: { en: 'Low',        ar: 'منخفضة'  }, color: '#22C55E', bg: 'rgba(34,197,94,0.15)'   },
};

const STATUS_CONFIG = {
  Active:          { en: 'Active',         ar: 'نشطة',        color: '#22C55E', dot: '#22C55E' },
  'Low Utilization':{ en: 'Low Util.',     ar: 'استخدام منخفض', color: '#EAB308', dot: '#EAB308' },
  Dormant:         { en: 'Dormant',        ar: 'خاملة',        color: '#EF4444', dot: '#EF4444' },
  Standby:         { en: 'Standby',        ar: 'احتياطية',     color: '#94A3B8', dot: '#94A3B8' },
};

const DIM_ICONS = {
  maintenance: Wrench,
  finance:     DollarSign,
  production:  Factory,
  hse:         Shield,
  quality:     Star,
  it_sap:      Monitor,
};

const DIM_COLORS = {
  maintenance: '#F39200',
  finance:     '#3B82F6',
  production:  '#10B981',
  hse:         '#EF4444',
  quality:     '#8B5CF6',
  it_sap:      '#06B6D4',
};

const DIM_LABELS = {
  maintenance: { en: 'Maint.',     ar: 'صيانة'   },
  finance:     { en: 'Finance',    ar: 'مالية'   },
  production:  { en: 'Prod.',      ar: 'إنتاج'   },
  hse:         { en: 'HSE',        ar: 'HSE'     },
  quality:     { en: 'Quality',    ar: 'جودة'    },
  it_sap:      { en: 'IT/SAP',     ar: 'IT/SAP'  },
};

const DIM_STATUS_COLORS = {
  pending:   '#6B7280',
  in_review: '#EAB308',
  submitted: '#3B82F6',
  approved:  '#22C55E',
  rejected:  '#EF4444',
};

// ─── Score Gauge ──────────────────────────────────────────────────────────────
const ScoreGauge = ({ score, cls }) => {
  if (!score) return <span className="text-gray-500 text-xs">—</span>;
  const cfg = CLASS_CONFIG[cls] || CLASS_CONFIG.C;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
        style={{ borderColor: cfg.color, color: cfg.color, background: cfg.bg }}
      >
        {score.toFixed(1)}
      </div>
      <span
        className="text-xs font-semibold px-1.5 py-0.5 rounded"
        style={{ color: cfg.color, background: cfg.bg }}
      >
        {cls}
      </span>
    </div>
  );
};

// ─── Dimension Badge ──────────────────────────────────────────────────────────
const DimBadge = ({ dim, status, isRTL }) => {
  const Icon  = DIM_ICONS[dim];
  const color = DIM_STATUS_COLORS[status] || '#6B7280';
  const dimColor = DIM_COLORS[dim];
  return (
    <div
      title={`${dim}: ${status}`}
      className="w-6 h-6 rounded flex items-center justify-center relative"
      style={{ background: `${dimColor}22`, border: `1px solid ${dimColor}55` }}
    >
      <Icon className="w-3 h-3" style={{ color: dimColor }} />
      <div
        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#1a1d23]"
        style={{ background: color }}
      />
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ pct, approved, total }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: pct === 100 ? '#22C55E' : pct >= 50 ? '#F39200' : '#EF4444',
        }}
      />
    </div>
    <span className="text-[10px] text-gray-400 whitespace-nowrap">{approved}/{total}</span>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const MachineProfiles = () => {
  const { isRTL } = useLanguage();
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  const [profiles, setProfiles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setStatus] = useState('all');
  const [filterClass, setClass]   = useState('all');
  const [filterDim, setDim]       = useState('all');

  const t = (en, ar) => isRTL ? ar : en;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAllProfiles();
      setProfiles(data);
      setLoading(false);
    })();
  }, []);

  // ── Computed profiles with completeness ──────────────────────────────────
  const enriched = useMemo(() =>
    profiles.map(p => ({ ...p, completeness: getProfileCompleteness(p) })),
    [profiles]
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = enriched.length;
    const complete = enriched.filter(p => p.completeness.status === 'complete').length;
    const inProg   = enriched.filter(p => p.completeness.status === 'in_progress').length;
    const byClass  = { A: 0, B: 0, C: 0, D: 0 };
    enriched.forEach(p => { if (p.completeness.overall_class) byClass[p.completeness.overall_class]++; });
    return { total, complete, inProg, pending: total - complete - inProg, byClass };
  }, [enriched]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched.filter(p => {
      if (q && !p.machine_id.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      if (filterStatus !== 'all' && p.operational_status !== filterStatus) return false;
      if (filterClass  !== 'all' && p.inherent_class !== filterClass)      return false;
      if (filterDim !== 'all') {
        const dimStatus = p.dimensions[filterDim]?.status;
        if (dimStatus !== filterDim + '_filter') return true; // custom filter logic below
      }
      return true;
    });
  }, [enriched, search, filterStatus, filterClass, filterDim]);

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>{t('Loading profiles...', 'جارٍ تحميل البروفايلات...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('Machine Profiles', 'بروفايلات الآلات')}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {t(
              'Multi-dimensional assessment for all factory equipment',
              'تقييم متعدد الأبعاد لجميع معدات المصنع'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t('78 machines · 4 primary + 2 optional dimensions', '78 آلة · 4 أبعاد أساسية + 2 اختيارية')}</span>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="col-span-2 lg:col-span-2 p-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F39200]/20 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-[#F39200]" />
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-400">{t('Total Machines', 'إجمالي الآلات')}</p>
          </div>
          <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-right`}>
            <p className="text-sm font-semibold text-green-400">{stats.complete} <span className="text-xs text-gray-400">{t('complete', 'مكتمل')}</span></p>
            <p className="text-sm font-semibold text-yellow-400">{stats.inProg} <span className="text-xs text-gray-400">{t('in progress', 'قيد التقييم')}</span></p>
            <p className="text-sm font-semibold text-gray-400">{stats.pending} <span className="text-xs text-gray-400">{t('pending', 'معلق')}</span></p>
          </div>
        </div>

        {/* Class A */}
        {['A','B','C','D'].map(cls => {
          const cfg = CLASS_CONFIG[cls];
          return (
            <div
              key={cls}
              className="p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all hover:scale-105"
              style={{ borderColor: `${cfg.color}40`, background: cfg.bg }}
              onClick={() => setClass(filterClass === cls ? 'all' : cls)}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold" style={{ color: cfg.color }}>Class {cls}</span>
                <span className="text-2xl font-black" style={{ color: cfg.color }}>{stats.byClass[cls]}</span>
              </div>
              <p className="text-xs" style={{ color: cfg.color }}>{cfg.label[isRTL ? 'ar' : 'en']}</p>
            </div>
          );
        })}
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('Search machine ID or description...', 'ابحث برقم الآلة أو الوصف...')}
            className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F39200]/50`}
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none"
        >
          <option value="all">{t('All Statuses', 'جميع الحالات')}</option>
          {Object.keys(STATUS_CONFIG).map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s][isRTL ? 'ar' : 'en']}</option>
          ))}
        </select>

        {/* Class filter */}
        <select
          value={filterClass}
          onChange={e => setClass(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none"
        >
          <option value="all">{t('All Classes', 'جميع الفئات')}</option>
          {['A','B','C','D'].map(c => (
            <option key={c} value={c}>Class {c} — {CLASS_CONFIG[c].label[isRTL ? 'ar' : 'en']}</option>
          ))}
        </select>

        <span className="text-xs text-gray-500">{t(`${filtered.length} results`, `${filtered.length} نتيجة`)}</span>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {/* Table Header */}
        <div
          className="grid gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
          style={{
            background: 'rgba(255,255,255,0.03)',
            gridTemplateColumns: 'auto 1fr 120px 90px 180px 100px 60px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span>{t('Machine', 'الآلة')}</span>
          <span>{t('Description', 'الوصف')}</span>
          <span>{t('Op. Status', 'الحالة')}</span>
          <span>{t('Score', 'السكور')}</span>
          <span>{t('Dimensions', 'الأبعاد')}</span>
          <span>{t('Progress', 'التقدم')}</span>
          <span></span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          <AnimatePresence>
            {filtered.map((p, idx) => {
              const comp   = p.completeness;
              const opStat = STATUS_CONFIG[p.operational_status] || STATUS_CONFIG.Standby;
              return (
                <motion.div
                  key={p.machine_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.015 }}
                  onClick={() => navigate(`/machineProfiles/${p.machine_id}`)}
                  className="grid gap-4 px-4 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors items-center group"
                  style={{ gridTemplateColumns: 'auto 1fr 120px 90px 180px 100px 60px' }}
                >
                  {/* Machine ID */}
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{p.machine_id}</span>
                    <span className="text-[10px] text-gray-500">{p.section}</span>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-gray-300 truncate max-w-[280px]">{p.description}</p>
                    <p className="text-[10px] text-gray-500">{p.manufacturer} · {p.country_of_origin || p.manufacturer}</p>
                  </div>

                  {/* Operational Status */}
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                      style={{ color: opStat.color, background: `${opStat.color}22` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: opStat.dot }} />
                      {opStat[isRTL ? 'ar' : 'en']}
                    </span>
                  </div>

                  {/* Score */}
                  <div>
                    <ScoreGauge score={comp.overall_score} cls={comp.overall_class} />
                  </div>

                  {/* Dimension badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['maintenance','finance','production','hse','quality','it_sap'].map(dim => (
                      <DimBadge
                        key={dim}
                        dim={dim}
                        status={p.dimensions[dim]?.status || 'pending'}
                        isRTL={isRTL}
                      />
                    ))}
                  </div>

                  {/* Progress */}
                  <ProgressBar
                    pct={comp.completePct}
                    approved={comp.primaryApproved}
                    total={comp.primaryTotal}
                  />

                  {/* Arrow */}
                  <div className={`flex justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <ArrowIcon className="w-4 h-4 text-[#F39200]" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <Factory className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{t('No machines found', 'لا توجد آلات')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-6 text-xs text-gray-500 border-t border-white/5 pt-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-400">{t('Dimension Status:', 'حالة الأبعاد:')}</span>
          {Object.entries(DIM_STATUS_COLORS).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              {t(s, s)}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-400">{t('Class:', 'الفئة:')}</span>
          {Object.entries(CLASS_CONFIG).map(([cls, cfg]) => (
            <span key={cls} className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: cfg.bg, color: cfg.color }}>{cls}</span>
              {cfg.label[isRTL ? 'ar' : 'en']}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MachineProfiles;
