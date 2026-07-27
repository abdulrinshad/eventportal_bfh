import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton, SearchBar, FilterDropdown, StatCard, ContentCard } from '../../components/ui/DesignSystem';
import { EventContext } from '../../context/EventContext';
import { FiPlus, FiCalendar, FiSliders, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import '../MyCreatedEvents.css';

export default function MyCreatedEvents() {
  const { myEvents } = useContext(EventContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEvents = myEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const liveEvents = myEvents.filter(e => e.status === 'live');
  const pendingEvents = myEvents.filter(e => e.status === 'pending');

  return (
    <OrganizerLayout activeItem="My Events">
      <PageContainer size="xl">
        <PageHeader
          title="My Created Events"
          description="Design, monitor, and coordinate your organized event portfolio."
          action={
            <PrimaryButton onClick={() => navigate('/organizer/events/create')}>
              <FiPlus /> Create Event
            </PrimaryButton>
          }
        />

        {/* Statistics Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Total Created Events" value={myEvents.length} icon={<FiCalendar />} description="Lifetime created events" />
          <StatCard title="Live Listings" value={liveEvents.length} icon={<FiCheckCircle />} description="Currently public" />
          <StatCard title="Pending Approvals" value={pendingEvents.length} icon={<FiSliders />} description="In review pipeline" />
        </div>

        {/* Filter Toolbar Section */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my created events..."
          />
          <FilterDropdown
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'live', label: 'Live' },
              { value: 'pending', label: 'Pending' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>

        {/* Events Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
              <p style={{ color: '#6B7280' }}>No events found.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <ContentCard key={evt.id} style={{ padding: '0px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', background: `url(${evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '750', padding: '3px 8px', borderRadius: '6px', background: evt.status === 'live' ? '#DCFCE7' : evt.status === 'pending' ? '#FEF3C7' : '#FEE2E2', color: evt.status === 'live' ? '#15803D' : evt.status === 'pending' ? '#B45309' : '#EF4444' }}>
                      {evt.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{evt.date}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>{evt.title}</h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineUpperLimit: '2', overflow: 'hidden', flex: 1 }}>{evt.venueName}</p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <PrimaryButton onClick={() => navigate(`/organizer/events/edit/${evt.id}`)} style={{ flex: 1, padding: '8px' }}>
                      Edit
                    </PrimaryButton>
                    <SecondaryButton onClick={() => navigate(`/organizer/participants`)} style={{ flex: 1, padding: '8px' }}>
                      Attendees
                    </SecondaryButton>
                  </div>
                </div>
              </ContentCard>
            ))
          )}
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
