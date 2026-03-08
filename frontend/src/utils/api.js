// utils/api.js
// Axios instance with auth interceptor and error normalization

import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  // Fallback to the known production backend URL if the environment variable is missing
  baseURL: import.meta.env.VITE_API_URL || 'https://url-shortner-r2k9.onrender.com/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';

    // Auto-logout on 401
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (err.response?.status === 429) {
      toast.error('Rate limit reached. Please slow down.');
    }

    return Promise.reject({ message, statusCode: err.response?.status });
  }
);

export default api;
