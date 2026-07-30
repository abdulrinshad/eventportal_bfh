import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Ticket,
  CreditCard,
  Tags,
  FileSpreadsheet,
  Bell,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Command,
  User
} from 'lucide-react';

import { getAdminDashboardStats } from '../../services/adminService';

export default function AdminLayout({ children, currentTab, setCurrentTab }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('admin-theme') === 'dark';
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingBadgeCount, setPendingBadgeCount] = useState(null);

  useEffect(() => {
    let mounted = true;
    getAdminDashboardStats()
      .then((res) => {
        if (mounted && res?.success && res.data) {
          const count = res.data.pending_approvals_count ?? 
            ((res.data.organizers?.pending || 0) + (res.data.events?.pending || 0));
          setPendingBadgeCount(count);
        }
      })
      .catch(() => {
        if (mounted) setPendingBadgeCount(0);
      });
    return () => {
      mounted = false;
    };
  }, [currentTab]);

  // Apply dark mode theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [isDarkMode]);

  // Sidebar item list
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'organizers', name: 'Teachers / Organizers', icon: GraduationCap },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'approvals', name: 'Pending Approvals', icon: ShieldCheck, badgeCount: pendingBadgeCount !== null && pendingBadgeCount > 0 ? pendingBadgeCount : undefined },
    { id: 'registrations', name: 'Registrations', icon: Ticket },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'categories', name: 'Categories', icon: Tags },
    { id: 'reports', name: 'Reports', icon: FileSpreadsheet },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'audit-logs', name: 'Audit Logs', icon: History },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const activeItem = sidebarItems.find(item => item.id === currentTab);
    return [
      { name: 'Console', active: false },
      { name: activeItem ? activeItem.name : 'Dashboard', active: true }
    ];
  };

  const mockAdminNotifications = [
    { id: 1, title: 'Event Submission', desc: 'Satoshi Nakamoto submitted "Bitcoin DevConf"', time: '10m ago', unread: true },
    { id: 2, title: 'Organizer Application', desc: 'Marie Curie requested organizer status verification', time: '1h ago', unread: true },
    { id: 3, title: 'Disputed Refund Request', desc: 'Refund requested for Transaction #TXN-99081', time: '4h ago', unread: false },
  ];

  // Dynamic Theme Colors
  const themeStyles = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#475569',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    sidebarBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    sidebarHover: isDarkMode ? '#334155' : '#FEFBF0',
    accentYellow: '#F5C451',
    glassBg: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)'
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: themeStyles.bg,
        color: themeStyles.text,
        fontFamily: 'var(--font-main)',
        transition: 'background 0.3s ease, color 0.3s ease',
        overflowX: 'hidden'
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: isSidebarCollapsed ? '80px' : '280px',
          background: themeStyles.sidebarBg,
          borderRight: `1px solid ${themeStyles.border}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 900,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Sidebar Logo Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: `1px solid ${themeStyles.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            height: '70px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>📅</span>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ whiteSpace: 'nowrap' }}
              >
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  CompilVision
                </h2>
                <span style={{ fontSize: '10px', color: themeStyles.accentYellow, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enterprise Console
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Collapsible Switch Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '-14px',
            background: themeStyles.accentYellow,
            color: '#111827',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 999
          }}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Navigation Items */}
        <nav
          style={{
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {sidebarItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isActive ? (isDarkMode ? '#334155' : '#FFFDF5') : 'transparent',
                  color: isActive ? themeStyles.text : themeStyles.textSecondary,
                  border: isActive ? `1px solid ${isDarkMode ? '#475569' : 'rgba(245, 196, 81, 0.3)'}` : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon size={18} style={{ color: isActive ? themeStyles.accentYellow : themeStyles.textSecondary, flexShrink: 0 }} />
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {item.name}
                  </motion.span>
                )}
                {item.badgeCount && (
                  <span
                    style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: '700',
                      borderRadius: '8px',
                      padding: '2px 6px',
                      marginLeft: 'auto'
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px 14px', borderTop: `1px solid ${themeStyles.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.2s',
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div
        style={{
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '280px',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* TOP NAVBAR */}
        <header
          style={{
            height: '70px',
            background: themeStyles.glassBg,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${themeStyles.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background 0.3s ease, border-color 0.3s ease'
          }}
        >
          {/* Left: Breadcrumbs & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
              {getBreadcrumbs().map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: themeStyles.textSecondary }}>/</span>}
                  <span style={{ color: b.active ? themeStyles.text : themeStyles.textSecondary, fontWeight: b.active ? '700' : '500' }}>
                    {b.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <span style={{ width: '1px', height: '16px', background: themeStyles.border }} />
            <span style={{ fontSize: '12px', color: themeStyles.textSecondary, fontWeight: '500' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Right: Actions, Search, Mode Toggle, Notifications, Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: themeStyles.textSecondary }} />
              <input
                type="text"
                placeholder="Type Ctrl+K to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: isDarkMode ? '#334155' : '#F1F5F9',
                  border: `1px solid ${themeStyles.border}`,
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: themeStyles.text,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <Command size={12} style={{ position: 'absolute', right: '12px', color: themeStyles.textSecondary }} />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                background: 'transparent',
                border: 'none',
                color: themeStyles.textSecondary,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} style={{ color: '#F5C451' }} /> : <Moon size={18} />}
            </button>

            {/* Notifications Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: themeStyles.textSecondary,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#EF4444'
                  }}
                />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      top: '45px',
                      right: 0,
                      width: '320px',
                      background: themeStyles.card,
                      border: `1px solid ${themeStyles.border}`,
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      padding: '16px',
                      zIndex: 1000
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Inbox Alerts</h4>
                      <span style={{ fontSize: '11px', color: themeStyles.accentYellow, fontWeight: '600', cursor: 'pointer' }}>Mark all read</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {mockAdminNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          style={{
                            padding: '10px',
                            background: notif.unread ? (isDarkMode ? '#334155' : '#FEFBF0') : 'transparent',
                            borderRadius: '10px',
                            border: `1px solid ${themeStyles.border}`,
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '2px' }}>
                            <span>{notif.title}</span>
                            <span style={{ color: themeStyles.textSecondary, fontWeight: '400', fontSize: '10px' }}>{notif.time}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '11px', color: themeStyles.textSecondary, lineHeight: '1.4' }}>{notif.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt="admin-avatar"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${themeStyles.accentYellow}` }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>{user?.username || 'Admin Console'}</span>
                  <span style={{ fontSize: '10px', color: themeStyles.accentYellow, fontWeight: '600' }}>Super Administrator</span>
                </div>
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '200px',
                      background: themeStyles.card,
                      border: `1px solid ${themeStyles.border}`,
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      padding: '6px',
                      zIndex: 1000
                    }}
                  >
                    <button
                      onClick={() => { setShowProfileMenu(false); setCurrentTab('settings'); }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '13px',
                        color: themeStyles.text,
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#334155' : '#F8FAFC'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <User size={14} /> My Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '13px',
                        color: '#EF4444',
                        fontWeight: '700',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderTop: `1px solid ${themeStyles.border}`,
                        marginTop: '4px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#451a1a' : '#FEF2F2'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main style={{ flex: 1, padding: '32px 24px', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
