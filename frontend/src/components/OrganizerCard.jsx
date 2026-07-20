import React from 'react';
import Button from './Button';

const OrganizerCard = ({ organizer }) => {
  if (!organizer) return null;

  const defaultImg = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80';

  return (
    <div className="card">
      <h2 className="section-title">About the Organizer</h2>
      <div className="organizer-info">
        <img
          src={organizer.avatar || defaultImg}
          alt={organizer.name}
          className="organizer-img"
          onError={e => { e.target.src = defaultImg; }}
        />
        <div>
          <div className="organizer-name">{organizer.name}</div>
          <div className="organizer-subtitle">{organizer.subtitle}</div>
        </div>
      </div>
      <p className="organizer-bio">{organizer.description}</p>
      <Button variant="outline">Follow Organizer</Button>
    </div>
  );
};

export default OrganizerCard;
