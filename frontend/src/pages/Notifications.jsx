import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import { FiBell, FiCalendar, FiUsers, FiCheck, FiTrash2 } from 'react-icons/fi';
import './Profile.css';

const mockNotifications = [
  {
    id: 1,
    type: 'event',
    title: 'Global Tech Summit 2026 is LIVE',
    message: 'Your event just went live. Share it with your audience!',
    time: '2 minutes ago',
    read: false,
    icon: <FiCalendar size={18} />,
  },
  {
    id: 2,
    type: 'registration',
    title: '12 new participants registered',
    message: 'AI & Deep Learning Workshop received 12 new sign-ups today.',
    time: '1 hour ago',
    read: false,
    icon: <FiUsers size={18} />,
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Event reminder: UI/UX Masterclass',
    message: 'Your registered event starts in 3 days. Download your ticket!',
    time: '3 hours ago',
    read: true,
    icon: <FiBell size={18} />,
  },
  {
    id: 4,
    type: 'event',
    title: 'Registration confirmed',
    message: 'You are registered for Annual Creators & Design Awards 2026.',
    time: 'Yesterday',
    read: true,
    icon: <FiCalendar size={18} />,
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="dashboard-page-layout">
      <Sidebar />
      <main className="dashboard-main-content">
        <div className="profile-page">

          <div className="profile-header">
            <div>
              <h1 className="profile-page-title">Notifications</h1>
              <p className="profile-page-subtitle">
                {unreadCount > 0
                  ? ('You have ' + unreadCount + ' unread notification' + (unreadCount > 1 ? 's' : '') + '.')
                  : 'All caught up! No new notifications.'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="profile-edit-btn" onClick={markAllRead}>
                <FiCheck /> Mark all read
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px', background: 'var(--bg-card)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--border-color)' }}>
                <FiBell size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    background: n.read ? 'var(--bg-card)' : 'rgba(245,196,81,0.07)',

                    borderRadius: 'var(--border-radius-md)',
                    padding: '18px 20px',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: n.read ? 'var(--border-color-light)' : 'var(--accent-yellow-light)',
                    color: n.read ? 'var(--text-muted)' : 'var(--accent-yellow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {n.title}
                        {!n.read && <span style={{ display: 'inline-block', width: 7, height: 7, background: 'var(--accent-yellow)', borderRadius: '50%', marginLeft: 8, verticalAlign: 'middle' }} />}
                      </h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>{n.message}</p>
                  </div>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    title="Dismiss"
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <DashboardFooter />
      </main>
    </div>
  );
}

export default Notifications;
