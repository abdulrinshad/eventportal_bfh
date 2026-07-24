import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FiCalendar, FiLogOut, FiUser, FiActivity
} from './Icons';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/events/1');
  };

  const logoHref = user ? '/dashboard' : '/events/1';

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Left: Logo */}
        <Link to={logoHref} className="navbar-logo">
          <FiCalendar /> Event<span>Hub</span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <ul className="navbar-menu">
            <li>
              <NavLink to="/events/1" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/events/1" className={({ isActive }) => `navbar-link`}>
                Events
              </NavLink>
            </li>
            {user && (
              <>
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/create" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Create Event
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user-info">
              <Link to="/dashboard" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}>
                <FiActivity /> Dashboard
              </Link>
              <Link to="/profile">
                <img src={user.avatar} alt={user.username} className="navbar-avatar" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'; }} />
              </Link>
              <button onClick={handleLogout} className="navbar-login-btn" style={{ padding: 0, display: 'flex', alignItems: 'center', fontSize: '18px' }} title="Logout">
                <FiLogOut />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="navbar-login-btn">
                Login
              </button>
              <Button onClick={() => navigate('/register')} variant="primary">
                Register
              </Button>
            </>
          )}
          {/* Hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
