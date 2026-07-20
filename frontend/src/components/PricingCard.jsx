import React from 'react';
import { FiCheck, FiShield } from './Icons';
import Button from './Button';

const CHECKLIST = [
  'Full access to keynote sessions',
  'Lunch and refreshments included',
  'Networking pass for all days',
  'Official summit certificate',
];

const PricingCard = ({ event, isRegistered, onRegister, loading }) => {
  return (
    <div className="card pricing-card">
      <div className="pricing-header-badge">🔥 Sale ends soon</div>

      <div className="price-container">
        <span className="price-amount">${event.price}</span>
        <span className="price-unit">/person</span>
      </div>

      <ul className="checklist">
        {CHECKLIST.map((item, i) => (
          <li key={i} className="checklist-item">
            <FiCheck />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {isRegistered ? (
        <div className="reg-alert success" style={{ marginBottom: '16px', textAlign: 'center', fontWeight: '700' }}>
          <FiCheck /> You're Registered!
        </div>
      ) : (
        <Button
          variant="primary"
          fullWidth
          onClick={onRegister}
          disabled={loading}
          style={{ fontSize: '16px', padding: '16px', marginBottom: '16px' }}
        >
          {loading ? 'Processing...' : 'Register Now'}
        </Button>
      )}

      <div className="pricing-footer">
        <FiShield />
        <span>Secure Checkout · 30-Day Refund Policy</span>
      </div>
    </div>
  );
};

export default PricingCard;
