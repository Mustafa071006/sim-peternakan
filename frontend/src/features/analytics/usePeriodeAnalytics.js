import { useMemo } from "react";

import {
  useProduksiList,
  useFeedList,
  useMortalitasList,
} from "../../hooks/useDailyRecords";
import { useStandarStrains } from "../../hooks/useMasters";
import {
  avgEggWeight,
  byPeriode,
  dailySeries,
  fcr,
  findStandar,
  henDay,
  isToday,
  lastNDays,
  sumFeedKg,
  sumMortalitas,
  sumProduksi,
  umurMinggu,
} from "./compute";

const round = (n, d = 1) => Number(Number(n || 0).toFixed(d));

/**
 * Everything the dashboards & operator report need for one periode, composed
 * from the raw daily endpoints. Pass the resolved `periode` object.
 */
export function usePeriodeAnalytics(periode, { days = 7 } = {}) {
  const produksiQ = useProduksiList();
  const feedQ = useFeedList();
  const mortalitasQ = useMortalitasList();
  const standarQ = useStandarStrains();

  const isLoading =
    produksiQ.isLoading || feedQ.isLoading || mortalitasQ.isLoading;
  const isError = produksiQ.isError || feedQ.isError || mortalitasQ.isError;
  const error = produksiQ.error || feedQ.error || mortalitasQ.error;

  const refetch = () => {
    produksiQ.refetch();
    feedQ.refetch();
    mortalitasQ.refetch();
    standarQ.refetch();
  };

  const view = useMemo(() => {
    if (!periode) return null;

    const population = Number(periode.populasi_aktif) || 0;
    const initial = Number(periode.jumlah_awal ?? periode.populasi_awal) || 0;

    const produksi = byPeriode(produksiQ.data, periode.id);
    const feed = byPeriode(feedQ.data, periode.id);
    const mortalitas = byPeriode(mortalitasQ.data, periode.id);

    const week = umurMinggu(periode);
    const standar = findStandar(standarQ.data, periode.strain_id, week);

    /* ---- today ---- */
    const todayProduksi = produksi.filter((r) => isToday(r.tanggal));
    const todayFeed = feed.filter((r) => isToday(r.tanggal));
    const todayMort = mortalitas.filter((r) => isToday(r.tanggal));

    const pt = sumProduksi(todayProduksi);
    const todayAvgW = avgEggWeight(pt.weightG, pt.eggs);
    const todayHenDay = henDay(pt.eggs, population);
    const todayFeedGram = todayFeed.length
      ? todayFeed.reduce((t, r) => t + Number(r.gram_per_ekor || 0), 0) /
        todayFeed.length
      : 0;
    const todayFeedKg = sumFeedKg(todayFeed);

    const today = {
      hasInput: todayProduksi.length + todayFeed.length + todayMort.length > 0,
      population,
      eggs: pt.eggs,
      grades: { bagus: pt.bagus, krem: pt.krem, retak: pt.retak },
      eggWeightG: round(pt.weightG),
      avgEggWeight: round(todayAvgW, 1),
      henDay: round(todayHenDay, 1),
      feedGram: round(todayFeedGram, 0),
      feedKg: round(todayFeedKg, 1),
      fcr: round(fcr(todayFeedKg, pt.eggs, todayAvgW), 2),
      mati: sumMortalitas(todayMort),
    };

    /* ---- cumulative (whole periode) ---- */
    const pc = sumProduksi(produksi);
    const cumAvgW = avgEggWeight(pc.weightG, pc.eggs);
    const cumFeedKg = sumFeedKg(feed);
    const cumMati = sumMortalitas(mortalitas);

    const cumulative = {
      initialPopulation: initial,
      population,
      eggs: pc.eggs,
      grades: { bagus: pc.bagus, krem: pc.krem, retak: pc.retak },
      eggWeightKg: round(pc.weightG / 1000, 1),
      avgEggWeight: round(cumAvgW, 1),
      henDay: round(henDay(pc.eggs, population), 1),
      feedKg: round(cumFeedKg, 1),
      fcr: round(fcr(cumFeedKg, pc.eggs, cumAvgW), 2),
      mati: cumMati,
      mortalityPct: round(initial > 0 ? (cumMati / initial) * 100 : 0, 2),
    };

    /* ---- 7-day series ---- */
    const series = dailySeries({ days, produksi, feed, mortalitas, population });

    /* ---- weekly summary (last `days`) ---- */
    const windowIsos = new Set(lastNDays(days).map((d) => d.iso));
    const wp = sumProduksi(
      produksi.filter((r) => windowIsos.has(String(r.tanggal).slice(0, 10))),
    );
    const wFeedKg = sumFeedKg(
      feed.filter((r) => windowIsos.has(String(r.tanggal).slice(0, 10))),
    );
    const wMati = sumMortalitas(
      mortalitas.filter((r) => windowIsos.has(String(r.tanggal).slice(0, 10))),
    );
    const activeDays = series.filter((d) => d.hasData).length || 1;
    const weekly = {
      eggs: wp.eggs,
      avgHenDay: round(
        series.reduce((t, d) => t + d.henDay, 0) / activeDays,
        1,
      ),
      mati: wMati,
      mortalityPct: round(initial > 0 ? (wMati / initial) * 100 : 0, 2),
      avgFeedGram: round(
        series.reduce((t, d) => t + (d.feedGram || 0), 0) / activeDays,
        0,
      ),
      avgFcr: round(
        fcr(wFeedKg, wp.eggs, avgEggWeight(wp.weightG, wp.eggs)),
        2,
      ),
    };

    /* ---- standards (standar_strains: feed_gram, produksi_persen, berat_telur) ---- */
    const std = standar
      ? {
          week,
          feedGram: Number(standar.feed_gram) || null,
          henDay: Number(standar.produksi_persen) || null,
          eggWeight: Number(standar.berat_telur) || null,
        }
      : { week, feedGram: null, henDay: null, eggWeight: null };

    return { today, cumulative, series, weekly, standar: std, week };
  }, [periode, produksiQ.data, feedQ.data, mortalitasQ.data, standarQ.data, days]);

  return { data: view, isLoading, isError, error, refetch };
}
