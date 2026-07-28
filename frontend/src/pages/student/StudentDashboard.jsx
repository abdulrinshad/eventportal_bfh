import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import StudentLayout from './StudentLayout';
import {
  PageContainer,
  ContentCard,
  StatCard,
  PrimaryButton,
  SecondaryButton,
} from '../../components/ui/DesignSystem';
import { FiCalendar, FiBookmark, FiCompass, FiArrowRight, FiLoader } from 'react-icons/fi';
import { getStudentDashboardApi } from '../../services/api';

// ── Sparkline decorative SVG ─────────────────────────────────────────────────
const Sparkline = ({ stroke = '#F5C451' }) => (
  <svg
    viewBox="0 0 120 30"
    style={{ width: '90px', height: '24px', stroke, strokeWidth: '2', fill: 'none', marginLeft: 'auto' }}
  >
    <path d="M0,25 Q15,5 30,20 T60,10 T90,28 T120,5" strokeLinecap="round" />
  </svg>
);

// ── Relative time helper ──────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return 'Just now';
  if (mins < 60)  return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7)   return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── Format date display ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
const SkeletonBlock = ({ h = 20, w = '100%', mb = 8, radius = 8 }) => (
  <div
    style={{
      height: h,
      width: w,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      marginBottom: mb,
    }}
  />
);

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [toast, setToast] = useState(location.state?.toastMessage || '');

  // Dashboard data from API
  const [dashData, setDashData]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [fetchErr, setFetchErr]   = useState(null);

  useEffect(() => {
    if (location.state?.toastMessage) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch dashboard data on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchErr(null);
      try {
        const res = await getStudentDashboardApi();
        if (!cancelled && res && res.success) {
          setDashData(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchErr('Failed to load dashboard data. Please refresh.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Derived values with safe defaults
  const registeredCount  = dashData?.registered_events   ?? 0;
  const availableCount   = dashData?.available_events    ?? 0;
  const attendedCount    = dashData?.events_attended     ?? 0;
  const organizerStatus  = dashData?.organizer_status    ?? user?.organizer_status ?? 'NOT_APPLIED';
  const upcomingRegs     = dashData?.upcoming_registrations ?? [];
  const recentActivity   = dashData?.recent_activity    ?? [];
  const recommendedEvent = dashData?.recommended_event  ?? null;

  // Map backend organizer_status to display values
  const orgStatusDisplay = {
    'NOT_APPLIED':   'Not Applied',
    'Not Applied':   'Not Applied',
    'PENDING':       'Pending Review',
    'Pending Review':'Pending Review',
    'APPROVED':      'Approved',
    'REJECTED':      'Rejected',
  };
  const orgStatus = orgStatusDisplay[organizerStatus] || 'Not Applied';

  return (
    <StudentLayout activeItem="Dashboard">
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <PageContainer size="xl">
        {/* Toast */}
        {toast && (
          <div style={{
            background: '#FEE2E2', border: '1.5px solid #FCA5A5', borderRadius: '16px',
            padding: '16px 20px', color: '#991B1B', fontWeight: '600', fontSize: '14px',
            marginBottom: '24px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', boxShadow: 'var(--shadow-soft)',
          }}>
            <span>⚠️ {toast}</span>
            <button
              onClick={() => setToast('')}
              style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}
            >×</button>
          </div>
        )}

        {/* Error banner */}
        {fetchErr && (
          <div style={{
            background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px',
            padding: '14px 18px', color: '#991B1B', fontSize: '14px', marginBottom: '24px',
          }}>
            {fetchErr}
          </div>
        )}

        {/* Welcome Panel */}
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
          borderRadius: '24px', padding: '40px', color: '#FFFFFF',
          position: 'relative', overflow: 'hidden', marginBottom: '32px',
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
              Welcome back, {user?.first_name || user?.username || 'Student'} 👋
            </h1>
            <p style={{ fontSize: '15px', color: '#94A3B8', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Discover premium events, manage your tickets, and track your learning journey.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <PrimaryButton onClick={() => navigate('/student/events')}>
                Explore Events
              </PrimaryButton>
              <SecondaryButton
                onClick={() => navigate('/student/registrations')}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                My Registrations
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <ContentCard key={i} style={{ padding: '24px' }}>
                  <SkeletonBlock h={14} w="60%" mb={12} />
                  <SkeletonBlock h={36} w="40%" mb={8} />
                  <SkeletonBlock h={12} w="80%" mb={0} />
                </ContentCard>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="My Registered Events"
                value={registeredCount}
                icon={<FiBookmark />}
                description="Active tickets & passes"
                extra={<Sparkline />}
              />
              <StatCard
                title="Available Events"
                value={availableCount}
                icon={<FiCompass />}
                description="Explore and register now"
                extra={<Sparkline stroke="#10B981" />}
              />
              <StatCard
                title="Total Events Attended"
                value={attendedCount}
                icon={<FiCalendar />}
                description="Completed learning milestones"
                extra={<Sparkline stroke="#6366F1" />}
              />
            </>
          )}
        </div>

        {/* Dashboard Content Grid */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Recommended / Featured Event */}
            {loading ? (
              <ContentCard style={{ padding: '0px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
                  <SkeletonBlock h={240} mb={0} radius={0} />
                  <div style={{ padding: '32px' }}>
                    <SkeletonBlock h={12} w="50%" mb={12} />
                    <SkeletonBlock h={22} w="90%" mb={8} />
                    <SkeletonBlock h={14} w="80%" mb={4} />
                    <SkeletonBlock h={14} w="70%" mb={20} />
                    <SkeletonBlock h={38} w="140px" mb={0} />
                  </div>
                </div>
              </ContentCard>
            ) : recommendedEvent ? (
              <ContentCard style={{ padding: '0px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr' }}>
                  {recommendedEvent.banner_url ? (
                    <img
                      src={recommendedEvent.banner_url}
                      alt={recommendedEvent.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '220px' }}
                    />
                  ) : (
                    <div style={{ background: 'linear-gradient(135deg, #1F2937, #374151)', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '48px' }}>🎪</span>
                    </div>
                  )}
                  <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309', alignSelf: 'flex-start', marginBottom: '12px' }}>
                      RECOMMENDED FOR YOU
                    </span>
                    <span style={{ fontSize: '11px', color: '#F5C451', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {recommendedEvent.category}
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>
                      {recommendedEvent.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px 0' }}>
                      📍 {recommendedEvent.venue}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px 0' }}>
                      📅 {formatDate(recommendedEvent.start_datetime)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <SecondaryButton
                        onClick={() => navigate(`/events/${recommendedEvent.id}`)}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        View Details <FiArrowRight style={{ marginLeft: '8px' }} />
                      </SecondaryButton>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: recommendedEvent.is_free ? '#10B981' : '#111827' }}>
                        {recommendedEvent.is_free ? 'Free' : `₹${parseFloat(recommendedEvent.ticket_price).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </ContentCard>
            ) : (
              <ContentCard style={{ padding: '32px', textAlign: 'center' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🔍</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>No recommendations yet</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0' }}>
                  Register for events or explore available ones to see personalised recommendations.
                </p>
                <PrimaryButton onClick={() => navigate('/student/events')}>
                  Explore Events
                </PrimaryButton>
              </ContentCard>
            )}

            {/* Upcoming Registrations */}
            <ContentCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Upcoming Registered Events
                </h3>
                <span
                  style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => navigate('/student/registrations')}
                >
                  View All
                </span>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[1, 2].map(i => (
                    <div key={i} style={{ paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                      <SkeletonBlock h={14} w="70%" mb={6} />
                      <SkeletonBlock h={11} w="50%" mb={0} />
                    </div>
                  ))}
                </div>
              ) : upcomingRegs.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '14px' }}>
                  You have not registered for any upcoming events yet.{' '}
                  <span
                    style={{ color: '#2563EB', cursor: 'pointer', fontWeight: '600' }}
                    onClick={() => navigate('/student/events')}
                  >
                    Explore events →
                  </span>
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {upcomingRegs.map((reg) => (
                    <div key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{reg.event_title}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {reg.event_venue} • {formatDate(reg.event_date)}
                        </div>
                        <span style={{
                          display: 'inline-block', marginTop: '4px',
                          fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                          background: reg.status === 'CONFIRMED' ? '#DCFCE7' : '#FEF3C7',
                          color: reg.status === 'CONFIRMED' ? '#15803D' : '#B45309',
                        }}>
                          {reg.status}
                        </span>
                      </div>
                      <SecondaryButton
                        onClick={() => navigate(`/events/${reg.event_id}`)}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        View
                      </SecondaryButton>
                    </div>
                  ))}
                </div>
              )}
            </ContentCard>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Organizer Status Card */}
            <ContentCard style={{ background: '#FFFDF5', border: '1px solid rgba(245,196,81,0.25)', position: 'relative' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
                Organizer Status
              </h3>

              {(orgStatus === 'Not Applied') && (
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280', marginBottom: '12px' }}>Not Applied</div>
                  <PrimaryButton onClick={() => navigate('/organizer/apply')} style={{ width: '100%' }}>
                    Apply as Organizer
                  </PrimaryButton>
                </div>
              )}
              {orgStatus === 'Pending Review' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309', fontWeight: '700', fontSize: '13px' }}>
                      Pending Review
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '0', lineHeight: '1.5' }}>
                    Your application is currently under review by our admin team.
                  </p>
                </div>
              )}
              {orgStatus === 'Approved' && (
                <div>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D', fontWeight: '700', fontSize: '13px', marginBottom: '12px' }}>
                    ✓ Approved
                  </span>
                  <PrimaryButton
                    onClick={() => navigate('/organizer/dashboard')}
                    style={{ width: '100%', background: '#10B981', color: '#FFFFFF' }}
                  >
                    Go to Organizer Dashboard
                  </PrimaryButton>
                </div>
              )}
              {orgStatus === 'Rejected' && (
                <div>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', background: '#FEE2E2', color: '#EF4444', fontWeight: '700', fontSize: '13px', marginBottom: '12px' }}>
                    Rejected
                  </span>
                  <PrimaryButton onClick={() => navigate('/organizer/apply')} style={{ width: '100%' }}>
                    Apply Again
                  </PrimaryButton>
                </div>
              )}
            </ContentCard>

            {/* Quick Actions */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { emoji: '🔍', label: 'Search Events',    path: '/student/events' },
                  { emoji: '👤', label: 'My Profile',       path: '/student/profile' },
                  { emoji: '⚙️', label: 'Portal Settings',  path: '/student/settings' },
                ].map(({ emoji, label, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                      padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px',
                      background: '#FFFFFF', color: '#111827', fontWeight: '600', fontSize: '14px',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </ContentCard>

            {/* Activity History */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 18px 0', fontFamily: 'var(--font-heading)' }}>
                Activity History
              </h3>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E2E8F0', marginTop: '4px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <SkeletonBlock h={13} w="90%" mb={4} />
                        <SkeletonBlock h={10} w="40%" mb={0} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center', padding: '12px 0' }}>
                  No recent activity yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
                  {recentActivity.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F5C451', zIndex: 1 }} />
                        {index !== recentActivity.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: '#E2E8F0', marginTop: '4px', marginBottom: '4px' }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                          {item.text}
                        </p>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{relativeTime(item.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ContentCard>
          </div>
        </div>
      </PageContainer>
    </StudentLayout>
  );
}
