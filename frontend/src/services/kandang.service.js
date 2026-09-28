import api from "../lib/axios";
import { pickPayload, pickPaginated } from "../lib/http";

/**
 * Admin membuat kandang dan menugaskan/memindahkan operator. Kandang bisa
 * memiliki lebih dari satu operator (untuk backup).
 */
export const kandangService = {
  async list(params = {}) {
    return pickPaginated(await api.get("/kandang", { params }));
  },

  async get(id) {
    return pickPayload(await api.get(`/kandang/${id}`));
  },

  /** Admin only. @param {{ nama:string, jenis:"Umbaran"|"Battery" }} body */
  async create(body) {
    return pickPayload(await api.post("/kandang", body));
  },

  async setStatus(id, status) {
    return pickPayload(await api.patch(`/kandang/${id}/status`, { status }));
  },

  async getOperators(id) {
    return pickPayload(await api.get(`/kandang/${id}/operators`)) || [];
  },

  /** Admin only. Replace-all penugasan operator kandang ini. */
  async setOperators(id, userIds) {
    return pickPayload(
      await api.put(`/kandang/${id}/operators`, { user_ids: userIds }),
    );
  },
};
