import React from 'react';

function PasswordStrength({ password = '' }) {
  const getStrengthScore = (val) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    return score;
  };

  const score = getStrengthScore(password);

  const getLabelAndColor = () => {
    switch (score) {
      case 1:
        return { label: 'Weak', color: '#EF4444', count: 1 };
      case 2:
        return { label: 'Fair', color: '#F59E0B', count: 2 };
      case 3:
        return { label: 'Good', color: '#3B82F6', count: 3 };
      case 4:
        return { label: 'Strong', color: '#22C55E', count: 4 };
      case 0:
      default:
        return { label: '', color: '#E5E7EB', count: 0 };
    }
  };

  const { label, color, count } = getLabelAndColor();

  return (
    <div style={{ marginTop: '-8px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            style={{
              flex: 1,
              borderRadius: '2px',
              backgroundColor: index <= count ? color : '#E5E7EB',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>
      {label && (
        <span style={{ fontSize: '11px', fontWeight: '600', color: color }}>
          Password strength: {label}
        </span>
      )}
    </div>
  );
}

export default PasswordStrength;
