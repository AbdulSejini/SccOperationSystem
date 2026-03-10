/**
 * Department Home - Landing Page
 * Entry point that shows 3 department cards: Production, Maintenance, Planning
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Factory,
  Wrench,
  ClipboardList,
  Map,
  Calendar,
  BarChart3,
  Database,
  CalendarDays,
  CheckCircle,
  Trash2,
  Users,
  LayoutDashboard,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const departments = [
  {
    id: 'production',
    icon: Factory,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.35)',
    pages: [
      { id: 'home', icon: LayoutDashboard, path: '/' },
      { id: 'factoryLayout', icon: Map, path: '/factoryLayout' },
      { id: 'shopFloor', icon: Factory, path: '/shopFloor' },
      { id: 'capacityPlanning', icon: BarChart3, path: '/capacityPlanning' },
      { id: 'scheduling', icon: Calendar, path: '/scheduling' },
    ],
  },
  {
    id: 'maintenance',
    icon: Wrench,
    color: '#F39200',
    gradient: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)',
    shadowColor: 'rgba(243, 146, 0, 0.35)',
    pages: [
      { id: 'maintenanceDashboard', icon: Wrench, path: '/maintenanceDashboard' },
      { id: 'machineManagement', icon: Database, path: '/machineManagement' },
      { id: 'maintenanceChecklist', icon: ClipboardList, path: '/maintenanceChecklist' },
      { id: 'pmSchedule', icon: CalendarDays, path: '/pmSchedule' },
    ],
  },
  {
    id: 'planning',
    icon: ClipboardList,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    shadowColor: 'rgba(59, 130, 246, 0.35)',
    pages: [
      { id: 'analytics', icon: LayoutDashboard, path: '/analytics' },
      { id: 'qualityControl', icon: CheckCircle, path: '/qualityControl' },
      { id: 'scrapManagement', icon: Trash2, path: '/scrapManagement' },
      { id: 'workforceManagement', icon: Users, path: '/workforceManagement' },
    ],
  },
];

// Saudi Cable Logo Component
const SaudiCableLogo = ({ size = 80 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <circle cx="30" cy="30" r="28" fill="#2E2D2C" />
    <circle cx="30" cy="30" r="5.5" fill="#F39200" stroke="#FFF" strokeWidth="1" />
    <circle cx="30" cy="17" r="5.5" fill="#F39200" stroke="#FFF" strokeWidth="1" />
    <circle cx="41.3" cy="23.5" r="5.5" fill="#F39200" stroke="#FFF" strokeWidth="1" />
    <circle cx="41.3" cy="36.5" r="5.5" fill="#F39200" stroke="#FFF" strokeWidth="1" />
    <circle cx="30" cy="43" r="5.5" fill="#F39200" stroke="#FFF" strokeWidth="1" />
    <circle cx="18.7" cy="36.5" r="5.5" fill="#F39200" stroke="#FFF" strokeWidth="1" />
    <circle cx="18.7" cy="23.5" r="5.5" fill="#F39200" stroke="#FFF" strokeWidth="1" />
  </svg>
);

const DepartmentHome = () => {
  const { t, isRTL } = useLanguage();
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #1A1918 0%, #0f0e0d 100%)'
          : 'linear-gradient(180deg, #FAFAFA 0%, #F0F0F0 100%)',
      }}
    >
      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 md:mb-14"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <SaudiCableLogo size={80} />
          </motion.div>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: colors.textPrimary }}
        >
          {isRTL ? 'الكابلات السعودية' : 'Saudi Cable'}
        </h1>
        <p className="text-lg md:text-xl" style={{ color: '#F39200' }}>
          {isRTL ? 'لوحة إدارة العمليات الذكية' : 'Smart Operations Dashboard'}
        </p>
      </motion.div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
        {departments.map((dept, index) => {
          const DeptIcon = dept.icon;

          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => {
                // Navigate to first page of department
                navigate(dept.pages[0].path);
              }}
              className="cursor-pointer rounded-2xl overflow-hidden"
              style={{
                background: isDark ? colors.bgCard : '#FFFFFF',
                border: `1px solid ${colors.border}`,
                boxShadow: isDark
                  ? '0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.08)',
              }}
            >
              {/* Card Header with gradient */}
              <div
                className="p-6 md:p-8 flex flex-col items-center text-center"
                style={{ background: dept.gradient }}
              >
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <DeptIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {t(`departments.${dept.id}`)}
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  {t(`departments.${dept.id}Desc`)}
                </p>
              </div>

              {/* Card Pages List */}
              <div className="p-4 md:p-5">
                {dept.pages.map((page) => {
                  const PageIcon = page.icon;
                  return (
                    <motion.button
                      key={page.id}
                      whileHover={{ x: isRTL ? -6 : 6 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(page.path);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all"
                      style={{ color: colors.textSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark
                          ? `rgba(${dept.id === 'production' ? '16,185,129' : dept.id === 'maintenance' ? '243,146,0' : '59,130,246'},0.12)`
                          : `rgba(${dept.id === 'production' ? '16,185,129' : dept.id === 'maintenance' ? '243,146,0' : '59,130,246'},0.06)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <PageIcon className="w-4 h-4 flex-shrink-0" style={{ color: dept.color }} />
                      <span className="text-sm font-medium flex-1 text-start">
                        {t(`nav.${page.id}`)}
                      </span>
                      <Arrow className="w-3.5 h-3.5" style={{ color: colors.textMuted }} />
                    </motion.button>
                  );
                })}
              </div>

              {/* Enter Button */}
              <div className="px-4 pb-4 md:px-5 md:pb-5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(dept.pages[0].path);
                  }}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white text-sm"
                  style={{
                    background: dept.gradient,
                    boxShadow: `0 4px 14px ${dept.shadowColor}`,
                  }}
                >
                  {isRTL ? 'الدخول' : 'Enter'}
                  <Arrow className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Settings Link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => navigate('/settings')}
        className="mt-8 px-6 py-2 rounded-full text-sm font-medium transition-all"
        style={{
          color: colors.textMuted,
          border: `1px solid ${colors.border}`,
          background: isDark ? colors.bgCard : '#FFFFFF',
        }}
        whileHover={{ scale: 1.05, borderColor: '#F39200' }}
      >
        {isRTL ? '⚙️ الإعدادات' : '⚙️ Settings'}
      </motion.button>

      {/* Version */}
      <p className="mt-4 text-xs" style={{ color: colors.textMuted }}>
        {isRTL ? 'نظام إدارة العمليات' : 'Operations Management System'} • v2.0.0
      </p>
    </div>
  );
};

export default DepartmentHome;
