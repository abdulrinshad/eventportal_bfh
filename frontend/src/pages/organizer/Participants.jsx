import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiDownload, FiMail, FiUsers, FiLoader, FiAlertCircle } from 'react-icons/fi';
import {
  PageContainer,
  PageHeader,
  StatCard,
  SearchBar,
  DataTable,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
} from '../../components/ui/DesignSystem';
import OrganizerLayout from './OrganizerLayout';
import {
  getOrganizerParticipantsApi,
  getOrganizerParticipantStatsApi,
  exportOrganizerParticipantsCsvApi,
} from '../../services/api';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_COLORS = {
  CONFIRMED:  { bg: '#DCFCE7', color: '#15803D' },
  WAITLISTED: { bg: '#FEF3C7', color: '#B45309' },
  CANCELLED:  { bg: '#FEE2E2', color: '#991B1B' },
};

function StatusBadge({ status }) {
  const style = STATUS_COLORS[status] || { bg: '#F1F5F9', color: '#475569' };
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 10px',
      borderRadius: '20px',
      background: style.bg,
      color: style.color,
    }}>
      {status || 'N/A'}
    </span>
  );
}

const PAYMENT_STATUS_COLORS = {
  PAID:     { bg: '#DCFCE7', color: '#15803D' },
  PENDING:  { bg: '#FEF3C7', color: '#B45309' },
  REFUNDED: { bg: '#EDE9FE', color: '#6D28D9' },
};

function PaymentBadge({ status }) {
  const style = PAYMENT_STATUS_COLORS[status] || { bg: '#F1F5F9', color: '#475569' };
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 10px',
      borderRadius: '20px',
      background: style.bg,
      color: style.color,
    }}>
      {status || 'N/A'}
    </span>
  );
}

const TABLE_HEADERS = ['Student Name', 'Student Email', 'Event', 'Registered On', 'Payment', 'Amount Paid', 'Status'];
const TD_STYLE = { padding: '14px 20px', borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' };

// ── Main Component ────────────────────────────────────────────────────────────

export default function Participants() {
  const [participants, setParticipants]       = useState([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [searchTerm, setSearchTerm]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]                       = useState(1);
  const [hasNext, setHasNext]                 = useState(false);
  const [hasPrev, setHasPrev]                 = useState(false);
  const [exportLoading, setExportLoading]     = useState(false);
  const debounceTimer = useRef(null);

  // ── Debounce search input ────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // ── Fetch participants + global stats from backend ───────────────────────
  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (debouncedSearch) params.search = debouncedSearch;

      // Run both requests in parallel for best performance
      const [listRes, statsRes] = await Promise.all([
        getOrganizerParticipantsApi(params),
        getOrganizerParticipantStatsApi(),
      ]);

      // DRF PageNumberPagination returns: { count, next, previous, results }
      const results = listRes?.results ?? [];
      setParticipants(Array.isArray(results) ? results : []);
      setHasNext(!!listRes?.next);
      setHasPrev(!!listRes?.previous);

      // Statistics endpoint gives the unfiltered true total
      const realTotal = statsRes?.data?.total_registrations ?? listRes?.count ?? 0;
      setTotalCount(realTotal);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      setError('Failed to load participants. Please try again.');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // ── CSV Export ───────────────────────────────────────────────────────────
  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const response = await exportOrganizerParticipantsCsvApi();
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'participants.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <OrganizerLayout activeItem="Participants">
      <PageContainer>
        <PageHeader
          title="Participants Registry"
          description="Manage and monitor student registrations for your events in real-time."
          action={
            <div style={{ display: 'flex', gap: '12px' }}>
              <SecondaryButton onClick={handleExportCsv} disabled={exportLoading || loading}>
                <FiDownload />
                {exportLoading ? 'Exporting…' : 'Export CSV'}
              </SecondaryButton>
              <PrimaryButton disabled title="Select an event on the Events page to broadcast">
                <FiMail /> Broadcast Email
              </PrimaryButton>
            </div>
          }
        />

        {/* ── Stats: Total Registrations only (VIP + Pending cards removed) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard
            title="Total Registrations"
            value={loading ? '…' : totalCount}
            icon={<FiUsers />}
          />
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by student name or email…"
          />
        </div>

        {/* Error banner */}
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px', color: '#94A3B8', fontSize: '15px' }}>
            <FiLoader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Loading participants…
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && participants.length === 0 && (
          <EmptyState
            title="No Participants Found"
            description={
              debouncedSearch
                ? 'No registrations match your search. Try a different name or email.'
                : 'No registrations yet for your events.'
            }
          />
        )}

        {/* ── Participants Table (uses DesignSystem DataTable: headers + children) ── */}
        {!loading && participants.length > 0 && (
          <DataTable
            headers={TABLE_HEADERS}
            pagination={
              (hasNext || hasPrev)
                ? {
                    currentPage: page,
                    totalPages: hasNext ? page + 1 : page,
                    onPrev: () => setPage((p) => Math.max(1, p - 1)),
                    onNext: () => setPage((p) => p + 1),
                  }
                : undefined
            }
          >
            {participants.map((reg) => (
              <tr key={reg.id}>
                {/* Student Name */}
                <td style={TD_STYLE}>
                  <strong style={{ fontSize: '14px', color: '#111827' }}>
                    {reg.participant_name || '—'}
                  </strong>
                </td>

                {/* Student Email */}
                <td style={TD_STYLE}>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    {reg.participant_email || '—'}
                  </span>
                </td>

                {/* Event Name */}
                <td style={TD_STYLE}>
                  <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>
                    {reg.event_name || '—'}
                  </span>
                </td>

                {/* Registration Date */}
                <td style={TD_STYLE}>
                  <span style={{ fontSize: '13px', color: '#475569' }}>
                    {formatDate(reg.registration_date)}
                  </span>
                </td>

                {/* Payment Status */}
                <td style={TD_STYLE}>
                  <PaymentBadge status={reg.payment_status} />
                </td>

                {/* Amount Paid */}
                <td style={TD_STYLE}>
                  <span style={{ fontSize: '13px', color: '#111827', fontWeight: '600' }}>
                    {reg.paid_amount != null
                      ? `₹${parseFloat(reg.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </span>
                </td>

                {/* Registration Status */}
                <td style={TD_STYLE}>
                  <StatusBadge status={reg.status} />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </PageContainer>
    </OrganizerLayout>
  );
}
