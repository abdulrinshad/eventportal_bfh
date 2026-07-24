import React from 'react';
import { motion } from 'framer-motion';

function AuthButton({ children, loading, variant = 'primary', ...props }) {
  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: '#111827',
          color: '#FFFFFF',
          hoverBg: '#1F2937',
        };
      case 'accent':
        return {
          bg: '#2563EB',
          color: '#FFFFFF',
          hoverBg: '#1D4ED8',
        };
      case 'primary':
      default:
        return {
          bg: '#F5C451',
          color: '#111827',
          hoverBg: '#E0B03E',
        };
    }
  };

  const colors = getColors();

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={loading || props.disabled}
      style={{
        width: '100%',
        padding: '14px 20px',
        background: colors.bg,
        color: colors.color,
        border: 'none',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
        opacity: loading || props.disabled ? 0.7 : 1,
        transition: 'background-color 0.2s ease, transform 0.1s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        outline: 'none',
        marginTop: '8px',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        if (!loading && !props.disabled) e.target.style.backgroundColor = colors.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!loading && !props.disabled) e.target.style.backgroundColor = colors.bg;
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: '18px',
            height: '18px',
            border: `2px solid ${variant === 'primary' ? '#111827' : '#FFFFFF'}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'auth-spin 0.8s linear infinite',
          }}
        />
      ) : (
        children
      )}
      
      {/* Insert inline styles for custom animations if not defined */}
      <style>{`
        @keyframes auth-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.button>
  );
}

export default AuthButton;
