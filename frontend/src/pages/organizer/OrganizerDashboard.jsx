import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { EventContext } from '../../context/EventContext';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, ContentCard, StatCard, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import { FiCalendar, FiUsers, FiArrowRight, FiCheckCircle, FiClock, FiXCircle, FiDollarSign, FiPlusCircle, FiMapPin, FiBarChart2 } from 'react-icons/fi';
import { getOrganizerAnalyticsApi } from '../../services/api';

const Sparkline = ({ stroke = '#F5C451' }) => (
  <svg viewBox="0 0 120 30" style={{ width: '90px', height: '24px', stroke: stroke, strokeWidth: '2', fill: 'none', marginLeft: 'auto' }}>
    <path d="M0,25 Q15,5 30,20 T60,10 T90,28 T120,5" strokeLinecap="round" />
  </svg>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function formatEventDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ─── Featured Event Card ─────────────────────────────────────────────────── */
function FeaturedEventCard({ event, analyticsData, navigate }) {
  const FALLBACK_BG = 'linear-gradient(135deg, #111827 0%, #1F2937 100%)';

  // Derive registration count and revenue from analytics top events list
  const topEvents  = analyticsData?.top_events ?? [];
  const eventStats = topEvents.find(e => String(e.event_id) === String(event.id)) || null;
  const regCount   = eventStats?.registration_count ?? '—';
  const revenue    = eventStats?.revenue != null
    ? `₹${parseFloat(eventStats.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '—';
  const seatsLeft  = event.max_participants != null
    ? event.max_participants - (eventStats?.registration_count ?? 0)
    : '—';

  const badge = event.status === 'APPROVED'
    ? { label: 'PUBLISHED',        bg: '#DCFCE7', color: '#15803D' }
    : { label: 'PENDING APPROVAL', bg: '#FEF3C7', color: '#B45309' };

  return (
    <ContentCard style={{ padding: '0px', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
        {/* Left: banner */}
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '220px' }}
          />
        ) : (
          <div style={{
            background: FALLBACK_BG,
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
          }}>
            📅
          </div>
        )}

        {/* Right: details */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '6px',
              background: badge.bg,
              color: badge.color,
              display: 'inline-block',
              marginBottom: '12px',
            }}>
              {badge.label}
            </span>

            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 12px 0',
              fontFamily: 'var(--font-heading)',
              lineHeight: '1.3',
            }}>
              {event.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCalendar size={13} color="#94A3B8" />
                <span>{formatEventDate(event.start_datetime)}</span>
              </div>
              {event.venue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiMapPin size={13} color="#94A3B8" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{event.venue}</span>
                </div>
              )}
            </div>

            {/* Mini stats row */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                <span style={{ fontWeight: '700', color: '#111827', fontSize: '16px' }}>{regCount}</span>
                <span style={{ display: 'block' }}>Registrations</span>
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                <span style={{ fontWeight: '700', color: '#111827', fontSize: '16px' }}>{revenue}</span>
                <span style={{ display: 'block' }}>Revenue</span>
              </div>
              {seatsLeft !== '—' && (
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  <span style={{ fontWeight: '700', color: '#111827', fontSize: '16px' }}>{Math.max(0, seatsLeft)}</span>
                  <span style={{ display: 'block' }}>Seats Left</span>
                </div>
              )}
            </div>
          </div>

          <SecondaryButton
            onClick={() => navigate('/organizer/events')}
            style={{ alignSelf: 'flex-start' }}
          >
            Manage Event <FiArrowRight style={{ marginLeft: '8px' }} />
          </SecondaryButton>
        </div>
      </div>
    </ContentCard>
  );
}

/* ─── Empty state when organizer has no events ────────────────────────────── */
function NoEventsCard({ navigate }) {
  return (
    <ContentCard style={{ textAlign: 'center', padding: '48px 32px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>
        No events yet
      </h3>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.6' }}>
        Create your first event to start tracking registrations, revenue, and analytics.
      </p>
      <PrimaryButton onClick={() => navigate('/organizer/events/create')}>
        <FiPlusCircle /> Create Your First Event
      </PrimaryButton>
    </ContentCard>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
export default function OrganizerDashboard() {
  const { user }              = useContext(AuthContext);
  const { myEvents }          = useContext(EventContext);
  const navigate              = useNavigate();

  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getOrganizerAnalyticsApi();
        if (!cancelled && res?.success) setAnalyticsData(res.data);
      } catch (_) {
        // Fail silently — dashboard still renders with partial data
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Event counts from context ───────────────────────────────────────────────
  const totalEvents     = myEvents.length;
  const publishedEvents = myEvents.filter(e => e.status === 'APPROVED').length;
  const pendingEvents   = myEvents.filter(e => e.status === 'PENDING').length;
  const rejectedEvents  = myEvents.filter(e => e.status === 'REJECTED').length;

  // ── Analytics stats ─────────────────────────────────────────────────────────
  const totalRegistrations = analyticsData?.total_registrations ?? '—';
  const totalRevenue = analyticsData != null
    ? `₹${parseFloat(analyticsData.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : '—';

  // ── Select featured event: APPROVED first, else PENDING, else null ──────────
  const approvedEvents = myEvents.filter(e => e.status === 'APPROVED');
  const pendingList    = myEvents.filter(e => e.status === 'PENDING');

  // Most recently created comes first (context already sorted by created_at desc usually)
  const featuredEvent =
    approvedEvents[0] ||
    pendingList[0]    ||
    null;

  return (
    <OrganizerLayout activeItem="Dashboard">
      <PageContainer size="xl">

        {/* ── Welcome Hero ───────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
          borderRadius: '24px',
          padding: '40px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-medium)',
        }}>
          <div style={{
            position: 'absolute', top: '-50%', right: '-10%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,196,81,0.15) 0%, rgba(245,196,81,0) 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              Welcome, {user?.username || 'Organizer'}
            </h1>
            <p style={{ fontSize: '15px', color: '#94A3B8', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Create events, track submissions, monitor ticketing operations, and coordinate registrations from your central panel.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <PrimaryButton onClick={() => navigate('/organizer/events/create')}>
                Create Event
              </PrimaryButton>
              <SecondaryButton
                onClick={() => navigate('/organizer/events')}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                Manage My Events
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* ── Event Status Stats ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <StatCard title="Total Events Created"  value={totalEvents}     icon={<FiCalendar />}     description="Lifetime created events"    extra={<Sparkline stroke="#6366F1" />} />
          <StatCard title="Published Events"      value={publishedEvents} icon={<FiCheckCircle />}  description="Active & live events"        extra={<Sparkline stroke="#10B981" />} />
          <StatCard title="Pending Approval"      value={pendingEvents}   icon={<FiClock />}        description="Awaiting admin review"       extra={<Sparkline stroke="#F5C451" />} />
          <StatCard title="Rejected Events"       value={rejectedEvents}  icon={<FiXCircle />}      description="Require revisions"           extra={<Sparkline stroke="#EF4444" />} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Total Registrations" value={totalRegistrations} icon={<FiUsers />}     description="Across all your events"       extra={<Sparkline stroke="#F5C451" />} />
          <StatCard title="Total Revenue"       value={totalRevenue}       icon={<FiDollarSign />} description="Paid registrations revenue"  extra={<Sparkline stroke="#10B981" />} />
        </div>

        {/* ── Main Dashboard Workspace ───────────────────────────────────── */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '28px' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Featured event or empty state */}
            {featuredEvent ? (
              <FeaturedEventCard
                event={featuredEvent}
                analyticsData={analyticsData}
                navigate={navigate}
              />
            ) : (
              <NoEventsCard navigate={navigate} />
            )}

            {/* Recent Activity — only show if there are real events */}
            {myEvents.length > 0 && (
              <ContentCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    My Events Overview
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {myEvents.slice(0, 3).map((ev) => (
                    <div key={ev.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '14px',
                      borderBottom: '1px solid #F1F5F9',
                    }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{ev.title}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                          {ev.status} · {formatEventDate(ev.start_datetime)}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: ev.status === 'APPROVED' ? '#DCFCE7' : ev.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                        color: ev.status === 'APPROVED' ? '#15803D' : ev.status === 'REJECTED' ? '#991B1B' : '#B45309',
                      }}>
                        {ev.status}
                      </span>
                    </div>
                  ))}
                </div>
              </ContentCard>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Quick Actions */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => navigate('/organizer/events/create')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ color: '#F5C451' }}>✦</span> Create New Event
                </button>
                <button
                  onClick={() => navigate('/organizer/events')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>🎫</span> Manage Event Portfolio
                </button>
                <button
                  onClick={() => navigate('/organizer/participants')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>👥</span> View Registered Participants
                </button>
                <button
                  onClick={() => navigate('/organizer/analytics')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <FiBarChart2 size={15} /> View Analytics
                </button>
              </div>
            </ContentCard>

            {/* Event Deadlines — real from myEvents */}
            {myEvents.filter(e => e.registration_deadline).length > 0 && (
              <ContentCard>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 18px 0', fontFamily: 'var(--font-heading)' }}>
                  Upcoming Deadlines
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {myEvents
                    .filter(e => e.registration_deadline && new Date(e.registration_deadline) > new Date())
                    .sort((a, b) => new Date(a.registration_deadline) - new Date(b.registration_deadline))
                    .slice(0, 3)
                    .map((ev) => {
                      const daysLeft = Math.ceil(
                        (new Date(ev.registration_deadline) - new Date()) / (1000 * 60 * 60 * 24)
                      );
                      const dotColor = daysLeft <= 2 ? '#EF4444' : daysLeft <= 7 ? '#F5C451' : '#10B981';
                      return (
                        <div key={ev.id} style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, marginTop: '6px', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: '1.4', fontWeight: '600' }}>
                              Registration deadline: {ev.title}
                            </p>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                              Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ContentCard>
            )}
          </div>
        </div>
      </PageContainer>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </OrganizerLayout>
  );
}
