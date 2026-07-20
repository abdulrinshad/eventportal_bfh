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
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Left: Logo */}
        <Link to="/" className="navbar-logo">
          <FiCalendar /> Event<span>Hub</span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <ul className="navbar-menu">
            <li>
              <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Events
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Contact
              </NavLink>
            </li>
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
