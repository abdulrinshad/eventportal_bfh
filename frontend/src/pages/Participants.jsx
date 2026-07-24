import React, { useState } from 'react';
import { FiDownload, FiMail, FiChevronRight, FiUsers, FiBookmark, FiAlertCircle, FiCalendar, FiMoreVertical } from 'react-icons/fi';
import { PageContainer, PageHeader, StatCard, SearchBar, FilterDropdown, DataTable, PrimaryButton, SecondaryButton, StatusBadge, UserAvatar } from '../components/ui/DesignSystem';
import { participantsData } from '../data/participants';

function Participants({ onBackToEvents }) {
  const [participants, setParticipants] = useState(participantsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const statsData = [
    { id: 1, title: "Total Registrations", value: "1,248", icon: FiUsers, trend: "+12% this week", trendType: "up" },
    { id: 2, title: "VIP Attendees",        value: "342",   icon: FiBookmark, trend: "27% of total",   trendType: "up" },
    { id: 3, title: "Pending Payments",     value: "43",    icon: FiAlertCircle, trend: "Critical",        trendType: "down" },
    { id: 4, title: "Check-in Rate",        value: "--%",   icon: FiCalendar, trend: "Opens in 12 days", trendType: "up" },
  ];

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTicket  = ticketFilter  === 'all' || p.ticketType     === ticketFilter;
    const matchesPayment = paymentFilter === 'all' || p.paymentStatus  === paymentFilter;

    return matchesSearch && matchesTicket && matchesPayment;
  });

  const handleParticipantAction = (action, participant) => {
    setActiveMenuId(null);
    if (action === 'delete') {
      const confirmCancel = window.confirm(
        `Are you sure you want to cancel the registration for "${participant.name}"?`
      );
      if (confirmCancel) {
        setParticipants(participants.filter((p) => p.id !== participant.id));
      }
    } else if (action === 'resend') {
      alert(`Ticket email successfully resent to ${participant.email}`);
    } else if (action === 'edit') {
      alert(`Edit profile for attendee: ${participant.name}`);
    }
  };

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280', marginBottom: '16px' }} aria-label="Breadcrumb">
        <button
          onClick={onBackToEvents}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontWeight: '600', padding: 0 }}
        >
          My Created Events
        </button>
        <FiChevronRight size={14} />
        <span style={{ color: '#475569', fontWeight: '500' }}>
          Global Tech Summit 2024
        </span>
      </nav>

      <PageHeader
        title="Participants - Global Tech Summit"
        description="Manage and monitor attendee registrations in real-time."
        action={
          <div style={{ display: 'flex', gap: '12px' }}>
            <SecondaryButton onClick={() => alert('Exporting participants list to CSV...')}>
              <FiDownload /> Export CSV
            </SecondaryButton>
            <PrimaryButton onClick={() => alert('Opening broadcast email composer...')}>
              <FiMail /> Broadcast Email
            </PrimaryButton>
          </div>
        }
      />

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statsData.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendType={stat.trendType}
          />
        ))}
      </div>

      {/* Filter and Table Section */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by attendee name or email..."
        />
        <FilterDropdown
          label="Ticket"
          value={ticketFilter}
          onChange={(e) => setTicketFilter(e.target.value)}
          options={[
            { label: 'All Tickets', value: 'all' },
            { label: 'VIP Pass', value: 'VIP Pass' },
            { label: 'General Admission', value: 'General Admission' },
            { label: 'Early Bird', value: 'Early Bird' },
          ]}
        />
        <FilterDropdown
          label="Payment"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          options={[
            { label: 'All Payments', value: 'all' },
            { label: 'Paid', value: 'Paid' },
            { label: 'Pending', value: 'Pending' },
          ]}
        />
      </div>

      <DataTable
        headers={['Attendee', 'Email', 'Ticket Type', 'Registration Date', 'Payment Status', 'Actions']}
        pagination={{
          currentPage: currentPage,
          totalPages: 3,
          onPrev: () => setCurrentPage((p) => Math.max(p - 1, 1)),
          onNext: () => setCurrentPage((p) => Math.min(p + 1, 3)),
        }}
      >
        {filteredParticipants.map((p) => (
          <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB', position: 'relative' }}>
            <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserAvatar src={p.avatar} name={p.name} size={32} />
              <span style={{ fontWeight: '600', color: '#111827' }}>{p.name}</span>
            </td>
            <td style={{ padding: '14px 20px', color: '#475569' }}>{p.email}</td>
            <td style={{ padding: '14px 20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569' }}>
                {p.ticketType}
              </span>
            </td>
            <td style={{ padding: '14px 20px', color: '#6B7280' }}>{p.registrationDate}</td>
            <td style={{ padding: '14px 20px' }}>
              <StatusBadge status={p.paymentStatus === 'Paid' ? 'live' : 'draft'} />
            </td>
            <td style={{ padding: '14px 20px', position: 'relative' }}>
              <SecondaryButton
                onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                style={{ padding: '6px 10px', borderRadius: '8px' }}
              >
                <FiMoreVertical />
              </SecondaryButton>
              
              {activeMenuId === p.id && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '20px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '150px',
                    zIndex: 20,
                    padding: '4px',
                  }}
                >
                  <button
                    onClick={() => handleParticipantAction('edit', p)}
                    style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                  >
                    Edit Attendee
                  </button>
                  <button
                    onClick={() => handleParticipantAction('resend', p)}
                    style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
                  >
                    Resend Ticket
                  </button>
                  <button
                    onClick={() => handleParticipantAction('delete', p)}
                    style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', color: '#EF4444', fontWeight: '600' }}
                  >
                    Cancel Reg
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </PageContainer>
  );
}

export default Participants;
