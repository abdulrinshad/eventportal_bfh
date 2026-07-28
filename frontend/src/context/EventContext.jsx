import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createEventApi,
  getEventDetailApi,
  getOrganizerEventsApi,
  patchEventApi,
  deleteEventApi,
} from '../services/api';

export const EventContext = createContext();

// ─────────────────────────────────────────────────────────────────────────────
// Static demo events for the PUBLIC explore / student-facing pages only.
// These are never used in organizer-specific pages.
// ─────────────────────────────────────────────────────────────────────────────
const EXPLORE_EVENTS = [
  {
    id: 'future-visionary-summit-2024',
    title: 'Future Visionary Summit 2024',
    category: 'Technology & Innovation',
    date: 'November 14-16, 2024',
    venueName: 'Metropolitan Convention Center',
    address: '125 W 18th St, New York, NY 10011',
    price: 499,
    attendeesCount: 840,
    maxParticipants: 1000,
    lastDateToReg: 'November 10, 2024',
    organizerId: 1,
    organizer: {
      name: 'Future Tech Lab',
      subtitle: 'Pioneering Tech Education & Global Summits',
      description: 'Future Tech Lab is a leading international consortium hosting over 30 global conferences annually.',
      avatar: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
    },
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    aboutParagraphs: [
      'The Future Visionary Summit 2024 brings together pioneering developers, industry leaders, and tech visionaries.',
    ],
    stats: { speakers: '32', workshops: '15', networking: '24h', exhibitors: '12' },
    schedule: [
      { id: 1, time: '09:00 AM - 10:30 AM', title: 'Opening Keynote', speaker: 'Dr. Sarah Jenkins', location: 'Grand Ballroom', duration: '90 min' },
    ],
    similarEvents: [],
  },
  {
    id: 'ai-ml-expo-2024',
    title: 'AI & Machine Learning Expo',
    category: 'Artificial Intelligence',
    date: 'December 05, 2024',
    venueName: 'Convention Hall',
    address: '450 Howard St, San Francisco, CA 94105',
    price: 299,
    attendeesCount: 520,
    maxParticipants: 800,
    lastDateToReg: 'December 01, 2024',
    organizerId: 2,
    organizer: {
      name: 'Neural Collective',
      subtitle: 'Pioneering Machine Learning Development',
      description: 'Neural Collective gathers research labs and commercial AI vendors.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=600&q=80',
    aboutParagraphs: ['Join us for the premier AI & Machine Learning Expo.'],
    stats: { speakers: '24', workshops: '8', networking: '12h', exhibitors: '8' },
    schedule: [
      { id: 1, time: '10:00 AM - 11:30 AM', title: 'Panel: Future of Agentic AI', speaker: 'AI Board Panelists', location: 'Hall B', duration: '90 min' },
    ],
    similarEvents: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const EventProvider = ({ children }) => {
  // Public explore events (demo / future: fetched from a public endpoint)
  const [events, setEvents] = useState(EXPLORE_EVENTS);

  // Organizer's own events — ALWAYS sourced from the real backend API.
  // Never stored in localStorage to avoid stale ID mismatches.
  const [myEvents, setMyEvents] = useState([]);

  // Student registrations (still mock for now — separate module)
  const [myRegistrations, setMyRegistrations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mock_registrations') || '[]');
    } catch {
      return [];
    }
  });

  // ── Real API: fetch ALL organizer events (all statuses) ─────────────────
  const fetchMyEvents = async (params = {}) => {
    try {
      const data = await getOrganizerEventsApi(params);
      if (Array.isArray(data)) {
        setMyEvents(data);
      }
    } catch (err) {
      console.error('[EventContext] fetchMyEvents error:', err);
    }
  };

  // ── Real API: fetch one event by UUID ───────────────────────────────────
  const getEventById = async (id) => {
    try {
      // getEventDetailApi already unwraps the { success, data } envelope
      const event = await getEventDetailApi(id);
      return event;
    } catch (err) {
      console.error('[EventContext] getEventById error:', err);
      // Fallback to explore mock list for student-facing pages
      return EXPLORE_EVENTS.find((e) => e.id === id) || null;
    }
  };

  // ── Real API: CREATE event ───────────────────────────────────────────────
  /**
   * Bug fix: was previously a pure mock that stored to localStorage with a
   * fake slug ID. Now calls the real backend API with proper FormData.
   *
   * @param {Object} eventData  Fields from CreateEvent form (camelCase frontend names)
   * @param {File|null} bannerFile  Optional banner File object
   * @returns {Object} Created event from backend (with real UUID)
   */
  const createEvent = async (eventData, bannerFile = null) => {
    const formData = new FormData();

    // Required fields
    formData.append('title',                  eventData.title || '');
    formData.append('description',            eventData.description || '');
    formData.append('category',               eventData.category || 'OTHER');
    formData.append('venue',                  eventData.venue || '');
    formData.append('start_datetime',         eventData.startDatetime || '');
    formData.append('end_datetime',           eventData.endDatetime || '');
    formData.append('registration_deadline',  eventData.registrationDeadline || '');
    formData.append('contact_email',          eventData.contactEmail || '');
    formData.append('max_participants',       String(eventData.maxParticipants || 100));
    formData.append('ticket_price',           String(eventData.ticketPrice || 0));
    formData.append('status',                 eventData.status || 'PENDING');

    // Optional fields
    if (eventData.contactPhone) formData.append('contact_phone', eventData.contactPhone);
    if (eventData.website)      formData.append('website',       eventData.website);
    if (eventData.visibility)   formData.append('visibility',    eventData.visibility);

    formData.append('enable_waitlist', eventData.enableWaitlist ? 'true' : 'false');
    formData.append('tags',            JSON.stringify(eventData.tags || []));
    formData.append('social_links',    JSON.stringify(eventData.socialLinks || {}));

    if (bannerFile instanceof File) {
      formData.append('banner', bannerFile);
    }

    const created = await createEventApi(formData);

    // Optimistically prepend to myEvents so UI updates immediately
    setMyEvents((prev) => [created, ...prev]);
    return created;
  };

  // ── Real API: UPDATE (PATCH) event ──────────────────────────────────────
  /**
   * Bug fix: tags were JSON.stringified then sent, causing validate_tags to
   * fail because it received a JSON string not a list. The backend serializer
   * now handles JSON string parsing, so this is safe.
   */
  const updateEvent = async (id, updatedData) => {
    const formData = new FormData();

    const fieldMap = {
      title:                'title',
      description:          'description',
      category:             'category',
      visibility:           'visibility',
      venue:                'venue',
      contact_email:        'contact_email',
      contact_phone:        'contact_phone',
      ticket_price:         'ticket_price',
      max_participants:     'max_participants',
      enable_waitlist:      'enable_waitlist',
      start_datetime:       'start_datetime',
      end_datetime:         'end_datetime',
      registration_deadline:'registration_deadline',
      website:              'website',
    };

    Object.entries(fieldMap).forEach(([frontKey, backKey]) => {
      const val = updatedData[frontKey];
      if (val !== undefined && val !== null && val !== '') {
        formData.append(backKey, String(val));
      }
    });

    // Tags and social_links: send as JSON strings (serializer parses them)
    if (updatedData.tags !== undefined) {
      formData.append('tags', JSON.stringify(updatedData.tags));
    }
    if (updatedData.social_links !== undefined) {
      formData.append('social_links', JSON.stringify(updatedData.social_links));
    }

    // Banner: only append a real File object
    if (updatedData.bannerFile instanceof File) {
      formData.append('banner', updatedData.bannerFile);
    }

    const updated = await patchEventApi(id, formData);

    // Sync myEvents context
    setMyEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
    );
    return updated;
  };

  // ── Real API: DELETE event ───────────────────────────────────────────────
  const deleteEvent = async (id) => {
    const response = await deleteEventApi(id);
    setMyEvents((prev) => prev.filter((e) => e.id !== id));
    setEvents((prev) => prev.filter((e) => e.id !== id));
    return response;
  };

  // ── Mock: student event registration (separate module, kept as-is) ───────
  const registerForEvent = async (eventId) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (myRegistrations.includes(eventId)) {
      return { success: false, message: 'Already registered for this event!' };
    }

    const updatedRegs = [...myRegistrations, eventId];
    setMyRegistrations(updatedRegs);
    localStorage.setItem('mock_registrations', JSON.stringify(updatedRegs));

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, attendeesCount: e.attendeesCount + 1 } : e
      )
    );

    return { success: true, message: 'Successfully registered!' };
  };

  return (
    <EventContext.Provider
      value={{
        // Public / student events
        events,
        myRegistrations,
        registerForEvent,
        // Organizer events (all real API)
        myEvents,
        fetchMyEvents,
        getEventById,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
