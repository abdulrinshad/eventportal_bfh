import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import PasswordStrength from '../components/auth/PasswordStrength';
import AuthFooter from '../components/auth/AuthFooter';
import Toast from '../components/auth/Toast';
import { FiLock } from '../components/Icons';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const verified = location.state?.verified;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if accessed directly without verified token/state
  useEffect(() => {
    if (!verified || !email) {
      navigate('/login', { replace: true });
    }
  }, [verified, email, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Simulate password reset delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock update to the local storage users database if the user is registered there
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const userIndex = users.findIndex((u) => u.email === email);
      if (userIndex !== -1) {
        users[userIndex].password = formData.password;
        localStorage.setItem('mock_users', JSON.stringify(users));
      }

      navigate('/login', {
        state: {
          successMessage: 'Password updated successfully! Please sign in with your new password.',
        },
        replace: true,
      });
    } catch (err) {
      setToastMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Reset your password
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.5' }}>
          Enter a new, secure password for your account <strong style={{ color: '#111827' }}>{email}</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="New Password"
            id="reset-password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={FiLock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <PasswordStrength password={formData.password} />

          <AuthInput
            label="Confirm New Password"
            id="reset-confirmpassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={FiLock}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <AuthButton type="submit" loading={submitting}>
            Reset Password
          </AuthButton>
        </form>
      </AuthCard>

      <AuthFooter />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AuthLayout>
  );
}

export default ResetPassword;
