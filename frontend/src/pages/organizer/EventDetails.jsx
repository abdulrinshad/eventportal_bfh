import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import { PageContainer, PageHeader, ContentCard, PrimaryButton, SecondaryButton } from '../../components/ui/DesignSystem';
import { EventContext } from '../../context/EventContext';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function EventDetails() {
  const { id } = useParams();
  const { getEventById } = useContext(EventContext);
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const evt = await getEventById(id);
      setEvent(evt);
    };
    fetchEvent();
  }, [id, getEventById]);

  if (!event) {
    return (
      <OrganizerLayout activeItem="My Events">
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading event details...</div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout activeItem="My Events">
      <PageContainer size="xl">
        <PageHeader
          title={event.title}
          description={`${event.category} | Status: ${event.status.toUpperCase()}`}
          action={
            <div style={{ display: 'flex', gap: '12px' }}>
              <SecondaryButton onClick={() => navigate('/organizer/events')}>
                Back to List
              </SecondaryButton>
              <PrimaryButton onClick={() => navigate(`/organizer/events/edit/${event.id}`)}>
                Edit Details
              </PrimaryButton>
            </div>
          }
        />

        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '32px' }} className="event-details-layout">
          <div>
            <ContentCard style={{ padding: '0px', overflow: 'hidden', marginBottom: '28px' }}>
              <img
                src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                alt={event.title}
                style={{ width: '100%', height: '320px', objectFit: 'cover' }}
              />
              <div style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>About Event</h3>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  {event.description || 'No description provided.'}
                </p>
              </div>
            </ContentCard>
          </div>

          <div>
            <ContentCard style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Logistics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <FiCalendar size={18} color="#F5C451" />
                  <div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>DATE &amp; TIME</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{event.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <FiMapPin size={18} color="#F5C451" />
                  <div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>LOCATION</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{event.venueName}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{event.address}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <FiDollarSign size={18} color="#F5C451" />
                  <div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>REGISTRATION FEE</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                      {event.price === 0 || event.price === 'Free' ? 'Free' : `$${event.price}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <FiUsers size={18} color="#F5C451" />
                  <div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>CAPACITY LIMIT</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{event.maxParticipants} max attendees</div>
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </PageContainer>
    </OrganizerLayout>
  );
}
