import React, { useState } from 'react';
import { FiEye, FiEyeOff } from '../Icons';

function AuthInput({ label, type = 'text', error, icon: IconComponent, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#1F2937',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {IconComponent && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              color: error ? '#EF4444' : '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <IconComponent size={18} />
          </span>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          style={{
            width: '100%',
            padding: `12px 14px 12px ${IconComponent ? '42px' : '14px'}`,
            paddingRight: isPassword ? '42px' : '14px',
            border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`,
            borderRadius: '12px',
            fontSize: '15px',
            color: '#111827',
            outline: 'none',
            background: '#FFFFFF',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
          }}
          // Dynamic box shadow on focus in CSS is best, but since this is pure inline style:
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = '#F5C451';
            e.target.style.boxShadow = error ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : '0 0 0 3px rgba(245, 196, 81, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            style={{
              position: 'absolute',
              right: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <span
          style={{
            fontSize: '12px',
            color: '#EF4444',
            fontWeight: '500',
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

export default AuthInput;
