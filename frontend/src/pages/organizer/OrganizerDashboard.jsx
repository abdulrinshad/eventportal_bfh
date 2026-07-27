import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { EventContext } from '../../context/EventContext';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, ContentCard, StatCard, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import { FiCalendar, FiUsers, FiSliders, FiActivity, FiArrowRight, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const Sparkline = ({ stroke = '#F5C451' }) => (
  <svg viewBox="0 0 120 30" style={{ width: '90px', height: '24px', stroke: stroke, strokeWidth: '2', fill: 'none', marginLeft: 'auto' }}>
    <path d="M0,25 Q15,5 30,20 T60,10 T90,28 T120,5" strokeLinecap="round" />
  </svg>
);

export default function OrganizerDashboard() {
  const { user } = useContext(AuthContext);
  const { events, myEvents } = useContext(EventContext);
  const navigate = useNavigate();

  // Organizer events
  const totalEvents = myEvents.length || 3;
  const publishedEvents = myEvents.filter(e => e.status === 'live').length || 1;
  const pendingEvents = myEvents.filter(e => e.status === 'pending').length || 1;
  const rejectedEvents = myEvents.filter(e => e.status === 'rejected').length || 1;
  
  const totalRegistrations = 1248;
  const totalParticipants = 840;

  const recentActivity = [
    { id: 1, text: 'Ticket tier "Early Bird VIP" was updated', date: '3 hours ago' },
    { id: 2, text: 'Submitted "SaaS Connect 2025" for Admin approval', date: '1 day ago' },
    { id: 3, text: 'Linked Stripe payout merchant account', date: '2 days ago' },
  ];

  return (
    <OrganizerLayout activeItem="Dashboard">
      <PageContainer size="xl">
        {/* Welcome Hero Panel */}
        <div
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
            borderRadius: '24px',
            padding: '40px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 196, 81, 0.15) 0%, rgba(245, 196, 81, 0) 70%)',
              pointerEvents: 'none',
            }}
          />
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
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                Manage My Events
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard
            title="Total Events Created"
            value={totalEvents}
            icon={<FiCalendar />}
            description="Lifetime created events"
            extra={<Sparkline stroke="#6366F1" />}
          />
          <StatCard
            title="Published Events"
            value={publishedEvents}
            icon={<FiCheckCircle />}
            description="Active registrations"
            extra={<Sparkline stroke="#10B981" />}
          />
          <StatCard
            title="Pending Approval"
            value={pendingEvents}
            icon={<FiClock />}
            description="Awaiting admin reviews"
            extra={<Sparkline stroke="#F5C451" />}
          />
          <StatCard
            title="Rejected Events"
            value={rejectedEvents}
            icon={<FiXCircle />}
            description="Require revisions"
            extra={<Sparkline stroke="#EF4444" />}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard
            title="Total Registrations"
            value={totalRegistrations}
            icon={<FiUsers />}
            description="Purchased tickets/passes"
            extra={<Sparkline stroke="#F5C451" />}
          />
          <StatCard
            title="Total Participants"
            value={totalParticipants}
            icon={<FiSliders />}
            description="Unique checking base"
            extra={<Sparkline stroke="#10B981" />}
          />
        </div>

        {/* Main Dashboard Workspace */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '28px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Featured Event Card */}
            <ContentCard style={{ padding: '0px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
                  alt="Featured event"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '240px' }}
                />
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309', alignSelf: 'flex-start', marginBottom: '12px' }}>
                    FEATURED LIVE SUMMIT
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>
                    Global Tech Summit 2024
                  </h3>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                    Monitor ticket allocations, register credentials, and track participants in real-time.
                  </p>
                  <SecondaryButton onClick={() => navigate('/organizer/events')} style={{ alignSelf: 'flex-start' }}>
                    Manage Live Board <FiArrowRight style={{ marginLeft: '8px' }} />
                  </SecondaryButton>
                </div>
              </div>
            </ContentCard>

            {/* Recent activity */}
            <ContentCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Recent Activity Log
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recentActivity.map((act) => (
                  <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{act.text}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{act.date}</div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Quick Actions Panel */}
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
              </div>
            </ContentCard>

            {/* Deadlines */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 18px 0', fontFamily: 'var(--font-heading)' }}>
                Upcoming Deadlines
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', marginTop: '6px' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: '1.4', fontWeight: '600' }}>
                      Submit speaker registry for Visionary Summit
                    </p>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Due in 2 days</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F5C451', marginTop: '6px' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: '1.4', fontWeight: '600' }}>
                      Review category badges
                    </p>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Due in 5 days</span>
                  </div>
                </div>
              </div>
            </ContentCard>
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
