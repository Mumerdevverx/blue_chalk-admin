import axios from "axios";

let rawBaseURL = import.meta.env.VITE_API_URL || 'https://bluechalk-backend.vercel.app';
if (rawBaseURL.includes('blue-chalk-backend.vercel.app')) {
  rawBaseURL = rawBaseURL.replace('blue-chalk-backend.vercel.app', 'bluechalk-backend.vercel.app');
}
const baseURL = String(rawBaseURL).replace(/\/+$/, '');

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete API.defaults.headers.common.Authorization;

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default API;