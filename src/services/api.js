import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
      
      // Handle rate limiting errors
      if (status === 429) {
        const errorMessage = 'Too many requests. Please try again later.';
        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
      
      // Handle other errors
      const errorMessage = data?.error?.message || data?.message || 'An error occurred';
      
      // Don't show toast for certain error types
      if (!['VALIDATION_ERROR', 'USER_EXISTS'].includes(data?.error?.code)) {
        toast.error(errorMessage);
      }
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // Network error
    const networkError = 'Network error. Please check your connection.';
    toast.error(networkError);
    return Promise.reject(new Error(networkError));
  }
);

export default api;