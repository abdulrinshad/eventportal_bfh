import axios from 'axios';
import { getAccessToken, removeTokens } from '../utils/tokenStorage';

// API Base URL
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeTokens();
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

/**
 * Unwrap a backend response that may be wrapped in { success, data, ... }.
 * All event endpoints return { success: true, data: [...] | {...} }.
 */
function unwrap(responseData) {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
}


/* ==========================================
   AUTHENTICATION ENDPOINTS
   ========================================== */

// POST /api/auth/register/
export const authRegisterApi = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

// POST /api/auth/login/
export const authLoginApi = async (credentials) => {
  const response = await api.post('/auth/login/', credentials);
  return response.data;
};

// GET /api/auth/profile/
export const getProfileApi = async () => {
  const response = await api.get('/auth/profile/');
  return response.data;
};


/* ==========================================
   EVENTS ENDPOINTS (Organizer)
   ========================================== */

/**
 * GET /api/events/
 * Returns the authenticated organizer's own events (all statuses).
 * Backend wraps response in { success, count, data: [...] }.
 * Returns the unwrapped array.
 */
export const getOrganizerEventsApi = async (params = {}) => {
  const response = await api.get('/events/', { params });
  return unwrap(response.data); // always an array
};

/**
 * GET /api/events/:id/
 * Returns a single event object (unwrapped from { success, data: {...} }).
 */
export const getEventDetailApi = async (id) => {
  const response = await api.get(`/events/${id}/`);
  return unwrap(response.data);
};

/**
 * GET /api/events/pending/
 * Returns organizer's PENDING events (unwrapped array).
 */
export const getPendingEventsApi = async () => {
  const response = await api.get('/events/pending/');
  return unwrap(response.data);
};

/**
 * GET /api/events/rejected/
 * Returns organizer's REJECTED events (unwrapped array).
 */
export const getRejectedEventsApi = async () => {
  const response = await api.get('/events/rejected/');
  return unwrap(response.data);
};

/**
 * POST /api/events/
 * Create a new event. Accepts FormData (multipart/form-data) for banner upload.
 */
