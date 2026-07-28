import React, { useState, useEffect, useRef } from 'react';
import OrganizerLayout from './OrganizerLayout';
import {
  PageContainer,
  PageHeader,
  ContentCard,
  PrimaryButton,
  SecondaryButton,
} from '../../components/ui/DesignSystem';
import { FiEdit2, FiMail, FiCamera, FiLoader, FiAlertCircle, FiCalendar, FiUsers } from 'react-icons/fi';
import { getOrganizerProfileApi, updateOrganizerProfileApi } from '../../services/api';

// ── helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Shows the profile photo if a URL exists,
 * otherwise renders a coloured initials circle.
 */
function ProfileAvatar({ src, name, size = 110 }) {
  const initials = (name || 'O')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    );
  }

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #F5C451 0%, #E67E22 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.floor(size * 0.36)}px`,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: '0.04em',
      fontFamily: 'var(--font-heading)',
      userSelect: 'none',
    }}>
      {initials || 'O'}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OrganizerProfile() {
  // ── data state ───────────────────────────────────────────────────────────
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── edit state ───────────────────────────────────────────────────────────
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved]         = useState(false);

  // ── form fields ──────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState('');
  const [biography, setBiography]     = useState('');
  const [photoFile, setPhotoFile]     = useState(null);      // File object
  const [photoPreview, setPhotoPreview] = useState(null);    // local blob URL

  const fileInputRef = useRef(null);

  // ── fetch profile on mount ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getOrganizerProfileApi();
        const data = res?.data ?? null;
        setProfile(data);
        // Seed edit form from loaded profile
        if (data) {
          setDisplayName(data.display_name || '');
          setBiography(data.biography || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setFetchError('Failed to load profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── photo file selection ─────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert('Please select a JPEG, PNG, or WebP image.');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── start editing ────────────────────────────────────────────────────────
  const handleEdit = () => {
    setDisplayName(profile?.display_name || '');
    setBiography(profile?.biography || '');
    setPhotoFile(null);
    setPhotoPreview(null);
    setSaveError(null);
    setEditing(true);
  };

  // ── cancel editing ───────────────────────────────────────────────────────
  const handleCancel = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setSaveError(null);
    setEditing(false);
  };

  // ── save changes ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.append('display_name', displayName.trim());
      formData.append('biography', biography.trim());
      if (photoFile) {
        formData.append('profile_image', photoFile);
      }

      const res = await updateOrganizerProfileApi(formData);
      const updated = res?.data ?? null;
      if (updated) {
        setProfile(updated);
        setDisplayName(updated.display_name || '');
        setBiography(updated.biography || '');
      }

      // Revoke old blob preview URL to free memory
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
      setPhotoFile(null);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
      const detail = err?.response?.data?.detail
        || err?.response?.data?.display_name?.[0]
        || err?.response?.data?.biography?.[0]
        || 'Failed to save profile. Please try again.';
      setSaveError(detail);
    } finally {
      setSaving(false);
    }
  };

  // ── derived display values ───────────────────────────────────────────────
  const displayedName = profile?.display_name
    || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
    || profile?.email
    || 'Organizer';

  const currentPhotoUrl = photoPreview || profile?.profile_image_url || null;

  // ── render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <OrganizerLayout activeItem="Profile">
        <PageContainer>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', gap: '12px', color: '#94A3B8', fontSize: '15px' }}>
            <FiLoader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Loading profile…
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        </PageContainer>
      </OrganizerLayout>
    );
  }

  if (fetchError) {
    return (
      <OrganizerLayout activeItem="Profile">
        <PageContainer>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '16px 20px', color: '#991B1B', fontSize: '14px', fontWeight: '600' }}>
            <FiAlertCircle /> {fetchError}
          </div>
        </PageContainer>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout activeItem="Profile">
      <PageContainer size="xl">
        <PageHeader
          title="Profile"
          description="Manage your organizer profile and public information."
          action={
            !editing ? (
              <PrimaryButton onClick={handleEdit}>
                <FiEdit2 /> Edit Profile
              </PrimaryButton>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <SecondaryButton onClick={handleCancel} disabled={saving}>Cancel</SecondaryButton>
                <PrimaryButton onClick={handleSave} loading={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </PrimaryButton>
              </div>
            )
          }
        />

        {/* Success banner */}
        {saved && (
          <div style={{ background: '#DCFCE7', border: '1px solid #15803D', borderRadius: '12px', padding: '12px 16px', color: '#15803D', fontWeight: '600', marginBottom: '24px', fontSize: '14px' }}>
            ✓ Profile updated successfully!
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '12px 16px', color: '#991B1B', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
            <FiAlertCircle /> {saveError}
          </div>
        )}

        {/* ── Profile Header Card ── */}
        <ContentCard style={{ padding: '0px', overflow: 'hidden', marginBottom: '28px' }}>
          {/* Cover strip */}
          <div style={{
            height: '160px',
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #111827 100%)',
          }} />

          {/* Profile block */}
          <div style={{ padding: '24px 32px', position: 'relative' }}>
            {/* Avatar — overlapping the cover */}
            <div style={{ position: 'absolute', top: '-56px', left: '32px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ border: '4px solid #FFFFFF', borderRadius: '50%', overflow: 'hidden', background: '#F1F5F9' }}>
                  <ProfileAvatar
                    src={currentPhotoUrl}
                    name={displayedName}
                    size={110}
                  />
                </div>

                {/* Camera button overlay — only in edit mode */}
                {editing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#F5C451',
                        border: '2px solid #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                      title="Upload profile photo"
                      aria-label="Upload profile photo"
                    >
                      <FiCamera size={14} color="#111827" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                      onChange={handlePhotoChange}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Name / email / stats row */}
            <div style={{ marginLeft: '140px', minHeight: '60px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                    {displayedName}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280' }}>
                    <FiMail size={13} />
                    <span>{profile?.email || '—'}</span>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '28px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <FiCalendar size={14} color="#94A3B8" />
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                        {profile?.total_events_hosted ?? '—'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Events Hosted
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <FiUsers size={14} color="#94A3B8" />
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                        {profile?.total_registrations ?? '—'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Registrations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* ── Bio Card ── */}
        <ContentCard>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
            About Me
          </h3>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={150}
                  placeholder="Your public display name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Biography */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Biography
                </label>
                <textarea
                  rows={5}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Tell attendees about yourself…"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    resize: 'vertical',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Photo upload hint */}
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                To change your profile photo, click the camera icon on the avatar above.
                Accepted formats: JPG, PNG, WebP.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', margin: 0 }}>
              {profile?.biography?.trim()
                ? profile.biography
                : <em style={{ color: '#94A3B8' }}>No bio added yet.</em>
              }
            </p>
          )}
        </ContentCard>

      </PageContainer>

      <style>{`
        @media (max-width: 600px) {
          .profile-header-inner {
            flex-direction: column !important;
          }
        }
      `}</style>
    </OrganizerLayout>
  );
}
