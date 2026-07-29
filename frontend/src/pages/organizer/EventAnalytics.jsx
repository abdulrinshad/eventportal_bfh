import React, { useState, useEffect } from 'react';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, StatCard } from '../../components/ui/DesignSystem';
import { FiTrendingUp, FiUsers, FiDollarSign, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { getOrganizerAnalyticsApi } from '../../services/api';

export default function EventAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getOrganizerAnalyticsApi();
        if (!cancelled && res?.success) {
          setAnalytics(res.data);
        } else if (!cancelled) {
          setError('Failed to load analytics.');
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load analytics. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Derived display values ─────────────────────────────────────────────────
  const totalRevenue       = analytics?.total_revenue ?? 0;
  const totalRegistrations = analytics?.total_registrations ?? 0;
  const velocityData       = analytics?.registration_velocity ?? [];
  const topEvents          = analytics?.top_events ?? [];

  const revenueDisplay = `₹${parseFloat(totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  // ── Velocity bar chart ─────────────────────────────────────────────────────
  const maxVelocityCount = velocityData.length > 0 ? Math.max(...velocityData.map(d => d.count), 1) : 1;
  const velocityBars     = velocityData.map(d => Math.max(8, Math.round((d.count / maxVelocityCount) * 200)));

  // ── Top events bar chart ───────────────────────────────────────────────────
  const maxRegCount = topEvents.length > 0 ? Math.max(...topEvents.map(e => e.registration_count), 1) : 1;
  const topEventBars = topEvents.map(e => Math.max(8, Math.round((e.registration_count / maxRegCount) * 180)));

  return (
    <OrganizerLayout activeItem="Analytics">
      <PageContainer size="xl">
        <PageHeader
          title="Performance Analytics"
          description="Track registrations velocity, ticket sales, and your top-performing events."
        />

        {/* Error Banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#FEE2E2', border: '1px solid #FCA5A5',
            borderRadius: '12px', padding: '12px 16px',
            marginBottom: '20px', color: '#991B1B',
            fontSize: '14px', fontWeight: '600',
          }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '60px', gap: '12px', color: '#94A3B8', fontSize: '15px',
          }}>
            <FiLoader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Loading analytics…
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            <StatCard
              title="Conversion Rate"
              value="—"
              icon={<FiTrendingUp />}
              description="No page tracking available"
            />
            <StatCard
              title="Total Registrations"
              value={totalRegistrations.toLocaleString()}
              icon={<FiUsers />}
              description="Across all your events"
            />
            <StatCard
              title="Total Revenue"
              value={revenueDisplay}
              icon={<FiDollarSign />}
              description="Gross paid revenue"
            />
          </div>
        )}

        {/* ── Charts ─────────────────────────────────────────────────────── */}
        {!loading && (
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}
            className="analytics-grid"
          >
            {/* ── Registration Velocity ────────────────────────────────── */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
                Registration Velocity
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0' }}>
                Registrations per day — last 30 days
              </p>

              {velocityData.length === 0 ? (
                <div style={{
                  height: '200px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#94A3B8', fontSize: '14px',
                }}>
                  No registrations in the last 30 days.
                </div>
              ) : (
                <div style={{ height: '230px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-between', flex: 1, padding: '10px 0',
                  }}>
                    {velocityBars.map((h, i) => (
                      <div
                        key={i}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, margin: '0 2px' }}
                      >
                        <div
                          title={`${velocityData[i]?.date}: ${velocityData[i]?.count} registration${velocityData[i]?.count !== 1 ? 's' : ''}`}
                          style={{
                            width: '100%',
                            height: `${h}px`,
                            background: '#F5C451',
                            borderRadius: '4px 4px 0 0',
                            cursor: 'default',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => e.target.style.opacity = '0.75'}
                          onMouseLeave={e => e.target.style.opacity = '1'}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8' }}>
                    <span>{velocityData[0]?.date}</span>
                    <span>{velocityData[velocityData.length - 1]?.date}</span>
                  </div>
                </div>
              )}
            </ContentCard>

            {/* ── Most Registered Events ───────────────────────────────── */}
            <ContentCard>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
                Most Registered Events
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0' }}>
                Top 5 events by registration count
              </p>

              {topEvents.length === 0 ? (
                <div style={{
                  height: '220px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#94A3B8', fontSize: '14px',
                  textAlign: 'center', flexDirection: 'column', gap: '8px',
                }}>
                  <span style={{ fontSize: '28px' }}>📊</span>
                  No event registration data yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {topEvents.map((ev, idx) => {
                    const barWidth = `${Math.round((ev.registration_count / maxRegCount) * 100)}%`;
                    const revenue  = ev.revenue > 0
                      ? `₹${parseFloat(ev.revenue).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
                      : 'Free';
                    return (
                      <div key={ev.event_id}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline', fontSize: '13px', marginBottom: '5px',
                        }}>
                          <span
                            style={{
                              fontWeight: '600', color: '#111827',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap', maxWidth: '60%',
                            }}
                            title={ev.title}
                          >
                            {idx + 1}. {ev.title}
                          </span>
                          <span style={{ color: '#475569', fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
                            {ev.registration_count} reg · {revenue}
                          </span>
                        </div>
                        <div style={{
                          width: '100%', height: '10px',
                          background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden',
                        }}>
                          <div style={{
                            width: barWidth, height: '100%',
                            background: '#F5C451', borderRadius: '6px',
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ContentCard>
          </div>
        )}

        <style>{`
          @media (max-width: 900px) {
            .analytics-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </PageContainer>
    </OrganizerLayout>
  );
}
