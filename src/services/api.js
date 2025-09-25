// src/services/api.js
import axios from 'axios';

// FIX: Make sure this matches your backend port
const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // REQUIRED if backend uses credentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Product API
export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  create: (formData) => api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUserProducts: (userId) => api.get(`/users/${userId}/products`),
};

// Utility API
export const utilityAPI = {
  seedDatabase: () => api.post('/seed'),
  healthCheck: () => api.get('/health'),
};

export default api;