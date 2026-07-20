import React, { useState } from 'react';
import { FiChevronDown, FiMapPin, FiClock } from './Icons';

const ScheduleAccordion = ({ schedule = [] }) => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="card">
      <h2 className="section-title">Event Schedule</h2>
      <div className="accordion">
        {schedule.map(item => (
          <div key={item.id} className={`accordion-item ${openId === item.id ? 'open' : ''}`}>
            <div
              className="accordion-header"
              onClick={() => toggle(item.id)}
              role="button"
              aria-expanded={openId === item.id}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggle(item.id)}
            >
              <div className="accordion-left">
                <span className="accordion-time">{item.time}</span>
                <div className="accordion-title-container">
                  <span className="accordion-title">{item.title}</span>
                  <span className="accordion-speaker">{item.speaker}</span>
                </div>
              </div>
              <div className="accordion-right">
                <div className="accordion-badges">
                  <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <FiMapPin size={11} /> {item.location}
                  </span>
                  <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                    <FiClock size={11} /> {item.duration}
                  </span>
                </div>
                <FiChevronDown className="accordion-icon" />
              </div>
            </div>
            <div className="accordion-content">
              <p><strong>Speaker:</strong> {item.speaker}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Duration:</strong> {item.duration}</p>
            </div>
          </div>
        ))}
        {schedule.length === 0 && (
          <p style={{ color: 'var(--gray-text)', textAlign: 'center', padding: '20px 0' }}>
            Schedule coming soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default ScheduleAccordion;
