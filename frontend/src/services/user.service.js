import api from "../lib/axios";
import { pickPayload } from "../lib/http";

export const userService = {
  /** Admin only. Returns the full list (filtering/paging is done client-side). */
  async list() {
    return pickPayload(await api.get("/user")) || [];
  },

  async get(id) {
    return pickPayload(await api.get(`/user/${id}`));
  },

  /**
   * Penugasan kandang dilakukan terpisah lewat kandangService (halaman Kandang).
   * @param {{ nama, email, password, role }} body
   */
  async create(body) {
    return pickPayload(await api.post("/user", body));
  },

  /** @param {{ nama, email, role }} body */
  async update(id, body) {
    return pickPayload(await api.put(`/user/${id}`, body));
  },

  async setStatus(id, status) {
    return pickPayload(await api.patch(`/user/${id}/status`, { status }));
  },

  async resetPassword(id, password) {
    return pickPayload(await api.patch(`/user/${id}/reset-password`, { password }));
  },

  async remove(id) {
    return pickPayload(await api.delete(`/user/${id}`));
  },
};
