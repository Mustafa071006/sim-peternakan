import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { periodeService } from "../services";
import { QK } from "../constants/queryKeys";

const isActive = (p) => String(p?.status || "").toUpperCase() === "AKTIF";
const SELECTED_KANDANG_KEY = "simpeternakan:selectedKandangId";

export function usePeriodeList() {
  return useQuery({
    queryKey: QK.periode.list,
    queryFn: periodeService.list,
  });
}

/**
 * Active periode(s) visible to the current user. An operator assigned to
 * more than one kandang (backup coverage) sees more than one active periode
 * here — `selectedKandangId`/`setSelectedKandangId` lets the UI pick which
 * one is "current", persisted per-browser so it survives navigation.
 */
export function useActivePeriode() {
  const query = usePeriodeList();

  const activePeriodes = useMemo(
    () => (query.data || []).filter(isActive),
    [query.data],
  );

  const [selectedKandangId, setSelectedKandangIdState] = useState(() => {
    try {
      return localStorage.getItem(SELECTED_KANDANG_KEY) || null;
    } catch {
      return null;
    }
  });

  const setSelectedKandangId = useCallback((kandangId) => {
    setSelectedKandangIdState(kandangId);
    try {
      if (kandangId) localStorage.setItem(SELECTED_KANDANG_KEY, kandangId);
      else localStorage.removeItem(SELECTED_KANDANG_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const activePeriode = useMemo(() => {
    if (!activePeriodes.length) return null;
    const preferred = activePeriodes.find(
      (p) => String(p.kandang_id) === String(selectedKandangId),
    );
    return preferred || activePeriodes[0];
  }, [activePeriodes, selectedKandangId]);

  return {
    ...query,
    activePeriode,
    activePeriodes,
    selectedKandangId,
    setSelectedKandangId,
  };
}

export function useCreatePeriode() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body) => periodeService.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periode"] });
      qc.invalidateQueries({ queryKey: ["kandang"] });
    },
  });
}
