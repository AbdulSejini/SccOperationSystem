
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';

// Layout Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import MobileNav from './components/Layout/MobileNav';

// Pages
import DepartmentHome from './pages/DepartmentHome';
import DisabledPage from './pages/DisabledPage';
import MachineProfiles from './pages/MachineProfiles';
import MachineProfileDetail from './pages/MachineProfileDetail';
// import Home from './pages/Home';
// import FactoryView from './pages/FactoryView';
// import CapacityPlanning from './pages/CapacityPlanning';
// import Scheduling from './pages/Scheduling';
// import ShopFloor from './pages/ShopFloor';
// import Maintenance from './pages/Maintenance';
// import Quality from './pages/Quality';
// import Scrap from './pages/Scrap';
// import Workforce from './pages/Workforce';
// import Analytics from './pages/Analytics';
// import Settings from './pages/Settings';
// import MachineManagement from './pages/MachineManagement';
// import MaintenanceChecklist from './pages/MaintenanceChecklist';
// import PMSchedule from './pages/PMSchedule';

// Page Wrapper for Animations
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// Main Layout with Sidebar and Header (for department pages)
const MainLayout = ({ children }) => {
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  // Map route paths to titles
  const getPageTitle = () => {
    const path = location.pathname.substring(1) || 'home';
    const titles = {
      home: t('header.title'),
      factoryLayout: t('nav.factoryLayout'),
      capacityPlanning: t('nav.capacityPlanning'),
      scheduling: t('nav.scheduling'),
      shopFloor: t('nav.shopFloor'),
      maintenanceDashboard: t('nav.maintenanceDashboard'),
      qualityControl: t('nav.qualityControl'),
      scrapManagement: t('nav.scrapManagement'),
      workforceManagement: t('nav.workforceManagement'),
      analytics: t('nav.analytics'),
      machineManagement: t('nav.machineManagement') || 'Machine Management',
      maintenanceChecklist: t('nav.maintenanceChecklist') || 'Maintenance Checklist',
      pmSchedule: t('nav.pmSchedule') || 'PM Schedule',
      machineProfiles: t('nav.machineProfiles') || 'Machine Profiles',
      settings: t('common.settings'),
    };
    return titles[path] || t('header.title');
  };

  return (
    <div className="min-h-screen bg-[#0f1115]">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content - Full width on mobile, with sidebar margin on desktop */}
      <main className={`transition-all duration-300 pb-20 md:pb-0 ${isRTL ? 'md:mr-[280px]' : 'md:ml-[280px]'}`}>
        <Header title={getPageTitle()} subtitle={t('header.subtitle')} />
        <AnimatePresence mode="wait">
          <PageWrapper key={location.pathname}>
            {children}
          </PageWrapper>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation - Only on mobile */}
      <MobileNav />
    </div>
  );
};

// Root App Component - No Authentication Required
const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <DataProvider>
            <Routes>
              {/* Machine Profiles */}
              <Route path="/machineProfiles" element={<MainLayout><MachineProfiles /></MainLayout>} />
              <Route path="/machineProfiles/:machineId" element={<MainLayout><MachineProfileDetail /></MainLayout>} />
              {/* All other pages disabled */}
              <Route path="*" element={<DisabledPage />} />
            </Routes>
          </DataProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
