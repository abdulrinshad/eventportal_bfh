import React, { useState } from 'react';
import { AppLayout, PageContainer, PageHeader, PrimaryButton, SecondaryButton, SearchBar, FilterDropdown, StatCard, ContentCard } from '../components/ui/DesignSystem';
import EventCard from '../components/dashboard/EventCard';
import { eventsData } from '../data/events';
import { FiPlus, FiCalendar, FiUsers, FiSliders, FiArrowRight } from 'react-icons/fi';

function MyCreatedEvents({ onViewParticipants, onViewEvent, onEditEvent, onCreateEvent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'upcoming') {
      matchesDate = event.date !== null && event.status !== 'past';
    } else if (dateFilter === 'not-scheduled') {
      matchesDate = event.date === null;
    } else if (dateFilter === 'past') {
      matchesDate = event.status === 'past';
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pick first live event as featured event, if none, pick first event
  const featuredEvent = eventsData.find(e => e.status === 'live') || eventsData[0];
  const remainingEvents = filteredEvents.filter(e => e.id !== featuredEvent?.id);

  return (
    <AppLayout activeItem="My Created Events">
      <PageContainer size="xl">
        <PageHeader
          title="My Created Events"
          description="Design, monitor, and coordinate your organized event portfolio."
          action={
            <PrimaryButton onClick={onCreateEvent}>
              <FiPlus /> Create Event
            </PrimaryButton>
          }
        />

        {/* Statistics Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard title="Total Hosted Summits" value={eventsData.length} icon={<FiCalendar />} description="Lifetime created events" />
          <StatCard title="Live Events" value={eventsData.filter(e => e.status === 'live').length} icon={<FiSliders />} description="Currently taking registrations" />
          <StatCard title="Draft Templates" value={eventsData.filter(e => e.status === 'draft').length} icon={<FiPlus />} description="In progress workspaces" />
        </div>

        {/* Featured Event Showcase (Hero Spotlight) */}
        {featuredEvent && (
          <div style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Spotlight Event
            </h3>
            <ContentCard style={{ padding: '0px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr' }} className="created-featured-grid">
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309' }}>
                      {(featuredEvent.category || 'Technology').toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#15803D' }}>
                      {(featuredEvent.status || 'draft').toUpperCase()}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>
                    {featuredEvent.title}
                  </h2>
                  <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                    {featuredEvent.description || 'Coordinate listings, track ticket sales, and view participant list in real-time.'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <PrimaryButton onClick={() => onViewEvent && onViewEvent(featuredEvent)}>
                      View Listing <FiArrowRight style={{ marginLeft: '6px' }} />
                    </PrimaryButton>
                    <SecondaryButton onClick={() => onEditEvent && onEditEvent(featuredEvent)}>
                      Edit Details
                    </SecondaryButton>
                  </div>
                </div>
                <div
                  style={{
                    backgroundImage: `url(${featuredEvent.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '280px',
                  }}
                />
              </div>
            </ContentCard>
          </div>
        )}

        {/* Filter Toolbar Section */}
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
          All Event Listings
        </h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
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
              { label: 'Live', value: 'live' },
              { label: 'Draft', value: 'draft' },
              { label: 'Past', value: 'past' },
            ]}
          />
          <FilterDropdown
            label="Timeframe"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            options={[
              { label: 'Any Date', value: 'all' },
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'Not Scheduled', value: 'not-scheduled' },
              { label: 'Past Date', value: 'past' },
            ]}
          />
        </div>

        {/* Remaining Events Grid */}
        {remainingEvents.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {remainingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewParticipants={onViewParticipants}
                onViewEvent={onViewEvent}
                onEditEvent={onEditEvent}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 24px',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px dashed #E5E7EB',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📂</span>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>No matching events found</h4>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Try clearing filters or search term.</p>
          </div>
        )}
      </PageContainer>

      <style>{`
        @media (max-width: 800px) {
          .created-featured-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default MyCreatedEvents;
