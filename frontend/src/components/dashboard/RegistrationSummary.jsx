import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { ContentCard, PrimaryButton } from '../ui/DesignSystem';

function RegistrationSummary({ registrations = [] }) {
  const confirmedCount = registrations.filter(
    (reg) => reg.status?.toLowerCase() === 'confirmed'
  ).length;
  
  const waitlistedCount = registrations.filter(
    (reg) => reg.status?.toLowerCase() === 'waitlisted'
  ).length;

  const formatCount = (count) => String(count).padStart(2, '0');

  const handleDownloadAll = () => {
    alert('Generating and downloading all PDF tickets...');
  };

  return (
    <ContentCard style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>
            Your Registration Summary
          </h4>
          <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
            You have {confirmedCount + waitlistedCount} upcoming events. Make sure to download your tickets before the event date to avoid delays at the entrance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#DCFCE7', color: '#15803D', padding: '12px 18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{formatCount(confirmedCount)}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Confirmed</span>
          </div>
          <div style={{ background: '#FEF3C7', color: '#B45309', padding: '12px 18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800' }}>{formatCount(waitlistedCount)}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Waitlisted</span>
          </div>
        </div>

        <div>
          <PrimaryButton onClick={handleDownloadAll}>
            <FiDownload /> Get All Tickets (PDF)
          </PrimaryButton>
        </div>
      </div>
    </ContentCard>
  );
}

export default RegistrationSummary;
