import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageContainer, PageHeader, ContentCard, StatCard, PrimaryButton, SecondaryButton } from '../components/ui/DesignSystem';
import { FiCalendar, FiUsers, FiCompass, FiLayers, FiActivity, FiArrowRight, FiCheck } from 'react-icons/fi';

const USER = { name: 'Alex Rivera', role: 'Event Manager' };

const UPCOMING = [
  { id: 1, title: 'Future Visionary Summit 2024', date: 'Oct 24, 2024', location: 'San Francisco, CA', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80' },
  { id: 2, title: 'AI & Machine Learning Expo', date: 'Nov 12, 2024', location: 'Austin, TX', image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=400&q=80' },
];

const RECENT_REGISTRATIONS = [
  { id: 1, name: 'Julius Ceasar', email: 'julius@rome.gov', event: 'Global Tech Summit 2024', date: '2 hours ago' },
  { id: 2, name: 'Cleopatra VII', email: 'cleo@alexandria.net', event: 'Future Visionary Summit 2024', date: '4 hours ago' },
  { id: 3, name: 'Marcus Aurelius', email: 'marcus@philosophy.edu', event: 'Global Tech Summit 2024', date: '1 day ago' },
];

const TIMELINE = [
  { id: 1, text: 'New ticket tier "Early Bird VIP" was created', date: '3 hours ago' },
  { id: 2, text: 'Successfully linked Stripe payout merchant account', date: '1 day ago' },
  { id: 3, text: 'Custom domain summit.compilvision.com pointed successfully', date: '3 days ago' },
];

const Sparkline = ({ stroke = '#F5C451' }) => (
  <svg viewBox="0 0 120 30" style={{ width: '90px', height: '24px', stroke: stroke, strokeWidth: '2', fill: 'none', marginLeft: 'auto' }}>
    <path d="M0,25 Q15,5 30,20 T60,10 T90,28 T120,5" strokeLinecap="round" />
  </svg>
);

function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout activeItem="Dashboard">
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
          {/* Subtle accent light */}
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
              Welcome back, {USER.name}
            </h1>
            <p style={{ fontSize: '15px', color: '#94A3B8', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Monitor tickets, manage logistics, and coordinate registrations for your high-fidelity event series.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <PrimaryButton onClick={() => navigate('/create')}>
                Create Event
              </PrimaryButton>
              <SecondaryButton
                onClick={() => navigate('/my-created-events')}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard
            title="Total Ticket Sales"
            value="$42,890"
            icon={<FiLayers />}
            description="Up 12.4% from last month"
            extra={<Sparkline />}
          />
          <StatCard
            title="Active Registrations"
            value="1,248"
            icon={<FiUsers />}
            description="Across 4 live listings"
            extra={<Sparkline stroke="#10B981" />}
          />
          <StatCard
            title="Total Events Hosted"
            value="16"
            icon={<FiCalendar />}
            description="2 scheduled for this quarter"
            extra={<Sparkline stroke="#6366F1" />}
          />
        </div>

        {/* Main Dashboard Workspace */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '28px' }}>
          
          {/* Left Column: Events & Table Lists */}
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
                    FEATURED UPCOMING
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>
                    Global Tech Summit 2024
                  </h3>
                  <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                    The premier gathering of technical executives, designers, and web creators exploring the future of generative AI interfaces.
                  </p>
                  <SecondaryButton onClick={() => navigate('/events/1')} style={{ alignSelf: 'flex-start' }}>
                    View Event Details <FiArrowRight style={{ marginLeft: '8px' }} />
                  </SecondaryButton>
                </div>
              </div>
            </ContentCard>

            {/* Recent Registrations Card */}
            <ContentCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Recent Registrations
                </h3>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>Real-time feed</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {RECENT_REGISTRATIONS.map((reg) => (
                  <div key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{reg.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{reg.email} &bull; {reg.event}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{reg.date}</div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>

          {/* Right Column: Timelines & Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Quick Actions Panel */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => navigate('/create')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ color: '#F5C451' }}>✦</span> Create New Listing
                </button>
                <button
                  onClick={() => navigate('/my-registrations')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>🎫</span> My Registered Passes
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>⚙️</span> Manage Configurations
                </button>
              </div>
            </ContentCard>

            {/* Activity Timeline Card */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 18px 0', fontFamily: 'var(--font-heading)' }}>
                System Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
                {TIMELINE.map((item, index) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F5C451', zIndex: 1 }} />
                      {index !== TIMELINE.length - 1 && (
                        <div style={{ width: '2px', flex: 1, background: '#E2E8F0', marginTop: '4px', marginBottom: '4px' }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                        {item.text}
                      </p>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>

        </div>
      </PageContainer>

      {/* Scoped CSS for responsive dashboard layout wrapping */}
      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default Dashboard;
