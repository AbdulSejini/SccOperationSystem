import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit3, Trash2, X, Save, ChevronDown,
  Settings2, Package, CheckCircle, AlertTriangle, Filter,
  Database, WifiOff, RefreshCw, ClipboardList
} from 'lucide-react';

// ==================== Default Machine Types ====================
const defaultMachineTypes = [
  { code: 'CW', name_en: 'Cold Welding', name_ar: 'لحام بارد' },
  { code: 'IW', name_en: 'Insulation Wrapping', name_ar: 'لف العزل' },
  { code: 'BN', name_en: 'Bunching', name_ar: 'تجميع' },
  { code: 'CL', name_en: 'Cabling', name_ar: 'تكبيل' },
  { code: 'ST', name_en: 'Stranding', name_ar: 'جدل' },
  { code: 'TU', name_en: 'Twisting Unit', name_ar: 'وحدة لي' },
  { code: 'XL', name_en: 'Extrusion Line', name_ar: 'خط بثق' },
  { code: 'XT', name_en: 'Stranding', name_ar: 'جدل' },
  { code: 'AR', name_en: 'Armoring', name_ar: 'تدريع' },
  { code: 'BC', name_en: 'Bunching', name_ar: 'تجميع' },
  { code: 'DT', name_en: 'Drawing', name_ar: 'سحب' },
  { code: 'RW', name_en: 'Rewinding', name_ar: 'إعادة لف' },
  { code: 'PS', name_en: 'Processing', name_ar: 'معالجة' },
  { code: 'CV', name_en: 'CV Line', name_ar: 'خط CV' },
  { code: 'LX', name_en: 'Extrusion', name_ar: 'بثق' },
  { code: 'SC', name_en: 'Screening', name_ar: 'فحص' },
  { code: 'JKT', name_en: 'Jacketing', name_ar: 'تغليف' },
  { code: 'REW', name_en: 'Rewinding', name_ar: 'إعادة لف' },
  { code: 'CAB', name_en: 'Cabling', name_ar: 'تكبيل' },
  { code: 'TWI', name_en: 'Twisting', name_ar: 'لي' },
  { code: 'MT', name_en: 'Testing', name_ar: 'اختبار' },
  { code: 'ARM', name_en: 'Armoring', name_ar: 'تدريع' },
  { code: 'SILO', name_en: 'Storage', name_ar: 'تخزين' },
];

const statusColors = {
  running: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', label_en: 'Running', label_ar: 'تعمل' },
  idle: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', label_en: 'Idle', label_ar: 'خاملة' },
  stopped: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label_en: 'Stopped', label_ar: 'متوقفة' },
  maintenance: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', label_en: 'Maintenance', label_ar: 'صيانة' },
};

const areas = ['PCP-1', 'PCP-2', 'PCP-3', 'CV-Line', 'Storage', 'Support', ''];
const sections = ['DRW-STR', 'LV-Cable', 'MV-HV', 'BSI-Cable', 'CV', 'Support', 'PVC-Reel', ''];

