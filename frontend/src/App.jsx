import React, { useState, useEffect } from 'react';
import EventDetails          from './pages/EventDetails';
import CreateEvent           from './pages/CreateEvent';
import EditEvent             from './pages/EditEvent';
import RegistrationSuccess   from './pages/RegistrationSuccess';

/* ── Hash-based routing ── */
const PAGES = ['event-details', 'create-event', 'edit-event', 'registration-success'];

function getHash() {
  const h = window.location.hash.replace('#', '').trim();
  return PAGES.includes(h) ? h : 'event-details';
}

function navigate(page) {
  window.location.hash = page;
}

function App() {
  const [page, setPage] = useState(getHash);

  useEffect(() => {
    const onHashChange = () => setPage(getHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const go = (p) => { navigate(p); setPage(p); };

  /* ── Create Event ── */
  if (page === 'create-event') {
    return (
      <CreateEvent
        onPublish={() => go('edit-event')}
        onCancel={() => go('event-details')}
        onNavigateToEdit={() => go('edit-event')}
      />
    );
  }

  /* ── Edit Event ── */
  if (page === 'edit-event') {
    return (
      <EditEvent
        onSave={() => go('registration-success')}
        onDiscard={() => go('event-details')}
        onNavigateToCreate={() => go('create-event')}
      />
    );
  }

  /* ── Registration Success ── */
  if (page === 'registration-success') {
    return (
      <RegistrationSuccess
        onBackToEvents={() => go('event-details')}
        onViewRegistrations={() => go('event-details')}
      />
    );
  }

  /* ── Event Details (default) ── */
  return <EventDetails />;
}

export default App;
