import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard } from '../../components/ui/DesignSystem';
import { getPendingEventsApi } from '../../services/api';
import { FiClock, FiCalendar, FiAlertCircle } from 'react-icons/fi';

export default function PendingEvents() {
  const navigate = useNavigate();

  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        // getPendingEventsApi already unwraps { success, data: [...] } → array
        const list = await getPendingEventsApi();
        setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('[PendingEvents] fetch error:', err);
        setError('Unable to load pending events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <OrganizerLayout activeItem="Pending Approval">
        <PageContainer size="xl">
          <PageHeader
            title="Pending Approvals"
            description="View status of your submitted events awaiting admin review."
          />
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94A3B8', fontSize: '14px' }}>
            Loading pending events…
          </div>
        </PageContainer>
      </OrganizerLayout>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <OrganizerLayout activeItem="Pending Approval">
        <PageContainer size="xl">
          <PageHeader
            title="Pending Approvals"
            description="View status of your submitted events awaiting admin review."
          />
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#FFF1F2', borderRadius: '16px', border: '1px solid #FEE2E2',
          }}>
            <FiAlertCircle size={36} color="#EF4444" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#991B1B', margin: 0 }}>{error}</p>
          </div>
        </PageContainer>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout activeItem="Pending Approval">
      <PageContainer size="xl">
        <PageHeader
          title="Pending Approvals"
          description="View status of your submitted events awaiting admin review."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>

          {/* ── Empty state ────────────────────────────────────────────────── */}
          {events.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px dashed #E2E8F0',
            }}>
              <FiClock size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '750', color: '#374151', margin: '0 0 6px 0' }}>
                No Pending Events
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                You don't have any events awaiting review. Submit a new event to get started.
              </p>
            </div>

          ) : (
            /* ── Event cards (real backend data) ────────────────────────── */
            events.map((evt) => (
              <ContentCard
                key={evt.id}
                style={{ padding: '0px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}
              >
                {/* Banner */}
                <div style={{
                  height: '140px',
                  background: evt.banner_url
                    ? `url(${evt.banner_url}) center / cover no-repeat`
                    : '#F1F5F9',
                  display: evt.banner_url ? undefined : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!evt.banner_url && (
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>No banner</span>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '750', padding: '3px 8px',
                      borderRadius: '6px', background: '#FEF3C7', color: '#B45309',
                    }}>
                      PENDING REVIEW
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiCalendar size={12} />
                      {evt.start_datetime
                        ? new Date(evt.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                    {evt.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0', overflow: 'hidden', flex: 1 }}>
                    {evt.venue || '—'}
                  </p>

                  {evt.description && (
                    <p style={{
                      fontSize: '12px', color: '#6B7280', margin: '0 0 16px 0',
                      lineHeight: '1.5', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {evt.description}
                    </p>
                  )}

                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: 'auto' }}>
                    Submitted {evt.created_at ? new Date(evt.created_at).toLocaleDateString() : '—'}
                  </div>
                </div>
              </ContentCard>
            ))
          )}
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
