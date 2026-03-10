import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Settings2, X, Save, ChevronLeft, ChevronRight,
  Filter, Printer, RefreshCw, CheckCircle, AlertTriangle, Clock, Plus
} from 'lucide-react';
import { fetchConfigs, upsertConfig, fetchEntries, upsertEntry } from '../services/pmScheduleService';
import { isSupabaseConfigured } from '../lib/supabase';

// ==================== CONSTANTS ====================
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const WEEKS_PER_MONTH = 4;

const frequencyConfig = {
  '2month': { color: '#10B981', bg: 'rgba(16,185,129,0.8)', label_en: '2 Month', label_ar: 'شهرين', interval: 2, timesPerYear: 6 },
  '3month': { color: '#3B82F6', bg: 'rgba(59,130,246,0.8)', label_en: '3 Month', label_ar: '3 أشهر', interval: 3, timesPerYear: 4 },
  '4month': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.8)', label_en: '4 Month', label_ar: '4 أشهر', interval: 4, timesPerYear: 3 },
  '6month': { color: '#F59E0B', bg: 'rgba(245,158,11,0.8)', label_en: '6 Month', label_ar: '6 أشهر', interval: 6, timesPerYear: 2 },
  'annual': { color: '#EF4444', bg: 'rgba(239,68,68,0.8)', label_en: 'Annual', label_ar: 'سنوي', interval: 12, timesPerYear: 1 },
};

const entryStatusConfig = {
  planned: { color: '#6B7280', icon: Clock, label_en: 'Planned', label_ar: 'مخطط' },
  completed: { color: '#10B981', icon: CheckCircle, label_en: 'Completed', label_ar: 'مكتمل' },
  overdue: { color: '#EF4444', icon: AlertTriangle, label_en: 'Overdue', label_ar: 'متأخر' },
  skipped: { color: '#F59E0B', icon: X, label_en: 'Skipped', label_ar: 'تم تخطيه' },
};

