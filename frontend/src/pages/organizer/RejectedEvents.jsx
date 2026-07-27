import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton } from '../../components/ui/DesignSystem';
import { EventContext } from '../../context/EventContext';
import { FiXCircle, FiEdit2 } from 'react-icons/fi';

const MOCK_REJECTED = [
  {
    id: 'rejected-1',
    title: 'Global Blockchain Symposium',
    date: 'Dec 15, 2024',
    venueName: 'Metropolitan Convention Hall',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=400&q=80',
    status: 'rejected',
    rejectionReason: 'Invalid ticket price tier. The minimum ticket price for premium commercial listing is $10.00. Please revise pricing.'
  }
];

export default function RejectedEvents() {
  const { myEvents } = useContext(EventContext);
  const navigate = useNavigate();

  const rejectedFromContext = myEvents.filter(e => e.status === 'rejected');
  const rejectedList = rejectedFromContext.length > 0 ? rejectedFromContext : MOCK_REJECTED;

  return (
    <OrganizerLayout activeItem="Rejected Events">
      <PageContainer size="xl">
        <PageHeader
          title="Rejected Listings"
          description="Review rejected events, read administrator feedback, edit details, and resubmit for approval."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {rejectedList.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
              <FiXCircle size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '750', color: '#374151', margin: '0 0 6px 0' }}>No rejected listings</h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>All your events are in good standing.</p>
            </div>
          ) : (
            rejectedList.map(evt => (
              <ContentCard key={evt.id} style={{ padding: '0px', overflow: 'hidden', border: '1px solid #FEE2E2', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', background: `url(${evt.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '750', padding: '3px 8px', borderRadius: '6px', background: '#FEE2E2', color: '#EF4444' }}>
                      REJECTED
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{evt.date}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>{evt.title}</h3>
                  
                  {/* Rejection Note */}
                  <div style={{ background: '#FFF1F2', borderLeft: '3px solid #EF4444', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', color: '#991B1B', margin: '8px 0 16px 0', lineHeight: '1.4' }}>
                    <strong>Admin Note:</strong> {evt.rejectionReason || 'Details missing. Contact console support.'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <PrimaryButton onClick={() => navigate(`/organizer/events/edit/${evt.id}`)} style={{ flex: 1, padding: '8px' }}>
                      <FiEdit2 /> Edit &amp; Resubmit
                    </PrimaryButton>
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
