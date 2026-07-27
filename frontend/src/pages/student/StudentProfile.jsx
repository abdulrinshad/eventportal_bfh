import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import StudentLayout from './StudentLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton, SecondaryButton, UserAvatar } from '../../components/ui/DesignSystem';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiMapPin, FiAward, FiPhone } from 'react-icons/fi';

export default function StudentProfile() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    profile_image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(user?.profile_image || '');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        profile_image: null,
      });
      setPreviewUrl(user.profile_image || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profile_image: file });
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let payload;
      if (form.profile_image) {
        payload = new FormData();
        payload.append('first_name', form.first_name);
        payload.append('last_name', form.last_name);
        payload.append('phone_number', form.phone_number);
        payload.append('profile_image', form.profile_image);
      } else {
        payload = {
          first_name: form.first_name,
          last_name: form.last_name,
          phone_number: form.phone_number,
        };
      }

      await authService.updateProfile(payload);
      await refreshUser();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      profile_image: null,
    });
    setPreviewUrl(user?.profile_image || '');
    setEditing(false);
    setError('');
  };

  if (!user) return null;

  const displayName = `${user.first_name} ${user.last_name}`.trim() || 'Jane Student';

  return (
    <StudentLayout activeItem="Profile">
      <PageContainer size="xl">
        <PageHeader
          title="Profile"
          description="Manage your student presence and educational bio."
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

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: '12px', padding: '12px 16px', color: '#EF4444', fontWeight: '600', marginBottom: '24px' }}>
            {error}
          </div>
        )}

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
              <UserAvatar src={previewUrl} name={displayName} size={110} />
            </div>

            <div style={{ marginLeft: '130px', minHeight: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                    {displayName}
                  </h2>
                  <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 8px 0', fontWeight: '500' }}>
                    Student &amp; Tech Enthusiast
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#94A3B8' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiMapPin /> Stanford, CA
                    </span>
                    <span>&bull;</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiMail /> {user.email}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>Student</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>ROLE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Content body split layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }} className="profile-grid-layout">
          {/* Left Panel: Profile Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <ContentCard>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
                Personal Information
              </h3>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#475569' }}>
                    <FiUser /> <strong>Name:</strong> {displayName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#475569' }}>
                    <FiMail /> <strong>Email:</strong> {user.email} (Verified: {user.is_email_verified ? 'Yes' : 'No'})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#475569' }}>
                    <FiPhone /> <strong>Phone:</strong> {user.phone_number || 'Not provided'}
                  </div>
                </div>
              )}
            </ContentCard>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                Account Meta
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <FiAward color="#F5C451" />
                  <span>Role: {user.role}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <FiCalendar color="#F5C451" />
                  <span>Organizer Status: {user.organizer_status}</span>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </PageContainer>
    </StudentLayout>
  );
}
