import axios from "axios";

import { APP_CONFIG, STORAGE_KEYS } from "../config/app";

/**
 * Single axios instance for the whole app.
 * - Injects the bearer token from localStorage on every request.
 * - On 401 it clears the session and bounces to /login (once).
 */
const api = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: APP_CONFIG.requestTimeout,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

export default api;