export const createEventApi = async (formData) => {
  const response = await api.post('/events/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(response.data);
};

/**
 * PATCH /api/events/:id/
 * Partial update. Accepts FormData (multipart/form-data) for banner replacement.
 * Also handles REJECTED → PENDING auto-transition on the backend.
 */
export const patchEventApi = async (id, formData) => {
  const response = await api.patch(`/events/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(response.data);
};

/**
 * PUT /api/events/:id/
 * Full update. Accepts FormData (multipart/form-data).
 */
export const updateEventApi = async (id, formData) => {
  const response = await api.put(`/events/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(response.data);
};

/**
 * DELETE /api/events/:id/
 * Delete the event and its banner from disk.
 */
export const deleteEventApi = async (id) => {
  const response = await api.delete(`/events/${id}/`);
  return response.data;
};

/**
 * PUT/PATCH /api/events/:id/resubmit/
 * Explicitly resubmit a rejected event for admin review.
 * Sends updated fields and forces status=PENDING on backend.
 */
export const resubmitEventApi = async (id, formData) => {
  const response = await api.patch(`/events/${id}/resubmit/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap(response.data);
};


/* ==========================================
   ORGANIZER REQUEST MODULE ENDPOINTS
   ========================================== */

// POST /api/auth/organizer/apply/
export const applyOrganizerApi = async () => {
  const response = await api.post('/auth/organizer/apply/');
  return response.data;
};

// GET /api/auth/organizer/status/
export const getOrganizerStatusApi = async () => {
  const response = await api.get('/auth/organizer/status/');
  return response.data;
};

// GET /api/admin/organizer-requests/
export const getAdminOrganizerRequestsApi = async (statusFilter = 'PENDING') => {
  const response = await api.get('/admin/organizer-requests/', {
    params: { status: statusFilter },
  });
  return response.data;
};

// PATCH /api/admin/organizer-requests/:id/approve/
export const approveOrganizerRequestApi = async (id) => {
  const response = await api.patch(`/admin/organizer-requests/${id}/approve/`);
  return response.data;
};

// PATCH /api/admin/organizer-requests/:id/reject/
export const rejectOrganizerRequestApi = async (id) => {
  const response = await api.patch(`/admin/organizer-requests/${id}/reject/`);
  return response.data;
};


/* ==========================================
   STUDENT MODULE ENDPOINTS
   ========================================== */

/**
 * GET /api/student/dashboard/
 * Returns live stats and personalised content for the student dashboard.
 */
export const getStudentDashboardApi = async () => {
  const response = await api.get('/student/dashboard/');
  return response.data; // { success, message, data: { registered_events, ... } }
};

/**
 * GET /api/student/events/
 * Returns paginated APPROVED events only.
 *
 * @param {Object} params  Query params:
 *   - search       {string}  Full-text search on title/description/venue
 *   - category     {string}  Event category (ACADEMIC, CULTURAL, etc.) or "ALL"
 *   - price_type   {string}  "Free" | "Paid" | undefined
 *   - ordering     {string}  "upcoming" | "newest" | "oldest" | "price_asc" | "price_desc"
 *   - page         {number}  Page number
 */
export const getStudentEventsApi = async (params = {}) => {
  const response = await api.get('/student/events/', { params });
  return response.data; // { success, count, next, previous, data: [...] }
};

/**
 * GET /api/student/events/:id/
 * Returns full details of a single approved event + registration button state.
 */
export const getStudentEventDetailApi = async (id) => {
  const response = await api.get(`/student/events/${id}/`);
  return response.data; // { success, message, data: { ...event, registration_button_state } }
};

/**
 * POST /api/student/events/:id/register/
 * Register the authenticated student for an event.
 * Returns { success, message, data: { registration_id, status } }
 */
export const registerForEventApi = async (eventId) => {
  const response = await api.post(`/student/events/${eventId}/register/`);
  return response.data;
};

/**
 * GET /api/student/registrations/
 * Returns the student's own registrations.
 * @param {Object} params  { search: string }
 */
export const getStudentRegistrationsApi = async (params = {}) => {
  const response = await api.get('/student/registrations/', { params });
  return response.data; // { success, count, data: [...] }
};

/**
 * GET /api/student/registrations/summary/
 * Returns { confirmed, waitlisted, cancelled } counts.
 */
export const getStudentRegistrationsSummaryApi = async () => {
  const response = await api.get('/student/registrations/summary/');
  return response.data; // { success, message, data: { confirmed, waitlisted, cancelled } }
};

/**
 * DELETE /api/student/registrations/:id/cancel/
 * Cancel a specific registration by its UUID.
 * Returns { success, message, data: { registration_id, status } }
 */
export const cancelRegistrationApi = async (registrationId) => {
  const response = await api.delete(`/student/registrations/${registrationId}/cancel/`);
  return response.data;
};


/* ==========================================
   ORGANIZER — PARTICIPANTS
   ========================================== */

/**
 * GET /api/organizer/participants/
 * Returns paginated registrations for the logged-in organizer's events.
 * @param {Object} params  { search, ordering, page }
 */
export const getOrganizerParticipantsApi = async (params = {}) => {
  const response = await api.get('/organizer/participants/', { params });
  return response.data; // { success, count, next, previous, results: [...] }
};

/**
 * GET /api/organizer/participants/statistics/
 * Returns { total_registrations, vip_attendees, pending_reviews }.
 */
export const getOrganizerParticipantStatsApi = async () => {
  const response = await api.get('/organizer/participants/statistics/');
  return response.data; // { success, data: { total_registrations, ... } }
};

/**
 * GET /api/organizer/participants/export/
 * Downloads a CSV file of all participant records for this organizer.
 * Returns the axios response with responseType: 'blob'.
 */
export const exportOrganizerParticipantsCsvApi = async () => {
  const response = await api.get('/organizer/participants/export/', {
    responseType: 'blob',
  });
  return response;
};


/* ==========================================
   ORGANIZER — PROFILE
   ========================================== */

/**
 * GET /api/organizer/profile/
 * Returns the organizer's profile: display_name, biography, photo URL, stats.
 */
export const getOrganizerProfileApi = async () => {
  const response = await api.get('/organizer/profile/');
  return response.data; // { success, data: { ... } }
};

/**
 * PATCH /api/organizer/profile/
 * Updates display_name, biography, and/or profile_image.
 * Accepts FormData for multipart/form-data (image upload).
 */
export const updateOrganizerProfileApi = async (formData) => {
  const response = await api.patch('/organizer/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; // { success, data: { ... } }
};


/* ==========================================
   STUDENT NOTIFICATIONS
   ========================================== */

/**
 * GET /api/student/notifications/
 * Returns all notifications for the authenticated student.
 */
export const getStudentNotificationsApi = async () => {
  const response = await api.get('/student/notifications/');
  return response.data; // { success: true, message, data: [...] }
};

/**
 * GET /api/student/notifications/unread-count/
 * Returns count of unread notifications for the authenticated student.
 */
export const getStudentUnreadCountApi = async () => {
  const response = await api.get('/student/notifications/unread-count/');
  return response.data; // { success: true, count: N }
};

/**
 * PATCH /api/student/notifications/:id/read/
 * Marks a single notification as read.
 */
export const markStudentNotificationReadApi = async (id) => {
  const response = await api.patch(`/student/notifications/${id}/read/`);
  return response.data; // { success: true, message, data: { id, is_read } }
};

/**
 * PATCH /api/student/notifications/mark-all-read/
 * Marks all notifications as read for the student.
 */
export const markAllStudentNotificationsReadApi = async () => {
  const response = await api.patch('/student/notifications/mark-all-read/');
  return response.data; // { success: true, message, count }
};

/**
 * DELETE /api/student/notifications/:id/
 * Deletes a single notification by ID.
 */
export const deleteStudentNotificationApi = async (id) => {
  const response = await api.delete(`/student/notifications/${id}/`);
  return response.data; // { success: true, message }
};


/* ==========================================
   NOTIFICATIONS (General / Organizer)
   ========================================== */

/**
 * GET /api/notifications/
 * Returns all notifications for the authenticated user, newest first.
 */
export const getNotificationsApi = async () => {
  const response = await api.get('/notifications/');
  return response.data; // { success, count, data: [...] }
};

/**
 * POST /api/notifications/mark-all-read/
 * Marks every unread notification as read for the authenticated user.
 */
export const markAllNotificationsReadApi = async () => {
  const response = await api.post('/notifications/mark-all-read/');
  return response.data;
};

/**
 * DELETE /api/notifications/<uuid>/
 * Deletes a single notification by ID.
 */
export const deleteNotificationApi = async (id) => {
  const response = await api.delete(`/notifications/${id}/`);
  return response.data;
};


/* ==========================================
   STRIPE PAYMENTS
   ========================================== */

/**
 * POST /api/student/events/:eventId/register/
 * For paid events the backend returns { checkout_url } instead of a registration.
 * For free events it returns { registration_id, status } as before.
 * This reuses the existing registerForEventApi — no duplicate endpoint.
 */
export const createStripeCheckoutApi = async (eventId) => {
  const response = await api.post(`/student/events/${eventId}/register/`);
  return response.data; // { success, checkout_url } OR { success, data: { registration_id, status } }
};


/* ==========================================
   ORGANIZER — ANALYTICS
   ========================================== */

/**
 * GET /api/organizer/analytics/
 * Returns real analytics for the logged-in organizer:
 *   { total_revenue, total_registrations, registration_velocity, conversion_rate }
 */
export const getOrganizerAnalyticsApi = async () => {
  const response = await api.get('/organizer/analytics/');
  return response.data; // { success, data: { total_revenue, total_registrations, ... } }
};


export default api;

