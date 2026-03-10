/**
 * Department Workspace
 * Per-department entry page: /dept/:dimension
 * Shows all machines with this dimension's status + inline assessment form
 * Bilingual: Arabic / English
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllProfiles, getProfile, saveDimension,
  submitDimension, approveDimension, rejectDimension,
  getProfileCompleteness,
} from '../services/machineProfileService';
import {
  Wrench, DollarSign, Factory, Shield, Star, Monitor,
  ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle,
  XCircle, ChevronDown, ChevronUp, Send, ThumbsUp, ThumbsDown,
  RefreshCw, Search, Filter, User, FileText, Save,
  ChevronRight, ChevronLeft,
} from 'lucide-react';

// ─── Department Config ────────────────────────────────────────────────────────
const DEPT_CONFIG = {
  maintenance: {
    icon: Wrench, color: '#F39200', glow: 'rgba(243,146,0,0.2)',
    en: 'Maintenance', ar: 'الصيانة',
    desc_en: 'Equipment health, upkeep & reliability assessment',
    desc_ar: 'تقييم صحة المعدات والصيانة والموثوقية',
    weight: '30%',
    fields: [
      { id: 'score', label_en: 'Assessment Score', label_ar: 'درجة التقييم', type: 'number', min: 1, max: 5, step: 0.1, placeholder_en: '1.0 – 5.0', placeholder_ar: '١.٠ – ٥.٠' },
      { id: 'last_maintenance', label_en: 'Last Maintenance Date', label_ar: 'تاريخ آخر صيانة', type: 'date' },
      { id: 'maintenance_frequency', label_en: 'Maintenance Frequency', label_ar: 'تكرار الصيانة', type: 'select',
        options: [
          { value: 'monthly', en: 'Monthly', ar: 'شهرياً' },
          { value: 'quarterly', en: 'Quarterly', ar: 'ربع سنوي' },
          { value: 'biannual', en: 'Bi-Annual', ar: 'نصف سنوي' },
          { value: 'annual', en: 'Annual', ar: 'سنوي' },
        ]},
      { id: 'condition', label_en: 'Equipment Condition', label_ar: 'حالة المعدة', type: 'select',
        options: [
          { value: 'excellent', en: 'Excellent', ar: 'ممتازة' },
          { value: 'good', en: 'Good', ar: 'جيدة' },
          { value: 'fair', en: 'Fair', ar: 'مقبولة' },
          { value: 'poor', en: 'Poor', ar: 'ضعيفة' },
        ]},
      { id: 'notes', label_en: 'Notes', label_ar: 'ملاحظات', type: 'textarea' },
    ],
  },
  finance: {
    icon: DollarSign, color: '#818CF8', glow: 'rgba(129,140,248,0.2)',
    en: 'Finance', ar: 'المالية',
    desc_en: 'Asset value, replacement cost & financial analysis',
    desc_ar: 'قيمة الأصول وتكلفة الاستبدال والتحليل المالي',
    weight: '25%',
    fields: [
      { id: 'score', label_en: 'Assessment Score', label_ar: 'درجة التقييم', type: 'number', min: 1, max: 5, step: 0.1, placeholder_en: '1.0 – 5.0', placeholder_ar: '١.٠ – ٥.٠' },
      { id: 'purchase_value', label_en: 'Purchase Value (SAR)', label_ar: 'قيمة الشراء (ريال)', type: 'number' },
      { id: 'current_value', label_en: 'Current Value (SAR)', label_ar: 'القيمة الحالية (ريال)', type: 'number' },
      { id: 'replacement_cost', label_en: 'Replacement Cost (SAR)', label_ar: 'تكلفة الاستبدال (ريال)', type: 'number' },
      { id: 'depreciation_rate', label_en: 'Annual Depreciation (%)', label_ar: 'الإهلاك السنوي (%)', type: 'number', min: 0, max: 100, step: 0.5 },
      { id: 'notes', label_en: 'Notes', label_ar: 'ملاحظات', type: 'textarea' },
    ],
  },
  production: {
    icon: Factory, color: '#34D399', glow: 'rgba(52,211,153,0.2)',
    en: 'Production', ar: 'الإنتاج',
    desc_en: 'Output efficiency, OEE & production capacity assessment',
    desc_ar: 'تقييم كفاءة الإنتاج والـ OEE والطاقة الإنتاجية',
    weight: '30%',
    fields: [
      { id: 'score', label_en: 'Assessment Score', label_ar: 'درجة التقييم', type: 'number', min: 1, max: 5, step: 0.1, placeholder_en: '1.0 – 5.0', placeholder_ar: '١.٠ – ٥.٠' },
      { id: 'oee', label_en: 'OEE (%)', label_ar: 'OEE (%)', type: 'number', min: 0, max: 100, step: 0.1 },
      { id: 'availability', label_en: 'Availability (%)', label_ar: 'التوفر (%)', type: 'number', min: 0, max: 100, step: 0.1 },
      { id: 'utilization', label_en: 'Utilization (%)', label_ar: 'الاستخدام (%)', type: 'number', min: 0, max: 100, step: 0.1 },
      { id: 'production_status', label_en: 'Production Status', label_ar: 'حالة الإنتاج', type: 'select',
        options: [
          { value: 'active', en: 'Active', ar: 'نشطة' },
          { value: 'standby', en: 'Standby', ar: 'احتياطية' },
          { value: 'low', en: 'Low Utilization', ar: 'استخدام منخفض' },
          { value: 'idle', en: 'Idle', ar: 'خاملة' },
        ]},
      { id: 'notes', label_en: 'Notes', label_ar: 'ملاحظات', type: 'textarea' },
    ],
  },
  hse: {
    icon: Shield, color: '#F87171', glow: 'rgba(248,113,113,0.2)',
    en: 'HSE', ar: 'الصحة والسلامة',
    desc_en: 'Health, safety & environmental risk assessment',
    desc_ar: 'تقييم مخاطر الصحة والسلامة والبيئة',
    weight: '15%',
    fields: [
      { id: 'score', label_en: 'Assessment Score', label_ar: 'درجة التقييم', type: 'number', min: 1, max: 5, step: 0.1, placeholder_en: '1.0 – 5.0', placeholder_ar: '١.٠ – ٥.٠' },
      { id: 'risk_level', label_en: 'Risk Level', label_ar: 'مستوى الخطر', type: 'select',
        options: [
          { value: 'low', en: 'Low', ar: 'منخفض' },
          { value: 'medium', en: 'Medium', ar: 'متوسط' },
          { value: 'high', en: 'High', ar: 'مرتفع' },
          { value: 'critical', en: 'Critical', ar: 'حرج' },
        ]},
      { id: 'last_inspection', label_en: 'Last Safety Inspection', label_ar: 'آخر فحص سلامة', type: 'date' },
      { id: 'incidents_count', label_en: 'Incidents (Last 12 months)', label_ar: 'الحوادث (آخر 12 شهر)', type: 'number', min: 0 },
      { id: 'ppe_required', label_en: 'PPE Requirements', label_ar: 'متطلبات وسائل الحماية', type: 'text' },
      { id: 'notes', label_en: 'Notes', label_ar: 'ملاحظات', type: 'textarea' },
    ],
  },
  quality: {
    icon: Star, color: '#60A5FA', glow: 'rgba(96,165,250,0.2)',
    en: 'Quality', ar: 'الجودة',
    desc_en: 'Quality compliance, certifications & defect analysis',
    desc_ar: 'امتثال الجودة والشهادات وتحليل العيوب',
    weight: null,
    fields: [
      { id: 'score', label_en: 'Assessment Score', label_ar: 'درجة التقييم', type: 'number', min: 1, max: 5, step: 0.1, placeholder_en: '1.0 – 5.0', placeholder_ar: '١.٠ – ٥.٠' },
      { id: 'defect_rate', label_en: 'Defect Rate (%)', label_ar: 'معدل العيوب (%)', type: 'number', min: 0, max: 100, step: 0.01 },
      { id: 'quality_standard', label_en: 'Quality Standard', label_ar: 'معيار الجودة', type: 'select',
        options: [
          { value: 'iso9001', en: 'ISO 9001', ar: 'ISO 9001' },
          { value: 'iec', en: 'IEC Standards', ar: 'معايير IEC' },
          { value: 'saso', en: 'SASO', ar: 'هيئة المواصفات' },
          { value: 'other', en: 'Other', ar: 'أخرى' },
        ]},
      { id: 'last_audit', label_en: 'Last Quality Audit', label_ar: 'آخر مراجعة جودة', type: 'date' },
      { id: 'notes', label_en: 'Notes', label_ar: 'ملاحظات', type: 'textarea' },
    ],
  },
  it_sap: {
    icon: Monitor, color: '#A78BFA', glow: 'rgba(167,139,250,0.2)',
    en: 'IT / SAP', ar: 'IT / SAP',
    desc_en: 'Digital integration, SAP connectivity & system status',
    desc_ar: 'التكامل الرقمي واتصال SAP وحالة الأنظمة',
    weight: null,
    fields: [
      { id: 'score', label_en: 'Assessment Score', label_ar: 'درجة التقييم', type: 'number', min: 1, max: 5, step: 0.1, placeholder_en: '1.0 – 5.0', placeholder_ar: '١.٠ – ٥.٠' },
      { id: 'sap_integrated', label_en: 'SAP Integration', label_ar: 'التكامل مع SAP', type: 'select',
        options: [
          { value: 'full', en: 'Fully Integrated', ar: 'متكامل كلياً' },
          { value: 'partial', en: 'Partially Integrated', ar: 'متكامل جزئياً' },
          { value: 'none', en: 'Not Integrated', ar: 'غير متكامل' },
        ]},
      { id: 'plc_type', label_en: 'PLC / Control System', label_ar: 'نوع نظام التحكم', type: 'text' },
      { id: 'connectivity', label_en: 'Network Connectivity', label_ar: 'الاتصال الشبكي', type: 'select',
        options: [
          { value: 'connected', en: 'Connected', ar: 'متصل' },
          { value: 'offline', en: 'Offline', ar: 'غير متصل' },
          { value: 'manual', en: 'Manual Only', ar: 'يدوي فقط' },
        ]},
      { id: 'digital_maturity', label_en: 'Digital Maturity Level', label_ar: 'مستوى النضج الرقمي', type: 'select',
        options: [
          { value: '1', en: 'Level 1 – Basic', ar: 'مستوى ١ – أساسي' },
          { value: '2', en: 'Level 2 – Connected', ar: 'مستوى ٢ – متصل' },
          { value: '3', en: 'Level 3 – Automated', ar: 'مستوى ٣ – آلي' },
          { value: '4', en: 'Level 4 – Intelligent', ar: 'مستوى ٤ – ذكي' },
        ]},
      { id: 'notes', label_en: 'Notes', label_ar: 'ملاحظات', type: 'textarea' },
    ],
  },
};

const STATUS_LABEL = {
  pending:   { en: 'Pending',   ar: 'معلق',        color: '#6B7280' },
  in_review: { en: 'In Review', ar: 'قيد المراجعة', color: '#EAB308' },
  submitted: { en: 'Submitted', ar: 'مُرسل',        color: '#3B82F6' },
  approved:  { en: 'Approved',  ar: 'معتمد',        color: '#22C55E' },
  rejected:  { en: 'Rejected',  ar: 'مرفوض',        color: '#EF4444' },
};

// ─── Form Field ───────────────────────────────────────────────────────────────
const FormField = ({ field, value, onChange, isRTL, color }) => {
  const label = isRTL ? field.label_ar : field.label_en;
  const base  = "w-full bg-white/[0.07] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors";
  const focusStyle = { '--focus-color': color };

  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
        <select
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${base} focus:border-current`}
          style={{ color: value ? 'white' : '#6B7280' }}
        >
          <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
          {field.options.map(o => (
            <option key={o.value} value={o.value}>{isRTL ? o.ar : o.en}</option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === 'textarea') {
    return (
      <div className="sm:col-span-2">
        <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
        <textarea
          value={value || ''}
          onChange={e => onChange(field.id, e.target.value)}
          rows={3}
          placeholder={isRTL ? 'أدخل ملاحظاتك...' : 'Enter notes...'}
          className={`${base} resize-none`}
        />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        type={field.type}
        value={value || ''}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={isRTL ? (field.placeholder_ar || '') : (field.placeholder_en || '')}
        onChange={e => onChange(field.id, e.target.value)}
        className={`${base}`}
      />
    </div>
  );
};

// ─── Inline Assessment Panel ──────────────────────────────────────────────────
const AssessmentPanel = ({ machineId, dimension, config, dimData, onSaved, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  const [form, setForm]     = useState({ ...dimData });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving]   = useState(false);
  const [rejecting, setRejecting]   = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleChange = (id, val) => setForm(p => ({ ...p, [id]: val }));

  const handleSave = async () => {
    setSaving(true);
    await saveDimension(machineId, dimension, { ...form, status: form.status || 'in_review' });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitDimension(machineId, dimension, form, 'Current User');
    setSubmitting(false); onSaved();
  };

  const handleApprove = async () => {
    setApproving(true);
    await approveDimension(machineId, dimension, 'Current User');
    setApproving(false); onSaved();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    await rejectDimension(machineId, dimension, 'Current User', rejectReason);
    setRejecting(false); setShowReject(false); onSaved();
  };

  const status = dimData?.status || 'pending';
  const color  = config.color;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div
        className="mx-4 mb-3 rounded-2xl border p-5"
        style={{ borderColor: `${color}30`, background: `${color}08` }}
      >
        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {config.fields.map(field => (
            <FormField
              key={field.id}
              field={field}
              value={form[field.id]}
              onChange={handleChange}
              isRTL={isRTL}
              color={color}
            />
          ))}
        </div>

        {/* Submitted by (read-only if submitted/approved) */}
        {dimData?.submitted_by && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
            <User className="w-3.5 h-3.5" />
            <span>{t('Submitted by:', 'أُرسل بواسطة:')} {dimData.submitted_by}</span>
            {dimData.submitted_at && (
              <span className="opacity-60">
                {' · '}{new Date(dimData.submitted_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
              </span>
            )}
          </div>
        )}

        {/* Reject reason input */}
        <AnimatePresence>
          {showReject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <input
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder={t('Rejection reason...', 'سبب الرفض...')}
                className="w-full bg-white/[0.07] border border-[#EF4444]/30 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#EF4444]/60"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Save Draft */}
          {status !== 'approved' && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? t('Saved!', 'تم الحفظ!') : t('Save Draft', 'حفظ مسودة')}
            </motion.button>
          )}

          {/* Submit */}
          {(status === 'pending' || status === 'in_review' || status === 'rejected') && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#3B82F6] text-sm font-medium hover:bg-[#3B82F6]/30 transition-all"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {t('Submit for Approval', 'إرسال للاعتماد')}
            </motion.button>
          )}

          {/* Approve */}
          {status === 'submitted' && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleApprove}
              disabled={approving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] text-sm font-medium hover:bg-[#22C55E]/30 transition-all"
            >
              {approving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
              {t('Approve', 'اعتماد')}
            </motion.button>
          )}

          {/* Reject */}
          {(status === 'submitted' || status === 'approved') && (
            <>
              {!showReject ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowReject(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/20 transition-all"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {t('Reject', 'رفض')}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/30 transition-all disabled:opacity-50"
                >
                  {rejecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  {t('Confirm Reject', 'تأكيد الرفض')}
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Machine Row ──────────────────────────────────────────────────────────────
const MachineRow = ({ profile, dimension, config, isExpanded, onToggle, onSaved, isRTL, delay }) => {
  const t      = (en, ar) => isRTL ? ar : en;
  const dimData = profile.dimensions?.[dimension];
  const status = dimData?.status || 'pending';
  const statusCfg = STATUS_LABEL[status];
  const ExpandIcon = isExpanded ? ChevronUp : ChevronDown;
  const score  = dimData?.score;

  return (
    <div className="border-b border-white/5 last:border-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
        onClick={onToggle}
        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/[0.03] transition-colors group ${isExpanded ? 'bg-white/[0.04]' : ''}`}
      >
        {/* Machine ID */}
        <div className="w-20 shrink-0">
          <span className="text-sm font-bold text-white">{profile.machine_id}</span>
        </div>

        {/* Description */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-sm text-gray-300 truncate">{profile.description}</p>
          <p className="text-[10px] text-gray-500 truncate">{profile.manufacturer}</p>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ color: statusCfg.color, background: `${statusCfg.color}20` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
            {isRTL ? statusCfg.ar : statusCfg.en}
          </span>
        </div>

        {/* Score */}
        <div className="w-12 text-center shrink-0">
          {score ? (
            <span className="text-sm font-bold" style={{ color: config.color }}>{Number(score).toFixed(1)}</span>
          ) : (
            <span className="text-xs text-gray-600">—</span>
          )}
        </div>

        {/* Expand */}
        <div className="shrink-0">
          <ExpandIcon
            className="w-4 h-4 transition-transform"
            style={{ color: isExpanded ? config.color : '#4B5563' }}
          />
        </div>
      </motion.div>

      {/* Inline Panel */}
      <AnimatePresence>
        {isExpanded && (
          <AssessmentPanel
            machineId={profile.machine_id}
            dimension={dimension}
            config={config}
            dimData={dimData}
            onSaved={onSaved}
            isRTL={isRTL}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DepartmentWorkspace = () => {
  const { dimension }      = useParams();
  const { isRTL }          = useLanguage();
  const navigate           = useNavigate();
  const config             = DEPT_CONFIG[dimension];

  const [profiles, setProfiles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const t = (en, ar) => isRTL ? ar : en;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAllProfiles();
      setProfiles(data);
      setLoading(false);
    })();
  }, [refreshKey]);

  const handleSaved = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const dimStats = useMemo(() => {
    const total     = profiles.length;
    const approved  = profiles.filter(p => p.dimensions[dimension]?.status === 'approved').length;
    const submitted = profiles.filter(p => p.dimensions[dimension]?.status === 'submitted').length;
    const inReview  = profiles.filter(p => p.dimensions[dimension]?.status === 'in_review').length;
    const pending   = total - approved - submitted - inReview;
    return { total, approved, submitted, inReview, pending, pct: total > 0 ? Math.round((approved/total)*100) : 0 };
  }, [profiles, dimension]);

  // ── Filtered ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return profiles.filter(p => {
      if (q && !p.machine_id.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      if (filterStatus !== 'all') {
        const s = p.dimensions[dimension]?.status || 'pending';
        if (s !== filterStatus) return false;
      }
      return true;
    });
  }, [profiles, search, filterStatus, dimension]);

  if (!config) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>{t('Unknown department', 'إدارة غير معروفة')}: {dimension}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <RefreshCw className="w-6 h-6" style={{ color: config.color }} />
        </motion.div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <button
          onClick={() => navigate('/')}
          className="mt-1 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          <BackIcon className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${config.color}20`, border: `1px solid ${config.color}40` }}>
              <Icon className="w-4.5 h-4.5" style={{ color: config.color }} />
            </div>
            <h1 className="text-xl font-black text-white">
              {t(config.en, config.ar)}
            </h1>
            {config.weight && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${config.color}20`, color: config.color }}>
                {t(`Weight: ${config.weight}`, `الوزن: ${config.weight}`)}
              </span>
            )}
            {!config.weight && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                {t('Optional', 'اختياري')}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm" style={{ marginInlineStart: '3rem' }}>
            {t(config.desc_en, config.desc_ar)}
          </p>
        </div>
      </motion.div>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
      >
        {[
          { label_en: 'Total', label_ar: 'الإجمالي', value: dimStats.total, color: '#94A3B8' },
          { label_en: 'Approved', label_ar: 'معتمدة', value: dimStats.approved, color: '#22C55E' },
          { label_en: 'Submitted', label_ar: 'مُرسلة', value: dimStats.submitted, color: '#3B82F6' },
          { label_en: 'In Review', label_ar: 'قيد المراجعة', value: dimStats.inReview, color: '#EAB308' },
          { label_en: 'Pending', label_ar: 'معلقة', value: dimStats.pending, color: '#6B7280' },
        ].map((s, i) => (
          <motion.div
            key={s.label_en}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            className="p-3 rounded-xl border border-white/10 bg-white/[0.03] text-center"
          >
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: s.color }}>{isRTL ? s.label_ar : s.label_en}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${dimStats.pct}%` }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-sm font-bold shrink-0" style={{ color: config.color }}>{dimStats.pct}%</span>
        <span className="text-xs text-gray-500 shrink-0">{t('approved', 'معتمدة')}</span>
      </motion.div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('Search machine...', 'ابحث عن آلة...')}
            className={`w-full ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none`}
            style={{ '--tw-ring-color': config.color }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none"
        >
          <option value="all">{t('All Statuses', 'جميع الحالات')}</option>
          {Object.entries(STATUS_LABEL).map(([key, val]) => (
            <option key={key} value={key}>{isRTL ? val.ar : val.en}</option>
          ))}
        </select>
        <span className="self-center text-xs text-gray-500">
          {filtered.length} {t('machines', 'آلة')}
        </span>
      </motion.div>

      {/* ── Machine Table ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Table header */}
        <div
          className="grid px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-white/8"
          style={{
            background: 'rgba(255,255,255,0.02)',
            gridTemplateColumns: '80px 1fr 120px 60px 40px',
          }}
        >
          <span>{t('ID', 'الرقم')}</span>
          <span className="hidden sm:block">{t('Description', 'الوصف')}</span>
          <span>{t('Status', 'الحالة')}</span>
          <span className="text-center">{t('Score', 'السكور')}</span>
          <span></span>
        </div>

        {/* Rows */}
        <div>
          {filtered.map((profile, idx) => (
            <MachineRow
              key={profile.machine_id}
              profile={profile}
              dimension={dimension}
              config={config}
              isExpanded={expanded === profile.machine_id}
              onToggle={() => setExpanded(p => p === profile.machine_id ? null : profile.machine_id)}
              onSaved={handleSaved}
              isRTL={isRTL}
              delay={idx * 0.012}
            />
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <Icon className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: config.color }} />
              <p>{t('No machines found', 'لا توجد آلات')}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DepartmentWorkspace;
