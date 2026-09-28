import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";
import { formatDelta, formatNumber } from "../../utils/format";

const ICON_TONES = {
  green: "bg-brand-50 text-brand-600",
  amber: "bg-amber-soft text-amber-ink",
  sky: "bg-sky-soft text-sky-ink",
  rose: "bg-rose-soft text-rose-ink",
};

/**
 * Compact performance tile: value vs standard with a coloured delta chip.
 * `betterWhen` controls chip colour ("lower" → under standard is good, e.g. FCR).
 */
export function PerfStatCard({
  icon: Icon,
  tone = "green",
  label,
  value,
  unit,
  decimals = 0,
  standard,
  standardUnit,
  betterWhen = "higher",
  deltaDecimals = 1,
  className,
}) {
  const hasStd = standard != null && Number.isFinite(Number(standard));
  const delta = hasStd ? Number(value) - Number(standard) : null;
  const good =
    delta == null
      ? true
      : betterWhen === "lower"
        ? delta <= 0
        : delta >= 0;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2.5">
        {Icon ? (
          <span
            className={cn(
              "grid size-8 place-items-center rounded-lg",
              ICON_TONES[tone] || ICON_TONES.green,
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
        <span className="text-[13px] font-medium text-muted">{label}</span>
      </div>

      <div className="mt-2.5 flex items-end gap-1">
        <span className="text-xl font-bold leading-none tracking-tight text-ink">
          {typeof value === "number" ? formatNumber(value, decimals) : value}
        </span>
        {unit ? (
          <span className="pb-0.5 text-xs font-medium text-faint">{unit}</span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {hasStd
            ? `Standar ${formatNumber(standard, decimals)}${standardUnit ? ` ${standardUnit}` : ""}`
            : "Standar —"}
        </span>
        {delta != null ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              good ? "bg-brand-50 text-up" : "bg-rose-soft text-down",
            )}
          >
            {formatDelta(delta, deltaDecimals)}
            {standardUnit ? ` ${standardUnit}` : ""}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
