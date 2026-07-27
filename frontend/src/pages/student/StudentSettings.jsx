import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import { PageContainer, PageHeader, ContentCard, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import { FiShield, FiBell, FiEye, FiSave, FiLock } from 'react-icons/fi';

export default function StudentSettings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [emailNotifs, setEmailNotifs]     = useState(true);
  const [pushNotifs, setPushNotifs]       = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);
  const [twoFactor, setTwoFactor]         = useState(false);
  const [saved, setSaved]                 = useState(false);

  // Change Password state
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPassword(true);
    setPasswordErrors({});
    setPasswordSuccess(false);

    try {
      await authService.changePassword(passwordForm);
      setPasswordSuccess(true);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const backendErrors = {};
      if (typeof err === 'object') {
        Object.keys(err).forEach((key) => {
          backendErrors[key] = Array.isArray(err[key]) ? err[key][0] : err[key];
        });
      }
      setPasswordErrors(backendErrors);
    } finally {
      setSubmittingPassword(false);
    }
  };

  const Toggle = ({ checked, onChange, label }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid #F1F5F9' }}>
      <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: '600' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '46px',
          height: '24px',
          borderRadius: '14px',
          border: 'none',
          cursor: 'pointer',
          background: checked ? '#F5C451' : '#E2E8F0',
          position: 'relative',
          transition: 'background 0.2s ease',
          padding: 0,
          outline: 'none',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '24px' : '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#FFFFFF',
          transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }} />
      </button>
    </div>
  );

  return (
    <StudentLayout activeItem="Settings">
      <PageContainer size="lg">
        <PageHeader
          title="Configurations"
          description="Manage student workspace security credentials, notification frequencies, and active sessions."
          action={
            <PrimaryButton onClick={handleSave}>
              <FiSave /> Save Changes
            </PrimaryButton>
          }
        />

        {saved && (
          <div style={{ background: '#DCFCE7', border: '1px solid #15803D', borderRadius: '12px', padding: '12px 16px', color: '#15803D', fontWeight: '600', marginBottom: '24px' }}>
            ✓ preferences updated successfully!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Notifications Card */}
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', fontFamily: 'var(--font-heading)' }}>
              <FiBell color="#F5C451" /> Notification Channels
            </h3>
            <Toggle checked={emailNotifs} onChange={setEmailNotifs} label="Receive daily digest summaries" />
            <Toggle checked={pushNotifs} onChange={setPushNotifs} label="Live desktop push notifications" />
          </ContentCard>

          {/* Privacy Card */}
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', fontFamily: 'var(--font-heading)' }}>
              <FiEye color="#F5C451" /> Visibility &amp; Listing Discovery
            </h3>
            <Toggle checked={profilePublic} onChange={setProfilePublic} label="Display profile on explore portal" />
          </ContentCard>

          {/* Security Card */}
          <ContentCard>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', fontFamily: 'var(--font-heading)' }}>
              <FiShield color="#F5C451" /> Security Keys &amp; Credentials
            </h3>
            <Toggle checked={twoFactor} onChange={setTwoFactor} label="Enforce 2FA verification code on authentication" />
            
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '14px', lineHeight: '1.5' }}>
                Reset account password and terminate all other active browser session tokens.
              </p>

              {passwordSuccess && (
                <div style={{ background: '#DCFCE7', border: '1px solid #15803D', borderRadius: '12px', padding: '12px 16px', color: '#15803D', fontWeight: '600', marginBottom: '16px', fontSize: '14px' }}>
                  ✓ Password changed successfully!
                </div>
              )}

              {!changingPassword ? (
                <SecondaryButton onClick={() => setChangingPassword(true)}>
                  <FiLock /> Change Account Password
                </SecondaryButton>
              ) : (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#F9FAFB', padding: '20px', borderRadius: '12px', border: '1.5px solid #E5E7EB' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', outline: 'none' }}
                    />
                    {passwordErrors.current_password && <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{passwordErrors.current_password}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', outline: 'none' }}
                    />
                    {passwordErrors.new_password && <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{passwordErrors.new_password}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1.5px solid #E5E7EB', borderRadius: '8px', outline: 'none' }}
                    />
                    {passwordErrors.confirm_password && <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>{passwordErrors.confirm_password}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <SecondaryButton type="button" onClick={() => { setChangingPassword(false); setPasswordErrors({}); }}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" loading={submittingPassword}>
                      Update Password
                    </PrimaryButton>
                  </div>
                </form>
              )}
            </div>
          </ContentCard>

          {/* Become an Organizer Settings Card */}
          {user?.role !== 'ORGANIZER' && (
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', fontFamily: 'var(--font-heading)' }}>
                📣 Organizer Account
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px', lineHeight: '1.5' }}>
                Host professional events, manage registrations, track analytics and more by requesting Organizer privileges.
              </p>
              {(!user?.organizerApplicationStatus || user.organizerApplicationStatus === 'Not Applied') && (
                <PrimaryButton onClick={() => navigate('/organizer/apply')} style={{ width: 'fit-content' }}>
                  Become an Organizer
                </PrimaryButton>
              )}
            </ContentCard>
          )}
        </div>
      </PageContainer>
    </StudentLayout>
  );
}
