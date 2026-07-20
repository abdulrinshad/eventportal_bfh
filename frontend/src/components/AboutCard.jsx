import React from 'react';
import { FiUsers, FiBook, FiWifi, FiBriefcase } from './Icons';

const AboutCard = ({ event }) => {
  if (!event) return null;

  const { stats, aboutParagraphs } = event;

  const statItems = [
    { value: stats?.speakers || '0', label: 'Keynote Speakers' },
    { value: stats?.workshops || '0', label: 'Workshops' },
    { value: stats?.networking || '0h', label: 'Networking' },
    { value: stats?.exhibitors || '0', label: 'Exhibitors' },
  ];

  return (
    <div className="card">
      <h2 className="section-title">About the Event</h2>
      <div className="about-description">
        {(aboutParagraphs || []).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="stats-grid">
        {statItems.map((s, i) => (
          <div key={i} className="stat-item">
            <div className="stat-num">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutCard;
