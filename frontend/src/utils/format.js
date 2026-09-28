import { format, parseISO, isValid } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const toDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const parsed = value.includes("T") ? parseISO(value) : parseISO(`${value}T00:00:00`);
    return isValid(parsed) ? parsed : new Date(value);
  }
  return null;
};

/** Thousands-grouped integer, e.g. 9850 -> "9,850". */
export function formatInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

/** Grouped number with fixed decimals, e.g. 1122.9 -> "1,122.9". */
export function formatNumber(value, decimals = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/** Percentage with one decimal, e.g. 93.42 -> "93.4%". */
export function formatPercent(value, decimals = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0%";
  return `${formatNumber(n, decimals)}%`;
}

/** Signed delta for trend badges, e.g. 1.6 -> "+1.6", -0.06 -> "-0.06". */
export function formatDelta(value, decimals = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  const sign = n > 0 ? "+" : "";
  return `${sign}${formatNumber(n, decimals)}`;
}

/** "7 Sep 2026" */
export function formatDate(value) {
  const d = toDate(value);
  return d && isValid(d) ? format(d, "d MMM yyyy", { locale: idLocale }) : "-";
}

/** "Senin, 7 Sep 2026" */
export function formatDateLong(value) {
  const d = toDate(value);
  return d && isValid(d)
    ? format(d, "EEEE, d MMM yyyy", { locale: idLocale })
    : "-";
}

/** ISO yyyy-MM-dd for API payloads. */
export function toApiDate(value) {
  const d = toDate(value) || new Date();
  return format(d, "yyyy-MM-dd");
}

/** Initials for avatars: "Sari Wulandari" -> "SW". */
export function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}
