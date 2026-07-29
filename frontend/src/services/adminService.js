import api from './api';

const buildQueryParams = (params = {}) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  return filtered;
};

export const getAdminOrganizerRequestsApi = async (status = 'PENDING') => {
  const response = await api.get('/admin/organizer-requests/', { params: { status } });
  return response.data;
};

export const approveOrganizerRequestApi = async (id) => {
  const response = await api.patch(`/admin/organizer-requests/${id}/approve/`);
  return response.data;
};

export const rejectOrganizerRequestApi = async (id) => {
  const response = await api.patch(`/admin/organizer-requests/${id}/reject/`);
  return response.data;
};

export const getAdminDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users/', { params: buildQueryParams(params) });
  return response.data;
};

export const updateAdminUser = async (userId, data) => {
  const response = await api.patch(`/admin/users/${userId}/`, data);
  return response.data;
};

export const getAdminEvents = async (params = {}) => {
  const response = await api.get('/admin/events/', { params: buildQueryParams(params) });
  return response.data;
};

export const approveAdminEvent = async (eventId, reason) => {
  const response = await api.post(`/admin/events/${eventId}/action/`, { action: 'approve', reason });
  return response.data;
};

export const rejectAdminEvent = async (eventId, reason) => {
  const response = await api.post(`/admin/events/${eventId}/action/`, { action: 'reject', reason });
  return response.data;
};

export const getAdminRegistrations = async (params = {}) => {
  const response = await api.get('/admin/registrations/', { params: buildQueryParams(params) });
  return response.data;
};

export const getAdminNotifications = async (params = {}) => {
  const response = await api.get('/admin/notifications/', { params: buildQueryParams(params) });
  return response.data;
};

export const createAdminNotification = async (payload) => {
  const response = await api.post('/notifications/', payload);
  return response.data;
};

export const updateAdminNotification = async (notificationId, payload) => {
  const response = await api.patch(`/notifications/${notificationId}/`, payload);
  return response.data;
};

export const deleteAdminNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}/`);
  return response.data;
};

export const markAdminNotificationRead = async (notificationId) => {
  const response = await api.patch(`/admin/notifications/${notificationId}/read/`);
  return response.data;
};

export const getAdminReports = async () => {
  const response = await api.get('/admin/reports/');
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get('/admin/analytics/');
  return response.data;
};

export const getAdminAuditLogs = async () => {
  const response = await api.get('/admin/audit-logs/');
  return response.data;
};
