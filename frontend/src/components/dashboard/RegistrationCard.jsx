import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiTag, FiXCircle } from 'react-icons/fi';
import './RegistrationCard.css';

function RegistrationCard({ registration, onCancel, onViewDetails }) {
  const navigate = useNavigate();
  const { id, category, title, date, time, location, ticketType, banner } = registration;

  const getBadgeClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'conference': return 'badge-conference';
      case 'gala':       return 'badge-gala';
      case 'workshop':   return 'badge-workshop';
      default:           return 'badge-default';
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      navigate('/events/' + id);
    }
  };

  return (
    <div className="registration-card">
      <div className="card-header-image">
        <img src={banner} alt={title} className="banner-image" />
        <span className={'category-badge ' + getBadgeClass(category)}>
          {category}
        </span>
      </div>

      <div className="card-body">
        <h3 className="event-title">{title}</h3>

        <div className="event-details-list">
          <div className="detail-item" title="Date and Time">
            <FiCalendar className="detail-icon" />
            <div className="detail-text-group">
              <span className="main-detail">{date}</span>
              <span className="sub-detail">{time}</span>
            </div>
          </div>

          <div className="detail-item" title="Location">
            <FiMapPin className="detail-icon" />
            <span className="detail-text">{location}</span>
          </div>

          <div className="detail-item" title="Ticket Type">
            <FiTag className="detail-icon" />
            <span className="detail-text ticket-badge">{ticketType}</span>
          </div>
        </div>
      </div>

      <div className="card-actions-wrapper">
        <button className="view-details-btn" onClick={handleViewDetails}>
          <span>View Details</span>
        </button>
        <button
          className="cancel-reg-btn tooltip"
          data-tooltip="Cancel Registration"
          onClick={() => onCancel && onCancel(id)}
          aria-label="Cancel Registration"
        >
          <FiXCircle />
        </button>
      </div>
    </div>
  );
}

export default RegistrationCard;
