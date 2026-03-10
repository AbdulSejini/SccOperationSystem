/**
 * Machine Profile Detail Page
 * 6-dimension assessment with department approval workflow
 * Bilingual: Arabic / English
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProfile, saveDimension, submitDimension,
  approveDimension, rejectDimension, getProfileCompleteness,
} from '../services/machineProfileService';
import { scoreToClass } from '../data/machineProfileSeedData';
import {
  ArrowLeft, ArrowRight, Wrench, DollarSign, Factory, Shield,
  Star, Monitor, CheckCircle, XCircle, Clock, AlertTriangle,
  Calendar, User, FileText, ChevronDown, ChevronUp, Edit3,
  Save, RotateCcw, Info, BarChart2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CLASS_CONFIG = {
  A: { label: { en: 'Critical',  ar: 'حرجة'   }, color: '#EF4444', bg: 'rgba(239,68,68,0.15)'   },
  B: { label: { en: 'Important', ar: 'مهمة'   }, color: '#F97316', bg: 'rgba(249,115,22,0.15)'  },
  C: { label: { en: 'Standard',  ar: 'عادية'  }, color: '#EAB308', bg: 'rgba(234,179,8,0.15)'   },
  D: { label: { en: 'Low',       ar: 'منخفضة' }, color: '#22C55E', bg: 'rgba(34,197,94,0.15)'   },
};

const OP_STATUS_CONFIG = {
  Active:            { en: 'Active',          ar: 'نشطة',             color: '#22C55E' },
  'Low Utilization': { en: 'Low Utilization', ar: 'استخدام منخفض',    color: '#EAB308' },
  Dormant:           { en: 'Dormant',         ar: 'خاملة',             color: '#EF4444' },
  Standby:           { en: 'Standby',         ar: 'احتياطية',          color: '#94A3B8' },
};

const DIMENSIONS = [
  { id: 'maintenance', icon: Wrench,      color: '#F39200', weight: '30%', primary: true,  en: 'Maintenance',  ar: 'الصيانة',    dept_en: 'Maintenance Dept.',  dept_ar: 'قسم الصيانة'   },
  { id: 'finance',     icon: DollarSign,  color: '#3B82F6', weight: '25%', primary: true,  en: 'Finance',      ar: 'المالية',    dept_en: 'Finance Dept.',      dept_ar: 'قسم المالية'   },
  { id: 'production',  icon: Factory,     color: '#10B981', weight: '30%', primary: true,  en: 'Production',   ar: 'الإنتاج',    dept_en: 'Production Dept.',   dept_ar: 'قسم الإنتاج'  },
  { id: 'hse',         icon: Shield,      color: '#EF4444', weight: '15%', primary: true,  en: 'HSE',          ar: 'الصحة والسلامة', dept_en: 'HSE Dept.', dept_ar: 'قسم السلامة'  },
  { id: 'quality',     icon: Star,        color: '#8B5CF6', weight: null,  primary: false, en: 'Quality',      ar: 'الجودة',     dept_en: 'Quality Dept.',      dept_ar: 'قسم الجودة'   },
  { id: 'it_sap',      icon: Monitor,     color: '#06B6D4', weight: null,  primary: false, en: 'IT / SAP',     ar: 'IT / SAP',   dept_en: 'IT Dept.',           dept_ar: 'قسم تقنية المعلومات' },
];

const DIM_STATUS = {
  pending:   { en: 'Pending',   ar: 'معلق',        color: '#6B7280', icon: Clock        },
  in_review: { en: 'In Review', ar: 'قيد المراجعة', color: '#EAB308', icon: Edit3        },
  submitted: { en: 'Submitted', ar: 'مُرسل',        color: '#3B82F6', icon: FileText     },
  approved:  { en: 'Approved',  ar: 'معتمد',        color: '#22C55E', icon: CheckCircle  },
  rejected:  { en: 'Rejected',  ar: 'مرفوض',        color: '#EF4444', icon: XCircle      },
};

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, cls, size = 96 }) => {
  const cfg = CLASS_CONFIG[cls] || { color: '#6B7280', bg: 'transparent' };
  const r   = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = score ? (score / 5) * circ : 0;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={cfg.color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black" style={{ color: cfg.color }}>
          {score ? score.toFixed(2) : '—'}
        </span>
        {cls && (
          <span className="text-xs font-bold" style={{ color: cfg.color }}>Class {cls}</span>
        )}
      </div>
    </div>
  );
};

// ─── Field Row ────────────────────────────────────────────────────────────────
const Field = ({ label, value, unit, prefilled, color }) => (
  <div className="flex items-start justify-between py-2 border-b border-white/5 last:border-0 gap-4">
    <span className="text-xs text-gray-400 min-w-[140px]">{label}</span>
    <div className="flex items-center gap-1.5">
      {prefilled && (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 flex-shrink-0" title="Pre-filled from SAP/Excel" />
      )}
      <span className="text-sm font-medium text-white text-right">
        {value !== null && value !== undefined && value !== '' ? value : <span className="text-gray-600 italic text-xs">—</span>}
        {unit && value ? <span className="text-gray-400 text-xs ml-1">{unit}</span> : null}
      </span>
    </div>
  </div>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
const InputField = ({ label, name, value, onChange, type='text', options, required, unit, hint }) => (
  <div className="space-y-1">
    <label className="text-xs text-gray-400 flex items-center gap-1">
      {label}
      {required && <span className="text-red-400">*</span>}
      {hint && <span className="text-gray-600 normal-case">({hint})</span>}
    </label>
    {options ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#F39200]/50"
      >
        <option value="">—</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    ) : (
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#F39200]/50"
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{unit}</span>}
      </div>
    )}
  </div>
);

// ─── Maintenance Dimension Panel ──────────────────────────────────────────────
const MaintenancePanel = ({ dim, editing, form, onChange, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/3 border border-white/5">
        <p className="text-xs font-semibold text-[#F39200] mb-3 uppercase tracking-wider">{t('Pre-filled from SAP / Criticality Assessment', 'مُعبأ مسبقاً من SAP / تقييم الأهمية')}</p>
        <Field label={t('PM Strategy',      'استراتيجية الصيانة')} value={dim.pm_strategy}           prefilled />
        <Field label={t('CM Orders (2024)', 'أوامر الصيانة التصحيحية')} value={dim.cm_count_annual} unit={t('orders','أمر')} prefilled />
        <Field label={t('PM Orders (2024)', 'أوامر الصيانة الوقائية')} value={dim.pm_count_annual}   unit={t('orders','أمر')} prefilled />
        <Field label={t('Breakdown Hours',  'ساعات الأعطال')}          value={dim.bd_hours_annual}   unit={t('hrs','س')}       prefilled />
        <Field label={t('Breakdown %',      'نسبة الأعطال')}            value={dim.bd_pct != null ? `${dim.bd_pct}%` : null} prefilled />
        <Field label={t('MTBF',             'متوسط الوقت بين الأعطال')} value={dim.mtbf_hrs}         unit={t('hrs','س')}       prefilled />
        <Field label={t('Failure Frequency Score (1-5)', 'درجة تكرار الأعطال (1-5)')} value={dim.ff_score} prefilled />
        <Field label={t('Maintainability Score (1-5)',   'درجة قابلية الصيانة (1-5)')} value={dim.maintainability_score} prefilled />
      </div>
      {editing && (
        <div className="p-4 rounded-xl bg-[#F39200]/5 border border-[#F39200]/20">
          <p className="text-xs font-semibold text-[#F39200] mb-3 uppercase tracking-wider">{t('Maintenance Department — Please Fill', 'قسم الصيانة — يرجى التعبئة')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label={t('Last PM Date','تاريخ آخر صيانة وقائية')} name="last_pm_date" value={form.last_pm_date} onChange={onChange} type="date" />
            <InputField label={t('Next PM Date','تاريخ الصيانة الوقائية القادمة')} name="next_pm_date" value={form.next_pm_date} onChange={onChange} type="date" />
            <InputField label={t('Pending Work Orders','أوامر العمل المعلقة')} name="pending_wo_count" value={form.pending_wo_count} onChange={onChange} type="number" />
            <InputField label={t('Spare Parts Available','قطع الغيار متوفرة')} name="spare_parts_available" value={form.spare_parts_available} onChange={onChange}
              options={[{value:'yes',label:t('Yes','نعم')},{value:'no',label:t('No','لا')},{value:'partial',label:t('Partial','جزئياً')}]} />
            <InputField label={t('Last Lubrication Date','تاريخ آخر تزييت')} name="lube_last_date" value={form.lube_last_date} onChange={onChange} type="date" />
            <InputField label={t('Score Override (1-5)','تعديل الدرجة (1-5)')} name="score" value={form.score} onChange={onChange} type="number"
              hint={t('Leave blank for auto','اتركه فارغاً للحساب التلقائي')} />
          </div>
          <div className="mt-3">
            <InputField label={t('Notes','ملاحظات')} name="notes" value={form.notes} onChange={onChange} />
          </div>
        </div>
      )}
      {!editing && (
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">{t('Department Input', 'مدخلات القسم')}</p>
          <Field label={t('Last PM Date','تاريخ آخر صيانة وقائية')} value={dim.last_pm_date} />
          <Field label={t('Next PM Date','تاريخ الصيانة القادمة')} value={dim.next_pm_date} />
          <Field label={t('Pending Work Orders','أوامر العمل المعلقة')} value={dim.pending_wo_count} />
          <Field label={t('Spare Parts','قطع الغيار')} value={dim.spare_parts_available} />
          <Field label={t('Notes','ملاحظات')} value={dim.notes} />
        </div>
      )}
    </div>
  );
};

// ─── Finance Dimension Panel ──────────────────────────────────────────────────
const FinancePanel = ({ dim, editing, form, onChange, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/3 border border-white/5">
        <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wider">{t('Pre-filled from Equipment Records', 'مُعبأ مسبقاً من سجلات المعدات')}</p>
        <Field label={t('Installed Year',      'سنة التركيب')}   value={dim.installed_year}     prefilled />
        <Field label={t('Asset Age',           'عمر الأصل')}     value={dim.asset_age_years != null ? `${dim.asset_age_years} ${t('years','سنة')}` : null} prefilled />
        <Field label={t('Manufacturer',        'المصنّع')}        value={dim.manufacturer}       prefilled />
        <Field label={t('Country of Origin',   'بلد المنشأ')}    value={dim.country_of_origin}  prefilled />
      </div>
      {editing ? (
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wider">{t('Finance Department — Please Fill', 'قسم المالية — يرجى التعبئة')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label={t('Replacement Cost (SAR)','تكلفة الاستبدال (ريال)')} name="replacement_cost_sar" value={form.replacement_cost_sar} onChange={onChange} type="number" />
            <InputField label={t('Annual Maintenance Cost (SAR)','تكلفة الصيانة السنوية (ريال)')} name="annual_maintenance_cost_sar" value={form.annual_maintenance_cost_sar} onChange={onChange} type="number" />
            <InputField label={t('Spare Parts Value (SAR)','قيمة قطع الغيار (ريال)')} name="spare_parts_value_sar" value={form.spare_parts_value_sar} onChange={onChange} type="number" />
            <InputField label={t('Insurance Value (SAR)','قيمة التأمين (ريال)')} name="insurance_value_sar" value={form.insurance_value_sar} onChange={onChange} type="number" />
            <InputField label={t('Depreciation Rate (%)','معدل الاستهلاك (%)')} name="depreciation_rate_pct" value={form.depreciation_rate_pct} onChange={onChange} type="number" unit="%" />
            <InputField label={t('Recommendation','التوصية')} name="repair_vs_replace" value={form.repair_vs_replace} onChange={onChange}
              options={[{value:'repair',label:t('Repair & Continue','إصلاح ومواصلة')},{value:'monitor',label:t('Monitor','مراقبة')},{value:'replace',label:t('Plan Replacement','تخطيط للاستبدال')},{value:'dispose',label:t('Dispose','إيقاف وإزالة')}]} />
            <InputField label={t('Capital Budget Needed','الميزانية الرأسمالية المطلوبة')} name="capital_budget_needed" value={form.capital_budget_needed} onChange={onChange} type="number" />
            <InputField label={t('Score (1-5)','الدرجة (1-5)')} name="score" value={form.score} onChange={onChange} type="number" />
          </div>
          <div className="mt-3">
            <InputField label={t('Notes','ملاحظات')} name="notes" value={form.notes} onChange={onChange} />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">{t('Finance Input', 'مدخلات المالية')}</p>
          <Field label={t('Replacement Cost','تكلفة الاستبدال')} value={dim.replacement_cost_sar ? `${Number(dim.replacement_cost_sar).toLocaleString()} SAR` : null} />
          <Field label={t('Annual Maint. Cost','تكلفة الصيانة السنوية')} value={dim.annual_maintenance_cost_sar ? `${Number(dim.annual_maintenance_cost_sar).toLocaleString()} SAR` : null} />
          <Field label={t('Spare Parts Value','قيمة قطع الغيار')} value={dim.spare_parts_value_sar ? `${Number(dim.spare_parts_value_sar).toLocaleString()} SAR` : null} />
          <Field label={t('Recommendation','التوصية')} value={dim.repair_vs_replace} />
          <Field label={t('Notes','ملاحظات')} value={dim.notes} />
        </div>
      )}
    </div>
  );
};

// ─── Production Dimension Panel ───────────────────────────────────────────────
const ProductionPanel = ({ dim, editing, form, onChange, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/3 border border-white/5">
        <p className="text-xs font-semibold text-[#10B981] mb-3 uppercase tracking-wider">{t('Pre-filled from Criticality Assessment', 'مُعبأ مسبقاً من تقييم الأهمية')}</p>
        <Field label={t('Operational Status',      'الحالة التشغيلية')}  value={dim.operational_status}      prefilled />
        <Field label={t('Production Impact (1-5)', 'أثر الإنتاج (1-5)')} value={dim.production_impact_score}  prefilled />
        <Field label={t('Redundancy Score (1-5)',   'درجة التكرارية (1-5)')} value={dim.redundancy_score}     prefilled />
        <Field label={t('Breakdown %',             'نسبة الأعطال')}       value={dim.bd_pct != null ? `${dim.bd_pct}%` : null} prefilled />
      </div>
      {editing ? (
        <div className="p-4 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20">
          <p className="text-xs font-semibold text-[#10B981] mb-3 uppercase tracking-wider">{t('Production Department — Please Fill', 'قسم الإنتاج — يرجى التعبئة')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label={t('Shift Assignment','الوردية المخصصة')} name="shift_assignment" value={form.shift_assignment} onChange={onChange}
              options={[{value:'morning',label:t('Morning','صباحية')},{value:'evening',label:t('Evening','مسائية')},{value:'night',label:t('Night','ليلية')},{value:'all',label:t('All Shifts','جميع الورديات')}]} />
            <InputField label={t('Current Operator','المشغّل الحالي')} name="current_operator" value={form.current_operator} onChange={onChange} />
            <InputField label={t('OEE (%)','الكفاءة الكلية للمعدات (%)')} name="oee_pct" value={form.oee_pct} onChange={onChange} type="number" unit="%" />
            <InputField label={t('Scheduled Hours/Year','الساعات المجدولة/السنة')} name="scheduled_hours_annual" value={form.scheduled_hours_annual} onChange={onChange} type="number" unit={t('hrs','س')} />
            <InputField label={t('Daily Target Output','الإنتاج المستهدف اليومي')} name="daily_target_output" value={form.daily_target_output} onChange={onChange} />
            <InputField label={t('Last Month Actual Output','الإنتاج الفعلي الشهر الماضي')} name="actual_output_last_month" value={form.actual_output_last_month} onChange={onChange} />
            <InputField label={t('Production Line','خط الإنتاج')} name="production_line" value={form.production_line} onChange={onChange} />
            <InputField label={t('Score Override (1-5)','تعديل الدرجة (1-5)')} name="score" value={form.score} onChange={onChange} type="number" />
          </div>
          <div className="mt-3">
            <InputField label={t('Notes','ملاحظات')} name="notes" value={form.notes} onChange={onChange} />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">{t('Production Input', 'مدخلات الإنتاج')}</p>
          <Field label={t('Shift','الوردية')} value={dim.shift_assignment} />
          <Field label={t('Operator','المشغّل')} value={dim.current_operator} />
          <Field label={t('OEE','الكفاءة الكلية')} value={dim.oee_pct ? `${dim.oee_pct}%` : null} />
          <Field label={t('Scheduled Hours/Year','الساعات المجدولة/السنة')} value={dim.scheduled_hours_annual} unit={t('hrs','س')} />
          <Field label={t('Daily Target','الإنتاج المستهدف')} value={dim.daily_target_output} />
          <Field label={t('Notes','ملاحظات')} value={dim.notes} />
        </div>
      )}
    </div>
  );
};

// ─── HSE Dimension Panel ──────────────────────────────────────────────────────
const HSEPanel = ({ dim, editing, form, onChange, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  const HAZARDS = ['Electrical','Mechanical','Chemical','Thermal','Height','Noise','Hydraulic'];
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/3 border border-white/5">
        <p className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider">{t('Pre-filled from Safety Assessment', 'مُعبأ مسبقاً من تقييم السلامة')}</p>
        <Field label={t('Safety Impact Score (1-5)','درجة أثر السلامة (1-5)')} value={dim.safety_impact_score} prefilled />
      </div>
      {editing ? (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="text-xs font-semibold text-red-400 mb-3 uppercase tracking-wider">{t('HSE Department — Please Fill', 'قسم الصحة والسلامة — يرجى التعبئة')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label={t('LOTO Required','تطبيق LOTO مطلوب')} name="loto_required" value={form.loto_required} onChange={onChange}
              options={[{value:'yes',label:t('Yes','نعم')},{value:'no',label:t('No','لا')}]} />
            <InputField label={t('Risk Rating','تصنيف المخاطرة')} name="risk_rating" value={form.risk_rating} onChange={onChange}
              options={[{value:'low',label:t('Low','منخفض')},{value:'medium',label:t('Medium','متوسط')},{value:'high',label:t('High','عالٍ')},{value:'critical',label:t('Critical','حرجة')}]} />
            <InputField label={t('Safety Incidents (12m)','حوادث السلامة (12 شهراً)')} name="safety_incidents_12m" value={form.safety_incidents_12m} onChange={onChange} type="number" />
            <InputField label={t('Last Safety Incident','تاريخ آخر حادث')} name="last_safety_incident_date" value={form.last_safety_incident_date} onChange={onChange} type="date" />
            <InputField label={t('Last Safety Audit','آخر تدقيق للسلامة')} name="last_safety_audit_date" value={form.last_safety_audit_date} onChange={onChange} type="date" />
            <InputField label={t('PPE Required','معدات الحماية المطلوبة')} name="ppe_required" value={form.ppe_required} onChange={onChange} />
            <InputField label={t('Emergency Stop Location','موقع زر الإيقاف الطارئ')} name="emergency_stop_location" value={form.emergency_stop_location} onChange={onChange} />
            <InputField label={t('Score (1-5)','الدرجة (1-5)')} name="score" value={form.score} onChange={onChange} type="number" />
          </div>
          {/* Hazard Categories Checkboxes */}
          <div className="mt-3 space-y-2">
            <label className="text-xs text-gray-400">{t('Hazard Categories','فئات المخاطر')}</label>
            <div className="flex flex-wrap gap-2">
              {HAZARDS.map(h => {
                const selected = (form.hazard_categories || []).includes(h);
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      const current = form.hazard_categories || [];
                      const next = selected ? current.filter(x => x !== h) : [...current, h];
                      onChange({ target: { name: 'hazard_categories', value: next } });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${selected ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3">
            <InputField label={t('Notes','ملاحظات')} name="notes" value={form.notes} onChange={onChange} />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">{t('HSE Input', 'مدخلات السلامة')}</p>
          <Field label={t('LOTO Required','LOTO مطلوب')} value={dim.loto_required} />
          <Field label={t('Risk Rating','تصنيف المخاطرة')} value={dim.risk_rating} />
          <Field label={t('Incidents (12m)','حوادث (12 شهر)')} value={dim.safety_incidents_12m} />
          <Field label={t('Hazard Categories','فئات المخاطر')} value={Array.isArray(dim.hazard_categories) ? dim.hazard_categories.join(', ') : dim.hazard_categories} />
          <Field label={t('PPE Required','معدات الحماية')} value={dim.ppe_required} />
          <Field label={t('Emergency Stop','زر الإيقاف الطارئ')} value={dim.emergency_stop_location} />
          <Field label={t('Notes','ملاحظات')} value={dim.notes} />
        </div>
      )}
    </div>
  );
};

