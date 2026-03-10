/**
 * Maintenance Page
 * Saudi Cable Company - Maintenance, Machine Status & Rain Impact Dashboard
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  CloudRain,
  Settings,
  Plus,
  X,
  Save,
  Activity,
  TrendingDown,
  Zap,
  Cog,
  XCircle,
  DollarSign,
  Database,
  ClipboardList,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const COLORS = ['#10B981', '#F39200', '#EF4444', '#3B82F6', '#8B5CF6'];

const Maintenance = () => {
  const { t, isRTL } = useLanguage();
  const { isDark, colors } = useTheme();
  const { machineStatusData, rainImpactData, maintenance, machines, employees } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTask, setShowAddTask] = useState(false);

  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  // Quick access links to other maintenance pages
  const quickLinks = [
    {
      id: 'machineManagement',
      icon: Database,
      path: '/machineManagement',
      labelEn: 'Machine Management',
      labelAr: 'إدارة المكائن',
      descEn: 'View & manage all machines',
      descAr: 'عرض وإدارة جميع المكائن',
      color: '#F39200',
    },
    {
      id: 'maintenanceChecklist',
      icon: ClipboardList,
      path: '/maintenanceChecklist',
      labelEn: 'Maintenance Checklist',
      labelAr: 'شيك ليست الصيانة',
      descEn: 'PM checklists & inspections',
      descAr: 'قوائم فحص الصيانة الوقائية',
      color: '#10B981',
    },
    {
      id: 'pmSchedule',
      icon: CalendarDays,
      path: '/pmSchedule',
      labelEn: 'PM Annual Schedule',
      labelAr: 'جدول الصيانة السنوي',
      descEn: 'Annual preventive maintenance plan',
      descAr: 'خطة الصيانة الوقائية السنوية',
      color: '#3B82F6',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'machineStatus', label: 'Machine Status', icon: Cog },
    { id: 'rainImpact', label: 'Rain Impact', icon: CloudRain },
    { id: 'workOrders', label: 'Work Orders', icon: Wrench },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: isDark ? '#FFFFFF' : '#1F2937' }}>
            {isRTL ? 'إدارة الصيانة' : 'Maintenance Management'}
          </h1>
          <p style={{ color: isDark ? '#D1D5DB' : '#6B7280' }}>
            {isRTL ? 'حالة الآلات وأوامر العمل' : 'Machine Status & Work Orders'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
          style={{
            background: 'linear-gradient(135deg, #F39200, #CC7A00)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(243, 146, 0, 0.3)',
          }}
        >
          <Plus className="w-4 h-4" />
          {isRTL ? 'مهمة جديدة' : 'New Task'}
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-white/80" />
            <div>
              <p className="text-white/80 text-sm">Still Active</p>
              <p className="text-3xl font-bold text-white">{machineStatusData.totals.stillActive}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #F39200, #CC7A00)' }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-white/80" />
            <div>
              <p className="text-white/80 text-sm">Active with B.D.</p>
              <p className="text-3xl font-bold text-white">{machineStatusData.totals.activeWithBD}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
        >
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-white/80" />
            <div>
              <p className="text-white/80 text-sm">In-Active</p>
              <p className="text-3xl font-bold text-white">{machineStatusData.totals.inActive}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #6B7280, #4B5563)' }}
        >
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-white/80" />
            <div>
              <p className="text-white/80 text-sm">Write Off</p>
              <p className="text-3xl font-bold text-white">{machineStatusData.totals.writeOff}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-white/80" />
            <div>
              <p className="text-white/80 text-sm">Total Machines</p>
              <p className="text-3xl font-bold text-white">{machineStatusData.totals.total}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Access Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <motion.button
              key={link.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
              style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                direction: isRTL ? 'rtl' : 'ltr',
              }}
            >
              <div
                className="p-3 rounded-xl flex-shrink-0"
                style={{ background: `${link.color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color: link.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                  {isRTL ? link.labelAr : link.labelEn}
                </p>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                  {isRTL ? link.descAr : link.descEn}
                </p>
              </div>
              <Arrow className="w-5 h-5 flex-shrink-0" style={{ color: colors.textMuted }} />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={activeTab === tab.id ? {
                background: 'linear-gradient(135deg, #F39200, #CC7A00)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(243, 146, 0, 0.35)'
              } : {
                background: colors.bgCard,
                color: colors.textSecondary,
                border: `1px solid ${colors.border}`
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <OverviewTab
            key="overview"
            machineStatusData={machineStatusData}
            colors={colors}
            isDark={isDark}
          />
        )}
        {activeTab === 'machineStatus' && (
          <MachineStatusTab
            key="machineStatus"
            machineStatusData={machineStatusData}
            colors={colors}
            isDark={isDark}
          />
        )}
        {activeTab === 'rainImpact' && (
          <RainImpactTab
            key="rainImpact"
            rainImpactData={rainImpactData}
            colors={colors}
            isDark={isDark}
          />
        )}
        {activeTab === 'workOrders' && (
          <WorkOrdersTab
            key="workOrders"
            maintenance={maintenance}
            colors={colors}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <AddTaskModal
            onClose={() => setShowAddTask(false)}
            colors={colors}
            isDark={isDark}
            machines={machines}
            employees={employees}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ machineStatusData, colors, isDark }) => {
  const chartData = machineStatusData.bySection.map(s => ({
    name: s.section.length > 12 ? s.section.substring(0, 12) + '...' : s.section,
    'Still Active': s.stillActive,
    'With B.D.': s.activeWithBD,
    'In-Active': s.inActive,
    'Write Off': s.writeOff,
  }));

  const pieData = [
    { name: 'Still Active', value: machineStatusData.totals.stillActive, color: '#10B981' },
    { name: 'Active with B.D.', value: machineStatusData.totals.activeWithBD, color: '#F39200' },
    { name: 'In-Active', value: machineStatusData.totals.inActive, color: '#EF4444' },
    { name: 'Write Off', value: machineStatusData.totals.writeOff, color: '#6B7280' },
    { name: 'Sale', value: machineStatusData.totals.sale, color: '#3B82F6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div
          className="rounded-2xl p-6"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
            Machine Status by Section
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="name" stroke={colors.textSecondary} fontSize={10} />
              <YAxis stroke={colors.textSecondary} />
              <Tooltip
                contentStyle={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="Still Active" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="With B.D." fill="#F39200" radius={[2, 2, 0, 0]} />
              <Bar dataKey="In-Active" fill="#EF4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Write Off" fill="#6B7280" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          className="rounded-2xl p-6"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
            Overall Machine Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        className="rounded-2xl p-6"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Operational Efficiency
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ background: colors.bgTertiary }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Active Rate</p>
            <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
              {((machineStatusData.totals.stillActive / machineStatusData.totals.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: colors.bgTertiary }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>B.D. Rate</p>
            <p className="text-2xl font-bold" style={{ color: '#F39200' }}>
              {((machineStatusData.totals.activeWithBD / machineStatusData.totals.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: colors.bgTertiary }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Downtime Rate</p>
            <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
              {((machineStatusData.totals.inActive / machineStatusData.totals.total) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: colors.bgTertiary }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Available for Sale</p>
            <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>{machineStatusData.totals.sale}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Machine Status Tab
const MachineStatusTab = ({ machineStatusData, colors, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <div className="p-4" style={{ background: isDark ? 'rgba(243,146,0,0.1)' : 'rgba(243,146,0,0.05)' }}>
          <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
            Machines Status - Active/Active with BD/In-active/Write-off/Sale
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: colors.bgTertiary }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>Section</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: '#10B981' }}>Still Active</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: '#F39200' }}>Active with B.D.</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: '#EF4444' }}>In-Active</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: '#6B7280' }}>Write off</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: '#3B82F6' }}>Sale</th>
                <th className="text-center py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {machineStatusData.bySection.map((section, idx) => (
                <motion.tr
                  key={section.section}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <td className="py-4 px-4 font-medium" style={{ color: colors.textPrimary }}>{section.section}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 rounded-full font-mono font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                      {section.stillActive}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 rounded-full font-mono font-bold" style={{ background: 'rgba(243,146,0,0.15)', color: '#F39200' }}>
                      {section.activeWithBD}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 rounded-full font-mono font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                      {section.inActive}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 rounded-full font-mono font-bold" style={{ background: 'rgba(107,114,128,0.15)', color: '#6B7280' }}>
                      {section.writeOff}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-3 py-1 rounded-full font-mono font-bold" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
                      {section.sale}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold" style={{ color: colors.textPrimary }}>{section.total}</td>
                </motion.tr>
              ))}
              <tr style={{ background: isDark ? 'rgba(243,146,0,0.15)' : 'rgba(243,146,0,0.1)' }}>
                <td className="py-4 px-4 font-bold" style={{ color: '#F39200' }}>TOTAL</td>
                <td className="py-4 px-4 text-center font-bold" style={{ color: '#10B981' }}>{machineStatusData.totals.stillActive}</td>
                <td className="py-4 px-4 text-center font-bold" style={{ color: '#F39200' }}>{machineStatusData.totals.activeWithBD}</td>
                <td className="py-4 px-4 text-center font-bold" style={{ color: '#EF4444' }}>{machineStatusData.totals.inActive}</td>
                <td className="py-4 px-4 text-center font-bold" style={{ color: '#6B7280' }}>{machineStatusData.totals.writeOff}</td>
                <td className="py-4 px-4 text-center font-bold" style={{ color: '#3B82F6' }}>{machineStatusData.totals.sale}</td>
                <td className="py-4 px-4 text-center font-bold" style={{ color: '#F39200' }}>{machineStatusData.totals.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Rain Impact Tab
const RainImpactTab = ({ rainImpactData, colors, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          border: '1px solid rgba(96,165,250,0.5)',
          boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
        }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <CloudRain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Rain Impact Report - {rainImpactData.affectedArea}
            </h3>
            <p className="text-white/90 mt-1">
              <span className="font-semibold">Reason:</span> {rainImpactData.reason}
            </p>
            <p className="text-white/90 mt-1">
              <span className="font-semibold">Root Cause:</span> {rainImpactData.rootCause}
            </p>
            <p className="text-sm mt-2 text-white/70">
              Report Date: {rainImpactData.reportDate}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5 text-center"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" style={{ color: '#F39200' }} />
          <p style={{ color: colors.textSecondary }}>Total Affected</p>
          <p className="text-3xl font-bold" style={{ color: '#F39200' }}>{rainImpactData.totalAffected}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-5 text-center"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#10B981' }} />
          <p style={{ color: colors.textSecondary }}>Resolved</p>
          <p className="text-3xl font-bold" style={{ color: '#10B981' }}>{rainImpactData.resolved}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-5 text-center"
          style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        >
          <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: '#EF4444' }} />
          <p style={{ color: colors.textSecondary }}>In Progress</p>
          <p className="text-3xl font-bold" style={{ color: '#EF4444' }}>{rainImpactData.inProgress}</p>
        </motion.div>
      </div>

      {/* Affected Machines - Hexagonal Layout */}
      <motion.div
        className="rounded-2xl p-6"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <h3 className="text-lg font-semibold mb-6 text-center" style={{ color: colors.textPrimary }}>
          Affected Machines due to Recent Rain
        </h3>

        <div className="flex flex-wrap justify-center gap-4">
          {rainImpactData.affectedMachines.map((machine, idx) => (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative w-32 h-32 flex flex-col items-center justify-center rounded-2xl text-center"
              style={{
                background: `linear-gradient(135deg, ${machine.color}, ${machine.color}cc)`,
                boxShadow: `0 4px 20px ${machine.color}40`
              }}
            >
              <p className="text-xl font-bold text-white">{machine.id}</p>
              <p className="text-xs text-white/80 mt-1 px-2">{machine.issue}</p>
              <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                machine.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {machine.status === 'resolved' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <Clock className="w-4 h-4 text-white" />
                )}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Center Info */}
        <div className="mt-6 p-4 rounded-xl text-center" style={{ background: colors.bgTertiary }}>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Affected machines due to recent rain - {rainImpactData.affectedArea} only due to {rainImpactData.rootCause}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Work Orders Tab
const WorkOrdersTab = ({ maintenance, colors, isDark }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return '#3B82F6';
      case 'pending': return '#F39200';
      case 'completed': return '#10B981';
      default: return colors.textSecondary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'preventive': return '🔧';
      case 'corrective': return '⚠️';
      case 'predictive': return '📊';
      default: return '🔩';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Work Orders List */}
      <motion.div
        className="rounded-2xl p-6"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
          Active Work Orders
        </h3>
        <div className="space-y-4">
          {maintenance.map((wo, idx) => (
            <motion.div
              key={wo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{getTypeIcon(wo.type)}</span>
                <div>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>{wo.id}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Machine: {wo.machine} • {wo.description}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    Assigned to: {wo.assignee}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                  style={{
                    background: `${getStatusColor(wo.status)}20`,
                    color: getStatusColor(wo.status)
                  }}
                >
                  {wo.status}
                </span>
                <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                  {wo.type}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scheduled Maintenance */}
      <motion.div
        className="rounded-2xl p-6"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <h3 className="text-lg font-semibold mb-6" style={{ color: colors.textPrimary }}>
          Upcoming Scheduled Maintenance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { machine: 'BC-1', date: 'Tomorrow', type: 'Oil Change', priority: 'high' },
            { machine: 'XT-15', date: 'Feb 7', type: 'Belt Inspection', priority: 'medium' },
            { machine: 'XL-2', date: 'Feb 10', type: 'Full Service', priority: 'low' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-xl"
              style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold" style={{ color: colors.textPrimary }}>{item.machine}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.priority === 'high' ? 'bg-red-100 text-red-600' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {item.priority}
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>{item.type}</p>
              <p className="text-sm mt-2" style={{ color: '#F39200' }}>{item.date}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Add Task Modal
const AddTaskModal = ({ onClose, colors, isDark, machines, employees = [] }) => {
  const [formData, setFormData] = useState({
    machine: '',
    type: 'preventive',
    description: '',
    priority: 'medium',
    assignee: '',
  });

  const machineIds = machines ? Object.keys(machines).sort() : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Task:', formData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>New Maintenance Task</h3>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ background: colors.bgTertiary }}>
            <X className="w-4 h-4" style={{ color: colors.textSecondary }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Machine ID</label>
            <select
              value={formData.machine}
              onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
              className="w-full px-4 py-2 rounded-lg"
              style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
              required
            >
              <option value="">-- Select Machine --</option>
              {machineIds.map((id) => (
                <option key={id} value={id}>
                  {id} {machines[id]?.name ? `- ${machines[id].name}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Task Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 rounded-lg"
              style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
            >
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="predictive">Predictive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg"
              style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 rounded-lg"
                style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Assignee</label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-4 py-2 rounded-lg"
                style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
              >
                <option value="">-- Select Assignee --</option>
                {employees
                  .filter(emp => emp.status === 'active' && emp.department === 'maintenance')
                  .map(emp => (
                    <option key={emp.id || emp.employee_id} value={emp.name_en}>
                      {emp.employee_id} - {emp.name_en}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg font-medium"
              style={{ background: colors.bgTertiary, color: colors.textSecondary, border: `1px solid ${colors.border}` }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #F39200, #CC7A00)', color: 'white' }}
            >
              <Save className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Maintenance;
