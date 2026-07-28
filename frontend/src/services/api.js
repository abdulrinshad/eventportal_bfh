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
   EVENTS ENDPOINTS
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

export default api;
