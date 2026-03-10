/**
 * Dashboard — Machine Profiles Control Center
 * Main landing page: stats + department entry cards + quick overview
 * Bilingual: Arabic / English
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllProfiles, getProfileCompleteness } from '../services/machineProfileService';
import {
  Wrench, DollarSign, Factory, Shield, Star, Monitor,
  BarChart2, CheckCircle, Clock, AlertCircle, ArrowRight,
  ArrowLeft, TrendingUp, Activity, Layers, ChevronRight,
  ChevronLeft, RefreshCw, Zap,
} from 'lucide-react';

// ─── Department Config ────────────────────────────────────────────────────────
const DEPARTMENTS = [
  {
    id: 'maintenance',
    icon: Wrench,
    color: '#F39200',
    glow: 'rgba(243,146,0,0.3)',
    gradient: 'from-[#F39200]/20 to-[#F39200]/5',
    border: 'border-[#F39200]/30',
    en: 'Maintenance',
    ar: 'الصيانة',
    desc_en: 'Equipment health & upkeep',
    desc_ar: 'صحة المعدات والصيانة',
    weight: '30%',
    primary: true,
  },
  {
    id: 'finance',
    icon: DollarSign,
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.3)',
    gradient: 'from-[#818CF8]/20 to-[#818CF8]/5',
    border: 'border-[#818CF8]/30',
    en: 'Finance',
    ar: 'المالية',
    desc_en: 'Asset value & cost analysis',
    desc_ar: 'قيمة الأصول وتحليل التكاليف',
    weight: '25%',
    primary: true,
  },
  {
    id: 'production',
    icon: Factory,
    color: '#34D399',
    glow: 'rgba(52,211,153,0.3)',
    gradient: 'from-[#34D399]/20 to-[#34D399]/5',
    border: 'border-[#34D399]/30',
    en: 'Production',
    ar: 'الإنتاج',
    desc_en: 'Output & efficiency metrics',
    desc_ar: 'مقاييس الإنتاج والكفاءة',
    weight: '30%',
    primary: true,
  },
  {
    id: 'hse',
    icon: Shield,
    color: '#F87171',
    glow: 'rgba(248,113,113,0.3)',
    gradient: 'from-[#F87171]/20 to-[#F87171]/5',
    border: 'border-[#F87171]/30',
    en: 'HSE',
    ar: 'الصحة والسلامة',
    desc_en: 'Health, Safety & Environment',
    desc_ar: 'الصحة والسلامة والبيئة',
    weight: '15%',
    primary: true,
  },
  {
    id: 'quality',
    icon: Star,
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.3)',
    gradient: 'from-[#60A5FA]/20 to-[#60A5FA]/5',
    border: 'border-[#60A5FA]/30',
    en: 'Quality',
    ar: 'الجودة',
    desc_en: 'Quality standards & compliance',
    desc_ar: 'معايير الجودة والامتثال',
    weight: null,
    primary: false,
  },
  {
    id: 'it_sap',
    icon: Monitor,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.3)',
    gradient: 'from-[#A78BFA]/20 to-[#A78BFA]/5',
    border: 'border-[#A78BFA]/30',
    en: 'IT / SAP',
    ar: 'IT / SAP',
    desc_en: 'Systems & digital integration',
    desc_ar: 'الأنظمة والتكامل الرقمي',
    weight: null,
    primary: false,
  },
];

const CLASS_CONFIG = {
  A: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', label_en: 'Critical', label_ar: 'حرجة' },
  B: { color: '#F97316', bg: 'rgba(249,115,22,0.15)', label_en: 'Important', label_ar: 'مهمة' },
  C: { color: '#EAB308', bg: 'rgba(234,179,8,0.15)', label_en: 'Standard', label_ar: 'عادية' },
  D: { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', label_en: 'Low', label_ar: 'منخفضة' },
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, duration = 1.2 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display}</span>;
};

// ─── Ring Progress ─────────────────────────────────────────────────────────────
const RingProgress = ({ pct, color, size = 56, stroke = 5 }) => {
  const r  = (size - stroke * 2) / 2;
  const c  = Math.PI * 2 * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
    </svg>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    className="relative p-5 rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden group hover:border-white/20 transition-all"
  >
    {/* Glow blob */}
    <div
      className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
      style={{ background: color }}
    />
    <div className="relative flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-3xl font-black text-white leading-none">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  </motion.div>
);

