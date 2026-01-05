import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  logout: () => api.delete('/user/logout'),
  verifyEmail: (token) => api.get(`/user/verify-email/${token}`),
  resendVerification: (email) => api.post('/user/resend-verification', { email }),
  forgotPassword: (email) => api.post('/user/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/user/reset-password/${token}`, { password }),
  changePassword: (data) => api.patch('/user/change-password', data),
  getCurrentUser: () => api.get('/user/me'),
  updateProfile: (data) => api.patch('/user/profile', data),
};

export default api;

