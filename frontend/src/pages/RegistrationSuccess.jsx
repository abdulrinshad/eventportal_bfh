import React from 'react';
import { AppLayout, PageContainer, ContentCard, PrimaryButton, SecondaryButton } from '../components/ui/DesignSystem';
import { FiCalendar, FiMapPin, FiCheck, FiArrowLeft, FiAward, FiBookmark } from 'react-icons/fi';

const EVENT = {
  image:    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
  badge:    'CONFERENCE',
  ref:      'CV-99210',
  title:    'CompilVision Global Summit 2024',
  date:     'October 24, 2024',
  time:     '09:00 AM',
  location: 'Innovation Hub, San Francisco',
};

const CONFETTI_DEF = [
  [  6,  4, '#F5C451', 14,  15 ], [ 12, 10, '#111827', 10, -22 ],
  [  4, 22, '#10B981',  8,  45 ], [  9, 33, '#F5C451', 12, -10 ],
  [  3, 48, '#6366f1',  7,  30 ], [  7, 57, '#F5C451', 11,  55 ],
  [  2, 70, '#10B981',  9, -35 ], [  5, 82, '#111827', 13,  18 ],
  [ 11, 91, '#F5C451',  8, -50 ], [ 15, 96, '#10B981', 10,  40 ],
];

const RegistrationSuccess = ({ onBackToEvents, onViewRegistrations }) => {
  const handleAddToCalendar = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text:   EVENT.title,
      dates:  '20241024T090000/20241024T170000',
      location: EVENT.location,
      details: `Reference: ${EVENT.ref}`,
    });
    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
  };

  return (
    <AppLayout>
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Confetti decoration */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {CONFETTI_DEF.map(([top, left, color, size, rotate], i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                top: `${top}%`,
                left: `${left}%`,
                background: color,
                width: `${size}px`,
                height: `${size}px`,
                transform: `rotate(${rotate}deg)`,
                opacity: 0.25,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>

        <PageContainer size="md">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <FiCheck size={32} />
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', fontFamily: 'var(--font-heading)' }}>
              You're registered!
            </h1>
            <p style={{ fontSize: '15px', color: '#475569', margin: '0 0 32px 0' }}>
              A confirmation email has been sent to your inbox.
            </p>

            <ContentCard style={{ maxWidth: '460px', width: '100%', padding: '0px', textAlign: 'left', marginBottom: '32px' }}>
              <img 
                src={EVENT.image} 
                alt={EVENT.title} 
                style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#B45309' }}>
                    {EVENT.badge}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
                    Ref: {EVENT.ref}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
                  {EVENT.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar color="#94A3B8" />
                    <span>{EVENT.date} &bull; {EVENT.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiMapPin color="#94A3B8" />
                    <span>{EVENT.location}</span>
                  </div>
                </div>
              </div>
            </ContentCard>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <PrimaryButton onClick={handleAddToCalendar}>
                <FiCalendar /> Add to Calendar
              </PrimaryButton>
              <SecondaryButton onClick={onViewRegistrations}>
                <FiBookmark /> View Registrations
              </SecondaryButton>
            </div>

            <button
              onClick={onBackToEvents}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '24px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#111827'}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              <FiArrowLeft /> Back to Events
            </button>

          </div>
        </PageContainer>
      </div>
    </AppLayout>
  );
};

export default RegistrationSuccess;
