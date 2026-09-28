import { useMemo } from "react";
import { addDays, format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { useDailyLog } from "../riwayat/useDailyLog";
import { useStandarStrains } from "../../hooks/useMasters";
import {
  avgEggWeight,
  fcr as calcFcr,
  findStandar,
  henDay as calcHenDay,
  umurMinggu,
} from "../analytics/compute";

const round = (n, d = 1) => Number(Number(n || 0).toFixed(d));

/**
 * Aggregated report for one periode over a date range, composed from the daily
 * log + strain standards. Used by the Laporan page for both roles.
 */
export function useLaporan(periode, { from, to } = {}) {
  const log = useDailyLog(periode, { from, to });
  const standarQ = useStandarStrains();

  const data = useMemo(() => {
    if (!periode) return null;
    const rows = log.rows;

    const sum = (fn) => rows.reduce((t, r) => t + fn(r), 0);
    const totalTelur = sum((r) => r.totalTelur);
    const totalBeratG = sum((r) => r.beratTelurKg) * 1000;
    const totalPakanKg = round(sum((r) => r.feedKg));
    const totalMati = sum((r) => r.mati);
    const avgPopulasi = rows.length
      ? Math.round(sum((r) => r.populasi) / rows.length)
      : Number(periode.populasi_aktif) || 0;

    const grades = {
      krem: sum((r) => r.krem),
      bagus: sum((r) => r.bagus),
      retak: sum((r) => r.retak),
    };

    const avgW = avgEggWeight(totalBeratG, totalTelur);
    const avgHenDay = round(calcHenDay(totalTelur, avgPopulasi), 1);
    const avgFeedGram = rows.filter((r) => r.feedGram).length
      ? Math.round(
          rows.reduce((t, r) => t + r.feedGram, 0) /
            rows.filter((r) => r.feedGram).length,
        )
      : 0;

    const averages = {
      henDay: avgHenDay,
      beratTelur: round(avgW, 1),
      feedIntake: avgFeedGram,
      fcr: round(calcFcr(totalPakanKg, totalTelur, avgW), 2),
    };

    /* standards for the mid-point week of this range
       (standar_strains: feed_gram, produksi_persen, berat_telur) */
    const week = umurMinggu(periode);
    const standar = findStandar(standarQ.data, periode.strain_id, week);
    const targets = {
      henDay: standar ? Number(standar.produksi_persen) : null,
      beratTelur: standar ? Number(standar.berat_telur) : null,
      feedIntake: standar ? Number(standar.feed_gram) : null,
      fcr: null,
    };

    /* weekly buckets (7-day windows from `from`) */
    const start = from ? parseISO(from) : rows.length ? parseISO(rows[rows.length - 1].iso) : new Date();
    const end = to ? parseISO(to) : new Date();
    const weeks = [];
    let cursor = start;
    let wIndex = 1;
    while (cursor <= end && weeks.length < 20) {
      const wEnd = addDays(cursor, 6);
      const wRows = rows.filter((r) => {
        const dt = parseISO(r.iso);
        return dt >= cursor && dt <= wEnd;
      });
      const wEggs = wRows.reduce((t, r) => t + r.totalTelur, 0);
      const wBeratG = wRows.reduce((t, r) => t + r.beratTelurKg, 0) * 1000;
      const wPakan = round(wRows.reduce((t, r) => t + r.feedKg, 0));
      const wPop = wRows.length
        ? wRows.reduce((t, r) => t + r.populasi, 0) / wRows.length
        : avgPopulasi;
      const wAvgW = avgEggWeight(wBeratG, wEggs);
      weeks.push({
        index: wIndex,
        label: `${format(cursor, "d", { locale: idLocale })} - ${format(
          wEnd > end ? end : wEnd,
          "d MMM",
          { locale: idLocale },
        )}`,
        eggs: wEggs,
        pakanKg: wPakan,
        henDay: round(calcHenDay(wEggs, wPop), 1),
        beratTelur: round(wAvgW, 1),
        fcr: round(calcFcr(wPakan, wEggs, wAvgW), 2),
        mati: wRows.reduce((t, r) => t + r.mati, 0),
      });
      cursor = addDays(cursor, 7);
      wIndex += 1;
    }

    /* dual-axis daily series for Hen Day vs FCR */
    const series = rows
      .slice()
      .reverse()
      .map((r) => ({
        label: format(parseISO(r.iso), "d MMM", { locale: idLocale }),
        henDay: r.henDay,
        fcr: r.fcr,
        krem: r.krem,
        bagus: r.bagus,
        retak: r.retak,
      }));

    return {
      totals: { totalTelur, totalPakanKg, totalMati, avgPopulasi },
      grades,
      averages,
      targets,
      weeks,
      series,
      week,
      hasData: rows.length > 0,
    };
  }, [periode, log.rows, standarQ.data, from, to]);

  return {
    data,
    isLoading: log.isLoading,
    isError: log.isError,
    error: log.error,
    refetch: log.refetch,
  };
}