// ─── Quality Dimension Panel ──────────────────────────────────────────────────
const QualityPanel = ({ dim, editing, form, onChange, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/3 border border-white/5">
        <p className="text-xs font-semibold text-purple-400 mb-3 uppercase tracking-wider">{t('Pre-filled from Criticality Assessment', 'مُعبأ مسبقاً')}</p>
        <Field label={t('Quality Impact (1-5)','أثر الجودة (1-5)')} value={dim.quality_impact_score} prefilled />
      </div>
      {editing ? (
        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
          <p className="text-xs font-semibold text-purple-400 mb-3 uppercase tracking-wider">{t('Quality Department — Please Fill', 'قسم الجودة — يرجى التعبئة')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label={t('IEC Compliance Risk','مخاطر الامتثال لـ IEC')} name="iec_compliance_risk" value={form.iec_compliance_risk} onChange={onChange}
              options={[{value:'low',label:t('Low','منخفضة')},{value:'medium',label:t('Medium','متوسطة')},{value:'high',label:t('High','عالية')},{value:'critical',label:t('Critical','حرجة')}]} />
            <InputField label={t('NCR Count (12m)','عدد تقارير عدم المطابقة')} name="ncr_count_12m" value={form.ncr_count_12m} onChange={onChange} type="number" />
            <InputField label={t('Defect Types','أنواع العيوب')} name="defect_types" value={form.defect_types} onChange={onChange} />
            <InputField label={t('Calibration Required','معايرة مطلوبة')} name="calibration_required" value={form.calibration_required} onChange={onChange}
              options={[{value:'yes',label:t('Yes','نعم')},{value:'no',label:t('No','لا')}]} />
            <InputField label={t('Last Quality Audit','آخر تدقيق جودة')} name="last_quality_audit" value={form.last_quality_audit} onChange={onChange} type="date" />
            <InputField label={t('Product Types','أنواع المنتجات')} name="product_types" value={form.product_types} onChange={onChange} />
            <InputField label={t('Score (1-5)','الدرجة (1-5)')} name="score" value={form.score} onChange={onChange} type="number" />
          </div>
          <div className="mt-3">
            <InputField label={t('Notes','ملاحظات')} name="notes" value={form.notes} onChange={onChange} />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">{t('Quality Input', 'مدخلات الجودة')}</p>
          <Field label={t('IEC Risk','مخاطر IEC')} value={dim.iec_compliance_risk} />
          <Field label={t('NCR Count (12m)','عدد NCR')} value={dim.ncr_count_12m} />
          <Field label={t('Defect Types','أنواع العيوب')} value={dim.defect_types} />
          <Field label={t('Calibration','المعايرة')} value={dim.calibration_required} />
          <Field label={t('Notes','ملاحظات')} value={dim.notes} />
        </div>
      )}
    </div>
  );
};

// ─── IT/SAP Dimension Panel ───────────────────────────────────────────────────
const ITSAPPanel = ({ dim, editing, form, onChange, isRTL }) => {
  const t = (en, ar) => isRTL ? ar : en;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/3 border border-white/5">
        <p className="text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-wider">{t('Pre-filled from SAP', 'مُعبأ مسبقاً من SAP')}</p>
        <Field label={t('SAP Functional Location','الموقع الوظيفي في SAP')} value={dim.sap_functional_location} prefilled />
        <Field label={t('SAP CM Orders','أوامر الصيانة التصحيحية في SAP')} value={dim.sap_cm_orders_count} unit={t('orders','أمر')} prefilled />
        <Field label={t('SAP PM Orders','أوامر الصيانة الوقائية في SAP')} value={dim.sap_pm_orders_count} unit={t('orders','أمر')} prefilled />
      </div>
      {editing ? (
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
          <p className="text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-wider">{t('IT Department — Please Fill', 'قسم تقنية المعلومات — يرجى التعبئة')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label={t('SAP Data Completeness (%)','اكتمال بيانات SAP (%)')} name="sap_data_completeness_pct" value={form.sap_data_completeness_pct} onChange={onChange} type="number" unit="%" />
            <InputField label={t('Last SAP PM Notification','آخر إشعار صيانة في SAP')} name="last_sap_pm_notification" value={form.last_sap_pm_notification} onChange={onChange} type="date" />
            <InputField label={t('SAP Integration Status','حالة تكامل SAP')} name="sap_integration_status" value={form.sap_integration_status} onChange={onChange}
              options={[{value:'active',label:t('Active','نشط')},{value:'inactive',label:t('Inactive','غير نشط')},{value:'partial',label:t('Partial','جزئي')}]} />
            <InputField label={t('Digital Twin Available','النموذج الرقمي متاح')} name="digital_twin_available" value={form.digital_twin_available} onChange={onChange}
              options={[{value:'yes',label:t('Yes','نعم')},{value:'no',label:t('No','لا')},{value:'planned',label:t('Planned','مخطط')}]} />
            <InputField label={t('PMS Linked','مرتبط بنظام الصيانة')} name="pms_linked" value={form.pms_linked} onChange={onChange}
              options={[{value:'yes',label:t('Yes','نعم')},{value:'no',label:t('No','لا')}]} />
            <InputField label={t('Score (1-5)','الدرجة (1-5)')} name="score" value={form.score} onChange={onChange} type="number" />
          </div>
          <div className="mt-3">
            <InputField label={t('Notes','ملاحظات')} name="notes" value={form.notes} onChange={onChange} />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">{t('IT/SAP Input', 'مدخلات IT/SAP')}</p>
          <Field label={t('SAP Completeness','اكتمال SAP')} value={dim.sap_data_completeness_pct ? `${dim.sap_data_completeness_pct}%` : null} />
          <Field label={t('Integration Status','حالة التكامل')} value={dim.sap_integration_status} />
          <Field label={t('Digital Twin','النموذج الرقمي')} value={dim.digital_twin_available} />
          <Field label={t('PMS Linked','نظام الصيانة')} value={dim.pms_linked} />
          <Field label={t('Notes','ملاحظات')} value={dim.notes} />
        </div>
      )}
    </div>
  );
};

// ─── Dimension Card (tab header) ──────────────────────────────────────────────
const DimCard = ({ cfg, dim, active, onClick, isRTL }) => {
  const status = DIM_STATUS[dim?.status] || DIM_STATUS.pending;
  const StatusIcon = status.icon;
  const score = dim?.score;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all min-w-[80px] ${active ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
      style={{
        background: active ? `${cfg.color}22` : 'rgba(255,255,255,0.03)',
        borderColor: active ? `${cfg.color}80` : 'rgba(255,255,255,0.08)',
        boxShadow: active ? `0 0 20px ${cfg.color}30` : 'none',
      }}
    >
      <cfg.icon className="w-5 h-5" style={{ color: cfg.color }} />
      <span className="text-[10px] font-semibold" style={{ color: active ? cfg.color : '#9CA3AF' }}>
        {isRTL ? cfg.ar : cfg.en}
      </span>
      <div className="flex items-center gap-1">
        <StatusIcon className="w-2.5 h-2.5" style={{ color: status.color }} />
        {score ? (
          <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{score}</span>
        ) : null}
      </div>
      {!cfg.primary && (
        <span className="text-[8px] text-gray-500 bg-white/5 px-1 rounded">{isRTL ? 'اختياري' : 'optional'}</span>
      )}
    </button>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MachineProfileDetail = () => {
  const { machineId } = useParams();
  const { isRTL }    = useLanguage();
  const { isDark, colors } = useTheme();
  const navigate     = useNavigate();

  const [profile,    setProfile]  = useState(null);
  const [loading,    setLoading]  = useState(true);
  const [activeTab,  setActiveTab] = useState('maintenance');
  const [editing,    setEditing]  = useState(false);
  const [formData,   setFormData] = useState({});
  const [saving,     setSaving]   = useState(false);
  const [actionName, setAction]   = useState('');
  const [msg,        setMsg]      = useState(null);

  const t = (en, ar) => isRTL ? ar : en;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Load profile
  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await getProfile(machineId);
      setProfile(p);
      setLoading(false);
    })();
  }, [machineId]);

  // Sync form when tab changes
  useEffect(() => {
    if (profile) {
      setFormData({ ...(profile.dimensions[activeTab] || {}) });
      setEditing(false);
    }
  }, [activeTab, profile]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveDimension(machineId, activeTab, formData);
    const updated = await getProfile(machineId);
    setProfile(updated);
    setEditing(false);
    setSaving(false);
    showMsg(t('Saved successfully', 'تم الحفظ بنجاح'), 'success');
  };

  const handleSubmit = async () => {
    setSaving(true);
    await submitDimension(machineId, activeTab, formData, actionName || t('Department User', 'مستخدم القسم'));
    const updated = await getProfile(machineId);
    setProfile(updated);
    setEditing(false);
    setSaving(false);
    showMsg(t('Submitted for approval', 'تم الإرسال للاعتماد'), 'info');
  };

  const handleApprove = async () => {
    setSaving(true);
    await approveDimension(machineId, activeTab, actionName || t('Department Head', 'رئيس القسم'));
    const updated = await getProfile(machineId);
    setProfile(updated);
    setSaving(false);
    showMsg(t('Dimension approved', 'تم اعتماد البُعد'), 'success');
  };

  const handleReject = async () => {
    const reason = window.prompt(t('Rejection reason:', 'سبب الرفض:'));
    if (!reason) return;
    setSaving(true);
    await rejectDimension(machineId, activeTab, actionName || t('Department Head', 'رئيس القسم'), reason);
    const updated = await getProfile(machineId);
    setProfile(updated);
    setSaving(false);
    showMsg(t('Dimension rejected', 'تم رفض البُعد'), 'error');
  };

  const showMsg = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">{t('Loading...', 'جارٍ التحميل...')}</div>
      </div>
    );
  }

  const comp        = getProfileCompleteness(profile);
  const opStat      = OP_STATUS_CONFIG[profile.operational_status] || OP_STATUS_CONFIG.Standby;
  const iCls        = CLASS_CONFIG[profile.inherent_class] || CLASS_CONFIG.C;
  const eCls        = CLASS_CONFIG[comp.overall_class]     || CLASS_CONFIG.C;
  const activeDimCfg = DIMENSIONS.find(d => d.id === activeTab);
  const activeDim    = profile.dimensions[activeTab] || {};
  const dimStatus    = DIM_STATUS[activeDim.status || 'pending'];
  const DimStatusIcon = dimStatus.icon;

  // Which panel to render
  const PanelMap = {
    maintenance: MaintenancePanel,
    finance:     FinancePanel,
    production:  ProductionPanel,
    hse:         HSEPanel,
    quality:     QualityPanel,
    it_sap:      ITSAPPanel,
  };
  const ActivePanel = PanelMap[activeTab];

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Toast */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium"
            style={{
              background: msg.type === 'success' ? '#22C55E22' : msg.type === 'error' ? '#EF444422' : '#3B82F622',
              border: `1px solid ${msg.type === 'success' ? '#22C55E' : msg.type === 'error' ? '#EF4444' : '#3B82F6'}50`,
              color:  msg.type === 'success' ? '#22C55E' : msg.type === 'error' ? '#EF4444' : '#3B82F6',
            }}
          >
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back + Breadcrumb ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/machineProfiles')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <BackIcon className="w-4 h-4" />
          {t('All Machines', 'جميع الآلات')}
        </button>
        <span className="text-gray-600">/</span>
        <span className="text-white font-medium">{machineId}</span>
      </div>

      {/* ── Machine Header ──────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/3">
        <div className="flex flex-wrap items-start gap-6">

          {/* ID + Name */}
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-3xl font-black tracking-tight"
                style={{ color: activeDimCfg?.color || '#F39200' }}
              >{machineId}</span>
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{ color: opStat.color, background: `${opStat.color}22` }}
              >
                {opStat[isRTL ? 'ar' : 'en']}
              </span>
            </div>
            <p className="text-white font-semibold text-lg leading-tight">{profile.description}</p>
            <p className="text-gray-400 text-sm mt-1">
              {profile.manufacturer} · {profile.country_of_origin || '—'} ·{' '}
              {t('Installed', 'تركيب')} {profile.installed_year || '—'} ·{' '}
              <span className="font-medium text-white">{profile.section}</span>
            </p>
          </div>

          {/* Score Ring */}
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={comp.overall_score} cls={comp.overall_class} size={100} />
            <span className="text-xs text-gray-400">{t('Overall Score', 'الدرجة الكلية')}</span>
          </div>

          {/* Class badges */}
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">{t('Inherent Class', 'الفئة الجوهرية')}</p>
              <span className="px-3 py-1 rounded-lg text-sm font-bold" style={{ color: iCls.color, background: iCls.bg }}>
                {t('Class', 'فئة')} {profile.inherent_class || '—'}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">{t('Profile Class', 'فئة البروفايل')}</p>
              <span className="px-3 py-1 rounded-lg text-sm font-bold" style={{ color: eCls.color, background: eCls.bg }}>
                {t('Class', 'فئة')} {comp.overall_class || '—'}
              </span>
            </div>
          </div>

          {/* Completion */}
          <div className="flex flex-col gap-2 min-w-[180px]">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">{t('Profile Completion', 'اكتمال البروفايل')}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${comp.completePct}%`,
                      background: comp.completePct === 100 ? '#22C55E' : comp.completePct >= 50 ? '#F39200' : '#EF4444',
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{comp.completePct}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {comp.primaryApproved}/{comp.primaryTotal} {t('primary approved', 'أبعاد أساسية معتمدة')}
              </p>
            </div>
            {/* User input */}
            <div>
              <p className="text-[10px] text-gray-500 mb-1">{t('Your Name (for approval)', 'اسمك (للاعتماد)')}</p>
              <input
                type="text"
                value={actionName}
                onChange={e => setAction(e.target.value)}
                placeholder={t('Enter your name...', 'أدخل اسمك...')}
                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#F39200]/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Dimension Tabs ──────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DIMENSIONS.map(cfg => (
          <DimCard
            key={cfg.id}
            cfg={cfg}
            dim={profile.dimensions[cfg.id]}
            active={activeTab === cfg.id}
            onClick={() => setActiveTab(cfg.id)}
            isRTL={isRTL}
          />
        ))}
      </div>

      {/* ── Active Dimension ────────────────────────────────────── */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: `${activeDimCfg?.color}40` }}
      >
        {/* Dimension Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: `${activeDimCfg?.color}12`, borderBottom: `1px solid ${activeDimCfg?.color}30` }}
        >
          <div className="flex items-center gap-3">
            {activeDimCfg && <activeDimCfg.icon className="w-5 h-5" style={{ color: activeDimCfg.color }} />}
            <div>
              <span className="font-bold text-white">{isRTL ? activeDimCfg?.ar : activeDimCfg?.en}</span>
              {activeDimCfg?.weight && (
                <span className="ml-2 text-xs text-gray-400">
                  {t('Weight:', 'الوزن:')} {activeDimCfg.weight}
                </span>
              )}
              {!activeDimCfg?.primary && (
                <span className="ml-2 text-xs text-gray-500 border border-gray-600 px-1.5 py-0.5 rounded">
                  {t('Optional', 'اختياري')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: `${dimStatus.color}22` }}>
              <DimStatusIcon className="w-3.5 h-3.5" style={{ color: dimStatus.color }} />
              <span className="text-xs font-medium" style={{ color: dimStatus.color }}>
                {isRTL ? dimStatus.ar : dimStatus.en}
              </span>
            </div>
          </div>

          {/* Dimension Score */}
          <div className="flex items-center gap-3">
            {activeDim.score && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400">{t('Score','الدرجة')}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black" style={{ color: activeDimCfg?.color }}>{activeDim.score}</span>
                  <span className="text-gray-500 text-sm">/5</span>
                </div>
              </div>
            )}
            <div className="text-right text-xs text-gray-500">
              <p>{isRTL ? activeDimCfg?.dept_ar : activeDimCfg?.dept_en}</p>
              {activeDim.submitted_by && <p className="text-gray-400">{t('By', 'بواسطة')} {activeDim.submitted_by}</p>}
              {activeDim.approved_by  && <p className="text-green-400">{t('Approved by', 'اعتمده')} {activeDim.approved_by}</p>}
            </div>
          </div>
        </div>

        {/* Dimension Body */}
        <div className="p-5 bg-[#0f1115]">
          <ActivePanel
            dim={activeDim}
            editing={editing}
            form={formData}
            onChange={handleChange}
            isRTL={isRTL}
          />
        </div>

        {/* Action Bar */}
        <div
          className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
          style={{ background: 'rgba(255,255,255,0.02)', borderTop: `1px solid ${activeDimCfg?.color}20` }}
        >
          <div className="flex gap-2">
            {/* Edit / Cancel */}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                disabled={activeDim.status === 'approved'}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: activeDimCfg?.color, borderColor: `${activeDimCfg?.color}50`, background: `${activeDimCfg?.color}15` }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {t('Edit', 'تعديل')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setEditing(false); setFormData({ ...(profile.dimensions[activeTab] || {}) }); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-600 text-gray-400 hover:text-white transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? t('Saving...', 'جارٍ الحفظ...') : t('Save Draft', 'حفظ مسودة')}
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {/* Submit */}
            {(activeDim.status === 'pending' || activeDim.status === 'in_review' || activeDim.status === 'rejected') && (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: `${activeDimCfg?.color}30`, color: activeDimCfg?.color, border: `1px solid ${activeDimCfg?.color}50` }}
              >
                <FileText className="w-3.5 h-3.5" />
                {t('Submit for Approval', 'إرسال للاعتماد')}
              </button>
            )}

            {/* Approve */}
            {activeDim.status === 'submitted' && (
              <>
                <button
                  onClick={handleReject}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {t('Reject', 'رفض')}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t('Approve', 'اعتماد')}
                </button>
              </>
            )}

            {/* Already approved */}
            {activeDim.status === 'approved' && (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('Approved', 'معتمد')} {activeDim.approved_at ? `· ${new Date(activeDim.approved_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}` : ''}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Info Note ────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 text-xs text-gray-500 p-3 rounded-lg bg-white/3 border border-white/5">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
        <p>
          {t(
            'Blue dot (●) indicates fields pre-filled from SAP / Excel data. Departments should review and adjust if needed before submitting for approval.',
            'النقطة الزرقاء (●) تشير إلى الحقول المعبأة مسبقاً من SAP / بيانات Excel. يجب على الأقسام المراجعة والتعديل إذا لزم قبل الإرسال للاعتماد.'
          )}
        </p>
      </div>
    </div>
  );
};

export default MachineProfileDetail;
