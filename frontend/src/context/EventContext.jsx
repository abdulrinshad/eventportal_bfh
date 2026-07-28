import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createEventApi,
  getEventDetailApi,
  getOrganizerEventsApi,
  patchEventApi,
  deleteEventApi,
  getStudentEventsApi,
  getStudentRegistrationsApi,
  registerForEventApi,
  cancelRegistrationApi,
} from '../services/api';

export const EventContext = createContext();

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const EventProvider = ({ children }) => {
  // Public explore events — fetched from real backend (APPROVED events only)
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsMeta, setEventsMeta] = useState({ count: 0, next: null, previous: null });

  // Organizer's own events — ALWAYS sourced from the real backend API.
  // Never stored in localStorage to avoid stale ID mismatches.
  const [myEvents, setMyEvents] = useState([]);

  // Student registrations — sourced from real backend API.
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

  // ── Real API: fetch APPROVED events for student Explore page ────────────
  /**
   * Fetch approved events with optional filters.
   * @param {Object} params  { search, category, price_type, ordering, page }
   */
  const fetchStudentEvents = async (params = {}) => {
    setEventsLoading(true);
    try {
      const response = await getStudentEventsApi(params);
      if (response && response.success) {
        setEvents(response.data || []);
        setEventsMeta({
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
        });
      }
    } catch (err) {
      console.error('[EventContext] fetchStudentEvents error:', err);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  // ── Real API: fetch student's own registrations ──────────────────────────
  const fetchMyRegistrations = async (params = {}) => {
    setRegistrationsLoading(true);
    try {
      const response = await getStudentRegistrationsApi(params);
      if (response && response.success) {
        setMyRegistrations(response.data || []);
      }
    } catch (err) {
      console.error('[EventContext] fetchMyRegistrations error:', err);
      setMyRegistrations([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

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
      return null;
    }
  };

  // ── Real API: CREATE event ───────────────────────────────────────────────
  /**
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

  // ── Real API: student event registration ─────────────────────────────────
  /**
   * Register for an approved event.
   * On success, refreshes the student's registration list.
   * Returns the raw API response: { success, message, data }
   */
  const registerForEvent = async (eventId) => {
    try {
      const response = await registerForEventApi(eventId);
      if (response && response.success) {
        // Refresh registrations so the UI reflects the new registration
        await fetchMyRegistrations();
      }
      return response;
    } catch (err) {
      const errorData = err?.response?.data;
      return {
        success: false,
        message: errorData?.message || 'Registration failed. Please try again.',
        errors: errorData?.errors || {},
      };
    }
  };

  // ── Real API: cancel a registration ─────────────────────────────────────
  /**
   * Cancel a student's own registration.
   * On success, updates local registrations list immediately.
   */
  const cancelRegistration = async (registrationId) => {
    try {
      const response = await cancelRegistrationApi(registrationId);
      if (response && response.success) {
        // Update local state: mark the registration as CANCELLED
        setMyRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === registrationId
              ? { ...reg, status: 'CANCELLED' }
              : reg
          )
        );
      }
      return response;
    } catch (err) {
      const errorData = err?.response?.data;
      return {
        success: false,
        message: errorData?.message || 'Failed to cancel registration.',
      };
    }
  };

  return (
    <EventContext.Provider
      value={{
        // Student: explore events
        events,
        eventsLoading,
        eventsMeta,
        fetchStudentEvents,
        // Student: registrations
        myRegistrations,
        registrationsLoading,
        fetchMyRegistrations,
        registerForEvent,
        cancelRegistration,
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
