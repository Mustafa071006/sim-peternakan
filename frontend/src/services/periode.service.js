import api from "../lib/axios";
import { pickPayload } from "../lib/http";

export const periodeService = {
  async list() {
    return pickPayload(await api.get("/periode")) || [];
  },

  async get(id) {
    return pickPayload(await api.get(`/periode/${id}`));
  },

  /**
   * Admin only. Kandang harus sudah ada (dibuat lewat kandangService.create).
   * @param {{
   *   kandang_id:number, strain_id:number, tanggal_masuk:string,
   *   jumlah_awal:number, umur_awal_vendor:number
   * }} body
   * @returns {Promise<{ id:number, kode_periode:string, kandang_id:number }>}
   */
  async create(body) {
    return pickPayload(await api.post("/periode", body));
  },
};
