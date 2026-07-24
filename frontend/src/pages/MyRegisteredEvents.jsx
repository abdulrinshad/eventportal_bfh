import React, { useState } from 'react';
import { FiFolderMinus } from 'react-icons/fi';
import { AppLayout, PageContainer, PageHeader, SearchBar, PrimaryButton } from '../components/ui/DesignSystem';
import RegistrationCard from '../components/dashboard/RegistrationCard';
import RegistrationSummary from '../components/dashboard/RegistrationSummary';
import { registrationsData } from '../data/registrations';

function MyRegisteredEvents({ onViewHistory, onViewDetails }) {
  const [registrations, setRegistrations] = useState(registrationsData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCancelRegistration = (id) => {
    const reg = registrations.find((r) => r.id === id);
    if (!reg) return;
    if (window.confirm('Cancel registration for "' + reg.title + '"?')) {
      setRegistrations(registrations.filter((r) => r.id !== id));
    }
  };

  const filteredRegistrations = registrations.filter((reg) =>
    reg.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout activeItem="My Registrations">
      <PageContainer size="xl">
        <PageHeader
          title="My Registered Events"
          description="Manage your upcoming event attendance, tickets, and coordinates."
          action={
            <PrimaryButton onClick={onViewHistory}>
              View History
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

        {/* Cards List */}
        {filteredRegistrations.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {filteredRegistrations.map((reg) => (
              <RegistrationCard
                key={reg.id}
                registration={reg}
                onCancel={handleCancelRegistration}
                onViewDetails={onViewDetails}
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
              marginBottom: '32px',
            }}
          >
            <FiFolderMinus size={48} color="#94A3B8" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>No registered events found</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px 0', maxWidth: '360px' }}>
              {searchTerm
                ? "We couldn't find any events matching your search."
                : 'You have not registered for any events yet.'}
            </p>
            {searchTerm && (
              <PrimaryButton onClick={() => setSearchTerm('')}>
                Clear search
              </PrimaryButton>
            )}
          </div>
        )}

        {/* Summary card */}
        <RegistrationSummary registrations={registrations} />
      </PageContainer>
    </AppLayout>
  );
}

export default MyRegisteredEvents;