// ==================== DEFAULT SCHEDULE DATA (FALLBACK) ====================
const defaultScheduleConfigs = [
  // 2-month (6x/year) machines
  { machine_id: 'CW4', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'CW5', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'CW6', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'CW7', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'IW6', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DRW1', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'BC1', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'SCR2', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DT1', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DT4', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DT2', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DT3', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'AR2', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'ST4', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DT7', pm_frequency: '2month', start_month: 2, pm_duration_weeks: 1 },
  { machine_id: 'DT8', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DT9', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DTA', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'DTU', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'ST6', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'ST5', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'XT4', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'XT3', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'XT6', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'XT8', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'XT9', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'XT10', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'XT11', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'CV2', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'CL4', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  { machine_id: 'CL1', pm_frequency: '2month', start_month: 1, pm_duration_weeks: 1 },
  // 4-month machines
  { machine_id: 'CVX', pm_frequency: '4month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'CV3', pm_frequency: '4month', start_month: 1, pm_duration_weeks: 2 },
  // 3-month machines
  { machine_id: 'XL1', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'TW11', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'TW12', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'TU1', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'XT2', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'CW3', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'PS1', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'XT12', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'XT1', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'LX2', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'PS7', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'BN7', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'BN10', pm_frequency: '3month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'LX3', pm_frequency: '3month', start_month: 2, pm_duration_weeks: 2 },
  { machine_id: 'AR3', pm_frequency: '4month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'CAR2', pm_frequency: '4month', start_month: 1, pm_duration_weeks: 2 },
  // 6-month machines
  { machine_id: 'RW3', pm_frequency: '6month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'RW1', pm_frequency: '6month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'RW2', pm_frequency: '6month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'CV1', pm_frequency: '6month', start_month: 2, pm_duration_weeks: 2 },
  { machine_id: 'RWT1', pm_frequency: '6month', start_month: 1, pm_duration_weeks: 2 },
  { machine_id: 'RW5', pm_frequency: '6month', start_month: 1, pm_duration_weeks: 2 },
  // Annual machines
  { machine_id: 'XL4', pm_frequency: 'annual', start_month: 3, pm_duration_weeks: 1 },
  { machine_id: 'BC2', pm_frequency: 'annual', start_month: 2, pm_duration_weeks: 1 },
  { machine_id: 'XL2', pm_frequency: 'annual', start_month: 6, pm_duration_weeks: 1 },
];

// ==================== SCHEDULE GENERATION ====================
const generateSchedule = (configs) => {
  const schedule = {};
  configs.forEach(cfg => {
    const { machine_id, pm_frequency, start_month, pm_duration_weeks } = cfg;
    const freq = frequencyConfig[pm_frequency];
    if (!freq) return;

    schedule[machine_id] = { config: cfg, cells: {} };

    let month = start_month;
    while (month <= 12) {
      const weekStart = 2; // Default to week 2
      for (let w = 0; w < pm_duration_weeks && (weekStart + w) <= WEEKS_PER_MONTH; w++) {
        const key = `${month}-${weekStart + w}`;
        schedule[machine_id].cells[key] = {
          month, week: weekStart + w,
          pm_frequency, status: 'planned',
        };
      }
      month += freq.interval;
    }
  });
  return schedule;
};

// ==================== LEGEND BAR ====================
const LegendBar = ({ isRTL, colors }) => (
  <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
    {Object.entries(frequencyConfig).map(([key, cfg]) => (
      <div key={key} className="flex items-center gap-2">
        <div className="w-6 h-4 rounded" style={{ background: cfg.bg }} />
        <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
          {isRTL ? cfg.label_ar : cfg.label_en}
        </span>
      </div>
    ))}
    <div className="border-l mx-2 h-4" style={{ borderColor: colors.border }} />
    {Object.entries(entryStatusConfig).map(([key, cfg]) => (
      <div key={key} className="flex items-center gap-1">
        <cfg.icon className="w-3 h-3" style={{ color: cfg.color }} />
        <span className="text-xs" style={{ color: colors.textSecondary }}>
          {isRTL ? cfg.label_ar : cfg.label_en}
        </span>
      </div>
    ))}
  </div>
);

// ==================== CONFIG MODAL ====================
const ConfigModal = ({ machine, config, onSave, onClose, isRTL, colors }) => {
  const [form, setForm] = useState({
    pm_frequency: config?.pm_frequency || '2month',
    start_month: config?.start_month || 1,
    pm_duration_weeks: config?.pm_duration_weeks || 1,
    notes: config?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, machine_id: machine });
  };

  const inputStyle = { background: colors.bgTertiary || colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="w-full max-w-md rounded-2xl p-6" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
            {isRTL ? `إعداد صيانة ${machine}` : `PM Config: ${machine}`}
          </h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: colors.textSecondary }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              {isRTL ? 'تكرار الصيانة' : 'PM Frequency'}
            </label>
            <select value={form.pm_frequency} onChange={e => setForm(p => ({ ...p, pm_frequency: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
              {Object.entries(frequencyConfig).map(([k, v]) => (
                <option key={k} value={k}>{isRTL ? v.label_ar : v.label_en} ({v.timesPerYear}x/{isRTL ? 'سنة' : 'year'})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'شهر البدء' : 'Start Month'}
              </label>
              <select value={form.start_month} onChange={e => setForm(p => ({ ...p, start_month: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                {MONTHS_EN.map((m, i) => <option key={i} value={i + 1}>{isRTL ? MONTHS_AR[i] : m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'المدة (أسابيع)' : 'Duration (weeks)'}
              </label>
              <select value={form.pm_duration_weeks} onChange={e => setForm(p => ({ ...p, pm_duration_weeks: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                {[1, 2, 3, 4].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
              {isRTL ? 'ملاحظات' : 'Notes'}
            </label>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: colors.bgTertiary || colors.bgSecondary, color: colors.textSecondary, border: `1px solid ${colors.border}` }}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #F39200, #CC7A00)' }}>
              <Save className="w-4 h-4" /> {isRTL ? 'حفظ' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ==================== CELL DETAIL POPOVER ====================
const CellPopover = ({ cell, machineId, onUpdate, onClose, isRTL, colors }) => {
  const [status, setStatus] = useState(cell?.status || 'planned');
  const freq = frequencyConfig[cell?.pm_frequency];

  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="absolute z-40 p-3 rounded-xl shadow-xl min-w-[200px]"
      style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, top: '100%', left: '50%', transform: 'translateX(-50%)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>{machineId}</span>
        <button onClick={onClose}><X className="w-3 h-3" style={{ color: colors.textSecondary }} /></button>
      </div>
      <div className="text-xs mb-2" style={{ color: colors.textSecondary }}>
        {isRTL ? MONTHS_AR[cell.month - 1] : MONTHS_EN[cell.month - 1]} - {isRTL ? `أسبوع ${cell.week}` : `Week ${cell.week}`}
      </div>
      {freq && (
        <div className="flex items-center gap-1 mb-3">
          <div className="w-3 h-3 rounded" style={{ background: freq.bg }} />
          <span className="text-xs" style={{ color: freq.color }}>{isRTL ? freq.label_ar : freq.label_en}</span>
        </div>
      )}
      <div className="space-y-1">
        {Object.entries(entryStatusConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => { setStatus(key); onUpdate(machineId, cell.month, cell.week, key); }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${status === key ? 'ring-1' : ''}`}
            style={{ background: status === key ? `${cfg.color}20` : 'transparent', color: cfg.color, ringColor: cfg.color }}>
            <cfg.icon className="w-3 h-3" />
            {isRTL ? cfg.label_ar : cfg.label_en}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
const PMSchedule = () => {
  const { machines, dbConnected } = useData();
  const { isRTL } = useLanguage();
  const { isDark, colors } = useTheme();

  const [year, setYear] = useState(2025);
  const [configs, setConfigs] = useState(defaultScheduleConfigs.map(c => ({ ...c, year: 2025 })));
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterArea, setFilterArea] = useState('');
  const [filterFreq, setFilterFreq] = useState('');
  const [configModal, setConfigModal] = useState(null);
  const [activeCell, setActiveCell] = useState(null);
  const [showAddConfig, setShowAddConfig] = useState(false);

  // Load from DB
  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured()) return;
      setLoading(true);
      try {
        const [cfgs, ents] = await Promise.all([fetchConfigs(year), fetchEntries(year)]);
        if (cfgs.length > 0) setConfigs(cfgs);
        if (ents.length > 0) setEntries(ents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  // Generate schedule from configs
  const schedule = useMemo(() => generateSchedule(configs), [configs]);

  // Apply entries (manual overrides) on top of generated schedule
  const scheduleWithEntries = useMemo(() => {
    const s = { ...schedule };
    entries.forEach(entry => {
      const mid = entry.machine_id;
      if (s[mid]) {
        const key = `${entry.month}-${entry.week}`;
        if (s[mid].cells[key]) {
          s[mid].cells[key] = { ...s[mid].cells[key], status: entry.status };
        }
      }
    });
    return s;
  }, [schedule, entries]);

  // Get unique machine list from configs (ordered)
  const scheduledMachines = useMemo(() => {
    const list = configs.map(c => ({
      id: c.machine_id,
      name: machines[c.machine_id]?.name || c.machine_id,
      area: machines[c.machine_id]?.area || '',
      frequency: c.pm_frequency,
    }));
    // Filter
    let filtered = list;
    if (filterArea) filtered = filtered.filter(m => m.area === filterArea);
    if (filterFreq) filtered = filtered.filter(m => m.frequency === filterFreq);
    return filtered;
  }, [configs, machines, filterArea, filterFreq]);

  // Areas for filter
  const areas = useMemo(() => {
    const set = new Set();
    configs.forEach(c => {
      const area = machines[c.machine_id]?.area;
      if (area) set.add(area);
    });
    return [...set].sort();
  }, [configs, machines]);

  // Stats
  const stats = useMemo(() => {
    let total = 0, completed = 0, planned = 0, overdue = 0;
    Object.values(scheduleWithEntries).forEach(m => {
      Object.values(m.cells).forEach(cell => {
        total++;
        if (cell.status === 'completed') completed++;
        else if (cell.status === 'overdue') overdue++;
        else planned++;
      });
    });
    return { total, completed, planned, overdue, machines: configs.length };
  }, [scheduleWithEntries, configs]);

  // Handle cell click
  const handleCellClick = useCallback((machineId, month, week) => {
    const key = `${machineId}-${month}-${week}`;
    setActiveCell(prev => prev === key ? null : key);
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(async (machineId, month, week, status) => {
    const entry = { machine_id: machineId, year, month, week, status };
    if (isSupabaseConfigured()) {
      await upsertEntry(entry);
    }
    // Update local
    setEntries(prev => {
      const idx = prev.findIndex(e => e.machine_id === machineId && e.month === month && e.week === week);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status };
        return updated;
      }
      return [...prev, entry];
    });
    setActiveCell(null);
  }, [year]);

  // Handle config save
  const handleConfigSave = useCallback(async (formData) => {
    const config = { ...formData, year };
    if (isSupabaseConfigured()) {
      await upsertConfig(config);
    }
    setConfigs(prev => {
      const idx = prev.findIndex(c => c.machine_id === config.machine_id && c.year === year);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...config };
        return updated;
      }
      return [...prev, config];
    });
    setConfigModal(null);
    setShowAddConfig(false);
  }, [year]);

  // Print
  const handlePrint = () => window.print();

  const inputStyle = { background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary };

  return (
    <div className="p-4 min-h-screen print:p-0 print:bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-4 print:mb-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <CalendarDays className="w-6 h-6" style={{ color: '#F39200' }} />
              {isRTL ? 'جدول الصيانة الوقائية السنوي' : 'PCP-Annual Preventive Maintenance Schedule'}
              <span className="text-lg" style={{ color: '#F39200' }}>{year}</span>
            </h1>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              {isRTL ? 'شركة الكابلات السعودية - صيانة المصنع' : 'Saudi Cable Company - Plant Maintenance'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap print:hidden">
            {/* Year selector */}
            <div className="flex items-center gap-1">
              <button onClick={() => setYear(y => y - 1)}
                className="p-1.5 rounded-lg" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
                <ChevronLeft className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </button>
              <span className="px-3 py-1.5 rounded-lg text-sm font-bold" style={{ background: colors.bgSecondary, color: '#F39200', border: `1px solid ${colors.border}` }}>
                {year}
              </span>
              <button onClick={() => setYear(y => y + 1)}
                className="p-1.5 rounded-lg" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
                <ChevronRight className="w-4 h-4" style={{ color: colors.textSecondary }} />
              </button>
            </div>
            {/* Filters */}
            <select value={filterArea} onChange={e => setFilterArea(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none" style={inputStyle}>
              <option value="">{isRTL ? 'كل المناطق' : 'All Areas'}</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterFreq} onChange={e => setFilterFreq(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none" style={inputStyle}>
              <option value="">{isRTL ? 'كل الترددات' : 'All Frequencies'}</option>
              {Object.entries(frequencyConfig).map(([k, v]) => (
                <option key={k} value={k}>{isRTL ? v.label_ar : v.label_en}</option>
              ))}
            </select>
            <button onClick={() => setShowAddConfig(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #F39200, #CC7A00)' }}>
              <Plus className="w-3 h-3" /> {isRTL ? 'إضافة ماكينة' : 'Add Machine'}
            </button>
            <button onClick={handlePrint}
              className="p-1.5 rounded-lg" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
              <Printer className="w-4 h-4" style={{ color: colors.textSecondary }} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3 print:hidden">
          {[
            { label: isRTL ? 'الماكينات' : 'Machines', value: stats.machines, color: '#F39200' },
            { label: isRTL ? 'إجمالي المهام' : 'Total Tasks', value: stats.total, color: '#3B82F6' },
            { label: isRTL ? 'مكتملة' : 'Completed', value: stats.completed, color: '#10B981' },
            { label: isRTL ? 'مخطط لها' : 'Planned', value: stats.planned, color: '#6B7280' },
            { label: isRTL ? 'متأخرة' : 'Overdue', value: stats.overdue, color: '#EF4444' },
          ].map((s, i) => (
            <div key={i} className="px-3 py-2 rounded-xl text-center" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
              <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px]" style={{ color: colors.textSecondary }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <LegendBar isRTL={isRTL} colors={colors} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#F39200' }} />
        </div>
      )}

      {/* Schedule Grid */}
      <div className="overflow-x-auto rounded-xl print:overflow-visible print:rounded-none" style={{ border: `1px solid ${colors.border}` }}>
        <table className="w-full border-collapse text-[10px] print:text-[8px]" style={{ minWidth: '1400px' }}>
          <thead>
            {/* Month headers */}
            <tr style={{ background: isDark ? '#1a1f35' : '#1e3a5f' }}>
              <th className="sticky left-0 z-20 px-1 py-1.5 text-center text-white font-bold" style={{ background: isDark ? '#1a1f35' : '#1e3a5f', width: '30px', minWidth: '30px' }}>
                #
              </th>
              <th className="sticky z-20 px-2 py-1.5 text-white font-bold" style={{ background: isDark ? '#1a1f35' : '#1e3a5f', left: '30px', width: '120px', minWidth: '120px', textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? 'الماكينة' : 'MACHINE'}
              </th>
              {MONTHS_EN.map((m, i) => (
                <th key={i} colSpan={WEEKS_PER_MONTH} className="px-1 py-1.5 text-center text-white font-bold border-l" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  {isRTL ? MONTHS_AR[i] : m.toUpperCase()}
                </th>
              ))}
              <th className="px-2 py-1.5 text-center text-white font-bold border-l" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '60px' }}>
                {isRTL ? 'ملاحظات' : 'REMARKS'}
              </th>
            </tr>
            {/* Week sub-headers */}
            <tr style={{ background: isDark ? '#252b45' : '#2a4a6f' }}>
              <th className="sticky left-0 z-20" style={{ background: isDark ? '#252b45' : '#2a4a6f' }} />
              <th className="sticky z-20" style={{ background: isDark ? '#252b45' : '#2a4a6f', left: '30px' }} />
              {Array.from({ length: 12 }).map((_, mi) =>
                Array.from({ length: WEEKS_PER_MONTH }).map((_, wi) => (
                  <th key={`${mi}-${wi}`} className="px-0.5 py-1 text-center text-white/60 text-[8px] border-l" style={{ borderColor: 'rgba(255,255,255,0.1)', width: '24px', minWidth: '24px' }}>
                    {wi + 1}
                  </th>
                ))
              )}
              <th className="border-l" style={{ borderColor: 'rgba(255,255,255,0.1)', background: isDark ? '#252b45' : '#2a4a6f' }} />
            </tr>
          </thead>
          <tbody>
            {scheduledMachines.map((machine, idx) => {
              const machineSchedule = scheduleWithEntries[machine.id];
              const freq = machineSchedule?.config?.pm_frequency;
              const freqCfg = freq ? frequencyConfig[freq] : null;

              return (
                <tr key={machine.id}
                  className="group transition-colors"
                  style={{
                    background: idx % 2 === 0 ? (isDark ? colors.bgPrimary : '#fff') : (isDark ? colors.bgSecondary : '#f8fafc'),
                    borderBottom: `1px solid ${colors.border}`,
                  }}>
                  {/* Row number */}
                  <td className="sticky left-0 z-10 px-1 py-1 text-center font-medium"
                    style={{ color: colors.textSecondary, background: 'inherit', borderRight: `1px solid ${colors.border}` }}>
                    {idx + 1}
                  </td>
                  {/* Machine name */}
                  <td className="sticky z-10 px-2 py-1 font-bold cursor-pointer hover:underline"
                    style={{ color: colors.textPrimary, left: '30px', background: 'inherit', borderRight: `1px solid ${colors.border}` }}
                    onClick={() => setConfigModal(machine.id)}>
                    {machine.id}
                  </td>
                  {/* Month cells */}
                  {Array.from({ length: 12 }).map((_, mi) =>
                    Array.from({ length: WEEKS_PER_MONTH }).map((_, wi) => {
                      const month = mi + 1;
                      const week = wi + 1;
                      const cellKey = `${month}-${week}`;
                      const cell = machineSchedule?.cells[cellKey];
                      const cellActiveKey = `${machine.id}-${month}-${week}`;
                      const isActive = activeCell === cellActiveKey;

                      return (
                        <td key={`${mi}-${wi}`}
                          className="relative px-0 py-0.5 text-center border-l"
                          style={{ borderColor: colors.border, height: '24px' }}>
                          {cell && (
                            <div
                              className="mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleCellClick(machine.id, month, week)}
                              style={{
                                width: '18px', height: '16px',
                                background: cell.status === 'completed' ? `${freqCfg?.color || '#6B7280'}` :
                                  cell.status === 'overdue' ? '#EF4444' :
                                    cell.status === 'skipped' ? '#F59E0B40' :
                                      freqCfg?.bg || '#6B7280',
                                opacity: cell.status === 'skipped' ? 0.4 : 1,
                                border: cell.status === 'completed' ? '2px solid white' : 'none',
                              }}
                              title={`${machine.id} - ${isRTL ? MONTHS_AR[mi] : MONTHS_EN[mi]} W${week} - ${cell.status}`}
                            />
                          )}
                          {/* Popover */}
                          <AnimatePresence>
                            {isActive && cell && (
                              <CellPopover
                                cell={cell}
                                machineId={machine.id}
                                onUpdate={handleStatusUpdate}
                                onClose={() => setActiveCell(null)}
                                isRTL={isRTL}
                                colors={colors}
                              />
                            )}
                          </AnimatePresence>
                        </td>
                      );
                    })
                  )}
                  {/* Remarks */}
                  <td className="px-1 py-1 text-center font-medium border-l"
                    style={{ color: freqCfg?.color || colors.textSecondary, borderColor: colors.border }}>
                    {freqCfg?.timesPerYear || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {scheduledMachines.length === 0 && !loading && (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 mx-auto mb-3" style={{ color: colors.textMuted }} />
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {isRTL ? 'لا توجد ماكينات مجدولة للصيانة' : 'No machines scheduled for maintenance'}
          </p>
        </div>
      )}

      {/* Footer notes (print) */}
      <div className="mt-3 text-[9px] space-y-0.5 print:block hidden" style={{ color: colors.textSecondary }}>
        <p>** The preventive maintenance monthly and weekly plan shall review and approve by planning department.</p>
        <p>** Preventive maintenance will depend on actual running hours.</p>
        <p>** PCP-Total machines 90. Machines not schedule this year by planning 4.</p>
      </div>

      {/* Config Modal */}
      <AnimatePresence>
        {configModal && (
          <ConfigModal
            machine={configModal}
            config={configs.find(c => c.machine_id === configModal)}
            onSave={handleConfigSave}
            onClose={() => setConfigModal(null)}
            isRTL={isRTL}
            colors={colors}
          />
        )}
      </AnimatePresence>

      {/* Add Machine Config Modal */}
      <AnimatePresence>
        {showAddConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-2xl p-6" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  {isRTL ? 'إضافة ماكينة للجدول' : 'Add Machine to Schedule'}
                </h3>
                <button onClick={() => setShowAddConfig(false)}><X className="w-5 h-5" style={{ color: colors.textSecondary }} /></button>
              </div>
              <AddMachineForm
                machines={machines}
                configs={configs}
                year={year}
                onSave={handleConfigSave}
                onClose={() => setShowAddConfig(false)}
                isRTL={isRTL}
                colors={colors}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .sticky { position: static !important; }
          table { font-size: 7px !important; }
        }
      `}</style>
    </div>
  );
};

// ==================== ADD MACHINE FORM ====================
const AddMachineForm = ({ machines, configs, year, onSave, onClose, isRTL, colors }) => {
  const [machineId, setMachineId] = useState('');
  const [pmFreq, setPmFreq] = useState('2month');
  const [startMonth, setStartMonth] = useState(1);
  const [duration, setDuration] = useState(1);

  const availableMachines = useMemo(() => {
    const scheduled = new Set(configs.map(c => c.machine_id));
    return Object.keys(machines).filter(id => !scheduled.has(id)).sort();
  }, [machines, configs]);

  const inputStyle = { background: colors.bgTertiary || colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!machineId) return;
    onSave({ machine_id: machineId, pm_frequency: pmFreq, start_month: startMonth, pm_duration_weeks: duration, year });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
          {isRTL ? 'الماكينة' : 'Machine'}
        </label>
        <select value={machineId} onChange={e => setMachineId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
          <option value="">{isRTL ? '-- اختر الماكينة --' : '-- Select Machine --'}</option>
          {availableMachines.map(id => (
            <option key={id} value={id}>{id} - {machines[id]?.name || ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
          {isRTL ? 'تكرار الصيانة' : 'PM Frequency'}
        </label>
        <select value={pmFreq} onChange={e => setPmFreq(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
          {Object.entries(frequencyConfig).map(([k, v]) => (
            <option key={k} value={k}>{isRTL ? v.label_ar : v.label_en} ({v.timesPerYear}x)</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
            {isRTL ? 'شهر البدء' : 'Start Month'}
          </label>
          <select value={startMonth} onChange={e => setStartMonth(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
            {MONTHS_EN.map((m, i) => <option key={i} value={i + 1}>{isRTL ? MONTHS_AR[i] : m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
            {isRTL ? 'المدة (أسابيع)' : 'Duration (weeks)'}
          </label>
          <select value={duration} onChange={e => setDuration(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
            {[1, 2, 3, 4].map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: colors.bgTertiary || colors.bgSecondary, color: colors.textSecondary, border: `1px solid ${colors.border}` }}>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </button>
        <button type="submit" disabled={!machineId}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #F39200, #CC7A00)', opacity: machineId ? 1 : 0.5 }}>
          <Plus className="w-4 h-4" /> {isRTL ? 'إضافة' : 'Add'}
        </button>
      </div>
    </form>
  );
};

export default PMSchedule;
