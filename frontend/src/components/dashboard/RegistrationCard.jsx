import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiTag, FiXCircle } from 'react-icons/fi';
import { ContentCard, SecondaryButton, DangerButton } from '../ui/DesignSystem';

function RegistrationCard({ registration, onCancel, onViewDetails }) {
  const navigate = useNavigate();
  const { id, category, title, date, time, location, ticketType, banner } = registration;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      navigate('/events/' + id);
    }
  };

  return (
    <ContentCard style={{ padding: '0px' }}>
      <div style={{ position: 'relative', height: '140px', overflow: 'hidden', background: '#F1F5F9' }}>
        <img 
          src={banner} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'; }}
        />
        <span 
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#111827',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          {category}
        </span>
      </div>

      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
          {title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#475569', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <FiCalendar color="#94A3B8" style={{ marginTop: '3px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '600', color: '#111827' }}>{date}</span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{time}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMapPin color="#94A3B8" />
            <span>{location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiTag color="#94A3B8" />
            <span style={{ fontSize: '12px', fontWeight: '600', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
              {ticketType}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
          <SecondaryButton onClick={handleViewDetails} style={{ flex: 1, fontSize: '13px' }}>
            View Details
          </SecondaryButton>
          <DangerButton 
            onClick={() => onCancel && onCancel(id)}
            style={{ padding: '10px' }}
            title="Cancel Registration"
          >
            <FiXCircle size={16} />
          </DangerButton>
        </div>
      </div>
    </ContentCard>
  );
}

export default RegistrationCard;
