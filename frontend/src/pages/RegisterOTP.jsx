import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthButton from '../components/auth/AuthButton';
import OTPInput from '../components/auth/OTPInput';
import AuthFooter from '../components/auth/AuthFooter';
import Toast from '../components/auth/Toast';
import { FiArrowLeft } from '../components/Icons';

function RegisterOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [verifying, setVerifying] = useState(false);

  // Redirect if accessed directly without email state
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer logic
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    try {
      setError('');
      await api.post('auth/resend-email-otp/', { email });
      setCountdown(60);
      setToastType('success');
      setToastMessage('A new 6-digit verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code. Please try again.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await api.post('auth/verify-email-otp/', { email, otp });
      navigate('/login', {
        state: {
          successMessage: 'Account verified successfully! Please sign in.',
          from: location.state?.from,
        },
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleBackToSource = () => {
    navigate('/register');
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Back button */}
        <button
          onClick={handleBackToSource}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6B7280',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px',
            transition: 'color 0.2s',
            padding: '0',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <FiArrowLeft size={16} />
          Change Info
        </button>

        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Verify your email
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.5' }}>
          We've sent a 6-digit verification code to <strong style={{ color: '#111827' }}>{email}</strong>. Enter the code below to continue.
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

        <form onSubmit={handleVerify}>
          <OTPInput value={otp} onChange={(val) => { setOtp(val); setError(''); }} />

          <AuthButton type="submit" loading={verifying}>
            Verify Account
          </AuthButton>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
          {countdown > 0 ? (
            <span>
              Resend code in <strong style={{ color: '#111827' }}>{countdown}s</strong>
            </span>
          ) : (
            <button
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
            >
              Resend Code
            </button>
          )}
        </div>
      </AuthCard>

      <AuthFooter />

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AuthLayout>
  );
}

export default RegisterOTP;
