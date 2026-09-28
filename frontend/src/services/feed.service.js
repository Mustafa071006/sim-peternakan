import api from "../lib/axios";
import { pickPayload } from "../lib/http";

export const feedService = {
  async list() {
    return pickPayload(await api.get("/feed")) || [];
  },

  async get(id) {
    return pickPayload(await api.get(`/feed/${id}`));
  },

  /**
   * Operator only. Backend computes `gram_per_ekor` from total_kg / populasi_aktif.
   * @param {{ periode_id:number, pakan_id:number, tanggal:string, total_kg:number }} body
   */
  async create(body) {
    return pickPayload(await api.post("/feed", body));
  },
};
