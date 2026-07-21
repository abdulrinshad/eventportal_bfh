import React from 'react';
import './StatCard.css';

function StatCard({ title, value, subtext, type }) {
  const getTypeClass = (t) => {
    switch (t) {
      case 'success': return 'stat-type-success';
      case 'info':    return 'stat-type-info';
      case 'danger':  return 'stat-type-danger';
      case 'warning': return 'stat-type-warning';
      default:        return 'stat-type-neutral';
    }
  };

  return (
    <div className={`stat-card ${getTypeClass(type)}`}>
      <span className="stat-card-title">{title}</span>
      <h2 className="stat-card-value">{value}</h2>
      <div className="stat-card-footer">
        <span className="stat-card-subtext">{subtext}</span>
      </div>
    </div>
  );
}

export default StatCard;
