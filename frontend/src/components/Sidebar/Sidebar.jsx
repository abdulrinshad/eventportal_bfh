import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  FiGrid, FiUser, FiBookmark, FiCalendar, FiPlusCircle,
  FiBell, FiSettings, FiHelpCircle, FiLogOut, FiPlus, FiMenu, FiX
} from 'react-icons/fi';
import './Sidebar.css';

function Sidebar({ activeItem, setActiveItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const getActiveItem = () => {
    if (location.pathname === '/profile') return 'Profile';
    if (location.pathname === '/notifications') return 'Notifications';
    if (location.pathname === '/settings') return 'Settings';
    return activeItem || 'My Created Events';
  };

  const currentActiveItem = getActiveItem();

  const handleItemClick = (name) => {
    setIsOpen(false);
    switch (name) {
      case 'Dashboard':     navigate('/dashboard'); break;
      case 'Profile':       navigate('/profile'); break;
      case 'Notifications': navigate('/notifications'); break;
      case 'Settings':      navigate('/settings'); break;
      case 'Create Event':  navigate('/create'); break;
      default:
        if (setActiveItem) setActiveItem(name);
        if (location.pathname !== '/dashboard') navigate('/dashboard');
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/events/1');
  };

  const menuItems = [
    { name: 'Dashboard',         icon: <FiGrid className="menu-icon" /> },
    { name: 'Profile',           icon: <FiUser className="menu-icon" /> },
    { name: 'My Registrations',  icon: <FiBookmark className="menu-icon" /> },
    { name: 'My Created Events', icon: <FiCalendar className="menu-icon" /> },
    { name: 'Create Event',      icon: <FiPlusCircle className="menu-icon" /> },
    { name: 'Notifications',     icon: <FiBell className="menu-icon" /> },
    { name: 'Settings',          icon: <FiSettings className="menu-icon" /> },
  ];

  return (
    <>
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div className={'sidebar' + (isOpen ? ' open' : '')}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
              CompilVision
            </h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              Premium Management
            </span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={'menu-item' + (currentActiveItem === item.name ? ' active' : '')}
              onClick={() => handleItemClick(item.name)}
            >
              {item.icon}
              <span className="menu-text">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="new-event-btn" onClick={() => navigate('/create')}>
            <FiPlus className="btn-icon" />
            <span>New Event</span>
          </button>
          <button className="footer-item" onClick={() => alert('Help Center coming soon!')}>
            <FiHelpCircle className="menu-icon" />
            <span>Help Center</span>
          </button>
          <button className="footer-item logout-btn" onClick={handleLogout}>
            <FiLogOut className="menu-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}

export default Sidebar;
