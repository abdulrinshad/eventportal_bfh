import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton } from '../../components/ui/DesignSystem';
import { EventContext } from '../../context/EventContext';
import { FiClock, FiCalendar } from 'react-icons/fi';

export default function PendingEvents() {
  const { myEvents } = useContext(EventContext);
  const navigate = useNavigate();

  const pendingList = myEvents.filter(e => e.status === 'pending');

  return (
    <OrganizerLayout activeItem="Pending Approval">
      <PageContainer size="xl">
        <PageHeader
          title="Pending Approvals"
          description="View status of your submitted events awaiting admin reviews."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {pendingList.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #E2E8F0' }}>
              <FiClock size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '750', color: '#374151', margin: '0 0 6px 0' }}>No pending events</h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>All your events are reviewed and verified.</p>
            </div>
          ) : (
            pendingList.map(evt => (
              <ContentCard key={evt.id} style={{ padding: '0px', overflow: 'hidden', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', background: `url(${evt.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '750', padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309' }}>
                      PENDING REVIEW
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{evt.date}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>{evt.title}</h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineUpperLimit: '2', overflow: 'hidden', flex: 1 }}>{evt.venueName}</p>
                </div>
              </ContentCard>
            ))
          )}
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
