import React, { useState, useEffect, useCallback } from 'react';
import OrganizerLayout from './OrganizerLayout';
import {
  PageContainer,
  PageHeader,
  ContentCard,
  PrimaryButton,
  EmptyState,
} from '../../components/ui/DesignSystem';
import { FiBell, FiCalendar, FiUsers, FiCheck, FiTrash2, FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
} from '../../services/api';

// ── Time-ago helper ──────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now   = new Date();
  const past  = new Date(dateStr);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60)  return 'just now';
  if (diffMin < 60)  return `${diffMin} min ago`;
  if (diffHr  < 24)  return `${diffHr} hr ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7)   return `${diffDay} days ago`;
  return past.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Group by day ─────────────────────────────────────────────────────────────

function dayGroup(dateStr) {
  if (!dateStr) return 'Earlier';
  const now   = new Date();
  const past  = new Date(dateStr);
  const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  if (past >= todayStart)     return 'Today';
  if (past >= yesterdayStart) return 'Yesterday';
  return 'Earlier';
}

// ── Icon per notification type ────────────────────────────────────────────────

function NotifIcon({ type, isRead }) {
  const iconMap = {
    EVENT_SUBMITTED:        <FiCalendar size={18} />,
    EVENT_APPROVED:         <FiCheck    size={18} />,
    EVENT_REJECTED:         <FiX        size={18} />,
    NEW_REGISTRATION:       <FiUsers    size={18} />,
    REGISTRATION_CANCELLED: <FiAlertCircle size={18} />,
    GENERAL:                <FiBell    size={18} />,
  };
  return (
    <div style={{
      width: '38px',
      height: '38px',
      borderRadius: '10px',
      background: isRead ? '#F1F5F9' : '#FEF3C7',
      color:      isRead ? '#6B7280' : '#B45309',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {iconMap[type] || <FiBell size={18} />}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OrganizerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [markingRead, setMarkingRead]     = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotificationsApi();
      // Response: { success, count, data: [...] }
      const data = res?.data ?? [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Mark all read ────────────────────────────────────────────────────────
  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setMarkingRead(false);
    }
  };

  // ── Delete single notification ───────────────────────────────────────────
  const deleteNotification = async (id) => {
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const groups      = ['Today', 'Yesterday', 'Earlier'];

  return (
    <OrganizerLayout activeItem="Notifications">
      <PageContainer size="lg">
        <PageHeader
          title="Notification Center"
          description={
            loading
              ? 'Loading notifications…'
              : unreadCount > 0
              ? `You have ${unreadCount} unread update${unreadCount > 1 ? 's' : ''} requiring attention.`
              : 'All caught up! No unread notifications.'
          }
          action={
            !loading && unreadCount > 0 && (
              <PrimaryButton onClick={markAllRead} disabled={markingRead}>
                <FiCheck /> {markingRead ? 'Marking…' : 'Mark all read'}
              </PrimaryButton>
            )
          }
        />

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#991B1B', fontSize: '14px', fontWeight: '600' }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', gap: '12px', color: '#94A3B8', fontSize: '15px' }}>
            <FiLoader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Loading notifications…
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="All clear"
            description="No notifications yet. We'll let you know when registrations or event updates happen."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {groups.map((groupName) => {
              const groupItems = notifications.filter(
                (n) => dayGroup(n.created_at) === groupName
              );
              if (groupItems.length === 0) return null;

              return (
                <div key={groupName}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    {groupName}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {groupItems.map((item) => (
                      <ContentCard
                        key={item.id}
                        style={{
                          padding: '16px 20px',
                          background: item.is_read ? '#FFFFFF' : '#FEFBF0',
                          border: item.is_read
                            ? '1px solid #E5E7EB'
                            : '1px solid rgba(245, 196, 81, 0.25)',
                          transition: 'all 0.25s',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <NotifIcon type={item.notification_type} isRead={item.is_read} />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>
                                {item.title}
                              </h4>
                              <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                                {timeAgo(item.created_at)}
                              </span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                              {item.message}
                            </p>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => deleteNotification(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '6px',
                              flexShrink: 0,
                            }}
                            title="Delete notification"
                            aria-label="Delete notification"
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
