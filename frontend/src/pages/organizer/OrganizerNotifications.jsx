import React, { useState } from 'react';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton, EmptyState } from '../../components/ui/DesignSystem';
import { FiBell, FiCalendar, FiUsers, FiCheck, FiTrash2, FiInfo } from 'react-icons/fi';

const mockNotifications = [
  {
    id: 1,
    type: 'event',
    group: 'Today',
    title: 'Global Tech Summit 2024 is LIVE',
    message: 'Your event has been approved by Admin and is now live. Share it with your audience!',
    time: '2 minutes ago',
    read: false,
    icon: <FiCalendar size={18} />,
  },
  {
    id: 2,
    type: 'registration',
    group: 'Today',
    title: '12 new participants registered',
    message: 'Global Tech Summit 2024 received 12 new sign-ups today.',
    time: '1 hour ago',
    read: false,
    icon: <FiUsers size={18} />,
  },
];

export default function OrganizerNotifications() {
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
    <OrganizerLayout activeItem="Notifications">
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
            description="No notifications yet. We'll let you know when registrations or updates happen."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {groups.map((groupName) => {
              const groupItems = notifications.filter((n) => n.group === groupName);
              if (groupItems.length === 0) return null;

              return (
                <div key={groupName}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
                    {groupName}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {groupItems.map((item) => (
                      <ContentCard
                        key={item.id}
                        style={{
                          padding: '16px 20px',
                          background: item.read ? '#FFFFFF' : '#FEFBF0',
                          border: item.read ? '1px solid #E5E7EB' : '1px solid rgba(245, 196, 81, 0.25)',
                          transition: 'all 0.25s',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: item.read ? '#F1F5F9' : '#FEF3C7',
                            color: item.read ? '#6B7280' : '#B45309',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {item.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>{item.title}</h4>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.time}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>{item.message}</p>
                          </div>

                          <button
                            onClick={() => deleteNotification(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '6px',
                            }}
                            title="Delete notification"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </ContentCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </OrganizerLayout>
  );
}
