import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event, showRegistered = false }) => {
  const defaultImg = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="event-card">
      <div className="event-card-img-container">
        <img
          src={event.image || defaultImg}
          alt={event.title}
          className="event-card-img"
          onError={e => { e.target.src = defaultImg; }}
        />
        <span className="event-card-badge">{event.category}</span>
        {showRegistered && (
          <span className="event-card-registered-badge">✓ Registered</span>
        )}
      </div>
      <div className="event-card-body">
        <div className="event-card-date">{event.date}</div>
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-footer">
          <div className="event-card-price">
            ${event.price}<span>/person</span>
          </div>
          <Link to={`/events/${event.id}`} className="btn btn-dark" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
