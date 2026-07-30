import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AppLayout,
  PageContainer,
  ContentCard,
  PrimaryButton,
  SecondaryButton,
} from '../components/ui/DesignSystem';
import {
  FiCalendar,
  FiMapPin,
  FiCheck,
  FiArrowLeft,
  FiBookmark,
  FiLoader,
  FiAlertCircle,
  FiTag,
  FiUser,
  FiDollarSign,
} from 'react-icons/fi';
import { getStudentEventDetailApi } from '../services/api';

/* ─── Confetti decoration (unchanged) ──────────────────────────────────────── */
const CONFETTI_DEF = [
  [  6,  4, '#F5C451', 14,  15 ], [ 12, 10, '#111827', 10, -22 ],
  [  4, 22, '#10B981',  8,  45 ], [  9, 33, '#F5C451', 12, -10 ],
  [  3, 48, '#6366f1',  7,  30 ], [  7, 57, '#F5C451', 11,  55 ],
  [  2, 70, '#10B981',  9, -35 ], [  5, 82, '#111827', 13,  18 ],
  [ 11, 91, '#F5C451',  8, -50 ], [ 15, 96, '#10B981', 10,  40 ],
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Main component ────────────────────────────────────────────────────────── */
const RegistrationSuccess = ({ onBackToEvents, onViewRegistrations }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventId   = searchParams.get('event_id');
  const sessionId = searchParams.get('session_id');

  const [event, setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  /* Fetch real event details from the DB */
  useEffect(() => {
    if (!eventId) {
      setError('Event information not found in URL.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await getStudentEventDetailApi(eventId);
        if (!cancelled) {
          if (res?.success && res?.data) {
            setEvent(res.data);
          } else {
            setError('Could not load event details.');
          }
        }
      } catch (err) {
        if (!cancelled) setError('Could not load event details. Please check your registrations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [eventId]);

  /* "Add to Calendar" uses real event data */
  const handleAddToCalendar = () => {
    if (!event) return;
    const start = event.start_datetime
      ? new Date(event.start_datetime)
          .toISOString()
          .replace(/[-:]/g, '')
          .split('.')[0]
      : '';
    const end = event.end_datetime
      ? new Date(event.end_datetime)
          .toISOString()
          .replace(/[-:]/g, '')
          .split('.')[0]
      : '';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title || 'Event',
      dates: start && end ? `${start}/${end}` : '',
      location: event.venue || '',
      details: sessionId ? `Booking reference: ${sessionId}` : '',
    });
    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
  };

  /* Safe fallback handlers if no props provided */
  const handleBackToEvents   = onBackToEvents   || (() => navigate('/student/events'));
  const handleViewRegs       = onViewRegistrations || (() => navigate('/student/registrations'));

  /* ── Render helpers ─────────────────────────────────────────────────────── */

  /* Loading skeleton */
  if (loading) {
    return (
      <AppLayout>
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '14px',
          color: '#94A3B8',
          fontSize: '15px',
        }}>
          <FiLoader size={28} style={{ animation: 'spin 1s linear infinite' }} />
          Loading your registration…
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </AppLayout>
    );
  }

  /* Error state */
  if (error) {
    return (
      <AppLayout>
        <PageContainer size="md">
          <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center',
          }}>
            <FiAlertCircle size={40} color="#EF4444" />
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Registration confirmed!
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '340px' }}>
              {error}
            </p>
            <PrimaryButton onClick={handleViewRegs}>
              <FiBookmark /> View My Registrations
            </PrimaryButton>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  /* ── Main success view ─────────────────────────────────────────────────── */
  const bannerSrc  = event?.banner_url || null;
  const title      = event?.title      || 'Event';
  const category   = event?.category   || '';
  const venue      = event?.venue      || '—';
  const organizer  = event?.organizer_name || event?.organizer?.display_name || event?.organizer?.username || '—';
  const price      = event?.is_paid && event?.price ? `₹${parseFloat(event.price).toLocaleString('en-IN')}` : 'Free';
  const ref        = sessionId ? sessionId.slice(-12).toUpperCase() : (eventId ? eventId.slice(-8).toUpperCase() : '—');

  return (
    <AppLayout>
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Confetti */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {CONFETTI_DEF.map(([top, left, color, size, rotate], i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                top: `${top}%`,
                left: `${left}%`,
                background: color,
                width: `${size}px`,
                height: `${size}px`,
                transform: `rotate(${rotate}deg)`,
                opacity: 0.25,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>

        <PageContainer size="md">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Check circle */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <FiCheck size={32} />
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-heading)',
            }}>
              You're registered!
            </h1>
            <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 32px 0' }}>
              A confirmation email has been sent to your inbox.
            </p>

            {/* Event card */}
            <ContentCard style={{
              maxWidth: '480px',
              width: '100%',
              padding: '0px',
              textAlign: 'left',
              marginBottom: '32px',
              overflow: 'hidden',
            }}>
              {/* Banner */}
              {bannerSrc ? (
                <img
                  src={bannerSrc}
                  alt={title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                }}>
                  📅
                </div>
              )}

              <div style={{ padding: '24px' }}>
                {/* Badge + Ref */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  {category && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#FEF3C7',
                      color: '#B45309',
                    }}>
                      {category}
                    </span>
                  )}
                  <span style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontFamily: 'monospace',
                    marginLeft: 'auto',
                  }}>
                    Ref: {ref}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 18px 0',
                  fontFamily: 'var(--font-heading)',
                  lineHeight: '1.3',
                }}>
                  {title}
                </h3>

                {/* Details list */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#475569',
                }}>
                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar color="#94A3B8" size={15} />
                    <span>
                      {formatDate(event?.start_datetime)} &bull; {formatTime(event?.start_datetime)}
                    </span>
                  </div>

                  {/* Venue */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMapPin color="#94A3B8" size={15} />
                    <span>{venue}</span>
                  </div>

                  {/* Organizer */}
                  {organizer !== '—' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiUser color="#94A3B8" size={15} />
                      <span>{organizer}</span>
                    </div>
                  )}

                  {/* Ticket price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiDollarSign color="#94A3B8" size={15} />
                    <span>{price}</span>
                  </div>

                  {/* Event ID */}
                  {eventId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiTag color="#94A3B8" size={15} />
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94A3B8' }}>
                        Event ID: {eventId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </ContentCard>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <PrimaryButton onClick={handleAddToCalendar}>
                <FiCalendar /> Add to Calendar
              </PrimaryButton>
              <SecondaryButton onClick={handleViewRegs}>
                <FiBookmark /> View Registrations
              </SecondaryButton>
            </div>

            {/* Back link */}
            <button
              onClick={handleBackToEvents}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '24px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#111827'}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              <FiArrowLeft /> Back to Events
            </button>
          </div>
        </PageContainer>
      </div>
    </AppLayout>
  );
};

export default RegistrationSuccess;
