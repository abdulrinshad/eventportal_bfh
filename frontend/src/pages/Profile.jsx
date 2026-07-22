import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar/Sidebar';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import {
  FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiCamera
} from 'react-icons/fi';
import './Profile.css';

function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
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
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div className="dashboard-page-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <div className="profile-page">

          {/* Header */}
          <div className="profile-header">
            <div>
              <h1 className="profile-page-title">Profile</h1>
              <p className="profile-page-subtitle">Manage your personal information and preferences.</p>
            </div>
            {!editing && (
              <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            )}
          </div>

          {saved && (
            <div className="profile-save-toast">
              ✅ Profile updated successfully!
            </div>
          )}

          <div className="profile-content-grid">
            {/* Avatar card */}
            <div className="profile-avatar-card">
              <div className="profile-avatar-wrapper">
                <img
                  src={form.avatar || user.avatar}
                  alt={user.username}
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                {editing && (
                  <button className="profile-avatar-change-btn" title="Change avatar URL below">
                    <FiCamera size={16} />
                  </button>
                )}
              </div>
              <h2 className="profile-name">{user.username}</h2>
              <p className="profile-email">{user.email}</p>
              <div className="profile-joined">
                <FiCalendar size={14} />
                <span>Joined {user.joinedDate || 'Recently'}</span>
              </div>
            </div>

            {/* Info card */}
            <div className="profile-info-card">
              <h3 className="profile-section-title">Account Information</h3>

              <div className="profile-field">
                <label className="profile-label">
                  <FiUser size={14} /> Full Name
                </label>
                {editing ? (
                  <input
                    className="profile-input"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                ) : (
                  <span className="profile-value">{user.username}</span>
                )}
              </div>

              <div className="profile-field">
                <label className="profile-label">
                  <FiMail size={14} /> Email Address
                </label>
                <span className="profile-value profile-value-muted">{user.email}</span>
              </div>

              <div className="profile-field">
                <label className="profile-label">Bio</label>
                {editing ? (
                  <textarea
                    className="profile-input profile-textarea"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <span className="profile-value">{user.bio || 'No bio added yet.'}</span>
                )}
              </div>

              {editing && (
                <div className="profile-field">
                  <label className="profile-label">
                    <FiCamera size={14} /> Avatar URL
                  </label>
                  <input
                    className="profile-input"
                    name="avatar"
                    value={form.avatar}
                    onChange={handleChange}
                    placeholder="Paste image URL..."
                  />
                </div>
              )}

              {editing && (
                <div className="profile-actions">
                  <button
                    className="profile-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <FiSave size={15} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="profile-cancel-btn" onClick={handleCancel}>
                    <FiX size={15} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Stats card */}
            <div className="profile-stats-card">
              <h3 className="profile-section-title">Activity Summary</h3>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Events Registered</span>
                <span className="profile-stat-value">3</span>
              </div>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Events Created</span>
                <span className="profile-stat-value">3</span>
              </div>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Total Participants</span>
                <span className="profile-stat-value">2,270</span>
              </div>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Account Status</span>
                <span className="profile-stat-badge">Active</span>
              </div>
            </div>
          </div>
        </div>

        <DashboardFooter />
      </main>
    </div>
  );
}

export default Profile;
