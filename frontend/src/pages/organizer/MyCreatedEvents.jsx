import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton, SearchBar, FilterDropdown, StatCard, ContentCard } from '../../components/ui/DesignSystem';
import { EventContext } from '../../context/EventContext';
import { FiPlus, FiCalendar, FiSliders, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import '../MyCreatedEvents.css';

export default function MyCreatedEvents() {
  const { myEvents, fetchMyEvents } = useContext(EventContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchMyEvents();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEvents = myEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Backend uses APPROVED for live/published events
  const liveEvents = myEvents.filter(e => e.status === 'APPROVED' || e.status === 'live');
  const pendingEvents = myEvents.filter(e => e.status === 'PENDING' || e.status === 'pending');

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
              { value: 'all',       label: 'All Statuses' },
              { value: 'APPROVED',  label: 'Approved' },
              { value: 'PENDING',   label: 'Pending' },
              { value: 'REJECTED',  label: 'Rejected' },
              { value: 'DRAFT',     label: 'Draft' },
            ]}
          />
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Loading events…</div>
        ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
              <p style={{ color: '#6B7280' }}>No events found.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <ContentCard key={evt.id} style={{ padding: '0px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                {/* Banner */}
                <div style={{
                  height: '140px',
                  background: evt.banner_url ? `url(${evt.banner_url}) center/cover no-repeat` : '#F1F5F9',
                  display: evt.banner_url ? undefined : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!evt.banner_url && <span style={{ fontSize: '12px', color: '#94A3B8' }}>No banner</span>}
                </div>

                {/* Card body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '750', padding: '3px 8px', borderRadius: '6px',
                      background: evt.status === 'APPROVED' ? '#DCFCE7' : evt.status === 'PENDING' ? '#FEF3C7' : evt.status === 'DRAFT' ? '#F0F9FF' : '#FEE2E2',
                      color:      evt.status === 'APPROVED' ? '#15803D' : evt.status === 'PENDING' ? '#B45309' : evt.status === 'DRAFT' ? '#0369A1' : '#EF4444',
                    }}>
                      {evt.status}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {evt.start_datetime ? new Date(evt.start_datetime).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>{evt.title}</h3>
                  {/* Pricing badge */}
                  {evt.is_paid ? (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '6px', display: 'inline-block' }}>
                      ₹{parseFloat(evt.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D', marginBottom: '6px', display: 'inline-block' }}>
                      FREE
                    </span>
                  )}
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', overflow: 'hidden', flex: 1 }}>{evt.venue || '—'}</p>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <PrimaryButton onClick={() => navigate(`/organizer/events/edit/${evt.id}`)} style={{ flex: 1, padding: '8px' }}>
                      Edit
                    </PrimaryButton>
                    <SecondaryButton onClick={() => navigate('/organizer/participants')} style={{ flex: 1, padding: '8px' }}>
                      Attendees
                    </SecondaryButton>
                  </div>
                </div>
              </ContentCard>
            ))
          )}
        </div>
        )}
      </PageContainer>
    </OrganizerLayout>
  );
}
