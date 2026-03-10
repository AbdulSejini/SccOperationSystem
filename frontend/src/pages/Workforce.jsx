/**
 * Workforce Management Page
 * Saudi Cable Company - Employee CRUD + Department Overview
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import {
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  RefreshCw,
  Factory,
  Wrench,
  Shield,
  HardHat,
  Phone,
  ChevronDown,
} from 'lucide-react';

const roleConfig = {
  operator: { en: 'Operator', ar: 'مشغل', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  supervisor: { en: 'Supervisor', ar: 'سوبرفايزر', color: '#F39200', bg: 'rgba(243,146,0,0.15)' },
  engineer: { en: 'Engineer', ar: 'مهندس', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  technician: { en: 'Technician', ar: 'فني', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
};

const deptConfig = {
  production: { en: 'Production', ar: 'إنتاج', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  maintenance: { en: 'Maintenance', ar: 'صيانة', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
};

const statusConfig = {
  active: { en: 'Active', ar: 'نشط', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  inactive: { en: 'Inactive', ar: 'غير نشط', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  on_leave: { en: 'On Leave', ar: 'في إجازة', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
};

const shiftConfig = {
  morning: { en: 'Morning', ar: 'صباحية' },
  evening: { en: 'Evening', ar: 'مسائية' },
  night: { en: 'Night', ar: 'ليلية' },
};

const sections = ['PCP-1', 'PCP-2', 'CV-Line', 'Storage', 'Workshop'];

const Workforce = () => {
  const { isRTL } = useLanguage();
  const { isDark, colors } = useTheme();
  const { employees, machines, dbConnected, addNewEmployee, updateEmployeeData, removeEmployee, reloadEmployees } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Stats
  const stats = useMemo(() => ({
    total: employees.length,
    production: employees.filter(e => e.department === 'production').length,
    maintenance: employees.filter(e => e.department === 'maintenance').length,
    active: employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
    operators: employees.filter(e => e.role === 'operator').length,
    supervisors: employees.filter(e => e.role === 'supervisor').length,
  }), [employees]);

  // Filtered employees
  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = !searchTerm ||
        e.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.name_ar.includes(searchTerm);
      const matchDept = !filterDept || e.department === filterDept;
      const matchRole = !filterRole || e.role === filterRole;
      const matchStatus = !filterStatus || e.status === filterStatus;
      return matchSearch && matchDept && matchRole && matchStatus;
    });
  }, [employees, searchTerm, filterDept, filterRole, filterStatus]);

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await removeEmployee(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingEmployee) {
        await updateEmployeeData(editingEmployee.id, data);
      } else {
        await addNewEmployee(data);
      }
      setShowForm(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = { background: colors.bgTertiary, border: `1px solid ${colors.border}`, color: colors.textPrimary };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {isRTL ? 'إدارة القوى العاملة' : 'Workforce Management'}
          </h1>
          <p style={{ color: colors.textSecondary }}>
            {dbConnected ? (
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {isRTL ? 'متصل بقاعدة البيانات' : 'Connected to DB'}</span>
            ) : (
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> {isRTL ? 'وضع محلي' : 'Local Mode'}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reloadEmployees}
            className="p-2 rounded-xl" style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}` }}>
            <RefreshCw className="w-5 h-5" style={{ color: colors.textSecondary }} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingEmployee(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
            style={{ background: 'linear-gradient(135deg, #F39200, #CC7A00)', color: 'white', boxShadow: '0 4px 12px rgba(243,146,0,0.3)' }}>
            <UserPlus className="w-4 h-4" />
            {isRTL ? 'إضافة موظف' : 'Add Employee'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: isRTL ? 'إجمالي' : 'Total', value: stats.total, icon: Users, gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
          { label: isRTL ? 'إنتاج' : 'Production', value: stats.production, icon: Factory, gradient: 'linear-gradient(135deg, #10B981, #059669)' },
          { label: isRTL ? 'صيانة' : 'Maintenance', value: stats.maintenance, icon: Wrench, gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' },
          { label: isRTL ? 'نشط' : 'Active', value: stats.active, icon: Shield, gradient: 'linear-gradient(135deg, #F39200, #CC7A00)' },
          { label: isRTL ? 'إجازة' : 'On Leave', value: stats.onLeave, icon: HardHat, gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4" style={{ background: s.gradient }}>
            <div className="flex items-center gap-3">
              <s.icon className="w-7 h-7 text-white/80" />
              <div>
                <p className="text-white/80 text-xs">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute top-3 w-4 h-4" style={{ color: colors.textMuted, [isRTL ? 'right' : 'left']: '12px' }} />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRTL ? 'بحث بالاسم أو الرقم...' : 'Search by name or ID...'}
            className="w-full py-2 rounded-xl text-sm outline-none" style={{ ...inputStyle, [isRTL ? 'paddingRight' : 'paddingLeft']: '36px', paddingTop: '8px', paddingBottom: '8px' }} />
        </div>
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-3 py-2 rounded-xl text-sm" style={inputStyle}>
          <option value="">{isRTL ? 'كل الأقسام' : 'All Departments'}</option>
          <option value="production">{isRTL ? 'إنتاج' : 'Production'}</option>
          <option value="maintenance">{isRTL ? 'صيانة' : 'Maintenance'}</option>
        </select>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-3 py-2 rounded-xl text-sm" style={inputStyle}>
          <option value="">{isRTL ? 'كل الأدوار' : 'All Roles'}</option>
          {Object.entries(roleConfig).map(([k, v]) => <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl text-sm" style={inputStyle}>
          <option value="">{isRTL ? 'كل الحالات' : 'All Status'}</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>)}
        </select>
      </motion.div>

      {/* Employee Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: isDark ? 'rgba(243,146,0,0.1)' : 'rgba(243,146,0,0.05)' }}>
                {[
                  isRTL ? 'رقم البطاقة' : 'Badge #',
                  isRTL ? 'الاسم' : 'Name',
                  isRTL ? 'القسم' : 'Dept',
                  isRTL ? 'الدور' : 'Role',
                  isRTL ? 'المنطقة' : 'Section',
                  isRTL ? 'الوردية' : 'Shift',
                  isRTL ? 'الحالة' : 'Status',
                  isRTL ? 'الماكينة' : 'Machine',
                  isRTL ? 'إجراءات' : 'Actions',
                ].map((h, i) => (
                  <th key={i} className="py-3 px-3 text-xs font-semibold text-left" style={{ color: colors.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center" style={{ color: colors.textMuted }}>
                  {isRTL ? 'لا يوجد موظفين مطابقين' : 'No employees match your search'}
                </td></tr>
              ) : filtered.map((emp, idx) => (
                <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                  className="hover:opacity-80 transition-opacity">
                  <td className="py-3 px-3 font-mono text-sm font-semibold" style={{ color: '#F39200' }}>{emp.employee_id}</td>
                  <td className="py-3 px-3 text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {isRTL ? emp.name_ar : emp.name_en}
                    <p className="text-xs" style={{ color: colors.textMuted }}>{isRTL ? emp.name_en : emp.name_ar}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: deptConfig[emp.department]?.bg, color: deptConfig[emp.department]?.color }}>
                      {isRTL ? deptConfig[emp.department]?.ar : deptConfig[emp.department]?.en}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: roleConfig[emp.role]?.bg, color: roleConfig[emp.role]?.color }}>
                      {isRTL ? roleConfig[emp.role]?.ar : roleConfig[emp.role]?.en}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm" style={{ color: colors.textSecondary }}>{emp.section || '-'}</td>
                  <td className="py-3 px-3 text-sm" style={{ color: colors.textSecondary }}>
                    {isRTL ? shiftConfig[emp.shift]?.ar : shiftConfig[emp.shift]?.en}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: statusConfig[emp.status]?.bg, color: statusConfig[emp.status]?.color }}>
                      {isRTL ? statusConfig[emp.status]?.ar : statusConfig[emp.status]?.en}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm font-mono" style={{ color: emp.assigned_machine_id ? '#F39200' : colors.textMuted }}>
                    {emp.assigned_machine_id || '-'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(emp)} className="p-1.5 rounded-lg hover:opacity-80"
                        style={{ background: 'rgba(59,130,246,0.15)' }}>
                        <Edit3 className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                      </button>
                      <button onClick={() => setDeleteConfirm(emp)} className="p-1.5 rounded-lg hover:opacity-80"
                        style={{ background: 'rgba(239,68,68,0.15)' }}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-center text-sm" style={{ color: colors.textMuted, borderTop: `1px solid ${colors.border}` }}>
          {isRTL ? `عرض ${filtered.length} من ${employees.length} موظف` : `Showing ${filtered.length} of ${employees.length} employees`}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <EmployeeFormModal
            employee={editingEmployee}
            machines={machines}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingEmployee(null); }}
            colors={colors}
            isDark={isDark}
            isRTL={isRTL}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
              </h3>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                {isRTL
                  ? `هل تريد حذف ${deleteConfirm.name_ar} (${deleteConfirm.employee_id})؟`
                  : `Delete ${deleteConfirm.name_en} (${deleteConfirm.employee_id})?`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-lg font-medium"
                  style={{ background: colors.bgTertiary, color: colors.textSecondary, border: `1px solid ${colors.border}` }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 py-2 rounded-lg font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                  {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Employee Form Modal
const EmployeeFormModal = ({ employee, machines, onSave, onClose, colors, isDark, isRTL }) => {
  const [form, setForm] = useState({
    employee_id: employee?.employee_id || '',
    name_en: employee?.name_en || '',
    name_ar: employee?.name_ar || '',
    department: employee?.department || 'production',
    role: employee?.role || 'operator',
    section: employee?.section || 'PCP-1',
    shift: employee?.shift || 'morning',
    phone: employee?.phone || '',
    status: employee?.status || 'active',
    assigned_machine_id: employee?.assigned_machine_id || '',
  });

  const machineIds = machines ? Object.keys(machines).sort() : [];
  const inputStyle = { background: colors.bgTertiary, border: `1px solid ${colors.border}`, color: colors.textPrimary };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, assigned_machine_id: form.assigned_machine_id || null });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            {employee ? (isRTL ? 'تعديل موظف' : 'Edit Employee') : (isRTL ? 'إضافة موظف' : 'Add Employee')}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: colors.bgTertiary }}>
            <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Badge + Name row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'رقم البطاقة' : 'Badge #'}
              </label>
              <input type="text" value={form.employee_id} required
                onChange={(e) => setForm(p => ({ ...p, employee_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}
                placeholder="EMP001" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
              </label>
              <input type="text" value={form.name_en} required
                onChange={(e) => setForm(p => ({ ...p, name_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
              </label>
              <input type="text" value={form.name_ar} required dir="rtl"
                onChange={(e) => setForm(p => ({ ...p, name_ar: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
            </div>
          </div>

          {/* Department + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'القسم' : 'Department'}
              </label>
              <select value={form.department} onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                {Object.entries(deptConfig).map(([k, v]) => (
                  <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'الدور' : 'Role'}
              </label>
              <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                {Object.entries(roleConfig).map(([k, v]) => (
                  <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section + Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'المنطقة' : 'Section'}
              </label>
              <select value={form.section} onChange={(e) => setForm(p => ({ ...p, section: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'الوردية' : 'Shift'}
              </label>
              <select value={form.shift} onChange={(e) => setForm(p => ({ ...p, shift: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                {Object.entries(shiftConfig).map(([k, v]) => (
                  <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'الهاتف' : 'Phone'}
              </label>
              <input type="text" value={form.phone}
                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}
                placeholder="05xxxxxxxx" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'الحالة' : 'Status'}
              </label>
              <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <option key={k} value={k}>{isRTL ? v.ar : v.en}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Machine (only for production) */}
          {form.department === 'production' && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {isRTL ? 'الماكينة المعينة' : 'Assigned Machine'}
              </label>
              <select value={form.assigned_machine_id || ''}
                onChange={(e) => setForm(p => ({ ...p, assigned_machine_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle}>
                <option value="">{isRTL ? 'بدون تعيين' : 'Not Assigned'}</option>
                {machineIds.map(id => (
                  <option key={id} value={id}>{id} {machines[id]?.name ? `- ${machines[id].name}` : ''}</option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg font-medium"
              style={{ background: colors.bgTertiary, color: colors.textSecondary, border: `1px solid ${colors.border}` }}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit"
              className="flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #F39200, #CC7A00)', color: 'white' }}>
              <Save className="w-4 h-4" />
              {employee ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Workforce;
