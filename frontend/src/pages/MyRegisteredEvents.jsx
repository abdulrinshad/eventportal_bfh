import React, { useState } from 'react';
import { FiSearch, FiFolderMinus } from 'react-icons/fi';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import RegistrationCard from '../components/dashboard/RegistrationCard';
import RegistrationSummary from '../components/dashboard/RegistrationSummary';
import { registrationsData } from '../data/registrations';
import './MyRegisteredEvents.css';

function MyRegisteredEvents({ onViewHistory, onViewDetails }) {
  const [registrations, setRegistrations] = useState(registrationsData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCancelRegistration = (id) => {
    const reg = registrations.find((r) => r.id === id);
    if (!reg) return;
    if (window.confirm('Cancel registration for "' + reg.title + '"?')) {
      setRegistrations(registrations.filter((r) => r.id !== id));
    }
  };

  const filteredRegistrations = registrations.filter((reg) =>
    reg.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="my-registered-events-page">
      <div className="page-main-container">

        <header className="registered-events-header">
          <div className="header-text-group">
            <h1 className="header-title">My Registered Events</h1>
            <p className="header-subtitle">
              Manage your upcoming event attendance and ticket details.
            </p>
          </div>

          <div className="header-right-controls">
            <div className="header-search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="page-content-wrapper">
          {/* Cards FIRST — matches the reference design */}
          {filteredRegistrations.length > 0 ? (
            <div className="registrations-grid">
              {filteredRegistrations.map((reg) => (
                <RegistrationCard
                  key={reg.id}
                  registration={reg}
                  onCancel={handleCancelRegistration}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiFolderMinus className="empty-icon" />
              <h3>No registered events found</h3>
              <p>
                {searchTerm
                  ? "We couldn't find any events matching your search."
                  : 'You have not registered for any events yet.'}
              </p>
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Summary BELOW cards — matches the reference design */}
          <RegistrationSummary registrations={registrations} />
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
}

export default MyRegisteredEvents;
