import React, { useState } from 'react';
import { AppLayout, PageContainer, PageHeader, ContentCard, PrimaryButton, EmptyState } from '../components/ui/DesignSystem';
import { FiBell, FiCalendar, FiUsers, FiCheck, FiTrash2, FiInfo } from 'react-icons/fi';

const mockNotifications = [
  {
    id: 1,
    type: 'event',
    group: 'Today',
    title: 'Global Tech Summit 2026 is LIVE',
    message: 'Your event just went live. Share it with your audience!',
    time: '2 minutes ago',
    read: false,
    icon: <FiCalendar size={18} />,
  },
  {
    id: 2,
    type: 'registration',
    group: 'Today',
    title: '12 new participants registered',
    message: 'AI & Deep Learning Workshop received 12 new sign-ups today.',
    time: '1 hour ago',
    read: false,
    icon: <FiUsers size={18} />,
  },
  {
    id: 3,
    type: 'reminder',
    group: 'Today',
    title: 'Event reminder: UI/UX Masterclass',
    message: 'Your registered event starts in 3 days. Download your ticket!',
    time: '3 hours ago',
    read: true,
    icon: <FiBell size={18} />,
  },
  {
    id: 4,
    type: 'event',
    group: 'Yesterday',
    title: 'Registration confirmed',
    message: 'You are registered for Annual Creators & Design Awards 2026.',
    time: 'Yesterday',
    read: true,
    icon: <FiCheck size={18} />,
  },
  {
    id: 5,
    type: 'info',
    group: 'Earlier',
    title: 'Custom domain linked',
    message: 'Your domain summit.compilvision.com points successfully to this system.',
    time: '3 days ago',
    read: true,
    icon: <FiInfo size={18} />,
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

  const groups = ['Today', 'Yesterday', 'Earlier'];

  return (
    <AppLayout activeItem="Notifications">
      <PageContainer size="lg">
        <PageHeader
          title="Notification Center"
          description={
            unreadCount > 0
              ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''} requiring attention.`
              : 'All caught up! No unread notifications.'
          }
          action={
            unreadCount > 0 && (
              <PrimaryButton onClick={markAllRead}>
                <FiCheck /> Mark all read
              </PrimaryButton>
            )
          }
        />

        {notifications.length === 0 ? (
          <EmptyState
            title="All clear"
            description="No notifications yet. We'll let you know when something important happens."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {groups.map((groupName) => {
              const groupItems = notifications.filter((n) => n.group === groupName);
              if (groupItems.length === 0) return null;

              return (
                <div key={groupName}>
                  {/* Group Header */}
                  <h3
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#94A3B8',
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      marginBottom: '16px',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {groupName}
                  </h3>

                  {/* Group items container */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {groupItems.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px',
                          background: n.read ? '#FFFFFF' : '#FFFDF5',
                          border: `1px solid ${n.read ? '#E5E7EB' : 'rgba(245, 196, 81, 0.35)'}`,
                          borderRadius: '16px',
                          padding: '18px 20px',
                          transition: 'all 0.2s',
                          boxShadow: 'var(--shadow-soft)',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: n.read ? '#F1F5F9' : '#FEFBF0',
                            color: n.read ? '#6B7280' : '#F5C451',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: n.read ? 'none' : '1.5px solid rgba(245, 196, 81, 0.25)',
                          }}
                        >
                          {n.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
                              {n.title}
                              {!n.read && (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: '7px',
                                    height: '7px',
                                    background: '#F5C451',
                                    borderRadius: '50%',
                                    marginLeft: '8px',
                                    verticalAlign: 'middle',
                                  }}
                                />
                              )}
                            </h4>
                            <span style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{n.time}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                            {n.message}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotification(n.id)}
                          title="Dismiss"
                          style={{
                            color: '#94A3B8',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '6px',
                            transition: 'color 0.15s',
                            display: 'flex',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </AppLayout>
  );
}

export default Notifications;
