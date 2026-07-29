import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StudentLayout from './StudentLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton, SecondaryButton, UserAvatar } from '../../components/ui/DesignSystem';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiCheck, FiAward, FiPhone, FiInfo } from 'react-icons/fi';
import { getStudentProfileApi, updateStudentProfileApi } from '../../services/api';

export default function StudentProfile() {
  const { user, refreshUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: '',
    profile_image: null,
    cover_image: null,
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getStudentProfileApi();
      if (res && res.success && res.data) {
        const data = res.data;
        setProfile(data);
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone || data.phone_number || '',
          bio: data.bio || '',
          profile_image: null,
          cover_image: null,
        });
        setAvatarPreview(data.profile_image || '');
        setCoverPreview(data.cover_image || '');
      }
    } catch (err) {
      console.error('Failed to fetch student profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setFieldErrors({});
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profile_image: file });
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
      setFieldErrors({});
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, cover_image: file });
      setCoverPreview(URL.createObjectURL(file));
      setError('');
      setFieldErrors({});
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append('first_name', form.first_name);
      formData.append('last_name', form.last_name);
      formData.append('phone_number', form.phone_number);
      formData.append('bio', form.bio);

      if (form.profile_image) {
        formData.append('profile_image', form.profile_image);
      }
      if (form.cover_image) {
        formData.append('cover_image', form.cover_image);
      }

      const res = await updateStudentProfileApi(formData);
      if (res && res.success && res.data) {
        setProfile(res.data);
        setAvatarPreview(res.data.profile_image || '');
        setCoverPreview(res.data.cover_image || '');
        if (refreshUser) await refreshUser();
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2500);
      } else if (res && res.errors) {
        setFieldErrors(res.errors);
        setError(res.message || 'Validation Failed');
      }
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes && errRes.errors) {
        setFieldErrors(errRes.errors);
        setError(errRes.message || 'Validation Failed');
      } else {
        setError(err.message || 'Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone || profile.phone_number || '',
        bio: profile.bio || '',
        profile_image: null,
        cover_image: null,
      });
      setAvatarPreview(profile.profile_image || '');
      setCoverPreview(profile.cover_image || '');
    }
    setEditing(false);
    setError('');
    setFieldErrors({});
  };

  if (loading) {
    return (
      <StudentLayout activeItem="Profile">
        <PageContainer size="xl">
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            Loading profile...
          </div>
        </PageContainer>
      </StudentLayout>
    );
  }

  const displayName = profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.strip() || user?.email || 'Student';

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
              backgroundImage: coverPreview ? `url('${coverPreview}')` : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          />

          {/* Profile Header Block */}
          <div style={{ padding: '24px 32px', position: 'relative' }}>
            {/* Overlapping Avatar */}
            <div style={{ position: 'absolute', top: '-60px', left: '32px', border: '4px solid #FFFFFF', borderRadius: '50%', overflow: 'hidden', background: '#FFFFFF' }}>
              <UserAvatar src={avatarPreview} name={displayName} size={110} />
            </div>

            <div style={{ marginLeft: '130px', minHeight: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                    {displayName}
                  </h2>
                  {profile?.bio && (
                    <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0', fontWeight: '500', lineHeight: '1.4' }}>
                      {profile.bio}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#94A3B8' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiMail /> {profile?.email}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>{profile?.role || 'STUDENT'}</div>
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
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
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
                        style={{ width: '100%', padding: '12px', border: fieldErrors.first_name ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      />
                      {fieldErrors.first_name && (
                        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                          {Array.isArray(fieldErrors.first_name) ? fieldErrors.first_name.join(' ') : fieldErrors.first_name}
                        </span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '12px', border: fieldErrors.last_name ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      />
                      {fieldErrors.last_name && (
                        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                          {Array.isArray(fieldErrors.last_name) ? fieldErrors.last_name.join(' ') : fieldErrors.last_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      placeholder="e.g. +1 9876543210"
                      style={{ width: '100%', padding: '12px', border: fieldErrors.phone_number ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                    />
                    {fieldErrors.phone_number && (
                      <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                        {Array.isArray(fieldErrors.phone_number) ? fieldErrors.phone_number.join(' ') : fieldErrors.phone_number}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Bio</label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell us a bit about yourself..."
                      style={{ width: '100%', padding: '12px', border: fieldErrors.bio ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Profile Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ width: '100%', padding: '8px 12px', border: fieldErrors.profile_image ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      />
                      {fieldErrors.profile_image && (
                        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                          {Array.isArray(fieldErrors.profile_image) ? fieldErrors.profile_image.join(' ') : fieldErrors.profile_image}
                        </span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Cover Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        style={{ width: '100%', padding: '8px 12px', border: fieldErrors.cover_image ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB', borderRadius: '12px', outline: 'none' }}
                      />
                      {fieldErrors.cover_image && (
                        <span style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', display: 'block' }}>
                          {Array.isArray(fieldErrors.cover_image) ? fieldErrors.cover_image.join(' ') : fieldErrors.cover_image}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#475569' }}>
                    <FiUser /> <strong>Name:</strong> {displayName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#475569' }}>
                    <FiMail /> <strong>Email:</strong> {profile?.email} (Verified: {profile?.email_verified ? 'Yes' : 'No'})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#475569' }}>
                    <FiPhone /> <strong>Phone:</strong> {profile?.phone || profile?.phone_number || 'Not provided'}
                  </div>
                  {profile?.bio && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#475569', marginTop: '4px' }}>
                      <FiInfo style={{ marginTop: '4px', flexShrink: 0 }} /> <strong>Bio:</strong> {profile.bio}
                    </div>
                  )}
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
                  <span>Role: {profile?.role || 'STUDENT'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <FiCalendar color="#F5C451" />
                  <span>Joined: {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <FiCheck color="#10B981" />
                  <span>Status: {profile?.account_status || 'ACTIVE'}</span>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </PageContainer>
    </StudentLayout>
  );
}
