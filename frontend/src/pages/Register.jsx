import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import PasswordStrength from '../components/auth/PasswordStrength';
import AuthFooter from '../components/auth/AuthFooter';
import Toast from '../components/auth/Toast';
import { FiUser, FiMail, FiLock } from '../components/Icons';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email address is invalid';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.acceptTerms) {
      tempErrors.acceptTerms = 'You must accept the Terms and Conditions';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Simulate sending OTP delay
    setTimeout(() => {
      setSubmitting(false);
      // Navigate to OTP Verification page passing the registration data and flow context
      navigate('/otp-verification', {
        state: {
          flow: 'register',
          registrationData: {
            username: formData.fullName,
            email: formData.email,
            password: formData.password,
          },
        },
      });
    }, 1000);
  };

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
          Create an account
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', textAlign: 'center' }}>
          Join EventPortal to manage and attend premium events.
        </p>

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Full Name"
            id="register-fullname"
            name="fullName"
            type="text"
            placeholder="John Doe"
            icon={FiUser}
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
          />

          <AuthInput
            label="Email Address"
            id="register-email"
            name="email"
            type="email"
            placeholder="john@company.com"
            icon={FiMail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <AuthInput
            label="Password"
            id="register-password"
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
            label="Confirm Password"
            id="register-confirmpassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={FiLock}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          {/* Accept Terms & Conditions */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                style={{
                  marginTop: '3px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: '1.5px solid #D1D5DB',
                  cursor: 'pointer',
                  accentColor: '#F5C451',
                }}
              />
              <span style={{ lineHeight: '1.4' }}>
                I agree to the{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: '#2563EB', textDecoration: 'none', fontWeight: '600' }}>
                  Privacy Policy
                </a>.
              </span>
            </label>
            {errors.acceptTerms && (
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: '500', marginTop: '6px' }}>{errors.acceptTerms}</div>
            )}
          </div>

          <AuthButton type="submit" loading={submitting}>
            Create Account
          </AuthButton>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '24px', marginBottom: '0' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#F5C451',
              fontWeight: '600',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Sign In
          </Link>
        </p>
      </AuthCard>

      <AuthFooter />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </AuthLayout>
  );
}

export default Register;
