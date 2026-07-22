import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import MyCreatedEvents from './MyCreatedEvents';
import MyRegisteredEvents from './MyRegisteredEvents';
import Participants from './Participants';
import RegistrationHistory from './RegistrationHistory';

/**
 * Dashboard - Main authenticated dashboard layout.
 * Uses the Sidebar for navigation with state-based panel switching.
 * Accessible at /dashboard (protected by ProtectedRoute).
 */
function Dashboard() {
  const [activeItem, setActiveItem] = useState('My Created Events');
  const navigate = useNavigate();

  const renderPanel = () => {
    switch (activeItem) {
      case 'My Registrations':
        return (
          <MyRegisteredEvents
            onViewHistory={() => setActiveItem('RegistrationHistory')}
            onViewDetails={(id) => navigate(`/events/${id}`)}
          />
        );
      case 'RegistrationHistory':
        return (
          <RegistrationHistory
            onBackToRegistrations={() => setActiveItem('My Registrations')}
          />
        );
      case 'Participants':
        return (
          <Participants
            onBackToEvents={() => setActiveItem('My Created Events')}
          />
        );
      case 'My Created Events':
      default:
        return (
          <MyCreatedEvents
            onViewParticipants={() => setActiveItem('Participants')}
            onViewEvent={(event) => navigate(`/events/${event.id}`)}
            onEditEvent={(event) => navigate(`/edit/${event.id}`)}
            onCreateEvent={() => navigate('/create')}
          />
        );
    }
  };

  // Normalize sidebar highlight: Participants lives under "My Created Events",
  // RegistrationHistory lives under "My Registrations".
  const sidebarActiveItem =
    activeItem === 'Participants'
      ? 'My Created Events'
      : activeItem === 'RegistrationHistory'
      ? 'My Registrations'
      : activeItem;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dashboard, #F8FAFC)' }}>
      <Sidebar
        activeItem={sidebarActiveItem}
        setActiveItem={setActiveItem}
      />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden', marginLeft: 'var(--sidebar-width)' }}>
        {renderPanel()}
      </main>
    </div>
  );
}

export default Dashboard;
