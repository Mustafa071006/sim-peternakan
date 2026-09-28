import api from "../lib/axios";
import { pickPayload } from "../lib/http";

export const produksiService = {
  async list() {
    return pickPayload(await api.get("/produksi")) || [];
  },

  async get(id) {
    return pickPayload(await api.get(`/produksi/${id}`));
  },

  /**
   * Operator only. Backend computes averages + totals + hen day.
   * Egg category weights (`berat_*`) are TOTAL grams for that grade.
   * @param {{
   *   periode_id:number, tanggal:string, pengambilan_ke:1|2,
   *   telur_bagus:number, berat_bagus:number,
   *   telur_krem:number,  berat_krem:number,
   *   telur_retak:number, berat_retak:number
   * }} body
   */
  async create(body) {
    return pickPayload(await api.post("/produksi", body));
  },
};
