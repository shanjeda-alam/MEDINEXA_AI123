import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status === 401 && request && !request._retry && typeof window !== 'undefined') {
      const refreshToken = window.localStorage.getItem('refresh_token');
      if (refreshToken) {
        request._retry = true;
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
          window.localStorage.setItem('access_token', response.data.access_token);
          window.localStorage.setItem('refresh_token', response.data.refresh_token);
          request.headers.Authorization = `Bearer ${response.data.access_token}`;
          return api(request);
        } catch (refreshError) {
          window.localStorage.removeItem('access_token');
          window.localStorage.removeItem('refresh_token');
          window.location.assign('/login');
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: (token) => api.post('/auth/refresh', { refresh_token: token }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
};

export const doctorAPI = {
  list: (params) => api.get('/doctors/', { params }),
  get: (id) => api.get(`/doctors/${id}`),
  getAvailability: (id) => api.get(`/doctors/${id}/availability`),
  getSpecialties: () => api.get('/doctors/specialties'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  updateAvailability: (data) => api.put('/doctors/availability', data),
  getDashboard: () => api.get('/doctors/dashboard/stats'),
  getAppointments: (params) => api.get('/doctors/appointments/list', { params }),
  updateAppointmentStatus: (id, data) => api.put(`/doctors/appointments/${id}/status`, data),
};

export const hospitalAPI = {
  search: (params) => api.get('/hospitals/', { params }),
  get: (id) => api.get(`/hospitals/${id}`),
};

export const appointmentAPI = {
  create: (data) => api.post('/appointments/', data),
  list: (params) => api.get('/appointments/', { params }),
  get: (id) => api.get(`/appointments/${id}`),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

export const assessmentAPI = {
  create: (data) => api.post('/assessments/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => api.get('/assessments/'),
  get: (id) => api.get(`/assessments/${id}`),
  delete: (id) => api.delete(`/assessments/${id}`),
};

export const telehealthAPI = {
  chat: (data) => api.post('/telehealth/chat', data),
  history: (sessionId) => api.get('/telehealth/chat/history', { params: { session_id: sessionId } }),
};

export const notificationAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const healthAPI = {
  check: () => api.get('/health/'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  verifyDoctor: (id, data) => api.put(`/admin/doctors/${id}/verify`, data),
  getHospitals: () => api.get('/admin/hospitals'),
  createHospital: (data) => api.post('/admin/hospitals', data),
  updateHospital: (id, data) => api.put(`/admin/hospitals/${id}`, data),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
