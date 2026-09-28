import api from "../lib/axios";
import { pickPayload } from "../lib/http";
import { STORAGE_KEYS } from "../config/app";

export const authService = {
  /**
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login({ email, password }) {
    const res = await api.post("/auth/login", { email, password });
    const payload = pickPayload(res) || {};
    // Backend shape: { token, user }
    return {
      token: payload.token,
      user: payload.user,
    };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  },
};
