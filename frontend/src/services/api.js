import axios from 'axios';

// API Base URL - ready for Django REST Framework (DRF) integration
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns unauthorized (e.g. token expired), clear local credentials
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

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

// GET /api/profile/
export const getProfileApi = async () => {
  const response = await api.get('/profile/');
  return response.data;
};


/* ==========================================
   EVENTS ENDPOINTS
   ========================================== */

// GET /api/events/
export const getEventsApi = async () => {
  const response = await api.get('/events/');
  return response.data;
};

// GET /api/events/:id/
export const getEventDetailApi = async (id) => {
  const response = await api.get(`/events/${id}/`);
  return response.data;
};

// POST /api/events/
export const createEventApi = async (eventData) => {
  const response = await api.post('/events/', eventData);
  return response.data;
};

// PUT /api/events/:id/
export const updateEventApi = async (id, eventData) => {
  const response = await api.put(`/events/${id}/`, eventData);
  return response.data;
};

// DELETE /api/events/:id/
export const deleteEventApi = async (id) => {
  const response = await api.delete(`/events/${id}/`);
  return response.data;
};

// POST /api/events/:id/register/
export const registerForEventApi = async (id) => {
  const response = await api.post(`/events/${id}/register/`);
  return response.data;
};


/* ==========================================
   USER-SPECIFIC DASHBOARD ENDPOINTS
   ========================================== */

// GET /api/my-events/
export const getMyEventsApi = async () => {
  const response = await api.get('/my-events/');
  return response.data;
};

// GET /api/my-registrations/
export const getMyRegistrationsApi = async () => {
  const response = await api.get('/my-registrations/');
  return response.data;
};

export default api;
