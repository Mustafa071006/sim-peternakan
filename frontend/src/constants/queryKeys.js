/**
 * Centralised React Query keys so cache invalidation stays consistent.
 */
export const QK = {
  periode: {
    list: ["periode", "list"],
    detail: (id) => ["periode", "detail", String(id)],
  },
  produksi: {
    list: ["produksi", "list"],
    detail: (id) => ["produksi", "detail", String(id)],
  },
  feed: {
    list: ["feed", "list"],
    detail: (id) => ["feed", "detail", String(id)],
  },
  mortalitas: {
    list: ["mortalitas", "list"],
    detail: (id) => ["mortalitas", "detail", String(id)],
  },
  vaksinasi: {
    list: ["vaksinasi", "list"],
  },
  kandang: {
    list: (params) => ["kandang", "list", params || {}],
    detail: (id) => ["kandang", "detail", String(id)],
  },
  user: {
    list: ["user", "list"],
    detail: (id) => ["user", "detail", String(id)],
  },
  masters: {
    strain: ["masters", "strain"],
    standarStrain: ["masters", "standar-strain"],
    jenisPakan: ["masters", "jenis-pakan"],
    vaksin: ["masters", "vaksin"],
  },
};
