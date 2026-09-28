import { useQuery } from "@tanstack/react-query";

import { masterService } from "../services";
import { QK } from "../constants/queryKeys";

const opts = { staleTime: 1000 * 60 * 30 };

export const useStrains = () =>
  useQuery({ queryKey: QK.masters.strain, queryFn: masterService.strains, ...opts });

export const useStandarStrains = () =>
  useQuery({
    queryKey: QK.masters.standarStrain,
    queryFn: masterService.standarStrains,
    ...opts,
  });

export const useJenisPakan = () =>
  useQuery({
    queryKey: QK.masters.jenisPakan,
    queryFn: masterService.jenisPakan,
    ...opts,
  });

export const useVaksin = () =>
  useQuery({ queryKey: QK.masters.vaksin, queryFn: masterService.vaksin, ...opts });