// ─── Class Bar ────────────────────────────────────────────────────────────────
const ClassBar = ({ byClass, total, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="p-5 rounded-2xl border border-white/10 bg-white/[0.04]"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-300">{t('Class Distribution', 'توزيع الفئات')}</p>
        <span className="text-xs text-gray-500">{total} {t('machines', 'آلة')}</span>
      </div>
      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-white/5">
        {['A', 'B', 'C', 'D'].map(cls => {
          const pct = total > 0 ? (byClass[cls] / total) * 100 : 25;
          return (
            <motion.div
              key={cls}
              className="h-full"
              style={{ background: CLASS_CONFIG[cls].color, width: `${pct}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.5 + ['A','B','C','D'].indexOf(cls) * 0.1, duration: 0.6 }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['A', 'B', 'C', 'D'].map(cls => {
          const cfg = CLASS_CONFIG[cls];
          return (
            <div key={cls} className="text-center">
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mb-1"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}50` }}>
                {cls}
              </div>
              <p className="text-lg font-bold text-white">{byClass[cls]}</p>
              <p className="text-[10px] text-gray-500">{isRTL ? cfg.label_ar : cfg.label_en}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── Department Card ──────────────────────────────────────────────────────────
const DeptCard = ({ dept, approved, total, pct, onClick, isRTL, delay = 0 }) => {
  const Icon = dept.icon;
  const t = (en, ar) => isRTL ? ar : en;
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl border ${dept.border} bg-gradient-to-br ${dept.gradient} cursor-pointer overflow-hidden group`}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ boxShadow: `inset 0 0 40px ${dept.glow}` }}
      />
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${dept.color}22`, border: `1px solid ${dept.color}44` }}>
              <Icon className="w-5 h-5" style={{ color: dept.color }} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{t(dept.en, dept.ar)}</p>
              <p className="text-[10px] text-gray-400">{t(dept.desc_en, dept.desc_ar)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs" style={{ color: dept.color }}>{t('Enter', 'إدخال')}</span>
            <ArrowIcon className="w-3.5 h-3.5" style={{ color: dept.color }} />
          </div>
        </div>

        {/* Ring + stats */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <RingProgress pct={pct} color={dept.color} size={52} stroke={4} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{pct}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-end gap-1 mb-1">
              <span className="text-2xl font-black text-white">{approved}</span>
              <span className="text-sm text-gray-400 pb-0.5">/ {total}</span>
            </div>
            <p className="text-[11px] text-gray-400">{t('machines approved', 'آلة معتمدة')}</p>
            {dept.weight && (
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: `${dept.color}22`, color: dept.color }}>
                {t(`Weight: ${dept.weight}`, `الوزن: ${dept.weight}`)}
              </span>
            )}
            {!dept.weight && (
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                {t('Optional', 'اختياري')}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Mini Machine Row ─────────────────────────────────────────────────────────
const MiniMachineRow = ({ profile, completeness, onClick, isRTL, delay = 0 }) => {
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  const statusColor = completeness.status === 'complete' ? '#22C55E' : completeness.status === 'in_progress' ? '#F39200' : '#6B7280';
  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] cursor-pointer group transition-colors rounded-xl"
    >
      <div className="w-8 h-8 rounded-lg bg-[#F39200]/10 border border-[#F39200]/20 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-[#F39200]">{profile.machine_id.split('-')[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{profile.machine_id}</p>
        <p className="text-[10px] text-gray-500 truncate">{profile.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex gap-0.5">
          {['maintenance','finance','production','hse'].map(d => (
            <div key={d} className="w-1.5 h-4 rounded-full"
              style={{ background: profile.dimensions[d]?.status === 'approved' ? statusColor : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <span className="text-[10px] font-mono text-gray-500">{completeness.completePct}%</span>
        <ArrowIcon className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { isRTL } = useLanguage();
  const navigate  = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);

  const t = (en, ar) => isRTL ? ar : en;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAllProfiles();
      setProfiles(data);
      setLoading(false);
    })();
  }, []);

  const enriched = useMemo(() =>
    profiles.map(p => ({ ...p, completeness: getProfileCompleteness(p) })),
    [profiles]
  );

  const stats = useMemo(() => {
    const total    = enriched.length;
    const complete = enriched.filter(p => p.completeness.status === 'complete').length;
    const inProg   = enriched.filter(p => p.completeness.status === 'in_progress').length;
    const pending  = total - complete - inProg;
    const byClass  = { A: 0, B: 0, C: 0, D: 0 };
    enriched.forEach(p => { if (p.completeness.overall_class) byClass[p.completeness.overall_class]++; });

    // Per-dimension stats
    const deptStats = {};
    DEPARTMENTS.forEach(d => {
      const approved = enriched.filter(p => p.dimensions[d.id]?.status === 'approved').length;
      const submitted = enriched.filter(p => p.dimensions[d.id]?.status === 'submitted').length;
      deptStats[d.id] = {
        approved,
        submitted,
        total,
        pct: total > 0 ? Math.round((approved / total) * 100) : 0,
      };
    });

    return { total, complete, inProg, pending, byClass, deptStats };
  }, [enriched]);

  // Sort: in_progress first, then pending
  const featuredMachines = useMemo(() => {
    return [...enriched]
      .sort((a, b) => {
        const order = { in_progress: 0, pending: 1, complete: 2 };
        return (order[a.completeness.status] ?? 3) - (order[b.completeness.status] ?? 3);
      })
      .slice(0, 8);
  }, [enriched]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <RefreshCw className="w-6 h-6 text-[#F39200]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1400px]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#F39200]/20 border border-[#F39200]/40 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-[#F39200]" />
            </div>
            <h1 className="text-2xl font-black text-white">
              {t('Control Center', 'مركز التحكم')}
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            {t(
              'Machine profiles multi-dimensional assessment system',
              'نظام التقييم متعدد الأبعاد لبروفايلات الآلات'
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/machineProfiles')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F39200]/10 border border-[#F39200]/30 text-[#F39200] text-sm font-medium hover:bg-[#F39200]/20 transition-colors"
        >
          <Layers className="w-4 h-4" />
          {t('All Machines', 'كل الآلات')}
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </motion.button>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity}    value={stats.total}    label={t('Total Machines','إجمالي الآلات')}    color="#F39200" delay={0.0} />
        <StatCard icon={CheckCircle} value={stats.complete} label={t('Completed Profiles','بروفايلات مكتملة')} color="#22C55E" delay={0.1} />
        <StatCard icon={Clock}       value={stats.inProg}   label={t('In Progress','قيد التقييم')}         color="#EAB308" delay={0.2} />
        <StatCard icon={AlertCircle} value={stats.pending}  label={t('Pending','معلقة')}                    color="#6B7280" delay={0.3} />
      </div>

      {/* ── Class Distribution ──────────────────────────────────── */}
      <ClassBar byClass={stats.byClass} total={stats.total} isRTL={isRTL} />

      {/* ── Department Entry Grid ───────────────────────────────── */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-300">{t('Department Entry', 'إدخال الإدارات')}</p>
          </div>
          <p className="text-xs text-gray-500">
            {t('Click a department to enter assessment data', 'اضغط على الإدارة لإدخال بيانات التقييم')}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept, i) => (
            <DeptCard
              key={dept.id}
              dept={dept}
              approved={stats.deptStats[dept.id]?.approved ?? 0}
              total={stats.total}
              pct={stats.deptStats[dept.id]?.pct ?? 0}
              onClick={() => navigate(`/dept/${dept.id}`)}
              isRTL={isRTL}
              delay={0.45 + i * 0.07}
            />
          ))}
        </div>
      </div>

      {/* ── Machine Overview ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-300">{t('Machine Overview', 'نظرة عامة على الآلات')}</p>
          </div>
          <button
            onClick={() => navigate('/machineProfiles')}
            className="flex items-center gap-1 text-xs text-[#F39200] hover:text-[#F39200]/80 transition-colors"
          >
            {t('View All', 'عرض الكل')}
            {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {featuredMachines.map((p, i) => (
            <MiniMachineRow
              key={p.machine_id}
              profile={p}
              completeness={p.completeness}
              onClick={() => navigate(`/machineProfiles/${p.machine_id}`)}
              isRTL={isRTL}
              delay={0.9 + i * 0.04}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default Dashboard;
