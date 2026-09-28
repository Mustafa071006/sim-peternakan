import api from "../lib/axios";
import { pickPayload } from "../lib/http";

export const vaksinasiService = {
  async list() {
    return pickPayload(await api.get("/vaksinasi")) || [];
  },

  async get(id) {
    return pickPayload(await api.get(`/vaksinasi/${id}`));
  },

  /**
   * Operator only. Backend table: `vaksinasi_lama`.
   * @param {{ periode_id:number, tanggal:string, nama_vaksin:string }} body
   */
  async create(body) {
    return pickPayload(await api.post("/vaksinasi", body));
  },
};
