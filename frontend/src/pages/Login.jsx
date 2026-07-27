import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import AuthDivider from '../components/auth/AuthDivider';
import SocialLogin from '../components/auth/SocialLogin';
import AuthFooter from '../components/auth/AuthFooter';
import Toast from '../components/auth/Toast';
import { FiMail, FiLock } from '../components/Icons';

function Login() {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Show success message from registration or password reset redirect
    if (location.state?.successMessage) {
      setToastType('success');
      setToastMessage(location.state.successMessage);
      // Clear location state to prevent showing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const loggedUser = await login({ email: formData.email, password: formData.password });
      if (rememberMe) {
        localStorage.setItem('remembered_email', formData.email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      const redirectPath = location.state?.from || (loggedUser.role === 'ADMIN' ? '/admin' : loggedUser.role === 'ORGANIZER' ? '/organizer/dashboard' : '/student/dashboard');
      
      const targetPath = typeof redirectPath === 'string' ? redirectPath : (redirectPath.pathname || '/');
      if (targetPath === '/organizer/apply') {
        setToastType('success');
        setToastMessage(
          <div>
            <strong style={{ fontWeight: '700', display: 'block', marginBottom: '2px' }}>Welcome back!</strong>
            <span style={{ fontSize: '12px', color: '#475569' }}>Redirecting you to the Organizer Application...</span>
          </div>
        );
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 1500);
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Populate remembered email if exists
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <AuthLayout>
      <AuthCard>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
          <span style={{ fontSize: '28px' }}>📅</span>
          <span style={{ fontSize: '22px', color: '#111827', letterSpacing: '-0.5px' }}>
            Event<strong>Portal</strong>
          </span>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px', textAlign: 'center' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
          Sign in to access your dashboard and events.
        </p>

        {/* Demo credentials hint */}
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FEF3C7',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#B45309',
            marginBottom: '20px',
            lineHeight: '1.6',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '4px' }}>Demo Accounts Available:</strong>
          <div>• <strong>Admin:</strong> admin@eventhub.com / admin123</div>
          <div>• <strong>Organizer:</strong> organizer@eventhub.com / organizer123</div>
          <div>• <strong>Student:</strong> student@eventhub.com / student123</div>
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

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Email Address"
            id="login-email"
            name="email"
            type="email"
            placeholder="name@company.com"
            icon={FiMail}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <AuthInput
            label="Password"
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={FiLock}
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Remember me & Forgot Password */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#374151', fontWeight: '500' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: '1.5px solid #D1D5DB',
                  cursor: 'pointer',
                  accentColor: '#F5C451',
                }}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              style={{
                color: '#2563EB',
                textDecoration: 'none',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" loading={submitting}>
            Sign In
          </AuthButton>
        </form>

        <AuthDivider />

        <SocialLogin
          onGoogleLogin={() => {
            setToastType('success');
            setToastMessage('Google Auth redirect placeholder triggered.');
          }}
          onGithubLogin={() => {
            setToastType('success');
            setToastMessage('GitHub Auth redirect placeholder triggered.');
          }}
        />

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '24px', marginBottom: '0' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#F5C451',
              fontWeight: '600',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Register
          </Link>
        </p>

        {/* Organizer Application CTA Card */}
        <div style={{
          marginTop: '28px',
          padding: '20px',
          background: '#FFFDF5',
          border: '1px solid rgba(245, 196, 81, 0.25)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>📣</div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Want to organize events?</h4>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
              Apply for organizer privileges and start creating and managing events after administrator approval.
            </p>
          </div>
          <button 
            onClick={() => navigate('/organizer/apply')}
            style={{
              background: '#F5C451',
              color: '#111827',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 196, 81, 0.2)',
              width: '100%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#E0B03C'}
            onMouseLeave={(e) => e.target.style.background = '#F5C451'}
          >
            Apply Now
          </button>
        </div>
      </AuthCard>

      <AuthFooter />

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </AuthLayout>
  );
}

export default Login;
