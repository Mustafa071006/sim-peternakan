import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { kandangService } from "../services";
import { QK } from "../constants/queryKeys";

export function useKandangList(params) {
  return useQuery({
    queryKey: QK.kandang.list(params),
    queryFn: () => kandangService.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useKandang(id) {
  return useQuery({
    queryKey: QK.kandang.detail(id),
    queryFn: () => kandangService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateKandang() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => kandangService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kandang"] }),
  });
}

export function useSetKandangStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => kandangService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kandang"] }),
  });
}

export function useKandangOperators(id) {
  return useQuery({
    queryKey: [...QK.kandang.detail(id), "operators"],
    queryFn: () => kandangService.getOperators(id),
    enabled: Boolean(id),
  });
}

export function useSetKandangOperators() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userIds }) => kandangService.setOperators(id, userIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kandang"] });
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
