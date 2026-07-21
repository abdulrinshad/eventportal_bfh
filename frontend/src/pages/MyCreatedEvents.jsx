import React, { useState } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import EventCard from '../components/dashboard/EventCard';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import { eventsData } from '../data/events';
import { FiFolderMinus } from 'react-icons/fi';
import './MyCreatedEvents.css';

function MyCreatedEvents({ onViewParticipants, onViewEvent, onEditEvent, onCreateEvent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'upcoming') {
      matchesDate = event.date !== null && event.status !== 'past';
    } else if (dateFilter === 'not-scheduled') {
      matchesDate = event.date === null;
    } else if (dateFilter === 'past') {
      matchesDate = event.status === 'past';
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="my-created-events-page">
      <div className="page-main-container">
        <DashboardHeader onCreateEvent={onCreateEvent} />

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        <div className="events-grid-wrapper">
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewParticipants={onViewParticipants}
                  onViewEvent={onViewEvent}
                  onEditEvent={onEditEvent}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiFolderMinus className="empty-icon" />
              <h3>No events found</h3>
              <p>We couldn't find any events matching your current search term or filter settings.</p>
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <DashboardFooter />
    </div>
  );
}

export default MyCreatedEvents;
