import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthButton from '../components/auth/AuthButton';
import OTPInput from '../components/auth/OTPInput';
import AuthFooter from '../components/auth/AuthFooter';
import Toast from '../components/auth/Toast';
import { FiArrowLeft } from '../components/Icons';

function OTPVerification() {
  const { register, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const flow = location.state?.flow; // 'register' | 'forgot-password'
  const email = location.state?.email || location.state?.registrationData?.email;
  const registrationData = location.state?.registrationData;

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [verifying, setVerifying] = useState(false);

  // Redirect if accessed directly without state
  useEffect(() => {
    if (!flow || !email) {
      navigate('/login', { replace: true });
    }
  }, [flow, email, navigate]);

  // Countdown timer logic
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = () => {
    setCountdown(60);
    setToastType('success');
    setToastMessage('A new 6-digit verification code has been sent to your email.');
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
      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock OTP validation (e.g. accepts 123456 or any code for testing/demo)
      if (otp !== '123456' && otp.length === 6) {
        // We will accept any 6-digit code for mock demo ease, but if they enter e.g. '000000', show error.
        if (otp === '000000') {
          throw new Error('Invalid verification code. Try entering 123456.');
        }
      }

      if (flow === 'register') {
        // Complete account registration in context database
        await register(
          registrationData.username,
          registrationData.email,
          registrationData.password
        );
        // Clear active session to enforce login page traversal
        logout();
        navigate('/login', {
          state: {
            successMessage: 'Account verified successfully! Please sign in.',
          },
          replace: true,
        });
      } else if (flow === 'forgot-password') {
        // Move to reset password page with email and security token state
        navigate('/reset-password', {
          state: {
            email: email,
            verified: true,
          },
          replace: true,
        });
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleBackToSource = () => {
    if (flow === 'register') {
      navigate('/register');
    } else {
      navigate('/forgot-password');
    }
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
          {flow === 'register' ? 'Change Info' : 'Change Email'}
        </button>

        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Verify your email
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.5' }}>
          We've sent a 6-digit verification code to <strong style={{ color: '#111827' }}>{email}</strong>. Enter the code below to continue.
        </p>

        {/* Demo Hint */}
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#1D4ED8',
            marginBottom: '20px',
          }}
        >
          <strong>Demo:</strong> Enter any 6-digit code (e.g. 123456)
        </div>

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
                fontSize: '14px',
                padding: '0',
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

export default OTPVerification;
