import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

// attach token automatically if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if(token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});


