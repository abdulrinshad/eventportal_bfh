import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Eye, Edit2, Trash2, ShieldAlert, CheckCircle, XCircle,
  Download, Filter, Search, Plus, Calendar, DollarSign, Users, Award, ShieldCheck,
  RotateCcw, Send, Settings, Mail, Bell, MessageSquare, PlusCircle, AlertCircle,
  Ticket,
  GraduationCap
} from 'lucide-react';
import {
  approveAdminEvent,
  getAdminAnalytics,
  getAdminAuditLogs,
  getAdminDashboardStats,
  getAdminEvents,
  getAdminNotifications,
  getAdminRegistrations,
  getAdminReports,
  createAdminNotification,
  updateAdminNotification,
  deleteAdminNotification,
  getAdminUsers,
  getAdminOrganizerRequestsApi,
  approveOrganizerRequestApi,
  rejectOrganizerRequestApi,
  markAdminNotificationRead,
  rejectAdminEvent,
  updateAdminUser,
} from '../../services/adminService';

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'ORGANIZER': return 'Organizer';
    case 'ADMIN': return 'Admin';
    case 'STUDENT':
    default: return 'Attendee';
  }
};

const getUserStatusLabel = (user) => (user.is_active ? 'Active' : 'Suspended');

/* ────────────────────────────────────────────────────────
   HELPER MINI CHART COMPONENT
   ──────────────────────────────────────────────────────── */
