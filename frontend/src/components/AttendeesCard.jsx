import React from 'react';
import AvatarStack from './AvatarStack';

const AttendeesCard = ({ count = 840 }) => {
  return (
    <div className="card">
      <h3 className="section-title" style={{ fontSize: '18px', marginBottom: '20px' }}>
        Who's attending?
      </h3>
      <div className="attendees-container">
        <AvatarStack count={count} maxDisplayed={4} />
        <div className="attendees-text">
          <span>{count}+</span> people are already attending this event. Join them!
        </div>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--gray-text)', marginTop: '16px', lineHeight: '1.6' }}>
        Connect with attendees from leading companies, research labs, and startups worldwide.
      </p>
    </div>
  );
};

export default AttendeesCard;
