import { addDays, format, isSameDay, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * Derived-metric helpers for the dashboards / reports.
 *
 * The backend's aggregate endpoints (`/dashboard/*-mingguan`, parts of
 * `/report`) are incomplete, so the dashboards compose their series from the
 * raw daily record endpoints (`/produksi`, `/feed`, `/mortalitas`). These
 * functions implement ONLY the display formulas documented in the project
 * brief — no business rules that the backend owns (population changes,
 * validation, persistence).
 */

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const dateOnly = (value) => {
  if (!value) return null;
  const s = String(value);
  return s.includes("T") ? s.slice(0, 10) : s.slice(0, 10);
};

export const byPeriode = (rows, periodeId) =>
  (rows || []).filter((r) => String(r.periode_id) === String(periodeId));

/* -------------------------------------------------------------------- */
/*  Row aggregation                                                      */
/* -------------------------------------------------------------------- */

/** Roll up produksi rows (a day can have 2 "pengambilan"). */
export function sumProduksi(rows) {
  return (rows || []).reduce(
    (acc, r) => {
      acc.bagus += num(r.telur_bagus);
      acc.krem += num(r.telur_krem);
      acc.retak += num(r.telur_retak);
      acc.eggs += num(r.telur_total || num(r.telur_bagus) + num(r.telur_krem) + num(r.telur_retak));
      acc.weightG += num(
        r.berat_total ||
          num(r.berat_bagus) + num(r.berat_krem) + num(r.berat_retak),
      );
      return acc;
    },
    { bagus: 0, krem: 0, retak: 0, eggs: 0, weightG: 0 },
  );
}

export const sumFeedKg = (rows) =>
  (rows || []).reduce((t, r) => t + num(r.total_kg), 0);

export const sumMortalitas = (rows) =>
  (rows || []).reduce((t, r) => t + num(r.jumlah ?? r.jumlah_mati), 0);

/* -------------------------------------------------------------------- */
/*  Formulas (project brief)                                             */
/* -------------------------------------------------------------------- */

export const avgEggWeight = (weightG, eggs) => (eggs > 0 ? weightG / eggs : 0);

/** Hen Day % = total eggs / current population x 100 */
export const henDay = (eggs, population) =>
  population > 0 ? (eggs / population) * 100 : 0;

/** FCR = feed (kg) / egg mass (kg); egg mass kg = eggs x avgWeight(g) / 1000 */
export const fcr = (feedKg, eggs, avgWeightG) => {
  const eggMassKg = (eggs * avgWeightG) / 1000;
  return eggMassKg > 0 ? feedKg / eggMassKg : 0;
};

/* -------------------------------------------------------------------- */
/*  Time series                                                          */
/* -------------------------------------------------------------------- */

export function lastNDays(n, endDate = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = addDays(endDate, -i);
    out.push({
      iso: format(d, "yyyy-MM-dd"),
      label: format(d, "d MMM", { locale: idLocale }),
      date: d,
    });
  }
  return out;
}

/**
 * Build a daily series over the last `days` for the given periode.
 * `pick(rowsForThatDay) => object` is merged into each point.
 */
export function dailySeries({ days = 7, produksi = [], feed = [], mortalitas = [], population = 0 }) {
  return lastNDays(days).map((day) => {
    const pRows = produksi.filter((r) => dateOnly(r.tanggal) === day.iso);
    const fRows = feed.filter((r) => dateOnly(r.tanggal) === day.iso);
    const mRows = mortalitas.filter((r) => dateOnly(r.tanggal) === day.iso);

    const p = sumProduksi(pRows);
    const feedKg = sumFeedKg(fRows);
    const feedGram = fRows.length
      ? fRows.reduce((t, r) => t + num(r.gram_per_ekor), 0) / fRows.length
      : null;
    const hd = henDay(p.eggs, population);

    return {
      iso: day.iso,
      label: day.label,
      eggs: p.eggs,
      bagus: p.bagus,
      krem: p.krem,
      retak: p.retak,
      henDay: Number(hd.toFixed(1)),
      feedKg: Number(feedKg.toFixed(1)),
      feedGram: feedGram == null ? null : Number(feedGram.toFixed(0)),
      mati: sumMortalitas(mRows),
      hasData: pRows.length + fRows.length + mRows.length > 0,
    };
  });
}

/* -------------------------------------------------------------------- */
/*  Standards                                                            */
/* -------------------------------------------------------------------- */

/** Age in whole weeks for the active periode. */
export function umurMinggu(periode) {
  if (!periode) return 0;
  const start = parseISO(String(periode.tanggal_masuk).slice(0, 10));
  const weeksElapsed = Math.floor(
    (Date.now() - start.getTime()) / (7 * 24 * 3600 * 1000),
  );
  return num(periode.umur_awal_vendor ?? periode.umur_masuk) + Math.max(0, weeksElapsed);
}

/** Find the standar_strains row for a strain at a given week. */
export function findStandar(standarList, strainId, week) {
  const rows = (standarList || []).filter(
    (s) => String(s.strain_id) === String(strainId),
  );
  if (!rows.length) return null;
  return (
    rows.find((s) => num(s.umur_minggu) === week) ||
    rows.reduce((closest, s) =>
      Math.abs(num(s.umur_minggu) - week) < Math.abs(num(closest.umur_minggu) - week)
        ? s
        : closest,
    )
  );
}

export const isToday = (value) => {
  const d = value ? parseISO(String(value).slice(0, 10)) : null;
  return d ? isSameDay(d, new Date()) : false;
};
