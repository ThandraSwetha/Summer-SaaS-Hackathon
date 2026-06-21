import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for extracting error message
export const getErrorMessage = (error: any) => {
  if (error.response && error.response.data && error.response.data.detail) {
    return error.response.data.detail;
  }
  return error.message || 'An unexpected error occurred';
};
