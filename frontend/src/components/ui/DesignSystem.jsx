import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import {
  FiSearch, FiMenu, FiX, FiBell, FiUser, FiLogOut, FiCalendar, FiPlus,
  FiChevronDown, FiAlertCircle, FiSettings, FiGrid, FiBookmark, FiPlusCircle,
  FiHelpCircle, FiChevronLeft, FiChevronRight, FiTrendingUp
} from 'react-icons/fi';

/* ────────────────────────────────────────────────────────
   PAGE CONTAINER & CARD SYSTEMS
──────────────────────────────────────────────────────── */

export function PageContainer({ children, size = 'xl' }) {
  const maxW = size === 'md' ? '768px' : size === 'lg' ? '1024px' : '1280px';
  return (
    <div
      style={{
        width: '100%',
        maxWidth: maxW,
        margin: '0 auto',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

export function ContentCard({ children, onClick, style = {} }) {
  return (
    <motion.div
      whileHover={{ y: onClick ? -4 : 0, boxShadow: onClick ? 'var(--shadow-medium)' : 'var(--shadow-soft)' }}
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        padding: '24px',
        boxShadow: 'var(--shadow-soft)',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ title, value, icon: IconComponent, description, trend, trendType = 'up', extra }) {
  const renderIcon = () => {
    if (!IconComponent) return null;
    if (React.isValidElement(IconComponent)) {
      return IconComponent;
    }
    const Icon = IconComponent;
    return <Icon size={20} />;
  };

  return (
    <ContentCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '8px 0 4px 0', fontFamily: 'var(--font-heading)' }}>
            {value}
          </h3>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', color: trendType === 'up' ? '#10B981' : '#EF4444' }}>
              <FiTrendingUp style={{ transform: trendType === 'down' ? 'rotate(180deg)' : 'none' }} />
              <span>{trend}</span>
            </div>
          )}
          {description && (
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', justifyContent: 'space-between', height: '100%', minHeight: '64px' }}>
          {IconComponent && (
            <div
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: '#FFFDF5',
                border: '1px solid rgba(245, 196, 81, 0.2)',
                color: '#F5C451',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderIcon()}
            </div>
          )}
          {extra}
        </div>
      </div>
    </ContentCard>
  );
}

/* ────────────────────────────────────────────────────────
   TYPOGRAPHY & HEADERS
──────────────────────────────────────────────────────── */

export function PageHeader({ title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
        borderBottom: '1px solid #F1F5F9',
        paddingBottom: '20px',
      }}
    >
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.75px', fontFamily: 'var(--font-heading)' }}>
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: '15px', color: '#6B7280', marginTop: '6px', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, description, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   BUTTONS
──────────────────────────────────────────────────────── */

const baseBtnStyle = {
  padding: '10px 18px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-main)',
  boxSizing: 'border-box',
};

export function PrimaryButton({ children, loading, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      style={{
        ...baseBtnStyle,
        background: '#F5C451',
        color: '#111827',
        boxShadow: '0 2px 4px rgba(245, 196, 81, 0.1)',
        opacity: loading || props.disabled ? 0.7 : 1,
        cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
        ...props.style
      }}
      onMouseEnter={(e) => { if (!loading && !props.disabled) e.currentTarget.style.background = '#E5B239'; }}
      onMouseLeave={(e) => { if (!loading && !props.disabled) e.currentTarget.style.background = '#F5C451'; }}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </motion.button>
  );
}

export function SecondaryButton({ children, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      style={{
        ...baseBtnStyle,
        background: '#FFFFFF',
        color: '#374151',
        border: '1.5px solid #E5E7EB',
        ...props.style
      }}
      onMouseEnter={(e) => { if (!props.disabled) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; } }}
      onMouseLeave={(e) => { if (!props.disabled) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; } }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function DangerButton({ children, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      style={{
        ...baseBtnStyle,
        background: '#FEF2F2',
        color: '#EF4444',
        border: '1.5px solid #FEE2E2',
        ...props.style
      }}
      onMouseEnter={(e) => { if (!props.disabled) { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#FCA5A5'; } }}
      onMouseLeave={(e) => { if (!props.disabled) { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FEE2E2'; } }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function IconButton({ icon: Icon, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
        borderRadius: '12px',
        background: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        color: '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ...props.style
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
      {...props}
    >
      <Icon size={16} />
    </motion.button>
  );
}

/* ────────────────────────────────────────────────────────
   FORMS & INPUTS
──────────────────────────────────────────────────────── */

export function FormContainer({ children, onSubmit, title }) {
  return (
    <ContentCard style={{ padding: '32px' }}>
      {title && (
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '24px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
          {title}
        </h3>
      )}
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {children}
      </form>
    </ContentCard>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search events...' }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
      <span style={{ position: 'absolute', left: '14px', color: '#9CA3AF', display: 'flex' }}>
        <FiSearch size={18} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px 14px 12px 42px',
          border: '1.5px solid #E5E7EB',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#111827',
          background: '#FFFFFF',
          outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#F5C451';
          e.target.style.boxShadow = '0 0 0 3px rgba(245, 196, 81, 0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#E5E7EB';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export function FilterDropdown({ label, value, onChange, options = [] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {label && <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{label}</span>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          value={value}
          onChange={onChange}
          style={{
            appearance: 'none',
            padding: '12px 36px 12px 14px',
            border: '1.5px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#111827',
            background: '#FFFFFF',
            outline: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#F5C451';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E5E7EB';
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: '14px', color: '#9CA3AF', pointerEvents: 'none', display: 'flex' }}>
          <FiChevronDown size={16} />
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   BADGES & FEEDBACK ELEMENTS
──────────────────────────────────────────────────────── */

export function StatusBadge({ status = 'live' }) {
  const getBadgeColors = () => {
    switch (status.toLowerCase()) {
      case 'live':
      case 'published':
      case 'active':
      case 'confirmed':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'draft':
      case 'pending':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'past':
      case 'cancelled':
      case 'inactive':
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const { bg, text } = getBadgeColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        background: bg,
        color: text,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}

export function UserAvatar({ src, name, size = 40 }) {
  return (
    <img
      src={src}
      alt={name}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1.5px solid #F5C451',
      }}
      onError={(e) => {
        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
      }}
    />
  );
}

export function EmptyState({ title = 'No data available', description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#FEFBF0',
          border: '1px solid rgba(245, 196, 81, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F5C451',
          marginBottom: '16px',
        }}
      >
        <FiAlertCircle size={28} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0', maxWidth: '380px', lineHeight: '1.5' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div
        className="skeleton-pulse"
        style={{ height: '48px', width: '100%', borderRadius: '12px', background: '#F1F5F9' }}
      />
      <div
        className="skeleton-pulse"
        style={{ height: '200px', width: '100%', borderRadius: '20px', background: '#F1F5F9' }}
      />
      <div style={{ display: 'flex', gap: '16px' }}>
        <div
          className="skeleton-pulse"
          style={{ height: '140px', flex: 1, borderRadius: '20px', background: '#F1F5F9' }}
        />
        <div
          className="skeleton-pulse"
          style={{ height: '140px', flex: 1, borderRadius: '20px', background: '#F1F5F9' }}
        />
      </div>
      <style>{`
        @keyframes skeleton-blink {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .skeleton-pulse {
          animation: skeleton-blink 1.5s ease infinite;
        }
      `}</style>
    </div>
  );
}

export function NotificationCard({ title, description, time, unread, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 20px',
        background: unread ? '#FFFDF5' : '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F5C451'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
    >
      {unread && (
        <span
          style={{
            position: 'absolute',
            left: '8px',
            top: '22px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#F5C451',
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
          {title}
        </h4>
        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 6px 0', lineHeight: '1.4' }}>
          {description}
        </p>
        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{time}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   DATA TABLE COMPONENTS
──────────────────────────────────────────────────────── */

export function DataTable({ headers = [], children, pagination }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-main)' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ fontSize: '14px', color: '#374151' }}>
          {children}
        </tbody>
      </table>
      {pagination && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #E5E7EB', background: '#F8FAFC' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Showing page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SecondaryButton
              onClick={pagination.onPrev}
              disabled={pagination.currentPage <= 1}
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              <FiChevronLeft /> Previous
            </SecondaryButton>
            <SecondaryButton
              onClick={pagination.onNext}
              disabled={pagination.currentPage >= pagination.totalPages}
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
            >
              Next <FiChevronRight />
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MODAL COMPONENT
──────────────────────────────────────────────────────── */

export function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17, 24, 39, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            style={{
              position: 'relative',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              zIndex: 10,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────
   APP LAYOUT: SIDEBAR, HEADER, AND MAIN STRUCTURE
──────────────────────────────────────────────────────── */

export function AppLayout({ children, activeItem, setActiveItem }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const UserProfileDropdown = () => (
    <div style={{ position: 'relative' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
        onClick={toggleDropdown}
      >
        <UserAvatar src={user?.avatar} name={user?.username} size={36} />
        <div className="top-nav-username" style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{user?.username}</span>
          <span style={{ fontSize: '11px', color: '#6B7280' }}>Attendee</span>
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
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Profile', path: '/profile' },
            { label: 'My Registrations', path: '/my-registrations' },
            { label: 'My Created Events', path: '/my-created-events' },
            { label: 'Settings', path: '/settings' }
          ].map((item) => (
            <button
              key={item.label}
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
              {item.label}
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

  const isAuthPage = ['/login', '/register', '/forgot-password', '/otp-verification', '/reset-password'].includes(location.pathname);
  const isPublicEventPage = location.pathname === '/events' || location.pathname.startsWith('/events/');
  const isLandingPage = location.pathname === '/';
  const isPublicInfoPage = ['/about', '/contact', '/help-center', '/registration-success'].includes(location.pathname);
  
  const isPublic = isAuthPage || isPublicEventPage || isLandingPage || isPublicInfoPage;

  const menuItems = [
    { name: 'Dashboard', icon: <FiGrid /> },
    { name: 'Profile', icon: <FiUser /> },
    { name: 'My Registrations', icon: <FiBookmark /> },
    { name: 'My Created Events', icon: <FiCalendar /> },
    { name: 'Create Event', icon: <FiPlusCircle /> },
    { name: 'Notifications', icon: <FiBell /> },
    { name: 'Settings', icon: <FiSettings /> },
  ];

  const getActiveItem = () => {
    if (location.pathname === '/profile') return 'Profile';
    if (location.pathname === '/notifications') return 'Notifications';
    if (location.pathname === '/settings') return 'Settings';
    if (location.pathname === '/create') return 'Create Event';
    if (location.pathname === '/help-center') return 'Help Center';
    if (location.pathname === '/my-registrations') return 'My Registrations';
    if (location.pathname === '/my-created-events') return 'My Created Events';
    return activeItem || 'Dashboard';
  };

  const currentActive = getActiveItem();

  const handleMenuClick = (name) => {
    setMobileOpen(false);
    switch (name) {
      case 'Dashboard': navigate('/dashboard'); break;
      case 'Profile': navigate('/profile'); break;
      case 'Notifications': navigate('/notifications'); break;
      case 'Settings': navigate('/settings'); break;
      case 'Create Event': navigate('/create'); break;
      case 'Help Center': navigate('/help-center'); break;
      case 'My Registrations': navigate('/my-registrations'); break;
      case 'My Created Events': navigate('/my-created-events'); break;
      default:
        if (setActiveItem) setActiveItem(name);
        if (location.pathname !== '/dashboard') navigate('/dashboard');
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Top Nav Menu items
  const publicLinks = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', width: '100vw', overflowX: 'hidden' }}>
      
      {/* ── SIDEBAR (Only for authenticated, non-public views) ── */}
      {!isPublic && user && (
        <>
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
              display: 'none', // Styled responsive in CSS: block on small viewports
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
            {/* Logo area */}
            <Link 
              to="/" 
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
              onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              <span style={{ fontSize: '24px' }}>📅</span>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  CompilVision
                </h2>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>Event SaaS System</span>
              </div>
            </Link>

            {/* Menu items */}
            <nav style={{ padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
              {menuItems.map((item) => {
                const isActive = currentActive === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleMenuClick(item.name)}
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
              <PrimaryButton onClick={() => navigate('/create')} style={{ width: '100%' }}>
                <FiPlus /> New Event
              </PrimaryButton>
              <button
                onClick={() => handleMenuClick('Help Center')}
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
        </>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: !isPublic && user ? '260px' : 0,
          transition: 'margin-left 0.3s ease',
        }}
        className="main-content-wrapper"
      >
        {/* ── TOP NAVIGATION BAR ── */}
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
          {isPublic ? (
            // Public Top Navigation
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>📅</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827', fontFamily: 'var(--font-heading)' }}>
                    CompilVision
                  </span>
                </Link>
                <nav className="public-nav-links" style={{ display: 'flex', gap: '24px' }}>
                  {publicLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.path}
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: (link.path === '/' ? location.pathname === '/' : (link.path === '/events' ? (location.pathname === '/events' || location.pathname.startsWith('/events/')) : location.pathname === link.path)) ? '#111827' : '#6B7280',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user ? (
                  <UserProfileDropdown />
                ) : (
                  <>
                    <SecondaryButton onClick={() => navigate('/login')}>Login</SecondaryButton>
                    <PrimaryButton onClick={() => navigate('/register')}>Register</PrimaryButton>
                  </>
                )}
              </div>
            </>
          ) : (
            // Authenticated Dashboard Top Navigation
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="page-current-title" style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                  {currentActive}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Notifications trigger */}
                <IconButton icon={FiBell} onClick={() => navigate('/notifications')} style={{ border: 'none', position: 'relative' }} />
                
                {/* User Menu Dropdown */}
                <UserProfileDropdown />
              </div>
            </>
          )}
        </header>

        {/* ── PAGE CONTENT CONTAINER ── */}
        <main style={{ flex: 1, padding: '24px 0', boxSizing: 'border-box' }}>
          {children}
        </main>

        {/* ── FOOTER ── */}
        <footer
          style={{
            padding: '24px',
            borderTop: '1px solid #E5E7EB',
            background: '#FFFFFF',
            textAlign: 'center',
            fontSize: '13px',
            color: '#6B7280',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', maxWidth: '1200px', margin: '0 auto' }}>
            <span>&copy; {new Date().getFullYear()} CompilVision. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#terms" onClick={e => e.preventDefault()}>Terms</a>
              <a href="#privacy" onClick={e => e.preventDefault()}>Privacy</a>
              <a href="#support" onClick={e => e.preventDefault()}>Support</a>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        /* Responsive CSS Overrides */
        @media (max-width: 1024px) {
          .mobile-hamburger {
            display: block !important;
          }
          .app-sidebar {
            transform: translateX(-100%);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
          .top-nav-username, .public-nav-links {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
