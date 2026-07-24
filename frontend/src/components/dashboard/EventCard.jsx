import React, { useState, useRef, useEffect } from 'react';
import { 
  FiMoreVertical, 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiBarChart2, 
  FiFileText,
  FiFilePlus
} from 'react-icons/fi';
import { ContentCard, StatusBadge, SecondaryButton } from '../ui/DesignSystem';

function EventCard({ event, onViewParticipants, onViewEvent, onEditEvent }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderCardContent = () => {
    switch (event.status) {
      case 'live':
        return (
          <>
            <div style={{ padding: '16px 0 20px 0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
                {event.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCalendar color="#94A3B8" />
                  <span>{event.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiClock color="#94A3B8" />
                  <span>{event.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiUsers color="#94A3B8" />
                  <span>{event.participantsCount?.toLocaleString()} Participants</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <SecondaryButton 
                onClick={() => onViewParticipants && onViewParticipants(event)}
                style={{ padding: '8px 12px', flex: 1, fontSize: '13px' }}
                title="View Participants"
              >
                <FiUsers /> Attendees
              </SecondaryButton>
              <SecondaryButton
                onClick={() => onViewEvent && onViewEvent(event)}
                style={{ padding: '8px' }}
                title="View Event"
              >
                <FiEye />
              </SecondaryButton>
              <SecondaryButton
                onClick={() => onEditEvent && onEditEvent(event)}
                style={{ padding: '8px' }}
                title="Edit Event"
              >
                <FiEdit2 />
              </SecondaryButton>
            </div>
          </>
        );

      case 'draft':
        return (
          <>
            <div style={{ padding: '16px 0 20px 0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
                {event.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
                  <FiCalendar />
                  <span>Not Scheduled</span>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '6px' }}>
                    <span>Setup progress</span>
                    <span>{event.completionPercentage}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ width: `${event.completionPercentage}%`, height: '100%', background: '#F5C451', borderRadius: '3px' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <SecondaryButton
                onClick={() => onEditEvent && onEditEvent(event)}
                style={{ width: '100%', fontSize: '13px' }}
              >
                Finish Draft
              </SecondaryButton>
            </div>
          </>
        );

      case 'past':
        return (
          <>
            <div style={{ padding: '16px 0 20px 0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0', fontFamily: 'var(--font-heading)' }}>
                {event.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCalendar color="#94A3B8" />
                  <span>{event.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiUsers color="#94A3B8" />
                  <span>{event.participantsCount?.toLocaleString()} Attended</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <SecondaryButton 
                onClick={() => onViewParticipants && onViewParticipants(event)}
                style={{ padding: '8px 12px', flex: 1, fontSize: '13px' }}
              >
                <FiUsers /> Attendees
              </SecondaryButton>
              <SecondaryButton style={{ padding: '8px' }} title="View Analytics">
                <FiBarChart2 />
              </SecondaryButton>
              <SecondaryButton style={{ padding: '8px' }} title="Download Report">
                <FiFileText />
              </SecondaryButton>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ContentCard style={{ padding: '0px' }}>
      {/* Banner / Header Image */}
      <div style={{ position: 'relative', height: '140px', overflow: 'hidden', background: '#F1F5F9' }}>
        {event.status === 'draft' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', gap: '8px' }}>
            <FiFilePlus size={24} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Draft Template</span>
          </div>
        ) : (
          <img 
            src={event.banner} 
            alt={event.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'; }}
          />
        )}
        
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 5 }}>
          <StatusBadge status={event.status} />
        </div>

        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }} ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <FiMoreVertical size={16} />
          </button>
          
          {showMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '36px',
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                width: '120px',
                zIndex: 20,
              }}
            >
              <button 
                onClick={() => { setShowMenu(false); alert('Pinned!'); }}
                style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
              >
                Pin Event
              </button>
              <button 
                onClick={() => { setShowMenu(false); alert('Duplicated!'); }}
                style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', color: '#374151' }}
              >
                Duplicate
              </button>
              <button 
                onClick={() => { setShowMenu(false); alert('Cancelled!'); }}
                style={{ background: 'none', border: 'none', padding: '8px 12px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', color: '#EF4444', fontWeight: '600' }}
              >
                Cancel Event
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {renderCardContent()}
      </div>
    </ContentCard>
  );
}

export default EventCard;
