import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppLayout, PageContainer, PageHeader, ContentCard, PrimaryButton, SecondaryButton, UserAvatar } from '../components/ui/DesignSystem';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiCamera, FiMapPin, FiAward, FiEye } from 'react-icons/fi';

function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || 'Alex Rivera',
    bio: user?.bio || 'Senior Event Coordinator & Technical Lead specializing in coordinating high-stakes tech summits, developer keynotes, and global hackathons.',
    avatar: user?.avatar || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      username: user?.username || 'Alex Rivera',
      bio: user?.bio || 'Senior Event Coordinator & Technical Lead specializing in coordinating high-stakes tech summits, developer keynotes, and global hackathons.',
      avatar: user?.avatar || '',
    });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <AppLayout activeItem="Profile">
      <PageContainer size="xl">
        <PageHeader
          title="Profile"
          description="Manage your professional presence and coordination bio."
          action={
            !editing ? (
              <PrimaryButton onClick={() => setEditing(true)}>
                <FiEdit2 /> Edit Profile
              </PrimaryButton>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
                <PrimaryButton onClick={handleSave} loading={saving}>
                  Save Changes
                </PrimaryButton>
              </div>
            )
          }
        />

        {saved && (
          <div style={{ background: '#DCFCE7', border: '1px solid #15803D', borderRadius: '12px', padding: '12px 16px', color: '#15803D', fontWeight: '600', marginBottom: '24px' }}>
            ✓ Profile updated successfully!
          </div>
        )}

        {/* LinkedIn style profile banner card */}
        <ContentCard style={{ padding: '0px', overflow: 'hidden', marginBottom: '28px' }}>
          {/* Cover Photo */}
          <div
            style={{
              height: '180px',
              backgroundImage: "url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          />

          {/* Profile Header Block */}
          <div style={{ padding: '24px 32px', position: 'relative' }}>
            
            {/* Overlapping Avatar */}
            <div style={{ position: 'absolute', top: '-60px', left: '32px', border: '4px solid #FFFFFF', borderRadius: '50%', overflow: 'hidden', background: '#FFFFFF' }}>
              <UserAvatar src={form.avatar || user.avatar} name={form.username} size={110} />
            </div>

            <div style={{ marginLeft: '130px', minHeight: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                    {form.username}
                  </h2>
                  <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 8px 0', fontWeight: '500' }}>
                    Senior Product Manager &amp; Event Lead
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#94A3B8' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiMapPin /> San Francisco, CA
                    </span>
                    <span>&bull;</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiMail /> {user.email}
                    </span>
                  </div>
                </div>

                {/* Micro Stats Columns */}
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>1,240</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>CONNECTIONS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>410</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>PASSES ISSUED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Content body split layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }} className="profile-grid-layout">
          
          {/* Left Panel: Bio + Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Bio Card */}
            <ContentCard>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
                About
              </h3>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Display Name</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Professional Biography</label>
                    <textarea
                      name="bio"
                      rows={5}
                      value={form.bio}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', resize: 'none' }}
                    />
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  {form.bio}
                </p>
              )}
            </ContentCard>

            {/* Recent Creations & Achievements */}
            <ContentCard>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                Experience &amp; Track Record
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    🏆
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Chief Coordinator, Future Visionary Summit 2024</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Organized for 1,200 attendees &bull; October 2024</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    ⚡
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Speaker Coordinator, Global Tech Summit 2023</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Coordinated 32 keynote tracks &bull; September 2023</div>
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>

          {/* Right Panel: Sidebar Badges & Accomplishments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                Accomplishments
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <FiAward color="#F5C451" />
                  <span>Stripe Payout Certified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <FiCalendar color="#F5C451" />
                  <span>Elite Planner 2024</span>
                </div>
              </div>
            </ContentCard>
          </div>

        </div>
      </PageContainer>

      <style>{`
        @media (max-width: 900px) {
          .profile-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default Profile;
