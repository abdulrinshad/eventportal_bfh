import React, { useState } from 'react';
import { FiSearch, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import SpentSummaryCard from '../components/dashboard/SpentSummaryCard';
import { PageContainer, PageHeader, SearchBar, FilterDropdown, DataTable, SecondaryButton, StatusBadge } from '../components/ui/DesignSystem';
import { registrationHistoryData } from '../data/registrationHistory';

function RegistrationHistory({ onBackToRegistrations }) {
  const [history, setHistory] = useState(registrationHistoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const parseDateStr = (dateStr) => new Date(Date.parse(dateStr));

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.eventName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesFromDate = true;
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      matchesFromDate = parseDateStr(item.registrationDate) >= from;
    }

    let matchesToDate = true;
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      matchesToDate = parseDateStr(item.registrationDate) <= to;
    }

    return matchesSearch && matchesStatus && matchesFromDate && matchesToDate;
  });

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '16px' }} aria-label="Breadcrumb">
        <button
          onClick={onBackToRegistrations}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontWeight: '600', padding: 0 }}
        >
          My Registered Events
        </button>
        <FiChevronRight size={14} />
        <span style={{ color: '#475569', fontWeight: '500' }}>
          Registration History
        </span>
      </nav>

      <PageHeader
        title="Registration History"
        description="Review and manage your past event registrations and financial receipts."
      />

      <SpentSummaryCard />

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by event title..."
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'All Statuses', value: 'all' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Waitlisted', value: 'waitlisted' },
            { label: 'Refunded', value: 'refunded' },
          ]}
        />
      </div>

      <DataTable
        headers={['Event Name', 'Registration Date', 'Amount Paid', 'Ticket Reference', 'Status']}
        pagination={{
          currentPage: currentPage,
          totalPages: 3,
          onPrev: () => setCurrentPage((p) => Math.max(p - 1, 1)),
          onNext: () => setCurrentPage((p) => Math.min(p + 1, 3)),
        }}
      >
        {filteredHistory.map((item) => (
          <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#111827' }}>{item.eventName}</td>
            <td style={{ padding: '14px 20px', color: '#475569' }}>{item.registrationDate}</td>
            <td style={{ padding: '14px 20px', fontWeight: '600', color: '#111827' }}>{item.amountPaid}</td>
            <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#6B7280' }}>{item.ticketReference}</td>
            <td style={{ padding: '14px 20px' }}>
              <StatusBadge status={item.status === 'Confirmed' ? 'live' : item.status === 'Waitlisted' ? 'draft' : 'past'} />
            </td>
          </tr>
        ))}
      </DataTable>
    </PageContainer>
  );
}

export default RegistrationHistory;
