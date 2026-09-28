import { useMemo } from "react";

import {
  useProduksiList,
  useFeedList,
  useMortalitasList,
  useCreateProduksi,
  useCreateFeed,
  useCreateMortalitas,
} from "../../hooks/useDailyRecords";
import { useJenisPakan } from "../../hooks/useMasters";
import { byPeriode, isToday, sumProduksi } from "../analytics/compute";
import { getErrorMessage } from "../../lib/http";
import { toApiDate } from "../../utils/format";

/**
 * Orchestrates the unified daily-input screen. Each section (pakan,
 * mortalitas, produksi) allows any number of entries per day — e.g. mortality
 * can rise more than once in the same day — so the form always stays open;
 * `todayEntries`/`todayTotal*` surface what's already been logged today as a
 * running summary rather than locking the section after the first save.
 */
export function useInputHarian(periode) {
  const produksiQ = useProduksiList();
  const feedQ = useFeedList();
  const mortalitasQ = useMortalitasList();
  const jenisPakanQ = useJenisPakan();

  const createProduksi = useCreateProduksi();
  const createFeed = useCreateFeed();
  const createMortalitas = useCreateMortalitas();

  const isLoading =
    produksiQ.isLoading ||
    feedQ.isLoading ||
    mortalitasQ.isLoading ||
    jenisPakanQ.isLoading;

  const state = useMemo(() => {
    if (!periode) return null;

    const sortByCreated = (a, b) =>
      new Date(a.created_at || 0) - new Date(b.created_at || 0);

    const todayFeed = byPeriode(feedQ.data, periode.id)
      .filter((r) => isToday(r.tanggal))
      .sort(sortByCreated);
    const todayProduksi = byPeriode(produksiQ.data, periode.id)
      .filter((r) => isToday(r.tanggal))
      .sort(sortByCreated);
    const todayMort = byPeriode(mortalitasQ.data, periode.id)
      .filter((r) => isToday(r.tanggal))
      .sort(sortByCreated);

    const pt = sumProduksi(todayProduksi);
    const activePakan = (jenisPakanQ.data || []).filter(
      (p) => String(p.status || "Aktif").toLowerCase() === "aktif",
    );

    return {
      feed: {
        todayEntries: todayFeed,
        todayTotalKg: todayFeed.reduce(
          (t, r) => t + (Number(r.total_kg) || 0),
          0,
        ),
      },
      mortalitas: {
        todayEntries: todayMort,
        todayTotal: todayMort.reduce((t, r) => t + (Number(r.jumlah) || 0), 0),
      },
      produksi: {
        todayEntries: todayProduksi,
        todayTotals: pt,
      },
      pakanOptions: activePakan.length ? activePakan : jenisPakanQ.data || [],
    };
  }, [periode, feedQ.data, produksiQ.data, mortalitasQ.data, jenisPakanQ.data]);

  /**
   * @param {{
   *   tanggal:string,
   *   mortalitas?: { mati:number, afkir:number },
   *   feed?: { totalKg:number, pakanId:number },
   *   produksi?: { bagus, krem, retak, beratBagusKg, beratKremKg, beratRetakKg }
   * }} input
   * @returns {Promise<Array<{ section:string, ok:boolean, message:string }>>}
   */
  async function submitAll(input) {
    const results = [];
    const tanggal = input.tanggal || toApiDate(new Date());

    // Mortalitas dulu, baru pakan — supaya total pakan (kg) dibagi populasi
    // yang SUDAH memperhitungkan kematian hari ini.
    if (input.mortalitas) {
      const total =
        Number(input.mortalitas.mati || 0) + Number(input.mortalitas.afkir || 0);
      if (total > 0) {
        try {
          await createMortalitas.mutateAsync({
            periode_id: periode.id,
            tanggal,
            jumlah: total,
            penyebab:
              Number(input.mortalitas.afkir || 0) > 0
                ? `Termasuk ${input.mortalitas.afkir} ekor afkir`
                : undefined,
          });
          results.push({
            section: "Data Mortalitas",
            ok: true,
            message: "tersimpan",
          });
        } catch (e) {
          results.push({
            section: "Data Mortalitas",
            ok: false,
            message: getErrorMessage(e),
          });
        }
      }
    }

    if (input.feed && input.feed.totalKg > 0 && input.feed.pakanId) {
      try {
        await createFeed.mutateAsync({
          periode_id: periode.id,
          pakan_id: Number(input.feed.pakanId),
          tanggal,
          total_kg: Number(input.feed.totalKg),
        });
        results.push({ section: "Data Pakan", ok: true, message: "tersimpan" });
      } catch (e) {
        results.push({ section: "Data Pakan", ok: false, message: getErrorMessage(e) });
      }
    }

    if (input.produksi) {
      const p = input.produksi;
      const totalEggs =
        Number(p.bagus || 0) + Number(p.krem || 0) + Number(p.retak || 0);
      if (totalEggs > 0) {
        try {
          await createProduksi.mutateAsync({
            periode_id: periode.id,
            tanggal,
            telur_bagus: Number(p.bagus || 0),
            berat_bagus: Math.round(Number(p.beratBagusKg || 0) * 1000),
            telur_krem: Number(p.krem || 0),
            berat_krem: Math.round(Number(p.beratKremKg || 0) * 1000),
            telur_retak: Number(p.retak || 0),
            berat_retak: Math.round(Number(p.beratRetakKg || 0) * 1000),
          });
          results.push({
            section: "Produksi Telur",
            ok: true,
            message: "tersimpan",
          });
        } catch (e) {
          results.push({
            section: "Produksi Telur",
            ok: false,
            message: getErrorMessage(e),
          });
        }
      }
    }

    return results;
  }

  return {
    isLoading,
    state,
    submitAll,
    isSubmitting:
      createProduksi.isPending ||
      createFeed.isPending ||
      createMortalitas.isPending,
  };
}
