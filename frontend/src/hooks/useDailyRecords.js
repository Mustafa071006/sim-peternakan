import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  produksiService,
  feedService,
  mortalitasService,
  vaksinasiService,
} from "../services";
import { QK } from "../constants/queryKeys";

/* ----------------------------- Produksi ------------------------------ */
export const useProduksiList = () =>
  useQuery({ queryKey: QK.produksi.list, queryFn: produksiService.list });

export function useCreateProduksi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => produksiService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produksi"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ------------------------------- Feed -------------------------------- */
export const useFeedList = () =>
  useQuery({ queryKey: QK.feed.list, queryFn: feedService.list });

export function useCreateFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => feedService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ---------------------------- Mortalitas ----------------------------- */
export const useMortalitasList = () =>
  useQuery({ queryKey: QK.mortalitas.list, queryFn: mortalitasService.list });

export function useCreateMortalitas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => mortalitasService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mortalitas"] });
      qc.invalidateQueries({ queryKey: ["periode"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ---------------------------- Vaksinasi ------------------------------ */
export const useVaksinasiList = () =>
  useQuery({ queryKey: QK.vaksinasi.list, queryFn: vaksinasiService.list });

export function useCreateVaksinasi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => vaksinasiService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vaksinasi"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
