import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import AuthFooter from '../components/auth/AuthFooter';
import Toast from '../components/auth/Toast';
import { FiMail, FiArrowLeft } from '../components/Icons';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    // Simulate sending OTP code
    setTimeout(() => {
      setSubmitting(false);
      navigate('/otp-verification', {
        state: {
          flow: 'forgot-password',
          email: email,
        },
      });
    }, 1000);
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Back button */}
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6B7280',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <FiArrowLeft size={16} />
          Back to Login
        </Link>

        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Forgot password?
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.5' }}>
          Enter your email address and we'll send you a 6-digit verification code to reset your password.
        </p>

        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#EF4444',
              marginBottom: '20px',
              fontWeight: '500',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Email Address"
            id="forgot-email"
            name="email"
            type="email"
            placeholder="name@company.com"
            icon={FiMail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
          />

          <AuthButton type="submit" loading={submitting}>
            Send OTP Code
          </AuthButton>
        </form>
      </AuthCard>

      <AuthFooter />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AuthLayout>
  );
}

export default ForgotPassword;
