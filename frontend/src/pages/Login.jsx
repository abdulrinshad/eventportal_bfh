import React, { useState, useContext } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Login Page — Simple mock login form.
 * Uses AuthContext for authentication.
 * Redirects to the originally requested page after login.
 */
function Login() {
  const { login, register, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>📅</span>
          <span style={styles.logoText}>Event<strong>Portal</strong></span>
        </div>

        <h1 style={styles.title}>
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h1>
        <p style={styles.subtitle}>
          {mode === 'login'
            ? 'Sign in to access your dashboard and events.'
            : 'Join EventPortal to manage and attend events.'}
        </p>

        {/* Demo credentials hint */}
        {mode === 'login' && (
          <div style={styles.hint}>
            <strong>Demo:</strong> admin@eventhub.com / admin123
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="login-username">Username</label>
              <input
                id="login-username"
                name="username"
                type="text"
                style={styles.input}
                placeholder="Your name"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              style={styles.input}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" style={styles.btn} disabled={submitting}>
            {submitting
              ? 'Please wait...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={styles.switchBtn}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
    padding: '24px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '48px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '22px', color: '#1F2937', letterSpacing: '-0.5px' },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: { fontSize: '15px', color: '#64748B', marginBottom: '20px' },
  hint: {
    background: '#FFF8E7',
    border: '1px solid #F5C451',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#92400E',
    marginBottom: '20px',
  },
  error: {
    background: '#FEE2E2',
    border: '1px solid #FCA5A5',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#B91C1C',
    marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0px' },
  formGroup: { marginBottom: '18px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#0F172A',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: '#F5C451',
    color: '#0F172A',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.2s',
  },
  switchText: { textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '24px' },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#F5C451',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid #E2E8F0',
    borderTopColor: '#F5C451',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default Login;
