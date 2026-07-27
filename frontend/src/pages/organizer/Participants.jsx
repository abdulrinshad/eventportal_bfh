import React, { useState } from 'react';
import { FiDownload, FiMail, FiUsers, FiBookmark, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { PageContainer, PageHeader, StatCard, SearchBar, FilterDropdown, DataTable, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import OrganizerLayout from './OrganizerLayout';
import { participantsData } from '../../data/participants';

export default function Participants() {
  const [participants, setParticipants] = useState(participantsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');

  const statsData = [
    { id: 1, title: "Total Registrations", value: participants.length, icon: FiUsers },
    { id: 2, title: "VIP Attendees",        value: "3",   icon: FiBookmark },
    { id: 3, title: "Pending Reviews",      value: "0",    icon: FiAlertCircle },
  ];

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <OrganizerLayout activeItem="Participants">
      <PageContainer>
        <PageHeader
          title="Participants Registry"
          description="Manage and monitor student attendee registrations in real-time."
          action={
            <div style={{ display: 'flex', gap: '12px' }}>
              <SecondaryButton onClick={() => alert('Exporting list to CSV...')}>
                <FiDownload /> Export CSV
              </SecondaryButton>
              <PrimaryButton onClick={() => alert('Broadcasting email...')}>
                <FiMail /> Broadcast Email
              </PrimaryButton>
            </div>
          }
        />

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {statsData.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={<stat.icon />}
            />
          ))}
        </div>

        {/* Filter Section */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by attendee name or email..."
          />
        </div>

        {/* Table */}
        <DataTable
          columns={[
            { header: 'Attendee', key: 'name', render: (val, row) => <div><strong>{val}</strong><div style={{ fontSize: '11px', color: '#6B7280' }}>{row.email}</div></div> },
            { header: 'Ticket Type', key: 'ticketType' },
            { header: 'Payment Status', key: 'paymentStatus' },
            { header: 'Date Registered', key: 'registrationDate' },
          ]}
          data={filteredParticipants}
        />
      </PageContainer>
    </OrganizerLayout>
  );
}
