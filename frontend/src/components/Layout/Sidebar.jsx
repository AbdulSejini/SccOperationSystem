/**
 * Sidebar Component
 * Saudi Cable Company Dashboard Navigation - Grouped by Department
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  Calendar,
  Factory,
  Wrench,
  CheckCircle,
  Trash2,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  Home,
  BarChart2,
} from 'lucide-react';

// Saudi Cable Logo Component (Cable Cross-Section Design - 7 Conductors)
const SaudiCableLogo = ({ size = 48 }) => (
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

// Department definitions with their pages
const departmentMenus = {
  production: {
    color: '#10B981',
    items: [
      { id: 'home', icon: Home, path: '/' },
      { id: 'factoryLayout', icon: Map, path: '/factoryLayout' },
      { id: 'shopFloor', icon: Factory, path: '/shopFloor' },
      { id: 'capacityPlanning', icon: BarChart3, path: '/capacityPlanning' },
      { id: 'scheduling', icon: Calendar, path: '/scheduling' },
    ],
  },
  maintenance: {
    color: '#F39200',
    items: [
      { id: 'maintenanceDashboard', icon: Wrench, path: '/maintenanceDashboard' },
      { id: 'machineManagement', icon: Database, path: '/machineManagement' },
      { id: 'machineProfiles', icon: BarChart2, path: '/machineProfiles' },
      { id: 'maintenanceChecklist', icon: ClipboardList, path: '/maintenanceChecklist' },
      { id: 'pmSchedule', icon: CalendarDays, path: '/pmSchedule' },
    ],
  },
  planning: {
    color: '#3B82F6',
    items: [
      { id: 'analytics', icon: LayoutDashboard, path: '/analytics' },
      { id: 'qualityControl', icon: CheckCircle, path: '/qualityControl' },
      { id: 'scrapManagement', icon: Trash2, path: '/scrapManagement' },
      { id: 'workforceManagement', icon: Users, path: '/workforceManagement' },
    ],
  },
};

// Determine which department owns the current route
const getDepartmentForPath = (path) => {
  for (const [deptId, dept] of Object.entries(departmentMenus)) {
    if (dept.items.some((item) => item.path === path)) {
      return deptId;
    }
  }
  return null;
};

const Sidebar = () => {
  const { t, isRTL } = useLanguage();
  const { isDark, colors } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const currentDept = getDepartmentForPath(currentPath);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full z-50 flex flex-col`}
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #2E2D2C 0%, #1A1918 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        borderRight: isRTL ? 'none' : `1px solid ${colors.border}`,
        borderLeft: isRTL ? `1px solid ${colors.border}` : 'none',
        boxShadow: isDark
          ? '4px 0 24px rgba(0, 0, 0, 0.3)'
          : '4px 0 24px rgba(46, 45, 44, 0.08)',
      }}
    >
      {/* Logo Section */}
      <div className="p-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="cursor-pointer"
            onClick={() => navigate('/departments')}
          >
            <SaudiCableLogo size={isCollapsed ? 40 : 48} />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                  {isRTL ? 'الكابلات السعودية' : 'Saudi Cable'}
                </span>
                <span className="text-xs" style={{ color: '#F39200' }}>
                  {isRTL ? 'لوحة العمليات الذكية' : 'Smart Operations'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Back to Departments Button */}
      <div className="px-3 pt-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/departments')}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-sm font-medium"
          style={{
            color: '#F39200',
            background: isDark ? 'rgba(243, 146, 0, 0.1)' : 'rgba(243, 146, 0, 0.06)',
            border: '1px solid rgba(243, 146, 0, 0.2)',
          }}
        >
          <BackArrow className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && (
            <span>{isRTL ? 'الأقسام' : 'Departments'}</span>
          )}
        </motion.button>
      </div>

      {/* Navigation - Grouped by Department */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {Object.entries(departmentMenus).map(([deptId, dept]) => {
          const isDeptActive = currentDept === deptId;

          return (
            <div key={deptId} className="mb-2">
              {/* Department Header */}
              {!isCollapsed && (
                <div className="px-5 py-2 flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: dept.color }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: isDeptActive ? dept.color : colors.textMuted }}
                  >
                    {t(`departments.${deptId}`)}
                  </span>
                </div>
              )}

              {/* Separator dot for collapsed */}
              {isCollapsed && (
                <div className="flex justify-center py-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: dept.color }}
                  />
                </div>
              )}

              {/* Menu Items */}
              <ul className="space-y-0.5 px-3">
                {dept.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/machineProfiles'
                    ? currentPath.startsWith('/machineProfiles')
                    : currentPath === item.path;

                  return (
                    <li key={item.id}>
                      <motion.button
                        whileHover={{ scale: 1.02, x: isRTL ? -4 : 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
                        style={isActive ? {
                          background: `linear-gradient(135deg, ${dept.color} 0%, ${dept.color}CC 100%)`,
                          boxShadow: `0 4px 14px ${dept.color}59`,
                          color: '#FFFFFF',
                        } : {
                          color: colors.textSecondary,
                          background: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = isDark
                              ? `${dept.color}20`
                              : `${dept.color}10`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <Icon
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: isActive ? '#FFFFFF' : colors.textMuted }}
                        />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-sm font-medium whitespace-nowrap"
                            >
                              {t(`nav.${item.id}`)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {isActive && !isCollapsed && (
                          <motion.div
                            layoutId="activeIndicator"
                            className={`${isRTL ? 'mr-auto' : 'ml-auto'} w-2 h-2 rounded-full bg-white`}
                          />
                        )}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3" style={{ borderTop: `1px solid ${colors.border}` }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
          style={currentPath === '/settings' ? {
            background: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)',
            boxShadow: '0 4px 14px rgba(243, 146, 0, 0.35)',
            color: '#FFFFFF',
          } : {
            color: colors.textSecondary,
          }}
        >
          <Settings
            className="w-5 h-5"
            style={{ color: currentPath === '/settings' ? '#FFFFFF' : colors.textMuted }}
          />
          {!isCollapsed && <span className="text-sm font-medium">{t('common.settings')}</span>}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 mt-3 rounded-lg transition-all"
          style={{
            background: isDark ? 'rgba(243, 146, 0, 0.2)' : 'rgba(243, 146, 0, 0.1)',
            border: '1px solid rgba(243, 146, 0, 0.3)',
          }}
        >
          {isCollapsed ? (
            isRTL ? <ChevronLeft className="w-5 h-5" style={{ color: '#F39200' }} /> : <ChevronRight className="w-5 h-5" style={{ color: '#F39200' }} />
          ) : (
            isRTL ? <ChevronRight className="w-5 h-5" style={{ color: '#F39200' }} /> : <ChevronLeft className="w-5 h-5" style={{ color: '#F39200' }} />
          )}
        </motion.button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div
          className="p-4"
          style={{
            borderTop: `1px solid ${colors.border}`,
            background: colors.bgSecondary,
          }}
        >
          <div className="text-center">
            <p className="text-xs" style={{ color: colors.textMuted }}>
              {isRTL ? 'نظام إدارة العمليات' : 'Operations Management System'}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: '#F39200' }}>
              v2.0.0
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
