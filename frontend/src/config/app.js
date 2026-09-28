/**
 * Application-wide configuration derived from environment variables.
 * All values must come from Vite env — never hardcode secrets or hosts.
 */
export const APP_CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  appName: "SIM Peternakan",
  organisation: "PT Has Cama Farm",
  requestTimeout: 20000,
};

export const STORAGE_KEYS = {
  token: "accessToken",
  user: "user",
};
