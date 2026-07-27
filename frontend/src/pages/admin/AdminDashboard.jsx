import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  OverviewTab,
  AnalyticsTab,
  UsersTab,
  OrganizersTab,
  EventsTab,
  ApprovalsTab,
  RegistrationsTab,
  PaymentsTab,
  CategoriesTab,
  ReportsTab,
  NotificationsTab,
  AuditLogsTab,
  SettingsTab
} from './AdminSubPages';

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <OverviewTab setActiveTab={setCurrentTab} setGlobalToast={triggerToast} />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'users':
        return <UsersTab setGlobalToast={triggerToast} />;
      case 'organizers':
        return <OrganizersTab setGlobalToast={triggerToast} />;
      case 'events':
        return <EventsTab setGlobalToast={triggerToast} />;
      case 'approvals':
        return <ApprovalsTab setGlobalToast={triggerToast} />;
      case 'registrations':
        return <RegistrationsTab setGlobalToast={triggerToast} />;
      case 'payments':
        return <PaymentsTab setGlobalToast={triggerToast} />;
      case 'categories':
        return <CategoriesTab setGlobalToast={triggerToast} />;
      case 'reports':
        return <ReportsTab setGlobalToast={triggerToast} />;
      case 'notifications':
        return <NotificationsTab setGlobalToast={triggerToast} />;
      case 'audit-logs':
        return <AuditLogsTab />;
      case 'settings':
        return <SettingsTab setGlobalToast={triggerToast} />;
      default:
        return <OverviewTab setActiveTab={setCurrentTab} setGlobalToast={triggerToast} />;
    }
  };

  return (
    <AdminLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25, cubicBezier: [0.4, 0, 0.2, 1] }}
          style={{ width: '100%' }}
        >
          {renderActiveTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Floating System Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#111827',
              color: '#FFFFFF',
              border: '1px solid rgba(245, 196, 81, 0.3)',
              borderRadius: '12px',
              padding: '12px 20px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              zIndex: 99999,
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: '#F5C451' }}>✦</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
