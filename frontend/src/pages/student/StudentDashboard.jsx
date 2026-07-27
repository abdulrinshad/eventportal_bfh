import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { EventContext } from '../../context/EventContext';
import StudentLayout from './StudentLayout';
import { PageContainer, ContentCard, StatCard, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import { FiCalendar, FiBookmark, FiCompass, FiActivity, FiArrowRight } from 'react-icons/fi';

const Sparkline = ({ stroke = '#F5C451' }) => (
  <svg viewBox="0 0 120 30" style={{ width: '90px', height: '24px', stroke: stroke, strokeWidth: '2', fill: 'none', marginLeft: 'auto' }}>
    <path d="M0,25 Q15,5 30,20 T60,10 T90,28 T120,5" strokeLinecap="round" />
  </svg>
);

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const { events, myRegistrations } = useContext(EventContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(location.state?.toastMessage || '');

  useEffect(() => {
    if (location.state?.toastMessage) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Find registered events
  const registeredEvents = events.filter(e => myRegistrations.includes(e.id));
  const upcomingEvents = events.filter(e => !myRegistrations.includes(e.id)).slice(0, 2);

  const timelineData = [
    { id: 1, text: 'You registered for Future Visionary Summit 2024', date: '2 hours ago' },
    { id: 2, text: 'New event "AI & Machine Learning Expo" is open for registrations', date: '1 day ago' },
    { id: 3, text: 'Profile information updated successfully', date: '3 days ago' },
  ];

  return (
    <StudentLayout activeItem="Dashboard">
      <PageContainer size="xl">
        {toast && (
          <div style={{
            background: '#FEE2E2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '16px',
            padding: '16px 20px',
            color: '#991B1B',
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <span>⚠️ {toast}</span>
            <button onClick={() => setToast('')} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>×</button>
          </div>
        )}

        {/* Welcome Panel */}
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
              Welcome back, {user?.username || 'Student'}
            </h1>
            <p style={{ fontSize: '15px', color: '#94A3B8', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Discover premium technical summits, manage your tickets, and explore upcoming webinars and hackathons.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <PrimaryButton onClick={() => navigate('/student/events')}>
                Explore Events
              </PrimaryButton>
              <SecondaryButton
                onClick={() => navigate('/student/registrations')}
                style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                My Registrations
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard
            title="My Registered Events"
            value={myRegistrations.length}
            icon={<FiBookmark />}
            description="Active tickets & passes"
            extra={<Sparkline />}
          />
          <StatCard
            title="Available Events"
            value={events.length}
            icon={<FiCompass />}
            description="Explore and register now"
            extra={<Sparkline stroke="#10B981" />}
          />
          <StatCard
            title="Total Events Attended"
            value={Math.max(0, myRegistrations.length - 1)}
            icon={<FiCalendar />}
            description="Completed learning milestones"
            extra={<Sparkline stroke="#6366F1" />}
          />
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Featured Event Card */}
            {upcomingEvents[0] && (
              <ContentCard style={{ padding: '0px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
                  <img
                    src={upcomingEvents[0].image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"}
                    alt="Featured event"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '240px' }}
                  />
                  <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309', alignSelf: 'flex-start', marginBottom: '12px' }}>
                      RECOMMENDED FOR YOU
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>
                      {upcomingEvents[0].title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                      Explore expert talks, masterclasses, and hands-on sessions. Expand your skill set today.
                    </p>
                    <SecondaryButton onClick={() => navigate(`/events/${upcomingEvents[0].id}`)} style={{ alignSelf: 'flex-start' }}>
                      View Details <FiArrowRight style={{ marginLeft: '8px' }} />
                    </SecondaryButton>
                  </div>
                </div>
              </ContentCard>
            )}

            {/* My Registrations List Preview */}
            <ContentCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Upcoming Registered Events
                </h3>
                <span style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('/student/registrations')}>
                  View All
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {registeredEvents.length === 0 ? (
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>You have not registered for any events yet. Check out the explore events tab!</p>
                ) : (
                  registeredEvents.map((evt) => (
                    <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{evt.title}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{evt.venueName} &bull; {evt.date}</div>
                      </div>
                      <SecondaryButton onClick={() => navigate(`/events/${evt.id}`)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Pass
                      </SecondaryButton>
                    </div>
                  ))
                )}
              </div>
            </ContentCard>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Organizer Status Card */}
            {user && (
              <ContentCard style={{
                background: '#FFFDF5',
                border: '1px solid rgba(245, 196, 81, 0.25)',
                position: 'relative'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
                  Organizer Status
                </h3>
                
                {(!user?.organizerApplicationStatus || user.organizerApplicationStatus === 'Not Applied') && (
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280', marginBottom: '12px' }}>Not Applied</div>
                    <PrimaryButton onClick={() => navigate('/organizer/apply')} style={{ width: '100%' }}>
                      Apply as Organizer
                    </PrimaryButton>
                  </div>
                )}

                {user?.organizerApplicationStatus === 'Pending Review' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7' }}>Pending Review</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0', lineHeight: '1.5' }}>
                      Your application is currently under review.
                    </p>
                  </div>
                )}

                {user?.organizerApplicationStatus === 'Approved' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7' }}>Approved</span>
                    </div>
                    <PrimaryButton onClick={() => navigate('/organizer/dashboard')} style={{ width: '100%', background: '#10B981', color: '#FFFFFF' }}>
                      Go to Organizer Dashboard
                    </PrimaryButton>
                  </div>
                )}

                {user?.organizerApplicationStatus === 'Rejected' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#FEE2E2' }}>Rejected</span>
                    </div>
                    <div style={{ background: '#FFF1F2', borderLeft: '3px solid #EF4444', padding: '10px', borderRadius: '4px', fontSize: '12px', color: '#991B1B', marginBottom: '14px', lineHeight: '1.4' }}>
                      <strong>Reason:</strong> {user.organizerApplicationRejectReason || 'Incomplete profile or lack of previous hosting credentials.'}
                    </div>
                    <PrimaryButton onClick={() => navigate('/organizer/apply')} style={{ width: '100%' }}>
                      Apply Again
                    </PrimaryButton>
                  </div>
                )}
              </ContentCard>
            )}

            {/* Quick Actions Panel */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => navigate('/student/events')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ color: '#F5C451' }}>🔍</span> Search Events
                </button>
                <button
                  onClick={() => navigate('/student/profile')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>👤</span> My Profile
                </button>
                <button
                  onClick={() => navigate('/student/settings')}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>⚙️</span> Portal Settings
                </button>
              </div>
            </ContentCard>

            {/* Timeline */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 18px 0', fontFamily: 'var(--font-heading)' }}>
                Activity History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
                {timelineData.map((item, index) => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F5C451', zIndex: 1 }} />
                      {index !== timelineData.length - 1 && (
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
      
      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </StudentLayout>
  );
}
