import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  FiGrid, FiPlusCircle, FiCalendar, FiClock, FiXCircle,
  FiUsers, FiBarChart2, FiBell, FiUser, FiHelpCircle, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import { UserAvatar, IconButton } from '../../components/ui/DesignSystem';

export default function OrganizerLayout({ children, activeItem }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard',        path: '/organizer/dashboard',        icon: <FiGrid /> },
    { name: 'Create Event',     path: '/organizer/events/create',    icon: <FiPlusCircle /> },
    { name: 'My Events',        path: '/organizer/events',           icon: <FiCalendar /> },
    { name: 'Pending Approval', path: '/organizer/events/pending',   icon: <FiClock /> },
    { name: 'Rejected Events',  path: '/organizer/events/rejected',  icon: <FiXCircle /> },
    { name: 'Participants',     path: '/organizer/participants',      icon: <FiUsers /> },
    { name: 'Analytics',        path: '/organizer/analytics',        icon: <FiBarChart2 /> },
    { name: 'Notifications',    path: '/organizer/notifications',    icon: <FiBell /> },
    { name: 'Profile',          path: '/organizer/profile',          icon: <FiUser /> },
  ];

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/organizer/dashboard') return 'Dashboard';
    if (path === '/organizer/events/create') return 'Create Event';
    if (path === '/organizer/events/pending') return 'Pending Approval';
    if (path === '/organizer/events/rejected') return 'Rejected Events';
    if (path === '/organizer/events' || path.startsWith('/organizer/events/edit/')) return 'My Events';
    if (path.startsWith('/organizer/participants')) return 'Participants';
    if (path.startsWith('/organizer/analytics')) return 'Analytics';
    if (path.startsWith('/organizer/notifications')) return 'Notifications';
    if (path.startsWith('/organizer/profile')) return 'Profile';
    if (path.startsWith('/organizer/help-center')) return 'Help Center';
    return activeItem || 'Dashboard';
  };

  const currentActive = getActiveItem();

  const UserProfileDropdown = () => (
    <div style={{ position: 'relative' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
        onClick={toggleDropdown}
      >
        <UserAvatar src={user?.avatar} name={user?.username} size={36} />
        <div className="top-nav-username" style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{user?.username}</span>
          <span style={{ fontSize: '11px', color: '#F5C451', fontWeight: '600' }}>Organizer</span>
        </div>
        <span style={{ fontSize: '10px', color: '#6B7280', marginLeft: '2px' }}>▼</span>
      </div>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '44px',
            right: 0,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            width: '180px',
            zIndex: 9999,
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setShowDropdown(false);
                navigate(item.path);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 12px',
                fontSize: '13px',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#374151',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              {item.name}
            </button>
          ))}
          <div style={{ borderTop: '1px solid #F1F5F9', margin: '4px 0' }} />
          <button
            onClick={() => {
              setShowDropdown(false);
              handleLogout();
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              color: '#EF4444',
              fontWeight: '600',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', width: '100vw', overflowX: 'hidden' }}>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 999,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          padding: '8px',
          cursor: 'pointer',
          display: 'none',
        }}
        className="mobile-hamburger"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Left Sidebar drawer */}
      <aside
        style={{
          width: '260px',
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 900,
          transition: 'transform 0.3s ease',
        }}
        className={`app-sidebar ${mobileOpen ? 'open' : ''}`}
      >
        {/* Logo — links to organizer dashboard, not public home */}
        <Link 
          to="/organizer/dashboard" 
          style={{ 
            padding: '24px', 
            borderBottom: '1px solid #F1F5F9', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>📅</span>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
              CompilVision
            </h2>
            <span style={{ fontSize: '11px', color: '#F5C451', fontWeight: '700' }}>Organizer Panel</span>
          </div>
        </Link>

        {/* Menu items */}
        <nav style={{ padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = currentActive === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setMobileOpen(false);
                  navigate(item.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActive ? '#FFFDF5' : 'transparent',
                  color: isActive ? '#111827' : '#475569',
                  border: isActive ? '1px solid rgba(245, 196, 81, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
              >
                <span style={{ color: isActive ? '#F5C451' : '#94A3B8', display: 'flex' }}>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer triggers */}
        <div style={{ padding: '20px 14px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate('/organizer/help-center')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              color: '#6B7280',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              textAlign: 'left',
            }}
          >
            <FiHelpCircle size={16} />
            <span>Help Center</span>
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              textAlign: 'left',
            }}
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: '260px',
          transition: 'margin-left 0.3s ease',
        }}
        className="main-content-wrapper"
      >
        <header
          style={{
            height: '70px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
              {currentActive}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <IconButton icon={FiBell} onClick={() => navigate('/organizer/notifications')} style={{ border: 'none', position: 'relative' }} />
            <UserProfileDropdown />
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 24px', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .app-sidebar {
            transform: translateX(-260px);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
          .mobile-hamburger {
            display: block !important;
          }
          .top-nav-username {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
