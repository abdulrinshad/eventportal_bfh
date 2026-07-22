import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import { FiShield, FiBell, FiEye, FiTrash2, FiSave } from 'react-icons/fi';
import './Profile.css';

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
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid var(--border-color-light)' }}>
      <span style={{ fontSize:14, color:'var(--text-primary)', fontWeight:500 }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width:44, height:24, borderRadius:12, border:'none', cursor:'pointer',
          background: checked ? 'var(--accent-yellow)' : 'var(--border-color)',
          position:'relative', transition:'background 0.2s',
        }}
      >
        <span style={{
          position:'absolute', top:2, left: checked ? 22 : 2,
          width:20, height:20, borderRadius:'50%', background:'#fff',
          transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );

  const Section = ({ icon, title, children }) => (
    <div style={{ background:'var(--bg-card)', borderRadius:'var(--border-radius-lg)', border:'1px solid var(--border-color-light)', padding:28, boxShadow:'var(--shadow-sm)', marginBottom:24 }}>
      <h3 style={{ fontFamily:'Outfit, sans-serif', fontSize:16, fontWeight:700, color:'var(--text-primary)', margin:'0 0 16px', display:'flex', alignItems:'center', gap:10, paddingBottom:12, borderBottom:'1px solid var(--border-color-light)' }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="dashboard-page-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <div className="profile-page">

          <div className="profile-header">
            <div>
              <h1 className="profile-page-title">Settings</h1>
              <p className="profile-page-subtitle">Manage your account preferences and privacy options.</p>
            </div>
            <button className="profile-edit-btn" onClick={handleSave}>
              <FiSave /> Save Changes
            </button>
          </div>

          {saved && (
            <div className="profile-save-toast">
              ✅ Settings saved successfully!
            </div>
          )}

          <Section icon={<FiBell size={16} />} title="Notification Preferences">
            <Toggle checked={emailNotifs}  onChange={setEmailNotifs}  label="Email Notifications" />
            <Toggle checked={pushNotifs}   onChange={setPushNotifs}   label="Push Notifications" />
          </Section>

          <Section icon={<FiEye size={16} />} title="Privacy Settings">
            <Toggle checked={profilePublic} onChange={setProfilePublic} label="Make profile public" />
          </Section>

          <Section icon={<FiShield size={16} />} title="Security">
            <Toggle checked={twoFactor} onChange={setTwoFactor} label="Two-factor authentication" />
            <div style={{ marginTop:20 }}>
              <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:12 }}>
                Want to update your password? Use the button below.
              </p>
              <button style={{ padding:'10px 20px', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-md)', background:'var(--bg-card)', color:'var(--text-primary)', fontWeight:600, fontSize:14, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-yellow)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                onClick={() => alert('Password reset email sent!')}
              >
                Change Password
              </button>
            </div>
          </Section>

          <Section icon={<FiTrash2 size={16} />} title="Danger Zone">
            <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.6 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              style={{ padding:'10px 20px', border:'1px solid var(--danger-color)', borderRadius:'var(--border-radius-md)', background:'var(--danger-bg-light)', color:'var(--danger-color)', fontWeight:600, fontSize:14, cursor:'pointer', transition:'all 0.15s' }}
              onClick={() => alert('Account deletion is disabled in demo mode.')}
            >
              Delete Account
            </button>
          </Section>

        </div>
        <DashboardFooter />
      </main>
    </div>
  );
}

export default Settings;