// ==================== Main Component ====================
const MachineManagement = () => {
  const {
    machines, machineTypes, dbConnected, loading,
    addNewMachine, updateMachineData, removeMachine,
    getSparePartsForMachine, addSparePart, updateSparePart, removeSparePart,
    reloadMachines, employees,
  } = useData();
  const { t, isRTL } = useLanguage();
  const { isDark, colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showSparePartsModal, setShowSparePartsModal] = useState(false);
  const [spareParts, setSpareParts] = useState([]);
  const [sparePartsLoading, setSparePartsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const types = machineTypes.length > 0 ? machineTypes : defaultMachineTypes;

  // Filter machines
  const filteredMachines = useMemo(() => {
    return Object.values(machines).filter(m => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        m.id.toLowerCase().includes(q) ||
        m.name?.toLowerCase().includes(q) ||
        m.operator?.toLowerCase().includes(q) ||
        m.manufacturer?.toLowerCase().includes(q) ||
        m.country_of_origin?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q);
      const matchType = !filterType || m.type === filterType;
      const matchStatus = !filterStatus || m.status === filterStatus;
      const matchArea = !filterArea || m.area === filterArea;
      return matchSearch && matchType && matchStatus && matchArea;
    }).sort((a, b) => a.id.localeCompare(b.id));
  }, [machines, searchQuery, filterType, filterStatus, filterArea]);

  // Load spare parts for selected machine
  const loadSpareParts = useCallback(async (machineId) => {
    setSparePartsLoading(true);
    try {
      const parts = await getSparePartsForMachine(machineId);
      setSpareParts(parts || []);
    } catch (err) {
      console.error('Error loading spare parts:', err);
      setSpareParts([]);
    } finally {
      setSparePartsLoading(false);
    }
  }, [getSparePartsForMachine]);

  const handleOpenSpareParts = useCallback((machine) => {
    setSelectedMachine(machine);
    setShowSparePartsModal(true);
    loadSpareParts(machine.id);
  }, [loadSpareParts]);

  const handleDeleteMachine = useCallback(async (id) => {
    try {
      await removeMachine(id);
      setDeleteConfirm(null);
    } catch (err) {
      alert(isRTL ? 'فشل في حذف الماكينة' : 'Failed to delete machine');
    }
  }, [removeMachine, isRTL]);

  // Stats
  const stats = useMemo(() => {
    const all = Object.values(machines);
    return {
      total: all.length,
      running: all.filter(m => m.status === 'running').length,
      idle: all.filter(m => m.status === 'idle').length,
      stopped: all.filter(m => m.status === 'stopped').length,
      maintenance: all.filter(m => m.status === 'maintenance').length,
    };
  }, [machines]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#F39200' }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {isRTL ? 'إدارة المكائن' : 'Machine Management'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {dbConnected ? (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
                <Database className="w-3 h-3" /> {isRTL ? 'متصل بقاعدة البيانات' : 'Connected to Database'}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#F59E0B' }}>
                <WifiOff className="w-3 h-3" /> {isRTL ? 'وضع محلي' : 'Local Mode'}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {dbConnected && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reloadMachines}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: colors.bgSecondary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              <RefreshCw className="w-4 h-4" />
              {isRTL ? 'تحديث' : 'Refresh'}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingMachine(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)' }}
          >
            <Plus className="w-4 h-4" />
            {isRTL ? 'إضافة ماكينة' : 'Add Machine'}
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: isRTL ? 'إجمالي' : 'Total', value: stats.total, color: '#F39200' },
          { label: isRTL ? 'تعمل' : 'Running', value: stats.running, color: '#10B981' },
          { label: isRTL ? 'خاملة' : 'Idle', value: stats.idle, color: '#F59E0B' },
          { label: isRTL ? 'متوقفة' : 'Stopped', value: stats.stopped, color: '#EF4444' },
          { label: isRTL ? 'صيانة' : 'Maintenance', value: stats.maintenance, color: '#8B5CF6' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl"
            style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
          >
            <p className="text-xs" style={{ color: colors.textMuted }}>{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4" style={{ [isRTL ? 'right' : 'left']: 12, color: colors.textMuted }} />
          <input
            type="text"
            placeholder={isRTL ? 'بحث بالرمز أو الاسم أو المشغل...' : 'Search by ID, name, or operator...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full py-2 rounded-xl text-sm outline-none"
            style={{
              background: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              color: colors.textPrimary,
              [isRTL ? 'paddingRight' : 'paddingLeft']: 40,
              [isRTL ? 'paddingLeft' : 'paddingRight']: 12,
            }}
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
        >
          <option value="">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
          {types.map(t => (
            <option key={t.code} value={t.code.toLowerCase()}>{isRTL ? t.name_ar : t.name_en} ({t.code})</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
        >
          <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
          {Object.entries(statusColors).map(([key, val]) => (
            <option key={key} value={key}>{isRTL ? val.label_ar : val.label_en}</option>
          ))}
        </select>
        <select
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
        >
          <option value="">{isRTL ? 'جميع المناطق' : 'All Areas'}</option>
          {areas.filter(a => a).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Machines Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: isDark ? 'rgba(243, 146, 0, 0.1)' : 'rgba(243, 146, 0, 0.05)' }}>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'الرمز' : 'ID'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'الاسم' : 'Name'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'النوع' : 'Type'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'المنطقة' : 'Area'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'الشركة المصنعة' : 'Manufacturer'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'بلد المنشأ' : 'Country'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'المشغل' : 'Operator'}</th>
                <th className="px-4 py-3 text-start font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'OEE' : 'OEE'}</th>
                <th className="px-4 py-3 text-center font-semibold" style={{ color: colors.textPrimary }}>{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine, idx) => {
                const status = statusColors[machine.status] || statusColors.idle;
                return (
                  <motion.tr
                    key={machine.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    className="border-t"
                    style={{ borderColor: colors.border }}
                    onDoubleClick={() => { setEditingMachine(machine); setShowAddModal(true); }}
                  >
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: '#F39200' }}>{machine.id}</td>
                    <td className="px-4 py-3" style={{ color: colors.textPrimary }}>{machine.name || '-'}</td>
                    <td className="px-4 py-3" style={{ color: colors.textSecondary }}>{machine.type || '-'}</td>
                    <td className="px-4 py-3" style={{ color: colors.textSecondary }}>{machine.area || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: status.bg, color: status.text }}
                      >
                        {isRTL ? status.label_ar : status.label_en}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: colors.textSecondary }}>{machine.manufacturer || '-'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: colors.textSecondary }}>{machine.country_of_origin || '-'}</td>
                    <td className="px-4 py-3" style={{ color: colors.textSecondary }}>{machine.operator || '-'}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: machine.oee > 75 ? '#10B981' : machine.oee > 50 ? '#F59E0B' : '#EF4444' }}>
                        {machine.oee ? `${Math.round(machine.oee)}%` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setEditingMachine(machine); setShowAddModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
                          title={isRTL ? 'تعديل' : 'Edit'}
                        >
                          <Edit3 className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        </button>
                        <button
                          onClick={() => handleOpenSpareParts(machine)}
                          className="p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
                          title={isRTL ? 'قطع الغيار' : 'Spare Parts'}
                        >
                          <ClipboardList className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(machine.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredMachines.length === 0 && (
          <div className="p-8 text-center" style={{ color: colors.textMuted }}>
            {isRTL ? 'لا توجد مكائن مطابقة للبحث' : 'No machines match your search'}
          </div>
        )}
        <div className="px-4 py-3 text-xs" style={{ color: colors.textMuted, borderTop: `1px solid ${colors.border}` }}>
          {isRTL ? `عرض ${filteredMachines.length} من ${Object.keys(machines).length} ماكينة` : `Showing ${filteredMachines.length} of ${Object.keys(machines).length} machines`}
        </div>
      </div>

      {/* Add/Edit Machine Modal */}
      <AnimatePresence>
        {showAddModal && (
          <MachineFormModal
            machine={editingMachine}
            types={types}
            employees={employees}
            isRTL={isRTL}
            isDark={isDark}
            colors={colors}
            onSave={async (data) => {
              try {
                if (editingMachine) {
                  await updateMachineData(editingMachine.id, data);
                } else {
                  await addNewMachine(data);
                }
                setShowAddModal(false);
                setEditingMachine(null);
              } catch (err) {
                alert(isRTL ? 'حدث خطأ أثناء الحفظ' : 'Error saving machine');
              }
            }}
            onClose={() => { setShowAddModal(false); setEditingMachine(null); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="p-6 rounded-2xl max-w-sm w-full"
              style={{ background: colors.bgPrimary, border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6" style={{ color: '#EF4444' }} />
                <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
                </h3>
              </div>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                {isRTL ? `هل أنت متأكد من حذف الماكينة ${deleteConfirm}؟ سيتم حذف جميع قطع الغيار المرتبطة بها.` :
                  `Are you sure you want to delete machine ${deleteConfirm}? All related spare parts will also be deleted.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: colors.bgSecondary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => handleDeleteMachine(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: '#EF4444' }}
                >
                  {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spare Parts Modal */}
      <AnimatePresence>
        {showSparePartsModal && selectedMachine && (
          <SparePartsModal
            machine={selectedMachine}
            spareParts={spareParts}
            loading={sparePartsLoading}
            isRTL={isRTL}
            isDark={isDark}
            colors={colors}
            dbConnected={dbConnected}
            onAdd={async (part) => {
              const newPart = await addSparePart({ ...part, machineId: selectedMachine.id });
              if (newPart) setSpareParts(prev => [...prev, newPart]);
            }}
            onUpdate={async (id, updates) => {
              const updated = await updateSparePart(id, updates);
              if (updated) {
                setSpareParts(prev => prev.map(p => p.id === id ? updated : p));
              }
            }}
            onDelete={async (id) => {
              await removeSparePart(id);
              setSpareParts(prev => prev.filter(p => p.id !== id));
            }}
            onClose={() => { setShowSparePartsModal(false); setSelectedMachine(null); setSpareParts([]); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== Machine Form Modal ====================
const MachineFormModal = ({ machine, types, employees = [], isRTL, isDark, colors, onSave, onClose }) => {
  const [form, setForm] = useState({
    id: machine?.id || '',
    name: machine?.name || '',
    type: machine?.type || '',
    area: machine?.area || '',
    section: machine?.section || '',
    status: machine?.status || 'idle',
    speed: machine?.speed || 0,
    targetSpeed: machine?.targetSpeed || 0,
    temperature: machine?.temperature || 25,
    oee: machine?.oee || 0,
    operator: machine?.operator || '',
    description: machine?.description || '',
    manufacturer: machine?.manufacturer || '',
    country_of_origin: machine?.country_of_origin || '',
    installed_date: machine?.installed_date || '',
    notes: machine?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id.trim()) {
      alert(isRTL ? 'الرجاء إدخال رمز الماكينة' : 'Please enter machine ID');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: colors.bgPrimary, border: `1px solid ${colors.border}` }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {machine ? (isRTL ? 'تعديل ماكينة' : 'Edit Machine') : (isRTL ? 'إضافة ماكينة جديدة' : 'Add New Machine')}
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5" style={{ color: colors.textMuted }} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Machine ID */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'رمز الماكينة *' : 'Machine ID *'}
                </label>
                <input
                  type="text"
                  value={form.id}
                  onChange={e => setForm(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                  disabled={!!machine}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ ...inputStyle, opacity: machine ? 0.6 : 1 }}
                  placeholder="CW2, BN10, XT3..."
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'اسم الماكينة' : 'Machine Name'}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Type (Dropdown) */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'نوع الماكينة' : 'Machine Type'}
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">{isRTL ? 'اختر النوع' : 'Select Type'}</option>
                  {types.map(t => (
                    <option key={t.code} value={t.code.toLowerCase()}>
                      {isRTL ? t.name_ar : t.name_en} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'المنطقة' : 'Area'}
                </label>
                <select
                  value={form.area}
                  onChange={e => setForm(prev => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">{isRTL ? 'اختر المنطقة' : 'Select Area'}</option>
                  {areas.filter(a => a).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'القسم' : 'Section'}
                </label>
                <select
                  value={form.section}
                  onChange={e => setForm(prev => ({ ...prev, section: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">{isRTL ? 'اختر القسم' : 'Select Section'}</option>
                  {sections.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'الحالة' : 'Status'}
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  {Object.entries(statusColors).map(([key, val]) => (
                    <option key={key} value={key}>{isRTL ? val.label_ar : val.label_en}</option>
                  ))}
                </select>
              </div>

              {/* Speed */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'السرعة' : 'Speed'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.speed}
                  onChange={e => setForm(prev => ({ ...prev, speed: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Target Speed */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'السرعة المستهدفة' : 'Target Speed'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.targetSpeed}
                  onChange={e => setForm(prev => ({ ...prev, targetSpeed: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Operator */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'المشغل' : 'Operator'}
                </label>
                <select
                  value={form.operator}
                  onChange={e => setForm(prev => ({ ...prev, operator: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="">{isRTL ? '-- اختر المشغل --' : '-- Select Operator --'}</option>
                  {employees
                    .filter(emp => emp.status === 'active' && (emp.role === 'operator' || emp.role === 'supervisor'))
                    .map(emp => (
                      <option key={emp.id || emp.employee_id} value={isRTL ? emp.name_ar : emp.name_en}>
                        {emp.employee_id} - {isRTL ? emp.name_ar : emp.name_en}
                      </option>
                    ))}
                </select>
              </div>

              {/* OEE */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  OEE (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.oee}
                  onChange={e => setForm(prev => ({ ...prev, oee: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Machine Details Section */}
            <div className="pt-2 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#F39200' }}>
                {isRTL ? 'تفاصيل الماكينة' : 'Machine Details'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'الوصف' : 'Description'}
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  placeholder={isRTL ? 'وصف الماكينة...' : 'Machine description...'}
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'الشركة المصنعة' : 'Manufacturer'}
                </label>
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={e => setForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  placeholder="e.g. SIEMENS, NEIHOFF..."
                />
              </div>

              {/* Country of Origin */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'بلد المنشأ' : 'Country of Origin'}
                </label>
                <input
                  type="text"
                  value={form.country_of_origin}
                  onChange={e => setForm(prev => ({ ...prev, country_of_origin: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                  placeholder={isRTL ? 'ألمانيا، إيطاليا...' : 'Germany, Italy...'}
                />
              </div>

              {/* Installed Date */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  {isRTL ? 'تاريخ التركيب' : 'Installed Date'}
                </label>
                <input
                  type="date"
                  value={form.installed_date}
                  onChange={e => setForm(prev => ({ ...prev, installed_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'ملاحظات' : 'Notes'}
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={inputStyle}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: colors.bgSecondary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)', opacity: saving ? 0.6 : 1 }}
              >
                <Save className="w-4 h-4" />
                {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== Spare Parts Modal ====================
const SparePartsModal = ({ machine, spareParts, loading, isRTL, isDark, colors, dbConnected, onAdd, onUpdate, onDelete, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPart, setNewPart] = useState({
    partName: '', partNumber: '', quantity: 0, minQuantity: 0,
    isAvailable: true, checkedBy: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!newPart.partName.trim()) return;
    setSaving(true);
    try {
      await onAdd(newPart);
      setNewPart({ partName: '', partNumber: '', quantity: 0, minQuantity: 0, isAvailable: true, checkedBy: '', notes: '' });
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: colors.bgPrimary, border: `1px solid ${colors.border}` }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                <Package className="w-5 h-5 inline-block mr-2" style={{ color: '#8B5CF6' }} />
                {isRTL ? 'قطع الغيار' : 'Spare Parts Checklist'}
              </h2>
              <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                {isRTL ? `ماكينة: ${machine.id} - ${machine.name || ''}` : `Machine: ${machine.id} - ${machine.name || ''}`}
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5" style={{ color: colors.textMuted }} /></button>
          </div>

          {!dbConnected && (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <WifiOff className="w-4 h-4" style={{ color: '#F59E0B' }} />
              <span className="text-sm" style={{ color: '#F59E0B' }}>
                {isRTL ? 'قطع الغيار تتطلب اتصال بقاعدة البيانات' : 'Spare parts require database connection'}
              </span>
            </div>
          )}

          {/* Add Button */}
          {dbConnected && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white mb-4"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}
            >
              <Plus className="w-4 h-4" />
              {isRTL ? 'إضافة قطعة غيار' : 'Add Spare Part'}
            </button>
          )}

          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddPart}
                className="mb-4 p-4 rounded-xl overflow-hidden"
                style={{ background: isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.03)', border: `1px solid ${colors.border}` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      {isRTL ? 'اسم القطعة *' : 'Part Name *'}
                    </label>
                    <input
                      type="text"
                      value={newPart.partName}
                      onChange={e => setNewPart(prev => ({ ...prev, partName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      {isRTL ? 'رقم القطعة' : 'Part Number'}
                    </label>
                    <input
                      type="text"
                      value={newPart.partNumber}
                      onChange={e => setNewPart(prev => ({ ...prev, partNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      {isRTL ? 'الكمية' : 'Quantity'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newPart.quantity}
                      onChange={e => setNewPart(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      {isRTL ? 'الحد الأدنى' : 'Min Quantity'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newPart.minQuantity}
                      onChange={e => setNewPart(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      {isRTL ? 'فحصها بواسطة' : 'Checked By'}
                    </label>
                    <input
                      type="text"
                      value={newPart.checkedBy}
                      onChange={e => setNewPart(prev => ({ ...prev, checkedBy: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPart.isAvailable}
                        onChange={e => setNewPart(prev => ({ ...prev, isAvailable: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm" style={{ color: colors.textSecondary }}>
                        {isRTL ? 'متوفرة' : 'Available'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                    {isRTL ? 'ملاحظات' : 'Notes'}
                  </label>
                  <input
                    type="text"
                    value={newPart.notes}
                    onChange={e => setNewPart(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl text-sm"
                    style={{ background: colors.bgSecondary, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
                    style={{ background: '#8B5CF6', opacity: saving ? 0.6 : 1 }}
                  >
                    <Save className="w-3 h-3" />
                    {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'إضافة' : 'Add')}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Spare Parts List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#8B5CF6' }} />
            </div>
          ) : spareParts.length === 0 ? (
            <div className="text-center py-8" style={{ color: colors.textMuted }}>
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isRTL ? 'لا توجد قطع غيار مسجلة لهذه الماكينة' : 'No spare parts recorded for this machine'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {spareParts.map((part) => (
                <div
                  key={part.id}
                  className="p-3 rounded-xl flex items-center justify-between"
                  style={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {part.is_available ? (
                        <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                      ) : (
                        <AlertTriangle className="w-4 h-4" style={{ color: '#EF4444' }} />
                      )}
                      <span className="font-medium text-sm" style={{ color: colors.textPrimary }}>{part.part_name}</span>
                      {part.part_number && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(243, 146, 0, 0.1)', color: '#F39200' }}>
                          #{part.part_number}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: colors.textMuted }}>
                      <span>{isRTL ? 'الكمية' : 'Qty'}: {part.quantity}</span>
                      <span>{isRTL ? 'الحد الأدنى' : 'Min'}: {part.min_quantity}</span>
                      {part.quantity <= part.min_quantity && part.quantity > 0 && (
                        <span style={{ color: '#EF4444' }}>{isRTL ? 'تحتاج طلب!' : 'Needs reorder!'}</span>
                      )}
                      {part.checked_by && <span>{isRTL ? 'فحص بواسطة' : 'Checked by'}: {part.checked_by}</span>}
                    </div>
                    {part.notes && <p className="text-xs mt-1" style={{ color: colors.textMuted }}>{part.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onUpdate(part.id, { isAvailable: !part.is_available })}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title={isRTL ? 'تغيير التوفر' : 'Toggle availability'}
                    >
                      {part.is_available ?
                        <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} /> :
                        <AlertTriangle className="w-4 h-4" style={{ color: '#EF4444' }} />
                      }
                    </button>
                    <button
                      onClick={() => onDelete(part.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MachineManagement;
