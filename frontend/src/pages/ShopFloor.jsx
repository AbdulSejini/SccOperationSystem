/**
 * Shop Floor Page
 * Digital operator interface for shop floor monitoring
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

const ShopFloor = () => {
  const { t, isRTL } = useLanguage();
  const { isDark, colors } = useTheme();
  const { machines: machinesObj } = useData();
  const [activeSection, setActiveSection] = useState(null);
  const [productionLogs, setProductionLogs] = useState([]);
  const [downtimeLogs, setDowntimeLogs] = useState([]);

  // Convert machines object to array for dropdowns
  const machines = Object.values(machinesObj || {}).sort((a, b) => a.id.localeCompare(b.id));

  const loadData = () => {
    // machines already loaded from DataContext
    // production/downtime logs would come from Supabase in the future
  };

  const sections = [
    {
      id: 'production',
      label: 'Production Log',
      icon: '📊',
      description: 'Record production output'
    },
    {
      id: 'downtime',
      label: 'Downtime Tracking',
      icon: '⏸️',
      description: 'Log machine downtime'
    },
    {
      id: 'quality',
      label: 'Quality Check',
      icon: '✅',
      description: 'Perform quality inspections'
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'production':
        return (
          <ProductionLogSection
            logs={productionLogs}
            machines={machines}
            onRefresh={loadData}
            colors={colors}
            isDark={isDark}
          />
        );
      case 'downtime':
        return (
          <DowntimeSection
            logs={downtimeLogs}
            machines={machines}
            onRefresh={loadData}
            colors={colors}
            isDark={isDark}
          />
        );
      case 'quality':
        return <QualityCheckSection machines={machines} colors={colors} isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8"
        style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>{t('nav.shopFloor')}</h1>
        <p className="mb-6" style={{ color: colors.textSecondary }}>Digital operator interface for shop floor monitoring</p>

        {!activeSection ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setActiveSection(section.id)}
                className="p-6 rounded-xl cursor-pointer transition-all"
                style={{
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <span className="text-4xl mb-4 block">{section.icon}</span>
                <h3 className="text-lg font-medium mb-2" style={{ color: colors.textPrimary }}>{section.label}</h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{section.description}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(null)}
              className="mb-6 px-4 py-2 rounded-lg transition-all"
              style={{
                background: colors.bgTertiary,
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
              }}
            >
              ← Back to Menu
            </motion.button>
            {renderSection()}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Production Log Section Component
const ProductionLogSection = ({ logs, machines, onRefresh, colors, isDark }) => {
  const [formData, setFormData] = useState({
    machine_id: '',
    shift: 'A',
    output_quantity: '',
    output_unit: 'meters',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: integrate with Supabase production_logs table
      console.log('Production log submitted:', {
        ...formData,
        output_quantity: parseFloat(formData.output_quantity),
      });
      setFormData({
        machine_id: '',
        shift: 'A',
        output_quantity: '',
        output_unit: 'meters',
        notes: '',
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating production log:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Production Log Entry</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Machine</label>
          <select
            value={formData.machine_id}
            onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
            required
          >
            <option value="" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Select Machine</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id} style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>{m.id} - {m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Shift</label>
          <select
            value={formData.shift}
            onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          >
            <option value="A" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Shift A (6AM-2PM)</option>
            <option value="B" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Shift B (2PM-10PM)</option>
            <option value="C" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Shift C (10PM-6AM)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Output Quantity</label>
          <input
            type="number"
            value={formData.output_quantity}
            onChange={(e) => setFormData({ ...formData, output_quantity: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
            placeholder="Enter quantity"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Unit</label>
          <select
            value={formData.output_unit}
            onChange={(e) => setFormData({ ...formData, output_unit: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          >
            <option value="meters" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Meters</option>
            <option value="kg" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Kilograms</option>
            <option value="tons" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Tons</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
            rows={2}
            placeholder="Optional notes..."
          />
        </div>

        <div className="md:col-span-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600
                      text-white font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Production Log'}
          </motion.button>
        </div>
      </form>

      {/* Recent Logs */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4" style={{ color: colors.textPrimary }}>Recent Entries</h3>
        <div className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-center py-4" style={{ color: colors.textSecondary }}>No production logs yet</p>
          ) : (
            logs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="p-3 rounded-lg flex justify-between items-center" style={{ background: colors.bgTertiary }}>
                <div>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>Machine {log.machine_id}</span>
                  <span className="mx-2" style={{ color: colors.textMuted }}>•</span>
                  <span style={{ color: colors.textSecondary }}>Shift {log.shift}</span>
                </div>
                <span className="text-green-500 font-medium">
                  {log.output_quantity} {log.output_unit}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Downtime Section Component
const DowntimeSection = ({ logs, machines, onRefresh, colors, isDark }) => {
  const [formData, setFormData] = useState({
    machine_id: '',
    downtime_type: 'unplanned',
    reason: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  const inputStyle = {
    background: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Downtime Log Entry</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Machine</label>
          <select
            value={formData.machine_id}
            onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          >
            <option value="" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Select Machine</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id} style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>{m.id} - {m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Type</label>
          <select
            value={formData.downtime_type}
            onChange={(e) => setFormData({ ...formData, downtime_type: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          >
            <option value="unplanned" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Unplanned</option>
            <option value="planned" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Planned</option>
            <option value="changeover" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Changeover</option>
            <option value="maintenance" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Maintenance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Start Time</label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>End Time</label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Reason</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
            rows={2}
            placeholder="Describe the reason for downtime..."
          />
        </div>

        <div className="md:col-span-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600
                      text-white font-medium transition-colors"
          >
            Log Downtime
          </motion.button>
        </div>
      </div>

      {/* Recent Downtime */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4" style={{ color: colors.textPrimary }}>Recent Downtime</h3>
        <div className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-center py-4" style={{ color: colors.textSecondary }}>No downtime logs yet</p>
          ) : (
            logs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="p-3 rounded-lg flex justify-between items-center" style={{ background: colors.bgTertiary }}>
                <div>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>Machine {log.machine_id}</span>
                  <span className="mx-2" style={{ color: colors.textMuted }}>•</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    log.downtime_type === 'unplanned' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {log.downtime_type}
                  </span>
                </div>
                <span style={{ color: colors.textSecondary }}>{log.duration_minutes || '--'} min</span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Quality Check Section Component
const QualityCheckSection = ({ machines, colors, isDark }) => {
  const [formData, setFormData] = useState({
    machine_id: '',
    check_type: 'visual',
    result: 'pass',
    notes: '',
  });

  const inputStyle = {
    background: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Quality Check Entry</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Machine</label>
          <select
            value={formData.machine_id}
            onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          >
            <option value="" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Select Machine</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id} style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>{m.id} - {m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Check Type</label>
          <select
            value={formData.check_type}
            onChange={(e) => setFormData({ ...formData, check_type: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
          >
            <option value="visual" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Visual Inspection</option>
            <option value="dimensional" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Dimensional Check</option>
            <option value="electrical" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Electrical Test</option>
            <option value="material" style={{ background: isDark ? '#1F2937' : '#FFFFFF' }}>Material Test</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Result</label>
          <div className="flex gap-4">
            {['pass', 'fail', 'conditional'].map((result) => (
              <motion.button
                key={result}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, result })}
                className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                  formData.result === result
                    ? result === 'pass'
                      ? 'bg-green-500/20 border-green-500 text-green-500'
                      : result === 'fail'
                      ? 'bg-red-500/20 border-red-500 text-red-500'
                      : 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                    : ''
                }`}
                style={formData.result !== result ? { background: colors.bgTertiary, borderColor: colors.border, color: colors.textSecondary } : {}}
              >
                {result.charAt(0).toUpperCase() + result.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 rounded-lg"
            style={inputStyle}
            rows={3}
            placeholder="Add inspection notes..."
          />
        </div>

        <div className="md:col-span-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600
                      text-white font-medium transition-colors"
          >
            Submit Quality Check
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopFloor;
