import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton } from '../../components/ui/DesignSystem';
import { getRejectedEventsApi } from '../../services/api';
import { FiXCircle, FiEdit2, FiAlertCircle } from 'react-icons/fi';

export default function RejectedEvents() {
  const navigate = useNavigate();

  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchRejected = async () => {
      try {
        const data = await getRejectedEventsApi();
        // Backend returns either an array or a paginated { results: [] } object
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setEvents(list);
      } catch (err) {
        console.error('Failed to load rejected events:', err);
        setError('Unable to load rejected events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRejected();
  }, []);

  /* ── Loading state ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <OrganizerLayout activeItem="Rejected Events">
        <PageContainer size="xl">
          <PageHeader
            title="Rejected Listings"
            description="Review rejected events, read administrator feedback, edit details, and resubmit for approval."
          />
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94A3B8', fontSize: '14px' }}>
            Loading rejected events…
          </div>
        </PageContainer>
      </OrganizerLayout>
    );
  }

  /* ── Error state ───────────────────────────────────────────────────────── */
  if (error) {
    return (
      <OrganizerLayout activeItem="Rejected Events">
        <PageContainer size="xl">
          <PageHeader
            title="Rejected Listings"
            description="Review rejected events, read administrator feedback, edit details, and resubmit for approval."
          />
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFF1F2', borderRadius: '16px', border: '1px solid #FEE2E2' }}>
            <FiAlertCircle size={36} color="#EF4444" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#991B1B', margin: 0 }}>{error}</p>
          </div>
        </PageContainer>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout activeItem="Rejected Events">
      <PageContainer size="xl">
        <PageHeader
          title="Rejected Listings"
          description="Review rejected events, read administrator feedback, edit details, and resubmit for approval."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>

          {/* ── Empty state ──────────────────────────────────────────────── */}
          {events.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px dashed #E2E8F0',
            }}>
              <FiXCircle size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: '0 0 6px 0' }}>
                No Rejected Events
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 4px 0' }}>
                You don't have any rejected events.
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                Once an administrator rejects one of your events, it will appear here.
              </p>
            </div>

          ) : (

            /* ── Event cards (dynamic) ────────────────────────────────── */
            events.map(evt => (
              <ContentCard
                key={evt.id}
                style={{ padding: '0px', overflow: 'hidden', border: '1px solid #FEE2E2', display: 'flex', flexDirection: 'column' }}
              >
                {/* Banner */}
                <div style={{
                  height: '140px',
                  background: evt.banner
                    ? `url(${evt.banner}) center / cover no-repeat`
                    : '#F1F5F9',
                  display: evt.banner ? undefined : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!evt.banner && (
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>No banner</span>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* Status + rejected date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '750',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#FEE2E2',
                      color: '#EF4444',
                    }}>
                      REJECTED
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {evt.rejected_date
                        ? new Date(evt.rejected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>
                    {evt.title}
                  </h3>

                  {/* Admin feedback */}
                  <div style={{
                    background: '#FFF1F2',
                    borderLeft: '3px solid #EF4444',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#991B1B',
                    margin: '8px 0 16px 0',
                    lineHeight: '1.4',
                  }}>
                    <strong>Admin Note:</strong>{' '}
                    {evt.rejection_reason || 'No reason provided.'}
                  </div>

                  {/* Edit & Resubmit button */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <PrimaryButton
                      onClick={() => navigate(`/organizer/events/edit/${evt.id}`)}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      <FiEdit2 /> Edit &amp; Resubmit
                    </PrimaryButton>
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
