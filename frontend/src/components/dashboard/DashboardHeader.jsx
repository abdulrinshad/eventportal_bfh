import React from 'react';
import { FiPlus } from 'react-icons/fi';
import './Header.css';

function DashboardHeader({ onCreateEvent }) {
  return (
    <header className="dashboard-header">
      <div className="header-text-group">
        <h1 className="header-title">My Created Events</h1>
        <p className="header-subtitle">
          Manage, track and optimize your hosted experiences.
        </p>
      </div>
      <button className="create-event-header-btn" onClick={onCreateEvent}>
        <FiPlus className="header-btn-icon" />
        <span>Create New Event</span>
      </button>
    </header>
  );
}

export default DashboardHeader;
