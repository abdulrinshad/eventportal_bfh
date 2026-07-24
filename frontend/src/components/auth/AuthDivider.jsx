import React from 'react';

function AuthDivider({ text = 'or continue with' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
      <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
      <span style={{ fontSize: '12px', fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {text}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
    </div>
  );
}

export default AuthDivider;
