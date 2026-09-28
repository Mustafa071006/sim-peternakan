import api from "../lib/axios";
import { pickPayload } from "../lib/http";

/** Reference/master data used to populate select inputs. */
export const masterService = {
  async strains() {
    return pickPayload(await api.get("/strain")) || [];
  },

  async standarStrains() {
    return pickPayload(await api.get("/standar-strain")) || [];
  },

  async jenisPakan() {
    return pickPayload(await api.get("/jenis-pakan")) || [];
  },

  async vaksin() {
    return pickPayload(await api.get("/vaksin")) || [];
  },
};
