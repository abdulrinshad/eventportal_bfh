import React from 'react';
import { FiDownload } from 'react-icons/fi';
import './RegistrationSummary.css';

function RegistrationSummary({ registrations = [] }) {
  const confirmedCount = registrations.filter(
    (reg) => reg.status?.toLowerCase() === 'confirmed'
  ).length;
  
  const waitlistedCount = registrations.filter(
    (reg) => reg.status?.toLowerCase() === 'waitlisted'
  ).length;

  const formatCount = (count) => String(count).padStart(2, '0');

  const handleDownloadAll = () => {
    alert('Generating and downloading all PDF tickets...');
  };

  return (
    <div className="registration-summary-card">
      <div className="summary-info-group">
        <div className="summary-text">
          <h2 className="summary-title">Your Registration Summary</h2>
          <p className="summary-description">
            You have {confirmedCount + waitlistedCount} upcoming events. Make sure to download your tickets before the event date to avoid delays at the entrance.
          </p>
        </div>

        <div className="summary-stats">
          <div className="stat-badge confirmed-stat">
            <span className="stat-number">{formatCount(confirmedCount)}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          
          <div className="stat-badge waitlisted-stat">
            <span className="stat-number">{formatCount(waitlistedCount)}</span>
            <span className="stat-label">Waitlisted</span>
          </div>
        </div>
      </div>

      <div className="summary-action-group">
        <button className="download-tickets-btn" onClick={handleDownloadAll}>
          <FiDownload className="download-icon" />
          <span>Get All Tickets (PDF)</span>
        </button>
      </div>
    </div>
  );
}

export default RegistrationSummary;
