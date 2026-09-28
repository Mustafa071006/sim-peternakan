import api from "../lib/axios";
import { pickPayload } from "../lib/http";

export const mortalitasService = {
  async list() {
    return pickPayload(await api.get("/mortalitas")) || [];
  },

  async get(id) {
    return pickPayload(await api.get(`/mortalitas/${id}`));
  },

  /**
   * Operator only. Backend auto-decrements `periode.populasi_aktif`.
   * @param {{ periode_id:number, tanggal:string, jumlah:number, penyebab?:string }} body
   */
  async create(body) {
    return pickPayload(await api.post("/mortalitas", body));
  },
};
