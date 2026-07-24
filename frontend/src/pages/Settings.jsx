import React, { useState } from 'react';
import { AppLayout, PageContainer, PageHeader, ContentCard, PrimaryButton, SecondaryButton } from '../components/ui/DesignSystem';
import { FiShield, FiBell, FiEye, FiTrash2, FiSave, FiLock } from 'react-icons/fi';

function Settings() {
  const [emailNotifs, setEmailNotifs]     = useState(true);
  const [pushNotifs, setPushNotifs]       = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);
  const [twoFactor, setTwoFactor]         = useState(false);
  const [saved, setSaved]                 = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
    <AppLayout activeItem="Settings">
      <PageContainer size="lg">
        <PageHeader
          title="Configurations"
          description="Manage workspace security credentials, notification frequencies, and active sessions."
          action={
            <PrimaryButton onClick={handleSave}>
              <FiSave /> Save Changes
            </PrimaryButton>
          }
        />

        {saved && (
          <div style={{ background: '#DCFCE7', border: '1px solid #15803D', borderRadius: '12px', padding: '12px 16px', color: '#15803D', fontWeight: '600', marginBottom: '24px' }}>
            ✓ Account preferences updated successfully!
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
            <Toggle checked={profilePublic} onChange={setProfilePublic} label="Display professional profile on explore portal" />
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
              <SecondaryButton onClick={() => alert('Password reset verification sent!')}>
                <FiLock /> Change Account Password
              </SecondaryButton>
            </div>
          </ContentCard>

          {/* Danger Card */}
          <ContentCard style={{ border: '1px solid #FEE2E2', background: '#FFFDFD' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#EF4444', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #FEE2E2', fontFamily: 'var(--font-heading)' }}>
              <FiTrash2 /> Danger Zone
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', lineHeight: '1.6' }}>
              Permanently delete all workspace analytics, attendee files, and ticketing records. This action cannot be reverted.
            </p>
            <button
              onClick={() => alert('Account deletion is disabled in demo mode.')}
              style={{
                padding: '10px 20px',
                border: '1.5px solid #FEE2E2',
                borderRadius: '12px',
                background: '#FEF2F2',
                color: '#EF4444',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FDE8E8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
            >
              Delete Account
            </button>
          </ContentCard>
        </div>
      </PageContainer>
    </AppLayout>
  );
}

export default Settings;
