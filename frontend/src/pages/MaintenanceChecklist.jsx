/**
 * Maintenance Checklist Page - Matches PDF format exactly
 * Preventive Maintenance Check List - Table format with color-coded actions
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Save, ChevronDown, ChevronUp,
  ClipboardCheck, Wrench, Zap, Calendar, User,
  CheckCircle, AlertTriangle, Eye, Trash2, RefreshCw,
  Settings2, ChevronRight, Clock, Printer, FileText,
  ArrowLeft, ArrowRight, Upload
} from 'lucide-react';
import {
  fetchSessions, createSessionFromTemplate, updateSession, deleteSession,
  fetchItemsBySession, updateItem,
  fetchTemplatesByMachine, addTemplateBatch, deleteTemplatesByMachine
} from '../services/checklistService';
import { isSupabaseConfigured } from '../lib/supabase';

// Action color mapping (matches PDF exactly)
const actionColors = {
  pending: { bg: '#FFFFFF', text: '#6B7280', label_en: 'Pending', label_ar: 'معلق' },
  checked_ok: { bg: '#92D050', text: '#1a1a1a', label_en: 'Checked ok', label_ar: 'تم الفحص' },
  needs_repair: { bg: '#FF0000', text: '#FFFFFF', label_en: 'Needs Repair', label_ar: 'يحتاج إصلاح' },
  replaced: { bg: '#FFC000', text: '#1a1a1a', label_en: 'Replaced/Changed', label_ar: 'تم الاستبدال' },
  under_observation: { bg: '#FFFF00', text: '#1a1a1a', label_en: 'Under Observation', label_ar: 'تحت المراقبة' },
};

const priorityOptions = [
  { value: '', label_en: '-', label_ar: '-', color: '#6B7280' },
  { value: 'low', label_en: 'Low', label_ar: 'منخفضة', color: '#10B981' },
  { value: 'medium', label_en: 'Medium', label_ar: 'متوسطة', color: '#F59E0B' },
  { value: 'high', label_en: 'High', label_ar: 'عالية', color: '#F97316' },
  { value: 'critical', label_en: 'Critical', label_ar: 'حرجة', color: '#EF4444' },
];

// ==================== MAIN PAGE ====================
const MaintenanceChecklist = () => {
  const { machines, dbConnected, employees } = useData();
  const { isRTL } = useLanguage();
  const { isDark, colors } = useTheme();

  const [view, setView] = useState('list');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionItems, setSessionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMachine, setFilterMachine] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const machineList = useMemo(() =>
    Object.values(machines).sort((a, b) => a.id.localeCompare(b.id)),
    [machines]
  );

  const loadSessions = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const filters = {};
      if (filterMachine) filters.machineId = filterMachine;
      if (filterStatus) filters.status = filterStatus;
      const data = await fetchSessions(filters);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterMachine, filterStatus]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const openSession = useCallback(async (session) => {
    setLoading(true);
    try {
      const items = await fetchItemsBySession(session.id);
      setSessionItems(items);
      setSelectedSession(session);
      setView('session');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteSession = useCallback(async (id) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(isRTL ? 'فشل في الحذف' : 'Failed to delete');
    }
  }, [isRTL]);

  if (!dbConnected) {
    return (
      <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto text-center p-8 rounded-2xl" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#F59E0B' }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>
            {isRTL ? 'يتطلب اتصال بقاعدة البيانات' : 'Database Connection Required'}
          </h2>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {isRTL ? 'الشيك ليست يتطلب ربط Supabase.' : 'Checklists require Supabase connection.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <SessionList
            key="list"
            sessions={sessions}
            loading={loading}
            machineList={machineList}
            filterMachine={filterMachine}
            filterStatus={filterStatus}
            setFilterMachine={setFilterMachine}
            setFilterStatus={setFilterStatus}
            onOpen={openSession}
            onDelete={handleDeleteSession}
            onNew={() => setView('new')}
            onTemplates={() => setView('templates')}
            isRTL={isRTL}
            isDark={isDark}
            colors={colors}
          />
        )}
        {view === 'new' && (
          <NewSession
            key="new"
            machineList={machineList}
            employees={employees}
            onCreated={(session) => { loadSessions(); openSession(session); }}
            onBack={() => setView('list')}
            isRTL={isRTL}
            isDark={isDark}
            colors={colors}
          />
        )}
        {view === 'session' && selectedSession && (
          <ChecklistView
            key="session"
            session={selectedSession}
            items={sessionItems}
            setItems={setSessionItems}
            machines={machines}
            onBack={() => { setView('list'); setSelectedSession(null); loadSessions(); }}
            onComplete={async () => {
              await updateSession(selectedSession.id, { status: 'completed' });
              setSelectedSession(prev => ({ ...prev, status: 'completed' }));
            }}
            isRTL={isRTL}
            isDark={isDark}
            colors={colors}
          />
        )}
        {view === 'templates' && (
          <TemplateManager
            key="templates"
            machineList={machineList}
            onBack={() => setView('list')}
            isRTL={isRTL}
            isDark={isDark}
            colors={colors}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== SESSION LIST ====================
const SessionList = ({ sessions, loading, machineList, filterMachine, filterStatus, setFilterMachine, setFilterStatus, onOpen, onDelete, onNew, onTemplates, isRTL, isDark, colors }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>
            <ClipboardCheck className="w-7 h-7" style={{ color: '#F39200' }} />
            {isRTL ? 'شيك ليست الصيانة الوقائية' : 'Preventive Maintenance Check List'}
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            {isRTL ? 'فحص وصيانة المكائن - Mechanical & Electrical' : 'Machine inspection & maintenance - Mechanical & Electrical'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onTemplates}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: colors.bgSecondary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
            <Settings2 className="w-4 h-4" />
            {isRTL ? 'القوالب' : 'Templates'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)' }}>
            <Plus className="w-4 h-4" />
            {isRTL ? 'شيك ليست جديدة' : 'New Checklist'}
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={filterMachine} onChange={e => setFilterMachine(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}>
          <option value="">{isRTL ? 'جميع المكائن' : 'All Machines'}</option>
          {machineList.map(m => <option key={m.id} value={m.id}>{m.id} - {m.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}>
          <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
          <option value="in_progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</option>
          <option value="completed">{isRTL ? 'مكتملة' : 'Completed'}</option>
        </select>
      </div>

      {/* Sessions */}
      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#F39200' }} /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12" style={{ color: colors.textMuted }}>
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">{isRTL ? 'لا توجد شيك ليستات' : 'No checklists yet'}</p>
          <p className="text-sm mt-1">{isRTL ? 'أنشئ شيك ليست جديدة للبدء' : 'Create a new checklist to get started'}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sessions.map(s => (
            <motion.div key={s.id} whileHover={{ scale: 1.005 }}
              className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
              onClick={() => onOpen(s)}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-lg" style={{ color: '#F39200' }}>{s.machine_id}</span>
                  <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{s.machines?.name || ''}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: s.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: s.status === 'completed' ? '#10B981' : '#F59E0B'
                    }}>
                    {s.status === 'completed' ? (isRTL ? 'مكتملة' : 'Completed') : (isRTL ? 'قيد التنفيذ' : 'In Progress')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: colors.textMuted }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.checklist_date}</span>
                  {s.order_no && <span className="font-medium">Order: {s.order_no}</span>}
                  {s.notification_no && <span>Notif: {s.notification_no}</span>}
                  {s.prepared_by && <span className="flex items-center gap-1"><User className="w-3 h-3" />{s.prepared_by}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s.id); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} /></button>
                <ChevronRight className="w-5 h-5" style={{ color: colors.textMuted }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="p-6 rounded-2xl max-w-sm w-full"
              style={{ background: colors.bgPrimary, border: `1px solid ${colors.border}` }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>{isRTL ? 'حذف الشيك ليست؟' : 'Delete Checklist?'}</h3>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-xl text-sm"
                  style={{ background: colors.bgSecondary, color: colors.textPrimary }}>{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
                  className="flex-1 px-4 py-2 rounded-xl text-sm text-white" style={{ background: '#EF4444' }}>{isRTL ? 'حذف' : 'Delete'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== NEW SESSION ====================
const NewSession = ({ machineList, employees = [], onCreated, onBack, isRTL, isDark, colors }) => {
  const [machineId, setMachineId] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [notificationNo, setNotificationNo] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleCreate = async () => {
    if (!machineId) { alert(isRTL ? 'اختر ماكينة' : 'Select a machine'); return; }
    setSaving(true);
    try {
      const session = await createSessionFromTemplate(machineId, { orderNo, notificationNo, preparedBy, date });
      if (session) onCreated(session);
    } catch (err) {
      alert(isRTL ? 'فشل في الإنشاء. تأكد من وجود قالب للماكينة.' : 'Failed to create. Make sure a template exists for this machine.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border}`, color: colors.textPrimary };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium" style={{ color: '#F39200' }}>
        <BackArrow className="w-4 h-4" />
        {isRTL ? 'رجوع للقائمة' : 'Back to List'}
      </button>

      <h1 className="text-2xl font-bold" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>
        {isRTL ? 'شيك ليست صيانة جديدة' : 'New Preventive Maintenance Check List'}
      </h1>

      <div className="max-w-lg space-y-4 p-6 rounded-2xl" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>{isRTL ? 'اختر الماكينة *' : 'Select Machine *'}</label>
          <select value={machineId} onChange={e => setMachineId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
            <option value="">{isRTL ? '-- اختر الماكينة --' : '-- Select Machine --'}</option>
            {machineList.map(m => <option key={m.id} value={m.id}>{m.id} - {m.name || m.type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>{isRTL ? 'التاريخ' : 'Date'}</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Order No</label>
            <input type="text" value={orderNo} onChange={e => setOrderNo(e.target.value)}
              placeholder="e.g. 4127072"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>Notification No</label>
            <input type="text" value={notificationNo} onChange={e => setNotificationNo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>{isRTL ? 'أعده' : 'Prepared By'}</label>
          <select value={preparedBy} onChange={e => setPreparedBy(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
            <option value="">{isRTL ? '-- اختر --' : '-- Select --'}</option>
            {employees
              .filter(emp => emp.status === 'active')
              .map(emp => (
                <option key={emp.id || emp.employee_id} value={isRTL ? emp.name_ar : emp.name_en}>
                  {emp.employee_id} - {isRTL ? emp.name_ar : emp.name_en}
                </option>
              ))}
          </select>
        </div>
        <button onClick={handleCreate} disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)', opacity: saving ? 0.6 : 1 }}>
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء الشيك ليست' : 'Create Checklist')}
        </button>
      </div>
    </motion.div>
  );
};

// ==================== CHECKLIST VIEW (PDF-style table) ====================
const ChecklistView = ({ session, items, setItems, machines, onBack, onComplete, isRTL, isDark, colors }) => {
  const [activeTab, setActiveTab] = useState('mechanical');
  const [editingItemId, setEditingItemId] = useState(null);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const machineInfo = machines[session.machine_id] || {};

  const filteredItems = useMemo(() => items.filter(i => i.list_type === activeTab), [items, activeTab]);

  // Group items by equipment
  const grouped = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const key = `${item.equipment_no}`;
      if (!groups[key]) groups[key] = { no: item.equipment_no, name: item.equipment_name, items: [] };
      groups[key].items.push(item);
    });
    return Object.values(groups).sort((a, b) => a.no - b.no);
  }, [filteredItems]);

  const stats = useMemo(() => ({
    total: items.length,
    done: items.filter(i => i.status !== 'pending').length,
    ok: items.filter(i => i.status === 'checked_ok').length,
    repair: items.filter(i => i.status === 'needs_repair').length,
    observation: items.filter(i => i.status === 'under_observation').length,
    replaced: items.filter(i => i.status === 'replaced').length,
  }), [items]);

  const handleUpdateItem = useCallback(async (id, updates) => {
    // Optimistic UI: update immediately, then sync with server
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    setEditingItemId(null);
    try {
      const updated = await updateItem(id, updates);
      if (updated) setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err) {
      console.error(err);
      // Revert on error would be nice but not critical for now
    }
  }, [setItems]);

  // Cycle through statuses on click - optimistic update
  const cycleStatus = useCallback((item) => {
    const statusOrder = ['pending', 'checked_ok', 'needs_repair', 'replaced', 'under_observation'];
    const currentIdx = statusOrder.indexOf(item.status);
    const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
    // Update UI instantly, server sync in background
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: nextStatus } : i));
    updateItem(item.id, { status: nextStatus }).catch(err => console.error(err));
  }, [setItems]);

  const thStyle = {
    padding: '8px 10px',
    fontWeight: '600',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    borderBottom: `2px solid ${isDark ? '#555' : '#999'}`,
    borderRight: `1px solid ${isDark ? '#444' : '#ddd'}`,
    textAlign: isRTL ? 'right' : 'left',
  };

  const tdStyle = {
    padding: '6px 8px',
    fontSize: '12px',
    borderBottom: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
    borderRight: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
    verticalAlign: 'top',
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium" style={{ color: '#F39200' }}>
          <BackArrow className="w-4 h-4" />
          {isRTL ? 'رجوع للقائمة' : 'Back to List'}
        </button>
        <div className="flex gap-2">
          {session.status !== 'completed' && (
            <button onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: '#10B981' }}>
              <CheckCircle className="w-4 h-4" />
              {isRTL ? 'إكمال الشيك ليست' : 'Complete Checklist'}
            </button>
          )}
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: colors.bgSecondary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
            <Printer className="w-4 h-4" />
            {isRTL ? 'طباعة' : 'Print'}
          </button>
        </div>
      </div>

      {/* Checklist Header (like PDF) */}
      <div className="rounded-xl overflow-hidden" style={{ border: `2px solid ${isDark ? '#555' : '#333'}` }}>
        {/* Title Banner */}
        <div className="text-center py-3" style={{ background: isDark ? '#333' : '#2E2D2C' }}>
          <h2 className="text-lg font-bold text-white">Preventive Maintenance Check List</h2>
          <p className="text-sm text-white/90 mt-1">
            {machineInfo.name || session.machine_id} {machineInfo.description ? `(${machineInfo.manufacturer || ''})` : ''}
          </p>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-2 text-sm" style={{ borderBottom: `1px solid ${isDark ? '#444' : '#ccc'}` }}>
          <div className="p-3" style={{ borderRight: `1px solid ${isDark ? '#444' : '#ccc'}` }}>
            <span style={{ color: colors.textMuted }}>Machine: </span>
            <span className="font-bold" style={{ color: '#F39200' }}>{session.machine_id}</span>
            <span className="mx-2" style={{ color: colors.textMuted }}>|</span>
            <span style={{ color: colors.textPrimary }}>{machineInfo.name || ''}</span>
          </div>
          <div className="p-3">
            <span style={{ color: colors.textMuted }}>Order No: </span>
            <span className="font-bold" style={{ color: colors.textPrimary }}>{session.order_no || '-'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 text-sm" style={{ borderBottom: `1px solid ${isDark ? '#444' : '#ccc'}` }}>
          <div className="p-3" style={{ borderRight: `1px solid ${isDark ? '#444' : '#ccc'}` }}>
            <span style={{ color: colors.textMuted }}>Date: </span>
            <span className="font-bold" style={{ color: colors.textPrimary }}>{session.checklist_date || '-'}</span>
          </div>
          <div className="p-3">
            <span style={{ color: colors.textMuted }}>Notification No: </span>
            <span className="font-bold" style={{ color: colors.textPrimary }}>{session.notification_no || '-'}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between p-3" style={{ background: isDark ? 'rgba(243,146,0,0.08)' : 'rgba(243,146,0,0.04)' }}>
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: session.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: session.status === 'completed' ? '#10B981' : '#F59E0B'
            }}>
            {session.status === 'completed' ? (isRTL ? '✓ مكتملة' : '✓ Completed') : (isRTL ? '⏳ قيد التنفيذ' : '⏳ In Progress')}
          </span>
          <div className="flex gap-3 text-xs" style={{ color: colors.textMuted }}>
            <span>Total: <b style={{ color: '#F39200' }}>{stats.total}</b></span>
            <span>Done: <b style={{ color: '#3B82F6' }}>{stats.done}</b></span>
            <span>OK: <b style={{ color: '#10B981' }}>{stats.ok}</b></span>
            <span>Repair: <b style={{ color: '#EF4444' }}>{stats.repair}</b></span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
          <div className="h-full rounded-full transition-all" style={{
            width: `${(stats.done / stats.total) * 100}%`,
            background: 'linear-gradient(90deg, #F39200, #10B981)'
          }} />
        </div>
      )}

      {/* Action Color Legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium" style={{ color: colors.textMuted }}>{isRTL ? 'الألوان:' : 'Legend:'}</span>
        {Object.entries(actionColors).filter(([k]) => k !== 'pending').map(([key, val]) => (
          <span key={key} className="px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ background: val.bg, color: val.text, border: '1px solid rgba(0,0,0,0.1)' }}>
            {isRTL ? val.label_ar : val.label_en}
          </span>
        ))}
      </div>

      {/* Mechanical / Electrical Tabs */}
      <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
        <button onClick={() => setActiveTab('mechanical')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-colors"
          style={{
            background: activeTab === 'mechanical' ? (isDark ? '#F39200' : '#F39200') : 'transparent',
            color: activeTab === 'mechanical' ? '#FFFFFF' : colors.textMuted,
          }}>
          <Wrench className="w-4 h-4" />
          Mechanical List
        </button>
        <button onClick={() => setActiveTab('electrical')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-colors"
          style={{
            background: activeTab === 'electrical' ? '#3B82F6' : 'transparent',
            color: activeTab === 'electrical' ? '#FFFFFF' : colors.textMuted,
          }}>
          <Zap className="w-4 h-4" />
          Electrical List
        </button>
      </div>

      {/* THE TABLE (PDF format) */}
      {grouped.length === 0 ? (
        <div className="text-center py-12" style={{ color: colors.textMuted }}>
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{isRTL ? 'لا توجد عناصر. أضف قالب للماكينة أولاً.' : 'No items found. Add a template for this machine first.'}</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? '#444' : '#ccc'}` }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '900px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: isDark ? '#333' : '#E5E7EB' }}>
                  <th style={{ ...thStyle, width: '40px', textAlign: 'center', color: colors.textPrimary }}>NO</th>
                  <th style={{ ...thStyle, width: '130px', color: colors.textPrimary }}>Equipment</th>
                  <th style={{ ...thStyle, width: '160px', color: colors.textPrimary }}>Parts</th>
                  <th style={{ ...thStyle, width: '200px', color: colors.textPrimary }}>Essential Care</th>
                  <th style={{ ...thStyle, width: '180px', color: colors.textPrimary }}>Action</th>
                  <th style={{ ...thStyle, width: '160px', color: colors.textPrimary }}>Spare Parts Used</th>
                  <th style={{ ...thStyle, width: '160px', color: colors.textPrimary }}>Remarks</th>
                  <th style={{ ...thStyle, width: '70px', borderRight: 'none', color: colors.textPrimary }}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((group) => {
                  return group.items.map((item, itemIdx) => {
                    const actionColor = actionColors[item.status] || actionColors.pending;
                    const isEditing = editingItemId === item.id;
                    const priorityCfg = priorityOptions.find(p => p.value === (item.priority || '')) || priorityOptions[0];

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          style={{ background: isDark ? '#1a1a1a' : '#FFFFFF', cursor: 'pointer' }}
                          onClick={() => setEditingItemId(isEditing ? null : item.id)}
                        >
                          {/* NO - only show on first row of group */}
                          {itemIdx === 0 ? (
                            <td rowSpan={group.items.length} style={{
                              ...tdStyle,
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              color: colors.textPrimary,
                              background: isDark ? '#222' : '#F9FAFB',
                              verticalAlign: 'middle',
                            }}>
                              {group.no}
                            </td>
                          ) : null}

                          {/* Equipment - only show on first row */}
                          {itemIdx === 0 ? (
                            <td rowSpan={group.items.length} style={{
                              ...tdStyle,
                              fontWeight: 'bold',
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              color: activeTab === 'mechanical' ? '#F39200' : '#3B82F6',
                              background: isDark ? '#222' : '#F9FAFB',
                              verticalAlign: 'middle',
                            }}>
                              {group.name}
                            </td>
                          ) : null}

                          {/* Parts */}
                          <td style={{ ...tdStyle, color: colors.textPrimary, fontSize: '12px' }}>
                            {item.part_name}
                          </td>

                          {/* Essential Care */}
                          <td style={{ ...tdStyle, color: colors.textSecondary, fontSize: '11px' }}>
                            {item.essential_care}
                          </td>

                          {/* Action - COLOR CODED (click to cycle) */}
                          <td
                            style={{
                              ...tdStyle,
                              background: actionColor.bg,
                              color: actionColor.text,
                              fontWeight: '500',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                            onClick={(e) => { e.stopPropagation(); cycleStatus(item); }}
                          >
                            {item.action_taken || (isRTL ? actionColor.label_ar : actionColor.label_en)}
                          </td>

                          {/* Spare Parts Used */}
                          <td style={{
                            ...tdStyle,
                            color: item.spare_parts_used ? (isDark ? '#93C5FD' : '#2563EB') : colors.textMuted,
                            fontSize: '10px',
                          }}>
                            {item.spare_parts_used || '-'}
                          </td>

                          {/* Remarks */}
                          <td style={{
                            ...tdStyle,
                            fontSize: '10px',
                            color: item.remarks ? (item.status === 'under_observation' ? '#B45309' : colors.textSecondary) : colors.textMuted,
                            background: item.status === 'under_observation' && item.remarks ? '#FFFBEB' : undefined,
                          }}>
                            {item.remarks || '-'}
                          </td>

                          {/* Priority */}
                          <td style={{
                            ...tdStyle,
                            textAlign: 'center',
                            borderRight: 'none',
                            background: item.priority === 'critical' ? '#FEE2E2' : item.priority === 'high' ? '#FFF7ED' : undefined,
                          }}>
                            {item.priority ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                style={{ color: priorityCfg.color }}>
                                {isRTL ? priorityCfg.label_ar : priorityCfg.label_en}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>

                        {/* Inline Editor Row */}
                        {isEditing && (
                          <tr>
                            <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                              <InlineEditor
                                item={item}
                                onUpdate={handleUpdateItem}
                                onClose={() => setEditingItemId(null)}
                                isRTL={isRTL}
                                isDark={isDark}
                                colors={colors}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prepared By */}
      {session.prepared_by && (
        <div className="p-4 rounded-xl" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
          <p className="text-sm italic font-medium" style={{ color: colors.textPrimary }}>
            <User className="w-4 h-4 inline" style={{ color: '#F39200' }} />
            {' '}Prepared by: <b>{session.prepared_by}</b>
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ==================== INLINE EDITOR ====================
const InlineEditor = ({ item, onUpdate, onClose, isRTL, isDark, colors }) => {
  const [status, setStatus] = useState(item.status || 'pending');
  const [actionTaken, setActionTaken] = useState(item.action_taken || '');
  const [sparePartsUsed, setSparePartsUsed] = useState(item.spare_parts_used || '');
  const [remarks, setRemarks] = useState(item.remarks || '');
  const [priority, setPriority] = useState(item.priority || '');
  const [checkedBy, setCheckedBy] = useState(item.checked_by || '');

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
    border: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="p-4 space-y-3"
      style={{
        background: isDark ? 'rgba(243,146,0,0.05)' : '#FFF7ED',
        borderTop: '2px solid #F39200',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold" style={{ color: '#F39200' }}>
          {isRTL ? 'تعديل:' : 'Edit:'} {item.part_name}
        </h4>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1">
          <X className="w-4 h-4" style={{ color: colors.textMuted }} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: colors.textMuted }}>
            {isRTL ? 'الحالة' : 'Status'}
          </label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle}>
            {Object.entries(actionColors).map(([k, v]) => (
              <option key={k} value={k}>{isRTL ? v.label_ar : v.label_en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: colors.textMuted }}>
            {isRTL ? 'الأولوية' : 'Priority'}
          </label>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle}>
            {priorityOptions.map(p => (
              <option key={p.value} value={p.value}>{isRTL ? p.label_ar : p.label_en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: colors.textMuted }}>
            {isRTL ? 'فحصها بواسطة' : 'Checked By'}
          </label>
          <input type="text" value={checkedBy} onChange={e => setCheckedBy(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder="e.g. ENG. Ibrahim" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium block mb-1" style={{ color: colors.textMuted }}>
          {isRTL ? 'الإجراء المتخذ (Action)' : 'Action Taken'}
        </label>
        <input type="text" value={actionTaken} onChange={e => setActionTaken(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle}
          placeholder={isRTL ? 'مثال: Checked ok / Checked & repaired stuck up' : 'e.g. Checked ok / Checked & repaired stuck up'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: colors.textMuted }}>
            {isRTL ? 'قطع الغيار المستخدمة' : 'Spare Parts Used'}
          </label>
          <input type="text" value={sparePartsUsed} onChange={e => setSparePartsUsed(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder="e.g. SIZE: 18-85-150. ITEM CODE: 109538" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: colors.textMuted }}>
            {isRTL ? 'ملاحظات' : 'Remarks'}
          </label>
          <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder={isRTL ? 'ملاحظات إضافية...' : 'Additional notes...'} />
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { status, actionTaken, sparePartsUsed, remarks, priority, checkedBy }); }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white"
        style={{ background: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)' }}>
        <Save className="w-4 h-4" /> {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
      </button>
    </motion.div>
  );
};

// ==================== TEMPLATE MANAGER ====================
const TemplateManager = ({ machineList, onBack, isRTL, isDark, colors }) => {
  const [selectedMachine, setSelectedMachine] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItems, setNewItems] = useState([{ list_type: 'mechanical', equipment_no: 1, equipment_name: '', part_name: '', essential_care: '' }]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const loadTemplates = useCallback(async (machineId) => {
    if (!machineId) return;
    setLoading(true);
    try {
      const data = await fetchTemplatesByMachine(machineId);
      setTemplates(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (selectedMachine) loadTemplates(selectedMachine); }, [selectedMachine, loadTemplates]);

  const addRow = () => {
    setNewItems(prev => [...prev, { list_type: 'mechanical', equipment_no: 1, equipment_name: '', part_name: '', essential_care: '' }]);
  };

  const updateRow = (idx, field, value) => {
    setNewItems(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const removeRow = (idx) => {
    setNewItems(prev => prev.filter((_, i) => i !== idx));
  };

  const saveTemplates = async () => {
    const valid = newItems.filter(r => r.part_name.trim() && r.equipment_name.trim());
    if (valid.length === 0) return;
    setLoading(true);
    try {
      const items = valid.map((r, i) => ({
        machine_id: selectedMachine,
        list_type: r.list_type,
        equipment_no: parseInt(r.equipment_no) || 1,
        equipment_name: r.equipment_name,
        part_name: r.part_name,
        essential_care: r.essential_care,
        sort_order: i,
      }));
      await addTemplateBatch(items);
      await loadTemplates(selectedMachine);
      setShowAddForm(false);
      setNewItems([{ list_type: 'mechanical', equipment_no: 1, equipment_name: '', part_name: '', essential_care: '' }]);
    } catch (err) {
      alert(isRTL ? 'فشل في الحفظ' : 'Failed to save');
    } finally { setLoading(false); }
  };

  const clearTemplates = async () => {
    if (!selectedMachine) return;
    if (!window.confirm(isRTL ? 'حذف جميع القوالب لهذه الماكينة؟' : 'Delete all templates for this machine?')) return;
    try {
      await deleteTemplatesByMachine(selectedMachine);
      setTemplates([]);
    } catch (err) { alert(isRTL ? 'فشل في الحذف' : 'Failed to delete'); }
  };

  // CSV Import handler
  const handleCSVImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMachine) return;
    e.target.value = '';
    setLoading(true);
    try {
      const text = await file.text();
      const lines = [];
      // Simple CSV parser that handles quoted fields
      let current = '';
      let inQuotes = false;
      let row = [];
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { row.push(current.trim()); current = ''; }
        else if ((ch === '\n' || ch === '\r') && !inQuotes) {
          if (ch === '\r' && text[i+1] === '\n') i++;
          row.push(current.trim()); current = '';
          if (row.length > 0) lines.push(row);
          row = [];
        } else { current += ch; }
      }
      if (current || row.length > 0) { row.push(current.trim()); lines.push(row); }

      let listType = null;
      let eqNo = 0, eqName = '';
      let sortOrder = 0;
      const parsed = [];

      for (const r of lines) {
        if (r.length < 4) continue;
        const joined = r.slice(0, 4).join(',').toLowerCase();
        if (joined.includes('mechanical list')) { listType = 'mechanical'; sortOrder = 0; continue; }
        if (joined.includes('electrical list')) { listType = 'electrical'; sortOrder = 0; continue; }
        if (!listType) continue;
        if (r[0] === 'NO' || (r.length > 4 && r[4] === 'Action')) continue;
        const parts = r[2] || '';
        const care = r[3] || '';
        if (!parts && !care) continue;
        if (r[0]?.includes('Prepared by') || r[1]?.includes('Prepared by')) continue;
        if (r[0]?.includes('Preventive Maintenance')) { listType = null; continue; }
        if (r[0] && /^\d+$/.test(r[0])) eqNo = parseInt(r[0]);
        if (r[1]) eqName = r[1].trim();
        if (!parts) continue;
        sortOrder++;
        parsed.push({
          machine_id: selectedMachine,
          list_type: listType,
          equipment_no: eqNo,
          equipment_name: eqName,
          part_name: parts,
          essential_care: care,
          sort_order: sortOrder,
        });
      }

      if (parsed.length === 0) {
        alert(isRTL ? 'لم يتم العثور على بيانات صالحة في الملف' : 'No valid data found in the CSV file');
        setLoading(false);
        return;
      }

      const mech = parsed.filter(p => p.list_type === 'mechanical').length;
      const elec = parsed.filter(p => p.list_type === 'electrical').length;
      const confirm = window.confirm(
        isRTL
          ? `تم العثور على ${parsed.length} عنصر (${mech} ميكانيكي، ${elec} كهربائي). هل تريد الاستيراد؟`
          : `Found ${parsed.length} items (${mech} mechanical, ${elec} electrical). Import?`
      );
      if (!confirm) { setLoading(false); return; }

      await addTemplateBatch(parsed);
      await loadTemplates(selectedMachine);
      alert(isRTL ? `تم استيراد ${parsed.length} عنصر بنجاح!` : `Successfully imported ${parsed.length} items!`);
    } catch (err) {
      console.error(err);
      alert(isRTL ? 'فشل في استيراد الملف' : 'Failed to import CSV');
    } finally { setLoading(false); }
  }, [selectedMachine, isRTL, loadTemplates]);

  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${colors.border}`, color: colors.textPrimary };

  // Group templates by type & equipment
  const grouped = useMemo(() => {
    const g = {};
    templates.forEach(t => {
      const key = `${t.list_type}-${t.equipment_no}-${t.equipment_name}`;
      if (!g[key]) g[key] = { type: t.list_type, no: t.equipment_no, name: t.equipment_name, items: [] };
      g[key].items.push(t);
    });
    return Object.values(g).sort((a, b) => a.type.localeCompare(b.type) || a.no - b.no);
  }, [templates]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium" style={{ color: '#F39200' }}>
        <BackArrow className="w-4 h-4" />
        {isRTL ? 'رجوع للقائمة' : 'Back to List'}
      </button>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>
          <Settings2 className="w-6 h-6" style={{ color: '#F39200' }} />
          {isRTL ? 'قوالب الشيك ليست' : 'Checklist Templates'}
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
          {isRTL ? 'أنشئ قالب لكل ماكينة (Mechanical + Electrical) لتسهيل إنشاء الشيك ليست' : 'Create templates per machine (Mechanical + Electrical) to auto-populate checklists'}
        </p>
      </div>

      <select value={selectedMachine} onChange={e => setSelectedMachine(e.target.value)}
        className="w-full max-w-md px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}>
        <option value="">{isRTL ? '-- اختر ماكينة --' : '-- Select Machine --'}</option>
        {machineList.map(m => <option key={m.id} value={m.id}>{m.id} - {m.name || m.type}</option>)}
      </select>

      {selectedMachine && (
        <>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
              style={{ background: '#F39200' }}>
              <Plus className="w-4 h-4" /> {isRTL ? 'إضافة عناصر' : 'Add Items'}
            </button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Upload className="w-4 h-4" /> {isRTL ? 'استيراد CSV' : 'Import CSV'}
              <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            </label>
            {templates.length > 0 && (
              <button onClick={clearTemplates}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                <Trash2 className="w-4 h-4" /> {isRTL ? 'حذف الكل' : 'Clear All'}
              </button>
            )}
          </div>

          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="p-4 rounded-xl space-y-3 overflow-hidden"
                style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
                <p className="text-xs font-medium" style={{ color: colors.textMuted }}>
                  {isRTL ? 'أضف عناصر القالب (نوع، رقم المعدة، اسم المعدة، اسم القطعة، العناية المطلوبة)' : 'Add template items (Type, Equipment No, Equipment Name, Part Name, Essential Care)'}
                </p>
                {newItems.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
                    <select value={row.list_type} onChange={e => updateRow(idx, 'list_type', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle}>
                      <option value="mechanical">Mechanical</option>
                      <option value="electrical">Electrical</option>
                    </select>
                    <input type="number" min="1" value={row.equipment_no} onChange={e => updateRow(idx, 'equipment_no', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} placeholder="No" />
                    <input type="text" value={row.equipment_name} onChange={e => updateRow(idx, 'equipment_name', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} placeholder="Equipment" />
                    <input type="text" value={row.part_name} onChange={e => updateRow(idx, 'part_name', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} placeholder="Part Name" />
                    <input type="text" value={row.essential_care} onChange={e => updateRow(idx, 'essential_care', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} placeholder="Essential Care" />
                    <button onClick={() => removeRow(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                      <X className="w-4 h-4" style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={addRow} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: '#F39200', border: '1px solid rgba(243,146,0,0.3)' }}>
                    + {isRTL ? 'صف جديد' : 'Add Row'}
                  </button>
                  <button onClick={saveTemplates} disabled={loading}
                    className="text-xs px-4 py-1.5 rounded-lg text-white flex items-center gap-1" style={{ background: '#F39200' }}>
                    <Save className="w-3 h-3" /> {isRTL ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing Templates - Table View */}
          {loading ? (
            <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#F39200' }} /></div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-8" style={{ color: colors.textMuted }}>
              <p className="text-sm">{isRTL ? 'لا توجد قوالب لهذه الماكينة' : 'No templates for this machine'}</p>
              <p className="text-xs mt-1">{isRTL ? 'أضف عناصر الـ Mechanical و Electrical أعلاه' : 'Add Mechanical & Electrical items above'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {grouped.map((g, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: g.type === 'mechanical' ? '#F39200' : '#3B82F6' }}>{g.no}</span>
                    <span className="font-semibold text-sm" style={{ color: colors.textPrimary }}>{g.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: g.type === 'mechanical' ? 'rgba(243,146,0,0.1)' : 'rgba(59,130,246,0.1)', color: g.type === 'mechanical' ? '#F39200' : '#3B82F6' }}>
                      {g.type === 'mechanical' ? 'Mechanical' : 'Electrical'}
                    </span>
                    <span className="text-xs" style={{ color: colors.textMuted }}>({g.items.length} items)</span>
                  </div>
                  {g.items.map(t => (
                    <div key={t.id} className="flex items-center gap-2 py-1 text-xs border-t" style={{ borderColor: colors.border }}>
                      <span className="font-medium" style={{ color: colors.textPrimary }}>{t.part_name}</span>
                      <span style={{ color: colors.textMuted }}>— {t.essential_care}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default MaintenanceChecklist;