function MiniChart({ color = '#F5C451', points = [10, 15, 8, 22, 18, 25, 30] }) {
  const width = 80;
  const height = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const xStep = width / (points.length - 1);
  const pathData = points.map((p, i) => {
    const x = i * xStep;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────
   DASHBOARD SUB-PAGES WRAPPER AND INDIVIDUAL TABS
   ──────────────────────────────────────────────────────── */

export function OverviewTab({ setActiveTab, setGlobalToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminDashboardStats();
        if (mounted && response?.success) {
          setStats(response.data);
        } else if (mounted) {
          setError(response?.message || 'Unable to load dashboard stats.');
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load dashboard stats.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = stats
    ? [
        { title: 'Total Users', value: stats.users?.total?.toLocaleString() || '0', trend: '+0.0%', isUp: true, points: [10, 12, 15, 14, 18, 22, 28], icon: Users, color: '#6366F1' },
        { title: 'Total Events', value: stats.events?.total?.toLocaleString() || '0', trend: '+0.0%', isUp: true, points: [5, 6, 8, 7, 10, 12, 15], icon: Calendar, color: '#3B82F6' },
        { title: 'Pending Event Approvals', value: stats.events?.pending?.toLocaleString() || '0', trend: 'Needs review', isUp: false, points: [12, 14, 13, 15, 17, 16, 18], icon: TrendingUp, color: '#10B981' },
        { title: 'Pending Organizers', value: (stats.organizers?.pending ?? 0).toLocaleString(), trend: 'Awaiting review', isUp: false, points: [5, 8, 10, 12, 9, 11, 14], icon: GraduationCap, color: '#F5C451' },
        { title: 'Approved Organizers', value: (stats.organizers?.approved ?? stats.users?.organizers ?? 0).toLocaleString(), trend: 'Verified', isUp: true, points: [15, 20, 25, 30, 35, 40, 45], icon: CheckCircle, color: '#8B5CF6' },
        { title: 'Total Revenue', value: formatCurrency(stats.revenue?.estimated), trend: '+0.0%', isUp: true, points: [20, 25, 32, 45, 58, 70, 84], icon: DollarSign, color: '#F5C451' },
        { title: 'Registrations', value: stats.registrations?.total?.toLocaleString() || '0', trend: '+0.0%', isUp: true, points: [80, 95, 110, 105, 118, 125, 124], icon: Ticket, color: '#14B8A6' },
        { title: 'Unread Notifications', value: stats.notifications?.unread?.toLocaleString() || '0', trend: 'Needs attention', isUp: false, points: [8, 6, 5, 5, 4, 3, 3], icon: ShieldAlert, color: '#EF4444' },
      ]
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
          borderRadius: '24px',
          padding: '40px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
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
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', background: 'rgba(245, 196, 81, 0.2)', color: '#F5C451', alignSelf: 'flex-start', marginBottom: '16px', display: 'inline-block', letterSpacing: '0.05em' }}>
            SUPER ADMIN SESSION
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Overview & Enterprise Control
          </h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            Welcome back. Monitor application performance, approve event organizers, audit payment details, and manage portal parameters.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('approvals')}
              style={{ padding: '10px 18px', background: '#F5C451', color: '#111827', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Pending Approvals <ShieldAlert size={16} />
            </button>
            <button
              onClick={() => setGlobalToast('Generated fresh Excel summary system-wide.')}
              style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Export Global Summary
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading dashboard metrics…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color-light)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {kpi.title}
                  </span>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                    {kpi.value}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: kpi.isUp ? '#10B981' : '#EF4444' }}>
                    {kpi.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{kpi.trend}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: '70px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245, 196, 81, 0.1)', color: '#F5C451' }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <MiniChart color={kpi.color} points={kpi.points} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   ANALYTICS TAB
   ──────────────────────────────────────────────────────── */

export function AnalyticsTab() {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadAnalyticsData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      const [analyticsRes, reportsRes] = await Promise.all([getAdminAnalytics(), getAdminReports()]);
      if (analyticsRes?.success) {
        setAnalytics(analyticsRes.data);
      }
      if (reportsRes?.success) {
        setReports(reportsRes.data);
      }
      if (!analyticsRes?.success && !reportsRes?.success) {
        if (!isSilent) setError('Unable to load analytics data.');
      } else if (!isSilent && (analyticsRes?.success || reportsRes?.success)) {
        setSuccessMessage('Analytics snapshot loaded from the live admin API.');
      }
    } catch (err) {
      if (!isSilent) {
        setError(err?.response?.data?.message || 'Unable to load analytics.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    loadAnalyticsData(false);

    // Auto-refresh analytics every 10 seconds for real-time data synchronization
    const intervalId = setInterval(() => {
      if (mounted) {
        loadAnalyticsData(true);
      }
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const categories = reports?.by_category || [];
  const totalCategoryCount = categories.reduce((sum, item) => sum + Number(item.count || 0), 0);

  const selectedGrowthData = selectedMetric === 'revenue'
    ? (analytics?.revenue_growth || [])
    : selectedMetric === 'registrations'
    ? (analytics?.registration_growth || [])
    : (analytics?.event_growth || analytics?.user_growth || []);

  const chartPoints = selectedGrowthData.map((item) => Number(item.revenue ?? item.registrations ?? item.events ?? item.users ?? item.count ?? item.value ?? item.total ?? 0));
  const chartLabels = selectedGrowthData.map((item) => item.month || 'N/A');

  const numPoints = chartPoints.length;
  const maxRaw = Math.max(...chartPoints, 0);
  const maxPoint = maxRaw === 0 ? 1 : maxRaw;
  const stepWidth = numPoints > 1 ? 460 / (numPoints - 1) : 460;

  let chartPath = 'M 20 160 L 480 160';
  let areaPath = 'M 20 160 L 480 160 L 480 160 L 20 160 Z';
  let pointCoords = [];

  if (numPoints === 1) {
    const singleCy = maxRaw === 0 ? 160 : 160 - (chartPoints[0] / maxPoint) * 120;
    chartPath = `M 20 ${singleCy} L 480 ${singleCy}`;
    areaPath = `M 20 ${singleCy} L 480 ${singleCy} L 480 160 L 20 160 Z`;
    pointCoords = [{ cx: 250, cy: singleCy, value: chartPoints[0] }];
  } else if (numPoints > 1) {
    pointCoords = chartPoints.map((value, index) => {
      const cx = index * stepWidth + 20;
      const cy = maxRaw === 0 ? 160 : 160 - (value / maxPoint) * 120;
      return { cx, cy, value };
    });
    chartPath = pointCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.cx} ${c.cy}`).join(' ');
    const lastX = (numPoints - 1) * stepWidth + 20;
    areaPath = `${chartPath} L ${lastX} 160 L 20 160 Z`;
  }

  const registrationRate = analytics?.registrations_by_status
    ? (Number(analytics.registrations_by_status.CONFIRMED || 0) / Math.max(Number(Object.values(analytics.registrations_by_status).reduce((sum, value) => sum + Number(value || 0), 0)), 1)) * 100
    : 0;

  const summaryData = analytics?.summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Analytics Overview</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Live telemetry from the Django admin APIs</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color-light)' }}>
          {['revenue', 'registrations', 'growth'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: selectedMetric === m ? '#F5C451' : 'transparent',
                color: selectedMetric === m ? '#111827' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '12px'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {successMessage && !error && (
        <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', border: '1.5px solid #DCFCE7', fontWeight: '600', fontSize: '14px' }}>
          {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading analytics…</div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Events</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0' }}>{(summaryData.total_events ?? 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Students</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0' }}>{(summaryData.total_students ?? 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Organizers</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0' }}>{(summaryData.total_organizers ?? 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Registrations</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0' }}>{(summaryData.total_registrations ?? 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 0 0', color: '#10B981' }}>{formatCurrency(summaryData.total_revenue ?? 0)}</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="analytics-grid">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
                {selectedMetric === 'revenue' && 'Monthly Platform Revenue ($)'}
                {selectedMetric === 'registrations' && 'Monthly Participant Registrations'}
                {selectedMetric === 'growth' && 'New Event Post Growth'}
              </h3>
              <div style={{ height: '300px', position: 'relative', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 0' }}>
                <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5C451" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F5C451" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border-color-light)" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color-light)" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="160" x2="500" y2="160" stroke="var(--border-color-light)" strokeWidth="1" strokeDasharray="5,5" />
                  <path d={areaPath} fill="url(#chartGrad)" />
                  <path d={chartPath} fill="none" stroke="#F5C451" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {pointCoords.map((pt, index) => (
                    <circle key={index} cx={pt.cx} cy={pt.cy} r={numPoints === 1 ? '6' : '5'} fill="#111827" stroke="#F5C451" strokeWidth="2.5" />
                  ))}
                </svg>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', padding: '0 10px' }}>
                  {chartLabels.length > 0 ? (
                    chartLabels.map((label, index) => (
                      <span key={index}>{label}</span>
                    ))
                  ) : (
                    <span>No timeline data available</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Top Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {categories.length > 0 ? categories.map((cat, idx) => {
                  const value = totalCategoryCount ? Math.round((Number(cat.count || 0) / totalCategoryCount) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                        <span>{cat.category}</span>
                        <span>{value}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--border-color-light)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${value}%`, height: '100%', background: idx % 2 === 0 ? '#6366F1' : '#10B981', borderRadius: '999px' }} />
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No category data available.</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="analytics-grid">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Recent Activity Feed</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(analytics?.recent_activity || []).length > 0 ? (
                  (analytics.recent_activity || []).map((act, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'var(--bg-dashboard)', border: '1px solid var(--border-color-light)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px' }}>{act.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{act.description}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent activity recorded.</div>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Event Attendance Ratio</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color-light)" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeDasharray={`${registrationRate}, 100`} strokeWidth="4" />
                </svg>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '800' }}>{registrationRate.toFixed(1)}%</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Confirmed registrations compared with current audit volume.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   USERS TAB
   ──────────────────────────────────────────────────────── */

export function UsersTab({ setGlobalToast }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminUsers();
        if (mounted) {
          if (response?.success) {
            setUsers((response.data || []).map((user) => ({
              id: user.id,
              name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
              email: user.email,
              role: user.role === 'ORGANIZER' ? 'Organizer' : user.role === 'ADMIN' ? 'Admin' : 'Attendee',
              roleValue: user.role,
              status: user.is_active ? 'Active' : 'Suspended',
              joined: new Date(user.date_joined).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
              avatar: '',
              is_active: user.is_active,
            })));
          } else {
            setError(response?.message || 'Failed to load users.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load users.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleUserStatus = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    try {
      const nextStatus = !target.is_active;
      const response = await updateAdminUser(id, { is_active: nextStatus });
      if (response?.success || response?.id) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: nextStatus, status: nextStatus ? 'Active' : 'Suspended' } : u)));
        setGlobalToast(`User ${target.name} is now ${nextStatus ? 'Active' : 'Suspended'}.`);
      } else {
        setGlobalToast(response?.message || 'Unable to update user status.');
      }
    } catch (err) {
      setGlobalToast(err?.response?.data?.message || 'Unable to update user status.');
    }
  };

  const deleteUser = (id) => {
    const userToDelete = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (userToDelete) {
      setGlobalToast(`Removed local user account record: ${userToDelete.name}`);
    }
  };

  const filtered = users.filter((u) => {
    const searchText = `${u.name} ${u.email}`.toLowerCase();
    const matchSearch = searchText.includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.roleValue === (roleFilter === 'Organizer' ? 'ORGANIZER' : roleFilter === 'Admin' ? 'ADMIN' : 'STUDENT');
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>User Management</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage roles, credentials, and access authorizations</p>
        </div>
        <button
          onClick={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users));
            const dl = document.createElement('a');
            dl.setAttribute('href', dataStr);
            dl.setAttribute('download', 'users_export.json');
            dl.click();
            setGlobalToast('Successfully downloaded user metadata.');
          }}
          style={{ padding: '8px 16px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', color: '#111827' }}
        >
          <Download size={16} /> Export JSON
        </button>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color-light)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'transparent', border: '1px solid var(--border-color-light)', borderRadius: '10px', outline: 'none', color: 'var(--text)' }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color-light)', background: 'var(--bg-card)', color: 'var(--text)', outline: 'none' }}
        >
          <option value="All">All Roles</option>
          <option value="Organizer">Organizer</option>
          <option value="Admin">Admin</option>
          <option value="Attendee">Attendee</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color-light)', background: 'var(--bg-card)', color: 'var(--text)', outline: 'none' }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading users…</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(245,196,81,0.03)', borderBottom: '1px solid var(--border-color-light)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>USER</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>ROLE</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>STATUS</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>JOINED DATE</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', background: 'rgba(245,196,81,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#F5C451' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{user.role}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: user.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                        color: user.status === 'Active' ? '#15803D' : '#EF4444'
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{user.joined}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'transparent',
                          border: '1px solid var(--border-color-light)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: user.status === 'Active' ? '#EF4444' : '#10B981',
                          cursor: 'pointer'
                        }}
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        style={{ padding: '6px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                        title="Remove from view"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   ORGANIZERS TAB
   ──────────────────────────────────────────────────────── */

export function OrganizersTab({ setGlobalToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('PENDING'); // PENDING by default

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminOrganizerRequestsApi(filter);
      if (data && data.success) {
        setRequests(data.data || []);
      } else {
        setError(data?.message || 'Failed to fetch organizer requests.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading organizer requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      const res = await approveOrganizerRequestApi(id);
      if (res && res.success) {
        setGlobalToast('Organizer application approved successfully!');
        fetchRequests(); // Refresh list automatically
      } else {
        setGlobalToast(res?.message || 'Approval failed.');
      }
    } catch (err) {
      console.error(err);
      setGlobalToast(err.response?.data?.message || err.message || 'An error occurred during approval.');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectOrganizerRequestApi(id);
      if (res && res.success) {
        setGlobalToast('Organizer application rejected successfully.');
        fetchRequests(); // Refresh list automatically
      } else {
        setGlobalToast(res?.message || 'Rejection failed.');
      }
    } catch (err) {
      console.error(err);
      setGlobalToast(err.response?.data?.message || err.message || 'An error occurred during rejection.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Organizer Requests Center</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Review, approve, or reject applications from students requesting organizer privileges.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color-light)' }}>
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setFilter(statusOption)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: filter === statusOption ? '#F5C451' : 'transparent',
                color: filter === statusOption ? '#111827' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
            >
              {statusOption === 'ALL' ? 'All Applications' : statusOption}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontWeight: '600' }}>Loading organizer requests...</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(245,196,81,0.03)', borderBottom: '1px solid var(--border-color-light)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>NAME</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>EMAIL</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>PHONE NUMBER</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>APPLIED DATE</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>CURRENT STATUS</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>
                    {req.first_name} {req.last_name}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{req.email}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{req.phone_number || 'N/A'}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    {new Date(req.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: req.organizer_status === 'APPROVED' ? '#DCFCE7' : req.organizer_status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                        color: req.organizer_status === 'APPROVED' ? '#15803D' : req.organizer_status === 'REJECTED' ? '#EF4444' : '#B45309',
                      }}
                    >
                      {req.organizer_status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    {req.organizer_status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#F5C451',
                            color: '#111827',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#FEE2E2',
                            color: '#EF4444',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Decision Recorded</span>
                    )}
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No organizer requests found for filter: "{filter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   EVENTS & APPROVALS TAB
   ──────────────────────────────────────────────────────── */

export function EventsTab({ setGlobalToast }) {
  const [events, setEvents] = useState([]);
  const [filterCat, setFilterCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminEvents({ status: 'ALL' });
        if (mounted) {
          if (response?.success) {
            setEvents((response.data || []).map((event) => {
              const rawStatus = String(event.status || 'PENDING').toUpperCase();
              const statusDisplay = rawStatus === 'APPROVED' ? 'Approved' : rawStatus === 'PENDING' ? 'Pending' : rawStatus === 'REJECTED' ? 'Rejected' : rawStatus === 'CANCELLED' ? 'Cancelled' : rawStatus === 'COMPLETED' ? 'Completed' : rawStatus;
              return {
                id: event.id,
                title: event.title || 'Untitled Event',
                category: event.category || 'General',
                organizer: event.organizer_name || event.organizer_email || 'Unknown',
                location: event.venue || 'TBA',
                participants: event.registrations_count ?? 0,
                capacity: event.max_participants ?? 200,
                date: event.start_datetime ? new Date(event.start_datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBA',
                status: statusDisplay,
                rawStatus: rawStatus,
                revenue: Number(event.price || event.ticket_price || 0),
                featured: false,
                thumbnail: event.banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80',
              };
            }));
          } else {
            setError(response?.message || 'Unable to load events.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load events.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFeatured = (id) => {
    setEvents((prev) => prev.map((ev) => {
      if (ev.id === id) {
        const toggle = !ev.featured;
        setGlobalToast(`Event "${ev.title}" is now ${toggle ? 'Featured' : 'Standard'}`);
        return { ...ev, featured: toggle };
      }
      return ev;
    }));
  };

  const cancelEvent = (id) => {
    setEvents((prev) => prev.map((ev) => {
      if (ev.id === id) {
        setGlobalToast(`Cancelled event: ${ev.title}`);
        return { ...ev, status: 'Cancelled' };
      }
      return ev;
    }));
  };

  const duplicateEvent = (id) => {
    const eventToDuplicate = events.find((ev) => ev.id === id);
    if (eventToDuplicate) {
      const duplicated = {
        ...eventToDuplicate,
        id: Date.now(),
        title: `${eventToDuplicate.title} (Clone)`,
        participants: 0,
        status: 'Draft',
        revenue: 0,
      };
      setEvents((prev) => [duplicated, ...prev]);
      setGlobalToast(`Duplicated: ${eventToDuplicate.title}`);
    }
  };

  const filtered = filterCat === 'All' ? events : events.filter((e) => e.category === filterCat);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Event Directory</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Review schedules, participant list metrics, and payouts</p>
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color-light)', background: 'var(--bg-card)', color: 'var(--text)', outline: 'none' }}
        >
          <option value="All">All Categories</option>
          {[...new Set(events.map((ev) => ev.category))].filter(Boolean).map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading events…</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(245,196,81,0.03)', borderBottom: '1px solid var(--border-color-light)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>EVENT DETAILS</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>ORGANIZER</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>LOCATION</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>TICKETS SOLD</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>STATUS</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>REVENUE</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={ev.thumbnail} alt="thumb" style={{ width: '48px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {ev.title}
                        {ev.featured && <span style={{ background: '#FFFDF0', border: '1px solid rgba(245,196,81,0.4)', color: '#F5C451', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: '800' }}>FEATURED</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.category} &bull; {ev.date}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{ev.organizer}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{ev.location}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{ev.participants} / {ev.capacity}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: (ev.status === 'Approved' || ev.status === 'Active') ? '#DCFCE7' : ev.status === 'Completed' ? '#F1F5F9' : ev.status === 'Pending' ? '#FEF3C7' : '#FEE2E2',
                        color: (ev.status === 'Approved' || ev.status === 'Active') ? '#15803D' : ev.status === 'Completed' ? '#475569' : ev.status === 'Pending' ? '#B45309' : '#EF4444'
                      }}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: '#10B981' }}>${ev.revenue.toLocaleString()}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleFeatured(ev.id)}
                        style={{ padding: '6px 10px', border: '1px solid var(--border-color-light)', background: 'transparent', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        {ev.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => duplicateEvent(ev.id)}
                        style={{ padding: '6px 10px', border: '1px solid var(--border-color-light)', background: 'transparent', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        Duplicate
                      </button>
                      {(ev.status === 'Approved' || ev.status === 'Active') && (
                        <button
                          onClick={() => cancelEvent(ev.id)}
                          style={{ padding: '6px 10px', border: '1px solid #FEE2E2', background: '#FEF2F2', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#EF4444' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   PENDING APPROVALS TAB
   ──────────────────────────────────────────────────────── */

export function ApprovalsTab({ setGlobalToast }) {
  const [stats, setStats] = useState(null);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [eventApprovals, setEventApprovals] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subTab, setSubTab] = useState('ALL'); // 'ALL', 'ORGANIZERS', 'EVENTS'

  const fetchApprovalsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, orgRes, eventRes] = await Promise.all([
        getAdminDashboardStats().catch(() => null),
        getAdminOrganizerRequestsApi('PENDING').catch(() => null),
        getAdminEvents({ status: 'PENDING' }).catch(() => null),
      ]);

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (orgRes && orgRes.success) {
        setOrganizerRequests(orgRes.data || []);
      }

      if (eventRes && eventRes.success) {
        setEventApprovals(
          (eventRes.data || [])
            .filter((event) => String(event.status || '').toUpperCase() === 'PENDING')
            .map((event) => ({
              id: event.id,
              title: event.title || 'Untitled Event',
              organizer: event.organizer_name || event.organizer_email || 'Unknown',
              category: event.category || 'General',
              capacity: 200,
              proposedDate: event.start_datetime ? new Date(event.start_datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA',
              price: event.is_paid ? formatCurrency(event.price || event.ticket_price || 0) : 'Free',
              notes: event.rejection_reason || 'Awaiting admin review for listing approval.',
            }))
        );
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading the approvals center data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsData();
  }, []);

  const handleOrganizerAction = async (id, action) => {
    try {
      const res = action === 'approve' 
        ? await approveOrganizerRequestApi(id)
        : await rejectOrganizerRequestApi(id);
      
      if (res && res.success) {
        setGlobalToast(`Organizer application has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        fetchApprovalsData();
      } else {
        setGlobalToast(res?.message || `Failed to ${action} organizer application.`);
      }
    } catch (err) {
      console.error(err);
      setGlobalToast(err?.response?.data?.message || `Error executing organizer action.`);
    }
  };

  const handleEventAction = async (id, action) => {
    try {
      const response = action === 'Approved'
        ? await approveAdminEvent(id, comments[id] || '')
        : await rejectAdminEvent(id, comments[id] || '');

      if (response?.success) {
        setGlobalToast(`Event listing application has been successfully ${action.toLowerCase()}.`);
        fetchApprovalsData();
      } else {
        setGlobalToast(response?.message || `Unable to ${action.toLowerCase()} event.`);
      }
    } catch (err) {
      console.error(err);
      setGlobalToast(err?.response?.data?.message || `Unable to ${action.toLowerCase()} event.`);
    }
  };

  const pendingOrgCount = stats?.organizers?.pending ?? organizerRequests.length;
  const approvedOrgCount = stats?.organizers?.approved ?? 0;
  const rejectedOrgCount = stats?.organizers?.rejected ?? 0;
  const pendingEventCount = stats?.events?.pending ?? eventApprovals.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Pending Approvals Center</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Live administrative queue for verifying teacher/organizer applications and reviewing event listings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color-light)' }}>
          {[
            { id: 'ALL', label: 'All Pending' },
            { id: 'ORGANIZERS', label: `Organizers (${pendingOrgCount})` },
            { id: 'EVENTS', label: `Event Listings (${pendingEventCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: subTab === tab.id ? '#F5C451' : 'transparent',
                color: subTab === tab.id ? '#111827' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 20px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Real-time Approval Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending Organizers
          </span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '6px 0 0 0', color: '#F5C451' }}>
            {loading ? '...' : pendingOrgCount.toLocaleString()}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Awaiting verification</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Approved Organizers
          </span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '6px 0 0 0', color: '#10B981' }}>
            {loading ? '...' : approvedOrgCount.toLocaleString()}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Active organizers</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Rejected Organizers
          </span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '6px 0 0 0', color: '#EF4444' }}>
            {loading ? '...' : rejectedOrgCount.toLocaleString()}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Declined applications</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending Events
          </span>
          <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '6px 0 0 0', color: '#3B82F6' }}>
            {loading ? '...' : pendingEventCount.toLocaleString()}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Listings needing audit</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color-light)' }}>
          Loading approval queue & live statistics…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* SECTION 1: ORGANIZER REGISTRATION REQUESTS */}
          {(subTab === 'ALL' || subTab === 'ORGANIZERS') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={20} style={{ color: '#F5C451' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Organizer Registration Applications ({organizerRequests.length})
                </h3>
              </div>

              {organizerRequests.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color-light)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No pending organizer applications awaiting review.
                </div>
              ) : (
                organizerRequests.map((req) => (
                  <div key={req.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,196,81,0.15)', color: '#F5C451' }}>ORGANIZER REQUEST</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date Joined: {formatDate(req.date_joined)}</span>
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '8px 0 4px 0' }}>
                          {req.first_name || req.last_name ? `${req.first_name || ''} ${req.last_name || ''}`.trim() : req.email}
                        </h4>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Email: <strong>{req.email}</strong> {req.phone_number ? `• Phone: ${req.phone_number}` : ''}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOrganizerAction(req.id, 'approve')}
                          style={{ padding: '8px 16px', background: '#F5C451', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Approve Application
                        </button>
                        <button
                          onClick={() => handleOrganizerAction(req.id, 'reject')}
                          style={{ padding: '8px 16px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SECTION 2: EVENT APPROVAL LISTINGS */}
          {(subTab === 'ALL' || subTab === 'EVENTS') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} style={{ color: '#3B82F6' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Pending Event Listing Applications ({eventApprovals.length})
                </h3>
              </div>

              {eventApprovals.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color-light)', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No pending event listings awaiting review.
                </div>
              ) : (
                eventApprovals.map((ap) => (
                  <div key={ap.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'inline-block' }}>{ap.category}</span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '8px 0 4px 0' }}>{ap.title}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Submitted by: <strong>{ap.organizer}</strong> &bull; Proposed: {ap.proposedDate}</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#10B981' }}>Price: {ap.price}</div>
                    </div>

                    <div style={{ padding: '16px', background: 'var(--bg-dashboard)', borderRadius: '12px', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                      <strong>Organizer Notes:</strong> {ap.notes}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>Admin Decision Comments</span>
                      <textarea
                        placeholder="Enter feedback for approval or change requests..."
                        value={comments[ap.id] || ''}
                        onChange={(e) => setComments({ ...comments, [ap.id]: e.target.value })}
                        style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color-light)', background: 'var(--bg-card)', color: 'var(--text)', outline: 'none', resize: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEventAction(ap.id, 'Approved')}
                        style={{ padding: '10px 20px', background: '#F5C451', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Approve Listing
                      </button>
                      <button
                        onClick={() => handleEventAction(ap.id, 'Rejected')}
                        style={{ padding: '10px 20px', background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Reject Listing
                      </button>
                      <button
                        onClick={() => {
                          setGlobalToast(`Request for changes submitted with comment: "${comments[ap.id] || ''}"`);
                          setEventApprovals((prev) => prev.filter((a) => a.id !== ap.id));
                        }}
                        style={{ padding: '10px 20px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   REGISTRATIONS TAB
   ──────────────────────────────────────────────────────── */

export function RegistrationsTab({ setGlobalToast }) {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadRegistrations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminRegistrations();
        if (mounted) {
          if (response?.success) {
            setRegistrations((response.data || []).map((registration) => ({
              id: registration.id,
              event: registration.event_title || 'Unknown event',
              name: registration.participant_name || registration.participant_email || 'Unknown participant',
              ticket: registration.ticket_type || 'Standard',
              qr: registration.qr_status || 'Pending',
              refund: registration.payment_status || 'Pending',
              status: registration.status || 'PENDING',
            })));
          } else {
            setError(response?.message || 'Unable to load registrations.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load registrations.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRegistrations();
    return () => {
      mounted = false;
    };
  }, []);

  const processRefund = (id) => {
    setRegistrations((prev) => prev.map((reg) => {
      if (reg.id === id) {
        setGlobalToast(`Refunded registration ticket ${id}`);
        return { ...reg, status: 'REFUNDED', refund: 'Completed' };
      }
      return reg;
    }));
  };

  const filtered = registrations.filter((r) => `${r.name} ${r.event}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Registrations Audit</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Validate QR tickets and manage cancellation refunds</p>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search attendees or events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '10px', outline: 'none', color: 'var(--text)' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading registrations…</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(245,196,81,0.03)', borderBottom: '1px solid var(--border-color-light)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>EVENT</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>PARTICIPANT</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>TICKET TYPE</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>QR STATUS</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>REFUND</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>{reg.id}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{reg.event}</td>
                  <td style={{ padding: '16px 20px' }}>{reg.name}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{reg.ticket}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: reg.qr === 'Scanned' ? '#DCFCE7' : reg.qr === 'Pending' ? '#FEF3C7' : '#F1F5F9',
                        color: reg.qr === 'Scanned' ? '#15803D' : reg.qr === 'Pending' ? '#B45309' : '#475569'
                      }}
                    >
                      {reg.qr}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{reg.refund}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    {reg.status !== 'REFUNDED' && (
                      <button
                        onClick={() => processRefund(reg.id)}
                        style={{ padding: '6px 12px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', color: '#EF4444', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Trigger Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   PAYMENTS & REVENUE TAB
   ──────────────────────────────────────────────────────── */

export function PaymentsTab({ setGlobalToast }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, volume: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        const [statsRes, registrationsRes] = await Promise.all([getAdminDashboardStats(), getAdminRegistrations()]);
        if (mounted) {
          if (statsRes?.success || registrationsRes?.success) {
            const revenue = Number(statsRes?.data?.revenue?.estimated || 0);
            const regs = registrationsRes?.data || [];
            const mappedTransactions = regs.map((registration, index) => ({
              id: index + 1,
              name: registration.participant_name || registration.participant_email || 'Unknown participant',
              email: registration.participant_email || 'n/a',
              amount: Number(registration.amount || registration.event_price || 0),
              type: registration.ticket_type || 'Ticket',
              status: String(registration.payment_status || registration.status || 'PENDING').toUpperCase(),
              date: registration.registration_date ? new Date(registration.registration_date).toLocaleString() : 'Pending',
            }));
            const failedAmount = mappedTransactions.filter((tx) => tx.status === 'FAILED').reduce((sum, tx) => sum + tx.amount, 0);
            setTransactions(mappedTransactions);
            setSummary({
              balance: Math.max(revenue - failedAmount, 0),
              volume: revenue,
              failed: failedAmount,
            });
            setSuccessMessage('Payment activity loaded from the live registration and dashboard APIs.');
          } else {
            setError(statsRes?.message || registrationsRes?.message || 'Unable to load payments.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load payments.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPayments();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Payments & Reconciliation</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Review transaction history and merchant gateway logs</p>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {successMessage && !error && (
        <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', border: '1.5px solid #DCFCE7', fontWeight: '600', fontSize: '14px' }}>
          {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payments…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Stripe Balance</span>
              <div style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0', color: '#10B981' }}>${summary.balance.toFixed(2)}</div>
              <span style={{ fontSize: '11px', color: '#10B981' }}>Available for payout</span>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Sales (Volume)</span>
              <div style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0' }}>${summary.volume.toFixed(2)}</div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across live registrations</span>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Failed Transactions</span>
              <div style={{ fontSize: '28px', fontWeight: '800', margin: '8px 0', color: '#EF4444' }}>${summary.failed.toFixed(2)}</div>
              <span style={{ fontSize: '11px', color: '#EF4444' }}>Projected review queue</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Real-time Gateway Log</h3>
            {transactions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-dashboard)', borderRadius: '12px' }}>
                No payment transactions are available from the backend yet.
              </div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(245,196,81,0.03)', borderBottom: '1px solid var(--border-color-light)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>ID</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>PARTICIPANT</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>AMOUNT</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>TYPE</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} style={{ borderBottom: '1px solid var(--border-color-light)', fontSize: '13px' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700' }}>{txn.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{txn.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{txn.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>${txn.amount.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>{txn.type}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: txn.status === 'COMPLETED' ? '#DCFCE7' : txn.status === 'FAILED' ? '#FEE2E2' : '#F1F5F9',
                          color: txn.status === 'COMPLETED' ? '#15803D' : txn.status === 'FAILED' ? '#EF4444' : '#475569'
                        }}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   CATEGORIES TAB
   ──────────────────────────────────────────────────────── */

export function CategoriesTab({ setGlobalToast }) {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminReports();
        if (mounted) {
          if (response?.success) {
            setCategories((response.data?.by_category || []).map((item, index) => ({
              id: index + 1,
              name: item.category || 'General',
              count: Number(item.count || 0),
              description: `${item.category || 'General'} is being tracked in the current reporting dataset.`,
            })));
          } else {
            setError(response?.message || 'Unable to load categories.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load categories.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const addCategory = (e) => {
    e.preventDefault();
    if (!newName) return;
    const cat = {
      id: Date.now(),
      name: newName,
      count: 0,
      description: newDesc || 'Added through the admin dashboard.'
    };
    setCategories([...categories, cat]);
    setGlobalToast(`Added new category: ${newName}`);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }} className="analytics-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Event Categories</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Configure portal tags and navigation taxonomies</p>
        </div>

        {error && (
          <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading categories…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>{cat.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.description}</p>
                </div>
                <span style={{ background: 'rgba(245,196,81,0.1)', color: '#F5C451', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                  {cat.count} Events
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Create Category</h3>
        <form onSubmit={addCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Category Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Health & Wellness"
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'transparent', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Configure category scope..."
              style={{ width: '100%', height: '80px', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'transparent', color: 'var(--text)', outline: 'none', resize: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 18px', background: '#F5C451', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Create Category <PlusCircle size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   REPORTS TAB
   ──────────────────────────────────────────────────────── */

export function ReportsTab({ setGlobalToast }) {
  const [reportType, setReportType] = useState('users');
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        const response = await getAdminReports();
        if (mounted) {
          if (response?.success) {
            setReports(response.data);
            setSuccessMessage('Reports snapshot loaded from the live admin API.');
          } else {
            setError(response?.message || 'Unable to load reports.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load reports.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReports();
    return () => {
      mounted = false;
    };
  }, []);

  const downloadReport = (format) => {
    const totalRecords = reports?.summary
      ? Object.values(reports.summary).reduce((sum, value) => sum + Number(value || 0), 0)
      : 0;
    setGlobalToast(`Generated ${reportType.toUpperCase()} report with ${totalRecords} records in ${format.toUpperCase()} format.`);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>Report Generator Engine</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 28px 0' }}>Extract database records and build consolidated telemetry reports</p>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {successMessage && !error && (
        <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', border: '1.5px solid #DCFCE7', fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>
          {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reports…</div>
      ) : reports?.summary ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { id: 'users', label: 'User Registration Base', desc: 'Metadata on join dates, roles, status.' },
              { id: 'events', label: 'Event Occupancy & Payouts', desc: 'Capacity details, ticket metrics.' },
              { id: 'revenue', label: 'Platform Financial Ledgers', desc: 'Gross volume, transaction audits.' },
              { id: 'attendance', label: 'QR Scan Redeemed Passes', desc: 'Telemetry of checked-in tickets.' }
            ].map((rep) => (
              <div
                key={rep.id}
                onClick={() => setReportType(rep.id)}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: `2px solid ${reportType === rep.id ? '#F5C451' : 'var(--border-color-light)'}`,
                  background: reportType === rep.id ? 'rgba(245,196,81,0.02)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '800' }}>{rep.label}</h4>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{rep.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color-light)', paddingTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={() => downloadReport('pdf')} style={{ padding: '10px 18px', background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Download PDF <Download size={16} />
            </button>
            <button onClick={() => downloadReport('csv')} style={{ padding: '10px 18px', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Download CSV <Download size={16} />
            </button>
            <button onClick={() => downloadReport('excel')} style={{ padding: '10px 18px', background: '#F5C451', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Download Excel <Download size={16} />
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-dashboard)', borderRadius: '16px' }}>
          No report summary data is available from the backend yet.
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   NOTIFICATIONS TAB
   ──────────────────────────────────────────────────────── */

export function NotificationsTab({ setGlobalToast }) {
  const [channel, setChannel] = useState('email');
  const [template, setTemplate] = useState('welcome');
  const [customMsg, setCustomMsg] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAdminNotifications({ unread_only: false });
      if (response?.success) {
        setNotifications(response.data || []);
      } else {
        setError(response?.message || 'Unable to load notifications.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await loadNotifications();
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      const messages = Object.values(data.errors).flat().filter(Boolean);
      return messages[0] || 'Unable to save notification.';
    }
    return 'Unable to save notification.';
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    const trimmedMessage = customMsg.trim();

    if (!trimmedMessage) {
      setError('Please enter a message before saving the notification.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        title: `${channel.toUpperCase()} / ${template.toUpperCase()}`,
        message: trimmedMessage,
        notification_type: 'GENERAL',
      };

      const response = editingNotificationId
        ? await updateAdminNotification(editingNotificationId, payload)
        : await createAdminNotification(payload);

      if (response?.success) {
        setSuccessMessage(editingNotificationId ? 'Notification updated successfully.' : 'Notification created successfully.');
        setGlobalToast(editingNotificationId ? 'Updated notification in the backend.' : 'Created notification in the backend.');
        setCustomMsg('');
        setChannel('email');
        setTemplate('welcome');
        setEditingNotificationId(null);
        await loadNotifications();
      } else {
        setError(response?.message || 'Unable to save notification.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await markAdminNotificationRead(id);
      if (response?.success) {
        setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
        setSuccessMessage('Notification marked as read.');
      } else {
        setGlobalToast(response?.message || 'Unable to mark notification as read.');
      }
    } catch (err) {
      setGlobalToast(err?.response?.data?.message || 'Unable to mark notification as read.');
    }
  };

  const startEditing = (item) => {
    setEditingNotificationId(item.id);
    setCustomMsg(item.message || '');
    setChannel('email');
    setTemplate('welcome');
    setError('');
    setSuccessMessage('Editing existing notification.');
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const response = await deleteAdminNotification(deleteConfirmId);
      if (response?.success) {
        setSuccessMessage('Notification deleted successfully.');
        setGlobalToast('Deleted notification from the backend.');
        setDeleteConfirmId(null);
        await loadNotifications();
      } else {
        setError(response?.message || 'Unable to delete notification.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px' }} className="analytics-grid">
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Campaign Channels</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'email', label: 'E-Mail Dispatch', icon: Mail, desc: 'Deliver custom layouts and dynamic summaries.' },
            { id: 'push', label: 'Browser Push Alerts', icon: Bell, desc: 'Desktop alert systems and badge indicators.' },
            { id: 'sms', label: 'SMS Carrier Texting', icon: MessageSquare, desc: 'Direct mobile alerts using standard templates.' },
          ].map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${channel === ch.id ? '#F5C451' : 'var(--border-color-light)'}`,
                  background: channel === ch.id ? 'rgba(245,196,81,0.02)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ color: channel === ch.id ? '#F5C451' : 'var(--text-secondary)' }}><Icon size={20} /></div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '800' }}>{ch.label}</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>{ch.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>{editingNotificationId ? 'Update Notification' : 'Compose Broadcast Campaign'}</h3>
          {error && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px', marginBottom: '14px' }}>
              {error}
            </div>
          )}
          {successMessage && !error && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', border: '1.5px solid #DCFCE7', fontWeight: '600', fontSize: '14px', marginBottom: '14px' }}>
              {successMessage}
            </div>
          )}
          <form onSubmit={sendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Target Audience</label>
              <select style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text)', outline: 'none' }}>
                <option>All Platform Registered Users</option>
                <option>Only Event Organizers</option>
                <option>Only Active Attendees</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Layout Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text)', outline: 'none' }}
              >
                <option value="welcome">Welcome Onboarding Digest</option>
                <option value="policy">System Policy & Terms Revisions</option>
                <option value="maintenance">Scheduled Portal Outage Alerts</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Custom Override Message</label>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Provide context overlay to target audience..."
                style={{ width: '100%', height: '80px', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'transparent', color: 'var(--text)', outline: 'none', resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" disabled={submitting} style={{ padding: '12px', background: '#F5C451', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: submitting ? 0.7 : 1 }}>
                {editingNotificationId ? 'Update Notification' : 'Broadcast Dispatch'} <Send size={16} />
              </button>
              {editingNotificationId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNotificationId(null);
                    setCustomMsg('');
                    setChannel('email');
                    setTemplate('welcome');
                    setError('');
                    setSuccessMessage('Create mode restored.');
                  }}
                  style={{ padding: '12px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color-light)', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Recent Notification Feed</h3>
          {deleteConfirmId && (
            <div style={{ marginBottom: '12px', padding: '12px 14px', borderRadius: '12px', background: '#FEF2F2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span>Delete this notification permanently?</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={confirmDelete} style={{ padding: '6px 10px', borderRadius: '8px', background: '#EF4444', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Confirm</button>
                <button type="button" onClick={() => setDeleteConfirmId(null)} style={{ padding: '6px 10px', borderRadius: '8px', background: 'transparent', color: '#475569', border: '1px solid var(--border-color-light)', cursor: 'pointer', fontWeight: '700' }}>Cancel</button>
              </div>
            </div>
          )}
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading notifications…</div>
          ) : notifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map((item) => (
                <div key={item.id} style={{ padding: '12px', border: '1px solid var(--border-color-light)', borderRadius: '10px', background: item.is_read ? 'transparent' : 'rgba(245,196,81,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>{item.title || 'Admin notification'}</strong>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEditing(item)} style={{ padding: '4px 8px', borderRadius: '999px', border: '1px solid var(--border-color-light)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                        <Edit2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirmId(item.id)} style={{ padding: '4px 8px', borderRadius: '999px', border: '1px solid var(--border-color-light)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                        <Trash2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Delete
                      </button>
                      {!item.is_read && (
                        <button onClick={() => markAsRead(item.id)} style={{ padding: '4px 8px', borderRadius: '999px', border: '1px solid var(--border-color-light)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>{item.message || item.body}</p>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>No notifications available right now.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   AUDIT LOGS TAB
   ──────────────────────────────────────────────────────── */

export function AuditLogsTab() {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadLogs = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        const response = await getAdminAuditLogs();
        if (mounted) {
          if (response?.success) {
            setAuditData((response.data || []).map((log, index) => ({
              id: index + 1,
              action: log.action || 'ADMIN_ACTION',
              desc: log.description || log.details || log.object_repr || 'No additional details.',
              relatedEntity: log.related_entity || log.object_repr || 'System',
              admin: log.actor || 'System',
              time: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A',
            })));
            setSuccessMessage('Audit logs fetched from the live backend.');
          } else {
            setError(response?.message || 'Unable to load audit logs.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load audit logs.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLogs();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>System Audit Logs</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Security records of administrative updates and token usage logs</p>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {successMessage && !error && (
        <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', border: '1.5px solid #DCFCE7', fontWeight: '600', fontSize: '14px' }}>
          {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading audit logs…</div>
      ) : auditData.length > 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(245,196,81,0.03)', borderBottom: '1px solid var(--border-color-light)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>ACTION</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>DESCRIPTION</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>RELATED ENTITY</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>OPERATOR</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {auditData.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>#{log.id}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-dashboard)', color: '#F5C451', border: '1px solid var(--border-color-light)' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.desc}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>{log.relatedEntity}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{log.admin}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-dashboard)', borderRadius: '16px' }}>
          No audit log entries are available yet.
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   SETTINGS TAB
   ──────────────────────────────────────────────────────── */

export function SettingsTab({ setGlobalToast }) {
  const [gatewayStatus, setGatewayStatus] = useState('Sandbox');
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        const response = await getAdminDashboardStats();
        if (mounted) {
          if (response?.success) {
            setSettingsData(response.data);
            setSuccessMessage('Platform settings snapshot loaded from the live backend.');
          } else {
            setError(response?.message || 'Unable to load settings overview.');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.response?.data?.message || 'Unable to load settings overview.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }} className="analytics-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Gateway & Payout Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Stripe Sandbox Secret Key</label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••••••••••••••••••"
                disabled
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'var(--bg-dashboard)', color: 'var(--text-secondary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Webhook Listener Endpoint</label>
              <input
                type="text"
                value="https://api.compilvision.com/v1/stripe/webhooks"
                disabled
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'var(--bg-dashboard)', color: 'var(--text-secondary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Gateway Environment Mode</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Sandbox', 'Live Production'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setGatewayStatus(mode);
                      setGlobalToast(`Switched gateway parameters to ${mode}`);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${gatewayStatus === mode ? '#F5C451' : 'var(--border-color-light)'}`,
                      background: gatewayStatus === mode ? 'rgba(245,196,81,0.05)' : 'transparent',
                      color: gatewayStatus === mode ? '#F5C451' : 'var(--text-secondary)',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Permissions System</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { role: 'Administrator', access: 'Full Write/Read permissions to financials and category routing.' },
              { role: 'Teacher Manager', access: 'Review verification documents and audit organizers.' },
              { role: 'Standard Moderator', access: 'Modify details, block comments, and request changes.' }
            ].map((p, idx) => (
              <div key={idx} style={{ padding: '12px', border: '1px solid var(--border-color-light)', borderRadius: '10px' }}>
                <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{p.role}</div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>{p.access}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color-light)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Platform Configuration & Branding</h3>
        {error && (
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#FEE2E2', color: '#991B1B', border: '1.5px solid #FEE2E2', fontWeight: '600', fontSize: '14px' }}>
            {error}
          </div>
        )}
        {successMessage && !error && (
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', border: '1.5px solid #DCFCE7', fontWeight: '600', fontSize: '14px' }}>
            {successMessage}
          </div>
        )}
        {loading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading live platform snapshot…</div>
        ) : settingsData ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-dashboard)', border: '1px solid var(--border-color-light)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Live Snapshot</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Users</span>
                <strong>{settingsData.users?.total || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Events</span>
                <strong>{settingsData.events?.total || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Registrations</span>
                <strong>{settingsData.registrations?.total || 0}</strong>
              </div>
            </div>
          </div>
        ) : null}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Site Brand Title</label>
          <input
            type="text"
            defaultValue="CompilVision Event Portal"
            style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'transparent', color: 'var(--text)', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px' }}>Support Center Email</label>
          <input
            type="email"
            defaultValue="support@compilvision.com"
            style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color-light)', borderRadius: '8px', background: 'transparent', color: 'var(--text)', outline: 'none' }}
          />
        </div>
        <div style={{ borderTop: '1px solid var(--border-color-light)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setGlobalToast('Saved general branding options.')}
            style={{ width: '100%', padding: '10px', background: '#F5C451', color: '#111827', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            Save Brand Details
          </button>
          <button
            onClick={() => setGlobalToast('Database backup successfully compiled. Sent link to Super Admin.')}
            style={{ width: '100%', padding: '10px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            Backup Database Now
          </button>
        </div>
      </div>
    </div>
  );
}
