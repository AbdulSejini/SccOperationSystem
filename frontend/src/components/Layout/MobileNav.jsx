/**
 * Mobile Bottom Navigation Component
 * Shows only on mobile devices (< 768px) - Grouped by Department
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Map,
  Factory,
  Wrench,
  BarChart3,
  Menu,
  X,
  Calendar,
  CheckCircle,
  Trash2,
  Users,
  LayoutDashboard,
  Settings,
  Database,
  ClipboardList,
  CalendarDays,
  Grid3X3,
} from 'lucide-react';

// Department grouped menu items
const departmentMenus = [
  {
    id: 'production',
    color: '#10B981',
    items: [
      { id: 'home', icon: Home, path: '/', labelEn: 'Dashboard', labelAr: 'الرئيسية' },
      { id: 'factoryLayout', icon: Map, path: '/factoryLayout', labelEn: 'Factory', labelAr: 'المصنع' },
      { id: 'shopFloor', icon: Factory, path: '/shopFloor', labelEn: 'Shop Floor', labelAr: 'صالة الإنتاج' },
      { id: 'capacityPlanning', icon: BarChart3, path: '/capacityPlanning', labelEn: 'Capacity', labelAr: 'الطاقة' },
      { id: 'scheduling', icon: Calendar, path: '/scheduling', labelEn: 'Schedule', labelAr: 'الجدولة' },
    ],
  },
  {
    id: 'maintenance',
    color: '#F39200',
    items: [
      { id: 'maintenanceDashboard', icon: Wrench, path: '/maintenanceDashboard', labelEn: 'Maintenance', labelAr: 'الصيانة' },
      { id: 'machineManagement', icon: Database, path: '/machineManagement', labelEn: 'Machines', labelAr: 'المكائن' },
      { id: 'maintenanceChecklist', icon: ClipboardList, path: '/maintenanceChecklist', labelEn: 'Checklist', labelAr: 'الشيك ليست' },
      { id: 'pmSchedule', icon: CalendarDays, path: '/pmSchedule', labelEn: 'PM Schedule', labelAr: 'جدول الصيانة' },
    ],
  },
  {
    id: 'planning',
    color: '#3B82F6',
    items: [
      { id: 'analytics', icon: LayoutDashboard, path: '/analytics', labelEn: 'Analytics', labelAr: 'التحليلات' },
      { id: 'qualityControl', icon: CheckCircle, path: '/qualityControl', labelEn: 'Quality', labelAr: 'الجودة' },
      { id: 'scrapManagement', icon: Trash2, path: '/scrapManagement', labelEn: 'Scrap', labelAr: 'السكراب' },
      { id: 'workforceManagement', icon: Users, path: '/workforceManagement', labelEn: 'Workforce', labelAr: 'القوى العاملة' },
    ],
  },
];

// Main 4 items for bottom bar
const mainMenuItems = [
  { id: 'departments', icon: Grid3X3, path: '/departments', labelEn: 'Departments', labelAr: 'الأقسام' },
  { id: 'home', icon: Home, path: '/', labelEn: 'Dashboard', labelAr: 'الرئيسية' },
  { id: 'maintenanceDashboard', icon: Wrench, path: '/maintenanceDashboard', labelEn: 'Maintenance', labelAr: 'الصيانة' },
  { id: 'analytics', icon: LayoutDashboard, path: '/analytics', labelEn: 'Analytics', labelAr: 'التحليلات' },
];

const deptLabels = {
  production: { en: 'Production', ar: 'الإنتاج' },
  maintenance: { en: 'Maintenance', ar: 'الصيانة' },
  planning: { en: 'Planning', ar: 'التخطيط' },
};

const MobileNav = () => {
  const { isRTL } = useLanguage();
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentPath = location.pathname;

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #2E2D2C 0%, #1A1918 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
          borderTop: `1px solid ${colors.border}`,
          boxShadow: isDark
            ? '0 -4px 20px rgba(0, 0, 0, 0.3)'
            : '0 -4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavigate(item.path)}
                className="flex flex-col items-center justify-center px-3 py-2 rounded-xl min-w-[60px]"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)',
                } : {}}
              >
                <Icon
                  className="w-5 h-5 mb-1"
                  style={{ color: isActive ? '#FFFFFF' : colors.textMuted }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? '#FFFFFF' : colors.textMuted }}
                >
                  {isRTL ? item.labelAr : item.labelEn}
                </span>
              </motion.button>
            );
          })}

          {/* More Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-xl min-w-[60px]"
          >
            <Menu className="w-5 h-5 mb-1" style={{ color: colors.textMuted }} />
            <span className="text-[10px] font-medium" style={{ color: colors.textMuted }}>
              {isRTL ? 'المزيد' : 'More'}
            </span>
          </motion.button>
        </div>
      </nav>

      {/* Full Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl overflow-hidden"
              style={{
                background: isDark
                  ? 'linear-gradient(180deg, #2E2D2C 0%, #1A1918 100%)'
                  : 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
                maxHeight: '85vh',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 rounded-full" style={{ background: colors.border }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  {isRTL ? 'القائمة' : 'Menu'}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full"
                  style={{ background: colors.bgTertiary }}
                >
                  <X className="w-5 h-5" style={{ color: colors.textPrimary }} />
                </motion.button>
              </div>

              {/* Menu Items by Department */}
              <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
                {departmentMenus.map((dept) => (
                  <div key={dept.id} className="mb-4">
                    {/* Department Label */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: dept.color }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: dept.color }}>
                        {isRTL ? deptLabels[dept.id].ar : deptLabels[dept.id].en}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {dept.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.path;

                        return (
                          <motion.button
                            key={item.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigate(item.path)}
                            className="flex flex-col items-center justify-center p-3 rounded-2xl"
                            style={isActive ? {
                              background: `linear-gradient(135deg, ${dept.color} 0%, ${dept.color}CC 100%)`,
                              boxShadow: `0 4px 14px ${dept.color}59`,
                            } : {
                              background: colors.bgTertiary,
                            }}
                          >
                            <Icon
                              className="w-5 h-5 mb-1.5"
                              style={{ color: isActive ? '#FFFFFF' : dept.color }}
                            />
                            <span
                              className="text-[11px] font-medium text-center leading-tight"
                              style={{ color: isActive ? '#FFFFFF' : colors.textPrimary }}
                            >
                              {isRTL ? item.labelAr : item.labelEn}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Settings */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl mt-2"
                  style={{
                    background: currentPath === '/settings'
                      ? 'linear-gradient(135deg, #F39200 0%, #CC7A00 100%)'
                      : colors.bgTertiary,
                  }}
                >
                  <Settings
                    className="w-5 h-5"
                    style={{ color: currentPath === '/settings' ? '#FFFFFF' : colors.textMuted }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: currentPath === '/settings' ? '#FFFFFF' : colors.textPrimary }}
                  >
                    {isRTL ? 'الإعدادات' : 'Settings'}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
