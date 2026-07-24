import React from 'react';

function AuthFooter() {
  return (
    <div
      style={{
        marginTop: '28px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#9CA3AF',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <a
        href="#terms"
        onClick={(e) => e.preventDefault()}
        style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}
        onMouseEnter={(e) => (e.target.style.color = '#6B7280')}
        onMouseLeave={(e) => (e.target.style.color = '#9CA3AF')}
      >
        Terms of Service
      </a>
      <span>&bull;</span>
      <a
        href="#privacy"
        onClick={(e) => e.preventDefault()}
        style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}
        onMouseEnter={(e) => (e.target.style.color = '#6B7280')}
        onMouseLeave={(e) => (e.target.style.color = '#9CA3AF')}
      >
        Privacy Policy
      </a>
      <span>&bull;</span>
      <a
        href="#support"
        onClick={(e) => e.preventDefault()}
        style={{ color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}
        onMouseEnter={(e) => (e.target.style.color = '#6B7280')}
        onMouseLeave={(e) => (e.target.style.color = '#9CA3AF')}
      >
        Contact Support
      </a>
    </div>
  );
}

export default AuthFooter;
