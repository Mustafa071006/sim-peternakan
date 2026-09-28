import { useMemo } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";

import {
  useProduksiList,
  useFeedList,
  useMortalitasList,
} from "../../hooks/useDailyRecords";
import {
  avgEggWeight,
  byPeriode,
  fcr as calcFcr,
  henDay as calcHenDay,
  sumProduksi,
} from "../analytics/compute";

const d = (v) => String(v || "").slice(0, 10);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * Merge the three daily record streams into one row-per-date log for a periode,
 * optionally bounded by an ISO date range. Powers Riwayat Data + operator report.
 */
export function useDailyLog(periode, { from, to } = {}) {
  const produksiQ = useProduksiList();
  const feedQ = useFeedList();
  const mortalitasQ = useMortalitasList();

  const isLoading =
    produksiQ.isLoading || feedQ.isLoading || mortalitasQ.isLoading;
  const isError = produksiQ.isError || feedQ.isError || mortalitasQ.isError;
  const error = produksiQ.error || feedQ.error || mortalitasQ.error;
  const refetch = () => {
    produksiQ.refetch();
    feedQ.refetch();
    mortalitasQ.refetch();
  };

  const rows = useMemo(() => {
    if (!periode) return [];

    const produksi = byPeriode(produksiQ.data, periode.id);
    const feed = byPeriode(feedQ.data, periode.id);
    const mortalitas = byPeriode(mortalitasQ.data, periode.id);

    const inRange = (iso) =>
      (!from || iso >= from) && (!to || iso <= to);

    const dates = new Set();
    [produksi, feed, mortalitas].forEach((list) =>
      list.forEach((r) => {
        const iso = d(r.tanggal);
        if (inRange(iso)) dates.add(iso);
      }),
    );

    const currentPop = num(periode.populasi_aktif);
    const entryOffsetDays = num(periode.umur_awal_vendor ?? periode.umur_masuk) * 7;

    // Deaths sorted so we can reconstruct population "as of" each date.
    const deaths = mortalitas
      .map((r) => ({ iso: d(r.tanggal), jumlah: num(r.jumlah ?? r.jumlah_mati) }))
      .sort((a, b) => (a.iso < b.iso ? 1 : -1));

    return [...dates]
      .sort((a, b) => (a < b ? 1 : -1))
      .map((iso, index) => {
        const pRows = produksi.filter((r) => d(r.tanggal) === iso);
        const fRows = feed.filter((r) => d(r.tanggal) === iso);
        const mRows = mortalitas.filter((r) => d(r.tanggal) === iso);

        const p = sumProduksi(pRows);
        const feedKg = fRows.reduce((t, r) => t + num(r.total_kg), 0);
        const feedGram = fRows.length
          ? fRows.reduce((t, r) => t + num(r.gram_per_ekor), 0) / fRows.length
          : 0;
        const mati = mRows.reduce((t, r) => t + num(r.jumlah ?? r.jumlah_mati), 0);
        const avgW = avgEggWeight(p.weightG, p.eggs);

        const deathsAfter = deaths
          .filter((x) => x.iso > iso)
          .reduce((t, x) => t + x.jumlah, 0);
        const populasi = currentPop + deathsAfter;

        const umurHari =
          entryOffsetDays +
          Math.max(
            0,
            differenceInCalendarDays(parseISO(iso), parseISO(d(periode.tanggal_masuk))),
          );

        return {
          id: iso,
          no: index + 1,
          iso,
          umurHari,
          populasi,
          feedGram: Math.round(feedGram),
          feedKg: Number(feedKg.toFixed(1)),
          krem: p.krem,
          bagus: p.bagus,
          retak: p.retak,
          totalTelur: p.eggs,
          beratTelurKg: Number((p.weightG / 1000).toFixed(1)),
          avgEggWeight: Number(avgW.toFixed(1)),
          henDay: Number(calcHenDay(p.eggs, populasi).toFixed(1)),
          mati,
          fcr: Number(calcFcr(feedKg, p.eggs, avgW).toFixed(2)),
          has: {
            produksi: pRows.length > 0,
            pakan: fRows.length > 0,
            mortalitas: mRows.length > 0,
          },
        };
      });
  }, [periode, produksiQ.data, feedQ.data, mortalitasQ.data, from, to]);

  const totals = useMemo(() => {
    if (!rows.length)
      return { avgPopulasi: 0, totalTelur: 0, totalPakanKg: 0, totalMati: 0 };
    return {
      avgPopulasi: Math.round(
        rows.reduce((t, r) => t + r.populasi, 0) / rows.length,
      ),
      totalTelur: rows.reduce((t, r) => t + r.totalTelur, 0),
      totalPakanKg: Number(
        rows.reduce((t, r) => t + r.feedKg, 0).toFixed(1),
      ),
      totalMati: rows.reduce((t, r) => t + r.mati, 0),
    };
  }, [rows]);

  return { rows, totals, isLoading, isError, error, refetch };
}
