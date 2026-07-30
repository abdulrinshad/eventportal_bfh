import React, { useState, useEffect } from 'react';
import StudentLayout from './StudentLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton, EmptyState } from '../../components/ui/DesignSystem';
import { FiBell, FiCalendar, FiCheck, FiTrash2, FiInfo } from 'react-icons/fi';
import {
  getStudentNotificationsApi,
  markStudentNotificationReadApi,
  markAllStudentNotificationsReadApi,
  deleteStudentNotificationApi,
} from '../../services/api';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'REMINDER':
      return <FiBell size={18} />;
    case 'REGISTRATION':
      return <FiCheck size={18} />;
    case 'EVENT_UPDATE':
    case 'WAITLIST':
      return <FiCalendar size={18} />;
    default:
      return <FiInfo size={18} />;
  }
};

const getRelativeTimeAndGroup = (dateString) => {
  if (!dateString) return { group: 'Earlier', timeStr: '' };
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  let group = 'Earlier';
  if (isToday) group = 'Today';
  else if (isYesterday) group = 'Yesterday';

  const secondsAgo = Math.floor((now - date) / 1000);
  let timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (secondsAgo < 60) {
    timeStr = 'Just now';
  } else if (secondsAgo < 3600) {
    const mins = Math.floor(secondsAgo / 60);
    timeStr = `${mins} min${mins > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 86400 && isToday) {
    const hours = Math.floor(secondsAgo / 3600);
    timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (isYesterday) {
    timeStr = 'Yesterday';
  } else {
    const days = Math.floor(secondsAgo / 86400);
    timeStr = `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return { group, timeStr };
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getStudentNotificationsApi();
      if (response && response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (Array.isArray(response)) {
        setNotifications(response);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to load student notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await markAllStudentNotificationsReadApi();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await markStudentNotificationReadApi(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteStudentNotificationApi(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const groups = ['Today', 'Yesterday', 'Earlier'];

  // Attach group and formatted time to items
  const processedNotifications = notifications.map((n) => {
    const { group, timeStr } = getRelativeTimeAndGroup(n.created_at);
    return {
      ...n,
      group,
      timeStr,
      read: n.is_read,
    };
  });

  return (
    <StudentLayout activeItem="Notifications">
      <PageContainer size="lg">
        <PageHeader
          title="Notification Center"
          description={
            loading
              ? 'Loading your notifications...'
              : unreadCount > 0
              ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''} requiring attention.`
              : 'All caught up! No unread notifications.'
          }
          action={
            !loading &&
            unreadCount > 0 && (
              <PrimaryButton onClick={markAllRead}>
                <FiCheck /> Mark all read
              </PrimaryButton>
            )
          }
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
            Loading notifications...
          </div>
        ) : processedNotifications.length === 0 ? (
          <EmptyState
            title="No notifications available."
            description="No notifications yet. We'll let you know when something important happens."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {groups.map((groupName) => {
              const groupItems = processedNotifications.filter((n) => n.group === groupName);
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
                        onClick={() => handleMarkAsRead(item.id, item.read)}
                        style={{
                          padding: '16px 20px',
                          background: item.read ? '#FFFFFF' : '#FEFBF0',
                          border: item.read ? '1px solid #E5E7EB' : '1px solid rgba(245, 196, 81, 0.25)',
                          transition: 'all 0.25s',
                          cursor: item.read ? 'default' : 'pointer',
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
                            {getNotificationIcon(item.type)}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>{item.title}</h4>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.timeStr}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>{item.message}</p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(item.id);
                            }}
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
    </StudentLayout>
  );
}
