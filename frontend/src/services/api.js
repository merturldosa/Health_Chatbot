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

// Meditation API
export const meditationAPI = {
  getPrograms: () => api.get('/api/meditation/programs'),
  getProgram: (programId) => api.get(`/api/meditation/programs/${programId}`),
  createSession: (data) => api.post('/api/meditation/sessions', data),
  getSessions: (params) => api.get('/api/meditation/sessions', { params }),
  deleteSession: (id) => api.delete(`/api/meditation/sessions/${id}`),
};

// Music Therapy API
export const musicAPI = {
  getPrograms: (params) => api.get('/api/music/programs', { params }),
  getProgram: (programId) => api.get(`/api/music/programs/${programId}`),
  createSession: (data) => api.post('/api/music/sessions', data),
  getSessions: (params) => api.get('/api/music/sessions', { params }),
  deleteSession: (id) => api.delete(`/api/music/sessions/${id}`),
};

// Disclaimer API
export const disclaimerAPI = {
  get: () => api.get('/api/disclaimer'),
};

// Speech API (Google STT)
export const speechAPI = {
  transcribe: (data) => api.post('/api/speech/transcribe', data),
  transcribeFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/speech/transcribe-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Emotion Analysis API
export const emotionAPI = {
  analyze: (data) => api.post('/api/emotion/analyze', data),
};

// Meals API
export const mealsAPI = {
  create: (data) => api.post('/api/meals/', data),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/meals/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyze: (id) => api.post(`/api/meals/${id}/analyze`),
  getAll: (params) => api.get('/api/meals/', { params }),
  getToday: () => api.get('/api/meals/today'),
  getOne: (id) => api.get(`/api/meals/${id}`),
  delete: (id) => api.delete(`/api/meals/${id}`),
};

export default api;
