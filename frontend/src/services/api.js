import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// Chat API
export const chatAPI = {
  symptomCheck: (data) => api.post('/api/chat/symptom-check', data),
  getChatHistory: (sessionId) => api.get(`/api/chat/history/${sessionId}`),
  getChatSessions: () => api.get('/api/chat/sessions'),
};

// Health Records API
export const healthRecordsAPI = {
  create: (data) => api.post('/api/health-records/', data),
  getAll: (params) => api.get('/api/health-records/', { params }),
  getOne: (id) => api.get(`/api/health-records/${id}`),
  delete: (id) => api.delete(`/api/health-records/${id}`),
};

// Medications API
export const medicationsAPI = {
  create: (data) => api.post('/api/medications/', data),
  getAll: (params) => api.get('/api/medications/', { params }),
  getOne: (id) => api.get(`/api/medications/${id}`),
  update: (id, data) => api.put(`/api/medications/${id}`, data),
  delete: (id) => api.delete(`/api/medications/${id}`),
};

// Mental Health API
export const mentalHealthAPI = {
  create: (data) => api.post('/api/mental-health/', data),
  getAll: (params) => api.get('/api/mental-health/', { params }),
  getOne: (id) => api.get(`/api/mental-health/${id}`),
};

// Disclaimer API
export const disclaimerAPI = {
  get: () => api.get('/api/disclaimer'),
};

export default api;
