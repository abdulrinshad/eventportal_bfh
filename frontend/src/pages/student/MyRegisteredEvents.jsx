import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFolderMinus, FiDownload } from 'react-icons/fi';
import StudentLayout from './StudentLayout';
import { PageContainer, PageHeader, SearchBar, PrimaryButton } from '../../components/ui/DesignSystem';
import RegistrationCard from '../../components/dashboard/RegistrationCard';
import { getStudentRegistrationsApi, getStudentRegistrationsSummaryApi, cancelRegistrationApi } from '../../services/api';

// ── Format date helper ────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ── Map API registration to RegistrationCard props ────────────────────────────
function mapRegToCard(reg) {
  return {
    id:         reg.id,
    category:   reg.event?.category || 'Event',
    title:      reg.event?.title || 'Untitled Event',
    date:       formatDate(reg.event?.start_datetime),
    time:       formatTime(reg.event?.start_datetime),
    location:   reg.event?.venue || 'TBD',
    ticketType: reg.ticket_type,
    banner:     reg.event?.banner_url || null,
    status:     reg.status,
    paymentStatus: reg.payment_status,
  };
}

// ── Summary stat box ──────────────────────────────────────────────────────────
const SummaryBox = ({ value, label, bg, color }) => (
  <div style={{ background: bg, color, padding: '12px 18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
    <span style={{ fontSize: '20px', fontWeight: '800' }}>{String(value).padStart(2, '0')}</span>
    <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>{label}</span>
  </div>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#FFFFFF' }}>
    <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    <div style={{ height: '140px', background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    <div style={{ padding: '20px' }}>
      {[70, 50, 60, 40].map((w, i) => (
        <div key={i} style={{ height: 13, width: `${w}%`, borderRadius: 6, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 10 }} />
      ))}
    </div>
  </div>
);

export default function MyRegisteredEvents() {
  const navigate     = useNavigate();
  const [searchTerm, setSearchTerm]   = useState('');
  const [registrations, setRegs]      = useState([]);
  const [summary, setSummary]         = useState({ confirmed: 0, waitlisted: 0, cancelled: 0 });
  const [loading, setLoading]         = useState(true);
  const [summaryLoading, setSumLoad]  = useState(true);
  const [error, setError]             = useState(null);
  const [cancellingId, setCancelId]   = useState(null);

  // ── Fetch registrations from backend ────────────────────────────────────────
  const fetchRegistrations = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await getStudentRegistrationsApi(params);
      if (res && res.success) {
        setRegs(res.data || []);
      } else {
        setRegs([]);
      }
    } catch (err) {
      setError('Failed to load registrations. Please refresh.');
      setRegs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch summary stats ──────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    setSumLoad(true);
    try {
      const res = await getStudentRegistrationsSummaryApi();
      if (res && res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      // Non-fatal: summary is decorative
    } finally {
      setSumLoad(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRegistrations();
    fetchSummary();
  }, [fetchRegistrations, fetchSummary]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchRegistrations(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm, fetchRegistrations]);

  // ── Cancel handler ───────────────────────────────────────────────────────────
  const handleCancelRegistration = async (registrationId) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg || reg.status === 'CANCELLED') return;

    if (!window.confirm(`Cancel registration for "${reg.event?.title || 'this event'}"?`)) return;

    setCancelId(registrationId);
    try {
      const res = await cancelRegistrationApi(registrationId);
      if (res && res.success) {
        // Update local state
        setRegs(prev =>
          prev.map(r => r.id === registrationId ? { ...r, status: 'CANCELLED' } : r)
        );
        // Refresh summary
        fetchSummary();
      } else {
        alert(res?.message || 'Could not cancel registration.');
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to cancel. Please try again.');
    } finally {
      setCancelId(null);
    }
  };

  // Filter display (don't re-fetch — backend search handles it on API call)
  // We still do client-side filter on the returned results for instant UX
  const filteredRegs = registrations.filter(reg =>
    !searchTerm ||
    (reg.event?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StudentLayout activeItem="My Registrations">
      <PageContainer size="xl">
        <PageHeader
          title="My Registered Events"
          description="Manage your upcoming event attendance, tickets, and registrations."
          action={
            <PrimaryButton onClick={() => navigate('/student/dashboard')}>
              View Dashboard
            </PrimaryButton>
          }
        />

        {/* Filter toolbar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search registered events..."
          />
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '14px 18px', color: '#991B1B', fontSize: '14px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRegs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {filteredRegs.map((reg) => (
              <div key={reg.id} style={{ position: 'relative' }}>
                <RegistrationCard
                  registration={mapRegToCard(reg)}
                  onCancel={reg.status !== 'CANCELLED' ? handleCancelRegistration : undefined}
                  onViewDetails={(id) => navigate(`/events/${reg.event?.id || id}`)}
                />
                {/* Status overlay for cancelled */}
                {reg.status === 'CANCELLED' && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: '#FEE2E2', color: '#991B1B', fontSize: '11px',
                    fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
                    textTransform: 'uppercase',
                  }}>
                    Cancelled
                  </div>
                )}
                {/* Cancelling spinner overlay */}
                {cancellingId === reg.id && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '16px', fontSize: '14px', fontWeight: '600', color: '#374151',
                  }}>
                    Cancelling...
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 24px', background: '#FFFFFF', borderRadius: '20px',
            border: '1.5px dashed #E5E7EB', textAlign: 'center', marginBottom: '32px',
          }}>
            <FiFolderMinus size={48} color="#94A3B8" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
              No registered events found
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0', maxWidth: '360px' }}>
              {searchTerm
                ? "We couldn't find any events matching your search."
                : 'You have not registered for any events yet.'}
            </p>
            {searchTerm ? (
              <PrimaryButton onClick={() => setSearchTerm('')}>Clear search</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => navigate('/student/events')}>Explore Events</PrimaryButton>
            )}
          </div>
        )}

        {/* Summary Card */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB',
          padding: '24px 28px', marginTop: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>
                Your Registration Summary
              </h4>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                You have {summary.confirmed + summary.waitlisted} active {summary.confirmed + summary.waitlisted === 1 ? 'registration' : 'registrations'}.
                {' '}Download your tickets before the event date to avoid delays.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <SummaryBox value={summaryLoading ? '…' : summary.confirmed}  label="Confirmed"  bg="#DCFCE7" color="#15803D" />
              <SummaryBox value={summaryLoading ? '…' : summary.waitlisted} label="Waitlisted" bg="#FEF3C7" color="#B45309" />
              <SummaryBox value={summaryLoading ? '…' : summary.cancelled}  label="Cancelled"  bg="#F1F5F9" color="#475569" />
            </div>

            <div>
              <PrimaryButton onClick={() => alert('Ticket download feature coming soon!')}>
                <FiDownload style={{ marginRight: '6px' }} /> Get All Tickets (PDF)
              </PrimaryButton>
            </div>
          </div>
        </div>
      </PageContainer>
    </StudentLayout>
  );
}
