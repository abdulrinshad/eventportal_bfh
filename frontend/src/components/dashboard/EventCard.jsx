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
import './EventCard.css';

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

  const renderBadge = () => {
    switch (event.status) {
      case 'live':
        return (
          <span className="event-badge badge-live">
            <span className="pulse-dot"></span> LIVE
          </span>
        );
      case 'draft':
        return <span className="event-badge badge-draft">DRAFT</span>;
      case 'past':
        return <span className="event-badge badge-past">PAST</span>;
      default:
        return null;
    }
  };

  const renderCardContent = () => {
    switch (event.status) {
      case 'live':
        return (
          <>
            <div className="card-body">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-details-list">
                <div className="detail-item">
                  <FiCalendar className="detail-icon" />
                  <span>{event.date}</span>
                </div>
                <div className="detail-item">
                  <FiClock className="detail-icon" />
                  <span>{event.time}</span>
                </div>
                <div className="detail-item">
                  <FiUsers className="detail-icon" />
                  <span>{event.participantsCount?.toLocaleString()} Participants</span>
                </div>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="action-icon-btn tooltip" 
                data-tooltip="View Participants"
                onClick={() => onViewParticipants && onViewParticipants(event)}
              >
                <FiUsers />
              </button>
              <button
                className="action-icon-btn tooltip"
                data-tooltip="View Event"
                onClick={() => onViewEvent && onViewEvent(event)}
              >
                <FiEye />
              </button>
              <button
                className="action-icon-btn tooltip"
                data-tooltip="Edit Event"
                onClick={() => onEditEvent && onEditEvent(event)}
              >
                <FiEdit2 />
              </button>
              <button className="action-icon-btn btn-danger tooltip" data-tooltip="Delete Event">
                <FiTrash2 />
              </button>
            </div>
          </>
        );

      case 'draft':
        return (
          <>
            <div className="card-body">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-details-list">
                <div className="detail-item not-scheduled">
                  <FiCalendar className="detail-icon" />
                  <span>Not Scheduled</span>
                </div>
                <div className="progress-container">
                  <div className="progress-header">
                    <span>Setup progress</span>
                    <span>{event.completionPercentage}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${event.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-actions-button-wrapper">
              <button
                className="finish-draft-btn"
                onClick={() => onEditEvent && onEditEvent(event)}
              >
                <span>Finish Draft</span>
              </button>
            </div>
          </>
        );

      case 'past':
        return (
          <>
            <div className="card-body">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-details-list">
                <div className="detail-item">
                  <FiCalendar className="detail-icon" />
                  <span>{event.date}</span>
                </div>
                <div className="detail-item">
                  <FiUsers className="detail-icon" />
                  <span>{event.participantsCount?.toLocaleString()} Attended</span>
                </div>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="action-icon-btn tooltip" 
                data-tooltip="View Participants"
                onClick={() => onViewParticipants && onViewParticipants(event)}
              >
                <FiUsers />
              </button>
              <button className="action-icon-btn tooltip" data-tooltip="View Analytics">
                <FiBarChart2 />
              </button>
              <button className="action-icon-btn tooltip" data-tooltip="Download Report">
                <FiFileText />
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="event-card">
      <div className="card-header-image">
        {event.status === 'draft' ? (
          <div className="draft-placeholder-banner">
            <FiFilePlus className="placeholder-icon" />
            <span>Draft Template</span>
          </div>
        ) : (
          <img src={event.banner} alt={event.title} className="banner-image" />
        )}
        
        {renderBadge()}

        <div className="menu-container" ref={menuRef}>
          <button 
            className="three-dot-btn" 
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Actions menu"
          >
            <FiMoreVertical />
          </button>
          
          {showMenu && (
            <div className="card-context-menu">
              <button className="context-menu-item">Pin Event</button>
              <button className="context-menu-item">Duplicate</button>
              <button className="context-menu-item danger-text">Cancel Event</button>
            </div>
          )}
        </div>
      </div>

      {renderCardContent()}
    </div>
  );
}

export default EventCard;
