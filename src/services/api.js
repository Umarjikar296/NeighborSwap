// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://neighborswap-backend.onrender.com"';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  create: (formData) => api.post('/products', formData),
  getUserProducts: (userId) => api.get(`/products/user/${userId}`),
};

// Product API
// export const productAPI = {
//   getAll: (params = {}) => api.get('/products', { params }),
//   create: (formData) => api.post('/products', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   }),
//   getUserProducts: (userId) => api.get(`/users/${userId}/products`),
// };

// Utility API
export const utilityAPI = {
  seedDatabase: () => api.post('/seed'),
  healthCheck: () => api.get('/health'),
};

export default api;
